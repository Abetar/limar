/*
  Warnings:

  - The values [HARDHIP] on the enum `RestructureReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RestructureReason_new" AS ENUM ('CUSTOMER_REQUEST', 'HARDSHIP', 'COLLECTION', 'OTHER');
ALTER TABLE "public"."LoanRestructure" ALTER COLUMN "reason" DROP DEFAULT;
ALTER TABLE "LoanRestructure" ALTER COLUMN "reason" TYPE "RestructureReason_new" USING ("reason"::text::"RestructureReason_new");
ALTER TYPE "RestructureReason" RENAME TO "RestructureReason_old";
ALTER TYPE "RestructureReason_new" RENAME TO "RestructureReason";
DROP TYPE "public"."RestructureReason_old";
ALTER TABLE "LoanRestructure" ALTER COLUMN "reason" SET DEFAULT 'OTHER';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "organizationId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Borrower_organizationId_deletedAt_idx" ON "Borrower"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "ContractDocument_organizationId_deletedAt_idx" ON "ContractDocument"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "Loan_organizationId_deletedAt_idx" ON "Loan"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "Loan_organizationId_status_deletedAt_idx" ON "Loan"("organizationId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "LoanRestructure_organizationId_deletedAt_idx" ON "LoanRestructure"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Payment_organizationId_deletedAt_idx" ON "Payment"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "PaymentSchedule_organizationId_deletedAt_idx" ON "PaymentSchedule"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "Penalty_organizationId_deletedAt_idx" ON "Penalty"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "User_organizationId_deletedAt_idx" ON "User"("organizationId", "deletedAt");
