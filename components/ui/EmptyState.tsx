// components/ui/EmptyState.tsx
import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white px-5 py-6">
      <div className="text-sm font-semibold text-brand-text">{title}</div>
      <div className="mt-1 text-sm text-black/55">{description}</div>

      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primaryHover"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
