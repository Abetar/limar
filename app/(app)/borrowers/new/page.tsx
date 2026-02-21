import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { createBorrowerAction } from "./server-actions";

export default function NewBorrowerPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#1F1F1F]">Nuevo deudor</h1>
        <p className="mt-1 text-sm text-black/55">Registro básico del cliente.</p>
      </div>

      <Card>
        <CardHeader title="Datos" />
        <CardBody>
          <form action={createBorrowerAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F1F1F]">Nombre completo</label>
              <input
                name="fullName"
                required
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">Teléfono</label>
                <input
                  name="phone"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                  placeholder="Ej. 8112345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">Referencia externa</label>
                <input
                  name="externalRef"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                  placeholder="Ej. Cliente-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1F1F]">Notas</label>
              <textarea
                name="notes"
                rows={3}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                placeholder="Opcional"
              />
            </div>

            <div className="flex gap-2">
              <button className="rounded-xl bg-[#0F2A36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1F28]">
                Guardar
              </button>
              <a
                href="/borrowers"
                className="rounded-xl border border-[#0F2A36] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
              >
                Cancelar
              </a>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
