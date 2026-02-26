// app/(app)/loans/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { registerPaymentAction, deleteLoanAction } from "./server-actions";
import { DeleteLoanButton } from "./DeleteLoanButton";
import {
  conclusionLabel,
  trendLabel,
  frequencyLabel,
  scheduleStatusLabel,
  moneyLabel,
} from "@/lib/ui-labels";

function fmtDate(d?: Date | null) {
  return d ? new Date(d).toLocaleDateString("es-MX") : "—";
}

function badgeClassConclusion(conclusion: string) {
  if (conclusion === "NO_RENOVAR")
    return "bg-[#B23A3A]/10 text-[#B23A3A] border-[#B23A3A]/20";
  if (conclusion === "REDUCIR")
    return "bg-[#C88A1A]/10 text-[#C88A1A] border-[#C88A1A]/20";
  return "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20";
}

function badgeClassSchedule(status: string) {
  if (status === "PAID")
    return "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20";
  if (status === "PARTIAL")
    return "bg-[#C88A1A]/10 text-[#C88A1A] border-[#C88A1A]/20";
  if (status === "MISSED")
    return "bg-[#B23A3A]/10 text-[#B23A3A] border-[#B23A3A]/20";
  return "bg-black/5 text-black/70 border-black/10";
}

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orgId = await requireOrgId();

  const loan = await prisma.loan.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: {
      borrower: { select: { id: true, fullName: true } },
      scheduleItems: {
        where: { deletedAt: null },
        orderBy: { installmentNumber: "asc" },
        select: {
          id: true,
          installmentNumber: true,
          dueDate: true,
          expectedAmount: true,
          paidAmount: true,
          status: true,
          paidAt: true,
          lateDays: true,
        },
      },
      payments: {
        where: { deletedAt: null, status: "POSTED" },
        select: {
          id: true,
          amount: true,
          paidAt: true,
          lateFeesCount: true, // ✅ para multas manuales
        },
        orderBy: { paidAt: "desc" },
        take: 10,
      },
      riskSnapshots: {
        where: { scope: "LOAN" },
        orderBy: { asOfDate: "desc" },
        take: 1,
      },
    },
  });

  if (!loan) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <div className="text-sm font-semibold text-[#1F1F1F]">No encontrado</div>
        <div className="mt-1 text-sm text-black/55">
          Este préstamo no existe (o no es de tu cuenta).
        </div>
        <Link
          href="/loans"
          className="mt-4 inline-flex rounded-xl border border-[#0F2A36] bg-white px-4 py-2 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
        >
          Volver
        </Link>
      </div>
    );
  }

  const snap = loan.riskSnapshots[0];
  const principal = Number(loan.principalAmount);
  const cuota = Number(loan.expectedInstallment);
  const totalExpected = Number(loan.totalExpected);

  // ✅ Multa configurada en el préstamo (manual, no por fecha)
  const multaPorAtraso = Number((loan as any).multaPorAtraso ?? 0);

  // ✅ Pagos + multas manuales (capturadas por el usuario)
  const totalPaid = loan.payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const totalMultasCount = loan.payments.reduce(
    (acc, p) => acc + Number((p as any).lateFeesCount ?? 0),
    0
  );
  const totalMultas = multaPorAtraso > 0 ? totalMultasCount * multaPorAtraso : 0;

  // ✅ Total esperado + multas acumuladas (no reemplaza interés, solo suma)
  const totalConMultas = totalExpected + totalMultas;
  const remainingEst = Math.max(0, totalConMultas - totalPaid);

  const canDelete = true;
  const pdfHref = `/api/loans/${loan.id}/contract`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F1F1F]">
            Detalle del préstamo
          </h1>
          <p className="mt-1 text-sm text-black/55">
            <Link
              className="font-semibold text-[#0F2A36] hover:underline"
              href={`/borrowers/${loan.borrower.id}`}
            >
              {loan.borrower.fullName}
            </Link>{" "}
            · {frequencyLabel(String(loan.frequency))} · {loan.termCount} pagos
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={pdfHref}
            className="inline-flex items-center rounded-xl border border-[#0F2A36] bg-white px-4 py-2 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
          >
            Descargar contrato (PDF)
          </a>

          {canDelete ? (
            <DeleteLoanButton
              loanId={loan.id}
              borrowerName={loan.borrower.fullName}
              deleteLoanAction={deleteLoanAction}
            />
          ) : null}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Prestado</div>
            <div className="mt-1 text-lg font-semibold text-[#1F1F1F]">
              {moneyLabel(principal)}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Cuota</div>
            <div className="mt-1 text-lg font-semibold text-[#1F1F1F]">
              {moneyLabel(cuota)}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Total esperado</div>
            <div className="mt-1 text-lg font-semibold text-[#1F1F1F]">
              {moneyLabel(totalExpected)}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Falta (aprox.)</div>
            <div className="mt-1 text-lg font-semibold text-[#1F1F1F]">
              {moneyLabel(remainingEst)}
            </div>
            {multaPorAtraso > 0 ? (
              <div className="mt-1 text-xs text-black/55">
                Incluye multas: {moneyLabel(totalMultas)} ({totalMultasCount} atraso(s) ×{" "}
                {moneyLabel(multaPorAtraso)})
              </div>
            ) : (
              <div className="mt-1 text-xs text-black/55">Sin multas configuradas.</div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Registrar pago */}
      <Card>
        <CardHeader
          title="Registrar pago"
          subtitle="Se aplica a los pagos más viejos primero (FIFO)."
        />
        <CardBody>
          <form action={registerPaymentAction} className="grid gap-3 sm:grid-cols-6">
            <input type="hidden" name="loanId" value={loan.id} />

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1F1F1F]">
                Fecha
              </label>
              <input
                type="date"
                name="paidAt"
                required
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1F1F1F]">
                Monto
              </label>
              <input
                type="number"
                name="amount"
                min={1}
                step="0.01"
                required
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
              />
            </div>

            {/* ✅ Multas manuales: no se calculan por fecha */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-[#1F1F1F]">
                Multas
              </label>
              <input
                type="number"
                name="lateFeesCount"
                min={0}
                step={1}
                defaultValue={0}
                disabled={!(multaPorAtraso > 0)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none disabled:bg-black/5"
              />
              <div className="mt-1 text-xs text-black/50">
                {multaPorAtraso > 0 ? `× ${moneyLabel(multaPorAtraso)}` : "Configura multa en el préstamo"}
              </div>
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button className="w-full rounded-xl bg-[#0F2A36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1F28]">
                Registrar
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Calendario */}
      <Card>
        <CardHeader
          title="Pagos del calendario"
          subtitle="Pagado, abonado, pendiente o vencido."
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-black/55">
                  <th className="py-2">#</th>
                  <th className="py-2">Vence</th>
                  <th className="py-2">Se esperaba</th>
                  <th className="py-2">Lleva pagado</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2">Se pagó</th>
                  <th className="py-2">Atraso</th>
                </tr>
              </thead>
              <tbody>
                {loan.scheduleItems.map((s) => (
                  <tr key={s.id} className="border-t border-black/10">
                    <td className="py-2">{s.installmentNumber}</td>
                    <td className="py-2">{fmtDate(s.dueDate)}</td>
                    <td className="py-2">{moneyLabel(Number(s.expectedAmount))}</td>
                    <td className="py-2">{moneyLabel(Number(s.paidAmount))}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClassSchedule(
                          String(s.status)
                        )}`}
                      >
                        {scheduleStatusLabel(String(s.status))}
                      </span>
                    </td>
                    <td className="py-2">{fmtDate(s.paidAt)}</td>
                    <td className="py-2">
                      {s.lateDays != null ? `${s.lateDays} días` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Historial de pagos */}
      <Card>
        <CardHeader title="Pagos registrados" subtitle="Últimos movimientos del préstamo." />
        <CardBody>
          {loan.payments.length === 0 ? (
            <div className="text-sm text-black/55">Aún no hay pagos registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-black/55">
                    <th className="py-2">Fecha</th>
                    <th className="py-2">Monto</th>
                    <th className="py-2">Multas</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.payments.map((p) => {
                    const c = Number((p as any).lateFeesCount ?? 0);
                    const fees = multaPorAtraso > 0 ? c * multaPorAtraso : 0;

                    return (
                      <tr key={p.id} className="border-t border-black/10">
                        <td className="py-2">{fmtDate(p.paidAt)}</td>
                        <td className="py-2">{moneyLabel(Number(p.amount))}</td>
                        <td className="py-2">
                          {multaPorAtraso > 0 ? (
                            c > 0 ? (
                              <span className="text-black/70">
                                {c} × {moneyLabel(multaPorAtraso)} ={" "}
                                <span className="font-semibold text-[#1F1F1F]">
                                  {moneyLabel(fees)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-black/50">0</span>
                            )
                          ) : (
                            <span className="text-black/50">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Snapshot (RESTAURADO COMPLETO) */}
      <Card>
        <CardHeader
          title="Recomendación (para renovar)"
          subtitle="Reglas automáticas según historial de pagos."
        />
        <CardBody>
          {!snap ? (
            <div className="text-sm text-black/55">
              Aún no hay suficiente historial para recomendar.
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-black/55">
                <div className="text-xs text-black/55">Recomendación</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClassConclusion(
                      String(snap.conclusion)
                    )}`}
                  >
                    {conclusionLabel(String(snap.conclusion))}
                  </span>
                </div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-black/55">Límite sugerido</div>
                <div className="mt-1 font-semibold text-[#1F1F1F]">
                  {moneyLabel(Number(snap.suggestedLimit))}
                </div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-black/55">Pagos tarde</div>
                <div className="mt-1 font-semibold text-[#1F1F1F]">
                  {snap.pagosTardePct}%
                </div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-black/55">Atraso promedio</div>
                <div className="mt-1 font-semibold text-[#1F1F1F]">
                  {snap.atrasoPromedioDias} días
                </div>
              </div>

              <div className="text-sm">
                <div className="text-xs text-black/55">Tendencia</div>
                <div className="mt-1 font-semibold text-[#1F1F1F]">
                  {trendLabel(String(snap.trend))}
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}