// app/(app)/admin/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminClient from "./AdminClient";

function normalizeEmail(v?: string | null) {
  return (v ?? "").trim().toLowerCase();
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const sessionEmail = normalizeEmail((session as any)?.user?.email);

  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);

  // ✅ Solo admin global
  if (!adminEmail || !sessionEmail || sessionEmail !== adminEmail) {
    redirect("/dashboard");
  }

  // ✅ Orgs globales
  const orgs = await prisma.organization.findMany({
    where: { deletedAt: null },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      subscriptionOverride: true,
      subscriptionOverrideReason: true,
      subscriptionOverrideAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      createdAt: true,
    },
    take: 300,
  });

  // ✅ Users globales (incluye su org)
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isEnabled: true,
      createdAt: true,
      organizationId: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionStatus: true,
          subscriptionOverride: true,
        },
      },
    },
    take: 1000,
  });

  return (
    <AdminClient
      adminEmail={adminEmail}
      orgs={orgs.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        subscriptionStatus: o.subscriptionStatus ?? "INACTIVE",
        currentPeriodEnd: o.currentPeriodEnd ? o.currentPeriodEnd.toISOString() : null,
        subscriptionOverride: !!o.subscriptionOverride,
        subscriptionOverrideReason: o.subscriptionOverrideReason ?? null,
        subscriptionOverrideAt: o.subscriptionOverrideAt ? o.subscriptionOverrideAt.toISOString() : null,
        stripeCustomerId: o.stripeCustomerId ?? null,
        stripeSubscriptionId: o.stripeSubscriptionId ?? null,
        createdAt: o.createdAt.toISOString(),
      }))}
      users={users.map((u) => ({
        id: u.id,
        name: u.name ?? null,
        email: u.email ?? null,
        role: u.role,
        isEnabled: u.isEnabled,
        organizationId: u.organizationId ?? null,
        createdAt: u.createdAt.toISOString(),
        organization: u.organization
          ? {
              id: u.organization.id,
              name: u.organization.name,
              slug: u.organization.slug,
              subscriptionStatus: u.organization.subscriptionStatus ?? "INACTIVE",
              subscriptionOverride: !!u.organization.subscriptionOverride,
            }
          : null,
      }))}
    />
  );
}