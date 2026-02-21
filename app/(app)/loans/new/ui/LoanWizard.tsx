"use client";

import { useMemo, useState } from "react";
import { createLoanAction } from "../server-actions";
import type { LoanFrequency } from "@prisma/client";
import { computeDueDates, computeInstallment } from "@/lib/schedule";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { frequencyLabel, moneyLabel } from "@/lib/ui-labels";

type BorrowerOption = { id: string; fullName: string };

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function LoanWizard({
  borrowers,
  preBorrowerId,
}: {
  borrowers: BorrowerOption[];
  preBorrowerId: string | null;
}) {
  const [borrowerId, setBorrowerId] = useState(
    preBorrowerId ?? borrowers[0]?.id ?? ""
  );

  const [startDate, setStartDate] = useState(todayISO());
  const [frequency, setFrequency] = useState<LoanFrequency>("WEEKLY");
  const [termCount, setTermCount] = useState(13);
  const [principal, setPrincipal] = useState(3000);
  const [interestTotalPct, setInterestTotalPct] = useState(30);

  const preview = useMemo(() => {
    if (!borrowerId || !startDate || termCount < 1 || principal <= 0) return null;

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const { totalExpected, expectedInstallment } = computeInstallment(
      principal,
      interestTotalPct,
      termCount
    );
    const dueDates = computeDueDates(start, frequency, termCount);

    return { totalExpected, expectedInstallment, dueDates };
  }, [borrowerId, startDate, frequency, termCount, principal, interestTotalPct]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-[#1F1F1F]">Dar nuevo préstamo</h1>
        <p className="mt-1 text-sm text-black/55">
          Define el préstamo y revisa el calendario antes de guardarlo.
        </p>
      </div>

      <Card>
        <CardHeader title="1) ¿A quién le prestas?" />
        <CardBody>
          <label className="block text-sm font-medium text-[#1F1F1F]">Deudor</label>
          <select
            value={borrowerId}
            onChange={(e) => setBorrowerId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
          >
            {borrowers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.fullName}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-black/50">
            Si el deudor no aparece, primero agrégalo en “Deudores”.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="2) ¿Cuánto y cómo lo vas a cobrar?" />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#1F1F1F]">Fecha de inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1F1F]">Cada cuándo paga</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as LoanFrequency)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
              >
                <option value="WEEKLY">Semanal</option>
                <option value="BIWEEKLY">Quincenal</option>
                <option value="MONTHLY">Mensual</option>
              </select>
              <p className="mt-2 text-xs text-black/50">
                Seleccionado: {frequencyLabel(String(frequency))}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1F1F]">Número de pagos</label>
              <input
                type="number"
                min={1}
                max={200}
                value={termCount}
                onChange={(e) => setTermCount(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
              />
              <p className="mt-2 text-xs text-black/50">
                Ejemplo: 13 pagos semanales = 13 semanas.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F1F1F]">¿Cuánto le prestas? (MXN)</label>
              <input
                type="number"
                min={1}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1F1F1F]">
                ¿Cuánto ganas en total? (%)
              </label>
              <input
                type="number"
                min={0}
                max={300}
                step="0.01"
                value={interestTotalPct}
                onChange={(e) => setInterestTotalPct(Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
              />
              <p className="mt-2 text-xs text-black/50">
                Ejemplo: 30% significa que si prestas {moneyLabel(principal)}, vas a cobrar {moneyLabel(principal * 1.3)} en total (aprox.).
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="3) Así quedaría el calendario"
          subtitle="Esto es un preview. Al guardar se recalcula igual en el servidor."
        />
        <CardBody>
          {!preview ? (
            <div className="text-sm text-black/55">Completa los datos para ver el calendario.</div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
                  <div className="text-xs text-black/55">Cuota</div>
                  <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {moneyLabel(preview.expectedInstallment)}
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
                  <div className="text-xs text-black/55">Total a cobrar</div>
                  <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                    {moneyLabel(preview.totalExpected)}
                  </div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
                  <div className="text-xs text-black/55">Pagos</div>
                  <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">{termCount}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-black/55">
                      <th className="py-2">#</th>
                      <th className="py-2">Fecha de pago</th>
                      <th className="py-2">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.dueDates.slice(0, 12).map((d, idx) => (
                      <tr key={idx} className="border-t border-black/10">
                        <td className="py-2">{idx + 1}</td>
                        <td className="py-2">{d.toLocaleDateString("es-MX")}</td>
                        <td className="py-2">{moneyLabel(preview.expectedInstallment)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {termCount > 12 ? (
                  <div className="mt-2 text-xs text-black/50">
                    Mostrando 12 de {termCount} pagos.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <form action={createLoanAction} className="flex gap-2">
        <input type="hidden" name="borrowerId" value={borrowerId} />
        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="frequency" value={frequency} />
        <input type="hidden" name="termCount" value={String(termCount)} />
        <input type="hidden" name="principalAmount" value={String(principal)} />
        <input type="hidden" name="interestTotalPct" value={String(interestTotalPct)} />

        <button className="rounded-xl bg-[#0F2A36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1F28]">
          Crear préstamo
        </button>
        <a
          href="/loans"
          className="rounded-xl border border-[#0F2A36] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
        >
          Cancelar
        </a>
      </form>
    </div>
  );
}
