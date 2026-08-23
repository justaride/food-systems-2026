import test from "node:test";
import assert from "node:assert/strict";

import {
  candidateAnalysisSha256,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LibraryAnalysisAgentSegmentResponseSchema,
  LibraryAnalysisAcceptedSegmentSchema,
  deterministicLibraryAnalysisAgentClaimId,
  libraryAnalysisAgentSegmentResponseHash,
  mergeLibraryAnalysisSourceSegments,
  validateLibraryAnalysisAgentSegmentResponse,
  type LibraryAnalysisAgentModelReceipt,
} from "../../src/lib/knowledge/library-analysis-agent-response";
import type {
  LibraryAnalysisAgentQueueUnit,
  LibraryAnalysisVerifiedJob,
} from "../../src/lib/knowledge/library-analysis-agent-queue";

const HASH = "a".repeat(64);
const INPUT_HASH = "f".repeat(64);
const EXPECTED_MODEL: LibraryAnalysisAgentModelReceipt = {
  provider: "openai-codex",
  name: "gpt-5.6-luna",
  version: "unknown",
};

function unit(id: string, ordinal: number, text: string): LibraryAnalysisAgentQueueUnit {
  return {
    id: `content:library-analysis:${id}`,
    sourceKind: "document",
    sourceKey: "document:fixture",
    populationSourceKey: "document:fixture",
    sourceVersionHash: "b".repeat(64),
    unitType: "document_section",
    ordinal,
    locator: `document:fixture#${ordinal}`,
    locatorHash: "c".repeat(64),
    contentHash: candidateAnalysisSha256("fixture-content", { id, text }),
    hashAlgorithm: "sha256",
    identityConfidence: "exact",
    chunkPolicyHash: "d".repeat(64),
    portablePath: `units/${"e".repeat(64)}.txt`,
    sizeBytes: Buffer.byteLength(text, "utf8"),
    codePoints: [...text].length,
  };
}

test("rejects Pilot14 generic data, cleanup, evidence and passive-method references", () => {
  const cases = [
    {
      source: "Oppryddingen som var planlagt 2026-04-14 ble først gjennomført 2026-04-21.",
      text: "Oppryddingen som var planlagt 2026-04-14 ble først gjennomført 2026-04-21.",
      evidence: "Oppryddingen som var planlagt 2026-04-14 ble først gjennomført 2026-04-21.",
      error: /context_dependent_claim/u,
    },
    {
      source: "Data er hentet fra årsrapporter for 2021 og 2022.",
      text: "Data er hentet fra årsrapporter for 2021 og 2022.",
      evidence: "Data er hentet fra årsrapporter for 2021 og 2022.",
      error: /context_dependent_claim/u,
    },
    {
      source: "Datagrunnlaget er avgrenset til produksjon og salg av dagligvarer.",
      text: "Datagrunnlaget er avgrenset til produksjon og salg av dagligvarer.",
      evidence: "Datagrunnlaget er avgrenset til produksjon og salg av dagligvarer.",
      error: /context_dependent_claim/u,
    },
    {
      source: "Metoden bruker ikke GIS-data i denne sammenhengen.",
      text: "Metoden for regional ressurskartlegging bruker ikke GIS-data i denne sammenhengen.",
      evidence: "Metoden bruker ikke GIS-data i denne sammenhengen.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "I stedet knyttes data til geografi ved å se på hvilken kommune aktiviteten foregår i.",
      text: "Aktivitetsdata knyttes til geografi ved å se på hvilken kommune aktiviteten foregår i.",
      evidence: "I stedet knyttes data til geografi ved å se på hvilken kommune aktiviteten foregår i.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Metodisk kombinerer tilnærmingen bottom-up og top-down.",
      text: "Ressurskartleggingsmetoden kombinerer bottom-up og top-down.",
      evidence: "Metodisk kombinerer tilnærmingen bottom-up og top-down.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Kombinasjonen av lokal innsikt og systematisk datakartlegging beskrives som en stor styrke.",
      text: "Kombinasjonen av lokal innsikt og systematisk datakartlegging beskrives som en stor styrke.",
      evidence: "Kombinasjonen av lokal innsikt og systematisk datakartlegging beskrives som en stor styrke.",
      error: /identification_actor_missing/u,
    },
    {
      source: "Det ble introdusert en ny metode for kommuner og regioner.",
      text: "Det ble introdusert en ny metode for kommuner og regioner.",
      evidence: "Det ble introdusert en ny metode for kommuner og regioner.",
      error: /identification_actor_missing/u,
    },
  ] as const;

  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("rejects Pilot14 missing status, implicit-share, figure and dataset qualifiers", () => {
  const cases = [
    {
      source: "Dokumentert i 2026. RE:Source-webinaret bekrefter at det nå utvikles mer sammenlignbare metoder.",
      text: "RE:Source-webinaret bekrefter at det nå utvikles mer sammenlignbare metoder.",
      evidence: "RE:Source-webinaret bekrefter at det nå utvikles mer sammenlignbare metoder.",
      error: /status_as_of_missing/u,
    },
    {
      source: "De tre store dagligvarekjedene står for om lag 95 prosent av den samlede omsetningen i den tradisjonelle dagligvarehandelen.",
      text: "De tre store dagligvarekjedene står for om lag 95 prosent av den samlede omsetningen i den tradisjonelle dagligvarehandelen.",
      evidence: "De tre store dagligvarekjedene står for om lag 95 prosent av den samlede omsetningen i den tradisjonelle dagligvarehandelen.",
      error: /share_as_of_missing/u,
    },
    {
      source: "250 000 kr per transition group (Cities + Food). Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      text: "Totalt 500 000 kr kom fra Nordic Innovation Hotspot.",
      evidence: "Totalt 500 000 kr fra Nordic Innovation Hotspot",
      error: /budget_scope_missing/u,
    },
    {
      source: "Dashboard for matsystemdata ble vist og diskutert:\n- Butikkfordeling\n- Selvforsyningsgrad",
      text: "Dashboard for matsystemdata ble vist og diskutert.",
      evidence: "Dashboard for matsystemdata ble vist og diskutert:",
      error: /evidence_incomplete/u,
    },
    {
      source: "Figur 7. Prisindeks for førstegangsomsetning av elektrisk strøm innenlands for perioden 2017 til og med 2022. (2015 = 100) Prisindeksen hensyntar ikke strømstøtte. Figur 7 viser at månedlig snittpris var fem ganger høyere i 2022 enn i 2015.",
      text: "Figur 7 viser at månedlig snittpris var fem ganger høyere i 2022 enn i 2015.",
      evidence: "Figur 7 viser at månedlig snittpris var fem ganger høyere i 2022 enn i 2015.",
      error: /figure_context_missing/u,
    },
    {
      source: "Elektro og øvrige faghandelsprofiler inngår ikke i de innsendte dataene. Coop har levert tall for perioden 2018 til og med 2022.",
      text: "Coop har levert tall for perioden 2018 til og med 2022.",
      evidence: "Elektro og øvrige faghandelsprofiler inngår ikke i de innsendte dataene. Coop har levert tall for perioden 2018 til og med 2022.",
      error: /material_exclusion_missing/u,
    },
    {
      source: "Electro profiles are not included in submitted data. Coop has provided data for the period 2018 to 2022.",
      text: "Coop has provided data for the period 2018 to 2022.",
      evidence: "Electro profiles are not included in submitted data. Coop has provided data for the period 2018 to 2022.",
      error: /material_exclusion_missing/u,
    },
    {
      source: "Figure 7. Domestic first-sale electricity price index for 2017 to 2022. (2015 = 100) The index does not include electricity support. Figure 7 shows a fivefold higher price in 2022 than in 2015.",
      text: "Figure 7 shows a fivefold higher price in 2022 than in 2015.",
      evidence: "Figure 7 shows a fivefold higher price in 2022 than in 2015.",
      error: /figure_context_missing/u,
    },
    {
      source: "Figure 7. Domestic first-sale electricity price index for 2017 to 2022. (2015 = 100) The index does not include electricity support. Figure 7 shows a 5-fold higher price in 2022 than in 2015.",
      text: "Figure 7 shows a 5-fold higher price in 2022 than in 2015.",
      evidence: "Figure 7 shows a 5-fold higher price in 2022 than in 2015.",
      error: /figure_context_missing/u,
    },
    {
      source: "Figure 7. Domestic first-sale electricity price index for 2017 to 2022. (2015 = 100) The index does not include electricity support. Figure 7 shows prices doubled from 2015 to 2022.",
      text: "Figure 7 shows prices doubled from 2015 to 2022.",
      evidence: "Figure 7 shows prices doubled from 2015 to 2022.",
      error: /figure_context_missing/u,
    },
  ] as const;

  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("rejects Pilot14 survey paraphrases without same-excerpt respondent scope", () => {
  const cases = [
    "Compared to 2022, insect food producers seem to aim to specialize in food products rather than whole insects.",
    "Environmental sustainability and economic factors are influential drivers for purchasing insect food products.",
    "Funding opportunities and staff training are critical determinants of business growth.",
    "The source identifies Europe and the international market as main geographic markets for insect food producing companies.",
    "Companies identified consumer reluctance and regulatory constraints as primary obstacles to growth.",
    "Companies in the source are located in Europe, with a few exceptions in Asia.",
    "Companies are located in Europe, with a few exceptions in Asia.",
    "Companies were located in Europe, with a few exceptions in Asia.",
    "Companies have been located in Europe, with a few exceptions in Asia.",
  ];
  for (const text of cases) {
    const job = verifiedJob([`IPIFF Survey: Main Findings Report. ${text}`]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, text), evidence: text }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /survey_scope_missing/u, text);
  }
});

test("rejects obvious material Pilot14 units reported as no-material-claim", () => {
  const cases = [
    {
      text: "# Sammendrag: Rislakki\n\n## Hovedfunn\n1. Studien finner flere tiltak.\n\n## Metode\nKvalitativ innholdsanalyse av bærekraftsrapporter fra 2022.",
      unitType: "database_record",
    },
    {
      text: "id,priority,status,country,title,year,url\nsource-1,P1,candidate_fetch,no,Named report,2025,https://example.invalid/report",
      unitType: "sheet_range",
    },
    {
      text: '{"provenanceType":"internal_register","keyFindings":["Promptbiblioteket dokumenterer deep-research-sporet"],"recommendations":["Behandle artefaktene som interne kildebevis"]}',
      unitType: "database_record",
    },
    {
      text: "# Hovedfunn\n1. Studien finner flere tiltak.",
      unitType: "document_section",
    },
    {
      text: "## Main findings\nThe study reports a material result.",
      unitType: "slide",
    },
    {
      text: "## Findings\nThe register records a material recommendation.",
      unitType: "database_record",
    },
    {
      text: "Hovedfunn\nStudien finner flere tiltak.\nMetode\nKvalitativ analyse.",
      unitType: "database_record",
    },
    {
      text: "id,source_name,year\nsource-1,Named report,2025",
      unitType: "dataset_slice",
    },
    {
      text: "# Master Analyse-Indeks: Evidence Pack\n\n## Status-sammendrag\n| Kategori | Filer |\n| Totalt | 96 |",
      unitType: "database_record",
    },
    {
      text: "Konkurransetilsynet finner gjennom hele perioden høy lønnsomhet for enkelte analyserte enheter.",
      unitType: "document_section",
    },
    {
      text: "Konkurransetilsynet beregner bruttomarginer, driftsmarginer og RNOA for Norgesgruppens egeneide butikker samlet etter metoden beskrevet i kapittel 3.",
      unitType: "document_section",
    },
    {
      text: "250 000 kr per transition group (Cities + Food). Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      unitType: "database_record",
    },
    {
      text: "1. Felles grep på tvers av kjeder: Studien finner at S Group, K Group og Lidl Finland rapporterer tiltak mot matsvinn.",
      unitType: "database_record",
    },
  ];
  for (const row of cases) {
    const job = verifiedJob([row.text]);
    Object.assign(job.units[0]!.descriptor, { unitType: row.unitType });
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "no_material_claim" }],
      claims: [],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /material_claim_omission/u);
  }
});

test("rejects Pilot17 multi-row CSV excerpts without headers and questions recast as results", () => {
  const csvSource = [
    "id,priority,status,country,title,year",
    "dk-usda,P1,candidate_fetch,dk,Retail Foods Annual,2025",
    "fi-fcca,P1,candidate_fetch,fi,The FCCA studies the functioning of the food market,2023",
  ].join("\n");
  const csvJob = verifiedJob([csvSource]);
  Object.assign(csvJob.units[0]!.descriptor, { unitType: "sheet_range" });
  const csvEvidence = csvSource.split("\n").slice(1).join("\n");
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: csvJob,
    response: segmentResponse(csvJob, {
      unitCoverage: [{ contentUnitId: csvJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(csvJob, 0, "The catalog lists the FCCA food-market study as a 2023 P1 candidate_fetch source."),
        evidence: csvEvidence,
      }],
    }),
  }), /tabular_context_missing/u);

  const lowerDataOnlySource = "acme,active,norway\nfoo,active,sweden";
  const lowerDataOnlyJob = verifiedJob([lowerDataOnlySource]);
  Object.assign(lowerDataOnlyJob.units[0]!.descriptor, { unitType: "sheet_range" });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: lowerDataOnlyJob,
    response: segmentResponse(lowerDataOnlyJob, {
      unitCoverage: [{ contentUnitId: lowerDataOnlyJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(lowerDataOnlyJob, 0, "The source records Acme as active in Norway."),
        evidence: lowerDataOnlySource.split("\n")[0]!,
      }],
    }),
  }), /tabular_context_missing/u);

  const genericHeaderSource = [
    "company,status,country",
    "Acme Foods,active,Norway",
  ].join("\n");
  const genericHeaderJob = verifiedJob([genericHeaderSource]);
  Object.assign(genericHeaderJob.units[0]!.descriptor, {
    unitType: "sheet_range",
    locator: "repository:fixture.csv#rows=1-2&chars=0-48",
  });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: genericHeaderJob,
    response: segmentResponse(genericHeaderJob, {
      unitCoverage: [{ contentUnitId: genericHeaderJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(genericHeaderJob, 0, "The table reports Acme Foods as active in Norway."),
        evidence: genericHeaderSource,
      }],
    }),
  }));

  const headerLikeDataSource = [
    "Acme,status,Norway",
    "Foo,active,Sweden",
  ].join("\n");
  const headerLikeDataJob = verifiedJob([headerLikeDataSource]);
  Object.assign(headerLikeDataJob.units[0]!.descriptor, {
    unitType: "sheet_range",
    locator: "repository:fixture.csv#rows=2-3&chars=0-42",
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: headerLikeDataJob,
    response: segmentResponse(headerLikeDataJob, {
      unitCoverage: [{ contentUnitId: headerLikeDataJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(headerLikeDataJob, 0, "The source records Acme with status Norway."),
        evidence: headerLikeDataSource.split("\n")[0]!,
      }],
    }),
  }), /tabular_context_missing/u);

  const rowOneHeaderLikeDataJob = verifiedJob([headerLikeDataSource]);
  Object.assign(rowOneHeaderLikeDataJob.units[0]!.descriptor, {
    unitType: "sheet_range",
    locator: "repository:fixture.csv#rows=1-2&chars=0-42",
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: rowOneHeaderLikeDataJob,
    response: segmentResponse(rowOneHeaderLikeDataJob, {
      unitCoverage: [{ contentUnitId: rowOneHeaderLikeDataJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(rowOneHeaderLikeDataJob, 0, "The source records Acme with status Norway."),
        evidence: headerLikeDataSource.split("\n")[0]!,
      }],
    }),
  }), /tabular_context_missing/u);

  const arbitraryHeaderSource = [
    "foo,bar,baz",
    "Acme,active,Norway",
  ].join("\n");
  const arbitraryHeaderJob = verifiedJob([arbitraryHeaderSource]);
  Object.assign(arbitraryHeaderJob.units[0]!.descriptor, {
    unitType: "sheet_range",
    locator: "repository:fixture.csv#rows=1-2&chars=0-37",
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: arbitraryHeaderJob,
    response: segmentResponse(arbitraryHeaderJob, {
      unitCoverage: [{ contentUnitId: arbitraryHeaderJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(arbitraryHeaderJob, 0, "The row links Acme, active and Norway in the three source fields."),
        evidence: arbitraryHeaderSource,
      }],
    }),
  }), /tabular_context_missing/u);

  for (const completeHeaderSource of [
    "Company Name,Current Status,Country\nAcme Foods,Active,Norway",
  ]) {
    const completeHeaderJob = verifiedJob([completeHeaderSource]);
    Object.assign(completeHeaderJob.units[0]!.descriptor, {
      unitType: "sheet_range",
      locator: "repository:fixture.csv#rows=1-2&chars=0-72",
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job: completeHeaderJob,
      response: segmentResponse(completeHeaderJob, {
        unitCoverage: [{ contentUnitId: completeHeaderJob.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [{
          ...claim(completeHeaderJob, 0, "The complete source row reports Acme as active in Norway."),
          evidence: completeHeaderSource,
        }],
      }),
    }));
  }

  const preambleSource = [
    "Quarterly export",
    "company,status,country",
    "Acme Foods,active,Norway",
  ].join("\n");
  const preambleJob = verifiedJob([preambleSource]);
  Object.assign(preambleJob.units[0]!.descriptor, { unitType: "sheet_range" });
  const preambleEvidence = preambleSource.split("\n").slice(1).join("\n");
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: preambleJob,
    response: segmentResponse(preambleJob, {
      unitCoverage: [{ contentUnitId: preambleJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(preambleJob, 0, "The quarterly table reports Acme Foods as active in Norway."),
        evidence: preambleEvidence,
      }],
    }),
  }));

  const multiCommaProseCell = "A complete qualitative note, stored in one spreadsheet cell, with additional context.";
  const multiCommaProseJob = verifiedJob([multiCommaProseCell]);
  Object.assign(multiCommaProseJob.units[0]!.descriptor, { unitType: "sheet_range" });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: multiCommaProseJob,
    response: segmentResponse(multiCommaProseJob, {
      unitCoverage: [{ contentUnitId: multiCommaProseJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(multiCommaProseJob, 0, "A complete qualitative note with additional context is stored in one spreadsheet cell."),
        evidence: multiCommaProseCell,
      }],
    }),
  }));

  const proseCell = "A complete qualitative note, stored in one spreadsheet cell.";
  const proseCellJob = verifiedJob([proseCell]);
  Object.assign(proseCellJob.units[0]!.descriptor, { unitType: "sheet_range" });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: proseCellJob,
    response: segmentResponse(proseCellJob, {
      unitCoverage: [{ contentUnitId: proseCellJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(proseCellJob, 0, "A complete qualitative note is stored in one spreadsheet cell."),
        evidence: proseCell,
      }],
    }),
  }));

  const question = "Could you rank by order of importance the possible main limiting factors for development of insect food in Europe?";
  const questionJob = verifiedJob([question]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: questionJob,
    response: segmentResponse(questionJob, {
      unitCoverage: [{ contentUnitId: questionJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(questionJob, 0, "The source presents possible main limiting factors for development of insect food in Europe."),
        evidence: question,
      }],
    }),
  }), /interrogative_evidence_not_result/u);

  for (const prefixedOrNorwegianQuestion of [
    "Question: What are the main limiting factors for development?",
    "Hva er de viktigste begrensende faktorene for utvikling?",
    "Is the market competitive?",
  ]) {
    const prefixedQuestionJob = verifiedJob([prefixedOrNorwegianQuestion]);
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job: prefixedQuestionJob,
      response: segmentResponse(prefixedQuestionJob, {
        unitCoverage: [{ contentUnitId: prefixedQuestionJob.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [{
          ...claim(prefixedQuestionJob, 0, "The source identifies the main limiting factors for development."),
          evidence: prefixedOrNorwegianQuestion,
        }],
      }),
    }), /interrogative_evidence_not_result/u);
  }

  const compoundQuestionJob = verifiedJob([question]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: compoundQuestionJob,
    response: segmentResponse(compoundQuestionJob, {
      unitCoverage: [{ contentUnitId: compoundQuestionJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(
          compoundQuestionJob,
          0,
          "The source asks which limiting factors affected growth and reports that consumer reluctance was primary.",
        ),
        evidence: question,
      }],
    }),
  }), /interrogative_evidence_not_result/u);

  const safetyQuestion = "Is the product safe?";
  const safetyQuestionJob = verifiedJob([safetyQuestion]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: safetyQuestionJob,
    response: segmentResponse(safetyQuestionJob, {
      unitCoverage: [{ contentUnitId: safetyQuestionJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(safetyQuestionJob, 0, "The source asks whether the product is safe, with safety confirmed."),
        evidence: safetyQuestion,
      }],
    }),
  }), /interrogative_evidence_not_result/u);

  for (const compoundClaim of [
    "The source asks whether the product is safe — safety confirmed.",
    "The source asks whether the product is safe: safety confirmed.",
    "The source asks whether the product is safe (safety confirmed).",
    "The source asks whether the product is safe, safety confirmed.",
    "The source asks whether the product is safe, with blue.",
    "The source asks whether the product is safe — blue.",
    "The source asks whether the product is safe, blue.",
    "The source asks whether the product is safe: blue.",
    "The source asks whether the product is safe (blue).",
    "Blue is the answer; the source asks whether the product is safe.",
    "The answer is blue. The source asks whether the product is safe.",
    "The source asks whether the product is safe; the answer is blue.",
  ]) {
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job: safetyQuestionJob,
      response: segmentResponse(safetyQuestionJob, {
        unitCoverage: [{ contentUnitId: safetyQuestionJob.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [{ ...claim(safetyQuestionJob, 0, compoundClaim), evidence: safetyQuestion }],
      }),
    }), /interrogative_evidence_not_result/u);
  }

  for (const trailingQuestion of [
    "Could you rank the factors? — please answer",
    "Could you rank the factors? See note",
  ]) {
    const trailingQuestionJob = verifiedJob([trailingQuestion]);
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job: trailingQuestionJob,
      response: segmentResponse(trailingQuestionJob, {
        unitCoverage: [{ contentUnitId: trailingQuestionJob.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [{
          ...claim(trailingQuestionJob, 0, "The source identifies the factors in ranked order."),
          evidence: trailingQuestion,
        }],
      }),
    }), /interrogative_evidence_not_result/u);
  }

  const questionWithResult = "Is the product safe? The trial found no adverse events.";
  const questionWithResultJob = verifiedJob([questionWithResult]);
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: questionWithResultJob,
    response: segmentResponse(questionWithResultJob, {
      unitCoverage: [{ contentUnitId: questionWithResultJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(questionWithResultJob, 0, "The trial found no adverse events."),
        evidence: questionWithResult,
      }],
    }),
  }));

  const citedQuestion = "Could you rank the factors? [1]";
  const citedQuestionJob = verifiedJob([citedQuestion]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: citedQuestionJob,
    response: segmentResponse(citedQuestionJob, {
      unitCoverage: [{ contentUnitId: citedQuestionJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(citedQuestionJob, 0, "The source identifies the factors in ranked order."),
        evidence: citedQuestion,
      }],
    }),
  }), /interrogative_evidence_not_result/u);

  for (const instructedQuestion of [
    "What is your preferred color? Select one.",
    "What is your preferred color?\nOptions: red, blue.",
  ]) {
    const instructedQuestionJob = verifiedJob([instructedQuestion]);
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job: instructedQuestionJob,
      response: segmentResponse(instructedQuestionJob, {
        unitCoverage: [{ contentUnitId: instructedQuestionJob.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [{
          ...claim(instructedQuestionJob, 0, "The source identifies red as the preferred color."),
          evidence: instructedQuestion,
        }],
      }),
    }), /interrogative_evidence_not_result/u);
  }

  const formQuestion = "What is your preferred color?";
  const formJob = verifiedJob([formQuestion]);
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: formJob,
    response: segmentResponse(formJob, {
      unitCoverage: [{ contentUnitId: formJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(formJob, 0, "The form asks respondents for their preferred color."),
        evidence: formQuestion,
      }],
    }),
  }));

  const norwegianQuestion = "Hva er din foretrukne farge?";
  const norwegianFormJob = verifiedJob([norwegianQuestion]);
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: norwegianFormJob,
    response: segmentResponse(norwegianFormJob, {
      unitCoverage: [{ contentUnitId: norwegianFormJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(norwegianFormJob, 0, "Skjemaet spør respondentene hva som er deres foretrukne farge."),
        evidence: norwegianQuestion,
      }],
    }),
  }));
});

