// app/(auth)/login/ui/LoginForm.tsx
"use client";

import { signIn } from "next-auth/react";

export default function LoginForm() {
  return (
    <div className="space-y-3">
      <button
        onClick={() =>
          signIn("google", {
            callbackUrl: "/dashboard",
          })
        }
        className="w-full rounded-xl bg-[#0F2A36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1F28]"
      >
        Entrar con Google
      </button>

      <p className="text-xs text-black/50">
        Si es tu primera vez, se crea tu cuenta automáticamente.
      </p>
    </div>
  );
}