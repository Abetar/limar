// app/(app)/loans/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { frequencyLabel, moneyLabel } from "@/lib/ui-labels";

function fmtDate(d?: Date | null) {
  return d ? new Date(d).toLocaleDateString("es-MX") : "—";
}

type Filter = "activos" | "vencidos" | "por_terminar";

function pill(kind: "risk" | "warning" | "neutral") {
  if (kind === "risk") return "bg-[#B23A3A]/10 text-[#B23A3A] border-[#B23A3A]/20";
  if (kind === "warning") return "bg-[#C88A1A]/10 text-[#C88A1A] border-[#C88A1A]/20";
  return "bg-black/5 text-black/70 border-black/10";
}

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; f?: Filter }>;
}) {
  const orgId = await requireOrgId();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const f: Filter = (sp.f ?? "activos") as Filter;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const whereBase: any = {
    organizationId: orgId,
    deletedAt: null,
    status: "ACTIVE",
  };

  if (q) {
    whereBase.borrower = { fullName: { contains: q, mode: "insensitive" } };
  }

  if (f === "vencidos") {
    whereBase.scheduleItems = {
      some: {
        deletedAt: null,
        OR: [
          { status: "MISSED" },
          { status: { in: ["PENDING", "PARTIAL"] }, dueDate: { lt: today } },
        ],
      },
    };
  }

  const loans = await prisma.loan.findMany({
    where: whereBase,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      borrower: { select: { id: true, fullName: true } },
      principalAmount: true,
      expectedInstallment: true,
      nextDueDate: true,
      termCount: true,
      frequency: true,
      scheduleItems: {
        where: {
          deletedAt: null,
          status: { in: ["PENDING", "PARTIAL", "MISSED"] },
        },
        select: { id: true, status: true, dueDate: true },
      },
    },
  });

  // Por terminar = <=2 pagos por cubrir
  const filtered = f === "por_terminar" ? loans.filter((l) => l.scheduleItems.length <= 2) : loans;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F1F1F]">Préstamos</h1>
          <p className="mt-1 text-sm text-black/55">
            Aquí encuentras rápido los que están al corriente, vencidos o ya casi terminan.
          </p>
        </div>

        <Link
          href="/loans/new"
          className="inline-flex w-fit rounded-xl bg-[#0F2A36] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B1F28]"
        >
          + Dar nuevo préstamo
        </Link>
      </div>

      <Card>
        <CardHeader title="Buscar y filtrar" subtitle="Busca por nombre del deudor y aplica un filtro." />
        <CardBody>
          <form className="flex flex-col gap-2 sm:flex-row sm:items-center" action="/loans" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por deudor…"
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
            />

            <select
              name="f"
              defaultValue={f}
              className="w-full sm:w-60 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
            >
              <option value="activos">Al corriente</option>
              <option value="vencidos">Con pagos vencidos</option>
              <option value="por_terminar">Ya casi terminan</option>
            </select>

            <div className="flex gap-2">
              <button className="rounded-xl bg-[#0F2A36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1F28]">
                Aplicar
              </button>
              {(q || f !== "activos") && (
                <Link
                  href="/loans"
                  className="rounded-xl border border-[#0F2A36] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
                >
                  Limpiar
                </Link>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`Resultados (${filtered.length})`} />
        <CardBody>
          {filtered.length === 0 ? (
            <div className="text-sm text-black/55">
              No hay préstamos que coincidan con ese filtro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-black/55">
                    <th className="py-2">Deudor</th>
                    <th className="py-2">Prestado</th>
                    <th className="py-2">Cuota</th>
                    <th className="py-2">Pagos por cubrir</th>
                    <th className="py-2">Próximo pago</th>
                    <th className="py-2">Estado rápido</th>
                    <th className="py-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => {
                    const remaining = l.scheduleItems.length;

                    // Estado rápido: si tiene MISSED o ya venció algo -> "Vencido", si remaining<=2 -> "Ya casi", si no -> "Al corriente"
                    const hasMissed = l.scheduleItems.some((x) => x.status === "MISSED");
                    const hasOverdue = l.scheduleItems.some(
                      (x) => (x.status === "PENDING" || x.status === "PARTIAL") && new Date(x.dueDate) < today
                    );

                    const quick =
                      hasMissed || hasOverdue
                        ? { text: "Trae atraso", kind: "risk" as const }
                        : remaining <= 2
                        ? { text: "Ya casi termina", kind: "warning" as const }
                        : { text: "Al corriente", kind: "neutral" as const };

                    return (
                      <tr key={l.id} className="border-t border-black/10">
                        <td className="py-3">
                          <div className="font-semibold text-[#1F1F1F]">
                            <Link className="text-[#0F2A36] hover:underline" href={`/borrowers/${l.borrower.id}`}>
                              {l.borrower.fullName}
                            </Link>
                          </div>
                          <div className="text-xs text-black/55">
                            {frequencyLabel(String(l.frequency))} · {l.termCount} pagos
                          </div>
                        </td>

                        <td className="py-3">{moneyLabel(Number(l.principalAmount))}</td>
                        <td className="py-3">{moneyLabel(Number(l.expectedInstallment))}</td>
                        <td className="py-3">{remaining}</td>
                        <td className="py-3">{fmtDate(l.nextDueDate)}</td>

                        <td className="py-3">
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${pill(quick.kind)}`}>
                            {quick.text}
                          </span>
                        </td>

                        <td className="py-3">
                          <Link className="text-[#0F2A36] font-semibold hover:underline" href={`/loans/${l.id}`}>
                            Ver detalle
                          </Link>
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
    </div>
  );
}
