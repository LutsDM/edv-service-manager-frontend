"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------
 * Time helpers and types
 * ------------------------------------------------------------------ */
import {
  emptyTime,
  formatDuration,
  getEndTime,
  getNowTime,
  getToday,
  makeTimeOptions,
  type TimeParts,
} from "./time/lib/time";

/* ------------------------------------------------------------------
 * Hooks (business logic)
 * ------------------------------------------------------------------ */
import { useTimeCalculation } from "./time/hooks/useTimeCalculation";
import { usePriceCalculation } from "@/app/components/time/hooks/usePriceCalculation";
import { useEmployeesSelection } from "./time/hooks/useEmployeesSelection";
import { usePdfDownload } from "./time/hooks/usePdfDownload";
import { useOrderFormPdfDownload } from "./time/hooks/useOrderFormPdfDownload";
import { useTimeRanges } from "./time/hooks/useTimeRange";

/* ------------------------------------------------------------------
 * UI Blocks (presentation only)
 * ------------------------------------------------------------------ */
import HeaderBlock from "./time/blocks/HeaderBlock";
import EmployeesBlock from "./time/blocks/EmployeesBlock";
import ArbeitszeitBlock from "./time/blocks/ArbeitszeitBlock";
import ReportSummaryBlock from "./time/blocks/ReportSummaryBlock";
import ActionsBlock from "./time/blocks/ActionsBlock";
import AnkunftTimeBlock from "./time/blocks/AnkunftTimeBlock";
import AbfahrtTimeBlock from "./time/blocks/AbfahrtTimeBlock";

/* ------------------------------------------------------------------
 * Print / Preview
 * ------------------------------------------------------------------ */
import DocumentPreview from "./time/report/DocumentPreview";
import ServiceReport from "./time/report/ServiceReport";
import OrderFormReport from "./time/report/OrderFormReport";
import {
  emptyDocumentSignaturesMap,
  hasAnySignature,
  type DocumentType,
} from "../types/documentTypes";
import { SignatureModal } from "./time/Signature/SignatureModal";
import { Customer } from "../types/customer";
import CustomerModal from "./time/blocks/CustomerModal";
import PasswordModal from "./time/blocks/PasswordModal";
import OrderDetailsModal from "./time/blocks/OrderDetailsModal";
import LineItemsModal from "./time/blocks/LineItemsModal";
import { LineItem } from "../types/lineItem";
import { clampOrderDetails } from "./time/lib/orderDetailsLimits";


