// app/api/loans/[id]/contract/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { LoanContractPdf } from "@/lib/contracts/LoanContractPdf";

export const runtime = "nodejs";

function mxn(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(n);
}

function frequencyLabel(f: string) {
  switch (f) {
    case "WEEKLY":
      return "Semanal";
    case "BIWEEKLY":
      return "Quincenal";
    case "MONTHLY":
      return "Mensual";
    default:
      return f;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const loan = await prisma.loan.findFirst({
    where: { id, organizationId: u.organizationId, deletedAt: null },
    select: {
      id: true,
      startDate: true,
      frequency: true,
      termCount: true,
      principalAmount: true,
      interestRatePct: true,
      expectedInstallment: true,
      totalExpected: true,
      lateFeeFlatAmount: true,
      lateFeePerDayAmount: true,
      createdAt: true,
      borrower: { select: { fullName: true, phone: true } },
      scheduleItems: {
        where: { deletedAt: null },
        orderBy: { installmentNumber: "asc" },
        select: { installmentNumber: true, dueDate: true, expectedAmount: true },
      },
    },
  });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lenderName = u.email ?? "Prestamista";
  const freqLabel = frequencyLabel(String(loan.frequency));

  const buffer = await renderToBuffer(
    LoanContractPdf({
      lenderName,
      borrowerName: loan.borrower.fullName,
      borrowerPhone: loan.borrower.phone,
      loanId: loan.id,
      startDate: loan.startDate,
      frequencyLabel: freqLabel,
      termCount: loan.termCount,
      principal: mxn(Number(loan.principalAmount)),
      interestRatePct: `${Number(loan.interestRatePct).toFixed(2)}%`,
      expectedInstallment: mxn(Number(loan.expectedInstallment)),
      totalExpected: mxn(Number(loan.totalExpected)),
      lateFeeFlat:
        loan.lateFeeFlatAmount != null ? mxn(Number(loan.lateFeeFlatAmount)) : null,
      lateFeePerDay:
        loan.lateFeePerDayAmount != null ? mxn(Number(loan.lateFeePerDayAmount)) : null,
      place: "México",
      createdAt: loan.createdAt,
      schedule: loan.scheduleItems.map((s) => ({
        installmentNumber: s.installmentNumber,
        dueDate: s.dueDate,
        expectedAmount: mxn(Number(s.expectedAmount)),
      })),
    })
  );

  const fileName = `Contrato-${loan.borrower.fullName
    .replace(/\s+/g, "_")
    .slice(0, 60)}-${loan.id.slice(0, 8)}.pdf`;

  // ✅ Buffer (Node) -> Uint8Array (BodyInit compatible)
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}