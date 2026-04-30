"use client";

import { LineItem } from "@/app/types/lineItem";
import { Employee } from "../lib/employees";
import { Customer } from "@/app/types/customer";

type ServiceReportProps = {
  arbeitsdatum: string;
  auftragsnummer: string;
  kundenNr?: string;

  arbeitszeitText: string;
  arbeitszeitRange: string;

  abfahrtText?: string;
  abfahrtRange?: string;

  ankunftText?: string;
  ankunftRange?: string;

  gesamtzeitText: string;

  stundensatz: string;
  mitarbeiterAnzahl: number;

  netto: string;
  mwst: string;
  brutto: string;

  employees: Employee[];
  customer?: Customer | null;

  onBack?: () => void;
  showBackButton?: boolean;

  signatureKunde: string | null;
  signatureEmployee: string | null;

  orderDetails?: string;

  lineItems?: LineItem[];
  extraBrutto?: string;
};

export default function ServiceReport({
  ankunftText,
  ankunftRange,
  abfahrtRange,
  arbeitsdatum,
  arbeitszeitRange,
  auftragsnummer,
  kundenNr,
  arbeitszeitText,
  abfahrtText,
  gesamtzeitText,
  stundensatz,
  mitarbeiterAnzahl,
  netto,
  mwst,
  brutto,
  employees,
  customer,
  onBack,
  showBackButton = true,
  signatureKunde,
  signatureEmployee,
  orderDetails,
  lineItems,
  extraBrutto,
}: ServiceReportProps) {
  return (
    <div className="print-area max-w-[800px] mx-auto bg-white p-8 text-base text-gray-900 leading-relaxed">
      {showBackButton && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 print:hidden"
        >
          Zurück
        </button>
      )}

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

      {/* TITLE — крупнее и жирнее */}
      <div className="mb-4 text-right text-sm leading-relaxed">
        <strong className="text-lg font-bold block mb-1">Servicebericht</strong>
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

      {/* LEISTUNGEN */}
      <table className="w-full border border-gray-300 mb-6 text-sm">
        <tbody>
          {ankunftText && ankunftRange && (
            <tr className="border border-gray-300">
              <td className="p-1">
                Ankunft
                <br />
                <span className="text-xs text-gray-500">({ankunftRange})</span>
              </td>
              <td className="p-1 text-right">{ankunftText}</td>
            </tr>
          )}
          <tr className="border border-gray-300">
            <td className="p-1">
              Arbeitszeit
              <br />
              <span className="text-xs text-gray-500">
                ({arbeitszeitRange})
              </span>
            </td>
            <td className="p-1 text-right">{arbeitszeitText}</td>
          </tr>

          {abfahrtText && abfahrtRange && (
            <tr className="border border-gray-300">
              <td className="p-1">
                Abfahrt
                <br />
                <span className="text-xs text-gray-500">({abfahrtRange})</span>
              </td>
              <td className="p-1 text-right">{abfahrtText}</td>
            </tr>
          )}

          <tr className="border border-gray-300 font-bold">
            <td className="p-1">Gesamtzeit</td>
            <td className="p-1 text-right">{gesamtzeitText}</td>
          </tr>

          <tr className="border border-gray-300">
            <td className="p-1">Stundensatz</td>
            <td className="p-1 text-right">{stundensatz}</td>
          </tr>

          <tr className="border border-gray-300">
            <td className="p-1">Mitarbeiteranzahl</td>
            <td className="p-1 text-right">{mitarbeiterAnzahl}</td>
          </tr>

          {lineItems?.length ? (
            <>
              {lineItems.map((item) => (
                <tr key={item.id} className="border border-gray-300">
                  <td className="p-1">{item.title}</td>
                  <td className="p-1 text-right">
                    {(item.amountCents / 100).toFixed(2).replace(".", ",")} €
                  </td>
                </tr>
              ))}
            </>
          ) : null}
        </tbody>
      </table>

      {/* TOTALS */}
      <div className="w-1/2 ml-auto space-y-1 mb-10">
        <div className="flex justify-between">
          <span>Nettobetrag</span>
          <span>{netto}</span>
        </div>
        <div className="flex justify-between">
          <span>MwSt 19 %</span>
          <span>{mwst}</span>
        </div>
        {extraBrutto ? (
          <div className="flex justify-between">
            <span>Zusatzpositionen</span>
            <span>{extraBrutto}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-semibold border-t pt-2">
          <span>Gesamtbetrag</span>
          <span>{brutto}</span>
        </div>
      </div>

      {orderDetails?.trim() ? (
        <div className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4">
          <div className="text-sm font-bold text-gray-800">
            Ausführung der Arbeiten
          </div>
          <div className="mt-2 whitespace-pre-wrap text-base">
            {orderDetails}
          </div>
        </div>
      ) : null}

      {/* SIGNATURES — wie Auftragsformular: zwei gleich breite Spalten */}
      <div className="mt-10 w-full">
        <div className="grid grid-cols-2 gap-8 text-sm break-inside-avoid">
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
    </div>
  );
}