test("keeps explicitly scoped Pilot14 boundary cases eligible", () => {
  const cases = [
    "Oppryddingen av dupliserte kildeposter ble gjennomført 2026-04-21.",
    "Data for Konkurransetilsynets lønnsomhetsanalyse er hentet fra årsrapporter for 2021 og 2022.",
    "Konkurransetilsynets datagrunnlag for lønnsomhetsanalysen er avgrenset til produksjon og salg av dagligvarer.",
    "Metoden for regional ressurskartlegging bruker ikke GIS-data i denne sammenhengen.",
    "Konkurransetilsynet beskriver kombinasjonen av lokal innsikt og datakartlegging som en styrke.",
    "RE:Source introduserte en ny ressurskartleggingsmetode for kommuner og regioner.",
    "A new method was introduced by RE:Source for municipalities and regions.",
    "I 2026 utvikles det nå mer sammenlignbare metoder.",
    "I 2022 sto de tre store dagligvarekjedene for om lag 95 prosent av samlet omsetning i tradisjonell dagligvarehandel.",
    "Among 19 EU insect farming companies, respondents identified funding as a critical determinant of business growth.",
  ];
  for (const text of cases) {
    const source = text.includes("Among 19") ? `IPIFF Survey: Main Findings Report. ${text}` : text;
    const job = verifiedJob([source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, text), evidence: text }],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }

  const generic = "A title and a list continuation without a complete declarative proposition:";
  const genericJob = verifiedJob([generic]);
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: genericJob,
    response: segmentResponse(genericJob, {
      unitCoverage: [{ contentUnitId: genericJob.units[0]!.descriptor.id, status: "no_material_claim" }],
      claims: [],
    }),
  }));
});

const PILOT10_UNRESOLVED_CLAIMS = [
    {
      source: "Kun én av de syv leverandørene hadde lavere RNOA i 2020 enn i 2017. I snitt hadde leverandørene 35 og 28 prosent høyere avkastning i 2020 og 2021, målt mot 2017.",
      text: "For syv leverandører var gjennomsnittlig avkastning 35 og 28 prosent høyere i 2020 og 2021, målt mot 2017.",
      evidence: "Kun én av de syv leverandørene hadde lavere RNOA i 2020 enn i 2017. I snitt hadde leverandørene 35 og 28 prosent høyere avkastning i 2020 og 2021, målt mot 2017.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "Kjøpmannseide butikker (franchise) inngår med andre ord ikke i tallene.",
      text: "Kjøpmannseide butikker (franchise) inngår med andre ord ikke i tallene.",
      evidence: "Kjøpmannseide butikker (franchise) inngår med andre ord ikke i tallene.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      source: "Tilsynets datagrunnlag på detaljistleddet omfatter butikker med om lag 165 milliarder kroner i omsetning i 2022.",
      text: "Tilsynets datagrunnlag på detaljistleddet omfatter butikker med om lag 165 milliarder kroner i omsetning i 2022.",
      evidence: "Tilsynets datagrunnlag på detaljistleddet omfatter butikker med om lag 165 milliarder kroner i omsetning i 2022.",
      error: /context_dependent_claim/u,
    },
    {
      source: "Økt etterspørsel under pandemien antas å være en viktig årsak til økt lønnsomhet. Samtidig understrekes det at Konkurransetilsynet ikke har analysert kausale sammenhenger.",
      text: "Konkurransetilsynet har ikke analysert kausale sammenhenger mellom økt etterspørsel under pandemien og økt lønnsomhet for leverandørene.",
      evidence: "Økt etterspørsel under pandemien antas å være en viktig årsak til økt lønnsomhet. Samtidig understrekes det at Konkurransetilsynet ikke har analysert kausale sammenhenger.",
      error: /evidence_incomplete/u,
    },
    {
      source: "I 2022 økte både produsentprisene og forbrukerprisene kraftig.",
      text: "I 2022 økte både produsentprisene og forbrukerprisene kraftig.",
      evidence: "I 2022 økte både produsentprisene og forbrukerprisene kraftig.",
      error: /price_geography_missing/u,
    },
    {
      source: "Prisene for dagligvarer økte moderat i perioden 2017 til 2020.",
      text: "Prisene for dagligvarer økte moderat i perioden 2017 til 2020.",
      evidence: "Prisene for dagligvarer økte moderat i perioden 2017 til 2020.",
      error: /price_geography_missing/u,
    },
    {
      source: "Statusmøtet 13. april 2026 noterte 250 000 kr per transition group (Cities + Food).",
      text: "Nordic Innovation Hotspot Transition Groups oppga et budsjett på 250 000 kr per transition group (Cities + Food).",
      evidence: "Statusmøtet 13. april 2026 noterte 250 000 kr per transition group (Cities + Food).",
      error: /actor_attribution_not_source_visible/u,
    },
    {
      source: "Statusmøtet 13. april 2026 noterte totalt 500 000 kr fra Nordic Innovation Hotspot.",
      text: "Nordic Innovation Hotspot oppga totalt 500 000 kr for Transition Groups (Cities + Food).",
      evidence: "Statusmøtet 13. april 2026 noterte totalt 500 000 kr fra Nordic Innovation Hotspot.",
      error: /actor_attribution_not_source_visible/u,
    },
    {
      source: "I Norden følger EMV-utviklingen det europeiske mønsteret med visse særtrekk.",
      text: "I Norden følger EMV-utviklingen det europeiske mønsteret med visse særtrekk.",
      evidence: "I Norden følger EMV-utviklingen det europeiske mønsteret med visse særtrekk.",
      error: /comparison_context_missing/u,
    },
    {
      source: "Empiriske studier viser at EMV-vekst kan redusere det totale innovasjonsnivået i matsektoren.",
      text: "Empiriske studier viser at EMV-vekst kan redusere det totale innovasjonsnivået i matsektoren.",
      evidence: "Empiriske studier viser at EMV-vekst kan redusere det totale innovasjonsnivået i matsektoren.",
      error: /unnamed_study_authority/u,
    },
    {
      source: "Sammenlignet med litteraturen bruker kjedene bare en begrenset del av virkemidlene for et mer plantebasert kosthold.",
      text: "Sammenlignet med litteraturen bruker kjedene bare en begrenset del av virkemidlene for et mer plantebasert kosthold.",
      evidence: "Sammenlignet med litteraturen bruker kjedene bare en begrenset del av virkemidlene for et mer plantebasert kosthold.",
      error: /comparison_context_missing/u,
    },
    {
      source: "For eksempel ble det identifisert at bygg og anlegg bør brytes ned i mer detaljerte kategorier.",
      text: "For eksempel ble det identifisert at bygg og anlegg bør brytes ned i mer detaljerte kategorier.",
      evidence: "For eksempel ble det identifisert at bygg og anlegg bør brytes ned i mer detaljerte kategorier.",
      error: /identification_actor_missing/u,
    },
] as const;

const PILOT11_UNRESOLVED_CLAIMS = [
  {
    source: "Konkurransetilsynet har bedt aktørene som inngår i kartleggingen levere balanseoppstillinger etter mal fra regnskapslovens § 6-2.",
    text: "Konkurransetilsynet har bedt aktørene levere balanseoppstillinger etter mal fra regnskapslovens § 6-2.",
    evidence: "Konkurransetilsynet har bedt aktørene som inngår i kartleggingen levere balanseoppstillinger etter mal fra regnskapslovens § 6-2.",
    error: /mapped_actor_scope_missing/u,
  },
  {
    source: "Konkurransetilsynet finner at avkastningen i driften er på sitt høyeste i 2020, altså at dette er det mest lønnsomme året i perioden.",
    text: "Konkurransetilsynet finner at avkastningen i driften er på sitt høyeste i 2020, som er det mest lønnsomme året i perioden.",
    evidence: "Konkurransetilsynet finner at avkastningen i driften er på sitt høyeste i 2020, altså at dette er det mest lønnsomme året i perioden.",
    error: /period_scope_missing/u,
  },
  {
    source: "This survey was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
    text: "This survey was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
    evidence: "This survey was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
    error: /study_identity_missing/u,
  },
  {
    source: "Metoden er dokumentert og mulig å bruke over tid, men tilgang til god data og riktig organisering av datainnsamlingen er helt avgjørende for å lykkes i praksis.",
    text: "Tilnærmingen er dokumentert og mulig å bruke over tid, men tilgang til god data og riktig organisering av datainnsamlingen er helt avgjørende for å lykkes i praksis.",
    evidence: "Metoden er dokumentert og mulig å bruke over tid, men tilgang til god data og riktig organisering av datainnsamlingen er helt avgjørende for å lykkes i praksis.",
    error: /context_dependent/u,
  },
  {
    source: "Analysen har i hovedsak et produksjonsperspektiv.",
    text: "Tilnærmingen har i hovedsak et produksjonsperspektiv.",
    evidence: "Analysen har i hovedsak et produksjonsperspektiv.",
    error: /context_dependent_claim/u,
  },
  {
    source: "Kartleggingsmetoden som nå er brukt, er den første som faktisk har gitt konkret og anvendbar data til denne indikatoren.",
    text: "Kartleggingsmetoden som nå er brukt, er den første som faktisk har gitt konkret og anvendbar data til denne indikatoren.",
    evidence: "Kartleggingsmetoden som nå er brukt, er den første som faktisk har gitt konkret og anvendbar data til denne indikatoren.",
    error: /indicator_context_missing/u,
  },
] as const;

const PILOT12_UNRESOLVED_CLAIMS = [
  {
    source: "Figur 18. Inntekter og kostnader for grossistleddet aggregert (ASKO, Rema Distribusjon og Coop Norge) gjennom perioden 2018 til og med 2022. Tallene er ikke inflasjonsjusterte. Som det fremgår av Figur 18, økte kjedenes driftsinntekter på grossistleddet med om lag 16 prosent fra 2019 til 2020.",
    text: "Som det fremgår av Figur 18, økte kjedenes driftsinntekter på grossistleddet med om lag 16 prosent fra 2019 til 2020.",
    evidence: "Som det fremgår av Figur 18, økte kjedenes driftsinntekter på grossistleddet med om lag 16 prosent fra 2019 til 2020.",
    error: /figure_context_missing/u,
  },
  {
    source: "Konkurransetilsynet finner at avkastningen i driften er på sitt høyeste i 2020, altså at dette er det mest lønnsomme året i perioden 2017 til 2022. Dette gjelder samtlige av de tre enhetene det er foretatt komplette RNOA-beregninger for.",
    text: "Konkurransetilsynet finner at avkastningen i driften er på sitt høyeste i 2020.",
    evidence: "Konkurransetilsynet finner at avkastningen i driften er på sitt høyeste i 2020",
    error: /superlative_scope_missing/u,
  },
  {
    source: "For samtlige enheter på detaljistleddet som Konkurransetilsynet har beregnet driftsmarginer for, er driftsmarginene på sitt høyeste i 2020. Overordnet finner Konkurransetilsynet at driftsmarginene på detaljistleddet falt fra 2021 til 2022.",
    text: "Overordnet finner Konkurransetilsynet at driftsmarginene på detaljistleddet falt fra 2021 til 2022.",
    evidence: "Overordnet finner Konkurransetilsynet at driftsmarginene på detaljistleddet falt fra 2021 til 2022.",
    error: /analytical_universe_missing/u,
  },
  {
    source: "I 2024 nådde europeiske EMV-salg 352 milliarder euro. I 2025 økte dette ytterligere til 384 milliarder euro og 38,7 %.",
    text: "I 2025 økte europeiske EMV-salg ytterligere til 384 milliarder euro og 38,7 %.",
    evidence: "I 2025 økte dette ytterligere til 384 milliarder euro og 38,7 %.",
    error: /deictic_value_context_missing/u,
  },
  {
    source: "Christer understreker at det mest slående resultatet er hvor lav andel materialer som faktisk gjenbrukes eller resirkuleres.",
    text: "Andelen materialer som faktisk gjenbrukes eller resirkuleres er lav.",
    evidence: "lav andel materialer som faktisk gjenbrukes eller resirkuleres.",
    error: /reported_result_attribution_missing/u,
  },
  {
    source: "Sammenfatning av RE:Source-webinaret 31. mars. Hovedbudskapet var at systematisk måling og kartlegging av ressursstrømmer gir et bedre beslutningsgrunnlag.",
    text: "Hovedbudskapet var at systematisk måling og kartlegging av ressursstrømmer gir et bedre beslutningsgrunnlag.",
    evidence: "Hovedbudskapet var at systematisk måling og kartlegging av ressursstrømmer gir et bedre beslutningsgrunnlag.",
    error: /event_identity_missing/u,
  },
  {
    source: "Sammenfatning av RE:Source-webinaret 31. mars. Webinaret presenterte ressurskartlegging som et sentralt verktøy for regional sirkulær omstilling.",
    text: "Webinaret presenterte ressurskartlegging som et sentralt verktøy for regional sirkulær omstilling.",
    evidence: "Webinaret presenterte ressurskartlegging som et sentralt verktøy for regional sirkulær omstilling.",
    error: /event_identity_missing/u,
  },
] as const;

