import { Report } from "@/app/types/report";
import {
  DIAGNOSIS_FLAT_BRUTTO_EUR,
  DIAGNOSIS_FLAT_MWST_EUR,
  DIAGNOSIS_FLAT_NETTO_EUR,
  MWST_RATE,
} from "../lib/diagnosisConstants";

export function usePriceCalculation({
  report,
  price,
  employeeCount,
  includeDiagnosis = false,
  taxRate = MWST_RATE,
  extraBruttoAmount = 0,
}: {
  report: Report | null;
  price: string;
  employeeCount: number;
  includeDiagnosis?: boolean;
  taxRate?: number;
  extraBruttoAmount?: number;
}) {
  const pricePerHour = Number(price || 0);
  const extraBrutto = extraBruttoAmount;

  // Diagnosis mode: fixed flat fee, no time-based calculation
  if (includeDiagnosis) {
    return {
      netto: DIAGNOSIS_FLAT_NETTO_EUR,
      mwst: DIAGNOSIS_FLAT_MWST_EUR,
      serviceBrutto: DIAGNOSIS_FLAT_BRUTTO_EUR,
      brutto: DIAGNOSIS_FLAT_BRUTTO_EUR + extraBrutto,
      extraBrutto,
      pricePerHour,
      stundensatzText: `${pricePerHour.toFixed(2)} €`,
    };
  }

  if (!report || employeeCount === 0 || pricePerHour <= 0) {
    return {
      brutto: extraBrutto,
      netto: 0,
      mwst: 0,
      pricePerHour,
      stundensatzText: `${pricePerHour.toFixed(2)} €`,
      serviceBrutto: 0,
      extraBrutto,
    };
  }

  const minutesTotal = report.gesamtzeit;

  const serviceBrutto = minutesTotal * (pricePerHour / 60) * employeeCount;

  const netto = serviceBrutto / (1 + taxRate);
  const mwst = serviceBrutto - netto;
  const brutto = serviceBrutto + extraBrutto;

  return {
    brutto,
    netto,
    mwst,
    pricePerHour,
    stundensatzText: `${pricePerHour.toFixed(2)} €`,
    serviceBrutto,
    extraBrutto,
  };
}
