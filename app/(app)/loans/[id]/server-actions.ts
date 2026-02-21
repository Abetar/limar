"use server";

import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma, ScheduleStatus, PaymentStatus } from "@prisma/client";
import { recalcLoanSnapshot, recalcBorrowerSnapshot } from "@/lib/risk";

function s(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function toNumber(x: string) {
  const n = Number(x);
  if (!Number.isFinite(n)) throw new Error("Número inválido");
  return n;
}

function daysBetween(a: Date, b: Date) {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function registerPaymentAction(formData: FormData) {
  const orgId = await requireOrgId();

  const loanId = s(formData, "loanId");
  const paidAtStr = s(formData, "paidAt"); // yyyy-mm-dd
  const amount = toNumber(s(formData, "amount"));

  if (!loanId) throw new Error("loanId requerido");
  if (!paidAtStr) throw new Error("paidAt requerido");
  if (amount <= 0) throw new Error("amount inválido");

  const paidAt = new Date(`${paidAtStr}T00:00:00.000Z`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Todo en transacción para consistencia
  const borrowerId = await prisma.$transaction(async (tx) => {
    // Trae loan + borrowerId
    const loan = await tx.loan.findFirst({
      where: { id: loanId, organizationId: orgId, deletedAt: null },
      select: { id: true, borrowerId: true },
    });
    if (!loan) throw new Error("Loan no encontrado");

    // (MVP) Marcar como MISSED cuotas vencidas no pagadas
    await tx.paymentSchedule.updateMany({
      where: {
        organizationId: orgId,
        loanId,
        deletedAt: null,
        status: { in: [ScheduleStatus.PENDING, ScheduleStatus.PARTIAL] },
        dueDate: { lt: today },
      },
      data: { status: ScheduleStatus.MISSED },
    });

    // Cuotas pendientes (FIFO)
    const schedules = await tx.paymentSchedule.findMany({
      where: {
        organizationId: orgId,
        loanId,
        deletedAt: null,
        status: { in: [ScheduleStatus.PENDING, ScheduleStatus.PARTIAL, ScheduleStatus.MISSED] },
      },
      orderBy: { installmentNumber: "asc" },
    });

    let remaining = amount;

    // Crea el Payment principal (registro del abono)
    await tx.payment.create({
      data: {
        organizationId: orgId,
        borrowerId: loan.borrowerId,
        loanId,
        paidAt,
        amount: new Prisma.Decimal(amount.toFixed(2)),
        status: PaymentStatus.POSTED,
      },
    });

    for (const item of schedules) {
      if (remaining <= 0) break;

      const expected = Number(item.expectedAmount);
      const paidSoFar = Number(item.paidAmount);
      const missing = Math.max(0, expected - paidSoFar);
      if (missing <= 0) continue;

      const applied = Math.min(remaining, missing);
      const newPaid = paidSoFar + applied;
      const fullyPaid = newPaid >= expected - 0.0001;

      const lateDays = fullyPaid
        ? Math.max(0, daysBetween(paidAt, item.dueDate))
        : item.lateDays;

      await tx.paymentSchedule.update({
        where: { id: item.id },
        data: {
          paidAmount: new Prisma.Decimal(newPaid.toFixed(2)),
          status: fullyPaid ? ScheduleStatus.PAID : ScheduleStatus.PARTIAL,
          paidAt: fullyPaid ? paidAt : item.paidAt,
          lateDays: fullyPaid ? lateDays : item.lateDays,
        },
      });

      remaining -= applied;
    }

    // Recalcula nextDueDate del loan
    const nextPending = await tx.paymentSchedule.findFirst({
      where: {
        organizationId: orgId,
        loanId,
        deletedAt: null,
        status: { in: [ScheduleStatus.PENDING, ScheduleStatus.PARTIAL, ScheduleStatus.MISSED] },
      },
      orderBy: { dueDate: "asc" },
      select: { dueDate: true },
    });

    await tx.loan.update({
      where: { id: loanId },
      data: { nextDueDate: nextPending?.dueDate ?? null },
    });

    return loan.borrowerId;
  });

  // ✅ Recalcula snapshots fuera de la transacción (más rápido/seguro)
  await recalcLoanSnapshot(orgId, loanId);
  await recalcBorrowerSnapshot(orgId, borrowerId);

  redirect(`/loans/${loanId}`);
}
