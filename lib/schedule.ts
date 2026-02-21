// lib/schedule.ts
import type { LoanFrequency } from "@prisma/client";

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysStep(freq: LoanFrequency) {
  if (freq === "WEEKLY") return 7;
  if (freq === "BIWEEKLY") return 14;
  return 30; // MVP
}

export function computeDueDates(startDate: Date, frequency: LoanFrequency, termCount: number) {
  const dates: Date[] = [];
  for (let i = 1; i <= termCount; i++) {
    if (frequency === "MONTHLY") {
      // MVP simple: 30 días (si quieres “addMonths real”, lo hacemos luego)
      dates.push(addDays(startDate, 30 * i));
    } else {
      dates.push(addDays(startDate, daysStep(frequency) * i));
    }
  }
  return dates;
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * MVP: interés “por periodo” como definimos (no anual).
 * totalExpected = principal * (1 + rate * termCount)
 * installment = totalExpected / termCount
 */
export function computeInstallment(principal: number, interestTotalPct: number, termCount: number) {
  const rateTotal = interestTotalPct / 100;
  const totalExpected = principal * (1 + rateTotal);
  const expectedInstallment = totalExpected / termCount;
  return {
    totalExpected: round2(totalExpected),
    expectedInstallment: round2(expectedInstallment),
  };
}
