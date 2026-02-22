// app/(app)/borrowers/[id]/edit/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { updateBorrowerAction, deleteBorrowerAction } from "./server-actions";
import { DeleteBorrowerButton } from "./DeleteBorrowerButton";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F1F1F]">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? <div className="mt-1 text-xs text-black/55">{hint}</div> : null}
    </div>
  );
}

export default async function EditBorrowerPage({
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
      email: true,
      externalRef: true,
      notes: true,
      _count: { select: { loans: true, payments: true } },
    },
  });

  if (!borrower) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <div className="text-sm font-semibold text-[#1F1F1F]">
          No encontrado
        </div>
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

  const canDelete =
    borrower._count.loans === 0 && borrower._count.payments === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F1F1F]">
            Editar deudor
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Ajusta datos de contacto y notas.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/borrowers/${borrower.id}`}
            className="inline-flex rounded-xl border border-[#0F2A36] bg-white px-4 py-2 text-sm font-semibold text-[#0F2A36] hover:bg-black/5"
          >
            Volver al detalle
          </Link>

          {canDelete ? (
            <DeleteBorrowerButton
              borrowerId={borrower.id}
              borrowerName={borrower.fullName}
              deleteBorrowerAction={deleteBorrowerAction}
            />
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader
          title="Datos del deudor"
          subtitle="Lo que guardes aquí se verá en la app."
        />
        <CardBody>
          <form
            action={updateBorrowerAction}
            className="grid gap-4 sm:grid-cols-2"
          >
            <input type="hidden" name="borrowerId" value={borrower.id} />

            <div className="sm:col-span-2">
              <Field label="Nombre completo">
                <input
                  name="fullName"
                  defaultValue={borrower.fullName ?? ""}
                  required
                  maxLength={120}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                  placeholder="Ej. Juan Pérez"
                />
              </Field>
            </div>

            <Field label="Teléfono (opcional)">
              <input
                name="phone"
                defaultValue={borrower.phone ?? ""}
                maxLength={30}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                placeholder="Ej. 3312345678"
              />
            </Field>

            <Field label="Email (opcional)">
              <input
                name="email"
                defaultValue={borrower.email ?? ""}
                maxLength={160}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                placeholder="Ej. correo@dominio.com"
              />
            </Field>

            <Field
              label="Referencia (opcional)"
              hint="Folio, apodo, ID externo, etc."
            >
              <input
                name="externalRef"
                defaultValue={borrower.externalRef ?? ""}
                maxLength={60}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                placeholder="Ej. Cliente-014"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Notas (opcional)">
                <textarea
                  name="notes"
                  defaultValue={borrower.notes ?? ""}
                  rows={4}
                  maxLength={1200}
                  className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F2A36]/60 focus:ring-2 focus:ring-[#0F2A36]/10"
                  placeholder="Escribe algo útil para ti…"
                />
              </Field>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-black/55">
                Préstamos:{" "}
                <span className="font-semibold text-[#1F1F1F]">
                  {borrower._count.loans}
                </span>{" "}
                · Pagos:{" "}
                <span className="font-semibold text-[#1F1F1F]">
                  {borrower._count.payments}
                </span>
              </div>

              <button className="inline-flex w-fit rounded-xl bg-[#0F2A36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B1F28]">
                Guardar cambios
              </button>
            </div>
          </form>
        </CardBody>
      </Card>

      {!canDelete ? (
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/60">
          No puedes eliminar este deudor porque ya tiene préstamos o pagos
          registrados.
        </div>
      ) : null}
    </div>
  );
}
