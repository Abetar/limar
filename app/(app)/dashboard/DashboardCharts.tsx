"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
} from "recharts";

type PieItem = { name: string; value: number };

function CardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="text-sm font-semibold text-[#1F1F1F]">{title}</div>
      {subtitle ? <div className="mt-1 text-xs text-black/55">{subtitle}</div> : null}
      <div className="mt-3 h-[240px]">{children}</div>
    </div>
  );
}

function fmtNumber(n: number) {
  return new Intl.NumberFormat("es-MX").format(n);
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-[#1F1F1F]">{p.name}</div>
      <div className="text-black/60">{fmtNumber(p.value)}</div>
    </div>
  );
}

/**
 * Importante:
 * No fijamos colores “random”; usamos tu paleta:
 * - OK: #2E7D5B
 * - Warning: #C88A1A
 * - Risk: #B23A3A
 * - Neutral: #0F2A36 / gris
 */
const COLORS_STATUS = ["#2E7D5B", "#B23A3A"];
const COLORS_FREQ = ["#0F2A36", "#C88A1A", "#D6CBBF"];

export function DashboardCharts({
  carteraEstado,
  frecuencias,
}: {
  carteraEstado: PieItem[]; // [{name,value}]
  frecuencias: PieItem[];
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <CardShell
        title="Estado de tu cartera"
        subtitle="Al corriente vs con atraso (préstamos activos)."
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={carteraEstado}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              stroke="rgba(0,0,0,0.08)"
            >
              {carteraEstado.map((_, i) => (
                <Cell key={i} fill={COLORS_STATUS[i % COLORS_STATUS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardShell>

      <CardShell
        title="Frecuencia de tus préstamos"
        subtitle="Cómo se distribuyen tus préstamos activos."
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={frecuencias}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              stroke="rgba(0,0,0,0.08)"
            >
              {frecuencias.map((_, i) => (
                <Cell key={i} fill={COLORS_FREQ[i % COLORS_FREQ.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardShell>
    </div>
  );
}