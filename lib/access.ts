// lib/access.ts
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export type AccessMode = "FULL" | "EXPLORATION" | "BLOCKED";

export type AccessResult = {
  userId: string;
  orgId: string;
  role: string;
  email: string | null;
  mode: AccessMode;
  subscriptionStatus: string;
  currentPeriodEnd: Date | null;
  subscriptionOverride: boolean;
};

export async function requireAccess(): Promise<AccessResult> {
  const u = await getSessionUser();
  if (!u) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: u.id },
    select: {
      id: true,
      email: true,
      isEnabled: true,
      organizationId: true,
      role: true,
      deletedAt: true,
    },
  });

  if (!dbUser || dbUser.deletedAt) throw new Error("Unauthorized");
  if (!dbUser.organizationId) throw new Error("Unauthorized: missing organizationId");

  // Kill switch por usuario (bloqueo total)
  if (!dbUser.isEnabled) {
    return {
      userId: dbUser.id,
      orgId: dbUser.organizationId,
      role: dbUser.role,
      email: dbUser.email ?? null,
      mode: "BLOCKED",
      subscriptionStatus: "INACTIVE",
      currentPeriodEnd: null,
      subscriptionOverride: false,
    };
  }

  const org = await prisma.organization.findUnique({
    where: { id: dbUser.organizationId },
    select: {
      subscriptionStatus: true,
      currentPeriodEnd: true,
      subscriptionOverride: true,
      deletedAt: true,
    },
  });

  if (!org || org.deletedAt) throw new Error("Unauthorized");

  // Override manual gana, luego Stripe
  const mode: AccessMode =
    org.subscriptionOverride || org.subscriptionStatus === "ACTIVE"
      ? "FULL"
      : "EXPLORATION";

  return {
    userId: dbUser.id,
    orgId: dbUser.organizationId,
    role: dbUser.role,
    email: dbUser.email ?? null,
    mode,
    subscriptionStatus: org.subscriptionStatus ?? "INACTIVE",
    currentPeriodEnd: org.currentPeriodEnd ?? null,
    subscriptionOverride: !!org.subscriptionOverride,
  };
}