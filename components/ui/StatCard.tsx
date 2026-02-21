// components/ui/StatCard.tsx
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <div className="px-5 py-4">
        <div className="text-xs font-medium text-black/55">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-brand-text">{value}</div>
        {hint ? <div className="mt-2 text-xs text-black/50">{hint}</div> : null}
      </div>
    </Card>
  );
}
