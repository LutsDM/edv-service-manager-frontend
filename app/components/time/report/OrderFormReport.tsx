"use client";

import { LineItem } from "@/app/types/lineItem";
import { Employee } from "../lib/employees";
import { Customer } from "@/app/types/customer";
import {
  ORDER_FORM_AGB_TITLE,
  parseOrderFormAgbLines,
} from "./orderFormAgbContent";

type OrderFormReportProps = {
  diagnose: boolean;
  arbeitsdatum: string;
  auftragsnummer: string;
  kundenNr?: string;
  preisProStunde: string;
  mitarbeiterAnzahl: number;
  orderDetails?: string;
  lineItems?: LineItem[];
  extraBrutto?: string;
  employees: Employee[];
  customer?: Customer | null;
  /** Nur Auftragsformular */
  auftragPasswort?: string;
  signatureKunde: string | null;
  signatureEmployee: string | null;
};

export default function OrderFormReport({
  diagnose,
  arbeitsdatum,
  auftragsnummer,
  kundenNr,
  preisProStunde,
  mitarbeiterAnzahl,
  orderDetails,
  lineItems,
  employees,
  customer,
  auftragPasswort,
  signatureKunde,
  signatureEmployee,
}: OrderFormReportProps) {
  return (
    <div className="print-area max-w-[800px] mx-auto bg-white p-8 text-base text-gray-900 leading-relaxed">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="text-[12px] leading-relaxed">
            {customer && (
              <div className="mt-4">
                <div className="font-semibold">Kunde</div>
                {customer.type === "company" && customer.companyName && (
                  <div>{customer.companyName}</div>
                )}
                <div>
                  {customer.firstName} {customer.lastName}
                </div>
                <div>
                  {customer.street} {customer.houseNumber}
                </div>
                <div>
                  {customer.postalCode} {customer.city}
                </div>
                {customer.phone && <div>Tel. {customer.phone}</div>}
                {customer.mobilePhone && (
                  <div>Mobil: {customer.mobilePhone}</div>
                )}
              </div>
            )}
            {auftragPasswort?.trim() ? (
              <div className="mt-3 text-xs leading-relaxed">
                <div className="font-semibold">Passwort</div>
                <div className="break-all text-gray-800">{auftragPasswort}</div>
              </div>
            ) : null}
          </div>
          <div className="self-center flex items-center gap-0.5 h-[40px]">
            <img
              src="/LOGO.png"
              alt="EDV Service Samirae"
              width={88}
              height={40}
              style={{ objectFit: "contain" }}
            />
            <div className="leading-tight pt-5">
              <div className="font-extrabold text-base w-[78px]">SERVICE</div>
              <div className="text-base w-[78px]">SAMIRAE</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-right text-sm leading-relaxed">
        <strong className="text-lg font-bold block mb-1">
          Auftragsformular
        </strong>
        Arbeitsdatum: {arbeitsdatum}
        <br />
        Auftragsnummer: {auftragsnummer}
        <br />
        {kundenNr && (
          <>
            Kunden Nr: {kundenNr}
            <br />
          </>
        )}
      </div>

      {/* Таблица как в Servicebericht (без блока времени) */}
      <table className="w-full border border-gray-300 mb-6 text-sm">
        <tbody>
          {diagnose ? (
            <tr className="border border-gray-300">
              <td className="p-1">Diagnose</td>
              <td className="p-1 text-right">60 €</td>
            </tr>
          ) : (
            <tr className="border border-gray-300">
              <td className="p-1">Stundensatz</td>
              <td className="p-1 text-right">{preisProStunde}</td>
            </tr>
          )}
          <tr className="border border-gray-300">
            <td className="p-1">Mitarbeiteranzahl</td>
            <td className="p-1 text-right">{mitarbeiterAnzahl}</td>
          </tr>
          {lineItems?.length
            ? lineItems.map((item) => (
                <tr key={item.id} className="border border-gray-300">
                  <td className="p-1">{item.title}</td>
                  <td className="p-1 text-right">
                    {(item.amountCents / 100).toFixed(2).replace(".", ",")} €
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>

      {orderDetails?.trim() ? (
        <div className="mt-4 mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4">
          <div className="text-sm font-bold text-gray-800">Auftragsdetails</div>
          <div className="mt-2 whitespace-pre-wrap text-base">
            {orderDetails}
          </div>
        </div>
      ) : null}

      {/* SIGNATURES */}
      <div className="mt-10 w-full">
        <div className="w-full break-inside-avoid">
          <div className="mb-4 p-1 text-[10px] leading-snug text-gray-800">
            <strong className="mb-1 block font-bold">
              Verbrauchererklärung über Beginn der Arbeiten vor Ablauf der
              Widerrufsfrist
            </strong>
            <div>Hiermit bestätige ich (der Auftraggeber / Kunde):</div>
            <ol className="mt-1 list-decimal pl-4">
              <li>
                Dass ich darüber belehrt wurde, dass mir ein 14-tägiges
                Widerrufsrecht zusteht. Eine entsprechende Widerrufsbelehrung
                und ein Muster-Widerrufsformular wurden mir ausgehändigt.
              </li>
              <li>
                Dass ich ausdrücklich zustimme, dass die beauftragten Arbeiten
                vor Ablauf der Widerrufsfrist beginnen.
              </li>
              <li>
                Dass ich darüber in Kenntnis gesetzt wurde, dass ich mein
                Widerrufsrecht bei vollständiger Vertragserfüllung verliere.
              </li>
              <li>
                Dass ich für den Fall, dass ich vor vollständiger
                Vertragserfüllung den Vertrag widerrufe, für die bis zum
                Widerruf erbrachten Leistungen einen Wertersatz zu leisten habe.
              </li>
            </ol>
          </div>
          <p className="mb-4 text-sm leading-snug text-gray-900">
            Auftragserteilung. Es gelten unsere AGB siehe nächste Seite.
          </p>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="text-center">
              <strong>Ausgeführt durch:</strong>
              <div className="bg-white flex items-center justify-center overflow-hidden h-[90px]">
                {signatureEmployee ? (
                  <img
                    src={signatureEmployee}
                    alt="Unterschrift Mitarbeiter"
                    className="max-h-[90px] max-w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400"></span>
                )}
              </div>
              <div className="border-b border-gray-500 h-2 mb-1" />
              <div className="font-medium">
                {employees.length === 1 ? employees[0].name : "Mitarbeiter"}
              </div>
            </div>
            <div className="text-center">
              <strong>Kunde:</strong>
              <div className="bg-white flex items-center justify-center overflow-hidden h-[90px]">
                {signatureKunde ? (
                  <img
                    src={signatureKunde}
                    alt="Unterschrift Kunde"
                    className="max-h-[90px] max-w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400"></span>
                )}
              </div>
              <div className="border-b border-gray-500 h-2 mb-2" />
              <div className="font-medium">
                {customer
                  ? `${customer.firstName} ${customer.lastName}`
                  : "Kunde"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-[10px] leading-relaxed">
        <div className="mb-2 border-b border-gray-300" />
        <div className="grid grid-cols-[1fr_1fr_1fr_1.25fr] gap-x-0.5 items-stretch">
          <div className="h-full">
            <div className="font-semibold">Standort Monheim:</div>
            <div>EDV-SERVICE Samirae</div>
            <div>Frank Samirae</div>
            <div>Franz-Boehm-Str. 3</div>
            <div>40789 Monheim</div>
          </div>
          <div className="h-full">
            <div className="font-semibold">Standort Bergisch Gladbach:</div>
            <div>EDV-SERVICE Samirae</div>
            <div>Frank Samirae</div>
            <div>Schloßstrasse 33</div>
            <div>51429 Bergisch Gladbach</div>
          </div>
          <div className="h-full">
            <div>Telefon: 02173 / 9939835</div>
            <div>Telefon: 02204 / 96 70 720</div>
            <div>Mobil: 0221 / 677 744 67</div>
            <div>E-Mail: mail@edvsamirae.de</div>
            <div>Web: www.edvsamirae.de</div>
          </div>
          <div className="h-full">
            <div>Umsatzsteuer-ID: DE288598216</div>
            <div>Steuer-Nr.: 135 5247 4113</div>
            <div className="whitespace-nowrap">
              IBAN: DE62 1001 1001 2623 2363 37
            </div>
            <div>BIC: NTSBDEB1XXX</div>
          </div>
        </div>
      </div>

      {/* AGB — immer neue Seite beim Drucken */}
      <section
        className="mt-16 border-t-2 border-gray-300 pt-6 print:mt-0 print:border-t-0 print:pt-3 break-before-page print:break-before-page"
        style={{ pageBreakBefore: "always", breakBefore: "page" }}
      >
        <h2 className="text-center text-xl font-bold leading-tight text-gray-900 print:text-lg">
          {ORDER_FORM_AGB_TITLE}
        </h2>
        <div className="mt-4 text-justify text-sm leading-relaxed text-gray-900 print:text-[12px] print:leading-snug">
          {parseOrderFormAgbLines().map((line, i) =>
            line.text === "" ? (
              <div key={i} className="h-2" aria-hidden />
            ) : (
              <div
                key={i}
                className={
                  line.bold ? "mt-3 font-bold first:mt-0 print:mt-2" : undefined
                }
              >
                {line.text}
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
