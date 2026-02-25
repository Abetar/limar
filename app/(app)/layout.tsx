// app/(app)/layout.tsx
import Link from "next/link";
import LogoutButton from "@/components/ui/LogoutButton";
import { requireAccess } from "@/lib/access";

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
    >
      {label}
    </Link>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await requireAccess();

  const isFull = access.mode === "FULL";

  // Admin solo para ti (no por rol)
  const adminEmail = process.env.ADMIN_EMAIL ?? "abrahamgm85@gmail.com";
  const isAdmin = (access.email ?? "").toLowerCase() === adminEmail.toLowerCase();

  return (
    <div className="min-h-screen bg-[#F5F6F7] text-[#1F1F1F]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#0F2A36]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-white font-semibold tracking-tight">
              Limar
            </Link>

            <nav className="hidden sm:flex items-center gap-1">
              <NavItem href="/dashboard" label="Resumen" />

              {!isFull ? <NavItem href="/activar" label="Activar" /> : null}

              {isFull ? <NavItem href="/borrowers" label="Deudores" /> : null}
              {isFull ? <NavItem href="/loans" label="Préstamos" /> : null}
              {isFull ? <NavItem href="/settings" label="Ajustes" /> : null}

              {isAdmin ? <NavItem href="/admin" label="Admin" /> : null}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-xs text-white/70">
              {access.mode === "FULL"
                ? "Suscripción activa"
                : access.mode === "EXPLORATION"
                  ? "Modo exploración"
                  : "Cuenta bloqueada"}
            </div>
            <LogoutButton />
          </div>
        </div>

        <div className="sm:hidden border-t border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2">
            <div className="flex gap-1 overflow-x-auto">
              <NavItem href="/dashboard" label="Resumen" />

              {!isFull ? <NavItem href="/activar" label="Activar" /> : null}

              {isFull ? <NavItem href="/borrowers" label="Deudores" /> : null}
              {isFull ? <NavItem href="/loans" label="Préstamos" /> : null}
              {isFull ? <NavItem href="/settings" label="Ajustes" /> : null}

              {isAdmin ? <NavItem href="/admin" label="Admin" /> : null}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}