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
import {
  ORDER_FORM_AGB_TITLE,
  splitOrderFormAgbSectionsIntoColumns,
} from "./orderFormAgbContent";

type OrderFormPdfProps = {
  diagnosis: boolean
  arbeitsdatum: string;
  auftragsnummer: string;
  kundenNr?: string;
  preisProStunde: string;
  mitarbeiterAnzahl: number;
  orderDetails: string | null;
  lineItems: LineItem[];
  extraBrutto?: string;
  employees: Employee[];
  customer?: Customer | null;
  auftragPasswort: string;
  signatureKunde: string | null;
  signatureEmployee: string | null;
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
  headerBlocksRow: { flexDirection: "row", columnGap: 2 },
  headerBlock: { width: "23%", minHeight: 70 },
  headerBlockWide: { width: "29%" },
  blockTitle: { fontSize: 8.5, fontWeight: "bold", marginBottom: 1 },
  companyLine: { fontSize: 7.8, lineHeight: 1.22 },
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
  disclaimerBlock: {
    marginBottom: 14,
    padding: 0,
    fontSize: 6,
    lineHeight: 1.3,
  },
  disclaimerTitle: { fontWeight: "bold", marginBottom: 2 },
  disclaimerIntro: { marginBottom: 2 },
  disclaimerItem: { marginBottom: 2 },
  customerBlock: { fontSize: 11, lineHeight: 1.4, marginTop: 12 },
  passwortBlock: { marginTop: 10, fontSize: 10, lineHeight: 1.35 },
  titleBlock: { textAlign: "right", marginBottom: 16 },
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
  brandSamirae: { fontSize: 13, lineHeight: 1.05, fontFamily: "Helvetica" },
  brandLine: { width: 82 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  bold: { fontWeight: "bold" },
  muted: { fontSize: 10, color: "#666" },
  table: { borderWidth: 1, borderColor: "#999", marginBottom: 14, fontSize: 9 },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
  },
  tableRowNoBottom: { borderBottomWidth: 0 },
  tableCellLeft: { flex: 1, padding: 4 },
  tableCellRight: { width: 110, padding: 4, alignItems: "flex-end" },
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
  orderDetailsTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 8 },
  orderDetailsBody: { fontSize: 10, lineHeight: 1.4 },
  continuationHint: {
    marginTop: 8,
    fontSize: 9,
    color: "#666",
    fontStyle: "italic",
  },
  footerBlock: {
    marginTop: 18,
  },
  finalSection: {
    marginTop: 14,
  },
  confirmationText: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 10,
  },
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  agbNotice: {
    fontSize: 11,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  signatureBox: { width: "48%", textAlign: "center" },
  signatureImageWrapper: { height: 40, justifyContent: "flex-end" },
  signatureImage: { width: "100%", height: "100%", objectFit: "contain" },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#555",
    marginTop: 4,
    marginBottom: 6,
  },
  agbPage: {
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 8,
    fontFamily: "Helvetica",
    color: "#111",
  },
  agbDocumentTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  agbBody: {
    fontSize: 5,
    lineHeight: 1.12,
    textAlign: "justify",
  },
  agbHeadingLine: {
    fontSize: 5,
    lineHeight: 1.12,
    textAlign: "justify",
    fontWeight: "bold",
    marginTop: 1,
    marginBottom: 1,
  },
  agbColumns: {
    flexDirection: "row",
    columnGap: 10,
    alignItems: "flex-start",
  },
  agbColumn: {
    flex: 1,
  },
  agbSection: {
    marginBottom: 2,
  },
});

const [agbLeftColumn, agbRightColumn] = splitOrderFormAgbSectionsIntoColumns();

