import type { Report } from "../types";

export const REVIEWED_REPORT_ACCESS_DATE = "2026-07-20" as const;

export const REVIEWED_REPORT_ACCESS_DATE_IDS = [
  "asko-barekraft-2024",
  "axfood-annual-report-2024",
  "coop-danmark-2024",
  "dagligvarerapporten-2025",
  "dt-samarbeidsklima-2023",
  "dt-samarbeidsklima-2025",
  "etmv-toimintakertomus-2024",
  "eu-utp-report-2024",
  "eu-utp-staff-working-doc-2024",
  "finland-food-market-ombudsman-2023",
  "finland-food2030",
  "hagar-2024-25",
  "ica-gruppen-annual-report-2024",
  "is-samkeppni-annual-report-2024",
  "karlstad-declaration-2024",
  "kesko-annual-report-2024",
  "kfst-foedevarehandelslov-evaluering-2024",
  "kkv-fi-4a-dominans",
  "konkurrensverket-2025-5-livsmedelsutredning",
  "kt-dagligvarerapport-2024",
  "kt-innkjopspriser-2017-2023",
  "kt-marginstudie-2024-del1",
  "kt-marginstudie-2025-del2",
  "kt-prisjeger-saken-2024",
  "kt-prisjusteringsvinduer-2023",
  "matsvinnutvalget-2024",
  "meld-st-11-selvforsyning",
  "menon-emv-innovasjon",
  "menon-funksjonelt-skille-2026",
  "motiva-food-procurement-2026",
  "nordic-food-alert-2025",
  "nordisk-food-markets-2005",
  "norgesgruppen-2024-25",
  "norgesgruppen-halvarsrapport-h1-2025",
  "nou-2011-4",
  "nou-2013-6-god-handelsskikk",
  "nou-2022-14",
  "oslo-economics-forsvar-2024",
  "pty-finnish-grocery-trade-2024",
  "pubmed-hiis-2024",
  "pubmed-javourez-2021",
  "pubmed-recanati-2019",
  "pubmed-sigala-2025",
  "pubmed-szulecka-2024",
  "pubmed-van-der-fels-klerx-2024",
  "pubmed-van-leeuwen-2024",
  "pubmed-wohner-2020",
  "pubmed-zamanzadeh-2017",
  "riksrevisjonen-matsikkerhet-2023",
  "salling-coop-danmark-2025",
  "salling-group-2024",
  "se-konkurrensverket-2024-5",
  "sou-2024-8-svensk-beredskap",
  "stockholm-resilience-2019",
  "van-zanten-circularity-2023",
] as const;

export const REVIEWED_REPORT_LOCATOR_REPAIRS = {
  "kesko-annual-report-2024":
    "https://www.kesko.fi/493454/globalassets/03-sijoittaja/raporttikeskus/2025/q1/vuosiraportti-2024/kesko_annual_report_2024.pdf",
  "norgesgruppen-halvarsrapport-h1-2025":
    "https://www.norgesgruppen.no/globalassets/finansiell-informasjon/rapporter/2025/halvarsrapport_ngasa_2025.pdf",
  "salling-group-2024":
    "https://digitalassets.sallinggroup.com/raw/upload/fl_attachment:Annual%20report%202024%252epdf/external_content_providers/magnolia/next/jcr:c5f40c7a-153b-434d-8d7f-3c1eafb3dafe",
} as const satisfies Readonly<Record<string, string>>;

export const REVIEWED_REPORT_LOCATOR_BEFORE = {
  "kesko-annual-report-2024": "https://www.kesko.fi/annual-reports",
  "norgesgruppen-halvarsrapport-h1-2025":
    "https://www.norgesgruppen.no/finans/finans-hjem/rapporter/",
  "salling-group-2024": "https://sallinggroup.com/en/publications",
} as const satisfies Readonly<
  Record<keyof typeof REVIEWED_REPORT_LOCATOR_REPAIRS, string>
>;

export const UNRESOLVED_REPORT_ACCESS_DATE_IDS = [
  "arla-farmahead-check-2024",
  "beredskap-finsk-modell-hvk",
  "beredskap-nibio-selvforsyning-2026",
  "beredskap-nibio-selvforsyning-metode",
  "is-markedsstruktur-2024",
  "kbh-food-strategy-madhus",
  "kt-markedsundersokelser-2026",
  "meld-st-4-dagligvare",
  "plantefonden-projects-2023-2025",
  "reitan-2024-25",
  "sodertaelje-diet-green-planet",
] as const;

export function applyReviewedReportAccessDateBatchToSeed(
  rows: readonly Report[],
): Report[] {
  if (REVIEWED_REPORT_ACCESS_DATE_IDS.length !== 55) {
    throw new Error("Reviewed Report access-date target count drifted");
  }
  if (UNRESOLVED_REPORT_ACCESS_DATE_IDS.length !== 11) {
    throw new Error("Unresolved Report access-date count drifted");
  }

  const targets = new Set<string>(REVIEWED_REPORT_ACCESS_DATE_IDS);
  const seen = new Set<string>();
  const result = rows.map((row) => {
    if (!targets.has(row.id)) return row;
    if (seen.has(row.id))
      throw new Error(`Duplicate reviewed Report seed id: ${row.id}`);
    seen.add(row.id);
    if (row.accessedAt !== undefined && row.accessedAt !== null) {
      throw new Error(`Reviewed Report seed already has accessedAt: ${row.id}`);
    }
    if (!row.sourceUrl) {
      throw new Error(`Reviewed Report seed is missing sourceUrl: ${row.id}`);
    }
    const repairedUrl =
      REVIEWED_REPORT_LOCATOR_REPAIRS[
        row.id as keyof typeof REVIEWED_REPORT_LOCATOR_REPAIRS
      ];
    const expectedUrl =
      REVIEWED_REPORT_LOCATOR_BEFORE[
        row.id as keyof typeof REVIEWED_REPORT_LOCATOR_BEFORE
      ];
    if (expectedUrl && row.sourceUrl !== expectedUrl) {
      throw new Error(`Reviewed Report seed locator conflict: ${row.id}`);
    }
    return {
      ...row,
      sourceUrl: repairedUrl ?? row.sourceUrl,
      accessedAt: REVIEWED_REPORT_ACCESS_DATE,
    };
  });

  const missing = REVIEWED_REPORT_ACCESS_DATE_IDS.filter((id) => !seen.has(id));
  if (missing.length > 0) {
    throw new Error(`Missing reviewed Report seed ids: ${missing.join(", ")}`);
  }
  return result;
}
