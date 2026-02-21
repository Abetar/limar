// app/(app)/borrowers/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { conclusionLabel, trendLabel } from "@/lib/ui-labels";

function badgeClass(conclusion: string) {
  if (conclusion === "NO_RENOVAR")
    return "bg-[#B23A3A]/10 text-[#B23A3A] border-[#B23A3A]/20";
  if (conclusion === "REDUCIR")
    return "bg-[#C88A1A]/10 text-[#C88A1A] border-[#C88A1A]/20";
  return "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20";
}

export default async function BorrowersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const orgId = await requireOrgId();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const borrowers = await prisma.borrower.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { externalRef: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      fullName: true,
      phone: true,
      externalRef: true,
      // último snapshot BORROWER
      riskSnapshots: {
        where: { scope: "BORROWER" },
        orderBy: { asOfDate: "desc" },
        take: 1,
        select: {
          conclusion: true,
          pagosTardePct: true,
          atrasoPromedioDias: true,
          trend: true,
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F1F1F]">Deudores</h1>
          <p className="mt-1 text-sm text-black/55">
            Aquí ves a tus clientes y quién trae más atraso.
          </p>
        </div>

        <Link
          href="/borrowers/new"
          className="inline-flex w-fit rounded-xl bg-[#0F2A36] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B1F28]"
        >
          + Agregar deudor
        </Link>
      </div>

      <Card>
        <CardHeader title="Buscar" subtitle="Nombre, teléfono o referencia." />
        <CardBody>
          <form className="flex gap-2" action="/borrowers" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Ej. Juan Pérez / 811..."
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
            />
            <button className="rounded-xl bg-[#0F2A36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1F28]">
              Buscar
            </button>
            {q ? (
              <Link
                href="/borrowers"
                className="rounded-xl border border-[#0F2A36] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
              >
                Limpiar
              </Link>
            ) : null}
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={`Resultados (${borrowers.length})`} />
        <CardBody>
          {borrowers.length === 0 ? (
            <div className="text-sm text-black/55">
              {q ? "No encontré a nadie con esa búsqueda." : "Aún no tienes deudores."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-black/55">
                    <th className="py-2">Deudor</th>
                    <th className="py-2">Contacto</th>
                    <th className="py-2">Cómo va pagando</th>
                    <th className="py-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowers.map((b) => {
                    const snap = b.riskSnapshots[0];
                    return (
                      <tr key={b.id} className="border-t border-black/10">
                        <td className="py-3">
                          <div className="font-semibold text-[#1F1F1F]">{b.fullName}</div>
                          <div className="text-xs text-black/55">
                            Ref: {b.externalRef ?? "—"}
                          </div>
                        </td>

                        <td className="py-3">
                          <div>{b.phone ?? "—"}</div>
                        </td>

                        <td className="py-3">
                          {!snap ? (
                            <span className="text-xs text-black/55">
                              Sin historial todavía
                            </span>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                                  String(snap.conclusion)
                                )}`}
                              >
                                {conclusionLabel(String(snap.conclusion))}
                              </span>

                              <span className="text-xs text-black/55">
                                Pagos tarde: {snap.pagosTardePct}% · Atraso prom:{" "}
                                {snap.atrasoPromedioDias} días ·{" "}
                                {trendLabel(String(snap.trend))}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3">
                          <Link
                            className="text-[#0F2A36] font-semibold hover:underline"
                            href={`/borrowers/${b.id}`}
                          >
                            Ver ficha
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