function OrderFormContactsFooter() {
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

function FooterWithSignatures({
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
    <View style={styles.footerBlock} wrap={false}>
      <View style={styles.disclaimerBlock}>
        <Text style={styles.disclaimerTitle}>
          Verbrauchererklärung über Beginn der Arbeiten vor Ablauf der
          Widerrufsfrist
        </Text>

        <Text style={styles.disclaimerIntro}>
          Hiermit bestätige ich (der Auftraggeber / Kunde):
        </Text>

        <Text style={styles.disclaimerItem}>
          1. Dass ich darüber belehrt wurde, dass mir ein 14-tägiges
          Widerrufsrecht zusteht. Eine entsprechende Widerrufsbelehrung und ein
          Muster-Widerrufsformular wurden mir ausgehändigt.
        </Text>

        <Text style={styles.disclaimerItem}>
          2. Dass ich ausdrücklich zustimme, dass die beauftragten Arbeiten vor
          Ablauf der Widerrufsfrist beginnen.
        </Text>

        <Text style={styles.disclaimerItem}>
          3. Dass ich darüber in Kenntnis gesetzt wurde, dass ich mein
          Widerrufsrecht bei vollständiger Vertragserfüllung verliere.
        </Text>

        <Text>
          4. Dass ich für den Fall, dass ich vor vollständiger Vertragserfüllung
          den Vertrag widerrufe, für die bis zum Widerruf erbrachten Leistungen
          einen Wertersatz zu leisten habe.
        </Text>
      </View>

      <View style={styles.finalSection}>
        <Text style={styles.agbNotice}>
          Auftragserteilung. Es gelten unsere AGB siehe nächste Seite.
        </Text>

        <Text style={styles.confirmationText}>
          Die oben aufgeführten Leistungen und Angaben wurden gelesen und
          bestätigt.
        </Text>

        <View style={styles.signaturesRow}>
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
              {customer
                ? `${customer.firstName} ${customer.lastName}`
                : "Kunde"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function OrderFormPdf(props: OrderFormPdfProps) {
  const {
    diagnosis,
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
  } = props;

  const { firstPart: orderDetailsFirstPart, secondPart: orderDetailsSecondPart } =
    splitDetailsByParagraphs(orderDetails);

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

              {auftragPasswort?.trim() ? (
                <View style={styles.passwortBlock}>
                  <Text style={styles.bold}>Passwort</Text>
                  <Text>{auftragPasswort}</Text>
                </View>
              ) : null}
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
          <Text style={styles.title}>Auftragsformular</Text>
          <Text>Arbeitsdatum: {arbeitsdatum}</Text>
          <Text>Auftragsnummer: {auftragsnummer}</Text>
          {kundenNr && <Text>Kunden Nr: {kundenNr}</Text>}
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLeft}>Stundensatz</Text>
            <View style={styles.tableCellRight}>
              <Text>{preisProStunde}</Text>
            </View>
          </View>

          <View
            style={[
              styles.tableRow,
              ...(!lineItems?.length ? [styles.tableRowNoBottom] : []),
            ]}
          >
            <Text style={styles.tableCellLeft}>Mitarbeiteranzahl</Text>
            <View style={styles.tableCellRight}>
              <Text>{mitarbeiterAnzahl}</Text>
            </View>
          </View>

          {lineItems?.length ? (
            <>
              <View style={{ height: 1, backgroundColor: "#999" }} />

              {lineItems.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.tableRow,
                    ...(index === lineItems.length - 1
                      ? [styles.tableRowNoBottom]
                      : []),
                  ]}
                >
                  <Text style={styles.tableCellLeft}>{item.title}</Text>
                  <View style={styles.tableCellRight}>
                    <Text>
                      {(item.amountCents / 100).toFixed(2).replace(".", ",")} €
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : null}
        </View>

        {orderDetailsFirstPart ? (
          <View style={styles.orderDetailsBlock}>
            <Text style={styles.orderDetailsTitle}>Auftragsdetails</Text>
            <Text style={styles.orderDetailsBody}>{orderDetailsFirstPart}</Text>

          </View>
        ) : null}
        
        {orderDetailsSecondPart ? (
          <Text style={styles.continuationHint}>
            Fortsetzung auf der nächsten Seite.
          </Text>
        ) : null}

        {!orderDetailsSecondPart ? (
          <FooterWithSignatures
            signatureEmployee={signatureEmployee}
            signatureKunde={signatureKunde}
            employees={employees}
            customer={customer}
          />
        ) : null}

        <OrderFormContactsFooter />
      </Page>

      {orderDetailsSecondPart ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.orderDetailsBlock}>
            <Text style={styles.orderDetailsTitle}>
              Auftragsdetails Fortsetzung
            </Text>

            <Text style={styles.orderDetailsBody}>
              {orderDetailsSecondPart}
            </Text>
          </View>

          <FooterWithSignatures
            signatureEmployee={signatureEmployee}
            signatureKunde={signatureKunde}
            employees={employees}
            customer={customer}
          />

          <OrderFormContactsFooter />
        </Page>
      ) : null}

      <Page size="A4" style={styles.agbPage}>
        <Text style={styles.agbDocumentTitle}>{ORDER_FORM_AGB_TITLE}</Text>

        <View style={styles.agbColumns}>
          <View style={styles.agbColumn}>
            {agbLeftColumn.map((section, sectionIndex) => (
              <View key={`left-${sectionIndex}`} style={styles.agbSection}>
                {section.lines.map((line, lineIndex) =>
                  line.text === "" ? (
                    <Text key={lineIndex} style={styles.agbBody}>
                      {"\n"}
                    </Text>
                  ) : (
                    <Text
                      key={lineIndex}
                      style={line.bold ? styles.agbHeadingLine : styles.agbBody}
                    >
                      {line.text}
                    </Text>
                  ),
                )}
              </View>
            ))}
          </View>

          <View style={styles.agbColumn}>
            {agbRightColumn.map((section, sectionIndex) => (
              <View key={`right-${sectionIndex}`} style={styles.agbSection}>
                {section.lines.map((line, lineIndex) =>
                  line.text === "" ? (
                    <Text key={lineIndex} style={styles.agbBody}>
                      {"\n"}
                    </Text>
                  ) : (
                    <Text
                      key={lineIndex}
                      style={line.bold ? styles.agbHeadingLine : styles.agbBody}
                    >
                      {line.text}
                      {"\n"}
                    </Text>
                  ),
                )}
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}