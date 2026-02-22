// app/(app)/borrowers/[id]/edit/server-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";

function s(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function emptyToNull(v: string) {
  const t = v.trim();
  return t.length ? t : null;
}

export async function updateBorrowerAction(formData: FormData) {
  const orgId = await requireOrgId();

  const borrowerId = s(formData, "borrowerId");
  const fullName = s(formData, "fullName");

  if (!borrowerId) throw new Error("borrowerId requerido");
  if (!fullName) throw new Error("Nombre requerido");

  // ✅ seguridad: update solo dentro de org + no borrado
  await prisma.borrower.updateMany({
    where: { id: borrowerId, organizationId: orgId, deletedAt: null },
    data: {
      fullName,
      phone: emptyToNull(s(formData, "phone")),
      email: emptyToNull(s(formData, "email")),
      externalRef: emptyToNull(s(formData, "externalRef")),
      notes: emptyToNull(s(formData, "notes")),
    },
  });

  redirect(`/borrowers/${borrowerId}`);
}

export async function deleteBorrowerAction(formData: FormData) {
  const orgId = await requireOrgId();

  const borrowerId = s(formData, "borrowerId");
  if (!borrowerId) throw new Error("borrowerId requerido");

  // Regla: solo permitir borrar si NO tiene loans/pagos (por integridad)
  const counts = await prisma.borrower.findFirst({
    where: { id: borrowerId, organizationId: orgId, deletedAt: null },
    select: {
      _count: { select: { loans: true, payments: true } },
    },
  });

  if (!counts) throw new Error("Deudor no encontrado");
  if (counts._count.loans > 0 || counts._count.payments > 0) {
    throw new Error("No se puede eliminar: ya tiene préstamos o pagos");
  }

  await prisma.borrower.updateMany({
    where: { id: borrowerId, organizationId: orgId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  redirect("/borrowers");
}