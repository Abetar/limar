// app/(auth)/login/page.tsx
import LoginForm from "./ui/LoginForm";

type SearchParams = Promise<{ check?: string; error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const check = sp?.check === "1";
  const hasError = Boolean(sp?.error);

  return (
    <main className="min-h-screen bg-[#F5F6F7] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-sm border border-black/10 p-6">
        <div className="mb-6">
          <div className="text-sm font-medium text-black/60">Limar</div>
          <h1 className="mt-1 text-2xl font-semibold text-[#1F1F1F]">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Entra con tu cuenta de Google. (Rápido y sin contraseñas.)
          </p>

          {check ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-[#D6CBBF]/30 px-3 py-2 text-sm text-black/70">
              Te enviamos un enlace. Revisa tu correo para continuar.
            </div>
          ) : null}

          {hasError ? (
            <div className="mt-4 rounded-xl border border-[#B23A3A]/20 bg-[#B23A3A]/10 px-3 py-2 text-sm text-[#B23A3A]">
              No se pudo iniciar sesión. Intenta de nuevo.
            </div>
          ) : null}
        </div>

        <LoginForm />

        <p className="mt-6 text-xs text-black/50 leading-relaxed">
          Limar no procesa pagos ni otorga crédito. Solo ayuda a llevar control
          de cartera y seguimiento interno.
        </p>
      </div>
    </main>
  );
}
