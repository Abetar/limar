// app/(app)/borrowers/[id]/edit/DeleteBorrowerButton.tsx
"use client";

import { useRef } from "react";

type Props = {
  borrowerId: string;
  borrowerName: string;
  deleteBorrowerAction: (formData: FormData) => Promise<void>;
};

export function DeleteBorrowerButton({ borrowerId, borrowerName, deleteBorrowerAction }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex rounded-xl bg-[#B23A3A] px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
      >
        Eliminar
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl p-0 backdrop:bg-black/40"
      >
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <div className="text-lg font-semibold text-[#1F1F1F]">¿Eliminar deudor?</div>
          <p className="mt-2 text-sm text-black/60">
            Esto lo marca como eliminado (soft delete). No se puede deshacer.
          </p>

          <div className="mt-3 rounded-2xl border border-black/10 bg-[#D6CBBF]/20 p-3">
            <div className="text-xs text-black/55">Se eliminará</div>
            <div className="mt-1 text-sm font-semibold text-[#1F1F1F]">{borrowerName}</div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-xl border border-black/20 bg-white px-4 py-2 text-sm font-semibold text-[#1F1F1F] hover:bg-black/5"
            >
              Cancelar
            </button>

            <form action={deleteBorrowerAction}>
              <input type="hidden" name="borrowerId" value={borrowerId} />
              <button
                className="rounded-xl bg-[#B23A3A] px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                Confirmar eliminación
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}