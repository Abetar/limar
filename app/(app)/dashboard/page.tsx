// app/(app)/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DashboardCharts } from "./DashboardCharts";

function mxn(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(n);
}

function conclusionLabel(conclusion: string) {
  switch (conclusion) {
    case "NO_RENOVAR":
      return "No renovar";
    case "REDUCIR":
      return "Bajarle";
    case "MANTENER":
      return "Mantener";
    case "AUMENTAR":
      return "Subirle";
    default:
      return conclusion;
  }
}

function trendLabel(trend: string) {
  switch (trend) {
    case "IMPROVING":
      return "Va mejorando";
    case "STABLE":
      return "Va igual";
    case "WORSENING":
      return "Va empeorando";
    default:
      return trend;
  }
}

function badgeClass(conclusion: string) {
  if (conclusion === "NO_RENOVAR")
    return "bg-[#B23A3A]/10 text-[#B23A3A] border-[#B23A3A]/20";
  if (conclusion === "REDUCIR")
    return "bg-[#C88A1A]/10 text-[#C88A1A] border-[#C88A1A]/20";
  return "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20";
}

// =========================
// Próximos cobros helpers
// =========================
type CobroWindow = "hoy" | "7d" | "30d";

function windowLabel(w: CobroWindow) {
  if (w === "hoy") return "Hoy";
  if (w === "7d") return "7 días";
  return "30 días";
}

function scheduleStatusLabelLocal(status: string) {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "PARTIAL":
      return "Abonado";
    case "MISSED":
      return "Vencido";
    case "PAID":
      return "Pagado";
    default:
      return status;
  }
}

function badgeClassScheduleLocal(status: string) {
  if (status === "PAID")
    return "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20";
  if (status === "PARTIAL")
    return "bg-[#C88A1A]/10 text-[#C88A1A] border-[#C88A1A]/20";
  if (status === "MISSED")
    return "bg-[#B23A3A]/10 text-[#B23A3A] border-[#B23A3A]/20";
  return "bg-black/5 text-black/70 border-black/10";
}

function startOfDayInTZ(timeZone: string) {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);

  const utcGuess = Date.UTC(y, m - 1, d, 0, 0, 0);

  const tzName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(new Date(utcGuess))
    .find((p) => p.type === "timeZoneName")?.value;

  const match = tzName?.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  const hours = match ? Number(match[1]) : 0;
  const mins = match?.[2] ? Number(match[2]) : 0;
  const offsetMinutes = hours * 60 + (hours >= 0 ? mins : -mins);

  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - offsetMinutes * 60 * 1000);
}

