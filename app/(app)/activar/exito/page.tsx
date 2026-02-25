// app/(app)/activar/exito/page.tsx
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function ActivarExitoPage() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Listo" subtitle="Tu pago se registró. Puede tardar unos segundos en activarse." />
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-black/60">
              Si no se activa al instante, actualiza la página. El acceso se habilita cuando llegue el webhook.
            </p>
            <Link
              href="/dashboard"
              className="rounded-2xl bg-[#0F2A36] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
            >
              Ir al resumen
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}