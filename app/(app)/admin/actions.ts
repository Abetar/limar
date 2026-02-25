// app/(app)/admin/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function assertGlobalAdmin(sessionEmail?: string) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = (sessionEmail ?? "").trim().toLowerCase();

  if (!adminEmail) throw new Error("Missing ADMIN_EMAIL");
  if (!userEmail) throw new Error("Unauthorized");
  if (userEmail !== adminEmail) throw new Error("Forbidden");
}

export async function setSubscriptionOverrideAction(orgId: string, enabled: boolean, reason?: string) {
  const u = await getSessionUser();
  if (!u) throw new Error("Unauthorized");

  assertGlobalAdmin(u.email);

  if (!orgId) throw new Error("Missing orgId");

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, deletedAt: true },
  });

  if (!org || org.deletedAt) throw new Error("Organización no encontrada.");

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      subscriptionOverride: enabled,
      subscriptionOverrideAt: enabled ? new Date() : null,
      subscriptionOverrideReason: enabled
        ? reason?.trim()
          ? reason.trim()
          : "Acceso gratuito (admin global)"
        : null,
    },
  });

  // Refresca UI server-side (layout/dashboard/admin)
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/borrowers");
  revalidatePath("/loans");
  revalidatePath("/settings");
}

export async function setUserEnabledAction(userId: string, enabled: boolean) {
  const u = await getSessionUser();
  if (!u) throw new Error("Unauthorized");

  assertGlobalAdmin(u.email);

  if (!userId) throw new Error("Missing userId");

  // No permitir que te deshabilites a ti mismo
  if (userId === u.id) throw new Error("No puedes deshabilitarte a ti mismo.");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true },
  });

  if (!target || target.deletedAt) throw new Error("Usuario no encontrado.");

  await prisma.user.update({
    where: { id: userId },
    data: {
      isEnabled: enabled,
      disabledAt: enabled ? null : new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/borrowers");
  revalidatePath("/loans");
  revalidatePath("/settings");
}