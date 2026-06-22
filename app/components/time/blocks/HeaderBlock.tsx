import { useMemo } from "react";

type HeaderBlockProps = {
  includeDiagnosis: boolean;
  onDiagnosisChange: (value: boolean) => void;
  date: string;
  auftragsnummer: string;
  onAuftragsnummerChange: (value: string) => void;
  price: string;
  onPriceChange: (value: string) => void;
  isIOS: boolean;
};

export default function HeaderBlock({
  includeDiagnosis,
  onDiagnosisChange,
  date,
  auftragsnummer,
  onAuftragsnummerChange,
  price,
  onPriceChange,
  isIOS,
}: HeaderBlockProps) {
  const dateText = useMemo(
    () => new Date(date).toLocaleDateString("de-DE"),
    [date],
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
      {/* MOBILE: Arbeitsdatum */}
      <div className="min-w-0 bg-white border border-gray-200 rounded-lg p-4 shadow-sm md:hidden">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Arbeitsdatum
          {isIOS && <span className="ml-1">📅</span>}
        </label>

        <input
          type="text"
          readOnly
          value={dateText}
          className="h-9 w-full rounded-md border border-gray-300 px-2 text-sm bg-gray-50 text-gray-800"
        />
      </div>

      {/* MOBILE: Auftragsnummer */}
      <div className="min-w-0 bg-white border border-gray-200 rounded-lg p-4 shadow-sm md:hidden">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Auftragsnummer
        </label>

        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-sm text-gray-700 whitespace-nowrap">
            {date}-
          </span>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={auftragsnummer}
            onChange={(e) => {
              const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 3);
              onAuftragsnummerChange(onlyDigits);
            }}
            className="h-9 min-w-0 flex-1 rounded-md border border-gray-300 text-gray-800 px-2 text-sm bg-gray-50"
          />
        </div>
      </div>

      {/* DESKTOP: combined block */}
      <div className="hidden md:block min-w-0 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Arbeitsdatum
              {isIOS && <span className="ml-1">📅</span>}
            </label>

            <input
              type="text"
              readOnly
              value={dateText}
              className="h-9 w-full rounded-md border border-gray-300 px-2 text-sm bg-gray-50 text-gray-800"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Auftragsnummer
            </label>

            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm text-gray-700 whitespace-nowrap">
                {date}-
              </span>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={auftragsnummer}
                onChange={(e) => {
                  const onlyDigits = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 3);

                  onAuftragsnummerChange(onlyDigits);
                }}
                className="h-9 min-w-0 flex-1 rounded-md border border-gray-300 text-gray-800 px-2 text-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preis + Diagnose */}
      <div className="min-w-0 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <label className={`block text-xs font-medium mb-1 ${includeDiagnosis ? "text-gray-400" : "text-gray-600"}`}>
          Preis pro Stunde, €
        </label>

        <input
          type="number"
          inputMode="decimal"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          disabled={includeDiagnosis}
          className={`
            h-9 w-full rounded-md border px-2 text-sm transition-colors
            ${includeDiagnosis
              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
              : "border-gray-300 bg-gray-50 text-gray-800"
            }
          `}
        />

        <div className="mt-6 flex items-center justify-start border-t border-gray-100 pt-4 gap-4">
          <span className="text-sm font-medium text-gray-700">
            Nur Diagnose
          </span>

          <button
            type="button"
            onClick={() => onDiagnosisChange(!includeDiagnosis)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${includeDiagnosis ? "bg-blue-600" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${includeDiagnosis ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
