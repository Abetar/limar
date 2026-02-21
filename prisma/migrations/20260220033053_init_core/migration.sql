-- CreateEnum
CREATE TYPE "LoanFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'MISSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('POSTED', 'VOID');

-- CreateEnum
CREATE TYPE "PenaltyType" AS ENUM ('LATE_FEE', 'MANUAL_FEE');

-- CreateEnum
CREATE TYPE "PenaltyStatus" AS ENUM ('ASSESSED', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "RestructureReason" AS ENUM ('CUSTOMER_REQUEST', 'HARDHIP', 'COLLECTION', 'OTHER');

-- CreateEnum
CREATE TYPE "RiskScope" AS ENUM ('LOAN', 'BORROWER');

-- CreateEnum
CREATE TYPE "TrendStatus" AS ENUM ('IMPROVING', 'STABLE', 'WORSENING');

-- CreateEnum
CREATE TYPE "RenewalConclusion" AS ENUM ('NO_RENOVAR', 'REDUCIR', 'MANTENER', 'AUMENTAR');

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "defaultInterestRatePct" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    "defaultFrequency" "LoanFrequency" NOT NULL DEFAULT 'WEEKLY',
    "defaultTermCount" INTEGER NOT NULL DEFAULT 10,
    "graceLateDays" INTEGER NOT NULL DEFAULT 0,
    "severeLateDays" INTEGER NOT NULL DEFAULT 14,
    "trendWindowN" INTEGER NOT NULL DEFAULT 6,
    "trendDeltaDays" INTEGER NOT NULL DEFAULT 2,
    "noRenewLatePct" INTEGER NOT NULL DEFAULT 35,
    "reduceLatePct" INTEGER NOT NULL DEFAULT 20,
    "increaseLatePctMax" INTEGER NOT NULL DEFAULT 10,
    "minOnTimePctToIncrease" INTEGER NOT NULL DEFAULT 90,
    "reduceMultiplier" DECIMAL(6,3) NOT NULL DEFAULT 0.80,
    "maintainMultiplier" DECIMAL(6,3) NOT NULL DEFAULT 1.00,
    "increaseMultiplier" DECIMAL(6,3) NOT NULL DEFAULT 1.20,
    "lateFeeFlatAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "lateFeePerDayAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "maxPenaltyPerInstallment" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrower" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "externalRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Borrower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "borrowerId" UUID NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "frequency" "LoanFrequency" NOT NULL,
    "termCount" INTEGER NOT NULL,
    "principalAmount" DECIMAL(12,2) NOT NULL,
    "interestRatePct" DECIMAL(5,2) NOT NULL,
    "expectedInstallment" DECIMAL(12,2) NOT NULL,
    "totalExpected" DECIMAL(12,2) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextDueDate" TIMESTAMP(3),
    "lateFeeFlatAmount" DECIMAL(12,2),
    "lateFeePerDayAmount" DECIMAL(12,2),
    "maxPenaltyPerInstallment" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSchedule" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "loanId" UUID NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "expectedAmount" DECIMAL(12,2) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "paidAt" TIMESTAMP(3),
    "lateDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "borrowerId" UUID NOT NULL,
    "loanId" UUID NOT NULL,
    "scheduleId" UUID,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'POSTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penalty" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "loanId" UUID NOT NULL,
    "scheduleId" UUID,
    "type" "PenaltyType" NOT NULL DEFAULT 'LATE_FEE',
    "status" "PenaltyStatus" NOT NULL DEFAULT 'ASSESSED',
    "amount" DECIMAL(12,2) NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Penalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanRestructure" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "loanId" UUID NOT NULL,
    "createdByUserId" UUID,
    "reason" "RestructureReason" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "effectiveFromInstallment" INTEGER NOT NULL,
    "oldFrequency" "LoanFrequency" NOT NULL,
    "newFrequency" "LoanFrequency" NOT NULL,
    "oldTermCount" INTEGER NOT NULL,
    "newTermCount" INTEGER NOT NULL,
    "oldExpectedInstallment" DECIMAL(12,2) NOT NULL,
    "newExpectedInstallment" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LoanRestructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskSnapshot" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "scope" "RiskScope" NOT NULL,
    "loanId" UUID,
    "borrowerId" UUID,
    "asOfDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windowN" INTEGER NOT NULL DEFAULT 6,
    "pagosTotales" INTEGER NOT NULL DEFAULT 0,
    "pagosATiempo" INTEGER NOT NULL DEFAULT 0,
    "pagosTarde" INTEGER NOT NULL DEFAULT 0,
    "pagosTardePct" INTEGER NOT NULL DEFAULT 0,
    "atrasosCount" INTEGER NOT NULL DEFAULT 0,
    "atrasoPromedioDias" INTEGER NOT NULL DEFAULT 0,
    "trend" "TrendStatus" NOT NULL DEFAULT 'STABLE',
    "conclusion" "RenewalConclusion" NOT NULL DEFAULT 'MANTENER',
    "suggestedLimit" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "severeLateCountLastN" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractDocument" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "loanId" UUID NOT NULL,
    "borrowerId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "sizeBytes" INTEGER,
    "sha256" TEXT,
    "generatedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ContractDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_deletedAt_idx" ON "Organization"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSettings_organizationId_key" ON "OrganizationSettings"("organizationId");

-- CreateIndex
CREATE INDEX "Borrower_organizationId_idx" ON "Borrower"("organizationId");

-- CreateIndex
CREATE INDEX "Borrower_organizationId_fullName_idx" ON "Borrower"("organizationId", "fullName");

-- CreateIndex
CREATE INDEX "Borrower_deletedAt_idx" ON "Borrower"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Borrower_organizationId_phone_key" ON "Borrower"("organizationId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Borrower_organizationId_externalRef_key" ON "Borrower"("organizationId", "externalRef");

-- CreateIndex
CREATE INDEX "Loan_organizationId_idx" ON "Loan"("organizationId");

-- CreateIndex
CREATE INDEX "Loan_organizationId_borrowerId_idx" ON "Loan"("organizationId", "borrowerId");

-- CreateIndex
CREATE INDEX "Loan_organizationId_status_idx" ON "Loan"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Loan_organizationId_nextDueDate_idx" ON "Loan"("organizationId", "nextDueDate");

-- CreateIndex
CREATE INDEX "Loan_deletedAt_idx" ON "Loan"("deletedAt");

-- CreateIndex
CREATE INDEX "PaymentSchedule_loanId_dueDate_idx" ON "PaymentSchedule"("loanId", "dueDate");

-- CreateIndex
CREATE INDEX "PaymentSchedule_organizationId_dueDate_idx" ON "PaymentSchedule"("organizationId", "dueDate");

-- CreateIndex
CREATE INDEX "PaymentSchedule_organizationId_status_idx" ON "PaymentSchedule"("organizationId", "status");

-- CreateIndex
CREATE INDEX "PaymentSchedule_deletedAt_idx" ON "PaymentSchedule"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSchedule_loanId_installmentNumber_key" ON "PaymentSchedule"("loanId", "installmentNumber");

-- CreateIndex
CREATE INDEX "Payment_organizationId_paidAt_idx" ON "Payment"("organizationId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_loanId_paidAt_idx" ON "Payment"("loanId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_borrowerId_paidAt_idx" ON "Payment"("borrowerId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_scheduleId_idx" ON "Payment"("scheduleId");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");

-- CreateIndex
CREATE INDEX "Penalty_organizationId_assessedAt_idx" ON "Penalty"("organizationId", "assessedAt");

-- CreateIndex
CREATE INDEX "Penalty_loanId_idx" ON "Penalty"("loanId");

-- CreateIndex
CREATE INDEX "Penalty_scheduleId_idx" ON "Penalty"("scheduleId");

-- CreateIndex
CREATE INDEX "Penalty_deletedAt_idx" ON "Penalty"("deletedAt");

-- CreateIndex
CREATE INDEX "LoanRestructure_organizationId_createdAt_idx" ON "LoanRestructure"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "LoanRestructure_loanId_idx" ON "LoanRestructure"("loanId");

-- CreateIndex
CREATE INDEX "LoanRestructure_deletedAt_idx" ON "LoanRestructure"("deletedAt");

-- CreateIndex
CREATE INDEX "RiskSnapshot_organizationId_scope_asOfDate_idx" ON "RiskSnapshot"("organizationId", "scope", "asOfDate");

-- CreateIndex
CREATE INDEX "RiskSnapshot_loanId_idx" ON "RiskSnapshot"("loanId");

-- CreateIndex
CREATE INDEX "RiskSnapshot_borrowerId_idx" ON "RiskSnapshot"("borrowerId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskSnapshot_organizationId_scope_loanId_borrowerId_asOfDat_key" ON "RiskSnapshot"("organizationId", "scope", "loanId", "borrowerId", "asOfDate");

-- CreateIndex
CREATE INDEX "ContractDocument_organizationId_uploadedAt_idx" ON "ContractDocument"("organizationId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ContractDocument_loanId_idx" ON "ContractDocument"("loanId");

-- CreateIndex
CREATE INDEX "ContractDocument_borrowerId_idx" ON "ContractDocument"("borrowerId");

-- CreateIndex
CREATE INDEX "ContractDocument_deletedAt_idx" ON "ContractDocument"("deletedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSettings" ADD CONSTRAINT "OrganizationSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrower" ADD CONSTRAINT "Borrower_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSchedule" ADD CONSTRAINT "PaymentSchedule_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "PaymentSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penalty" ADD CONSTRAINT "Penalty_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "PaymentSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRestructure" ADD CONSTRAINT "LoanRestructure_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRestructure" ADD CONSTRAINT "LoanRestructure_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanRestructure" ADD CONSTRAINT "LoanRestructure_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskSnapshot" ADD CONSTRAINT "RiskSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskSnapshot" ADD CONSTRAINT "RiskSnapshot_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskSnapshot" ADD CONSTRAINT "RiskSnapshot_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDocument" ADD CONSTRAINT "ContractDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDocument" ADD CONSTRAINT "ContractDocument_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDocument" ADD CONSTRAINT "ContractDocument_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
