import { useMemo } from "react"
import { TimeParts, timeToMinutes } from "../lib/time"
import { Report } from "@/app/types/report"

type Params = {
  // Ankunft
  ankunftVon: TimeParts
  ankunftBis: TimeParts

  // Arbeitszeit
  start: TimeParts
  end: TimeParts

  // Abfahrt
  abfahrtVon: TimeParts
  abfahrtBis: TimeParts
  includeAbfahrt: boolean
}

export function useTimeCalculation({
  ankunftVon,
  ankunftBis,
  start,
  end,
  abfahrtVon,
  abfahrtBis,
  includeAbfahrt,
}: Params) {
  return useMemo(() => {
    const ankunftVonMin = timeToMinutes(ankunftVon)
    const ankunftBisMin = timeToMinutes(ankunftBis)
    const startMin = timeToMinutes(start)
    const endMin = timeToMinutes(end)

    /* ---------------- Ankunft validation ---------------- */
    if (ankunftVonMin > ankunftBisMin) {
      return { report: null, error: "Ankunft: Von darf nicht später als Bis sein." }
    }

    if (ankunftBisMin > startMin) {
      return {
        report: null,
        error: "Arbeitsbeginn darf nicht vor dem Ende der Ankunft liegen.",
      }
    }

    /* ---------------- Arbeitszeit validation ---------------- */
    if (startMin >= endMin) {
      return { report: null, error: "Arbeitsbeginn muss vor dem Arbeitsende liegen." }
    }

    /* ---------------- Abfahrt validation ---------------- */
    let abfahrtZeit = 0
    if (includeAbfahrt) {
      const abfahrtVonMin = timeToMinutes(abfahrtVon)
      const abfahrtBisMin = timeToMinutes(abfahrtBis)

      if (abfahrtVonMin > abfahrtBisMin) {
        return { report: null, error: "Abfahrt: Von darf nicht später als Bis sein." }
      }

      if (abfahrtVonMin < endMin) {
        return { report: null, error: "Abfahrt darf nicht vor dem Arbeitsende beginnen." }
      }

      abfahrtZeit = abfahrtBisMin - abfahrtVonMin
    }

    /* ---------------- Durations ---------------- */
    const ankunftZeit = ankunftBisMin - ankunftVonMin
    const arbeitszeit = endMin - startMin

    /* ---------------- Result ---------------- */
    return {
      report: {
        arbeitszeit,
        abfahrt: abfahrtZeit,
       gesamtzeit: ankunftZeit + arbeitszeit + abfahrtZeit,
        ankunftzeit: ankunftZeit,
      } satisfies Report,
      error: "",
    }
  }, [ankunftVon, ankunftBis, start, end, abfahrtVon, abfahrtBis, includeAbfahrt])
}
