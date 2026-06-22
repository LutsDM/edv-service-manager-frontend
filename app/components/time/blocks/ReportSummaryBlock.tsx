import ReportRow from "../ui/ReportRow"
import { formatDuration } from "../lib/time"
import { Report } from "@/app/types/report"

type ReportSummaryBlockProps = {
  report: Report
  includeAbfahrt: boolean
  includeAnkunft: boolean
  employeeCount: number
  serviceBrutto: number

  disabled?: boolean;
}

export default function ReportSummaryBlock({
  report,
  includeAbfahrt,
  includeAnkunft,
  employeeCount,
  serviceBrutto,
  disabled = false,
}: ReportSummaryBlockProps) {

  if (employeeCount === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <div className="font-semibold mb-1">
          Kein Mitarbeiter ausgewählt
        </div>
        <div>
          Bitte wählen Sie mindestens einen Mitarbeiter aus, um den Servicebericht zu erstellen.
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-2 ${disabled ? "border-gray-100 opacity-40 pointer-events-none select-none" : "border-gray-200"}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500">
        Bericht
      </div>


      {includeAnkunft && (
        <ReportRow
          label="Ankunftszeit"
          value={formatDuration(report.ankunftzeit)}
        />
      )}

      <ReportRow
        label="Arbeitszeit"
        value={formatDuration(report.arbeitszeit)}
      />

      {includeAbfahrt && (
        <ReportRow
          label="Abfahrt"
          value={formatDuration(report.abfahrt)}
        />
      )}

      <div className="pt-2 border-t">
        <ReportRow
          label="Gesamtzeit"
          value={formatDuration(report.gesamtzeit)}
          strong
        />
      </div>

      <ReportRow
        label="Mitarbeiteranzahl"
        value={String(employeeCount)}
        strong
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 font-medium">
          <span className="text-gray-800">Gesamtbetrag</span>
          <div className="relative group">
            <span className="cursor-pointer text-gray-400">ℹ️</span>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 rounded-md bg-gray-800 text-white text-xs p-2 shadow-lg z-10">
              (Ankunft + Arbeitszeit + Abfahrt) × Stundensatz × Mitarbeiteranzahl

            </div>
          </div>
        </div>

        <div className="font-semibold text-gray-800">
          {serviceBrutto.toFixed(2)} €
        </div>
      </div>
    </div>
  )
}
