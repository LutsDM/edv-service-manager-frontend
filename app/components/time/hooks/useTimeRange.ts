import { TimeParts } from "../lib/time"
import { Report } from "@/app/types/report"

function format(t: TimeParts): string {
  return `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`
}

type Params = {
  report: Report | null

  // Ankunft
  ankunftVon: TimeParts
  ankunftBis: TimeParts
  includeAnkunft: boolean

  // Arbeitszeit
  start: TimeParts
  end: TimeParts

  // Abfahrt
  abfahrtVon: TimeParts
  abfahrtBis: TimeParts
  includeAbfahrt: boolean
}

export function useTimeRanges({
  report,
  ankunftVon,
  ankunftBis,
  start,
  end,
  abfahrtVon,
  abfahrtBis,
  includeAbfahrt,
  includeAnkunft,
}: Params) {
  const ankunftRange =
    report && includeAnkunft
      ? `${format(ankunftVon)} bis ${format(ankunftBis)}`
      : undefined

  const arbeitszeitRange =
    report
      ? `${format(start)} bis ${format(end)}`
      : ""

  const abfahrtRange =
    report && includeAbfahrt
      ? `${format(abfahrtVon)} bis ${format(abfahrtBis)}`
      : undefined
      

  return {
    ankunftRange,
    arbeitszeitRange,
    abfahrtRange,        
  }
}