const PILOT13_UNRESOLVED_CLAIMS = [
  {
    source: "Rapporten ble publisert i 2024. I Norge finnes det i dag fire større nasjonale dagligvarekjeder: Norgesgruppen, Coop, Rema og Bunnpris.",
    text: "I Norge finnes det i dag fire større nasjonale dagligvarekjeder: Norgesgruppen, Coop, Rema og Bunnpris.",
    evidence: "I Norge finnes det i dag fire større nasjonale dagligvarekjeder: Norgesgruppen, Coop, Rema og Bunnpris.",
    error: /status_as_of_missing/u,
  },
  {
    source: "Dataene dekker perioden 2017 til og med 2022 og bygger på årlige resultat- og balanseoppstillinger. Derimot viser Konkurransetilsynets kartlegging at det jevnt over er lønnsomt å produsere og selge dagligvarer i Norge.",
    text: "Derimot viser Konkurransetilsynets kartlegging at det jevnt over er lønnsomt å produsere og selge dagligvarer i Norge.",
    evidence: "Derimot viser Konkurransetilsynets kartlegging at det jevnt over er lønnsomt å produsere og selge dagligvarer i Norge.",
    error: /analytical_measure_context_missing/u,
  },
  {
    source: "Dataene dekker perioden 2017 til og med 2022 og bygger på årlige resultat- og balanseoppstillinger med RNOA som avkastningsmål. Konkurransetilsynet finner at dagligvarekjedenes grossistselskap har en avkastning i driften som ikke er betydelig høyere enn normal avkastning.",
    text: "Konkurransetilsynet finner at dagligvarekjedenes grossistselskap har en avkastning i driften som ikke er betydelig høyere enn normal avkastning.",
    evidence: "Konkurransetilsynet finner at dagligvarekjedenes grossistselskap har en avkastning i driften som ikke er betydelig høyere enn normal avkastning.",
    error: /analytical_measure_context_missing/u,
  },
  {
    source: "Kartleggingen bruker regnskapsdata for perioden 2017 til og med 2022. Konkurransetilsynet finner at driftsmarginene og avkastningen i driften økte under koronapandemien, både på leverandør-, grossist- og detaljistleddet.",
    text: "Konkurransetilsynet finner at driftsmarginene og avkastningen i driften økte under koronapandemien, både på leverandør-, grossist- og detaljistleddet.",
    evidence: "Konkurransetilsynet finner at driftsmarginene og avkastningen i driften økte under koronapandemien, både på leverandør-, grossist- og detaljistleddet.",
    error: /analytical_measure_context_missing/u,
  },
  {
    source: "Konkurransetilsynet har på oppdrag fra Nærings- og fiskeridepartementet kartlagt lønnsomheten til et utvalg aktører på leverandør-, grossist- og detaljistleddet i verdikjeden for dagligvarer. Kartleggingen bygger på årlige resultat- og balanseoppstillinger og dekker perioden 2017 til og med 2022.",
    text: "Konkurransetilsynet har på oppdrag fra Nærings- og fiskeridepartementet kartlagt lønnsomheten til et utvalg aktører på leverandør-, grossist- og detaljistleddet i verdikjeden for dagligvarer.",
    evidence: "Konkurransetilsynet har på oppdrag fra Nærings- og fiskeridepartementet kartlagt lønnsomheten til et utvalg aktører på leverandør-, grossist- og detaljistleddet i verdikjeden for dagligvarer.",
    error: /analytical_measure_context_missing/u,
  },
  {
    source: "Coop har levert tall for perioden 2018 til og med 2022. Konkurransetilsynet beregner bruttomarginer både for samvirkelagene samlet og for de egeneide butikkene i Norsk Butikkdrift etter metoden beskrevet i kapittel 3.",
    text: "Konkurransetilsynet beregner bruttomarginer både for samvirkelagene samlet og for de egeneide butikkene i Norsk Butikkdrift i tråd med beskrivelsen i kapittel 3.",
    evidence: "Konkurransetilsynet beregner bruttomarginer både for samvirkelagene samlet og for de egeneide butikkene i Norsk Butikkdrift etter metoden beskrevet i kapittel 3.",
    error: /analytical_measure_context_missing/u,
  },
  {
    source: "I dette vedlegget presenteres Konkurransetilsynets VTB-metode for verdsetting av driftsrelaterte eiendeler. Gjenanskaffelseskost defineres her som kostnaden ved å erstatte eiendelens funksjon i dagens marked, justert for gjenværende økonomisk levetid.",
    text: "Gjenanskaffelseskost defineres her som kostnaden ved å erstatte eiendelens funksjon i dagens marked, justert for gjenværende økonomisk levetid.",
    evidence: "Gjenanskaffelseskost defineres her som kostnaden ved å erstatte eiendelens funksjon i dagens marked, justert for gjenværende økonomisk levetid.",
    error: /local_reference_missing/u,
  },
  {
    source: "Figur 8 viser valutakursutviklingen målt ved det importveide kronekursmålet I-44. Høyere indeksverdi betyr svakere kronekurs.",
    text: "Høyere indeksverdi betyr svakere kronekurs.",
    evidence: "Høyere indeksverdi betyr svakere kronekurs.",
    error: /index_identity_missing/u,
  },
  {
    source: "Statusmøte for Nordic Innovation Hotspot Transition Groups 13. april 2026. Thea har mange andre oppgaver, opprinnelig satt til 30% men redusert til 20%.",
    text: "Thea har mange andre oppgaver, opprinnelig satt til 30% men redusert til 20%.",
    evidence: "Thea har mange andre oppgaver, opprinnelig satt til 30% men redusert til 20%.",
    error: /staffing_scope_or_as_of_missing/u,
  },
  {
    source: "| Person | Andel | Rolle |\n|---|---|---|\n| Cathrine Barth | ~20% (1 dag/uke) | Strategisk roadmap, kvalitetsoppfølging, innsiktsintervjuer |",
    text: "Cathrine Barth er satt til ~20% (1 dag/uke) for strategisk roadmap, kvalitetsoppfølging og innsiktsintervjuer.",
    evidence: "| Cathrine Barth | ~20% (1 dag/uke) | Strategisk roadmap, kvalitetsoppfølging, innsiktsintervjuer |",
    error: /tabular_context_missing/u,
  },
  {
    source: "| Person | Andel | Rolle |\n|---|---|---|\n| Jan Thomas Odegard | ~30–40% | Prosjektledelse, koordinering, mandatdefinering og aktivitetsplanlegging |",
    text: "Jan Thomas Odegard er satt til ~30–40% for prosjektledelse, koordinering, mandatdefinering og aktivitetsplanlegging.",
    evidence: "| Jan Thomas Odegard | ~30–40% | Prosjektledelse, koordinering, mandatdefinering og aktivitetsplanlegging |",
    error: /tabular_context_missing/u,
  },
  {
    source: "I 2024 nådde europeiske EMV-salg 352 milliarder euro, med en samlet markedsandel på 38,5 % av dagligvaremarkedets verdi. I 2025 økte dette ytterligere til 384 milliarder euro og 38,7 %.",
    text: "Europeiske EMV-salg økte ytterligere i 2025 til 384 milliarder euro og 38,7 %.",
    evidence: "I 2024 nådde europeiske EMV-salg 352 milliarder euro, med en samlet markedsandel på 38,5 % av dagligvaremarkedets verdi. I 2025 økte dette ytterligere til 384 milliarder euro og 38,7 %.",
    error: /share_measure_missing/u,
  },
] as const;

for (const [index, row] of PILOT10_UNRESOLVED_CLAIMS.entries()) {
  test(`rejects Pilot10 unresolved claim ${index + 1}: ${row.error.source}`, () => {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  });
}

for (const [index, row] of PILOT11_UNRESOLVED_CLAIMS.entries()) {
  test(`rejects Pilot11 unresolved claim ${index + 1}: ${row.error.source}`, () => {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  });
}

for (const [index, row] of PILOT12_UNRESOLVED_CLAIMS.entries()) {
  test(`rejects Pilot12 unresolved claim ${index + 1}: ${row.error.source}`, () => {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  });
}

for (const [index, row] of PILOT13_UNRESOLVED_CLAIMS.entries()) {
  test(`rejects Pilot13 unresolved claim ${index + 1}: ${row.error.source}`, () => {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  });
}

test("keeps complete Pilot13 analytical, status, index, share and table context eligible", () => {
  for (const row of [
    {
      text: "For perioden 2017 til 2022 viser Konkurransetilsynets kartlegging basert på årlige resultat- og balanseoppstillinger at det jevnt over er lønnsomt å produsere og selge dagligvarer i Norge.",
    },
    {
      text: "For perioden 2017 til 2022 finner Konkurransetilsynet, basert på RNOA-beregninger fra årlige resultat- og balanseoppstillinger, at grossistselskapenes avkastning ikke er betydelig høyere enn normal avkastning.",
    },
    {
      text: "Driftsmarginene og avkastningen økte i 2020 og 2021 basert på regnskapstall for 2017 til 2022.",
    },
    {
      text: "Konkurransetilsynet kartla lønnsomheten for perioden 2017 til 2022 på grunnlag av årlige resultat- og balanseoppstillinger.",
    },
    {
      text: "Konkurransetilsynet beregnet bruttomarginer for Coop for perioden 2018 til 2022 etter lønnsomhetsmetoden i kapittel 3.",
    },
    { text: "Per 2024 finnes det fire større nasjonale dagligvarekjeder i Norge." },
    { text: "As of 2024, there are four national grocery chains in Norway." },
    { text: "Gjenanskaffelseskost defineres som kostnaden ved å erstatte eiendelens funksjon i dagens marked." },
    { text: "I dette VTB-vedlegget defineres gjenanskaffelseskost her som kostnaden ved å erstatte eiendelens funksjon." },
    { text: "Høyere indeksverdi i det importveide kronekursmålet I-44 betyr svakere kronekurs." },
    { text: "Thea ble 13. april 2026 allokert 20% til Nordic Innovation Hotspot Transition Groups." },
    { text: "Thea ble i 2026 redusert fra 30% til 20% for VTB." },
    { text: "I 2025 nådde europeiske EMV-salg 384 milliarder euro, med en samlet markedsandel på 38,7 % av dagligvaremarkedets verdi." },
    { text: "RNOA måler avkastning på netto driftsrelaterte eiendeler." },
    { text: "Konkurransetilsynet finner ikke støtte for at prisøkningene i 2022 økte lønnsomheten." },
    { text: "Konkurransetilsynet finner ikke støtte for økt lønnsomhet og økte driftsmarginer." },
    {
      source: "Analysen bygger på regnskapstall for perioden 2017 til 2022. Konkurransetilsynet finner med andre ord ikke støtte for at prisøkningene i 2022 økte lønnsomheten.",
      text: "Konkurransetilsynet finner med andre ord ikke støtte for at prisøkningene i 2022 økte lønnsomheten.",
    },
    {
      source: "Analysen bygger på regnskapstall for perioden 2017 til 2022. Konkurransetilsynet finner derfor ikke støtte for at prisøkningene i 2022 økte lønnsomheten.",
      text: "Konkurransetilsynet finner derfor ikke støtte for at prisøkningene i 2022 økte lønnsomheten.",
    },
    { text: "Norges indeksverdi på 146 betyr at matvareprisene i Norge var 46 prosent høyere enn EU-gjennomsnittet på 100 i 2022." },
    { text: "I dagligvaremarkedet selges både egne og eksterne merkevarer." },
    { text: "The phrase Alpha | Beta is used in the title." },
  ]) {
    const job = verifiedJob([
      "source" in row && typeof row.source === "string" ? row.source : row.text,
    ]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, row.text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.text);
  }

  for (const row of [
    {
      source: "| Person | Andel | Rolle |\n|---|---|---|\n| Cathrine Barth | ~20% | Strategisk roadmap |",
      text: "Cathrine Barth er allokert ~20% til strategisk roadmap.",
    },
    {
      source: "Person: Cathrine Barth; Andel: ~20%; Rolle: Strategisk roadmap",
      text: "Cathrine Barth er allokert ~20% til strategisk roadmap.",
    },
  ]) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.source }],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.text);
  }
});

test("rejects Pilot13 detached dates, standalone analysis and cross-sentence identity bypasses", () => {
  for (const row of [
    {
      source: "Rapporten ble publisert i 2024. I Norge finnes det i dag fire større nasjonale dagligvarekjeder.",
      text: "Rapporten ble publisert i 2024. I Norge finnes det i dag fire større nasjonale dagligvarekjeder.",
      error: /status_as_of_missing/u,
    },
    {
      source: "I dag finnes det fire større nasjonale dagligvarekjeder. Rapporten har 2024-data.",
      text: "I dag finnes det fire større nasjonale dagligvarekjeder. Rapporten har 2024-data.",
      error: /status_as_of_missing/u,
    },
    {
      source: "Konkurransetilsynet viser at det er lønnsomt å produsere og selge dagligvarer i Norge.",
      text: "Konkurransetilsynet viser at det er lønnsomt å produsere og selge dagligvarer i Norge.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "Indeksverdi tolkes som et mål på svakere kronekurs.",
      text: "Indeksverdi tolkes som et mål på svakere kronekurs.",
      error: /index_identity_missing/u,
    },
    {
      source: "VTB omtales i vedlegget. Gjenanskaffelseskost defineres her som kostnaden ved å erstatte funksjonen.",
      text: "VTB omtales i vedlegget. Gjenanskaffelseskost defineres her som kostnaden ved å erstatte funksjonen.",
      error: /local_reference_missing/u,
    },
    {
      source: "Prisindeks omtales først. Høyere indeksverdi betyr svakere kronekurs.",
      text: "Prisindeks omtales først. Høyere indeksverdi betyr svakere kronekurs.",
      error: /index_identity_missing/u,
    },
    {
      source: "I Norge finnes det i dag fire større nasjonale dagligvarekjeder.",
      text: "I Norge finnes det fire større nasjonale dagligvarekjeder.",
      evidence: "I Norge finnes det i dag fire større nasjonale dagligvarekjeder.",
      error: /status_as_of_missing/u,
    },
    {
      source: "Gjenanskaffelseskost defineres her som kostnaden ved å erstatte funksjonen.",
      text: "Gjenanskaffelseskost defineres som kostnaden ved å erstatte funksjonen.",
      evidence: "Gjenanskaffelseskost defineres her som kostnaden ved å erstatte funksjonen.",
      error: /local_reference_missing/u,
    },
    {
      source: "Analysen bygger på regnskapstall. Lønnsomheten var høy i perioden 2017 til 2022.",
      text: "Lønnsomheten var høy i perioden 2017 til 2022.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "RNOA måler avkastning. Driftsmarginene økte.",
      text: "RNOA måler avkastning. Driftsmarginene økte.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "Konkurransetilsynet finner ikke støtte for prisøkning. Driftsmarginene økte.",
      text: "Konkurransetilsynet finner ikke støtte for prisøkning. Driftsmarginene økte.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "RNOA måler avkastning og driftsmarginene økte.",
      text: "RNOA måler avkastning og driftsmarginene økte.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "The report finds no support for price increases while profitability increased.",
      text: "The report finds no support for price increases while profitability increased.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "Planen for Nordic Innovation Hotspot er godkjent. Thea var opprinnelig allokert 30% men ble redusert til 20% i 2026.",
      text: "Planen for Nordic Innovation Hotspot er godkjent. Thea var opprinnelig allokert 30% men ble redusert til 20% i 2026.",
      error: /staffing_scope_or_as_of_missing/u,
    },
    {
      source: "| Person | Andel |",
      text: "Person og andel er oppført i tabellen.",
      evidence: "| Person | Andel |",
      error: /tabular_context_missing/u,
    },
    {
      source: "| Person | Andel |\n",
      text: "Person og andel er oppført i tabellen.",
      evidence: "| Person | Andel |\n",
      error: /tabular_context_missing/u,
    },
    {
      source: "Person | Andel",
      text: "Person og andel er oppført i tabellen.",
      evidence: "Person | Andel",
      error: /tabular_context_missing/u,
    },
    {
      source: "Person | Andel\n",
      text: "Person og andel er oppført i tabellen.",
      evidence: "Person | Andel\n",
      error: /tabular_context_missing/u,
    },
  ]) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(job, 0, row.text),
        evidence: "evidence" in row ? row.evidence : row.text,
      }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("keeps locally complete Pilot12 figure, universe, event and attribution evidence eligible", () => {
  for (const text of [
    "For Figur 18, som summerer ASKO, Rema Distribusjon og Coop Norge fra 2018 til 2022 i tall som ikke er inflasjonsjusterte, økte driftsinntektene på grossistleddet om lag 16 prosent fra 2019 til 2020.",
    "For de tre enhetene med komplette RNOA-beregninger i perioden 2017 til 2022 var avkastningen i driften høyest i 2020.",
    "For samtlige detaljistenheter i Konkurransetilsynets marginutvalg falt driftsmarginene, basert på regnskapstall, fra 2021 til 2022.",
    "I 2025 økte europeiske EMV-salg ytterligere til 384 milliarder euro og 38,7 prosent.",
    "Christer understreker at andelen materialer som faktisk gjenbrukes eller resirkuleres er lav.",
    "Hovedbudskapet fra RE:Source-webinaret 31. mars var at systematisk ressurskartlegging gir et bedre beslutningsgrunnlag.",
    "RE:Source-webinaret 31. mars presenterte ressurskartlegging som et sentralt verktøy for regional sirkulær omstilling.",
  ]) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), text);
  }
});

test("bounds figure context to evidence when the excerpt starts at the figure label", () => {
  const evidence = "Figure 18. Revenue aggregated (Alpha Foods, Beta Group and Gamma Retail) from 2018 through 2022. Values were not adjusted for inflation. Figure 18 shows that wholesale revenue increased by 16 percent from 2019 to 2020.";
  const source = `${evidence} Figure 19. A separate series covers 2017 through 2021.`;
  const job = verifiedJob([source]);
  const response = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{ ...claim(job, 0, evidence), evidence }],
  });

  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response,
  }));
});

test("rejects Pilot12 partial repairs and preserves sentence-local boundaries", () => {
  for (const row of [
    {
      source: "Figur 18 gjelder ASKO, Rema Distribusjon og Coop Norge fra 2018 til 2022, og tallene er ikke inflasjonsjusterte.",
      text: "Figur 18 viser at driftsinntektene på grossistleddet økte med 16 prosent fra 2019 til 2020 for ASKO, Rema Distribusjon og Coop Norge i perioden 2018 til 2022.",
      evidence: "Figur 18 viser at driftsinntektene på grossistleddet økte med 16 prosent fra 2019 til 2020 for ASKO, Rema Distribusjon og Coop Norge i perioden 2018 til 2022.",
      error: /figure_context_missing/u,
    },
    {
      source: "Figure 19. Revenue aggregated (Alpha Foods, Beta Group and Gamma Retail) from 2018 through 2022. Values are not inflation-adjusted.",
      text: "Figure 19 shows that wholesale revenue increased by 16 percent from 2019 to 2020.",
      evidence: "Figure 19 shows that wholesale revenue increased by 16 percent from 2019 to 2020.",
      error: /figure_context_missing/u,
    },
    {
      source: "For de tre enhetene med komplette RNOA-beregninger var avkastningen høyest i 2020 i perioden 2017 til 2022.",
      text: "Avkastningen var høyest i 2020 i perioden 2017 til 2022.",
      evidence: "Avkastningen var høyest i 2020 i perioden 2017 til 2022.",
      error: /superlative_scope_missing/u,
    },
    {
      source: "For samtlige detaljistenheter i Konkurransetilsynets marginutvalg falt driftsmarginene fra 2021 til 2022.",
      text: "På detaljistleddet falt driftsmarginene fra 2021 til 2022.",
      evidence: "falt driftsmarginene fra 2021 til 2022.",
      error: /analytical_universe_missing/u,
    },
    {
      source: "For samtlige enheter på detaljistleddet som Konkurransetilsynet har beregnet driftsmarginer for, falt driftsmarginene fra 2021 til 2022.",
      text: "For samtlige enheter på grossistleddet falt driftsmarginene på detaljistleddet fra 2021 til 2022.",
      evidence: "For samtlige enheter på grossistleddet falt driftsmarginene på detaljistleddet fra 2021 til 2022.",
      error: /analytical_universe_missing/u,
    },
    {
      source: "RE:Source-webinaret 31. mars presenterte ressurskartlegging som et verktøy.",
      text: "RE:Source-webinaret 31. mars presenterte ressurskartlegging som et verktøy.",
      evidence: "Webinaret presenterte ressurskartlegging som et verktøy.",
      error: /event_identity_missing/u,
    },
  ]) {
    const job = verifiedJob([`${row.source} ${row.evidence}`]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }

  for (const row of [
    {
      source: "Europeiske EMV-salg nådde 352 milliarder euro i 2024. I 2025 økte dette ytterligere til 384 milliarder euro.",
      text: "Europeiske EMV-salg økte til 384 milliarder euro i 2025.",
      evidence: "Europeiske EMV-salg nådde 352 milliarder euro i 2024. I 2025 økte dette ytterligere til 384 milliarder euro.",
    },
    {
      source: "Christer understreker at metoden er moden. Andelen materialer som gjenbrukes er lav.",
      text: "Andelen materialer som gjenbrukes er lav.",
      evidence: "Andelen materialer som gjenbrukes er lav.",
    },
    {
      source: "Kari understreker at metoden er moden, og Christer understreker at andelen materialer som gjenbrukes er lav.",
      text: "Christer understreker at andelen materialer som gjenbrukes er lav.",
      evidence: "Christer understreker at andelen materialer som gjenbrukes er lav.",
    },
    {
      source: "Figure 19 shows revenue aggregated for three named wholesalers from 2018 through 2022; the values were not adjusted for inflation and increased by 16 percent from 2019 to 2020.",
      text: "Figure 19 shows that revenue for three named wholesalers, measured from 2018 through 2022 in values not adjusted for inflation, increased by 16 percent from 2019 to 2020.",
      evidence: "Figure 19 shows revenue aggregated for three named wholesalers from 2018 through 2022; the values were not adjusted for inflation and increased by 16 percent from 2019 to 2020.",
    },
    {
      source: "Figur 20 viser omsetning fra 2018 til 2022; tallene er ikke justert for inflasjon og økte med 16 prosent fra 2019 til 2020.",
      text: "Figur 20 viser at omsetningen fra 2018 til 2022, målt i tall som ikke er justert for inflasjon, økte med 16 prosent fra 2019 til 2020.",
      evidence: "Figur 20 viser omsetning fra 2018 til 2022; tallene er ikke justert for inflasjon og økte med 16 prosent fra 2019 til 2020.",
    },
  ]) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.text);
  }
});

