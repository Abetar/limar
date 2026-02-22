import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DashboardCharts } from "./DashboardCharts";

function mxn(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(n);
}

function conclusionLabel(conclusion: string) {
  switch (conclusion) {
    case "NO_RENOVAR":
      return "No renovar";
    case "REDUCIR":
      return "Bajarle";
    case "MANTENER":
      return "Mantener";
    case "AUMENTAR":
      return "Subirle";
    default:
      return conclusion;
  }
}

function trendLabel(trend: string) {
  switch (trend) {
    case "IMPROVING":
      return "Va mejorando";
    case "STABLE":
      return "Va igual";
    case "WORSENING":
      return "Va empeorando";
    default:
      return trend;
  }
}

function badgeClass(conclusion: string) {
  if (conclusion === "NO_RENOVAR")
    return "bg-[#B23A3A]/10 text-[#B23A3A] border-[#B23A3A]/20";
  if (conclusion === "REDUCIR")
    return "bg-[#C88A1A]/10 text-[#C88A1A] border-[#C88A1A]/20";
  return "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/20";
}

export default async function DashboardPage() {
  const orgId = await requireOrgId();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // KPI 1: Prestado en la calle (principal de préstamos activos)
  const carteraTotalAgg = await prisma.loan.aggregate({
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
    _sum: { principalAmount: true },
  });

  // KPI 2: Por cobrar (aprox.): totalExpected - pagos POSTED
  const totalExpectedAgg = await prisma.loan.aggregate({
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
    _sum: { totalExpected: true },
  });

  const paidAgg = await prisma.payment.aggregate({
    where: { organizationId: orgId, deletedAt: null, status: "POSTED" },
    _sum: { amount: true },
  });

  const prestadoEnLaCalle = Number(carteraTotalAgg._sum.principalAmount ?? 0);
  const totalExpected = Number(totalExpectedAgg._sum.totalExpected ?? 0);
  const totalPagado = Number(paidAgg._sum.amount ?? 0);
  const porCobrarAprox = Math.max(0, totalExpected - totalPagado);

  // KPI 3: Préstamos con pagos vencidos
  const prestamosConVencidos = await prisma.loan.count({
    where: {
      organizationId: orgId,
      deletedAt: null,
      status: "ACTIVE",
      scheduleItems: {
        some: {
          deletedAt: null,
          OR: [
            { status: "MISSED" },
            { status: { in: ["PENDING", "PARTIAL"] }, dueDate: { lt: today } },
          ],
        },
      },
    },
  });

  // KPI 4: Ya casi terminan (<= 2 pagos restantes)
  const loansActive = await prisma.loan.findMany({
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
    select: {
      id: true,
      scheduleItems: {
        where: {
          deletedAt: null,
          status: { in: ["PENDING", "PARTIAL", "MISSED"] },
        },
        select: { id: true },
      },
    },
    take: 300,
  });

  const yaCasiTerminan = loansActive.filter((l) => l.scheduleItems.length <= 2).length;

  // Quién va más atrasado (último snapshot BORROWER por deudor)
  const latestBorrowerSnap = await prisma.riskSnapshot.groupBy({
    by: ["borrowerId"],
    where: { organizationId: orgId, scope: "BORROWER", borrowerId: { not: null } },
    _max: { asOfDate: true },
  });

  const pairs = latestBorrowerSnap
    .filter((x) => x.borrowerId && x._max.asOfDate)
    .map((x) => ({ borrowerId: x.borrowerId!, asOfDate: x._max.asOfDate! }));

  const topMorosos =
    pairs.length === 0
      ? []
      : await prisma.riskSnapshot.findMany({
          where: {
            organizationId: orgId,
            scope: "BORROWER",
            OR: pairs.map((p) => ({ borrowerId: p.borrowerId, asOfDate: p.asOfDate })),
          },
          orderBy: [{ pagosTardePct: "desc" }, { atrasoPromedioDias: "desc" }],
          take: 5,
          include: { borrower: true },
        });

  // =========================
  // Charts data (server -> client)
  // =========================

  // Donut A: cartera al corriente vs con atraso (por préstamo activo)
  const totalActivos = await prisma.loan.count({
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
  });

  const conAtraso = prestamosConVencidos;
  const alCorriente = Math.max(0, totalActivos - conAtraso);

  const carteraEstado = [
    { name: "Al corriente", value: alCorriente },
    { name: "Con atraso", value: conAtraso },
  ];

  // Donut B: préstamos activos por frecuencia
  const byFrequency = await prisma.loan.groupBy({
    by: ["frequency"],
    where: { organizationId: orgId, deletedAt: null, status: "ACTIVE" },
    _count: { _all: true },
  });

  const freqLabel = (f: string) => {
    if (f === "WEEKLY") return "Semanal";
    if (f === "BIWEEKLY") return "Quincenal";
    if (f === "MONTHLY") return "Mensual";
    return f;
  };

  const frecuencias = (byFrequency ?? [])
    .map((x) => ({ name: freqLabel(String(x.frequency)), value: x._count._all }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F1F1F]">Resumen</h1>
        <p className="mt-1 text-sm text-black/55">
          Lo más importante: cuánto está prestado, cuánto falta por cobrar y quién va atrasado.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Prestado en la calle</div>
            <div className="mt-2 text-2xl font-semibold text-[#1F1F1F]">
              {mxn(prestadoEnLaCalle)}
            </div>
            <div className="mt-2 text-xs text-black/50">
              Suma de lo prestado en préstamos activos.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Por cobrar (aprox.)</div>
            <div className="mt-2 text-2xl font-semibold text-[#1F1F1F]">
              {mxn(porCobrarAprox)}
            </div>
            <div className="mt-2 text-xs text-black/50">
              Total esperado menos lo ya pagado.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Pagos vencidos</div>
            <div className="mt-2 text-2xl font-semibold text-[#1F1F1F]">
              {prestamosConVencidos}
            </div>
            <div className="mt-2 text-xs text-black/50">
              Préstamos que ya traen pagos atrasados.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-xs text-black/55">Ya casi terminan</div>
            <div className="mt-2 text-2xl font-semibold text-[#1F1F1F]">
              {yaCasiTerminan}
            </div>
            <div className="mt-2 text-xs text-black/50">
              2 pagos o menos por cubrir.
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts carteraEstado={carteraEstado} frecuencias={frecuencias} />

      <Card>
        <CardHeader
          title="Quién va más atrasado"
          subtitle="Se actualiza cuando registras pagos."
        />
        <CardBody>
          {topMorosos.length === 0 ? (
            <div className="text-sm text-black/55">
              Aún no hay métricas. Registra pagos y esto se llenará solo.
            </div>
          ) : (
            <div className="space-y-2">
              {topMorosos.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#1F1F1F]">
                      {s.borrower?.fullName ?? "Deudor"}
                    </div>
                    <div className="mt-1 text-xs text-black/55">
                      Pagos tarde: {s.pagosTardePct}% · Atraso promedio:{" "}
                      {s.atrasoPromedioDias} días · {trendLabel(String(s.trend))}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                      String(s.conclusion)
                    )}`}
                  >
                    {conclusionLabel(String(s.conclusion))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}