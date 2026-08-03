import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  buildPageExtractionRecord,
  canonicalJson,
  normalizeExtractedPageText,
  sealPageMap,
  sha256,
  verifySealedPageMap,
  verifySealedQualificationReceipt,
  type JsonValue,
} from "../../src/lib/knowledge/pdf-page-extraction-qualification";
import {
  DEFAULT_BATCH_MANIFEST_PATH,
  PDF_QUALIFICATION_GENERATOR_PATH,
  PDF_QUALIFICATION_GENERATION_MANIFEST_PATH,
  PDF_QUALIFICATION_LIBRARY_PATH,
  PDF_QUALIFICATION_BLOCKER_QUEUE_PATH,
  PDF_QUALIFICATION_SUMMARY_PATH,
  checkTrackedQualificationBundle,
  parseBatchManifest,
  parseCliArgs,
  runQualificationBatch,
  type PdfExtractionBatchManifest,
  type PdfExtractionTarget,
  type ToolRunner,
} from "../../scripts/knowledge/qualify-pdf-page-extraction";

const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function privateMode(path: string): string {
  return (lstatSync(path).mode & 0o777).toString(8).padStart(4, "0");
}

function fixtureTarget(
  pdfBytes: Buffer,
  identityBlocked = false,
): PdfExtractionTarget {
  return {
    targetId: "fixture.pdf",
    identityKeys: ["document:fixture"],
    legacyAlias: "fixture.pdf",
    expectedSha256: sha256(pdfBytes),
    expectedSizeBytes: pdfBytes.length,
    expectedPageCount: 2,
    expectedEncrypted: false,
    sourceBinding: {
      title: "Fixture document",
      doi: null,
      officialUrl: "https://example.test/fixture.pdf",
      expectedPdfInfoTitle: {
        state: "observed",
        value: "Fixture document",
      },
      corpusIdentityVerified: false,
      scopeDisposition: identityBlocked
        ? "pending_owner_disposition_likely_out_of_scope"
        : "pending_owner_classification",
    },
    identityAssociation: identityBlocked
      ? {
          state: "blocked_legacy_alias_scope_mismatch",
          intendedLabel: "Legacy fixture alias",
          observedDocumentTitle: "Fixture document",
          blockerCode: "legacy_alias_scope_mismatch",
        }
      : {
          state: "provisional_metadata_match",
          intendedLabel: "Fixture document",
          observedDocumentTitle: "Fixture document",
          blockerCode: null,
        },
  };
}

function fixtureManifest(
  target: PdfExtractionTarget,
): PdfExtractionBatchManifest {
  return {
    schemaVersion: "1.0.0",
    batchId: "fixture.batch.v1",
    observedOn: "2026-08-02",
    processingUnit: "raw_pdf_sha256",
    purpose: "Test-only technical extraction.",
    semantics: {
      technicalExtractionOnly: true,
      privateTextStorageOnly: true,
      aiAnalysisComplete: false,
      ownerReviewComplete: false,
      independentValidationComplete: false,
      rightsCleared: false,
      publicationReady: false,
      coveragePromotionAllowed: false,
    },
    targets: [target],
  };
}

function fixtureRoots(
  pdfBytes: Buffer,
  replicaBytes = pdfBytes,
): {
  repositoryRoot: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
} {
  const root = mkdtempSync(join(tmpdir(), "pdf-page-extraction-test-"));
  temporaryRoots.push(root);
  const repositoryRoot = join(root, "repository");
  const primaryCorpusRoot = join(root, "primary-corpus");
  const replicaCorpusRoot = join(root, "replica-corpus");
  for (const path of [repositoryRoot, primaryCorpusRoot, replicaCorpusRoot]) {
    mkdirSync(path, { mode: 0o700 });
    chmodSync(path, 0o700);
  }
  const hash = sha256(pdfBytes);
  for (const [corpusRoot, bytes] of [
    [primaryCorpusRoot, pdfBytes],
    [replicaCorpusRoot, replicaBytes],
  ] as const) {
    const directory = join(corpusRoot, "sha256");
    mkdirSync(directory, { mode: 0o700 });
    chmodSync(directory, 0o700);
    const path = join(directory, `${hash}.pdf`);
    writeFileSync(path, bytes, { mode: 0o400 });
    chmodSync(path, 0o400);
  }
  return { repositoryRoot, primaryCorpusRoot, replicaCorpusRoot };
}

