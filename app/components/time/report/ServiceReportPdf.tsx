"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Employee } from "../lib/employees";
import { Customer } from "@/app/types/customer";
import { LineItem } from "@/app/types/lineItem";
import { DIAGNOSIS_FLAT_BRUTTO_EUR } from "../lib/diagnosisConstants";

type Props = {
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
  includeDiagnosis?: boolean;

  netto: string;
  mwst: string;
  brutto: string;

  employees: Employee[];
  customer?: Customer | null;

  signatureKunde: string | null;
  signatureEmployee: string | null;

  orderDetails: string | null;

  lineItems?: LineItem[];
  extraBrutto?: string;

  serviceBrutto?: string;
};

const MAX_DETAILS_FIRST_PAGE_WEIGHT = 500;
const MIN_DETAILS_SECOND_PAGE_WEIGHT = 100;

function normalizeDetailsText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getTextWeight(text: string) {
  const emptyLinesCount = (text.match(/\n\s*\n/g) || []).length;
  return text.length + emptyLinesCount * 80;
}

function splitDetailsByParagraphs(text: string | null) {
  if (!text?.trim()) {
    return {
      firstPart: "",
      secondPart: "",
    };
  }

  const normalized = normalizeDetailsText(text);

  if (getTextWeight(normalized) <= MAX_DETAILS_FIRST_PAGE_WEIGHT) {
    return {
      firstPart: normalized,
      secondPart: "",
    };
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const first: string[] = [];
  const second: string[] = [];

  let currentWeight = 0;

  for (const paragraph of paragraphs) {
    const paragraphWeight = getTextWeight(paragraph);
    const nextWeight = currentWeight + paragraphWeight + 80;

    if (nextWeight <= MAX_DETAILS_FIRST_PAGE_WEIGHT || first.length === 0) {
      first.push(paragraph);
      currentWeight = nextWeight;
    } else {
      second.push(paragraph);
    }
  }

  const secondText = second.join("\n\n");

  if (
    getTextWeight(secondText) < MIN_DETAILS_SECOND_PAGE_WEIGHT &&
    first.length > 1
  ) {
    const movedParagraph = first.pop();

    if (movedParagraph) {
      second.unshift(movedParagraph);
    }
  }

  return {
    firstPart: first.join("\n\n"),
    secondPart: second.join("\n\n"),
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 104,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111",
  },

  headerRow: {
    flexDirection: "column",
    marginBottom: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBlocksRow: {
    flexDirection: "row",
    columnGap: 2,
  },
  headerBlock: {
    width: "23%",
    minHeight: 70,
  },
  headerBlockWide: {
    width: "29%",
  },
  blockTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
    marginBottom: 1,
  },
  companyLine: {
    fontSize: 7.8,
    lineHeight: 1.22,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#999",
  },
  contactsFooter: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 20,
  },
  contactsContent: {
    marginTop: 8,
  },

  customerBlock: {
    fontSize: 11,
    lineHeight: 1.4,
    marginTop: 12,
  },

  titleBlock: {
    textAlign: "right",
    marginBottom: 16,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 0,
    height: 66,
    marginTop: 2,
  },
  titleLogo: {
    width: 150,
    height: 66,
    marginRight: -36,
    objectFit: "contain",
  },
  brandTextBlock: {
    justifyContent: "center",
    paddingTop: 14,
    marginLeft: -6,
  },
  brandService: {
    fontSize: 13,
    fontWeight: 900,
    lineHeight: 1.05,
    fontFamily: "Helvetica",
  },
  brandSamirae: {
    fontSize: 13,
    lineHeight: 1.05,
    fontFamily: "Helvetica",
  },
  brandLine: {
    width: 82,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },

  table: {
    borderWidth: 1,
    borderColor: "#999",
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
  },
  tableRowNoBottom: {
    borderBottomWidth: 0,
  },
  tableCellLeft: {
    flex: 1,
    padding: 4,
  },
  tableCellRight: {
    width: 110,
    padding: 4,
    alignItems: "flex-end",
  },

  muted: {
    fontSize: 10,
    color: "#666",
  },
  ledgerText: {
    fontSize: 9,
  },
  ledgerMuted: {
    fontSize: 8,
    color: "#666",
  },
  bold: {
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#999",
  },

  totals: {
    width: "45%",
    marginLeft: "auto",
    marginBottom: 14,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totalsSum: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 6,
    marginTop: 6,
    fontWeight: "bold",
  },
  totalsSubsum: {
    borderTopWidth: 1,
    borderTopColor: "#999",
    paddingTop: 6,
    marginTop: 6,
    fontWeight: "bold",
  },

  orderDetailsBlock: {
    marginTop: 12,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#999",
    backgroundColor: "#f5f5f5",
    fontSize: 10,
    lineHeight: 1.4,
  },
  orderDetailsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
  },
  orderDetailsBody: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  continuationHint: {
    marginTop: 8,
    fontSize: 9,
    color: "#666",
    fontStyle: "italic",
  },

  footerSignatures: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  signatureBox: {
    width: "48%",
    textAlign: "center",
  },
  signatureImageWrapper: {
    height: 40,
    justifyContent: "flex-end",
  },
  signatureImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#555",
    marginTop: 4,
    marginBottom: 6,
  },
});

