// lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type SessionUser = {
  id: string;
  organizationId: string;
  role: string;
  email?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const u = (session as any)?.user;

  // NextAuth v4 + nuestra callback inyecta estos campos en session.user
  const id = u?.id as string | undefined;
  const organizationId = u?.organizationId as string | undefined;
  const role = u?.role as string | undefined;

  if (!id || !organizationId || !role) return null;

  return {
    id,
    organizationId,
    role,
    email: (u?.email as string | undefined) ?? undefined,
  };
}

export async function getOrgIdOrNull(): Promise<string | null> {
  const u = await getSessionUser();
  return u?.organizationId ?? null;
}

export async function requireOrgId(): Promise<string> {
  const orgId = await getOrgIdOrNull();
  if (!orgId) throw new Error("Unauthorized: missing organizationId");
  return orgId;
}
