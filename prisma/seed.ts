// prisma/seed.ts
import { PrismaClient, Prisma, LoanFrequency, LoanStatus, ScheduleStatus, PaymentStatus, RiskScope, TrendStatus, RenewalConclusion } from "@prisma/client";

const prisma = new PrismaClient();

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function stepDays(freq: LoanFrequency) {
  if (freq === "WEEKLY") return 7;
  if (freq === "BIWEEKLY") return 14;
  return 30; // MONTHLY (MVP simple)
}

function mxn(n: number) {
  return new Prisma.Decimal(n.toFixed(2));
}

async function main() {
  const slug = "limar-demo";
  const orgName = "Limar Demo";
  const ownerEmail = "agsolutions96@gmail.com";

  // 1) Upsert Organization
  const org = await prisma.organization.upsert({
    where: { slug },
    update: { name: orgName, deletedAt: null },
    create: { slug, name: orgName },
  });

  // 2) Upsert Settings
  await prisma.organizationSettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      defaultInterestRatePct: new Prisma.Decimal("10.00"),
      defaultFrequency: "WEEKLY",
      defaultTermCount: 10,
      graceLateDays: 0,
      severeLateDays: 14,
      trendWindowN: 6,
      trendDeltaDays: 2,
      noRenewLatePct: 35,
      reduceLatePct: 20,
      increaseLatePctMax: 10,
      minOnTimePctToIncrease: 90,
      reduceMultiplier: new Prisma.Decimal("0.80"),
      maintainMultiplier: new Prisma.Decimal("1.00"),
      increaseMultiplier: new Prisma.Decimal("1.20"),
      lateFeeFlatAmount: new Prisma.Decimal("0.00"),
      lateFeePerDayAmount: new Prisma.Decimal("0.00"),
      maxPenaltyPerInstallment: new Prisma.Decimal("0.00"),
    },
  });

  // 3) Upsert Owner user
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { organizationId: org.id, role: "OWNER", deletedAt: null, name: "Owner Demo" },
    create: { organizationId: org.id, email: ownerEmail, role: "OWNER", name: "Owner Demo" },
  });

  // 4) Limpia data demo previa (sin tocar org y user)
  // IMPORTANTE: por FKs con Restrict, borramos en orden.
  await prisma.contractDocument.deleteMany({ where: { organizationId: org.id } });
  await prisma.riskSnapshot.deleteMany({ where: { organizationId: org.id } });
  await prisma.penalty.deleteMany({ where: { organizationId: org.id } });
  await prisma.payment.deleteMany({ where: { organizationId: org.id } });
  await prisma.paymentSchedule.deleteMany({ where: { organizationId: org.id } });
  await prisma.loanRestructure.deleteMany({ where: { organizationId: org.id } });
  await prisma.loan.deleteMany({ where: { organizationId: org.id } });
  await prisma.borrower.deleteMany({ where: { organizationId: org.id } });

  // 5) Crea borrowers
  const borrowersSeed = [
    { fullName: "Juan Pérez", phone: "8110000001" },
    { fullName: "María López", phone: "8110000002" },
    { fullName: "Carlos Hernández", phone: "8110000003" },
    { fullName: "Ana Rodríguez", phone: "8110000004" },
    { fullName: "Luis Martínez", phone: "8110000005" },
  ];

  const borrowers = [];
  for (const b of borrowersSeed) {
    borrowers.push(
      await prisma.borrower.create({
        data: {
          organizationId: org.id,
          fullName: b.fullName,
          phone: b.phone,
          notes: "Borrower demo",
        },
      })
    );
  }

  // 6) Crea loans + schedules + algunos pagos
  const startBase = new Date();
  startBase.setHours(0, 0, 0, 0);

  for (let i = 0; i < borrowers.length; i++) {
    const borrower = borrowers[i];

    // variamos un poco
    const frequency: LoanFrequency = i % 3 === 0 ? "WEEKLY" : i % 3 === 1 ? "BIWEEKLY" : "MONTHLY";
    const termCount = frequency === "MONTHLY" ? 6 : 10;
    const principal = 3000 + i * 700; // MXN
    const interestRatePct = 10; // MVP “por periodo” como definiste
    const expectedInstallment = Math.round((principal * (1 + interestRatePct / 100)) / termCount);

    const totalExpected = expectedInstallment * termCount;
    const startDate = addDays(startBase, -stepDays(frequency) * 2); // que ya tengan historial

    const loan = await prisma.loan.create({
      data: {
        organizationId: org.id,
        borrowerId: borrower.id,
        status: LoanStatus.ACTIVE,
        startDate,
        frequency,
        termCount,
        principalAmount: mxn(principal),
        interestRatePct: new Prisma.Decimal(interestRatePct.toFixed(2)),
        expectedInstallment: mxn(expectedInstallment),
        totalExpected: mxn(totalExpected),
        notes: "Loan demo",
      },
    });

    // schedule
    const scheduleItems = [];
    for (let n = 1; n <= termCount; n++) {
      const dueDate = addDays(startDate, stepDays(frequency) * n);
      scheduleItems.push({
        organizationId: org.id,
        loanId: loan.id,
        installmentNumber: n,
        dueDate,
        expectedAmount: mxn(expectedInstallment),
      });
    }

    await prisma.paymentSchedule.createMany({ data: scheduleItems });

    // trae schedules creados
    const schedules = await prisma.paymentSchedule.findMany({
      where: { loanId: loan.id, organizationId: org.id, deletedAt: null },
      orderBy: { installmentNumber: "asc" },
    });

    // simula pagos: primeros 4 pagados, con algunos tardíos
    let pagosATiempo = 0;
    let pagosTarde = 0;
    let atrasoDiasTotal = 0;

    for (let k = 0; k < Math.min(4, schedules.length); k++) {
      const s = schedules[k];

      // regla demo:
      // borrower 0 y 3: tardíos
      const late = i === 0 || i === 3 ? (k % 2 === 0 ? 5 : 0) : (i === 2 && k === 3 ? 10 : 0);
      const paidAt = addDays(s.dueDate, late);

      await prisma.payment.create({
        data: {
          organizationId: org.id,
          borrowerId: borrower.id,
          loanId: loan.id,
          scheduleId: s.id,
          paidAt,
          amount: s.expectedAmount,
          status: PaymentStatus.POSTED,
          notes: late > 0 ? `Pago tardío ${late} días (demo)` : "Pago a tiempo (demo)",
        },
      });

      await prisma.paymentSchedule.update({
        where: { id: s.id },
        data: {
          status: ScheduleStatus.PAID,
          paidAmount: s.expectedAmount,
          paidAt,
          lateDays: late > 0 ? late : 0,
        },
      });

      if (late > 0) {
        pagosTarde++;
        atrasoDiasTotal += late;
      } else {
        pagosATiempo++;
      }
    }

    // set nextDueDate simple
    const nextPending = await prisma.paymentSchedule.findFirst({
      where: { loanId: loan.id, organizationId: org.id, deletedAt: null, status: ScheduleStatus.PENDING },
      orderBy: { dueDate: "asc" },
    });

    await prisma.loan.update({
      where: { id: loan.id },
      data: { nextDueDate: nextPending?.dueDate ?? null },
    });

    // RiskSnapshot LOAN (demo básico)
    const pagosTotales = pagosATiempo + pagosTarde;
    const pagosTardePct = pagosTotales === 0 ? 0 : Math.round((pagosTarde / pagosTotales) * 100);
    const atrasoPromedioDias = pagosTarde === 0 ? 0 : Math.round(atrasoDiasTotal / pagosTarde);

    const conclusion: RenewalConclusion =
      pagosTardePct >= 35 ? "NO_RENOVAR" :
      pagosTardePct >= 20 ? "REDUCIR" :
      pagosTardePct <= 10 ? "AUMENTAR" : "MANTENER";

    const trend: TrendStatus =
      atrasoPromedioDias >= 8 ? "WORSENING" :
      atrasoPromedioDias <= 2 ? "IMPROVING" : "STABLE";

    const suggestedLimit =
      conclusion === "NO_RENOVAR" ? mxn(0) :
      conclusion === "REDUCIR" ? mxn(principal * 0.8) :
      conclusion === "AUMENTAR" ? mxn(principal * 1.2) :
      mxn(principal * 1.0);

    await prisma.riskSnapshot.create({
      data: {
        organizationId: org.id,
        scope: RiskScope.LOAN,
        loanId: loan.id,
        borrowerId: borrower.id,
        windowN: 6,
        pagosTotales,
        pagosATiempo,
        pagosTarde,
        pagosTardePct,
        atrasosCount: pagosTarde,
        atrasoPromedioDias,
        trend,
        conclusion,
        suggestedLimit,
        severeLateCountLastN: atrasoPromedioDias >= 14 ? 1 : 0,
      },
    });

    // RiskSnapshot BORROWER (demo: 1 por borrower, basado en el loan)
    await prisma.riskSnapshot.create({
      data: {
        organizationId: org.id,
        scope: RiskScope.BORROWER,
        borrowerId: borrower.id,
        windowN: 6,
        pagosTotales,
        pagosATiempo,
        pagosTarde,
        pagosTardePct,
        atrasosCount: pagosTarde,
        atrasoPromedioDias,
        trend,
        conclusion,
        suggestedLimit,
        severeLateCountLastN: atrasoPromedioDias >= 14 ? 1 : 0,
      },
    });
  }

  console.log("✅ Seed listo:");
  console.log(`- Org: ${orgName} (${slug})`);
  console.log(`- Owner: ${ownerEmail}`);
  console.log("- Borrowers: 5");
  console.log("- Loans: 5 + schedules + payments + snapshots");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
