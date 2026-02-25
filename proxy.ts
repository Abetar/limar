// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = startsWithAny(pathname, [
    "/dashboard",
    "/borrowers",
    "/loans",
    "/settings",
    "/activar",
    "/admin",
  ]);

  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  const accessMode = (token as any).accessMode as
    | "FULL"
    | "EXPLORATION"
    | "BLOCKED"
    | undefined;

  const email = (((token as any).email as string | undefined) ?? "").toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "abrahamgm85@gmail.com").toLowerCase();
  const isAdmin = email === adminEmail;

  // Admin SOLO para ti
  if (pathname.startsWith("/admin") && !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // BLOCKED: solo permite dashboard/activar/admin
  if (accessMode === "BLOCKED") {
    const allowed = startsWithAny(pathname, ["/dashboard", "/activar", "/admin"]);
    if (!allowed) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // EXPLORATION: bloquea módulos FULL por URL
  if (accessMode === "EXPLORATION") {
    const blocked = startsWithAny(pathname, ["/borrowers", "/loans", "/settings"]);
    if (blocked) {
      const url = req.nextUrl.clone();
      url.pathname = "/activar";
      return NextResponse.redirect(url);
    }
  }

  // FULL: pasa
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/borrowers/:path*",
    "/loans/:path*",
    "/settings/:path*",
    "/activar/:path*",
    "/admin/:path*",
  ],
};