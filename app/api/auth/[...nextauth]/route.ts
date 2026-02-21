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

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  // ✅ CLAVE: JWT para que el middleware lo pueda validar (Edge)
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
        user.name?.trim() ||
        user.email?.split("@")[0]?.trim() ||
        "Mi negocio";

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
    // ✅ Guardamos orgId/role en el JWT (token) para que middleware lo vea
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.organizationId = (user as any).organizationId ?? null;
        token.role = (user as any).role ?? "MEMBER";
      } else if (!token.organizationId && token.email) {
        // en requests siguientes, aseguramos orgId consultando DB 1 vez si faltara
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, organizationId: true, role: true },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.organizationId = dbUser.organizationId ?? null;
          token.role = dbUser.role ?? "MEMBER";
        }
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).user.id = (token as any).uid;
      (session as any).user.organizationId = (token as any).organizationId ?? null;
      (session as any).user.role = (token as any).role ?? "MEMBER";
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };