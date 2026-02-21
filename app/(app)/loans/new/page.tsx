import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import LoanWizard from "./ui/LoanWizard";

export default async function NewLoanPage({
  searchParams,
}: {
  searchParams: Promise<{ borrowerId?: string }>;
}) {
  const sp = await searchParams;
  const preBorrowerId = sp.borrowerId ?? null;

  const orgId = await requireOrgId();

  const borrowers = await prisma.borrower.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true },
    take: 200,
  });

  return (
    <LoanWizard borrowers={borrowers} preBorrowerId={preBorrowerId} />
  );
}