function ContactsFooter() {
  return (
    <View style={styles.contactsFooter} fixed>
      <View style={styles.headerDivider} />
      <View style={[styles.headerBlocksRow, styles.contactsContent]}>
        <View style={styles.headerBlock}>
          <Text style={styles.blockTitle}>Standort Monheim:</Text>
          <Text style={styles.companyLine}>EDV-SERVICE Samirae</Text>
          <Text style={styles.companyLine}>Frank Samirae</Text>
          <Text style={styles.companyLine}>Franz-Boehm-Str. 3</Text>
          <Text style={styles.companyLine}>40789 Monheim</Text>
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.blockTitle}>Standort Bergisch Gladbach:</Text>
          <Text style={styles.companyLine}>EDV-SERVICE Samirae</Text>
          <Text style={styles.companyLine}>Frank Samirae</Text>
          <Text style={styles.companyLine}>Schloßstrasse 33</Text>
          <Text style={styles.companyLine}>51429 Bergisch Gladbach</Text>
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.companyLine}>Telefon: 02173 / 9939835</Text>
          <Text style={styles.companyLine}>Telefon: 02204 / 96 70 720</Text>
          <Text style={styles.companyLine}>Mobil: 0221 / 677 744 67</Text>
          <Text style={styles.companyLine}>E-Mail: mail@edvsamirae.de</Text>
          <Text style={styles.companyLine}>Web: www.edvsamirae.de</Text>
        </View>

        <View style={[styles.headerBlock, styles.headerBlockWide]}>
          <Text style={styles.companyLine}>Umsatzsteuer-ID: DE288598216</Text>
          <Text style={styles.companyLine}>Steuer-Nr.: 135 5247 4113</Text>
          <Text style={styles.companyLine}>
            IBAN: DE62 1001 1001 2623 2363 37
          </Text>
          <Text style={styles.companyLine}>BIC: NTSBDEB1XXX</Text>
        </View>
      </View>
    </View>
  );
}

function Signatures({
  signatureEmployee,
  signatureKunde,
  employees,
  customer,
}: {
  signatureEmployee: string | null;
  signatureKunde: string | null;
  employees: Employee[];
  customer?: Customer | null;
}) {
  return (
    <View style={styles.footerSignatures} wrap={false}>
      <View style={styles.signatureBox}>
        <Text style={styles.bold}>Ausgeführt durch:</Text>
        <View style={styles.signatureImageWrapper}>
          {signatureEmployee ? (
            <Image src={signatureEmployee} style={styles.signatureImage} />
          ) : (
            <Text style={styles.muted}></Text>
          )}
        </View>
        <View style={styles.signatureLine} />
        <Text>{employees?.[0]?.name || "Mitarbeiter"}</Text>
      </View>

      <View style={styles.signatureBox}>
        <Text style={styles.bold}>Kunde:</Text>
        <View style={styles.signatureImageWrapper}>
          {signatureKunde ? (
            <Image src={signatureKunde} style={styles.signatureImage} />
          ) : (
            <Text style={styles.muted}></Text>
          )}
        </View>
        <View style={styles.signatureLine} />
        <Text>
          {customer ? `${customer.firstName} ${customer.lastName}` : "Kunde"}
        </Text>
      </View>
    </View>
  );
}

