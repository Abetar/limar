// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // ✅ logs útiles en dev para ver qué regresa Google

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          // ✅ Fuerza selector de cuenta para evitar "prompt=none"
          prompt: "select_account",
          // Si quieres forzar re-consent en pruebas:
          // prompt: "consent select_account",
        },
      },
    }),
  ],

  // ✅ CLAVE: JWT para que middleware (Edge) lo pueda validar
  session: { strategy: "jwt" },

  pages: { signIn: "/login" },

  // ✅ Self-signup: se ejecuta cuando el user YA fue creado
  events: {
    async createUser({ user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, organizationId: true },
      });
      if (!dbUser || dbUser.organizationId) return;

      const orgName =
        user.name?.trim() || user.email?.split("@")[0]?.trim() || "Mi negocio";

      const slug = `${slugify(orgName)}-${Math.random().toString(36).slice(2, 7)}`;

      const org = await prisma.organization.create({
        data: {
          name: orgName,
          slug,
          settings: { create: {} },
        },
        select: { id: true },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: org.id, role: "OWNER" },
      });
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      // 1) En el primer login, NextAuth te da `user`.
      if (user) {
        token.uid = user.id;
        token.email = (user as any).email ?? token.email ?? null;
      }

      // 2) Siempre que tengamos email o uid, resolvemos desde DB
      // (esto hace que el proxy tenga datos correctos)
      const email = (token.email as string | null) ?? null;

      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            token.uid ? { id: token.uid as string } : undefined,
            email ? { email } : undefined,
          ].filter(Boolean) as any,
        },
        select: {
          id: true,
          email: true,
          role: true,
          isEnabled: true,
          organizationId: true,
          organization: {
            select: {
              subscriptionStatus: true,
              subscriptionOverride: true,
              currentPeriodEnd: true,
              deletedAt: true,
            },
          },
          deletedAt: true,
        },
      });

      if (
        !dbUser ||
        dbUser.deletedAt ||
        !dbUser.organizationId ||
        dbUser.organization?.deletedAt
      ) {
        // token inválido o usuario sin org
        (token as any).uid = null;
        (token as any).organizationId = null;
        (token as any).role = "MEMBER";
        (token as any).accessMode = "BLOCKED";
        return token;
      }

      const isEnabled = !!dbUser.isEnabled;
      const org = dbUser.organization;

      let accessMode: "FULL" | "EXPLORATION" | "BLOCKED" = "EXPLORATION";
      if (!isEnabled) accessMode = "BLOCKED";
      else if (
        org?.subscriptionOverride ||
        org?.subscriptionStatus === "ACTIVE"
      )
        accessMode = "FULL";

      (token as any).uid = dbUser.id;
      (token as any).email = dbUser.email ?? null;
      (token as any).organizationId = dbUser.organizationId;
      (token as any).role = dbUser.role ?? "MEMBER";
      (token as any).accessMode = accessMode;

      // opcional pero útil
      (token as any).subscriptionStatus = org?.subscriptionStatus ?? "INACTIVE";
      (token as any).subscriptionOverride = !!org?.subscriptionOverride;
      (token as any).currentPeriodEnd = org?.currentPeriodEnd
        ? org.currentPeriodEnd.toISOString()
        : null;

      return token;
    },

    async session({ session, token }) {
      (session as any).user.id = (token as any).uid;
      (session as any).user.email =
        (token as any).email ?? session.user?.email ?? null;
      (session as any).user.organizationId =
        (token as any).organizationId ?? null;
      (session as any).user.role = (token as any).role ?? "MEMBER";

      // clave para UI
      (session as any).user.accessMode =
        (token as any).accessMode ?? "EXPLORATION";
      (session as any).user.subscriptionStatus =
        (token as any).subscriptionStatus ?? "INACTIVE";
      (session as any).user.subscriptionOverride = !!(token as any)
        .subscriptionOverride;
      (session as any).user.currentPeriodEnd =
        (token as any).currentPeriodEnd ?? null;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