test("rejects adversarial Pilot11 period, survey, method and actor-scope bypasses", () => {
  for (const row of [
    { text: "The report compares 2017 and 2020. During the period, prices increased.", error: /period_scope_missing/u },
    { text: "The period from 2017 to 2022 was analyzed. During the period, prices increased.", error: /period_scope_missing/u },
    { text: "Over the period, prices increased.", error: /period_scope_missing/u },
    { text: "After the period, prices increased.", error: /period_scope_missing/u },
    { text: "In that period, prices increased.", error: /period_scope_missing/u },
    { text: "I den perioden steg prisene.", error: /period_scope_missing/u },
    { text: "For period 2017, prices increased.", error: /period_scope_missing/u },
    { text: "Period 2017 was characterized by growth.", error: /period_scope_missing/u },
    { text: "For the period 2017 to 2022, prices increased.", source: "For the period 2017, prices increased.", error: /period_scope_missing/u },
    { text: "This survey, conducted online in 2023, gathered responses from 19 companies.", error: /study_identity_missing/u },
    { text: "This survey gathered responses from 19 companies.", error: /study_identity_missing/u },
    { text: "In this survey, respondents ranked funding first among 19 companies.", error: /study_identity_missing/u },
    { text: "I denne undersøkelsen svarte 19 selskaper på spørsmålene.", error: /study_identity_missing/u },
    { text: "The approach is documented and reusable over time.", error: /context_dependent_claim/u },
    { text: "The method is documented and reusable over time.", error: /context_dependent_claim/u },
    { text: "An approach is documented and reusable over time.", error: /context_dependent_claim/u },
    { text: "Our method is documented and reusable over time.", error: /context_dependent_claim/u },
    { text: "Methods are documented and reusable over time.", error: /context_dependent_claim/u },
    { text: "This method is documented and reusable over time.", error: /context_dependent_claim/u },
    { text: "This approach is documented and reusable over time.", error: /context_dependent_claim/u },
    { text: "The methodology is documented and reusable over time.", error: /context_dependent_claim/u },
    { text: "The actors submitted data.", source: "The actors included in the mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "All actors, including the actors included in the mapping in Norway, submitted data.", source: "The actors included in the mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Alle aktører, også aktørene som inngår i kartleggingen i Norge, leverte data.", source: "Aktørene som inngår i kartleggingen leverte data.", error: /mapped_actor_scope_missing/u },
    { text: "Actors generally, including the actors included in the mapping in Norway, submitted data.", source: "The actors included in the mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Every actor, including the actors included in the mapping, submitted data.", source: "The actors included in the mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Samtlige aktører, også aktørene som inngår i kartleggingen, leverte data.", source: "Aktørene som inngår i kartleggingen leverte data.", error: /mapped_actor_scope_missing/u },
    { text: "Every participating actor, including the actors included in the mapping, submitted data.", source: "The actors included in the mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "All market participants, including the actors included in the mapping, submitted data.", source: "The actors included in the mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Alle markedsaktører, også aktørene som inngår i kartleggingen, leverte data.", source: "Aktørene som inngår i kartleggingen leverte data.", error: /mapped_actor_scope_missing/u },
    { text: "Actors submitted data.", source: "Actors covered by mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Actors submitted data.", source: "Actors within the mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Actors submitted data.", source: "Actors included in mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Actors submitted data.", source: "Actors selected for mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Actors submitted data.", source: "Actors taking part in the mapping submitted data.", error: /mapped_actor_scope_missing/u },
    { text: "Aktørene leverte data.", source: "Aktørene som deltar i kartleggingen leverte data.", error: /mapped_actor_scope_missing/u },
    { text: "This indicator is used in the programme.", source: "The resource-efficiency indicator measures material use; this indicator is used in the programme.", error: /indicator_context_missing/u },
  ]) {
    const source = row.source ?? row.text;
    const job = verifiedJob([source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: source }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("keeps locally named Pilot11 actor, indicator and study identities eligible", () => {
  for (const text of [
    "Konkurransetilsynet har bedt aktørene som inngår i kartleggingen levere balanseoppstillinger.",
    "Indikatoren for ressurseffektivitet måler materialbruk; denne indikatoren brukes i miljøprogrammet.",
    "The resource-efficiency indicator measures material use; this indicator is used in the environmental programme.",
    "This indicator, called resource efficiency, is used in the programme.",
    "This indicator (resource efficiency) is used in the programme.",
    "This indicator — resource efficiency — is used in the programme.",
    "This indicator, abbreviated RE, is used in the programme.",
    "The Insect Farming Survey gathered responses from 19 EU companies in 2023.",
    "This survey by IPIFF was conducted online in 2023, gathering responses from 19 companies.",
    "This survey, called IPIFF FOOD MARKET, was conducted online in 2023, gathering responses from 19 companies.",
    "This survey, known as IPIFF FOOD MARKET, was conducted online in 2023, gathering responses from 19 companies.",
    "This study (IPIFF FOOD MARKET) was conducted online in 2023, gathering responses from 19 companies.",
    "This survey — IPIFF FOOD MARKET — was conducted online in 2023, gathering responses from 19 companies.",
    "This survey, from IPIFF FOOD MARKET, was conducted online in 2023, gathering responses from 19 companies.",
    "During the period 2017–2020, prices increased.",
    "I perioden 2017-2020 steg prisene.",
    "During this period (2017–2020), prices increased.",
    "Gjennom perioden (2017–2020) steg prisene.",
    "The period covered 2017–2020.",
    "The period ran from 2017 to 2020.",
    "Tilnærmingen fokuserer på virksomheter med store innkjøp av materialer.",
  ]) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), text);
  }
});

test("keeps Pilot10 claim classes eligible when their local scope is explicit", () => {
  for (const text of [
    "For leverandørene i Konkurransetilsynets Figur 16 var gjennomsnittlig RNOA 35 prosent høyere i 2020 enn i 2017.",
    "Kjøpmannseide butikker inngår ikke i tallene for NorgesGruppens egeneide butikker.",
    "Franchise-owned stores are not included in the figures for company-owned stores in Norway in 2022.",
    "Franchise-owned stores are not included in the figures used by NorgesGruppen for company-owned stores in 2022.",
    "Kjøpmannseide butikker er ekskludert fra dataene brukt av Konkurransetilsynet for 2022.",
    "Konkurransetilsynets datagrunnlag på detaljistleddet omfatter butikker med om lag 165 milliarder kroner i omsetning i Norge i 2022.",
    "Konkurransetilsynet har ikke analysert kausale sammenhenger mellom økt etterspørsel under pandemien og økt lønnsomhet for leverandørene.",
    "I 2022 økte både produsentprisene og forbrukerprisene for dagligvarer i Norge kraftig.",
    "Nordic Innovation Hotspot oppga på statusmøtet 13. april 2026 et totalbudsjett på 500 000 kr for Transition Groups.",
    "Fra 2024 til 2025 fulgte nordisk EMV-markedsandel den europeiske vekstretningen målt av PLMA.",
    "Smith og Lee (2024) viser i en panelstudie av 120 europeiske dagligvareprodusenter at EMV-vekst kan redusere innovasjonsnivået.",
    "Sammenlignet med virkemiddeloversikten i Smith (2024) bruker S Group, K Group og Lidl Finland en begrenset del av tiltakene.",
    "Malmö kommune identifiserte at bygg og anlegg bør brytes ned i mer detaljerte kategorier.",
  ]) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), text);
  }
});

test("keeps full Norwegian RNOA wording and requires it in the evidence", () => {
  const complete = "For syv leverandører var gjennomsnittlig avkastning på netto driftsrelaterte eiendeler 35 prosent høyere i 2020 enn i 2017.";
  const job = verifiedJob([complete]);
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response: segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, complete)],
    }),
  }));

  const genericEvidence = "For syv leverandører var gjennomsnittlig avkastning 35 prosent høyere i 2020 enn i 2017.";
  const driftJob = verifiedJob([genericEvidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: driftJob,
    response: segmentResponse(driftJob, {
      unitCoverage: [{ contentUnitId: driftJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(driftJob, 0, complete), evidence: genericEvidence }],
    }),
  }), /analytical_measure_context_missing/u);
});

test("requires the same price geography while allowing source-visible place names", () => {
  const mismatchEvidence = "I EU økte forbrukerprisene for dagligvarer i 2022.";
  const mismatchJob = verifiedJob([mismatchEvidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: mismatchJob,
    response: segmentResponse(mismatchJob, {
      unitCoverage: [{ contentUnitId: mismatchJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(mismatchJob, 0, "I Norge økte forbrukerprisene for dagligvarer i 2022."),
        evidence: mismatchEvidence,
      }],
    }),
  }), /price_geography_missing/u);

  for (const text of [
    "På Island økte forbrukerprisene for dagligvarer i 2022.",
    "I Tyskland økte produsentprisene i 2022.",
    "In the Netherlands, consumer prices for groceries increased in 2022.",
    "I Malmö økte dagligvareprisene i 2022.",
    "I Bayern økte produsentprisene i 2022.",
  ]) {
    const job = verifiedJob([text]);
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response: segmentResponse(job, {
        unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [claim(job, 0, text)],
      }),
    }), text);
  }
});

test("rejects mismatched causal endpoints and attribution actors", () => {
  const causalEvidence = "Konkurransetilsynet har ikke analysert kausale sammenhenger mellom økte råvarekostnader og redusert tilbud.";
  const causalJob = verifiedJob([causalEvidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: causalJob,
    response: segmentResponse(causalJob, {
      unitCoverage: [{ contentUnitId: causalJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(causalJob, 0, "Konkurransetilsynet har ikke analysert kausale sammenhenger mellom økt etterspørsel og økt lønnsomhet."),
        evidence: causalEvidence,
      }],
    }),
  }), /evidence_incomplete/u);

  const actorEvidence = "Nordic Innovation Hotspot oppga et budsjett på 500 000 kr.";
  const actorJob = verifiedJob([actorEvidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: actorJob,
    response: segmentResponse(actorJob, {
      unitCoverage: [{ contentUnitId: actorJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(actorJob, 0, "Oslo kommune oppga et budsjett på 500 000 kr."),
        evidence: actorEvidence,
      }],
    }),
  }), /actor_attribution_not_source_visible/u);
});

test("rejects passive identification after an introductory scope phrase", () => {
  const text = "I rapporten ble det identifisert at bygg og anlegg bør deles i flere kategorier.";
  const job = verifiedJob([text]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response: segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    }),
  }), /identification_actor_missing/u);
});

test("rejects generic study and literature authority variants", () => {
  for (const text of [
    "Empirical studies indicate that private-label growth can reduce innovation.",
    "The literature suggests that private-label growth can reduce innovation.",
    "Empiriske studier tyder på at EMV-vekst kan redusere innovasjon.",
    "Litteraturen indikerer at EMV-vekst kan redusere innovasjon.",
  ]) {
    const job = verifiedJob([text]);
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response: segmentResponse(job, {
        unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [claim(job, 0, text)],
      }),
    }), /unnamed_study_authority/u, text);
  }
});

test("rejects empty causal and material-exclusion scope continuations", () => {
  for (const row of [
    {
      text: "Konkurransetilsynet har ikke analysert kausale sammenhenger mellom.",
      error: /evidence_incomplete/u,
    },
    {
      text: "The authority did not analyze causal relationships between. Supply and demand were discussed.",
      error: /evidence_incomplete/u,
    },
    {
      text: "Kjøpmannseide butikker inngår ikke i tallene for",
      error: /material_exclusion_scope_missing/u,
    },
    {
      text: "Franchise-owned stores are not included in the figures for",
      error: /material_exclusion_scope_missing/u,
    },
    {
      text: "Franchise-owned stores are excluded from the figures.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      text: "Franchise-owned stores are excluded from the figures for.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      text: "Kjøpmannseide butikker er ekskludert fra dataene.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      text: "Kjøpmannseide butikker er utelatt fra tallene for.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      text: "Kjøpmannseide butikker er ikke medregnet i tallene.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      text: "Kjøpmannseide butikker er ikke inkludert i dataene.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      text: "Franchise-owned stores are not counted in the figures.",
      error: /material_exclusion_scope_missing/u,
    },
  ]) {
    const job = verifiedJob([row.text]);
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response: segmentResponse(job, {
        unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [claim(job, 0, row.text)],
      }),
    }), row.error, row.text);
  }
});

test("requires the exact return metric in the quantified evidence sentence", () => {
  const evidence = "RNOA var en av indikatorene. For syv leverandører var gjennomsnittlig avkastning 35 prosent høyere i 2020 enn i 2017.";
  const job = verifiedJob([evidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response: segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(job, 0, "For syv leverandører var gjennomsnittlig RNOA-avkastning 35 prosent høyere i 2020 enn i 2017."),
        evidence,
      }],
    }),
  }), /analytical_measure_context_missing/u);

  const sameSentenceDrift = "RNOA var 10 prosent; gjennomsnittlig avkastning var 35 prosent høyere i 2020 enn i 2017.";
  const sameSentenceJob = verifiedJob([sameSentenceDrift]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: sameSentenceJob,
    response: segmentResponse(sameSentenceJob, {
      unitCoverage: [{ contentUnitId: sameSentenceJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(sameSentenceJob, 0, "Gjennomsnittlig RNOA-avkastning var 35 prosent høyere i 2020 enn i 2017."),
        evidence: sameSentenceDrift,
      }],
    }),
  }), /analytical_measure_context_missing/u);

  const wrongMetricEvidence = "For syv leverandører var gjennomsnittlig operating margin-avkastning 35 prosent høyere i 2020 enn i 2017.";
  const wrongMetricJob = verifiedJob([wrongMetricEvidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: wrongMetricJob,
    response: segmentResponse(wrongMetricJob, {
      unitCoverage: [{ contentUnitId: wrongMetricJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(wrongMetricJob, 0, "For syv leverandører var gjennomsnittlig RNOA-avkastning 35 prosent høyere i 2020 enn i 2017."),
        evidence: wrongMetricEvidence,
      }],
    }),
  }), /analytical_measure_context_missing/u);

  for (const text of [
    "Average return was 35 percent higher in 2020 than in 2017.",
    "A 35 percent higher return was reported in 2020 than in 2017.",
  ]) {
    const englishJob = verifiedJob([text]);
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job: englishJob,
      response: segmentResponse(englishJob, {
        unitCoverage: [{ contentUnitId: englishJob.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [claim(englishJob, 0, text)],
      }),
    }), /analytical_measure_context_missing/u, text);
  }
});

test("accepts source-visible inverted attribution and possessive geography", () => {
  for (const row of [
    {
      claim: "Nordic Innovation Hotspot oppga et budsjett på 500 000 kr.",
      evidence: "I statusmøtet oppga Nordic Innovation Hotspot et budsjett på 500 000 kr.",
    },
    {
      claim: "Germany's consumer prices for groceries increased in 2022.",
      evidence: "Germany's consumer prices for groceries increased in 2022.",
    },
    {
      claim: "Germany's prices for groceries increased in 2022.",
      evidence: "Germany's prices for groceries increased in 2022.",
    },
    {
      claim: "Consumer prices for groceries increased throughout Germany in 2022.",
      evidence: "Consumer prices for groceries increased throughout Germany in 2022.",
    },
    {
      claim: "Producer prices increased for Germany in 2022.",
      evidence: "Producer prices increased for Germany in 2022.",
    },
  ]) {
    const job = verifiedJob([row.evidence]);
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response: segmentResponse(job, {
        unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [{ ...claim(job, 0, row.claim), evidence: row.evidence }],
      }),
    }), row.claim);
  }
});

test("does not treat figure labels as price geographies", () => {
  const evidence = "Figure 16 shows that consumer prices increased in Germany in 2022.";
  const job = verifiedJob([evidence]);
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response: segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(job, 0, "For Figure 16, consumer prices increased in Germany in 2022."),
        evidence,
      }],
    }),
  }));
});

test("requires a named and dated basis for a comparative pattern", () => {
  const vague = "I 2024 fulgte EMV-utviklingen det europeiske mønsteret.";
  const vagueJob = verifiedJob([vague]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: vagueJob,
    response: segmentResponse(vagueJob, {
      unitCoverage: [{ contentUnitId: vagueJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(vagueJob, 0, vague)],
    }),
  }), /comparison_context_missing/u);

  const scoped = "I 2024 fulgte EMV-utviklingen det europeiske mønsteret målt av PLMA for 2024.";
  const scopedJob = verifiedJob([scoped]);
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: scopedJob,
    response: segmentResponse(scopedJob, {
      unitCoverage: [{ contentUnitId: scopedJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(scopedJob, 0, scoped)],
    }),
  }));

  const wrongBasisEvidence = "I 2024 fulgte EMV-utviklingen det europeiske mønsteret målt av Eurostat for 2024.";
  const wrongBasisJob = verifiedJob([wrongBasisEvidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: wrongBasisJob,
    response: segmentResponse(wrongBasisJob, {
      unitCoverage: [{ contentUnitId: wrongBasisJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(wrongBasisJob, 0, scoped), evidence: wrongBasisEvidence }],
    }),
  }), /comparison_context_missing/u);
});

test("binds price direction to each asserted geography", () => {
  const evidence = "In 2022, consumer prices for groceries increased in Norway and fell in Germany.";
  const job = verifiedJob([evidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response: segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(job, 0, "In 2022, consumer prices for groceries increased in Norway and Germany."),
        evidence,
      }],
    }),
  }), /price_geography_missing/u);
});

test("binds survey universe and reporting basis identity", () => {
  const surveyEvidence = "Among 19 Nordic companies, most respondents ranked price first.";
  const surveyJob = verifiedJob([surveyEvidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: surveyJob,
    response: segmentResponse(surveyJob, {
      unitCoverage: [{ contentUnitId: surveyJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(surveyJob, 0, "Among 19 EU companies, most respondents ranked price first."),
        evidence: surveyEvidence,
      }],
    }),
  }), /survey_scope_missing/u);

  const basisEvidence = "In 2024, the chains reported 10 measures based on financial statements.";
  const basisJob = verifiedJob([basisEvidence]);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: basisJob,
    response: segmentResponse(basisJob, {
      unitCoverage: [{ contentUnitId: basisJob.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{
        ...claim(basisJob, 0, "In 2024, the chains reported 10 measures based on content analysis."),
        evidence: basisEvidence,
      }],
    }),
  }), /reported_measure_context_missing/u);
});