export default function TimeCalculator() {
  /* ------------------------------------------------------------------
   * Platform detection
   * ------------------------------------------------------------------ */
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  /* ------------------------------------------------------------------
   * Header state (date, order number, price)
   * ------------------------------------------------------------------ */
  const today = useMemo(() => getToday(), []);
  const [date] = useState(today);

  const [orderSuffix, setOrderSuffix] = useState<string>("001");

  const auftragsnummer = useMemo(
    () => `${today}- ${orderSuffix}`,
    [today, orderSuffix],
  );

  const [price, setPrice] = useState<string>("95");
  const [includeDiagnosis, setIncludeDiagnosis] = useState(false);

  /* ------------------------------------------------------------------
   * UI-level error (not business validation)
   * ------------------------------------------------------------------ */
  const [uiError, setUiError] = useState<string>("");

  /* ------------------------------------------------------------------
   * Working time (Von / Bis)
   * ------------------------------------------------------------------ */
  const [start, setStart] = useState<TimeParts>(getNowTime);
  const [end, setEnd] = useState<TimeParts>(getEndTime);

  /* ------------------------------------------------------------------
   * Travel time (Abfahrt / Ankunft)
   * ------------------------------------------------------------------ */
  const [ankunftVon, setAnkunftVon] = useState<TimeParts>(getNowTime);
  const [ankunftBis, setAnkunftBis] = useState<TimeParts>(getNowTime);
  const [includeAbfahrt, setIncludeAbfahrt] = useState(false);
  const [includeAnkunft, setIncludeAnkuft] = useState(false);

  const [abfahrtVon, setAbfahrtVon] = useState<TimeParts>(emptyTime);
  const [abfahrtBis, setAbfahrtBis] = useState<TimeParts>(emptyTime);
  /* ------------------------------------------------------------------
   * Customer
   * ------------------------------------------------------------------ */
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  /** Nur Auftragsformular (nicht Servicebericht) */
  const [auftragPasswort, setAuftragPasswort] = useState("");
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  /* ------------------------------------------------------------------
   * OrderDetails
   * ------------------------------------------------------------------ */

  const [orderDetails, setOrderDetails] = useState<string>("");
  const [isOrderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
  /* ------------------------------------------------------------------
   * Custom line items
   * ------------------------------------------------------------------ */

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLineItemsModalOpen, setLineItemsModalOpen] = useState(false);

  const hasLineItems = lineItems.length > 0;
  const lineItemsButtonText = hasLineItems
    ? `Zusatzpositionen: ${lineItems.length}`
    : "Zusatzpositionen hinzufügen";

  const lineItemsTotalCents = useMemo(
    () => lineItems.reduce((sum, i) => sum + i.amountCents, 0),
    [lineItems],
  );

  const lineItemsBrutto = lineItemsTotalCents / 100;

  /* ------------------------------------------------------------------
   * Employees selection logic
   * ------------------------------------------------------------------ */
  const {
    // state
    selectedEmployees,
    employeeToAdd,
    isAdding,
    isAddingCustom,
    customEmployeeName,

    // setters
    setEmployeeToAdd,
    setIsAdding,
    setIsAddingCustom,
    setCustomEmployeeName,

    // derived
    availableEmployees,
    employeeCount,
    hasEmployees,

    // actions
    startAddFromList,
    startAddCustom,
    cancelAdd,
    addEmployeeFromList,
    addCustomEmployee,
    removeEmployee,

    hydrateEmployees,
  } = useEmployeesSelection();

  /* ------------------------------------------------------------------
   * Preview: which document is shown (null = form view)
   * ------------------------------------------------------------------ */
  const [previewDocumentType, setPreviewDocumentType] =
    useState<DocumentType | null>(null);

  /* ------------------------------------------------------------------
   * Signatures per document (auftrag / service)
   * ------------------------------------------------------------------ */
  const [signatures, setSignatures] = useState(() =>
    emptyDocumentSignaturesMap(),
  );

  /* ------------------------------------------------------------------
   * Signature modal: which document + role is being edited
   * ------------------------------------------------------------------ */
  const [signatureModalTarget, setSignatureModalTarget] = useState<{
    documentType: DocumentType;
    role: "kunde" | "employee";
  } | null>(null);

  /* ------------------------------------------------------------------
   * Save service report in Local Storage
   * ------------------------------------------------------------------ */
  const STORAGE_KEY = "service_report_draft";

  const [isHydrated, setIsHydrated] = useState(false);

  /* ------------------------------------------------------------------
   * Form fingerprint  * ------------------------------------------------------------------ */
  const formFingerprint = useMemo(
    () =>
      JSON.stringify({
        date,
        orderSuffix,
        price,
        start,
        end,
        ankunftVon,
        ankunftBis,
        includeAbfahrt,
        includeAnkunft,
        abfahrtVon,
        abfahrtBis,
        selectedEmployees,
        customer,
        auftragPasswort,
        orderDetails,
        lineItems,
      }),
    [
      date,
      orderSuffix,
      price,
      start,
      end,
      ankunftVon,
      ankunftBis,
      includeAbfahrt,
      includeAnkunft,
      abfahrtVon,
      abfahrtBis,
      selectedEmployees,
      customer,
      auftragPasswort,
      orderDetails,
      lineItems,
    ],
  );
  const prevFormFingerprintRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (
      prevFormFingerprintRef.current !== null &&
      prevFormFingerprintRef.current !== formFingerprint &&
      hasAnySignature(signatures)
    ) {
      setSignatures(emptyDocumentSignaturesMap());
    }
    prevFormFingerprintRef.current = formFingerprint;
  }, [formFingerprint, isHydrated, signatures]);

  const draft = useMemo(
    () => ({
      date,
      orderSuffix,
      price,
      start,
      end,
      ankunftVon,
      ankunftBis,
      includeAbfahrt,
      includeAnkunft,
      abfahrtVon,
      abfahrtBis,
      selectedEmployees,
      customer,
      auftragPasswort,
      orderDetails,
      signatures,
      lineItems,
    }),
    [
      date,
      orderSuffix,
      price,
      start,
      end,
      ankunftVon,
      ankunftBis,
      includeAbfahrt,
      includeAnkunft,
      abfahrtVon,
      abfahrtBis,
      selectedEmployees,
      customer,
      auftragPasswort,
      orderDetails,
      signatures,
      lineItems,
    ],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setSignatures(emptyDocumentSignaturesMap());
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      if (typeof parsed.auftragsnummer === "string") {
        const suffix = parsed.auftragsnummer.substring(12).trim();
        setOrderSuffix(suffix || "001");
      } else if (typeof parsed.orderSuffix === "string") {
        setOrderSuffix(parsed.orderSuffix.trim() || "001");
      } else {
        setOrderSuffix("001");
      }

      if (parsed.price) setPrice(parsed.price);

      if (parsed.start) setStart(parsed.start);
      if (parsed.end) setEnd(parsed.end);

      if (parsed.ankunftVon) setAnkunftVon(parsed.ankunftVon);
      if (parsed.ankunftBis) setAnkunftBis(parsed.ankunftBis);

      if (typeof parsed.includeAbfahrt === "boolean") {
        setIncludeAbfahrt(parsed.includeAbfahrt);
      }
      if (typeof parsed.includeAnkunft === "boolean") {
        setIncludeAnkuft(parsed.includeAnkunft);
      }

      if (parsed.abfahrtVon) setAbfahrtVon(parsed.abfahrtVon);
      if (parsed.abfahrtBis) setAbfahrtBis(parsed.abfahrtBis);

      if (Array.isArray(parsed.selectedEmployees)) {
        hydrateEmployees(parsed.selectedEmployees);
      }

      setCustomer(parsed.customer ?? null);

      if (typeof parsed.auftragPasswort === "string") {
        setAuftragPasswort(parsed.auftragPasswort);
      } else {
        setAuftragPasswort("");
      }

      if (typeof parsed.orderDetails === "string") {
        setOrderDetails(clampOrderDetails(parsed.orderDetails));
      } else {
        setOrderDetails("");
      }
      if (Array.isArray(parsed.lineItems)) {
        setLineItems(
          (parsed.lineItems as unknown[])
            .filter(
              (
                x,
              ): x is {
                id?: unknown;
                title: string;
                amountCents?: unknown;
              } => {
                if (!x || typeof x !== "object") return false;
                const obj = x as {
                  id?: unknown;
                  title?: unknown;
                  amountCents?: unknown;
                };
                return typeof obj.title === "string";
              },
            )
            .map((x) => ({
              id: typeof x.id === "string" ? x.id : crypto.randomUUID(),
              title: x.title,
              amountCents:
                typeof x.amountCents === "number" ? x.amountCents : 0,
            })),
        );
      } else {
        setLineItems([]);
      }

      if (parsed.signatures?.auftrag && parsed.signatures?.service) {
        setSignatures({
          auftrag: {
            kunde: parsed.signatures.auftrag.kunde ?? null,
            employee: parsed.signatures.auftrag.employee ?? null,
          },
          service: {
            kunde: parsed.signatures.service.kunde ?? null,
            employee: parsed.signatures.service.employee ?? null,
          },
        });
      } else {
        setSignatures({
          ...emptyDocumentSignaturesMap(),
          service: {
            kunde: parsed.signatureKunde ?? null,
            employee: parsed.signatureEmployee ?? null,
          },
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, [hydrateEmployees]);

  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === "undefined") return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, isHydrated]);

  /* ------------------------------------------------------------------
   * Function fur Reset Button
   * ------------------------------------------------------------------ */
  const resetForm = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }

    setOrderSuffix("001");
    setPrice("95");

    setStart(getNowTime());
    setEnd(getEndTime());

    setAnkunftVon(getNowTime());
    setAnkunftBis(getNowTime());

    setIncludeAbfahrt(false);
    setIncludeAnkuft(false);
    setAbfahrtVon(emptyTime);
    setAbfahrtBis(emptyTime);

    setCustomer(null);
    setAuftragPasswort("");

    hydrateEmployees([]);

    setSignatures(emptyDocumentSignaturesMap());

    setOrderDetails("");

    setLineItems([]);
  };

  /* ------------------------------------------------------------------
   * Time select options (memoized once)
   * ------------------------------------------------------------------ */
  const timeOptions = useMemo(
    () => ({
      hours: makeTimeOptions(24),
      minutes: makeTimeOptions(60),
    }),
    [],
  );

  /* ------------------------------------------------------------------
   * Core business calculation (time validation + totals)
   * ------------------------------------------------------------------ */
  const { report, error } = useTimeCalculation({
    ankunftVon,
    ankunftBis,
    start,
    end,
    abfahrtVon,
    abfahrtBis,
    includeAbfahrt,
    includeAnkunft,
  });

  /* ------------------------------------------------------------------
   * Price calculation (derived values only)
   * ------------------------------------------------------------------ */
  const { brutto, netto, mwst, stundensatzText, serviceBrutto, extraBrutto } =
    usePriceCalculation({
      report,
      price,
      employeeCount,
      extraBruttoAmount: lineItemsBrutto,
    });

  /* ------------------------------------------------------------------
   * Formatted time ranges (for UI + PDF)
   * ------------------------------------------------------------------ */
  const { ankunftRange, arbeitszeitRange, abfahrtRange } = useTimeRanges({
    report,
    ankunftVon,
    ankunftBis,
    start,
    end,
    abfahrtVon,
    abfahrtBis,
    includeAbfahrt,
    includeAnkunft,
  });

  /* ------------------------------------------------------------------
   * PDF download: Servicebericht (uses signatures.service)
   * ------------------------------------------------------------------ */
  const downloadServicePdf = usePdfDownload({
    report,
    date,
    auftragsnummer,
    includeAbfahrt,
    includeAnkunft,
    ankunftRange,
    arbeitszeitRange,
    abfahrtRange,
    stundensatzText,
    employeeCount,
    netto,
    mwst,
    brutto,
    employees: selectedEmployees,
    isIOS,
    customer,
    signatureKunde: signatures.service.kunde,
    signatureEmployee: signatures.service.employee,
    orderDetails,
    lineItems,
    extraBrutto: lineItemsTotalCents / 100,
    serviceBrutto,
  });

  /* ------------------------------------------------------------------
   * PDF download: Auftragsformular (uses signatures.auftrag)
   * ------------------------------------------------------------------ */
  const downloadOrderFormPdf = useOrderFormPdfDownload({
    includeDiagnosis,
    date,
    auftragsnummer,
    preisProStunde: `${price.replace(".", ",")} €`,
    mitarbeiterAnzahl: employeeCount,
    employees: selectedEmployees,
    customer,
    auftragPasswort,
    signatureKunde: signatures.auftrag.kunde,
    signatureEmployee: signatures.auftrag.employee,
    orderDetails,
    lineItems,
    extraBrutto: lineItemsTotalCents / 100,
    isIOS,
  });

  /* ------------------------------------------------------------------
   * Kunden button
   * ------------------------------------------------------------------ */

  const hasCustomer = Boolean(customer);

  const customerName = useMemo(() => {
    if (!customer) return "";
    const name = [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name;
  }, [customer]);

  const customerButtonText = hasCustomer
    ? `Kundendaten: ${customerName || "gespeichert"}`
    : "Kundendaten hinzufügen";

  const hasPasswort = auftragPasswort.trim().length > 0;
  const passwortButtonText = hasPasswort
    ? "Passwort: gespeichert"
    : "Passwort hinzufügen";

  /* ------------------------------------------------------------------
   * OrderDetails Modal
   * ------------------------------------------------------------------ */

  const hasOrderDetails = orderDetails.trim().length > 0;

  const orderDetailsButtonText = hasOrderDetails
    ? "Auftragsdetails/Servicedetails: hinzugefügt"
    : "Auftragsdetails/Servicedetails hinzufügen";

  /* ==================================================================
   * RENDER
   * ================================================================== */
  return (
    <>
      {/* ===================== FORM VIEW ===================== */}
      <div
        className={`
          min-h-screen bg-gray-50 p-4 sm:p-6
          ${previewDocumentType !== null ? "hidden" : "block"}
          print:hidden
        `}
      >
        <div className="w-full max-w-md md:max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Auftragsdokumentation
          </h1>

          {/* Header (date, order number, price) */}
          <HeaderBlock
            diagnosis={includeDiagnosis}
            onDiagnosisChange={setIncludeDiagnosis}
            date={date}
            auftragsnummer={orderSuffix}
            onAuftragsnummerChange={setOrderSuffix}
            price={price}
            onPriceChange={setPrice}
            isIOS={isIOS}
          />
          {/* Customer Modal*/}
          <button
            onClick={() => setCustomerModalOpen(true)}
            className={`
      w-full rounded-lg py-2 text-sm font-medium border
      transition-colors flex items-center justify-center gap-2
      ${
        hasCustomer
          ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
          : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200"
      }
      active:scale-[0.98]
      `}
          >
            {hasCustomer && <span className="text-base leading-none">✔</span>}
            <span className="truncate max-w-[85%]">{customerButtonText}</span>
          </button>

          {isCustomerModalOpen && (
            <CustomerModal
              initialValue={customer}
              onSave={setCustomer}
              onClose={() => setCustomerModalOpen(false)}
            />
          )}

          {/* Order Details*/}
          <button
            onClick={() => setOrderDetailsModalOpen(true)}
            className={`
    w-full rounded-lg py-2 text-sm font-medium border
    transition-colors flex items-center justify-center gap-2
    ${
      hasOrderDetails
        ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
        : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200"
    }
    active:scale-[0.98]
  `}
          >
            {hasOrderDetails && (
              <span className="text-base leading-none">✔</span>
            )}
            <span className="truncate max-w-[85%]">
              {orderDetailsButtonText}
            </span>
          </button>

          {isOrderDetailsModalOpen && (
            <OrderDetailsModal
              initialValue={orderDetails}
              onSave={setOrderDetails}
              onClose={() => setOrderDetailsModalOpen(false)}
            />
          )}

          {/* Passwort — nur Auftragsformular */}
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className={`
      w-full rounded-lg py-2 text-sm font-medium border
      transition-colors flex items-center justify-center gap-2
      ${
        hasPasswort
          ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
          : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200"
      }
      active:scale-[0.98]
      `}
          >
            {hasPasswort && <span className="text-base leading-none">✔</span>}
            <span className="truncate max-w-[85%]">{passwortButtonText}</span>
          </button>

          {isPasswordModalOpen && (
            <PasswordModal
              initialValue={auftragPasswort}
              onSave={setAuftragPasswort}
              onClose={() => setPasswordModalOpen(false)}
            />
          )}

          {/* Custom line items button*/}
          <button
            onClick={() => setLineItemsModalOpen(true)}
            className={`
    w-full rounded-lg py-2 text-sm font-medium border
    transition-colors flex items-center justify-center gap-2
    ${
      hasLineItems
        ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
        : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200"
    }
    active:scale-[0.98]
  `}
          >
            {hasLineItems && <span className="text-base leading-none">✔</span>}
            <span className="truncate max-w-[85%]">{lineItemsButtonText}</span>
          </button>

          {isLineItemsModalOpen && (
            <LineItemsModal
              initialValue={lineItems}
              onSave={setLineItems}
              onClose={() => setLineItemsModalOpen(false)}
            />
          )}

          {/* Employees selection */}
          <EmployeesBlock
            selectedEmployees={selectedEmployees}
            availableEmployees={availableEmployees}
            employeeToAdd={employeeToAdd}
            isAdding={isAdding}
            isAddingCustom={isAddingCustom}
            customEmployeeName={customEmployeeName}
            hasEmployees={hasEmployees}
            onStartAddFromList={startAddFromList}
            onStartAddCustom={startAddCustom}
            onCancelAdd={cancelAdd}
            onEmployeeToAddChange={setEmployeeToAdd}
            onCustomEmployeeNameChange={setCustomEmployeeName}
            onAddEmployeeFromList={addEmployeeFromList}
            onAddCustomEmployee={addCustomEmployee}
            onRemoveEmployee={removeEmployee}
          />

          {/* Ankunft Travel time */}
          <AnkunftTimeBlock
            includeAnkunft={includeAnkunft}
            onToggleIncludeAnkunft={setIncludeAnkuft}
            ankunftVon={ankunftVon}
            ankunftBis={ankunftBis}
            onAnkunftVonChange={setAnkunftVon}
            onAnkunftBisChange={setAnkunftBis}
            timeOptions={timeOptions}
          />

          {/* Working time */}
          <ArbeitszeitBlock
            start={start}
            end={end}
            onStartChange={setStart}
            onEndChange={setEnd}
            timeOptions={timeOptions}
          />

          {/* Abfahrt Travel time */}
          <AbfahrtTimeBlock
            includeAbfahrt={includeAbfahrt}
            onToggleIncludeAbfahrt={setIncludeAbfahrt}
            abfahrtVon={abfahrtVon}
            abfahrtBis={abfahrtBis}
            onAbfahrtVonChange={setAbfahrtVon}
            onAbfahrtBisChange={setAbfahrtBis}
            timeOptions={timeOptions}
          />

          {/* Validation errors */}
          {error && (
            <div className="border border-red-300 bg-red-50 p-3 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Report summary */}
          {report && (
            <ReportSummaryBlock
              report={report}
              includeAbfahrt={includeAbfahrt}
              includeAnkunft={includeAnkunft}
              employeeCount={employeeCount}
              serviceBrutto={serviceBrutto}
            />
          )}

          {/* UI errors */}
          {uiError && (
            <div className="border border-red-300 bg-red-50 p-3 text-red-700 rounded-md">
              {uiError}
            </div>
          )}

          {/* Actions */}
          <ActionsBlock
            hasEmployees={hasEmployees}
            onReset={resetForm}
            onCreateAuftragsformular={() => setPreviewDocumentType("auftrag")}
            onCreateServicebericht={() => setPreviewDocumentType("service")}
          />
        </div>
      </div>

      {/* ===================== DOCUMENT PREVIEW ===================== */}
      {previewDocumentType === "auftrag" && (
        <div
          id="print-preview"
          className={previewDocumentType ? "block" : "hidden"}
        >
          <DocumentPreview
            documentType="auftrag"
            onClose={() => setPreviewDocumentType(null)}
            signatureKunde={signatures.auftrag.kunde}
            signatureEmployee={signatures.auftrag.employee}
            onOpenKundeSignature={() =>
              setSignatureModalTarget({
                documentType: "auftrag",
                role: "kunde",
              })
            }
            onOpenEmployeeSignature={() =>
              setSignatureModalTarget({
                documentType: "auftrag",
                role: "employee",
              })
            }
            onDownloadPdf={downloadOrderFormPdf}
          >
            <OrderFormReport
              diagnose={includeDiagnosis}
              arbeitsdatum={date}
              auftragsnummer={auftragsnummer}
              preisProStunde={`${price.replace(".", ",")} €`}
              mitarbeiterAnzahl={employeeCount}
              orderDetails={orderDetails}
              lineItems={lineItems}
              extraBrutto={
                lineItems.length
                  ? `${extraBrutto.toFixed(2).replace(".", ",")} €`
                  : undefined
              }
              employees={selectedEmployees}
              customer={customer}
              auftragPasswort={auftragPasswort}
              signatureKunde={signatures.auftrag.kunde}
              signatureEmployee={signatures.auftrag.employee}
            />
          </DocumentPreview>
        </div>
      )}

      {previewDocumentType === "service" && report && (
        <div
          id="print-preview"
          className={previewDocumentType ? "block" : "hidden"}
        >
          <DocumentPreview
            documentType="service"
            onClose={() => setPreviewDocumentType(null)}
            signatureKunde={signatures.service.kunde}
            signatureEmployee={signatures.service.employee}
            onOpenKundeSignature={() =>
              setSignatureModalTarget({
                documentType: "service",
                role: "kunde",
              })
            }
            onOpenEmployeeSignature={() =>
              setSignatureModalTarget({
                documentType: "service",
                role: "employee",
              })
            }
            onDownloadPdf={downloadServicePdf}
          >
            <ServiceReport
              arbeitsdatum={date}
              auftragsnummer={auftragsnummer}
              arbeitszeitText={formatDuration(report.arbeitszeit)}
              arbeitszeitRange={arbeitszeitRange}
              abfahrtText={
                includeAbfahrt ? formatDuration(report.abfahrt) : undefined
              }
              abfahrtRange={abfahrtRange}
              ankunftText={
                includeAnkunft ? formatDuration(report.ankunftzeit) : undefined
              }
              ankunftRange={ankunftRange}
              gesamtzeitText={formatDuration(report.gesamtzeit)}
              stundensatz={stundensatzText}
              mitarbeiterAnzahl={employeeCount}
              netto={`${netto.toFixed(2)} €`}
              mwst={`${mwst.toFixed(2)} €`}
              brutto={`${brutto.toFixed(2)} €`}
              employees={selectedEmployees}
              customer={customer}
              showBackButton={false}
              signatureKunde={signatures.service.kunde}
              signatureEmployee={signatures.service.employee}
              orderDetails={orderDetails}
              lineItems={lineItems}
              extraBrutto={
                lineItems.length ? `${extraBrutto.toFixed(2)} €` : undefined
              }
            />
          </DocumentPreview>
        </div>
      )}

      {previewDocumentType === "service" && !report && (
        <div className="p-4 w-full max-w-md md:max-w-2xl mx-auto">
          <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
            Bitte Zeitangaben (Ankunft, Arbeitszeit, ggf. Abfahrt) prüfen, um
            den Servicebericht anzuzeigen.
          </p>
          <button
            type="button"
            onClick={() => setPreviewDocumentType(null)}
            className="mt-3 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Zurück
          </button>
        </div>
      )}

      {/* Signature modal (shared for both document types) */}
      {signatureModalTarget && (
        <SignatureModal
          open={true}
          onClose={() => setSignatureModalTarget(null)}
          signature={
            signatures[signatureModalTarget.documentType][
              signatureModalTarget.role
            ]
          }
          setSignature={(v) =>
            setSignatures((prev) => ({
              ...prev,
              [signatureModalTarget.documentType]: {
                ...prev[signatureModalTarget.documentType],
                [signatureModalTarget.role]: v,
              },
            }))
          }
        />
      )}
    </>
  );
}
