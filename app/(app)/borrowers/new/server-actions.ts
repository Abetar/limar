"use server";

import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";

function clean(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}

export async function createBorrowerAction(formData: FormData) {
  const orgId = await requireOrgId();

  const fullName = clean(formData.get("fullName"));
  const phone = clean(formData.get("phone")) || null;
  const externalRef = clean(formData.get("externalRef")) || null;
  const notes = clean(formData.get("notes")) || null;

  if (!fullName || fullName.length < 3) throw new Error("Nombre inválido");

  const borrower = await prisma.borrower.create({
    data: { organizationId: orgId, fullName, phone, externalRef, notes },
    select: { id: true },
  });

  redirect(`/borrowers/${borrower.id}`);
}
