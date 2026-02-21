// lib/risk.ts
import { prisma } from "@/lib/prisma";
import { TrendStatus, RenewalConclusion } from "@prisma/client";

// ✅ Tipos derivados desde enums runtime (esto evita el bug de TS "no overlap")
type Trend = (typeof TrendStatus)[keyof typeof TrendStatus];
type Conclusion = (typeof RenewalConclusion)[keyof typeof RenewalConclusion];

function roundInt(n: number) {
  return Math.round(n);
}

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export async function recalcLoanSnapshot(orgId: string, loanId: string) {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: orgId },
  });

  const s = settings ?? {
    graceLateDays: 0,
    severeLateDays: 14,
    trendWindowN: 6,
    trendDeltaDays: 2,
    noRenewLatePct: 35,
    reduceLatePct: 20,
    increaseLatePctMax: 10,
    minOnTimePctToIncrease: 90,
    reduceMultiplier: 0.8,
    maintainMultiplier: 1.0,
    increaseMultiplier: 1.2,
  };

  const loan = await prisma.loan.findFirst({
    where: { id: loanId, organizationId: orgId, deletedAt: null },
    select: {
      id: true,
      borrowerId: true,
      principalAmount: true,
      scheduleItems: {
        where: { deletedAt: null, status: "PAID" },
        orderBy: { installmentNumber: "asc" },
        select: { lateDays: true },
      },
    },
  });

  if (!loan) return;

  const paidItems = loan.scheduleItems;

  const pagosTotales = paidItems.length;
  const pagosATiempo = paidItems.filter((x) => (x.lateDays ?? 0) <= 0).length;
  const pagosTarde = paidItems.filter((x) => (x.lateDays ?? 0) > 0).length;
  const pagosTardePct =
    pagosTotales === 0 ? 0 : roundInt((pagosTarde / pagosTotales) * 100);

  const tardios = paidItems
    .filter((x) => (x.lateDays ?? 0) > 0)
    .map((x) => x.lateDays ?? 0);

  const atrasoPromedioDias = tardios.length ? roundInt(avg(tardios)) : 0;

  const N = s.trendWindowN ?? 6;
  const lastPaid = [...paidItems].reverse(); // recientes primero
  const recent = lastPaid.slice(0, N);
  const prev = lastPaid.slice(N, 2 * N);

  const avgRecent = recent.length ? avg(recent.map((x) => x.lateDays ?? 0)) : 0;
  const avgPrev = prev.length ? avg(prev.map((x) => x.lateDays ?? 0)) : 0;
  const delta = avgRecent - avgPrev;

  // ✅ trend bien tipado (ya no queda como unión parcial)
  let trend: Trend = TrendStatus.STABLE;
  const deltaTh = s.trendDeltaDays ?? 2;
  if (delta <= -deltaTh) trend = TrendStatus.IMPROVING;
  else if (delta >= deltaTh) trend = TrendStatus.WORSENING;

  const severeLateDays = s.severeLateDays ?? 14;
  const severeLateCountLastN = recent.filter(
    (x) => (x.lateDays ?? 0) >= severeLateDays
  ).length;

  const noRenewLatePct = s.noRenewLatePct ?? 35;
  const reduceLatePct = s.reduceLatePct ?? 20;
  const increaseLatePctMax = s.increaseLatePctMax ?? 10;
  const minOnTimePctToIncrease = s.minOnTimePctToIncrease ?? 90;

  let conclusion: Conclusion = RenewalConclusion.MANTENER;

  if (
    pagosTardePct >= noRenewLatePct ||
    severeLateCountLastN >= 2 ||
    (trend === TrendStatus.WORSENING && pagosTardePct >= reduceLatePct)
  ) {
    conclusion = RenewalConclusion.NO_RENOVAR;
  } else if (
    pagosTardePct >= reduceLatePct ||
    trend === TrendStatus.WORSENING
  ) {
    conclusion = RenewalConclusion.REDUCIR;
  } else {
    const onTimePct = 100 - pagosTardePct;
    if (
      pagosTardePct <= increaseLatePctMax &&
      onTimePct >= minOnTimePctToIncrease &&
      trend !== TrendStatus.WORSENING
    ) {
      conclusion = RenewalConclusion.AUMENTAR;
    } else {
      conclusion = RenewalConclusion.MANTENER;
    }
  }

  const basePrincipal = Number(loan.principalAmount);
  const reduceMul = Number((s as any).reduceMultiplier ?? 0.8);
  const maintainMul = Number((s as any).maintainMultiplier ?? 1.0);
  const increaseMul = Number((s as any).increaseMultiplier ?? 1.2);

  const suggestedLimit =
    conclusion === RenewalConclusion.NO_RENOVAR
      ? 0
      : conclusion === RenewalConclusion.REDUCIR
      ? basePrincipal * reduceMul
      : conclusion === RenewalConclusion.AUMENTAR
      ? basePrincipal * increaseMul
      : basePrincipal * maintainMul;

  await prisma.riskSnapshot.create({
    data: {
      organizationId: orgId,
      scope: "LOAN",
      loanId: loan.id,
      borrowerId: loan.borrowerId,
      windowN: N,
      pagosTotales,
      pagosATiempo,
      pagosTarde,
      pagosTardePct,
      atrasosCount: pagosTarde,
      atrasoPromedioDias,
      trend: trend as any, // Prisma espera enum; este cast solo es para TS
      conclusion: conclusion as any,
      suggestedLimit,
      severeLateCountLastN,
    },
  });
}

