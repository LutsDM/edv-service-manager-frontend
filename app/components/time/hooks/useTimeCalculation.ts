import { useMemo } from "react"
import { TimeParts, timeToMinutes } from "../lib/time"
import { Report } from "@/app/types/report"

type Params = {
  ankunftVon: TimeParts
  ankunftBis: TimeParts
  includeAnkunft: boolean

  start: TimeParts
  end: TimeParts

  abfahrtVon: TimeParts
  abfahrtBis: TimeParts
  includeAbfahrt: boolean
}

export function useTimeCalculation({
  ankunftVon,
  ankunftBis,
  includeAnkunft,
  start,
  end,
  abfahrtVon,
  abfahrtBis,
  includeAbfahrt,
}: Params) {
  return useMemo(() => {
    const startMin = timeToMinutes(start)
    const endMin = timeToMinutes(end)

    if (startMin >= endMin) {
      return {
        report: null,
        error: "Arbeitsbeginn muss vor dem Arbeitsende liegen.",
      }
    }

    let ankunftZeit = 0

    if (includeAnkunft) {
      const ankunftVonMin = timeToMinutes(ankunftVon)
      const ankunftBisMin = timeToMinutes(ankunftBis)

      if (ankunftVonMin > ankunftBisMin) {
        return {
          report: null,
          error: "Ankunft: Von darf nicht später als Bis sein.",
        }
      }

      if (ankunftBisMin > startMin) {
        return {
          report: null,
          error: "Arbeitsbeginn darf nicht vor dem Ende der Ankunft liegen.",
        }
      }

      ankunftZeit = ankunftBisMin - ankunftVonMin
    }

    let abfahrtZeit = 0

    if (includeAbfahrt) {
      const abfahrtVonMin = timeToMinutes(abfahrtVon)
      const abfahrtBisMin = timeToMinutes(abfahrtBis)

      if (abfahrtVonMin > abfahrtBisMin) {
        return {
          report: null,
          error: "Abfahrt: Von darf nicht später als Bis sein.",
        }
      }

      if (abfahrtVonMin < endMin) {
        return {
          report: null,
          error: "Abfahrt darf nicht vor dem Arbeitsende beginnen.",
        }
      }

      abfahrtZeit = abfahrtBisMin - abfahrtVonMin
    }

    const arbeitszeit = endMin - startMin

    return {
      report: {
        arbeitszeit,
        ankunftzeit: ankunftZeit,
        abfahrt: abfahrtZeit,
        gesamtzeit: ankunftZeit + arbeitszeit + abfahrtZeit,
      } satisfies Report,
      error: "",
    }
  }, [
    ankunftVon,
    ankunftBis,
    includeAnkunft,
    start,
    end,
    abfahrtVon,
    abfahrtBis,
    includeAbfahrt,
  ])
}