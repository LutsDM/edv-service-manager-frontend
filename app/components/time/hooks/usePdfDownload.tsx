import { Report } from "@/app/types/report"
import { Employee } from "../lib/employees"
import { formatDuration } from "../lib/time"
import { Customer } from "@/app/types/customer"
import { LineItem } from "@/app/types/lineItem"

type Params = {
  report: Report | null
  date: string
  auftragsnummer: string
  includeAbfahrt: boolean
  includeAnkunft: boolean
  includeDiagnosis?: boolean
  arbeitszeitRange: string
  abfahrtRange?: string
  ankunftRange?: string
  stundensatzText: string
  employeeCount: number
  netto: number
  mwst: number
  brutto: number
  employees: Employee[]
  isIOS: boolean
  customer?: Customer | null
  signatureKunde: string | null
  signatureEmployee: string | null
  orderDetails: string | null
  lineItems: LineItem[]
  extraBrutto: number
  serviceBrutto: number
}

const formatEuro = (value: number) => `${value.toFixed(2).replace(".", ",")} €`

export function usePdfDownload({
  report,
  date,
  auftragsnummer,
  includeAbfahrt,
  includeAnkunft,
  includeDiagnosis = false,
  ankunftRange,
  arbeitszeitRange,
  abfahrtRange,
  stundensatzText,
  employeeCount,
  netto,
  mwst,
  brutto,
  employees,
  isIOS,
  customer,
  signatureKunde,
  signatureEmployee,
  orderDetails,
  lineItems,
  extraBrutto,
  serviceBrutto,
}: Params) {
  return async function downloadPdf() {
    if (!report) return

    const { pdf } = await import("@react-pdf/renderer")
    const { default: ServiceReportPdf } =
      await import("../report/ServiceReportPdf")

    const blob = await pdf(
      <ServiceReportPdf
        arbeitsdatum={date}
        auftragsnummer={auftragsnummer}
        ankunftRange={ankunftRange}
        ankunftText={includeAnkunft ? formatDuration(report.ankunftzeit) : undefined}
        arbeitszeitText={formatDuration(report.arbeitszeit)}
        arbeitszeitRange={arbeitszeitRange}
        abfahrtText={includeAbfahrt ? formatDuration(report.abfahrt) : undefined}
        abfahrtRange={abfahrtRange}
        gesamtzeitText={formatDuration(report.gesamtzeit)}
        stundensatz={stundensatzText}
        includeDiagnosis={includeDiagnosis}
        mitarbeiterAnzahl={employeeCount}
        netto={formatEuro(netto)}
        mwst={formatEuro(mwst)}
        brutto={formatEuro(brutto)}
        employees={employees}
        customer={customer}
        signatureKunde={signatureKunde}
        signatureEmployee={signatureEmployee}
        orderDetails={orderDetails}
        lineItems={lineItems}
        serviceBrutto={formatEuro(serviceBrutto)}
        extraBrutto={extraBrutto > 0 ? formatEuro(extraBrutto) : undefined}
      />
    ).toBlob()

    const url = URL.createObjectURL(blob)

    if (isIOS && navigator.share) {
      const file = new File([blob], `Servicebericht_${date}_${customer?.lastName}.pdf`, {
        type: "application/pdf",
      })

      await navigator.share({ files: [file] })
      URL.revokeObjectURL(url)
      return
    }

    if (isIOS) {
      window.open(url)
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      return
    }

    const a = document.createElement("a")
    a.href = url
    a.download = `Servicebericht_${date}_${customer?.lastName}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }
}
