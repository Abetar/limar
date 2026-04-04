// app/api/loans/[id]/pagare/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { PagarePdf } from "@/lib/contracts/PagarePdf";

export const runtime = "nodejs";

function numberToSpanishWords(num: number): string {
  // versión simple (suficiente para MVP)
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  return formatter.format(num);
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
      totalExpected: true,
      createdAt: true,
      borrower: {
        select: {
          fullName: true,
          phone: true,
        },
      },
      scheduleItems: {
        where: { deletedAt: null },
        orderBy: { installmentNumber: "desc" },
        take: 1,
        select: {
          dueDate: true,
        },
      },
    },
  });

  if (!loan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lenderName = u.email ?? "Prestamista";

  const total = Number(loan.totalExpected);

  const dueDate =
    loan.scheduleItems[0]?.dueDate ?? loan.startDate;

  const buffer = await renderToBuffer(
    PagarePdf({
      lenderName,
      borrowerName: loan.borrower.fullName,
      borrowerPhone: loan.borrower.phone,
      amountNumber: total,
      amountText: numberToSpanishWords(total),
      place: "México",
      createdAt: loan.createdAt,
      dueDate,
    })
  );

  const fileName = `Pagare-${loan.borrower.fullName
    .replace(/\s+/g, "_")
    .slice(0, 60)}-${loan.id.slice(0, 8)}.pdf`;

  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}