function addDaysUTC(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ cobros?: CobroWindow }>;
}) {
  const orgId = await requireOrgId();

  const sp = await searchParams;
  const cobrosWindow: CobroWindow = (sp?.cobros as CobroWindow) ?? "7d";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // KPI 1: Prestado en la calle (principal de préstamos activos)
  const carteraTotalAgg = await prisma.loan.aggregate({
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
    _sum: { principalAmount: true },
  });

  // KPI 2: Por cobrar (aprox.): totalExpected - pagos POSTED
  const totalExpectedAgg = await prisma.loan.aggregate({
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
    _sum: { totalExpected: true },
  });

  const paidAgg = await prisma.payment.aggregate({
    where: { organizationId: orgId, deletedAt: null, status: "POSTED" },
    _sum: { amount: true },
  });

  const prestadoEnLaCalle = Number(carteraTotalAgg._sum.principalAmount ?? 0);
  const totalExpected = Number(totalExpectedAgg._sum.totalExpected ?? 0);
  const totalPagado = Number(paidAgg._sum.amount ?? 0);
  const porCobrarAprox = Math.max(0, totalExpected - totalPagado);

  // KPI 3: Préstamos con pagos vencidos
  const prestamosConVencidos = await prisma.loan.count({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: "ACTIVE",
      scheduleItems: {
        some: {
          deletedAt: null,
          OR: [
            { status: "MISSED" },
            { status: { in: ["PENDING", "PARTIAL"] }, dueDate: { lt: today } },
          ],
        },
      },
    },
  });

  // KPI 4: Ya casi terminan (<= 2 pagos restantes)
  const loansActive = await prisma.loan.findMany({
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
    select: {
      id: true,
      scheduleItems: {
        where: { deletedAt: null, status: { in: ["PENDING", "PARTIAL", "MISSED"] } },
        select: { id: true },
      },
    },
    take: 300,
  });

  const yaCasiTerminan = loansActive.filter((l) => l.scheduleItems.length <= 2).length;

  // Quién va más atrasado (último snapshot BORROWER por deudor)
  const latestBorrowerSnap = await prisma.riskSnapshot.groupBy({
    by: ["borrowerId"],
    where: { organizationId: orgId, scope: "BORROWER", borrowerId: { not: null } },
    _max: { asOfDate: true },
  });

  const pairs = latestBorrowerSnap
    .filter((x) => x.borrowerId && x._max.asOfDate)
    .map((x) => ({ borrowerId: x.borrowerId!, asOfDate: x._max.asOfDate! }));

  const topMorosos =
    pairs.length === 0
      ? []
      : await prisma.riskSnapshot.findMany({
          where: {
            organizationId: orgId,
            scope: "BORROWER",
            OR: pairs.map((p) => ({ borrowerId: p.borrowerId, asOfDate: p.asOfDate })),
          },
          orderBy: [{ pagosTardePct: "desc" }, { atrasoPromedioDias: "desc" }],
          take: 5,
          include: { borrower: true },
        });

  // =========================
  // Charts data (server -> client)
  // =========================
  const totalActivos = await prisma.loan.count({
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
  });

  const conAtraso = prestamosConVencidos;
  const alCorriente = Math.max(0, totalActivos - conAtraso);

  const carteraEstado = [
    { name: "Al corriente", value: alCorriente },
    { name: "Con atraso", value: conAtraso },
  ];

  const byFrequency = await prisma.loan.groupBy({
    by: ["frequency"],
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
    _count: { _all: true },
  });

  const freqLabel = (f: string) => {
    if (f === "WEEKLY") return "Semanal";
    if (f === "BIWEEKLY") return "Quincenal";
    if (f === "MONTHLY") return "Mensual";
    return f;
  };

  const frecuencias = (byFrequency ?? [])
    .map((x) => ({ name: freqLabel(String(x.frequency)), value: x._count._all }))
    .sort((a, b) => b.value - a.value);

  // =========================
  // Próximos cobros (con filtro)
  // =========================
  const tz = "America/Mexico_City";
  const todayStart = startOfDayInTZ(tz);
  const tomorrowStart = addDaysUTC(todayStart, 1);

  const windowDays = cobrosWindow === "hoy" ? 1 : cobrosWindow === "7d" ? 7 : 30;
  const windowEnd = addDaysUTC(todayStart, windowDays);

  const upcoming = await prisma.paymentSchedule.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: { in: ["PENDING", "PARTIAL", "MISSED"] },
      dueDate: { gte: todayStart, lt: windowEnd },
      loan: {
        deletedAt: null,
        status: "ACTIVE",
        borrower: { deletedAt: null },
      },
    },
    orderBy: [{ dueDate: "asc" }, { installmentNumber: "asc" }],
    take: 50,
    select: {
      id: true,
      loanId: true,
      installmentNumber: true,
      dueDate: true,
      expectedAmount: true,
      paidAmount: true,
      status: true,
      loan: { select: { borrower: { select: { fullName: true } } } },
    },
  });

  const cobrosHoy = await prisma.paymentSchedule.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: { in: ["PENDING", "PARTIAL", "MISSED"] },
      dueDate: { gte: todayStart, lt: tomorrowStart },
      loan: {
        deletedAt: null,
        status: "ACTIVE",
        borrower: { deletedAt: null },
      },
    },
    select: { expectedAmount: true, paidAmount: true },
  });

  const totalHoyPendiente = cobrosHoy.reduce((acc, x) => {
    const expected = Number(x.expectedAmount);
    const paid = Number(x.paidAmount);
    return acc + Math.max(0, expected - paid);
  }, 0);

  const totalVentanaPendiente = upcoming.reduce((acc, x) => {
    const expected = Number(x.expectedAmount);
    const paid = Number(x.paidAmount);
    return acc + Math.max(0, expected - paid);
  }, 0);

  const countHoy = cobrosHoy.length;

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div>
        <h1 className="text-xl font-semibold text-[#1F1F1F]">Resumen</h1>
        <p className="mt-1 text-sm text-black/55">
          Lo más importante: cuánto está prestado, cuánto falta por cobrar y quién va atrasado.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Prestado en la calle</div>
            <div className="mt-2 text-2xl font-semibold text-[#1F1F1F]">{mxn(prestadoEnLaCalle)}</div>
            <div className="mt-2 text-xs text-black/50">Suma de lo prestado en préstamos activos.</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Por cobrar (aprox.)</div>
            <div className="mt-2 text-2xl font-semibold text-[#1F1F1F]">{mxn(porCobrarAprox)}</div>
            <div className="mt-2 text-xs text-black/50">Total esperado menos lo ya pagado.</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Pagos vencidos</div>
            <div className="mt-2 text-2xl font-semibold text-[#1F1F1F]">{prestamosConVencidos}</div>
            <div className="mt-2 text-xs text-black/50">Préstamos que ya traen pagos atrasados.</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Ya casi terminan</div>
            <div className="mt-2 text-2xl font-semibold text-[#1F1F1F]">{yaCasiTerminan}</div>
            <div className="mt-2 text-xs text-black/50">2 pagos o menos por cubrir.</div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts carteraEstado={carteraEstado} frecuencias={frecuencias} />

      {/* Próximos cobros con filtro */}
      <Card>
        <CardHeader
          title="Próximos cobros"
          subtitle="Incluye los que se cobran hoy. Usa tu horario de México."
        />
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-black/55">
              Mostrando:{" "}
              <span className="font-semibold text-[#1F1F1F]">{windowLabel(cobrosWindow)}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["hoy", "7d", "30d"] as CobroWindow[]).map((w) => {
                const active = w === cobrosWindow;
                return (
                  <Link
                    key={w}
                    href={`/dashboard?cobros=${w}`}
                    className={
                      active
                        ? "rounded-full bg-[#0F2A36] px-3 py-1.5 text-xs font-semibold text-white"
                        : "rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F2A36] hover:bg-black/5"
                    }
                  >
                    {windowLabel(w)}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
              <div className="text-xs text-black/55">Cobros hoy</div>
              <div className="mt-1 text-2xl font-semibold text-[#1F1F1F]">{countHoy}</div>
              <div className="mt-1 text-xs text-black/55">
                Total pendiente hoy: <span className="font-semibold">{mxn(totalHoyPendiente)}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
              <div className="text-xs text-black/55">Total pendiente</div>
              <div className="mt-1 text-2xl font-semibold text-[#1F1F1F]">{mxn(totalVentanaPendiente)}</div>
              <div className="mt-1 text-xs text-black/55">En {windowLabel(cobrosWindow).toLowerCase()}.</div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-3">
              <div className="text-xs text-black/55">Tip</div>
              <div className="mt-1 text-sm text-black/60">Abre un cobro para registrar pago rápido.</div>
            </div>

            {/* LISTA */}
            <div className="sm:col-span-3 min-w-0 overflow-x-hidden rounded-2xl border border-black/10 bg-white p-3">
              {upcoming.length === 0 ? (
                <div className="text-sm text-black/55">No hay cobros en este rango.</div>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((x) => {
                    const expected = Number(x.expectedAmount);
                    const paid = Number(x.paidAmount);
                    const pendiente = Math.max(0, expected - paid);

                    const isToday = x.dueDate >= todayStart && x.dueDate < tomorrowStart;

                    return (
                      <Link
                        key={x.id}
                        href={`/loans/${x.loanId}`}
                        className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 hover:bg-black/5"
                      >
                        {/* IZQUIERDA */}
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-[#1F1F1F]">
                                {x.loan.borrower.fullName}
                              </div>
                            </div>

                            {isToday ? (
                              <span className="shrink-0 rounded-full border border-[#0F2A36]/20 bg-[#0F2A36]/10 px-2 py-0.5 text-xs font-semibold text-[#0F2A36]">
                                Hoy
                              </span>
                            ) : null}

                            <span
                              className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClassScheduleLocal(
                                String(x.status)
                              )}`}
                            >
                              {scheduleStatusLabelLocal(String(x.status))}
                            </span>
                          </div>

                          <div className="mt-1 truncate text-xs text-black/55">
                            Pago #{x.installmentNumber} · Vence:{" "}
                            {new Date(x.dueDate).toLocaleDateString("es-MX")}
                          </div>
                        </div>

                        {/* DERECHA */}
                        <div className="shrink-0 pl-3 text-right">
                          <div className="text-sm font-semibold text-[#0F2A36]">
                            {mxn(pendiente)}
                          </div>
                          <div className="text-xs text-black/50">esperado: {mxn(expected)}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Quién va más atrasado" subtitle="Se actualiza cuando registras pagos." />
        <CardBody>
          {topMorosos.length === 0 ? (
            <div className="text-sm text-black/55">Aún no hay métricas. Registra pagos y esto se llenará solo.</div>
          ) : (
            <div className="space-y-2">
              {topMorosos.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#1F1F1F]">
                      {s.borrower?.fullName ?? "Deudor"}
                    </div>
                    <div className="mt-1 truncate text-xs text-black/55">
                      Pagos tarde: {s.pagosTardePct}% · Atraso promedio: {s.atrasoPromedioDias} días ·{" "}
                      {trendLabel(String(s.trend))}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                      String(s.conclusion)
                    )}`}
                  >
                    {conclusionLabel(String(s.conclusion))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}