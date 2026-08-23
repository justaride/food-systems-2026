import assert from "node:assert/strict";
import test from "node:test";

import {
  checkEvidenceBinding,
  checkQuantitativeFacts,
  decomposeClaimFacts,
  runDeterministicLibraryGates,
} from "../../src/lib/knowledge/library-analysis-evidence-gates";
import {
  numericMismatchCases,
  pilotPartialQuote,
  sha256,
} from "../fixtures/library-analysis-evidence-gates";

test("a partial quote cannot ground an additional percentage fact", () => {
  const result = runDeterministicLibraryGates(pilotPartialQuote);
  assert.ok(result.findings.some((finding) => finding.errorClass === "F3"));
});

test("claim decomposition keeps every independently checkable fact", () => {
  assert.deepEqual(
    decomposeClaimFacts(
      "NOK 3.1 million and 28 percent in Norway in 2024 per year.",
    ).map(({ kind, normalized }) => ({ kind, normalized })),
    [
      { kind: "currency", normalized: "nok:3.1:million" },
      { kind: "percentage", normalized: "28" },
      { kind: "year", normalized: "2024" },
      { kind: "period", normalized: "year" },
      { kind: "geography", normalized: "norway" },
    ],
  );
});

test("wrong source binding excerpt absence stale hash and envelope drift fail", () => {
  const base = {
    evidence: "Bound evidence bytes.",
    sourceText: "Prefix Bound   evidence bytes. Suffix",
    locator: "document:one:section:1",
    sourcePath: "research/source-one.md",
    boundSourcePath: "research/source-one.md",
    excerptHash: sha256("Bound evidence bytes."),
    contentUnitId: "content:one",
    runInputContentUnitIds: ["content:one"],
  };
  assert.deepEqual(checkEvidenceBinding(base), []);

  const mutations = [
    { ...base, boundSourcePath: "research/source-two.md" },
    { ...base, sourceText: "The excerpt is absent." },
    { ...base, excerptHash: "0".repeat(64) },
    { ...base, runInputContentUnitIds: ["content:other"] },
  ];
  for (const mutation of mutations) {
    const findings = checkEvidenceBinding(mutation);
    assert.ok(findings.some(({ errorClass }) => errorClass === "F1" || errorClass === "F2"));
  }
});

test("a descriptive source path alone cannot establish evidence binding", () => {
  const findings = checkEvidenceBinding({
    evidence: "quoted bytes",
    sourceText: "quoted bytes",
    locator: "document:one:section:1",
    sourcePath: "research/source-one.md",
    contentUnitId: "content:one",
    runInputContentUnitIds: ["content:other"],
  });
  assert.ok(findings.some((finding) => finding.errorClass === "F1"));
});

test("quantitative gates reject percent currency unit sign year period and geography drift", () => {
  for (const mismatch of numericMismatchCases) {
    const findings = checkQuantitativeFacts({
      claim: mismatch.claim,
      evidence: mismatch.evidence,
      contentUnitId: "content:numeric",
    });
    assert.ok(
      findings.some((finding) => finding.errorClass === "F3"),
      mismatch.name,
    );
  }
});

test("identical quantitative facts pass regardless of surrounding prose", () => {
  const findings = checkQuantitativeFacts({
    claim: "The 2024 programme supplied NOK 3.1 million per year in Norway, up 28 percent.",
    evidence: "In Norway, NOK 3.1 million was supplied per year in 2024; the increase was 28 percent.",
    contentUnitId: "content:exact",
  });
  assert.deepEqual(findings, []);
});

test("rejects EU survey geography when the exact evidence excerpt omits EU", () => {
  const claim = "The survey aims to update data on EU insect food production and provide more accurate figures specifically addressing current and future insect food production market trends.";
  const evidence = "this new questionnaire addresses current and future insect food production market trends";
  const findings = checkQuantitativeFacts({
    claim,
    evidence,
    contentUnitId: "content:library-analysis:f6468a45dbb2ce3a7ecff41c9fcd36e3b0c3bb40952e541439809dbb90a2d46b",
    assertionId: "claim:library-agent:9757afcb729e2cb89b19512ca25a15a10faef76b50563a39d0a2135f5fb32997",
  });
  assert.deepEqual(
    findings.filter((finding) => finding.errorClass === "F3").flatMap((finding) => finding.deterministicRuleIds),
    ["rule:quantitative:geography"],
  );

  assert.deepEqual(checkQuantitativeFacts({
    claim,
    evidence: "The IPIFF Survey covers EU insect food production and current and future market trends.",
    contentUnitId: "content:library-analysis:f6468a45dbb2ce3a7ecff41c9fcd36e3b0c3bb40952e541439809dbb90a2d46b",
    assertionId: "claim:library-agent:9757afcb729e2cb89b19512ca25a15a10faef76b50563a39d0a2135f5fb32997",
  }).filter((finding) => finding.errorClass === "F3"), []);
});