test("rejects Pilot18 non-declarative metadata and detached analytical context", () => {
  const cases = [
    {
      source: "Konkurransetilsynets rapport. Dette dokumentet er importert som metadata fra en lokal PDF i `research/evidence-pack/`.",
      text: "Dette dokumentet er importert som metadata fra en lokal PDF i `research/evidence-pack/`.",
      evidence: "Dette dokumentet er importert som metadata fra en lokal PDF i `research/evidence-pack/`.",
      error: /context_dependent_claim/u,
    },
    {
      source: "Metadata-import av lokal PDF fra evidence-pack. 64 sider. Kilde: Konkurransetilsynet.",
      text: "Metadata-import av lokal PDF fra evidence-pack.",
      evidence: "Metadata-import av lokal PDF fra evidence-pack. 64 sider. Kilde: Konkurransetilsynet.",
      error: /non_declarative_claim/u,
    },
    {
      source: "Metadata-import av lokal PDF fra evidence-pack; status er local_pdf_downloaded.",
      text: "Metadata-import av lokal PDF fra evidence-pack; status er local_pdf_downloaded.",
      evidence: "Metadata-import av lokal PDF fra evidence-pack; status er local_pdf_downloaded.",
      error: /non_declarative_claim/u,
    },
    {
      source: "Figur 14. Vektet og uvektet gjennomsnittlig bruttomargin for åtte leverandører gjennom årene 2017 til og med 2022. Absoluttnivå for bruttomarginer varierer betydelig på tvers av leverandørene, mellom 30 og 65 prosent.",
      text: "Absoluttnivå for bruttomarginer varierer betydelig på tvers av leverandørene, mellom 30 og 65 prosent.",
      evidence: "Absoluttnivå for bruttomarginer varierer betydelig på tvers av leverandørene, mellom 30 og 65 prosent.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "Gross margins ranged from 30–65 percent.",
      text: "Gross margins ranged from 30–65 percent.",
      evidence: "Gross margins ranged from 30–65 percent.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "For 2017–2022, gross margins ranged from 30–65 percent based on accounting data.",
      text: "For 2017–2022, gross margins ranged from 30–65 percent based on accounting data.",
      evidence: "For 2017–2022, gross margins ranged from 30–65 percent based on accounting data.",
      error: /analytical_measure_context_missing/u,
    },
    {
      source: "Konkurransetilsynet har mottatt resultatoppstillinger og balanser fra 14 av de 16 leverandørene som mottok informasjonspålegg, og fra samtlige tre dagligvarekjeder.",
      text: "Konkurransetilsynet har mottatt resultatoppstillinger og balanser fra 14 av de 16 leverandørene som mottok informasjonspålegg, og fra samtlige tre dagligvarekjeder.",
      evidence: "Konkurransetilsynet har mottatt resultatoppstillinger og balanser fra 14 av de 16 leverandørene som mottok informasjonspålegg, og fra samtlige tre dagligvarekjeder.",
      error: /reported_dataset_context_missing/u,
    },
    {
      source: "Konkurransetilsynet mottok resultatoppstillinger og balanser fra 14 av 16 leverandører.",
      text: "Konkurransetilsynet mottok resultatoppstillinger og balanser fra 14 av 16 leverandører.",
      evidence: "Konkurransetilsynet mottok resultatoppstillinger og balanser fra 14 av 16 leverandører.",
      error: /reported_dataset_context_missing/u,
    },
    {
      source: "The authority received data from 14 suppliers.",
      text: "The authority received data from 14 suppliers.",
      evidence: "The authority received data from 14 suppliers.",
      error: /reported_dataset_context_missing/u,
    },
    {
      source: "The authority obtained figures from 14 suppliers.",
      text: "The authority obtained figures from 14 suppliers.",
      evidence: "The authority obtained figures from 14 suppliers.",
      error: /reported_dataset_context_missing/u,
    },
    {
      source: "The authority collected figures from 14 suppliers.",
      text: "The authority collected figures from 14 suppliers.",
      evidence: "The authority collected figures from 14 suppliers.",
      error: /reported_dataset_context_missing/u,
    },
    {
      source: "Elektro og øvrige faghandelsprofiler inngår ikke i de innsendte dataene. Coop har levert tall for perioden 2018 til og med 2022.",
      text: "Elektro og øvrige faghandelsprofiler inngår ikke i de innsendte dataene.",
      evidence: "Elektro og øvrige faghandelsprofiler inngår ikke i de innsendte dataene.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      source: "Electro profiles are absent from submitted data.",
      text: "Electro profiles are absent from submitted data.",
      evidence: "Electro profiles are absent from submitted data.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      source: "The dataset excludes electro profiles.",
      text: "The dataset excludes electro profiles.",
      evidence: "The dataset excludes electro profiles.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      source: "Electro profiles are omitted from the submitted dataset.",
      text: "Electro profiles are omitted from the submitted dataset.",
      evidence: "Electro profiles are omitted from the submitted dataset.",
      error: /material_exclusion_scope_missing/u,
    },
    {
      source: "Electro profiles were left out of the submitted dataset.",
      text: "Electro profiles were left out of the submitted dataset.",
      evidence: "Electro profiles were left out of the submitted dataset.",
      error: /material_exclusion_scope_missing/u,
    },
  ] as const;

  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("rejects Pilot18 detached share, ownership and method references", () => {
  const cases = [
    {
      source: "I 2024 nådde europeiske EMV-salg 352 milliarder euro, med en samlet markedsandel på 38,5 % av dagligvaremarkedets verdi. I 2025 økte dette ytterligere til 384 milliarder euro og 38,7 %.",
      text: "I 2024 nådde europeiske EMV-salg 352 milliarder euro med en samlet markedsandel på 38,5 % av dagligvaremarkedets verdi, og i 2025 økte salget til 384 milliarder euro og 38,7 %.",
      evidence: "I 2024 nådde europeiske EMV-salg 352 milliarder euro, med en samlet markedsandel på 38,5 % av dagligvaremarkedets verdi. I 2025 økte dette ytterligere til 384 milliarder euro og 38,7 %.",
      error: /share_measure_missing/u,
    },
    {
      source: "In 2024 European EMV sales reached 352 billion euros with a market share of 38.5% of grocery-market value, in 2025 sales rose to 384 billion euros and 38.7%.",
      text: "In 2024 European EMV sales reached 352 billion euros with a market share of 38.5% of grocery-market value, in 2025 sales rose to 384 billion euros and 38.7%.",
      evidence: "In 2024 European EMV sales reached 352 billion euros with a market share of 38.5% of grocery-market value, in 2025 sales rose to 384 billion euros and 38.7%.",
      error: /share_measure_missing/u,
    },
    {
      source: "In 2024 European EMV sales reached 352 billion euros with a market share of 38.5% of grocery-market value; in 2025 sales rose to 384 billion euros and 38.7%.",
      text: "In 2024 European EMV sales reached 352 billion euros with a market share of 38.5% of grocery-market value; in 2025 sales rose to 384 billion euros and 38.7%.",
      evidence: "In 2024 European EMV sales reached 352 billion euros with a market share of 38.5% of grocery-market value; in 2025 sales rose to 384 billion euros and 38.7%.",
      error: /share_measure_missing/u,
    },
    {
      source: "Mowi ASA. Storste aksjonaer: Geveran Trading Co. Ltd. (John Fredriksen) - ~14,4%.",
      text: "Mowi ASA hadde Geveran Trading Co. Ltd. som største aksjonær, med ~14,4%.",
      evidence: "Mowi ASA. Storste aksjonaer: Geveran Trading Co. Ltd. (John Fredriksen) - ~14,4%.",
      error: /ownership_as_of_missing/u,
    },
    {
      source: "Mowi eier Geveran. Årsrapport 2024.",
      text: "Mowi eier Geveran. Årsrapport 2024.",
      evidence: "Mowi eier Geveran. Årsrapport 2024.",
      error: /ownership_as_of_missing/u,
    },
    {
      source: "Et viktig funn er at et lite antall store selskaper ofte dekker 70–80 % av ressursbruken i en sektor, noe som gjør metoden praktisk gjennomførbar.",
      text: "Et lite antall store selskaper dekker ofte 70–80 % av ressursbruken i en sektor i den beskrevne kartleggingsmetoden.",
      evidence: "Et viktig funn er at et lite antall store selskaper ofte dekker 70–80 % av ressursbruken i en sektor, noe som gjør metoden praktisk gjennomførbar.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Et viktig poeng er at lokale variasjoner er store. Metoden måler vekt av innkjøpte materialer, ikke livsløp, energi, transport, vann eller menneskelige ressurser.",
      text: "Ressurskartleggingsmetoden måler vekt av innkjøpte materialer, ikke livsløp, energi, transport, vann eller menneskelige ressurser.",
      evidence: "Et viktig poeng er at lokale variasjoner er store. Metoden måler vekt av innkjøpte materialer, ikke livsløp, energi, transport, vann eller menneskelige ressurser.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Økonomiske data omregnes til fysiske materialmengder. Metoden bruker ikke GIS-data i denne sammenhengen.",
      text: "Ressurskartleggingsmetoden bruker ikke GIS-data i denne sammenhengen.",
      evidence: "Økonomiske data omregnes til fysiske materialmengder. Metoden bruker ikke GIS-data i denne sammenhengen.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "The new method classifies costs.",
      text: "The capital method classifies costs.",
      evidence: "The new method classifies costs.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Their method classifies costs.",
      text: "The capital method classifies costs.",
      evidence: "Their method classifies costs.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Metoden klassifiserer kostnader. Tilnærmingen fokuserer på regnskapstall.",
      text: "Konkurransetilsynets kapitalmetode klassifiserer kostnader.",
      evidence: "Metoden klassifiserer kostnader. Tilnærmingen fokuserer på regnskapstall.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Kostnader beskrives. Metoden klassifiseres. Metoden for lønnsomhet er beskrevet i kapittel 3.",
      text: "Konkurransetilsynets kapitalmetode klassifiserer kostnader.",
      evidence: "Kostnader beskrives. Metoden klassifiseres. Metoden for lønnsomhet er beskrevet i kapittel 3.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Kostnader beskrives. Metoden klassifiseres. Kapitalmetoden er beskrevet separat.",
      text: "Konkurransetilsynets kapitalmetode klassifiserer kostnader.",
      evidence: "Kostnader beskrives. Metoden klassifiseres. Kapitalmetoden er beskrevet separat.",
      error: /evidence_context_dependent/u,
    },
  ] as const;

  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("rejects Pilot18 survey result units reported as no-material-claim", () => {
  const cases = [
    "What are the main activities performed by the company? Most companies are dedicated to primary production (close to 70%).",
    "How many years of experience does your company have? On average, companies have approximately 9.5 years of industry experience.",
    "Which species does your company produce? Most insect food companies produce yellow mealworm (50%), followed by house cricket (33,4%).",
    "The total production of insects for human consumption in 2023 was 802,65 tonnes. This marks a substantial increase compared to 2022.",
    "The total production foreseen for 2025 is 2 755,44 tonnes. The total forecasted insect food production in 2030 is 43 044,2 tonnes.",
    "When asked to rank the most important factors for business growth, respondents identified regulatory barriers, consumer acceptance and funding opportunities.",
    "When asked to rank the factors limiting growth, companies identified consumer reluctance, regulatory constraints and limited availability as the primary obstacles.",
    "Respondentene identifiserte regulatoriske barrierer, forbrukeraksept og finansieringsmuligheter.",
    "Totalt svarte 19 respondenter.",
    "Totalt svarte 19 selskaper.",
    "Totalt svarte 19 produsenter.",
    "The total response count was 14.",
    "The total number of respondents was 19.",
    "The response total was 19.",
    "There were 19 respondents.",
    "The survey received 19 responses.",
    "The survey gathered 19 responses.",
    "The total response count was: 14.",
    "The survey received 19 survey responses.",
    "The forecast is 43 044 tonnes in 2030.",
    "The forecast was 43 044 tonnes in 2030.",
    "Forecasted production is 43 044 tonnes in 2030.",
    "The projected production is 43 044 tonnes in 2030.",
    "Forecast: 43 044 tonnes in 2030.",
    "Forecasted output is 43 044 tonnes in 2030.",
    "Prognosen er 43 044 tonn i 2030.",
    "Prognose: 43 044 tonn i 2030.",
    "Prognosen for 2030 er 43 044 tonn.",
    "Respondents reported that regulatory barriers were important.",
    "Most respondents selected regulatory barriers.",
    "Respondents ranked funding opportunities first.",
    "Companies reported consumer reluctance as a barrier.",
    "Respondentene rapporterte at regulatoriske barrierer var viktige.",
    "Flest respondenter valgte regulatoriske barrierer.",
    "Respondentene rangerte finansiering først.",
    "Selskapene oppga forbrukermotstand som en hindring.",
    "De fleste selskapene foretrakk primærproduksjon.",
    "Projected revenue is 10 million euros in 2030.",
    "The forecast for 2030 is 43 044 units.",
    "Forecasted production is expected to double by 2030.",
    "The projection is 2.5 million euros by 2030.",
    "Projisert omsetning er 10 millioner euro i 2030.",
    "Prognosen for 2030 er 43 044 enheter.",
  ];
  for (const text of cases) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "no_material_claim" }],
      claims: [],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /material_claim_omission/u, text);
  }
});

test("rejects Pilot21 numbered learning sections with declarative findings as no-material-claim", () => {
  const cases = [
    "LÆRING 2 / Malmø\nDenne delen løfter frem at lokale materialstrømsanalyser er en nøkkel for å drive sirkulær omstilling videre. Malmö kommune opplever kartleggingene som svært nyttige.",
    "Læring 6: Denne delen utdyper hvordan indikatorer og kategorier er valgt. Kartleggingsmetoden har gitt konkret og anvendbar data til indikatoren.",
    "LEARNING 3 — Regional mapping\nThe municipality reports that the mapping gives usable data for the indicator.",
    "Learning 3\nThe mapping provides useful data for the indicator.",
    "Læring 3\nMetoden produserer nyttige data for indikatoren.",
    "Learning 3\nThe study demonstrates a material improvement.",
    "Læring 3\nMetoden identifiserer sektorer med høy ressursbruk.",
    "Learning #3\nThe municipality reports that the mapping gives usable data.",
    "Læring nr. 2\nKommunen rapporterer at kartleggingen gir bedre data.",
    "Læringspunkt 2\nKommunen rapporterer at kartleggingen gir bedre data.",
    "Learning point 2\nThe municipality reports that the mapping gives usable data.",
    "Learning 3: The mapping provides useful data for the indicator",
    "Learning 3 — The mapping provides useful data",
    "Læring 3: Kartleggingen avdekker store lokale forskjeller",
    "Learning 3\nThe mapping supports better decisions for the municipality.",
    "Læring 3\nKartleggingen avdekker store lokale forskjeller.",
    "Læring 3\nMetoden inkluderer fem ressurskategorier.",
    "Learning 3: The mapping reveals useful data",
    "Learning 3 — The mapping highlights important differences",
    "Læring 3: Metoden beskriver lokale ressursstrømmer",
    "Learning 3: The method enables better planning",
    "Læring 3: Metoden måler materialvekter",
    "Læring 3: Metoden bruker fem kategorier",
    "Læring 3: Metoden sikrer sammenlignbarhet",
    "Learning 3: The document reveals useful findings",
    "Learning 3: The findings highlight important differences",
    "Learning 3: The chapter explains the method",
    "Learning 3: In practice, the mapping reveals useful data",
    "Learning 3: Malmö kommune beskriver lokale forskjeller",
    "Learning 3: A framework highlights important differences",
    "Læring 3: Denne metoden beskriver lokale ressursstrømmer",
    "Learning 3: The document outlines useful findings",
    "Learning 3: The findings suggest important differences",
    "Learning 3: The chapter summarizes the method",
    "Læring 3: Kartleggingen bekrefter store forskjeller",
    "Læring 3: Metoden omfatter fem ressurskategorier",
    "Læring 3: Kommunen anvender metoden lokalt",
    "Learning 3: In practice, the mapping outlines useful data",
  ];
  for (const text of cases) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "no_material_claim" }],
      claims: [],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /material_claim_omission/u, text);
  }
});

test("keeps Pilot21 numbered learning headings and questions eligible for no-material coverage", () => {
  const cases = [
    "LÆRING 2 / Malmø",
    "Learning 3\nWhat did the municipality learn?",
    "## Læring 6\nHva er neste steg?",
    "Learning 1\nDescribe how the municipality reports findings.",
    "Learning 1: Explain how the municipality reports findings.",
    "Learning 1\nThis is a report heading",
    "Contents\nLearning 1 — Learning outcomes\nLearning 2 — The report is clear\nAppendix",
    "Learning 1\nPlease describe how the municipality reports findings.",
    "Learning 1\nCan you describe how the municipality reports findings",
    "Contents\nLearning 1 — Learning outcomes\nLearning 2 — The report is clear.\nAppendix",
    "Contents\nLearning 1 — Learning outcomes\nLearning 2 — Regional report: The report is clear.\nAppendix",
    "Learning 1\nThe mapping overview for Malmö municipality",
    "Learning 1\nThe method used for regional resource mapping",
    "Learning 1\nThe report overview for the municipality",
    "Læring 1\nMetoden for regional ressurskartlegging",
    "Læring 1\nRapporten om regional kartlegging",
  ];
  for (const text of cases) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "no_material_claim" }],
      claims: [],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), text);
  }
});

test("rejects Pilot22 structured company analysis and headerless CSV continuations as no-material", () => {
  const cases = [
    `## 10. Mowi ASA

### A. Eierskap
- Storste aksjonaer: Geveran Trading Co. Ltd. - 14,4%

### B. Finansielle data (2024)
| Nokkeltall | Verdi |
|---|---|
| Omsetning | EUR 5,62 mrd. |
| Operasjonelt EBIT | EUR 829 mill. |

### C. Offentlig stotte
- Horizon 2020-prosjekt med REEtec og SINTEF

### D. IP - Patenter
- 2 000+ patenter og patentsoknader`,
    `dk-usda-gain-retail-2025,P1,candidate_fetch,dk,markedsmakt,market-report,USDA FAS,Retail Foods Annual Denmark,2025,https://example.test/denmark.pdf,official_pdf,low,country_profile
fi-kkv-food-market-study-2023,P1,candidate_fetch,fi,prispress,authority-news,FCCA,The FCCA studies the food market,2023,https://example.test/finland,official_html,low,entry`,
  ];
  for (const text of cases) {
    const job = verifiedJob([text]);
    if (text.startsWith("dk-usda-")) {
      Object.assign(job.units[0]!.descriptor, { unitType: "sheet_range" });
    }
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "no_material_claim" }],
      claims: [],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /material_claim_omission/u, text);
  }
});

test("keeps Pilot22 prose and a lone headerless comma row eligible for no-material coverage", () => {
  const cases = [
    "This note mentions Mowi, ownership, finance, patents, and support without reporting a finding.",
    "dk-usda-gain-retail-2025,P1,candidate_fetch,dk,markedsmakt,market-report",
    "Alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota\nOmega, sigma, tau, upsilon, phi, chi, psi, rho, kappa",
    `### A. Ownership
### B. Financial data
| Metric | Value |
|---|---|
| Revenue | 2024 NOK |
| Margin | 4% |
### C. Public support
### D. IP`,
    `## 1. Generic Report
### A. Ownership
### B. Financial data
| Metric | Value |
|---|---|
| Revenue | 2024 NOK |
| Margin | 4% |
### C. Public support
### D. IP`,
  ];
  for (const text of cases) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "no_material_claim" }],
      claims: [],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), text);
  }

  const proseSheet = verifiedJob([
    "Alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota\nOmega, sigma, tau, upsilon, phi, chi, psi, rho, kappa",
  ]);
  Object.assign(proseSheet.units[0]!.descriptor, { unitType: "sheet_range" });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: proseSheet,
    response: segmentResponse(proseSheet),
  }));
});

test("keeps Pilot18 headings, contents and questions eligible for no-material coverage", () => {
  const cases = [
    "Contents\nMain findings\nAppendix",
    "## Findings\n",
    "Konkurransetilsynet finner hvilke priser?",
    "Studien finner?",
    "## Findings\nWhat are the main activities performed by the company?",
    "Method\nWhat method was used?",
    "Konkurransetilsynet finner hvilke priser?\nAlternativ A",
    "Studien finner?\nSvar: A",
    "## Findings\nWhat are the main activities performed by the company?\nOptions: A, B",
    "Method\nWhat method was used?\nSelect one.",
    "Contents\nMain findings\n1. Introduction",
    "Table of contents\nFindings\n1. Methodology",
    "Innhold\nHovedfunn\n1. Metode",
    "## Findings\nHva fant studien?\nSvaralternativer: A, B",
  ];
  for (const text of cases) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "no_material_claim" }],
      claims: [],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), text);
  }
});

test("rejects Pilot18 document and attribution evidence bypasses", () => {
  const cases = [
    {
      source: "Dette dokumentet er importert som metadata fra en lokal PDF.",
      text: "Konkurransetilsynets rapport er importert som metadata.",
      evidence: "Dette dokumentet er importert som metadata fra en lokal PDF.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Prisene steg.",
      text: "Ifølge Konkurransetilsynet steg prisene.",
      evidence: "Prisene steg.",
      error: /actor_attribution_not_source_visible/u,
    },
    {
      source: "Prisene steg.",
      text: "Konkurransetilsynet oppgir at prisene steg.",
      evidence: "Prisene steg.",
      error: /actor_attribution_not_source_visible/u,
    },
    {
      source: "Kildeopplysningen står først. Dette dokumentet er registrert lokalt.",
      text: "Konkurransetilsynets rapport er importert.",
      evidence: "Kildeopplysningen står først. Dette dokumentet er registrert lokalt.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "I metadata er dette dokumentet importert fra en lokal PDF.",
      text: "Konkurransetilsynets rapport er importert.",
      evidence: "I metadata er dette dokumentet importert fra en lokal PDF.",
      error: /evidence_context_dependent/u,
    },
    {
      source: "Ifølge CMA steg prisene.",
      text: "Ifølge CMA steg prisene, og Statistics Norway rapporterte kostnadene.",
      evidence: "Ifølge CMA steg prisene.",
      error: /actor_attribution_not_source_visible/u,
    },
    {
      source: "Statistics Norway reported costs.",
      text: "CMA, which reported prices, and Statistics Norway reported costs.",
      evidence: "Statistics Norway reported costs.",
      error: /actor_attribution_not_source_visible/u,
    },
    {
      source: "Dette dokument er importert som metadata fra en lokal PDF.",
      text: "Dette dokument er importert som metadata fra en lokal PDF.",
      evidence: "Dette dokument er importert som metadata fra en lokal PDF.",
      error: /context_dependent_claim/u,
    },
    {
      source: "I metadata omtales dokumentet som lokalt.",
      text: "I metadata omtales dokumentet som lokalt.",
      evidence: "I metadata omtales dokumentet som lokalt.",
      error: /context_dependent_claim/u,
    },
    {
      source: "Disse dokumentene er importert som metadata.",
      text: "Disse dokumentene er importert som metadata.",
      evidence: "Disse dokumentene er importert som metadata.",
      error: /context_dependent_claim/u,
    },
  ] as const;
  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("keeps scoped Pilot18 counterparts eligible", () => {
  const cases = [
    "Konkurransetilsynets lønnsomhetsrapport er importert som metadata fra en lokal PDF i research/evidence-pack.",
    "This document (the 2024 report) is imported as metadata.",
    "Dette dokumentet: Konkurransetilsynets rapport 2024 er importert som metadata.",
    "Dette dokumentet — Konkurransetilsynets rapport 2024 — er importert som metadata.",
    "For åtte leverandører i 2017–2022 varierte absolutt bruttomargin mellom 30 og 65 prosent, basert på regnskapsdata i Konkurransetilsynets analyse.",
    "Per rapportdatoen 2024 hadde Konkurransetilsynet mottatt resultatoppstillinger og balanser fra 14 av 16 leverandører og alle tre dagligvarekjedene.",
    "Per report date 2024, the authority has received income statements and balance sheets from 14 suppliers for the 2024 reporting period.",
    "Elektro og øvrige faghandelsprofiler inngår ikke i Coops innsendte tall for perioden 2018–2022.",
    "I 2025 var europeiske EMV-salg 384 milliarder euro og markedsandelen var 38,7 prosent av dagligvaremarkedets verdi.",
    "Per 31.12.2024 hadde Mowi ASA Geveran Trading Co. Ltd. som største aksjonær med omtrent 14,4 prosent.",
    "Et lite antall store selskaper dekker ofte 70–80 prosent av ressursbruken i en sektor, noe som gjør den regionale ressurskartleggingsmetoden praktisk gjennomførbar.",
    "Dette dokumentet, Konkurransetilsynets rapport 2024, er importert som metadata.",
    "Ifølge Konkurransetilsynet steg prisene i Norge i 2024.",
  ];
  for (const text of cases) {
    const job = verifiedJob([text]);
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response: segmentResponse(job, {
        unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
        claims: [claim(job, 0, text)],
      }),
    }), text);
  }
});

