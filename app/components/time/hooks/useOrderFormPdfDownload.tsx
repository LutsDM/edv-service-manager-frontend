import { Employee } from "../lib/employees";
import { Customer } from "@/app/types/customer";
import { LineItem } from "@/app/types/lineItem";

type Params = {
  includeDiagnosis: boolean;
  date: string;
  auftragsnummer: string;
  preisProStunde: string;
  mitarbeiterAnzahl: number;
  employees: Employee[];
  customer?: Customer | null;
  auftragPasswort: string;
  signatureKunde: string | null;
  signatureEmployee: string | null;
  orderDetails: string | null;
  lineItems: LineItem[];
  extraBrutto: number;
  isIOS: boolean;
};

const formatEuro = (value: number) =>
  `${value.toFixed(2).replace(".", ",")} €`;

export function useOrderFormPdfDownload({
  includeDiagnosis,
  date,
  auftragsnummer,
  preisProStunde,
  mitarbeiterAnzahl,
  employees,
  customer,
  auftragPasswort,
  signatureKunde,
  signatureEmployee,
  orderDetails,
  lineItems,
  extraBrutto,
  isIOS,
}: Params) {
  return async function downloadOrderFormPdf() {
    const { pdf } = await import("@react-pdf/renderer");
    const { default: OrderFormPdf } = await import("../report/OrderFormPdf");

    const extraBruttoStr =
      extraBrutto > 0 ? formatEuro(extraBrutto) : undefined;

    const blob = await pdf(
      <OrderFormPdf
        diagnosis={includeDiagnosis}
        arbeitsdatum={date}
        auftragsnummer={auftragsnummer}
        preisProStunde={preisProStunde}
        mitarbeiterAnzahl={mitarbeiterAnzahl}
        orderDetails={orderDetails}
        lineItems={lineItems}
        extraBrutto={extraBruttoStr}
        employees={employees}
        customer={customer}
        auftragPasswort={auftragPasswort}
        signatureKunde={signatureKunde}
        signatureEmployee={signatureEmployee}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const filename = `Auftragsformular_${date}_${customer?.lastName}.pdf`;

    if (isIOS && navigator.share) {
      const file = new File([blob], filename, { type: "application/pdf" });
      await navigator.share({ files: [file] });
      URL.revokeObjectURL(url);
      return;
    }
    if (isIOS) {
      window.open(url);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return;
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
}
