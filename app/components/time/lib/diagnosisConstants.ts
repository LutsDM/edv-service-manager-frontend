/** VAT rate (19 %) used across all price calculations. */
export const MWST_RATE = 0.19

/** Fixed diagnosis fee (gross, what the client pays) in EUR. */
export const DIAGNOSIS_FLAT_BRUTTO_EUR = 60

export const DIAGNOSIS_FLAT_NETTO_EUR = DIAGNOSIS_FLAT_BRUTTO_EUR / (1 + MWST_RATE)
export const DIAGNOSIS_FLAT_MWST_EUR = DIAGNOSIS_FLAT_BRUTTO_EUR - DIAGNOSIS_FLAT_NETTO_EUR