function verifiedJob(texts: string[]): LibraryAnalysisVerifiedJob {
  const units = texts.map((text, ordinal) => ({
    descriptor: unit(String(ordinal), ordinal, text),
    text,
  }));
  return {
    job: {
      jobId: "job:library-analysis:fixture",
      sourceKind: "document",
      sourceKey: "document:fixture",
      segmentOrdinal: 0,
      unitIds: units.map(({ descriptor }) => descriptor.id),
      unitOrdinalStart: 0,
      unitOrdinalEnd: Math.max(0, units.length - 1),
      codePoints: units.reduce((sum, { descriptor }) => sum + descriptor.codePoints, 0),
      bytes: units.reduce((sum, { descriptor }) => sum + descriptor.sizeBytes, 0),
      inputEnvelopeHash: HASH,
    },
    units,
  };
}

function segmentResponse(
  job: LibraryAnalysisVerifiedJob,
  overrides: Partial<{
    unitCoverage: unknown[];
    claims: unknown[];
    model: LibraryAnalysisAgentModelReceipt;
    responseHash: string;
  }> = {},
): Record<string, unknown> {
  const response = {
    schema: "library-analysis-agent-segment-response/v1" as const,
    queueHash: HASH,
    jobId: job.job.jobId,
    jobHash: job.job.inputEnvelopeHash,
    attempt: 1,
    inputHash: INPUT_HASH,
    model: EXPECTED_MODEL,
    unitCoverage: job.units.map(({ descriptor }) => ({
      contentUnitId: descriptor.id,
      status: "no_material_claim" as const,
    })),
    claims: [],
    responseHash: HASH,
    ...overrides,
  };
  response.responseHash = overrides.responseHash ?? libraryAnalysisAgentSegmentResponseHash(response);
  return response;
}

function claim(job: LibraryAnalysisVerifiedJob, localOrdinal: number, text: string) {
  const descriptor = job.units[localOrdinal]!.descriptor;
  return {
    localOrdinal,
    assertionType: "claim" as const,
    contentUnitId: descriptor.id,
    text,
    evidence: text,
    locator: descriptor.locator,
    confidence: 0.8,
  };
}

function rehash(response: Record<string, unknown>): Record<string, unknown> {
  return { ...response, responseHash: libraryAnalysisAgentSegmentResponseHash(response) };
}

test("accepts complete coverage and derives claim IDs", () => {
  const job = verifiedJob(["Alpha grew by 12 percent.", "No material claim here."]);
  const response = segmentResponse(job, {
    unitCoverage: [
      { contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" },
      { contentUnitId: job.units[1]!.descriptor.id, status: "no_material_claim" },
    ],
    claims: [claim(job, 0, "Alpha grew by 12 percent.")],
  });
  const accepted = validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response,
  });
  assert.match(accepted.claims[0]!.claimId, /^claim:library-agent:[a-f0-9]{64}$/u);
  assert.equal(
    accepted.claims[0]!.claimId,
    deterministicLibraryAnalysisAgentClaimId(job.job, accepted.claims[0]!),
  );
});

test("rejects omitted units, foreign locators, fabricated evidence, and hash drift", () => {
  const job = verifiedJob(["verified evidence"]);
  const complete = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [claim(job, 0, "verified evidence")],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL, job, response: rehash({ ...complete, unitCoverage: [] }) }), /unit_coverage_mismatch/u);
  const completeClaim = (complete.claims as unknown[])[0] as Record<string, unknown>;
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL, job, response: rehash({ ...complete, claims: [{ ...completeClaim, locator: "foreign:locator" },] }) }), /locator_ownership_mismatch/u);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL, job, response: rehash({ ...complete, claims: [{ ...completeClaim, evidence: "invented" },] }) }), /evidence_not_contained/u);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL, job, response: { ...complete, responseHash: "0".repeat(64) } }), /response_hash_mismatch/u);
});

test("requires the controller model receipt and never trusts a worker self-report", () => {
  const job = verifiedJob(["Alpha grew by 12 percent."]);
  const response = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [claim(job, 0, "Alpha grew by 12 percent.")],
    model: { provider: "openai-codex", name: "gpt-5.6-luna", version: "worker-receipt" },
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL, job, response }), /model_receipt_mismatch/u);
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL, job, response: { ...response, model: EXPECTED_MODEL } }), /response_hash_mismatch|model_receipt_mismatch/u);
});

test("requires typed blocked coverage and rejects claims without owned numeric evidence", () => {
  const job = verifiedJob(["Revenue was -12% and cost €4.50."]);
  const blocked = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "blocked", reasonCode: "insufficient_context" }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL, job, response: { ...blocked, unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "blocked" }] } }), /blocked_reason_code_required/u);
  const numericDrift = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{ ...claim(job, 0, "Revenue was 12 percent and cost $4.50."), evidence: "Revenue was -12% and cost €4.50." }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({ queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL, job, response: numericDrift }), /numeric_token_mismatch/u);
});

test("rejects claims and evidence with unresolved causal or temporal context", () => {
  for (const contextualText of [
    "Derfor forventes ytterligere vekst.",
    "Gjennom perioden steg prisene.",
    "I denne perioden steg prisene.",
    "Throughout the period, prices increased.",
  ]) {
    const job = verifiedJob([contextualText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, contextualText)],
    });
    assert.throws(
      () => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response,
      }),
      /(?:context_dependent_claim|period_scope_missing)/u,
    );
  }

  const unrelatedYearEvidence = "The report was published in 2024. Throughout the period, prices increased.";
  const unrelatedYearJob = verifiedJob([unrelatedYearEvidence]);
  const unrelatedYear = segmentResponse(unrelatedYearJob, {
    unitCoverage: [{ contentUnitId: unrelatedYearJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(unrelatedYearJob, 0, "Throughout the period, prices increased."),
      evidence: unrelatedYearEvidence,
    }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: unrelatedYearJob,
    response: unrelatedYear,
  }), /period_scope_missing/u);
});

test("keeps explicit subjects and bounded periods eligible", () => {
  for (const selfContainedText of [
    "The Norwegian retail-price index increased from 2022 to 2024.",
    "The survey method used responses from 19 Nordic companies.",
    "Kartleggingsmetoden for norske dagligvarebutikker bruker GIS-data.",
    "Throughout the period from 2022 to 2024, prices increased.",
  ]) {
    const job = verifiedJob([selfContainedText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, selfContainedText)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }

  const causalEvidence = "Therefore, the Norwegian retail-price index increased.";
  const causalJob = verifiedJob([causalEvidence]);
  const selfContainedClaim = segmentResponse(causalJob, {
    unitCoverage: [{ contentUnitId: causalJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(causalJob, 0, "The Norwegian retail-price index increased."),
      evidence: causalEvidence,
    }],
  });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: causalJob,
    response: selfContainedClaim,
  }));
});

test("rejects the seven audited unscoped report, ownership, expectation, and status claims", () => {
  const assertRejected = (text: string, error: RegExp) => {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.throws(
      () => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response,
      }),
      error,
    );
  };

  for (const text of [
    "S Group og K Group rapporterer flere tiltak enn Lidl, blant annet informasjon og veiledning om baerekraftig spising via nettinnhold og butikkmateriell.",
    "S Group, K Group og Lidl Finland rapporterer tiltak knyttet til bedre utvalg av plantebaserte varer og tiltak mot matsvinn.",
  ]) {
    assertRejected(text, /reported_measure_context_missing/u);
  }

  for (const text of [
    "Austevoll Seafood kontrolleres av Laco AS (ultimate morselskap).",
    "Samvirkelagene eier fellesorganisasjonen Coop Norge SA",
  ]) {
    assertRejected(text, /ownership_as_of_missing/u);
  }

  assertRejected(
    "Forventningen er en «10-step start» — ikke full levering, men oppstart av et lengre arbeid.",
    /expectation_actor_scope_missing/u,
  );

  for (const [text, error] of [
    ["Dashboard brukes som internt arbeidsverktøy; presentasjoner lages separat.", /status_scope_or_as_of_missing/u],
    ["Ingen partnere i søknaden er kontaktet etter tildelingen.", /status_scope_or_as_of_missing/u],
  ] as const) {
    assertRejected(text, error);
  }
});

test("keeps scoped report, ownership, expectation, and status boundaries eligible", () => {
  const assertAccepted = (text: string) => {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  };

  for (const text of [
    "S Group og K Group rapporterer i 2022, basert på en kvalitativ innholdsanalyse av baerekraftsrapporter, flere tiltak enn Lidl.",
    "S Group, K Group og Lidl Finland rapporterer i 2022, basert på en kvalitativ innholdsanalyse av baerekraftsrapporter, tiltak mot matsvinn.",
    "Austevoll Seafood kontrolleres av Laco AS per 31.12.2024.",
    "Samvirkelagene eier Coop Norge SA per 31.12.2024.",
    "For Nordic Innovation Hotspot Transition Groups er forventningen en «10-step start» — ikke full levering.",
    "The expectation for the Nordic Innovation Hotspot Transition Groups is a 10-step start, not full delivery.",
    "Per 13. april 2026 for Nordic Innovation Hotspot Transition Groups brukes dashboardet som internt arbeidsverktøy; presentasjoner lages separat.",
    "Per 13. april 2026 for Nordic Innovation Hotspot-søknaden er ingen partnere kontaktet etter tildelingen.",
  ]) {
    assertAccepted(text);
  }
});

test("rejects Pilot08 analytical-measure excerpts that omit their period and basis", () => {
  const cases = [
    {
      source: "Konkurransetilsynet har hentet inn regnskapstall for perioden 2017 til 2022. Videre har Konkurransetilsynet beregnet avkastning på netto driftsrelaterte eiendeler, såkalt RNOA, som et mål på lønnsomhet.",
      text: "Konkurransetilsynet har beregnet avkastning på netto driftsrelaterte eiendeler, såkalt RNOA, som et mål på lønnsomhet.",
      evidence: "Videre har Konkurransetilsynet beregnet avkastning på netto driftsrelaterte eiendeler, såkalt RNOA, som et mål på lønnsomhet.",
    },
    {
      source: "Analysegrunnlaget er regnskapsdata for perioden 2017 til 2022. Konkurransetilsynet har kartlagt lønnsomhet i dagligvarevirksomheten.",
      text: "Konkurransetilsynet har kartlagt lønnsomhet i dagligvarevirksomheten.",
      evidence: "Konkurransetilsynet har kartlagt lønnsomhet i dagligvarevirksomheten.",
    },
    {
      source: "Regnskapstallene dekker 2017 til 2022. RNOA ble beregnet for dagligvareaktørene.",
      text: "RNOA ble beregnet for dagligvareaktørene.",
      evidence: "RNOA ble beregnet for dagligvareaktørene.",
    },
    {
      source: "Årsregnskapene dekker 2017 til 2022. Konkurransetilsynet beregnet lønnsomhet for aktørene.",
      text: "Konkurransetilsynet beregnet lønnsomhet for aktørene.",
      evidence: "Konkurransetilsynet beregnet lønnsomhet for aktørene.",
    },
    {
      source: "Konkurransetilsynet har beregnet RNOA. Rapporten ble publisert i 2024, basert på regnskapstall.",
      text: "Konkurransetilsynet har beregnet RNOA. Rapporten ble publisert i 2024, basert på regnskapstall.",
      evidence: "Konkurransetilsynet har beregnet RNOA. Rapporten ble publisert i 2024, basert på regnskapstall.",
    },
    {
      source: "Konkurransetilsynet beregner lønnsomhet for aktørene.",
      text: "Konkurransetilsynet beregner lønnsomhet for aktørene.",
      evidence: "Konkurransetilsynet beregner lønnsomhet for aktørene.",
    },
  ];
  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /analytical_measure_context_missing/u);
  }
});

test("keeps bounded analytical measures and unrelated mappings eligible", () => {
  for (const text of [
    "Basert på regnskapstall for perioden 2017 til 2022 har Konkurransetilsynet beregnet RNOA.",
    "Using financial statements from 2017 to 2022, the authority calculated operating margins.",
    "RNOA ble beregnet for perioden 2017 til 2022 ved hjelp av årsrapporter.",
    "Konkurransetilsynet beregnet lønnsomhet for perioden 2017 til 2022 på grunnlag av årsregnskap.",
    "Operating margins were calculated from 2017 to 2022 using annual reports.",
    "Konkurransetilsynet har kartlagt aktørene i det norske dagligvaremarkedet.",
    "Studien har beregnet antall butikker.",
  ]) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }
});

test("rejects Pilot09 unresolved local references while preserving named scope", () => {
  for (const contextualText of [
    "I dette vedlegget presenteres Konkurransetilsynets metode for verdsetting av eiendeler.",
    "Tilsynets analyser gir ikke grunnlag for å slå fast om andre faktorer var medvirkende.",
    "Rapporten viser at tilsynets analyser gir ikke grunnlag for å slå fast om andre faktorer var medvirkende.",
    "Trenden på tvers av utvalget er at lønnsomheten falt fra 2021 til 2022.",
    "Mye av informasjonen må hentes fra årsrapporter og ulike kilder.",
    "Lignende analyser finnes i enkelte regioner i Europa.",
    "Når det gjelder offentlig sektor, er den i liten grad inkludert i analysen.",
    "Analysen viser at offentlig sektor er lite inkludert.",
    "Data kan føre til dobbeltelling.",
    "Double counting may occur.",
    "Det kan forekomme noe dobbeltelling, men dette vurderes som begrenset i praksis.",
  ]) {
    const job = verifiedJob([contextualText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, contextualText)],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /context_dependent_claim/u);
  }

  for (const scopedText of [
    "I vedlegg A presenteres Konkurransetilsynets metode for verdsetting av eiendeler.",
    "Konkurransetilsynets analyser gir ikke grunnlag for å slå fast om andre faktorer var medvirkende.",
    "Tilsynets analyser av driftsmarginer gir ikke grunnlag for å slå fast om andre faktorer var medvirkende.",
    "Trenden på tvers av utvalget på åtte leverandører, basert på regnskapstall, er at lønnsomheten falt fra 2021 til 2022.",
    "Mye av informasjonen om regionale materialstrømmer må hentes fra årsrapporter og ulike kilder.",
    "Lignende regionale ressurskartleggingsanalyser finnes i Bayern og Nederland.",
    "Lignende analyser av RNOA finnes i Bayern og Nederland.",
    "Offentlig sektor er i liten grad inkludert i den regionale ressursanalysen.",
    "Offentlig sektor er i liten grad inkludert i analysen av regionale materialstrømmer.",
    "Materialstrømmer kan dobbeltelles, men dette vurderes som begrenset i praksis.",
    "Det kan forekomme dobbeltelling av samme virksomhet, men dette vurderes som begrenset i praksis.",
  ]) {
    const job = verifiedJob([scopedText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, scopedText)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }

  for (const row of [
    {
      source: "I dette vedlegget presenteres Konkurransetilsynets metode for verdsetting av eiendeler.",
      text: "Vedlegg A presenterer Konkurransetilsynets metode for verdsetting av eiendeler.",
      evidence: "I dette vedlegget presenteres Konkurransetilsynets metode for verdsetting av eiendeler.",
    },
    {
      source: "Tilsynets analyser gir ikke grunnlag for å slå fast om andre faktorer var medvirkende.",
      text: "Konkurransetilsynets analyser av driftsmarginer gir ikke grunnlag for å slå fast om andre faktorer var medvirkende.",
      evidence: "Tilsynets analyser gir ikke grunnlag for å slå fast om andre faktorer var medvirkende.",
    },
  ]) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /evidence_context_dependent/u);
  }
});

test("rejects Pilot09 undated shares, title headings and unscoped survey results", () => {
  const cases = [
    {
      source: "Coop Trading has a 33% market share in the Nordic region.",
      text: "Coop Trading has a 33% market share in the Nordic region.",
      evidence: "Coop Trading has a 33% market share in the Nordic region.",
      error: /share_as_of_missing/u,
    },
    {
      source: "Coop Trading has a 33% market share in the Nordic region. The report was published in 2025.",
      text: "Coop Trading has a 33% market share in the Nordic region. The report was published in 2025.",
      evidence: "Coop Trading has a 33% market share in the Nordic region. The report was published in 2025.",
      error: /share_as_of_missing/u,
    },
    {
      source: "IPIFF Survey: Main Findings Report",
      text: "The report is titled IPIFF Survey: Main Findings Report.",
      evidence: "IPIFF Survey: Main Findings Report",
      error: /title_context_missing/u,
    },
    {
      source: "The IPIFF survey gathered responses from 19 EU insect farming companies. 57.8% of companies responded that their main market is European.",
      text: "57.8% of companies responded that their main market is European.",
      evidence: "57.8% of companies responded that their main market is European.",
      error: /survey_scope_missing/u,
    },
    {
      source: "The IPIFF survey gathered responses from 19 EU insect farming companies. The most established companies have 10 to 18 years of experience, while newer entrants have 3 to 8 years.",
      text: "The most established companies have 10 to 18 years of experience, while newer entrants have 3 to 8 years.",
      evidence: "The most established companies have 10 to 18 years of experience, while newer entrants have 3 to 8 years.",
      error: /survey_scope_missing/u,
    },
    {
      source: "The IPIFF survey gathered responses from 19 EU insect farming companies. Most insect food companies produce yellow mealworm (50%) and house cricket (33.4%).",
      text: "Most insect food companies produce yellow mealworm (50%) and house cricket (33.4%).",
      evidence: "Most insect food companies produce yellow mealworm (50%) and house cricket (33.4%).",
      error: /survey_scope_missing/u,
    },
  ];
  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error);
  }

  for (const scopedText of [
    "Coop Trading had a 33% Nordic market share in 2025.",
    "Market share is the proportion of sales held by a company in a defined market.",
    "The report title is IPIFF Survey: Main Findings Report.",
    "The report is titled IPIFF Survey: Main Findings Report.",
    "Among 19 EU insect farming companies, 57.8% responded that their main market is European.",
    "Among 19 EU insect farming companies, the most established respondents had 10 to 18 years of experience.",
    "Among 19 EU insect farming companies, 50% produced yellow mealworm and 33.4% produced house cricket.",
  ]) {
    const job = verifiedJob([scopedText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, scopedText)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }
});