function fixtureToolRunner(pdfSize: number): ToolRunner {
  return (command, args) => {
    if (args[0] === "-v") {
      return {
        status: 0,
        stdout: Buffer.alloc(0),
        stderr: Buffer.from(`${command} version 99.1.0\n`),
      };
    }
    if (command === "pdfinfo") {
      return {
        status: 0,
        stdout: Buffer.from(
          [
            "Title: Fixture document",
            "Pages: 2",
            "Encrypted: no",
            `File size: ${pdfSize} bytes`,
            "PDF version: 1.7",
            "",
          ].join("\n"),
        ),
        stderr: Buffer.alloc(0),
      };
    }
    assert.equal(command, "pdftotext");
    const pageNumber = args[1];
    return {
      status: 0,
      stdout:
        pageNumber === "1" ? Buffer.from("Alpha beta\n") : Buffer.alloc(0),
      stderr: Buffer.alloc(0),
    };
  };
}

function writeFixtureGeneratorInputs(
  repositoryRoot: string,
  manifest: PdfExtractionBatchManifest,
): void {
  for (const [path, content] of [
    [DEFAULT_BATCH_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`],
    [PDF_QUALIFICATION_GENERATOR_PATH, "fixture generator source\n"],
    [PDF_QUALIFICATION_LIBRARY_PATH, "fixture library source\n"],
  ]) {
    const absolutePath = join(repositoryRoot, path);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content);
  }
}

describe("PDF page extraction qualification", () => {
  it("normalizes and hashes page text without embedding it in the page record", () => {
    const rawText = "\uFEFFAlpha\u00a0 beta  \r\n\r\n\r\nGamma\r\n";
    const normalizedText = normalizeExtractedPageText(rawText);
    assert.equal(normalizedText, "Alpha beta\n\nGamma\n");
    const record = buildPageExtractionRecord({
      pageNumber: 1,
      rawBytes: Buffer.from(rawText),
      rawText,
      normalizedBytes: Buffer.from(normalizedText),
      normalizedText,
      extractorStderr: Buffer.alloc(0),
      rawTextLocator: "private://corpus/raw.txt",
      normalizedTextLocator: "private://corpus/normalized.txt",
    });
    assert.equal(record.normalizedText.wordCount, 3);
    assert.deepEqual(record.warnings, ["low_extracted_text"]);
    assert.equal(record.rawText.sha256, sha256(Buffer.from(rawText)));
    assert.equal(typeof record.rawText, "object");
    assert.equal(JSON.stringify(record).includes("Alpha beta"), false);
  });

  it("preserves every page, stores text privately in two copies, and is deterministic in check mode", () => {
    const pdfBytes = Buffer.from("%PDF-fixture-content");
    const target = fixtureTarget(pdfBytes);
    const roots = fixtureRoots(pdfBytes);
    const runner = fixtureToolRunner(pdfBytes.length);
    const manifest = fixtureManifest(target);
    writeFixtureGeneratorInputs(roots.repositoryRoot, manifest);
    const written = runQualificationBatch({
      ...roots,
      manifest,
      checkOnly: false,
      runner,
    });
    assert.equal(written.results.length, 1);
    assert.equal(written.blockers.length, 0);
    assert.equal(written.results[0]?.receipt.sourceFile.pageCount, 2);
    assert.deepEqual(written.results[0]?.receipt.totals, {
      rawSizeBytes: 11,
      rawCharacterCount: 11,
      normalizedSizeBytes: 11,
      normalizedCharacterCount: 11,
      wordCount: 2,
      warningPageCount: 2,
      blankPageCount: 1,
      lowTextPageCount: 1,
    });
    for (const corpusRoot of [
      roots.primaryCorpusRoot,
      roots.replicaCorpusRoot,
    ]) {
      const pageDirectory = join(
        corpusRoot,
        "pdf-page-extraction/v1/sha256",
        target.expectedSha256,
        "pages",
      );
      for (const name of [
        "page-0001.raw.txt",
        "page-0001.normalized.txt",
        "page-0002.raw.txt",
        "page-0002.normalized.txt",
      ]) {
        const path = join(pageDirectory, name);
        assert.equal(existsSync(path), true);
        assert.equal(privateMode(path), "0400");
      }
      assert.equal(
        readFileSync(join(pageDirectory, "page-0002.raw.txt")).length,
        0,
      );
      assert.equal(
        readFileSync(join(pageDirectory, "page-0002.normalized.txt")).length,
        0,
      );
    }
    const checked = runQualificationBatch({
      ...roots,
      manifest,
      checkOnly: true,
      runner,
    });
    assert.deepEqual(checked.summary, written.summary);
  });

  it("keeps a technically extracted legacy alias mismatch in an open fail-closed queue", () => {
    const pdfBytes = Buffer.from("%PDF-fixture-content");
    const target = fixtureTarget(pdfBytes, true);
    const roots = fixtureRoots(pdfBytes);
    const manifest = fixtureManifest(target);
    writeFixtureGeneratorInputs(roots.repositoryRoot, manifest);
    const result = runQualificationBatch({
      ...roots,
      manifest,
      checkOnly: false,
      runner: fixtureToolRunner(pdfBytes.length),
    });
    assert.equal(result.results.length, 1);
    assert.equal(
      result.results[0]?.receipt.qualificationState,
      "technical_extraction_passed_identity_blocked",
    );
    assert.equal(result.blockers.length, 1);
    assert.equal(
      result.blockers[0]?.blockerCode,
      "legacy_alias_scope_mismatch",
    );
    assert.equal(result.blockers[0]?.technicalExtractionState, "passed");
    assert.equal(result.blockers[0]?.coveragePromotionAllowed, false);
    const portable = checkTrackedQualificationBundle({
      repositoryRoot: roots.repositoryRoot,
    });
    assert.equal(portable.privateVerificationPerformed, false);
    assert.equal(portable.blockers.length, 1);
    assert.equal(
      parseCliArgs(["--check-tracked"], { NODE_ENV: "test" }).primaryCorpusRoot,
      null,
    );
  });

  it("does not publish any tracked bundle when the private replica hash mismatches", () => {
    const pdfBytes = Buffer.from("%PDF-fixture-content");
    const replicaBytes = Buffer.from("%PDF-fixture-contenu");
    assert.equal(replicaBytes.length, pdfBytes.length);
    const target = fixtureTarget(pdfBytes);
    const roots = fixtureRoots(pdfBytes, replicaBytes);
    const manifest = fixtureManifest(target);
    writeFixtureGeneratorInputs(roots.repositoryRoot, manifest);
    assert.throws(
      () =>
        runQualificationBatch({
          ...roots,
          manifest,
          checkOnly: false,
          runner: fixtureToolRunner(pdfBytes.length),
        }),
      /No tracked bundle published/,
    );
    assert.equal(
      existsSync(
        join(
          roots.repositoryRoot,
          "knowledge/corpus/pdf-page-extraction/receipts",
        ),
      ),
      false,
    );
    assert.equal(
      existsSync(
        join(roots.repositoryRoot, PDF_QUALIFICATION_BLOCKER_QUEUE_PATH),
      ),
      false,
    );
    assert.equal(
      existsSync(join(roots.repositoryRoot, PDF_QUALIFICATION_SUMMARY_PATH)),
      false,
    );
  });

  it("rejects one archive directory presented as both primary and replica", () => {
    const pdfBytes = Buffer.from("%PDF-fixture-content");
    const target = fixtureTarget(pdfBytes);
    const roots = fixtureRoots(pdfBytes);
    const manifest = fixtureManifest(target);
    writeFixtureGeneratorInputs(roots.repositoryRoot, manifest);
    assert.throws(
      () =>
        runQualificationBatch({
          repositoryRoot: roots.repositoryRoot,
          primaryCorpusRoot: roots.primaryCorpusRoot,
          replicaCorpusRoot: roots.primaryCorpusRoot,
          manifest,
          checkOnly: false,
          runner: fixtureToolRunner(pdfBytes.length),
        }),
      (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "blockerCode" in error &&
        error.blockerCode === "private_archive_roots_not_distinct",
    );
  });

  it("strictly rejects unknown nested batch-manifest fields", () => {
    const pdfBytes = Buffer.from("%PDF-fixture-content");
    const manifest = fixtureManifest(fixtureTarget(pdfBytes));
    const malformed = structuredClone(
      manifest,
    ) as PdfExtractionBatchManifest & {
      semantics: PdfExtractionBatchManifest["semantics"] & {
        accidentalPromotion?: boolean;
      };
    };
    malformed.semantics.accidentalPromotion = true;
    assert.throws(
      () => parseBatchManifest(malformed),
      /Strict batch manifest validation failed/,
    );
  });

  it("accepts observed-empty and not-stated PDF metadata title states", () => {
    const pdfBytes = Buffer.from("%PDF-fixture-content");
    const manifest = fixtureManifest(fixtureTarget(pdfBytes));
    manifest.targets[0]!.sourceBinding.expectedPdfInfoTitle = {
      state: "observed",
      value: "",
    };
    assert.doesNotThrow(() => parseBatchManifest(manifest));
    manifest.targets[0]!.sourceBinding.expectedPdfInfoTitle = {
      state: "not_stated",
    };
    assert.doesNotThrow(() => parseBatchManifest(manifest));
  });

  it("portable tracked check detects orphan page maps without private archive roots", () => {
    const pdfBytes = Buffer.from("%PDF-fixture-content");
    const target = fixtureTarget(pdfBytes);
    const roots = fixtureRoots(pdfBytes);
    const manifest = fixtureManifest(target);
    writeFixtureGeneratorInputs(roots.repositoryRoot, manifest);
    runQualificationBatch({
      ...roots,
      manifest,
      checkOnly: false,
      runner: fixtureToolRunner(pdfBytes.length),
    });
    const pageMapDirectory = join(
      roots.repositoryRoot,
      "knowledge/corpus/pdf-page-extraction/page-maps",
    );
    writeFileSync(join(pageMapDirectory, "orphan.page-map.v1.json"), "{}\n");
    assert.throws(
      () =>
        checkTrackedQualificationBundle({
          repositoryRoot: roots.repositoryRoot,
        }),
      /Tracked output set differs/,
    );
  });

  it("portable tracked check rejects resealed semantic drift from the batch manifest", () => {
    const pdfBytes = Buffer.from("%PDF-fixture-content");
    const target = fixtureTarget(pdfBytes);
    const roots = fixtureRoots(pdfBytes);
    const manifest = fixtureManifest(target);
    writeFixtureGeneratorInputs(roots.repositoryRoot, manifest);
    runQualificationBatch({
      ...roots,
      manifest,
      checkOnly: false,
      runner: fixtureToolRunner(pdfBytes.length),
    });

    const pageMapPath = join(
      roots.repositoryRoot,
      "knowledge/corpus/pdf-page-extraction/page-maps",
      `${target.expectedSha256}.page-map.v1.json`,
    );
    const pageMap = JSON.parse(readFileSync(pageMapPath, "utf8"));
    const { pageMapSha256: _oldSeal, ...pageMapBody } = pageMap;
    pageMapBody.identityAssociation.intendedLabel =
      "Resealed but drifted label";
    const resealedPageMap = sealPageMap(pageMapBody);
    const resealedBytes = Buffer.from(
      `${JSON.stringify(resealedPageMap, null, 2)}\n`,
    );
    writeFileSync(pageMapPath, resealedBytes);

    const generationPath = join(
      roots.repositoryRoot,
      PDF_QUALIFICATION_GENERATION_MANIFEST_PATH,
    );
    const generation = JSON.parse(readFileSync(generationPath, "utf8"));
    const pageMapRelativePath = `knowledge/corpus/pdf-page-extraction/page-maps/${target.expectedSha256}.page-map.v1.json`;
    const output = generation.outputs.find(
      (entry: { path: string }) => entry.path === pageMapRelativePath,
    );
    assert(output);
    output.sha256 = sha256(resealedBytes);
    output.sizeBytes = resealedBytes.length;
    generation.outputSetSha256 = sha256(
      canonicalJson(generation.outputs as JsonValue),
    );
    const { generationManifestSha256: _oldGenerationSeal, ...generationBody } =
      generation;
    const resealedGeneration = {
      ...generationBody,
      generationManifestSha256: sha256(
        canonicalJson(generationBody as JsonValue),
      ),
    };
    writeFileSync(
      generationPath,
      `${JSON.stringify(resealedGeneration, null, 2)}\n`,
    );

    assert.throws(
      () =>
        checkTrackedQualificationBundle({
          repositoryRoot: roots.repositoryRoot,
        }),
      (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "blockerCode" in error &&
        error.blockerCode === "tracked_cross_artifact_mismatch",
    );
  });

  it("checks all fifteen tracked page maps, receipts, exact totals, and closed promotion semantics", () => {
    const summary = JSON.parse(
      readFileSync(PDF_QUALIFICATION_SUMMARY_PATH, "utf8"),
    ) as Record<string, unknown>;
    const summarySha256 = summary.summarySha256;
    const { summarySha256: _ignored, ...summaryBody } = summary;
    assert.equal(
      summarySha256,
      sha256(canonicalJson(summaryBody as JsonValue)),
    );
    assert.equal(summary.targetCount, 15);
    assert.equal(summary.technicallyQualifiedCount, 15);
    assert.equal(summary.technicalFailureCount, 0);
    assert.equal(summary.openBlockerCount, 12);
    assert.equal(summary.legacyAliasScopeMismatchCount, 2);
    assert.equal(summary.unregisteredSourceCandidateCount, 10);
    assert.deepEqual(summary.totals, {
      pageCount: 772,
      wordCount: 272545,
      warningPageCount: 35,
      blankPageCount: 1,
      lowTextPageCount: 20,
    });
    const documents = summary.documents as Array<Record<string, unknown>>;
    assert.equal(documents.length, 15);
    let pageCount = 0;
    for (const document of documents) {
      const rawHash = document.rawPdfSha256 as string;
      const pageMap = JSON.parse(
        readFileSync(
          join(
            "knowledge/corpus/pdf-page-extraction/page-maps",
            `${rawHash}.page-map.v1.json`,
          ),
          "utf8",
        ),
      );
      const receipt = JSON.parse(
        readFileSync(
          join(
            "knowledge/corpus/pdf-page-extraction/receipts",
            `${rawHash}.receipt.v1.json`,
          ),
          "utf8",
        ),
      );
      assert.equal(verifySealedPageMap(pageMap), true);
      assert.equal(verifySealedQualificationReceipt(receipt), true);
      assert.equal(pageMap.textIncludedInTrackedArtifact, false);
      assert.equal(pageMap.privateStorageOnly, true);
      assert.equal(pageMap.pageSequenceComplete, true);
      assert.equal(pageMap.pages.length, pageMap.expectedPageCount);
      assert.deepEqual(
        pageMap.pages.map((page: { pageNumber: number }) => page.pageNumber),
        Array.from(
          { length: pageMap.expectedPageCount },
          (_value, index) => index + 1,
        ),
      );
      assert.equal(receipt.semantics.aiAnalysisComplete, false);
      assert.equal(receipt.semantics.ownerReviewComplete, false);
      assert.equal(receipt.semantics.rightsCleared, false);
      assert.equal(receipt.semantics.publicationReady, false);
      assert.equal(receipt.semantics.coveragePromotionAllowed, false);
      assert.equal(receipt.sourceBinding.corpusIdentityVerified, false);
      assert.equal(JSON.stringify(pageMap.pages).includes("Alpha beta"), false);
      pageCount += pageMap.pages.length;
    }
    assert.equal(pageCount, 772);
    const blockers = readFileSync(PDF_QUALIFICATION_BLOCKER_QUEUE_PATH, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    assert.equal(blockers.length, 12);
    assert.ok(
      blockers.every(
        (entry) =>
          [
            "legacy_alias_scope_mismatch",
            "database_registration_required",
          ].includes(entry.blockerCode) &&
          entry.technicalExtractionState === "passed" &&
          entry.corpusIdentityVerified === false &&
          entry.coveragePromotionAllowed === false,
      ),
    );
    assert.equal(
      blockers.filter(
        (entry) => entry.blockerCode === "database_registration_required",
      ).length,
      10,
    );
  });
});
