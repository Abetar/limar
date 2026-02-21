"use server";

import { prisma } from "@/lib/prisma";
import { requireOrgId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma, LoanFrequency } from "@prisma/client";

function s(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function toInt(x: string, fallback: number) {
  const n = Number(x);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toDec(x: string, fallback: string) {
  const n = Number(x);
  if (!Number.isFinite(n)) return new Prisma.Decimal(fallback);
  return new Prisma.Decimal(n.toFixed(2));
}

function toDec3(x: string, fallback: string) {
  const n = Number(x);
  if (!Number.isFinite(n)) return new Prisma.Decimal(fallback);
  return new Prisma.Decimal(n.toFixed(3));
}

export async function updateSettingsAction(formData: FormData) {
  const orgId = await requireOrgId();

  const defaultFrequency = s(formData, "defaultFrequency") as LoanFrequency;
  const defaultTermCount = toInt(s(formData, "defaultTermCount"), 10);

  // Nota: ahora interpretas "interest" como interés total (UX),
  // pero tu DB aún se llama defaultInterestRatePct. Guardamos el TOTAL ahí por ahora.
  const defaultInterestTotalPct = toDec(s(formData, "defaultInterestTotalPct"), "30.00");

  const graceLateDays = toInt(s(formData, "graceLateDays"), 0);
  const severeLateDays = toInt(s(formData, "severeLateDays"), 14);

  const trendWindowN = toInt(s(formData, "trendWindowN"), 6);
  const trendDeltaDays = toInt(s(formData, "trendDeltaDays"), 2);

  const noRenewLatePct = toInt(s(formData, "noRenewLatePct"), 35);
  const reduceLatePct = toInt(s(formData, "reduceLatePct"), 20);
  const increaseLatePctMax = toInt(s(formData, "increaseLatePctMax"), 10);
  const minOnTimePctToIncrease = toInt(s(formData, "minOnTimePctToIncrease"), 90);

  const reduceMultiplier = toDec3(s(formData, "reduceMultiplier"), "0.800");
  const maintainMultiplier = toDec3(s(formData, "maintainMultiplier"), "1.000");
  const increaseMultiplier = toDec3(s(formData, "increaseMultiplier"), "1.200");

  const lateFeeFlatAmount = toDec(s(formData, "lateFeeFlatAmount"), "0.00");
  const lateFeePerDayAmount = toDec(s(formData, "lateFeePerDayAmount"), "0.00");
  const maxPenaltyPerInstallment = toDec(s(formData, "maxPenaltyPerInstallment"), "0.00");

  await prisma.organizationSettings.upsert({
    where: { organizationId: orgId },
    update: {
      defaultFrequency,
      defaultTermCount,
      defaultInterestRatePct: defaultInterestTotalPct,

      graceLateDays,
      severeLateDays,

      trendWindowN,
      trendDeltaDays,

      noRenewLatePct,
      reduceLatePct,
      increaseLatePctMax,
      minOnTimePctToIncrease,

      reduceMultiplier,
      maintainMultiplier,
      increaseMultiplier,

      lateFeeFlatAmount,
      lateFeePerDayAmount,
      maxPenaltyPerInstallment,
    },
    create: {
      organizationId: orgId,
      defaultFrequency,
      defaultTermCount,
      defaultInterestRatePct: defaultInterestTotalPct,

      graceLateDays,
      severeLateDays,

      trendWindowN,
      trendDeltaDays,

      noRenewLatePct,
      reduceLatePct,
      increaseLatePctMax,
      minOnTimePctToIncrease,

      reduceMultiplier,
      maintainMultiplier,
      increaseMultiplier,

      lateFeeFlatAmount,
      lateFeePerDayAmount,
      maxPenaltyPerInstallment,
    },
  });

  redirect("/settings?saved=1");
}