test("rejects Pilot19 inferred awards, generic authority substitutions and heading fragments", () => {
  const cases = [
    {
      source: "250 000 kr per transition group (Cities + Food) - Totalt 500 000 kr fra Nordic Innovation Hotspot",
      text: "Nordic Innovation Hotspot bevilget totalt 500 000 kr, fordelt med 250 000 kr per transition group (Cities + Food).",
      evidence: "250 000 kr per transition group (Cities + Food) - Totalt 500 000 kr fra Nordic Innovation Hotspot",
      error: /award_action_not_source_visible/u,
    },
    {
      source: "I dette vedlegget beskrives Konkurransetilsynets metode. I lys av denne usikkerheten har tilsynet valgt å runde av de beregnede avkastningskravene til nærmeste halve prosent.",
      text: "Konkurransetilsynet har valgt å runde av de beregnede avkastningskravene til nærmeste halve prosent.",
      evidence: "I lys av denne usikkerheten har tilsynet valgt å runde av de beregnede avkastningskravene til nærmeste halve prosent.",
      error: /authority_actor_not_source_visible/u,
    },
    {
      source: "Utfordring med sirkulære næringsliv, stor steg for Malmø kommune – med Ressurs-strøm-kartleggingen.",
      text: "Ressurs-strøm-kartleggingen i Malmø kommune var knyttet til et stort steg.",
      evidence: "Utfordring med sirkulære næringsliv, stor steg for Malmø kommune – med Ressurs-strøm-kartleggingen.",
      error: /non_declarative_evidence/u,
    },
    {
      source: "Budsjett per transition group: 250 000 kr.",
      text: "Budsjett per transition group: 250 000 kr.",
      evidence: "Budsjett per transition group: 250 000 kr.",
      error: /non_declarative_evidence/u,
    },
    {
      source: "Budget allocation: 500,000 NOK.",
      text: "Budget allocation: 500,000 NOK.",
      evidence: "Budget allocation: 500,000 NOK.",
      error: /non_declarative_evidence/u,
    },
    ...[
      "Totalt budsjett: 500 000 kr.",
      "Totalt budsjett – 500 000 kr.",
      "Total budget — 500,000 NOK.",
      "Totalbudsjett: 500 000 kr.",
      "BUDSJETT PER GRUPPE - 250 000 kr.",
    ].map((value) => ({
      source: value,
      text: value,
      evidence: value,
      error: /non_declarative_evidence/u,
    })),
  ] as const;

  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("rejects Pilot22 nominal budget fragments and unscoped practical-success claims", () => {
  const cases = [
    {
      source: "250 000 kr per transition group (Cities + Food) - Totalt 500 000 kr fra Nordic Innovation Hotspot",
      text: "250 000 kr per transition group (Cities + Food) og totalt 500 000 kr fra Nordic Innovation Hotspot.",
      evidence: "250 000 kr per transition group (Cities + Food) - Totalt 500 000 kr fra Nordic Innovation Hotspot",
      error: /non_declarative_evidence/u,
    },
    {
      source: "Kort sagt:\nMetoden er dokumentert og mulig a bruke over tid, men tilgang til god data og riktig organisering av datainnsamlingen er helt avgjorende for a lykkes i praksis.",
      text: "Tilgang til god data og riktig organisering av datainnsamlingen er helt avgjorende for a lykkes i praksis.",
      evidence: "Kort sagt:\nMetoden er dokumentert og mulig a bruke over tid, men tilgang til god data og riktig organisering av datainnsamlingen er helt avgjorende for a lykkes i praksis.",
      error: /practical_success_scope_missing/u,
    },
    {
      source: "The method for food-waste mapping is documented, but access to data is critical to succeed in practice.",
      text: "The method for food-waste mapping is documented, but access to data is critical to succeed in practice.",
      evidence: "The method for food-waste mapping is documented, but access to data is critical to succeed in practice.",
      error: /practical_success_scope_missing/u,
    },
    {
      source: "Metoden for kartlegging er dokumentert, men tilgang til data er avgjorende for a lykkes i praksis.",
      text: "Metoden for kartlegging er dokumentert, men tilgang til data er avgjorende for a lykkes i praksis.",
      evidence: "Metoden for kartlegging er dokumentert, men tilgang til data er avgjorende for a lykkes i praksis.",
      error: /practical_success_scope_missing/u,
    },
    {
      source: "The method for food-waste mapping is documented, and access to data is critical to succeed in practice.",
      text: "The method for food-waste mapping is documented, and access to data is critical to succeed in practice.",
      evidence: "The method for food-waste mapping is documented, and access to data is critical to succeed in practice.",
      error: /practical_success_scope_missing/u,
    },
    {
      source: "Metoden for kartlegging er dokumentert, og tilgang til data er avgjorende for a lykkes i praksis.",
      text: "Metoden for kartlegging er dokumentert, og tilgang til data er avgjorende for a lykkes i praksis.",
      evidence: "Metoden for kartlegging er dokumentert, og tilgang til data er avgjorende for a lykkes i praksis.",
      error: /practical_success_scope_missing/u,
    },
    ...[
      "For generic project, access to data is critical to succeed in practice.",
      "For the project, access to data is critical to succeed in practice.",
      "For a project, access to data is critical to succeed in practice.",
      "For Cities + Food, the scope is broad, but access to data is critical to succeed in practice.",
      "For Cities + Food, funding is available, and access to data is critical to succeed in practice.",
    ].map((value) => ({
      source: value,
      text: value,
      evidence: value,
      error: /practical_success_scope_missing/u,
    })),
  ] as const;

  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }
});

test("accepts Pilot22 budget and practical-success claims with local declarative scope", () => {
  const cases = [
    "Budsjettet var 250 000 kr per transition group (Cities + Food), totalt 500 000 kr fra Nordic Innovation Hotspot.",
    "For Malmo kommunes regionale ressurskartlegging er tilgang til gode data og riktig organisering av datainnsamlingen avgjorende for a lykkes i praksis.",
    "Metoden for kartlegging av matsvinn er helt avgjorende for a lykkes i praksis.",
    "The method for food-waste mapping is critical to succeed in practice.",
    "Tilgang til data er avgjorende for a lykkes i praksis med RNOA-beregningen.",
    "Access to data is critical to succeed in practice with the RNOA calculation.",
    "For Cities + Food, access to data is critical to succeed in practice.",
    "For RE:Source, access to data is critical to succeed in practice.",
  ];
  for (const text of cases) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), text);
  }
});

test("rejects Pilot19 gate bypasses found by adversarial review", () => {
  const rejected = [
    {
      source: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      text: "Nordic Innovation Hotspot awards 500 000 kr.",
      evidence: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      error: /award_action_not_source_visible/u,
    },
    {
      source: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      text: "Nordic Innovation Hotspot grants 500 000 kr.",
      evidence: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      error: /award_action_not_source_visible/u,
    },
    {
      source: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      text: "Nordic Innovation Hotspot is allocating 500 000 kr.",
      evidence: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      error: /award_action_not_source_visible/u,
    },
    {
      source: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      text: "Nordic Innovation Hotspot bevilga 500 000 kr.",
      evidence: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      error: /award_action_not_source_visible/u,
    },
    {
      source: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      text: "Nordic Innovation Hotspot allokerer 500 000 kr.",
      evidence: "Totalt 500 000 kr fra Nordic Innovation Hotspot.",
      error: /award_action_not_source_visible/u,
    },
    {
      source: "County X granted 500 000 kr; funding from Nordic Innovation Hotspot.",
      text: "Nordic Innovation Hotspot awarded 500 000 kr.",
      evidence: "County X granted 500 000 kr; funding from Nordic Innovation Hotspot.",
      error: /award_action_not_source_visible/u,
    },
    {
      source: "The Competition and Markets Authority published the report. The report states an operating margin of 4.1% in 2024.",
      text: "The Norwegian Competition Authority calculated an operating margin of 4.1% in 2024.",
      evidence: "The Competition and Markets Authority published the report. The report states an operating margin of 4.1% in 2024.",
      error: /authority_actor_not_source_visible/u,
    },
    {
      source: "## Utfordring ved sirkulære næringsliv, stort steg for Malmö kommune – med ressurskartleggingen.",
      text: "Ressurskartleggingen var et stort steg for Malmö kommune.",
      evidence: "## Utfordring ved sirkulære næringsliv, stort steg for Malmö kommune – med ressurskartleggingen.",
      error: /non_declarative_evidence/u,
    },
    {
      source: "Tema: Challenge: circular business, a major step for Malmö – with resource mapping.",
      text: "Resource mapping was a major step for Malmö.",
      evidence: "Tema: Challenge: circular business, a major step for Malmö – with resource mapping.",
      error: /non_declarative_evidence/u,
    },
    {
      source: "Next step: resource mapping in Malmö.",
      text: "Resource mapping was the next step in Malmö.",
      evidence: "Next step: resource mapping in Malmö.",
      error: /non_declarative_evidence/u,
    },
    {
      source: "Steg for Malmö – ressurskartlegging.",
      text: "Ressurskartleggingen var et steg for Malmö.",
      evidence: "Steg for Malmö – ressurskartlegging.",
      error: /non_declarative_evidence/u,
    },
    {
      source: "stor steg for Malmø kommune – med Ressurs-strøm-kartleggingen.",
      text: "Ressurs-strøm-kartleggingen i Malmø kommune var knyttet til et stort steg.",
      evidence: "stor steg for Malmø kommune – med Ressurs-strøm-kartleggingen.",
      error: /non_declarative_evidence/u,
    },
    ...[
      "Prosjektstatus: stor steg for Malmö kommune – med ressurskartleggingen.",
      "Punkt 1 — stor steg for Malmö kommune – med ressurskartleggingen.",
      "Et stort steg for Malmö kommune – med ressurskartleggingen.",
      "En stor utfordring for Malmö kommune – med ressurskartleggingen.",
      "Store utfordringer for Malmö kommune – med ressurskartleggingen.",
      "A significant step for Malmö — with resource mapping.",
      "Challenge — a major step for Malmö — with resource mapping.",
    ].map((evidence) => ({
      source: evidence,
      text: "Ressurskartleggingen var et stort steg for Malmö kommune.",
      evidence,
      error: /non_declarative_evidence/u,
    })),
    {
      source: "Utfordring med ER-data. Metoden er dokumentert.",
      text: "ER-data var en dokumentert utfordring.",
      evidence: "Utfordring med ER-data. Metoden er dokumentert.",
      error: /non_declarative_evidence/u,
    },
  ] as const;

  for (const row of rejected) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error, row.text);
  }

  for (const row of [
    {
      source: "The model allocates observations to categories.",
      text: "The model allocates observations to categories.",
    },
    {
      source: "Challenges with rising costs were identified.",
      text: "Challenges with rising costs were identified.",
    },
    {
      source: "Next step: resource mapping is scheduled for Malmö.",
      text: "Next step: resource mapping is scheduled for Malmö.",
    },
    ...[
      "Utfordringer med stigende kostnader oppsto i 2024.",
      "Stort steg for Malmö kommune førte til nye tiltak.",
      "Neste steg for prosjektet inkluderer ressurskartlegging.",
      "Et stort steg for Malmö kommune innebar ressurskartlegging.",
      "Challenges with rising costs emerged in 2024.",
      "A major step for Malmö involved resource mapping.",
      "A big step for Malmö enabled new measures.",
    ].map((text) => ({ source: text, text })),
  ] as const) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, row.text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.text);
  }
});

test("rejects Pilot08 evidence that ends before the asserted object or exclusion", () => {
  const cases = [
    {
      source: "Konkurransetilsynet understreker at det ikke har analysert kausale sammenhenger.",
      text: "Konkurransetilsynet states that it did not analyze causal relationships.",
      evidence: "Konkurransetilsynet understreker at det ikke har analysert",
      error: /evidence_incomplete/u,
    },
    {
      source: "Tallene gjelder egeneide butikker i 2017 til 2022. Franchiseeide butikker er ikke inkludert i tallene.",
      text: "The figures cover company-owned stores from 2017 to 2022; franchise-owned stores are not included.",
      evidence: "Tallene gjelder egeneide butikker i 2017 til 2022.",
      error: /material_exclusion_missing/u,
    },
    {
      source: "The 2022 figures cover company-owned stores. The 2022 figures exclude leased stores.",
      text: "The 2022 figures exclude leased stores.",
      evidence: "The 2022 figures cover company-owned stores.",
      error: /material_exclusion_missing/u,
    },
  ];
  for (const row of cases) {
    const job = verifiedJob([row.source]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), row.error);
  }
});

test("leaves cross-language material-exclusion equivalence to semantic validation", () => {
  const evidence = "Leide butikker er ikke inkludert i tallene.";
  const job = verifiedJob([evidence]);
  const response = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(job, 0, "The figures exclude leased stores."),
      evidence,
    }],
  });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job,
    response,
  }));
});

test("rejects Pilot08 missing identity and typed tabular context while allowing local anchors", () => {
  const ownerSource = "NorgesGruppen ASA. Storste eier: Joh. Johannson Handel AS - 74,4% per 31.12.2024.";
  const ownerJob = verifiedJob([ownerSource]);
  const ownerResponse = segmentResponse(ownerJob, {
    unitCoverage: [{ contentUnitId: ownerJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(ownerJob, 0, "Joh. Johannson Handel AS is NorgesGruppen ASA's largest owner with 74,4% as of 31.12.2024."),
      evidence: "Storste eier: Joh. Johannson Handel AS - 74,4% per 31.12.2024.",
    }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: ownerJob,
    response: ownerResponse,
  }), /ownership_scope_missing/u);

  for (const text of [
    "Joh. Johannson Handel AS is listed as NorgesGruppen ASA's largest owner with 74,4% as of 31.12.2024.",
    "Joh. Johannson Handel AS is the NorgesGruppen ASA's largest owner with 74,4% as of 31.12.2024.",
  ]) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }

  const norwegianOwnerJob = verifiedJob(["NorgesGruppen ASA. Storste eier: Joh. Johannson Handel AS - 74,4% per 31.12.2024."]);
  const norwegianOwnerResponse = segmentResponse(norwegianOwnerJob, {
    unitCoverage: [{ contentUnitId: norwegianOwnerJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(norwegianOwnerJob, 0, "Joh. Johannson Handel AS er NorgesGruppens største eier med 74,4% per 31.12.2024."),
      evidence: "Storste eier: Joh. Johannson Handel AS - 74,4% per 31.12.2024.",
    }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: norwegianOwnerJob,
    response: norwegianOwnerResponse,
  }), /ownership_scope_missing/u);

  const surveySource = "IPIFF FOOD MARKET survey. This survey was conducted online in 2023, gathering responses from 19 EU insect farming companies.";
  const surveyJob = verifiedJob([surveySource]);
  const surveyResponse = segmentResponse(surveyJob, {
    unitCoverage: [{ contentUnitId: surveyJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(surveyJob, 0, "The IPIFF survey was conducted online in 2023 and gathered responses from 19 EU insect farming companies."),
      evidence: "This survey was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
    }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: surveyJob,
    response: surveyResponse,
  }), /evidence_context_dependent/u);

  const csvSource = "id,priority,status,country,coding_target\nsource-1,P1,candidate_fetch,no,entry";
  const csvJob = verifiedJob([csvSource]);
  Object.assign(csvJob.units[0]!.descriptor, {
    unitType: "sheet_range",
    sourceKind: "library_file",
    sourceKey: "library_file:research/source.csv",
    locator: "repository:research/source.csv#rows=2-2&chars=0-51",
  });
  csvJob.job.sourceKind = "library_file";
  csvJob.job.sourceKey = "library_file:research/source.csv";
  const csvResponse = segmentResponse(csvJob, {
    unitCoverage: [{ contentUnitId: csvJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(csvJob, 0, "The dataset marks source-1 as a P1 candidate_fetch source for entry."),
      evidence: "source-1,P1,candidate_fetch,no,entry",
      locator: csvJob.units[0]!.descriptor.locator,
    }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: csvJob,
    response: csvResponse,
  }), /tabular_context_missing/u);

  const implicitFieldsJob = verifiedJob(["id,priority,status\nsource-1,P1,candidate_fetch"]);
  Object.assign(implicitFieldsJob.units[0]!.descriptor, { unitType: "sheet_range" });
  const implicitFieldsResponse = segmentResponse(implicitFieldsJob, {
    unitCoverage: [{ contentUnitId: implicitFieldsJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(implicitFieldsJob, 0, "P1 candidate_fetch applies to source-1."),
      evidence: "source-1,P1,candidate_fetch",
    }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: implicitFieldsJob,
    response: implicitFieldsResponse,
  }), /tabular_context_missing/u);

  const twoFieldJob = verifiedJob(["id,priority\nsource-1,P1"]);
  Object.assign(twoFieldJob.units[0]!.descriptor, { unitType: "sheet_range" });
  const twoFieldResponse = segmentResponse(twoFieldJob, {
    unitCoverage: [{ contentUnitId: twoFieldJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(twoFieldJob, 0, "The row marks source-1 as P1."),
      evidence: "source-1,P1",
    }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: twoFieldJob,
    response: twoFieldResponse,
  }), /tabular_context_missing/u);

  for (const row of [
    {
      source: ownerSource,
      text: "Joh. Johannson Handel AS is NorgesGruppen ASA's largest owner with 74,4% as of 31.12.2024.",
      evidence: "NorgesGruppen ASA. Storste eier: Joh. Johannson Handel AS - 74,4% per 31.12.2024.",
    },
    {
      source: surveySource,
      text: "The IPIFF survey was conducted online in 2023 and gathered responses from 19 EU insect farming companies.",
      evidence: "IPIFF FOOD MARKET survey. This survey was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
    },
    {
      source: "This survey by IPIFF was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
      text: "The IPIFF survey was conducted online in 2023 and gathered responses from 19 EU insect farming companies.",
      evidence: "This survey by IPIFF was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
    },
    {
      source: "This survey, the IPIFF FOOD MARKET survey, was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
      text: "The IPIFF FOOD MARKET survey was conducted online in 2023 and gathered responses from 19 EU insect farming companies.",
      evidence: "This survey, the IPIFF FOOD MARKET survey, was conducted online in 2023, gathering responses from 19 EU insect farming companies.",
    },
    {
      source: csvSource,
      text: "The dataset marks source-1 as a P1 candidate_fetch source for entry.",
      evidence: csvSource,
      tabular: true,
    },
    {
      source: "id: source-1; priority: P1; status: candidate_fetch; coding_target: entry",
      text: "The dataset marks source-1 as a P1 candidate_fetch source for entry.",
      evidence: "id: source-1; priority: P1; status: candidate_fetch; coding_target: entry",
      tabular: true,
    },
    {
      source: "A complete qualitative note stored in one spreadsheet cell.",
      text: "A complete qualitative note is stored in one spreadsheet cell.",
      evidence: "A complete qualitative note stored in one spreadsheet cell.",
      tabular: true,
    },
  ]) {
    const job = verifiedJob([row.source]);
    if (row.tabular) Object.assign(job.units[0]!.descriptor, { unitType: "sheet_range" });
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, row.text), evidence: row.evidence }],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }
});

test("rejects unanchored relative trend and status expressions while allowing anchored boundaries", () => {
  for (const contextualText of [
    "Detaljistene kontrollerer data i økende grad.",
    "Egne merkevarer har endret seg de siste to tiårene.",
    "Smart Fish Farm er foreløpig på pause.",
    "The operation is currently paused.",
  ]) {
    const job = verifiedJob([contextualText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, contextualText)],
    });
    assert.throws(
      () => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response,
      }),
      /context_dependent_claim/u,
    );
  }

  for (const anchoredText of [
    "Detaljistene kontrollerer data i økende grad fra 2022 til 2024.",
    "Egne merkevarer har endret seg de siste to tiårene fram til 2025.",
    "Smart Fish Farm er foreløpig på pause per 31.12.2024.",
    "The operation is currently paused as of 2024.",
  ]) {
    const job = verifiedJob([anchoredText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, anchoredText)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }
});

test("rejects only audited unresolved generic and anaphoric subject phrases", () => {
  for (const contextualText of [
    "Oppgaven dokumenterer rapporterte tiltak.",
    "Studien finner flere tiltak.",
    "The study finds several measures.",
    "The assignment documents reported actions.",
    "En annen faktor økte kostnadene.",
    "Another factor increased costs.",
    "Driftsinntekter her økte.",
    "Revenue here increased.",
  ]) {
    const job = verifiedJob([contextualText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, contextualText)],
    });
    assert.throws(
      () => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response,
      }),
      /context_dependent_claim/u,
    );
  }

  const anchoredCases = [
    {
      text: "Rislakki-oppgaven dokumenterer rapporterte tiltak.",
      evidence: "Rislakki-oppgaven dokumenterer rapporterte tiltak.",
    },
    {
      text: "Studien Rislakki finner flere tiltak.",
      evidence: "Studien Rislakki finner flere tiltak.",
    },
    {
      text: "The study Rislakki finds several measures.",
      evidence: "The study Rislakki finds several measures.",
    },
    {
      text: "The assignment Rislakki documents reported actions.",
      evidence: "The assignment Rislakki documents reported actions.",
    },
    {
      text: "Energy costs were one factor. Another factor was exchange rates.",
      evidence: "Energy costs were one factor. Another factor was exchange rates.",
    },
    {
      text: "Energy costs were one factor. En annen faktor var valutakursendringer.",
      evidence: "Energy costs were one factor. En annen faktor var valutakursendringer.",
    },
    {
      text: "Detaljleddets driftsinntekter her økte fra 2022 til 2024.",
      evidence: "Detaljleddets driftsinntekter her økte fra 2022 til 2024.",
    },
    {
      text: "Revenue here means revenue of the named retail segment.",
      evidence: "Revenue here means revenue of the named retail segment.",
    },
  ];
  for (const { text, evidence } of anchoredCases) {
    const job = verifiedJob([evidence]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, text), evidence }],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }
});

