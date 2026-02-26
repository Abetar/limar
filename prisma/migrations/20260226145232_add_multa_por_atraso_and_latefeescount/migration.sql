-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "multaPorAtraso" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "lateFeesCount" INTEGER NOT NULL DEFAULT 0;
