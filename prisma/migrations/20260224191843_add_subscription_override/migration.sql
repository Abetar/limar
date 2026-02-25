-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "subscriptionOverride" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionOverrideAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionOverrideReason" TEXT;

-- CreateIndex
CREATE INDEX "Organization_subscriptionOverride_idx" ON "Organization"("subscriptionOverride");
