// app/(app)/settings/page.tsx
import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { updateSettingsAction } from "./server-actions";

function n(v: any) {
  if (v == null) return "";
  return typeof v === "object" && "toString" in v ? v.toString() : String(v);
}

// ✅ Helpers para explicar multiplicadores
function toPct(multStr: string) {
  const num = Number(multStr);
  if (!Number.isFinite(num)) return 100;
  return Math.round(num * 100);
}

function pctHint(multStr: string) {
  const num = Number(multStr);
  if (!Number.isFinite(num)) return "";
  return `${toPct(multStr)}% del préstamo anterior`;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const orgId = await requireOrgId();
  const sp = await searchParams;
  const saved = sp.saved === "1";

  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId: orgId },
  });

  const s = settings ?? {
    defaultFrequency: "WEEKLY",
    defaultTermCount: 13,
    defaultInterestRatePct: "30.00",

    graceLateDays: 0,
    severeLateDays: 14,

    trendWindowN: 6,
    trendDeltaDays: 2,

    noRenewLatePct: 35,
    reduceLatePct: 20,
    increaseLatePctMax: 10,
    minOnTimePctToIncrease: 90,

    reduceMultiplier: "0.800",
    maintainMultiplier: "1.000",
    increaseMultiplier: "1.200",

    lateFeeFlatAmount: "0.00",
    lateFeePerDayAmount: "0.00",
    maxPenaltyPerInstallment: "0.00",
  } as any;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#1F1F1F]">Ajustes</h1>
          <p className="mt-1 text-sm text-black/55">
            Aquí defines cómo se calculan recomendaciones y reglas de atraso.
          </p>
        </div>

        {saved ? (
          <div className="rounded-xl border border-[#2E7D5B]/20 bg-[#2E7D5B]/10 px-3 py-2 text-sm font-semibold text-[#2E7D5B]">
            Guardado ✅
          </div>
        ) : null}
      </div>

      <form action={updateSettingsAction} className="space-y-4">
        <Card>
          <CardHeader
            title="Defaults (para nuevos préstamos)"
            subtitle="Lo que se rellena por defecto al dar un préstamo."
          />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Frecuencia
                </label>
                <select
                  name="defaultFrequency"
                  defaultValue={String(s.defaultFrequency)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                >
                  <option value="WEEKLY">Semanal</option>
                  <option value="BIWEEKLY">Quincenal</option>
                  <option value="MONTHLY">Mensual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  # Pagos
                </label>
                <input
                  name="defaultTermCount"
                  type="number"
                  min={1}
                  max={200}
                  defaultValue={Number(s.defaultTermCount)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Interés total (%)
                </label>
                <input
                  name="defaultInterestTotalPct"
                  type="number"
                  min={0}
                  max={300}
                  step="0.01"
                  defaultValue={Number(n(s.defaultInterestRatePct))}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
                <p className="mt-2 text-xs text-black/50">
                  Ejemplo: 30% significa cobrar Principal × 1.30 en total.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Reglas de atraso"
            subtitle="Cuándo consideras que un pago ya se atrasó fuerte."
          />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Días de gracia
                </label>
                <input
                  name="graceLateDays"
                  type="number"
                  min={0}
                  max={60}
                  defaultValue={Number(s.graceLateDays)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
                <p className="mt-2 text-xs text-black/50">
                  Si es 0, el atraso cuenta desde el día siguiente al vencimiento.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Atraso fuerte (días)
                </label>
                <input
                  name="severeLateDays"
                  type="number"
                  min={1}
                  max={120}
                  defaultValue={Number(s.severeLateDays)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
                <p className="mt-2 text-xs text-black/50">
                  Si un pago se liquida con más de estos días, se considera “fuerte”.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Cómo detectamos si va mejorando o empeorando"
            subtitle="Ventana y sensibilidad de tendencia."
          />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Últimos N pagos
                </label>
                <input
                  name="trendWindowN"
                  type="number"
                  min={3}
                  max={30}
                  defaultValue={Number(s.trendWindowN)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Cambio mínimo (días)
                </label>
                <input
                  name="trendDeltaDays"
                  type="number"
                  min={1}
                  max={30}
                  defaultValue={Number(s.trendDeltaDays)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
                <p className="mt-2 text-xs text-black/50">
                  Si cambia menos que esto, se considera “va igual”.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recomendación automática (renovar)"
            subtitle="Reglas por % de pagos tarde."
          />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  No renovar desde (%)
                </label>
                <input
                  name="noRenewLatePct"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={Number(s.noRenewLatePct)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Bajarle desde (%)
                </label>
                <input
                  name="reduceLatePct"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={Number(s.reduceLatePct)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Subirle si pagos tarde ≤ (%)
                </label>
                <input
                  name="increaseLatePctMax"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={Number(s.increaseLatePctMax)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Y además a tiempo ≥ (%)
                </label>
                <input
                  name="minOnTimePctToIncrease"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={Number(s.minOnTimePctToIncrease)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3 text-xs text-black/60">
              Ejemplo: si “No renovar desde” es 35%, entonces si 35% o más de sus pagos fueron tarde,
              Limar recomienda “No renovar”.
            </div>
          </CardBody>
        </Card>

        {/* ✅ BLOQUE CORREGIDO Y MÁS EXPLICATIVO */}
        <Card>
          <CardHeader
            title="Monto sugerido al renovar"
            subtitle="Esto define cuánto recomiendas prestar la próxima vez comparado con el préstamo anterior."
          />
          <CardBody>
            <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3 text-sm text-black/70">
              <div className="font-semibold text-[#1F1F1F]">Cómo leerlo</div>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                <li>
                  <b>1.00</b> = prestar lo mismo (100%).
                </li>
                <li>
                  <b>0.80</b> = bajarle (80% del monto anterior).
                </li>
                <li>
                  <b>1.20</b> = subirle (120% del monto anterior).
                </li>
              </ul>
              <div className="mt-3 text-xs text-black/55">
                Ejemplo: si la última vez prestaste <b>$3,000</b>, entonces:
                <b> 0.80 → $2,400</b>, <b>1.00 → $3,000</b>, <b>1.20 → $3,600</b>.
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Si “Bajarle”{" "}
                  <span className="text-black/55">({pctHint(n(s.reduceMultiplier))})</span>
                </label>
                <input
                  name="reduceMultiplier"
                  type="number"
                  step="0.01"
                  min={0.1}
                  max={3}
                  defaultValue={Number(n(s.reduceMultiplier))}
                  placeholder="Ej. 0.80"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
                <p className="mt-2 text-xs text-black/50">
                  Recomendación cuando el cliente trae atrasos moderados.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Si “Mantener”{" "}
                  <span className="text-black/55">({pctHint(n(s.maintainMultiplier))})</span>
                </label>
                <input
                  name="maintainMultiplier"
                  type="number"
                  step="0.01"
                  min={0.1}
                  max={3}
                  defaultValue={Number(n(s.maintainMultiplier))}
                  placeholder="Ej. 1.00"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
                <p className="mt-2 text-xs text-black/50">
                  Recomendación cuando paga bien (o normal).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Si “Subirle”{" "}
                  <span className="text-black/55">({pctHint(n(s.increaseMultiplier))})</span>
                </label>
                <input
                  name="increaseMultiplier"
                  type="number"
                  step="0.01"
                  min={0.1}
                  max={3}
                  defaultValue={Number(n(s.increaseMultiplier))}
                  placeholder="Ej. 1.20"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
                <p className="mt-2 text-xs text-black/50">
                  Recomendación cuando paga puntual y va mejorando.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Multas (opcional)"
            subtitle="MVP: ya están guardadas, aún no las usamos en cálculos."
          />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Multa fija
                </label>
                <input
                  name="lateFeeFlatAmount"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={Number(n(s.lateFeeFlatAmount))}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Multa por día
                </label>
                <input
                  name="lateFeePerDayAmount"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={Number(n(s.lateFeePerDayAmount))}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F1F1F]">
                  Tope por pago
                </label>
                <input
                  name="maxPenaltyPerInstallment"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={Number(n(s.maxPenaltyPerInstallment))}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-2">
          <button className="rounded-xl bg-[#0F2A36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1F28]">
            Guardar ajustes
          </button>
          <a
            href="/dashboard"
            className="rounded-xl border border-[#0F2A36] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
          >
            Volver
          </a>
        </div>
      </form>
    </div>
  );
}
