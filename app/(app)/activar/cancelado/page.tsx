// app/(app)/activar/cancelado/page.tsx
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function ActivarCanceladoPage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Pago cancelado" subtitle="No pasó nada. Cuando quieras, puedes intentarlo de nuevo." />
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-black/60">Limar se queda en modo exploración hasta que actives.</p>
            <Link
              href="/activar"
              className="rounded-2xl bg-[#0F2A36] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Volver a activar
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}