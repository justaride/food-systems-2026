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
      /context_dependent_claim/u,
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
  }), /context_dependent_claim/u);
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
    ["Metoden bruker ikke GIS-data.", "Metoden bruker ikke GIS-data i denne sammenhengen."],
    ["The method does not use GIS data.", "The method does not use GIS data in this context."],
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
    "Metoden bruker ikke GIS-data i denne sammenhengen.",
    "The method does not use GIS data in this context.",
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