export async function recalcBorrowerSnapshot(orgId: string, borrowerId: string) {
  const latestLoanSnaps = await prisma.riskSnapshot.findMany({
    where: { organizationId: orgId, scope: "LOAN", borrowerId },
    orderBy: { asOfDate: "desc" },
    take: 10,
    select: {
      pagosTotales: true,
      pagosATiempo: true,
      pagosTarde: true,
      atrasoPromedioDias: true,
      trend: true,
      conclusion: true,
      suggestedLimit: true,
      severeLateCountLastN: true,
    },
  });

  if (latestLoanSnaps.length === 0) return;

  const pagosTotales = latestLoanSnaps.reduce((a, x) => a + x.pagosTotales, 0);
  const pagosATiempo = latestLoanSnaps.reduce((a, x) => a + x.pagosATiempo, 0);
  const pagosTarde = latestLoanSnaps.reduce((a, x) => a + x.pagosTarde, 0);
  const pagosTardePct =
    pagosTotales === 0 ? 0 : roundInt((pagosTarde / pagosTotales) * 100);

  const atrasoPromedioDias = roundInt(
    avg(latestLoanSnaps.map((x) => x.atrasoPromedioDias))
  );

  // ✅ Trend por mayoría (tipado estable)
  const trendCounts: Record<Trend, number> = {
    [TrendStatus.IMPROVING]: 0,
    [TrendStatus.STABLE]: 0,
    [TrendStatus.WORSENING]: 0,
  };

  for (const x of latestLoanSnaps) {
    trendCounts[x.trend as Trend] += 1;
  }

  let trend: Trend = TrendStatus.STABLE;
  if (
    trendCounts[TrendStatus.WORSENING] >= trendCounts[TrendStatus.IMPROVING] &&
    trendCounts[TrendStatus.WORSENING] >= trendCounts[TrendStatus.STABLE]
  ) {
    trend = TrendStatus.WORSENING;
  } else if (trendCounts[TrendStatus.IMPROVING] >= trendCounts[TrendStatus.STABLE]) {
    trend = TrendStatus.IMPROVING;
  }

  // ✅ Worst conclusion (peor gana)
  const order: Record<Conclusion, number> = {
    [RenewalConclusion.AUMENTAR]: 0,
    [RenewalConclusion.MANTENER]: 1,
    [RenewalConclusion.REDUCIR]: 2,
    [RenewalConclusion.NO_RENOVAR]: 3,
  };

  let worst: Conclusion = RenewalConclusion.AUMENTAR;
  for (const x of latestLoanSnaps) {
    const c = x.conclusion as Conclusion;
    if (order[c] > order[worst]) worst = c;
  }

  const suggestedLimit = avg(latestLoanSnaps.map((x) => Number(x.suggestedLimit)));

  await prisma.riskSnapshot.create({
    data: {
      organizationId: orgId,
      scope: "BORROWER",
      borrowerId,
      windowN: 6,
      pagosTotales,
      pagosATiempo,
      pagosTarde,
      pagosTardePct,
      atrasosCount: pagosTarde,
      atrasoPromedioDias,
      trend: trend as any,
      conclusion: worst as any,
      suggestedLimit,
      severeLateCountLastN: Math.max(...latestLoanSnaps.map((x) => x.severeLateCountLastN)),
    },
  });
}
