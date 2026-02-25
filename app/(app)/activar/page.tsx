// app/(app)/activar/page.tsx
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function ActivarPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F1F1F]">Activa Limar</h1>
        <p className="mt-1 text-sm text-black/55">
          Para empezar a registrar tu cartera y ver métricas reales, activa tu suscripción.
        </p>

        <div className="mt-3 rounded-2xl border border-black/10 bg-white p-3 text-sm text-black/60">
          Estás en modo exploración. El resumen muestra datos de ejemplo hasta que actives.
        </div>
      </div>

      <Card>
        <CardHeader title="Limar mensual" subtitle="Precio único, sin niveles ni letras chiquitas." />
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-3xl font-semibold text-[#1F1F1F]">$199 MXN</div>
              <div className="mt-1 text-sm text-black/55">Al mes. Cancela cuando quieras.</div>
              <div className="mt-2 text-xs text-black/50">Cobro seguro con Stripe.</div>
            </div>

            <form action="/api/stripe/checkout" method="post">
              <button
                type="submit"
                className="rounded-2xl bg-[#0F2A36] px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Activar Limar
              </button>
            </form>
          </div>

          <ul className="mt-5 grid gap-2 text-sm text-black/60 sm:grid-cols-2">
            <li className="rounded-2xl border border-black/10 bg-white p-3">Deudores y préstamos con orden.</li>
            <li className="rounded-2xl border border-black/10 bg-white p-3">Calendario de pagos y registro rápido.</li>
            <li className="rounded-2xl border border-black/10 bg-white p-3">Multas y penalizaciones automáticas.</li>
            <li className="rounded-2xl border border-black/10 bg-white p-3">Riesgo progresivo y conclusión de renovación.</li>
          </ul>
        </CardBody>
      </Card>

      <div className="text-xs text-black/45">
        Si activas y algo no se refleja al instante, actualiza la página. La activación depende del webhook de Stripe.
      </div>
    </div>
  );
}