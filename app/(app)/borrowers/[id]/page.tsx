// app/(app)/borrowers/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { conclusionLabel, trendLabel, frequencyLabel } from "@/lib/ui-labels";

function mxn(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(d?: Date | null) {
  return d ? new Date(d).toLocaleDateString("es-MX") : "—";
}

function badgeClass(conclusion: string) {
  if (conclusion === "NO_RENOVAR")
    return "bg-[#B23A3A]/10 text-[#B23A3A] border-[#B23A3A]/20";
  if (conclusion === "REDUCIR")
    return "bg-[#C88A1A]/10 text-[#C88A1A] border-[#C88A1A]/20";
  return "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20";
}

export default async function BorrowerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const orgId = await requireOrgId();
  const { id } = await params;

  const borrower = await prisma.borrower.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: {
      id: true,
      fullName: true,
      phone: true,
      externalRef: true,
      notes: true,
      loans: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          principalAmount: true,
          expectedInstallment: true,
          frequency: true,
          termCount: true,
          nextDueDate: true,
        },
      },
      riskSnapshots: {
        where: { scope: "BORROWER" },
        orderBy: { asOfDate: "desc" },
        take: 1,
        select: {
          conclusion: true,
          suggestedLimit: true,
          pagosTardePct: true,
          atrasoPromedioDias: true,
          trend: true,
        },
      },
    },
  });

  if (!borrower) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <div className="text-sm font-semibold text-[#1F1F1F]">No encontrado</div>
        <div className="mt-1 text-sm text-black/55">
          Este deudor no existe (o no es de tu cuenta).
        </div>
        <Link
          href="/borrowers"
          className="mt-4 inline-flex rounded-xl border border-[#0F2A36] bg-white px-4 py-2 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
        >
          Volver
        </Link>
      </div>
    );
  }

  const snap = borrower.riskSnapshots[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F1F1F]">{borrower.fullName}</h1>
          <p className="mt-1 text-sm text-black/55">
            {borrower.phone ?? "—"} · Ref: {borrower.externalRef ?? "—"}
          </p>

          {borrower.notes ? (
            <p className="mt-2 max-w-3xl text-sm text-black/55">{borrower.notes}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={`/borrowers/${borrower.id}/edit`}
            className="inline-flex w-fit rounded-xl border border-[#0F2A36] bg-white px-4 py-2 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
          >
            Editar deudor
          </Link>

          <Link
            href={`/loans/new?borrowerId=${borrower.id}`}
            className="inline-flex w-fit rounded-xl bg-[#0F2A36] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B1F28]"
          >
            + Nuevo préstamo
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader title="Cómo va pagando" subtitle="Esto se actualiza cuando registras pagos." />
        <CardBody>
          {!snap ? (
            <div className="text-sm text-black/55">Aún no hay historial suficiente.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
                <div className="text-xs text-black/55">Recomendación</div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                      String(snap.conclusion)
                    )}`}
                  >
                    {conclusionLabel(String(snap.conclusion))}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
                <div className="text-xs text-black/55">Pagos tarde</div>
                <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                  {snap.pagosTardePct}%
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
                <div className="text-xs text-black/55">Atraso promedio</div>
                <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                  {snap.atrasoPromedioDias} días
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
                <div className="text-xs text-black/55">Tendencia</div>
                <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                  {trendLabel(String(snap.trend))}
                </div>
              </div>

              <div className="sm:col-span-4 rounded-2xl border border-black/10 bg-white p-3">
                <div className="text-xs text-black/55">Límite sugerido (si renuevas)</div>
                <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                  {mxn(Number(snap.suggestedLimit ?? 0))}
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Préstamos"
          subtitle="Entra a cualquier préstamo para ver calendario y registrar pagos."
        />
        <CardBody>
          {borrower.loans.length === 0 ? (
            <div className="text-sm text-black/55">Aún no tiene préstamos.</div>
          ) : (
            <div className="space-y-2">
              {borrower.loans.map((l) => (
                <Link
                  key={l.id}
                  href={`/loans/${l.id}`}
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 hover:bg-black/5"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#1F1F1F]">
                      {frequencyLabel(String(l.frequency))} · {l.termCount} pagos
                    </div>
                    <div className="mt-1 text-xs text-black/55">
                      Cuota: {mxn(Number(l.expectedInstallment))} · Próximo pago:{" "}
                      {fmtDate(l.nextDueDate)}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-[#0F2A36]">
                    {mxn(Number(l.principalAmount))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}