// components/ui/Card.tsx
import type { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-black/10 bg-white shadow-sm">{children}</div>;
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-black/10 px-5 py-4">
      <h2 className="text-sm font-semibold text-[#1F1F1F]">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-black/55">{subtitle}</p> : null}
    </div>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="px-5 py-4">{children}</div>;
}