export default function ServiceReportPdf(props: Props) {
  const {
    arbeitsdatum,
    auftragsnummer,
    kundenNr,
    arbeitszeitText,
    arbeitszeitRange,
    ankunftText,
    ankunftRange,
    abfahrtText,
    abfahrtRange,
    gesamtzeitText,
    stundensatz,
    mitarbeiterAnzahl,
    includeDiagnosis = false,
    netto,
    mwst,
    brutto,
    employees,
    customer,
    signatureKunde,
    signatureEmployee,
    orderDetails,
    lineItems,
    extraBrutto,
    serviceBrutto,
  } = props;

  const {
    firstPart: orderDetailsFirstPart,
    secondPart: orderDetailsSecondPart,
  } = splitDetailsByParagraphs(orderDetails);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerTopRow}>
            <View>
              {customer && (
                <View style={styles.customerBlock}>
                  <Text style={styles.bold}>Kunde</Text>

                  {customer.type === "company" && customer.companyName && (
                    <Text>{customer.companyName}</Text>
                  )}

                  <Text>
                    {customer.firstName} {customer.lastName}
                  </Text>

                  <Text>
                    {customer.street} {customer.houseNumber}
                  </Text>

                  <Text>
                    {customer.postalCode} {customer.city}
                  </Text>

                  {customer.phone && <Text>Tel. {customer.phone}</Text>}
                  {customer.mobilePhone && (
                    <Text>Mobil: {customer.mobilePhone}</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.titleLeft}>
              <Image src="/LOGO.png" style={styles.titleLogo} />
              <View style={styles.brandTextBlock}>
                <Text style={[styles.brandService, styles.brandLine]}>
                  SERVICE
                </Text>
                <Text style={[styles.brandSamirae, styles.brandLine]}>
                  SAMIRAE
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Servicebericht</Text>
          <Text>Arbeitsdatum: {arbeitsdatum}</Text>
          <Text>Auftragsnummer: {auftragsnummer}</Text>
          {kundenNr && <Text>Kunden Nr: {kundenNr}</Text>}
        </View>

        <View style={styles.table}>
          {!includeDiagnosis && ankunftText && ankunftRange && (
            <View style={styles.tableRow}>
              <View style={styles.tableCellLeft}>
                <Text style={styles.ledgerText}>Ankunft</Text>
                <Text style={styles.ledgerMuted}>({ankunftRange})</Text>
              </View>
              <View style={styles.tableCellRight}>
                <Text style={styles.ledgerText}>{ankunftText}</Text>
              </View>
            </View>
          )}

          {!includeDiagnosis && (
            <View style={styles.tableRow}>
              <View style={styles.tableCellLeft}>
                <Text style={styles.ledgerText}>Arbeitszeit</Text>
                <Text style={styles.ledgerMuted}>({arbeitszeitRange})</Text>
              </View>
              <View style={styles.tableCellRight}>
                <Text style={styles.ledgerText}>{arbeitszeitText}</Text>
              </View>
            </View>
          )}

          {!includeDiagnosis && abfahrtText && abfahrtRange && (
            <View style={styles.tableRow}>
              <View style={styles.tableCellLeft}>
                <Text style={styles.ledgerText}>Abfahrt</Text>
                <Text style={styles.ledgerMuted}>({abfahrtRange})</Text>
              </View>
              <View style={styles.tableCellRight}>
                <Text style={styles.ledgerText}>{abfahrtText}</Text>
              </View>
            </View>
          )}

          {!includeDiagnosis && (
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCellLeft, styles.ledgerText, styles.bold]}
              >
                Gesamtzeit
              </Text>
              <View style={styles.tableCellRight}>
                <Text style={[styles.ledgerText, styles.bold]}>
                  {gesamtzeitText}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.tableRow}>
            <Text style={[styles.tableCellLeft, styles.ledgerText]}>
              {includeDiagnosis ? "Diagnose" : "Stundensatz"}
            </Text>
            <View style={styles.tableCellRight}>
              <Text style={styles.ledgerText}>
                {includeDiagnosis
                  ? `${DIAGNOSIS_FLAT_BRUTTO_EUR.toFixed(2).replace(".", ",")} €`
                  : stundensatz}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.tableRow,
              ...(lineItems?.length ? [styles.tableRowNoBottom] : []),
            ]}
          >
            <Text style={[styles.tableCellLeft, styles.ledgerText]}>
              Mitarbeiteranzahl
            </Text>
            <View style={styles.tableCellRight}>
              <Text style={styles.ledgerText}>{mitarbeiterAnzahl}</Text>
            </View>
          </View>

          {lineItems?.length ? (
            <>
              <View style={styles.divider} />

              {lineItems.map((item, index) => {
                const isLast = index === lineItems.length - 1;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.tableRow,
                      ...(isLast ? [styles.tableRowNoBottom] : []),
                    ]}
                  >
                    <Text style={[styles.tableCellLeft, styles.ledgerText]}>
                      {item.title}
                    </Text>
                    <View style={styles.tableCellRight}>
                      <Text style={styles.ledgerText}>
                        {(item.amountCents / 100).toFixed(2).replace(".", ",")}{" "}
                        €
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          ) : null}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.ledgerText}>Nettobetrag (Arbeit)</Text>
            <Text style={styles.ledgerText}>{netto}</Text>
          </View>

          <View style={styles.totalsRow}>
            <Text style={styles.ledgerText}>MwSt 19 % (Arbeit)</Text>
            <Text style={styles.ledgerText}>{mwst}</Text>
          </View>

          {serviceBrutto ? (
            <View style={[styles.totalsRow, styles.totalsSubsum]}>
              <Text style={styles.ledgerText}>Zwischensumme Arbeit</Text>
              <Text style={styles.ledgerText}>{serviceBrutto}</Text>
            </View>
          ) : null}

          {extraBrutto ? (
            <View style={[styles.totalsRow, { marginTop: 6 }]}>
              <Text style={styles.ledgerText}>Zusatzpositionen</Text>
              <Text style={styles.ledgerText}>{extraBrutto}</Text>
            </View>
          ) : null}

          <View style={[styles.totalsRow, styles.totalsSum]}>
            <Text style={[styles.ledgerText, styles.bold]}>Gesamtbetrag</Text>
            <Text style={[styles.ledgerText, styles.bold]}>{brutto}</Text>
          </View>
        </View>

        {orderDetailsFirstPart ? (
          <View style={styles.orderDetailsBlock}>
            <Text style={styles.orderDetailsTitle}>
              Ausführung der Arbeiten
            </Text>
            <Text style={styles.orderDetailsBody}>{orderDetailsFirstPart}</Text>

          </View>
        ) : null}
        
        {orderDetailsSecondPart ? (
          <Text style={styles.continuationHint}>
            Fortsetzung auf der nächsten Seite.
          </Text>
        ) : null}

        {!orderDetailsSecondPart ? (
          <Signatures
            signatureEmployee={signatureEmployee}
            signatureKunde={signatureKunde}
            employees={employees}
            customer={customer}
          />
        ) : null}

        <ContactsFooter />
      </Page>

      {orderDetailsSecondPart ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.orderDetailsBlock}>
            <Text style={styles.orderDetailsTitle}>
              Ausführung der Arbeiten (Fortsetzung)
            </Text>
            <Text style={styles.orderDetailsBody}>
              {orderDetailsSecondPart}
            </Text>
          </View>

          <Signatures
            signatureEmployee={signatureEmployee}
            signatureKunde={signatureKunde}
            employees={employees}
            customer={customer}
          />

          <ContactsFooter />
        </Page>
      ) : null}
    </Document>
  );
}