test("rejects dropped explicit scope qualifiers and accepts preserved scope", () => {
  for (const [text, evidence] of [
    ["Metoden for regional ressurskartlegging bruker ikke GIS-data.", "Metoden for regional ressurskartlegging bruker ikke GIS-data i denne sammenhengen."],
    ["The regional resource-mapping method does not use GIS data.", "The regional resource-mapping method does not use GIS data in this context."],
  ]) {
    const job = verifiedJob([evidence]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, text), evidence }],
    });
    assert.throws(
      () => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response,
      }),
      /scope_qualifier_mismatch/u,
    );
  }

  for (const scopedText of [
    "Metoden for regional ressurskartlegging bruker ikke GIS-data i denne sammenhengen.",
    "The regional resource-mapping method does not use GIS data in this context.",
  ]) {
    const job = verifiedJob([scopedText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, scopedText)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }
});

test("rejects the eight pilot06 unresolved work, method, mapping, and result references", () => {
  for (const contextualText of [
    "Arbeidet skjer i flere trinn: først avgrenses område, år og formål.",
    "Metoden måler vekt av innkjøpte materialer.",
    "Kartleggingen tar utgangspunkt i fem ressurskategorier.",
    "Kartleggingene fungerer som en bro mellom strategi og praksis.",
    "Malmö kommune opplever kartleggingene som svært nyttige.",
    "Et lite antall store selskaper dekker 70 prosent av ressursbruken, noe som gjør metoden praktisk gjennomførbar.",
    "Kvaliteten på resultatet avhenger sterkt av tilgang til gode data.",
    "Metoden bruker ikke GIS-data i denne sammenhengen.",
  ]) {
    const job = verifiedJob([contextualText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, contextualText)],
    });
    assert.throws(
      () => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response,
      }),
      /context_dependent_claim/u,
    );
  }
});

test("keeps explicitly scoped work, method, mapping, and result references eligible", () => {
  for (const scopedText of [
    "Arbeidet med regional ressurskartlegging skjer i flere trinn.",
    "Metoden for regional ressurskartlegging måler vekt av innkjøpte materialer.",
    "Kartleggingen av regionale materialstrømmer tar utgangspunkt i fem ressurskategorier.",
    "De regionale ressurskartleggingene fungerer som en bro mellom strategi og praksis.",
    "Malmö kommune opplever de regionale ressurskartleggingene som svært nyttige.",
    "Et lite antall store selskaper dekker 70 prosent av ressursbruken, noe som gjør ressurskartleggingsmetoden praktisk gjennomførbar.",
    "Kvaliteten på resultatet av den regionale ressurskartleggingen avhenger sterkt av tilgang til gode data.",
    "Metoden for regional ressurskartlegging bruker ikke GIS-data i svensk kommunekartlegging.",
  ]) {
    const job = verifiedJob([scopedText]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, scopedText)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }
});

test("rejects a scoped claim when its evidence leaves the result referent unresolved", () => {
  const evidence = "kvaliteten på resultatet avhenger sterkt av tilgang til gode data";
  const job = verifiedJob([evidence]);
  const response = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(job, 0, "Kvaliteten på ressurskartleggingsresultatet avhenger sterkt av tilgang til gode data."),
      evidence,
    }],
  });
  assert.throws(
    () => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }),
    /evidence_context_dependent/u,
  );
});

test("keeps a scoped result claim eligible when the evidence names the result scope", () => {
  for (const evidence of [
    "Kvaliteten på resultatet av den regionale ressurskartleggingen avhenger sterkt av tilgang til gode data.",
    "Resultatet fra ressurskartleggingen avhenger sterkt av tilgang til gode data.",
    "Resultatet for den regionale ressurskartleggingen avhenger sterkt av tilgang til gode data.",
    "The result of the regional mapping depends strongly on access to good data.",
    "The result from the regional mapping depends strongly on access to good data.",
    "The result for the regional mapping depends strongly on access to good data.",
    "Resultatets kvalitet avhenger sterkt av tilgang til gode data.",
    "The resulting estimate depends strongly on access to good data.",
  ]) {
    const job = verifiedJob([evidence]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, evidence), evidence }],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }
});

test("rejects unresolved plural result references without matching word-prefix false positives", () => {
  for (const [text, evidence] of [
    ["Resultatene viser økt lønnsomhet.", "Resultatene viser økt lønnsomhet."],
    ["The results show increased profitability.", "The results show increased profitability."],
    ["Ressurskartleggingen viser økt lønnsomhet.", "Resultatene viser økt lønnsomhet."],
    ["The resource mapping shows increased profitability.", "The results show increased profitability."],
  ]) {
    const job = verifiedJob([evidence]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, text), evidence }],
    });
    assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }), /context_dependent_claim|evidence_context_dependent/u);
  }

  for (const text of [
    "Resultatene fra ressurskartleggingen viser økt materialgjenvinning.",
    "Resultatene i rapporten viser økt materialgjenvinning.",
    "Resultatet i rapporten viser økt materialgjenvinning.",
    "The results of the resource mapping show increased material recycling.",
    "The results in the report show increased material recycling.",
    "The result in the report shows increased material recycling.",
    "Resultateneity is not a Norwegian reference word.",
  ]) {
    const job = verifiedJob([text]);
    const response = segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [claim(job, 0, text)],
    });
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }));
  }

  const resolvedEvidence = "Denne delen handler om lokale ressurskartlegginger og fem ressurskategorier. Resultatene viser store lokale forskjeller.";
  const resolvedJob = verifiedJob([resolvedEvidence]);
  const resolvedResponse = segmentResponse(resolvedJob, {
    unitCoverage: [{ contentUnitId: resolvedJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(resolvedJob, 0, "Lokale ressurskartlegginger viser store lokale forskjeller."),
      evidence: resolvedEvidence,
    }],
  });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: resolvedJob,
    response: resolvedResponse,
  }));
});

test("rejects authority language that is absent from the evidence excerpt", () => {
  const job = verifiedJob(["The files are available as PDFs."]);
  const unsupported = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{
      ...claim(job, 0, "The files are publication-ready."),
      evidence: "The files are available as PDFs.",
    }],
  });
  assert.throws(
    () => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response: unsupported,
    }),
    /authority_overreach/u,
  );

  const supportedText = "The publisher states that the files are publication-ready.";
  const supportedJob = verifiedJob([supportedText]);
  const supported = segmentResponse(supportedJob, {
    unitCoverage: [{ contentUnitId: supportedJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [claim(supportedJob, 0, supportedText)],
  });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH,
    attempt: 1,
    inputHash: INPUT_HASH,
    expectedModel: EXPECTED_MODEL,
    job: supportedJob,
    response: supported,
  }));
});

test("response schema rejects worker-supplied final claim IDs", () => {
  const job = verifiedJob(["evidence"]);
  const response = segmentResponse(job, {
    claims: [{ ...claim(job, 0, "evidence"), claimId: "claim:forged" }],
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
  });
  assert.throws(() => LibraryAnalysisAgentSegmentResponseSchema.parse(response));
});

test("binds queue, attempt, and sealed attempt input hash into acceptance", () => {
  const job = verifiedJob(["evidence"]);
  const response = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [claim(job, 0, "evidence")],
  });
  for (const drift of [
    { queueHash: "b".repeat(64) },
    { attempt: 2 },
    { inputHash: "c".repeat(64) },
  ]) {
    assert.throws(
      () => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response: rehash({ ...response, ...drift }),
      }),
      /job_binding_mismatch/u,
    );
  }
});

test("keeps lexical numeric markers attached to their own number", () => {
  const job = verifiedJob(["Revenue 12% and rate 5%."]);
  const response = segmentResponse(job, {
    unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{ ...claim(job, 0, "Revenue 12 and rate 5%."), evidence: "Revenue 12% and rate 5%." }],
  });
  assert.throws(
    () => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job,
      response,
    }),
    /numeric_token_mismatch/u,
  );
});

test("rejects currency substitution while preserving prefix and suffix currency grammar", () => {
  const symbolJob = verifiedJob(["Revenue cost €4.50."]);
  const symbolResponse = segmentResponse(symbolJob, {
    unitCoverage: [{ contentUnitId: symbolJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{ ...claim(symbolJob, 0, "Revenue cost $4.50."), evidence: "Revenue cost €4.50." }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL,
    job: symbolJob, response: symbolResponse,
  }), /numeric_token_mismatch/u);

  const grammarJob = verifiedJob(["Budget NOK 4.50 and 5.00 USD."]);
  const grammarResponse = segmentResponse(grammarJob, {
    unitCoverage: [{ contentUnitId: grammarJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [claim(grammarJob, 0, "Budget NOK 4.50 and 5.00 USD.")],
  });
  assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL,
    job: grammarJob, response: grammarResponse,
  }));

  const nearbyJob = verifiedJob(["Budget USD 4.50 and tax $2.00."]);
  const nearbyResponse = segmentResponse(nearbyJob, {
    unitCoverage: [{ contentUnitId: nearbyJob.units[0]!.descriptor.id, status: "claims_extracted" }],
    claims: [{ ...claim(nearbyJob, 0, "Budget USD 4.50 and tax €2.00."), evidence: "Budget USD 4.50 and tax $2.00." }],
  });
  assert.throws(() => validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH, attempt: 1, inputHash: INPUT_HASH, expectedModel: EXPECTED_MODEL,
    job: nearbyJob, response: nearbyResponse,
  }), /numeric_token_mismatch/u);
});

function sourceWithTwoSegments() {
  const jobs = [verifiedJob(["Alpha grew by 12 percent."]), verifiedJob(["Beta fell by 3 percent."])]
    .map((job, segmentOrdinal) => ({
      ...job,
      units: job.units.map(({ descriptor, text }) => ({
        descriptor: { ...descriptor, id: `${descriptor.id}:${segmentOrdinal}` },
        text,
      })),
      job: {
        ...job.job,
        jobId: `job:library-analysis:fixture:${segmentOrdinal}`,
        segmentOrdinal,
        unitIds: job.units.map(({ descriptor }) => `${descriptor.id}:${segmentOrdinal}`),
      },
    }));
  const unitIds = jobs.flatMap(({ units }) => units.map(({ descriptor }) => descriptor.id));
  const sourceCore = {
    sourceKind: "document",
    sourceKey: "document:fixture",
    sourceVersionHash: "b".repeat(64),
    unitIds,
    unitCount: unitIds.length,
    codePoints: jobs.reduce((sum, job) => sum + job.job.codePoints, 0),
    bytes: jobs.reduce((sum, job) => sum + job.job.bytes, 0),
  };
  const source = {
    ...sourceCore,
    sourceEnvelopeHash: candidateAnalysisSha256("library-analysis-agent-source", sourceCore),
  };
  const segments = jobs.map((job) => {
    const descriptor = job.units[0]!.descriptor;
    const response = {
      schema: "library-analysis-agent-segment-response/v1" as const,
      queueHash: HASH,
      jobId: job.job.jobId,
      jobHash: job.job.inputEnvelopeHash,
      segmentOrdinal: job.job.segmentOrdinal,
      attempt: 1,
      inputHash: INPUT_HASH,
      model: EXPECTED_MODEL,
      unitCoverage: [{ contentUnitId: descriptor.id, status: "claims_extracted" as const }],
      claims: [{
        localOrdinal: 0,
        assertionType: "claim" as const,
        contentUnitId: descriptor.id,
        text: job.units[0]!.text,
        evidence: job.units[0]!.text,
        locator: descriptor.locator,
        confidence: 0.8,
        claimId: deterministicLibraryAnalysisAgentClaimId(job.job, { contentUnitId: descriptor.id, localOrdinal: 0 }),
      }],
      responseHash: HASH,
    };
    return LibraryAnalysisAcceptedSegmentSchema.parse({
      ...response,
      responseHash: libraryAnalysisAgentSegmentResponseHash(response),
    });
  });
  return { source, segments, jobs };
}

test("merge covers each source unit once and is deterministic across segment order", () => {
  const { source, segments, jobs } = sourceWithTwoSegments();
  const result = mergeLibraryAnalysisSourceSegments({ queueHash: HASH, source, segments: [...segments].reverse(), expectedJobs: jobs.map(({ job }) => job) });
  assert.deepEqual(result.unitCoverage.map((row) => row.contentUnitId), source.unitIds);
  assert.equal(new Set(result.claims.map((claim) => claim.claimId)).size, result.claims.length);
  assert.equal(result.analysisState, "complete");
  assert.deepEqual(
    mergeLibraryAnalysisSourceSegments({ queueHash: HASH, source, segments, expectedJobs: jobs.map(({ job }) => job) }),
    result,
  );
});

test("merge permits zero claims only with explicit no-material-claim coverage", () => {
  const { source, segments, jobs } = sourceWithTwoSegments();
  const noClaims = segments.map((segment) => ({
    ...segment,
    claims: [],
    unitCoverage: segment.unitCoverage.map((coverage) => ({
      ...coverage,
      status: "no_material_claim" as const,
    })),
  }));
  assert.equal(mergeLibraryAnalysisSourceSegments({ queueHash: HASH, source, segments: noClaims, expectedJobs: jobs.map(({ job }) => job) }).claims.length, 0);
  assert.throws(
    () => mergeLibraryAnalysisSourceSegments({ queueHash: HASH, source, segments: segments.slice(0, 1), expectedJobs: jobs.map(({ job }) => job) }),
    /source_merge_(?:coverage|job_set)_mismatch/u,
  );
});

test("merge preserves terminal non-complete segment states in receipts", () => {
  const { source, segments, jobs } = sourceWithTwoSegments();
  const result = mergeLibraryAnalysisSourceSegments({
    queueHash: HASH,
    source,
    segments: [
      { ...segments[0]!, terminalState: "failed", terminalReason: "worker_timeout" },
      segments[1]!,
    ],
    expectedJobs: jobs.map(({ job }) => job),
  });
  assert.equal(result.analysisState, "failed");
  assert.equal(result.segments[0]!.terminalState, "failed");
  assert.equal(result.segments[0]!.attempts[0]!.model.provider, EXPECTED_MODEL.provider);
});

test("merge requires the authoritative one-to-one job set and exact per-job unit ranges", () => {
  const { source, segments, jobs } = sourceWithTwoSegments();
  const expectedJobs = jobs.map(({ job }) => job);
  assert.throws(
    () => mergeLibraryAnalysisSourceSegments({ queueHash: HASH, source, segments: segments.slice(0, 1), expectedJobs }),
    /source_merge_job_set_mismatch/u,
  );
  assert.throws(
    () => mergeLibraryAnalysisSourceSegments({
      queueHash: HASH,
      source,
      segments,
      expectedJobs: [{ ...expectedJobs[0]!, jobId: "job:foreign" }, expectedJobs[1]!],
    }),
    /source_merge_job_set_mismatch/u,
  );
  const repartitioned = segments.map((segment, index) => ({
    ...segment,
    unitCoverage: index === 0 ? segments[1]!.unitCoverage : segments[0]!.unitCoverage,
  }));
  assert.throws(
    () => mergeLibraryAnalysisSourceSegments({ queueHash: HASH, source, segments: repartitioned, expectedJobs }),
    /source_merge_job_unit_coverage_mismatch/u,
  );
});

test("merge preserves retry receipts, rejects duplicate attempts, and hashes receipt changes", () => {
  const { source, segments, jobs } = sourceWithTwoSegments();
  const first = segments[0]!;
  const retry = {
    attempt: 2,
    inputHash: "e".repeat(64),
    responseHash: "f".repeat(64),
    status: "accepted" as const,
    model: EXPECTED_MODEL,
  };
  const withRetry = mergeLibraryAnalysisSourceSegments({
    queueHash: HASH,
    source,
    expectedJobs: jobs.map(({ job }) => job),
    segments: [{ ...first, attempts: [{
      attempt: 1,
      inputHash: first.inputHash,
      responseHash: first.responseHash,
      status: "partial" as const,
      model: EXPECTED_MODEL,
    }, retry] }, segments[1]!],
  });
  assert.deepEqual(withRetry.segments[0]!.attempts.map((attempt) => attempt.attempt), [1, 2]);
  const withReason = mergeLibraryAnalysisSourceSegments({
    queueHash: HASH,
    source,
    expectedJobs: jobs.map(({ job }) => job),
    segments: [{ ...segments[0]!, terminalState: "failed", terminalReason: "different_reason" }, segments[1]!],
  });
  assert.notEqual(withReason.sourceResultHash, withRetry.sourceResultHash);
  assert.notEqual(withRetry.sourceResultHash, mergeLibraryAnalysisSourceSegments({
    queueHash: HASH,
    source,
    expectedJobs: jobs.map(({ job }) => job),
    segments,
  }).sourceResultHash);
  assert.throws(
    () => mergeLibraryAnalysisSourceSegments({
      queueHash: HASH,
      source,
      expectedJobs: jobs.map(({ job }) => job),
      segments: [{ ...first, attempts: [retry, retry] }, segments[1]!],
    }),
    /source_merge_attempt_duplicate/u,
  );
});

// Pilot05 survey evidence-locality acceptance predicates (TDD red phase).
{
  const SURVEY_CONTEXT =
    "This survey was conducted online in 2023, gathering responses from 19 EU insect farming companies.";

  function surveyJob(evidence: string): LibraryAnalysisVerifiedJob {
    return verifiedJob([`${SURVEY_CONTEXT} ${evidence}`]);
  }

  function responseForClaim(job: LibraryAnalysisVerifiedJob, text: string, evidence: string) {
    return segmentResponse(job, {
      unitCoverage: [{ contentUnitId: job.units[0]!.descriptor.id, status: "claims_extracted" }],
      claims: [{ ...claim(job, 0, text), evidence }],
    });
  }

  test("rejects survey respondent ranking and geography claims without same-excerpt scope", () => {
    for (const text of [
      "When asked to rank the most important factors, respondents identified funding and training.",
      "Most respondent companies are located in Europe, with exceptions in Asia.",
    ]) {
      const job = surveyJob(text);
      const response = responseForClaim(job, text, text);
      assert.throws(
        () => validateLibraryAnalysisAgentSegmentResponse({
          queueHash: HASH,
          attempt: 1,
          inputHash: INPUT_HASH,
          expectedModel: EXPECTED_MODEL,
          job,
          response,
        }),
        /agent_response_survey_scope_missing/u,
      );
    }
  });

  test("rejects survey production totals, averages, and forecasts without same-excerpt scope", () => {
    for (const text of [
      "The total production of insects for human consumption in 2022 was 328,27 tonnes.",
      "The total production of insects for human consumption in 2023 was 802,65 tonnes.",
      "On average, companies have approximately 9.5 years of industry experience.",
      "The total production of insects for human consumption foreseen for 2025 is 2 755,44 tonnes.",
    ]) {
      const job = surveyJob(text);
      const response = responseForClaim(job, text, text);
      assert.throws(
        () => validateLibraryAnalysisAgentSegmentResponse({
          queueHash: HASH,
          attempt: 1,
          inputHash: INPUT_HASH,
          expectedModel: EXPECTED_MODEL,
          job,
          response,
        }),
        /agent_response_survey_scope_missing/u,
      );
    }
  });

  test("rejects a survey forecast with scope but no source-visible forecast basis", () => {
    const text = "The forecasted production for 2025 was 2 755,44 tonnes among 19 EU insect farming companies.";
    const job = surveyJob(text);
    const response = responseForClaim(job, text, text);
    assert.throws(
      () => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response,
      }),
      /agent_response_forecast_basis_missing/u,
    );
  });

  test("accepts complete survey aggregate and forecast evidence", () => {
    const aggregate = "The total production among 19 EU insect farming companies in 2023 was 802,65 tonnes.";
    const aggregateJob = surveyJob(aggregate);
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job: aggregateJob,
      response: responseForClaim(aggregateJob, aggregate, aggregate),
    }));

    const forecast = "The forecast for 2025, based on responses from 19 EU insect farming companies, is 2 755,44 tonnes.";
    const forecastJob = surveyJob(forecast);
    assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
      queueHash: HASH,
      attempt: 1,
      inputHash: INPUT_HASH,
      expectedModel: EXPECTED_MODEL,
      job: forecastJob,
      response: responseForClaim(forecastJob, forecast, forecast),
    }));
  });

  test("accepts complete non-survey qualitative and aggregate evidence", () => {
    for (const text of [
      "The qualitative report describes methods used by producers.",
      "The national registry recorded total production in 2023 as 802 tonnes.",
    ]) {
      const job = verifiedJob([text]);
      assert.doesNotThrow(() => validateLibraryAnalysisAgentSegmentResponse({
        queueHash: HASH,
        attempt: 1,
        inputHash: INPUT_HASH,
        expectedModel: EXPECTED_MODEL,
        job,
        response: responseForClaim(job, text, text),
      }));
    }
  });
}
