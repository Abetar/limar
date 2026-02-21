"use server";

import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma, LoanStatus, ScheduleStatus, type LoanFrequency } from "@prisma/client";
import { computeDueDates, computeInstallment } from "@/lib/schedule";

function s(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function toNumber(x: string) {
  const n = Number(x);
  if (!Number.isFinite(n)) throw new Error("Número inválido");
  return n;
}

export async function createLoanAction(formData: FormData) {
  const orgId = await requireOrgId();

  const borrowerId = s(formData, "borrowerId");
  const startDateStr = s(formData, "startDate"); // yyyy-mm-dd
  const frequency = s(formData, "frequency") as LoanFrequency;

  const termCount = toNumber(s(formData, "termCount"));
  const principal = toNumber(s(formData, "principalAmount"));

  // ✅ Ahora es interés TOTAL del préstamo (%)
  const interestTotalPct = toNumber(s(formData, "interestTotalPct"));

  if (!borrowerId) throw new Error("borrowerId requerido");
  if (!startDateStr) throw new Error("startDate requerido");
  if (!["WEEKLY", "BIWEEKLY", "MONTHLY"].includes(frequency)) throw new Error("frecuencia inválida");
  if (termCount < 1 || termCount > 200) throw new Error("termCount inválido");
  if (principal <= 0) throw new Error("principal inválido");
  if (interestTotalPct < 0 || interestTotalPct > 300) throw new Error("interestTotalPct inválido");

  // Asegura que borrower pertenece a la org
  const borrower = await prisma.borrower.findFirst({
    where: { id: borrowerId, organizationId: orgId, deletedAt: null },
    select: { id: true },
  });
  if (!borrower) throw new Error("Borrower no encontrado");

  // Parse fecha (sin hora). MVP: lo guardamos en UTC a medianoche.
  const startDate = new Date(`${startDateStr}T00:00:00.000Z`);

  // ✅ Calcula totalExpected + cuota usando interés TOTAL
  const { totalExpected, expectedInstallment } = computeInstallment(
    principal,
    interestTotalPct,
    termCount
  );

  const dueDates = computeDueDates(startDate, frequency, termCount);
  const nextDueDate = dueDates[0] ?? null;

  const loan = await prisma.loan.create({
    data: {
      organizationId: orgId,
      borrowerId,
      status: LoanStatus.ACTIVE,
      startDate,
      frequency,
      termCount,
      principalAmount: new Prisma.Decimal(principal.toFixed(2)),

      // ⚠️ Por ahora guardamos el TOTAL en este campo (nombre legacy).
      // Luego podemos renombrar o agregar interestTotalPct a la DB.
      interestRatePct: new Prisma.Decimal(interestTotalPct.toFixed(2)),

      expectedInstallment: new Prisma.Decimal(expectedInstallment.toFixed(2)),
      totalExpected: new Prisma.Decimal(totalExpected.toFixed(2)),
      nextDueDate,
    },
    select: { id: true },
  });

  await prisma.paymentSchedule.createMany({
    data: dueDates.map((dueDate, idx) => ({
      organizationId: orgId,
      loanId: loan.id,
      installmentNumber: idx + 1,
      dueDate,
      expectedAmount: new Prisma.Decimal(expectedInstallment.toFixed(2)),
      status: ScheduleStatus.PENDING,
      paidAmount: new Prisma.Decimal("0.00"),
    })),
  });

  redirect(`/loans/${loan.id}`);
}
