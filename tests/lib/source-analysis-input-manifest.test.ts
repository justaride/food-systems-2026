import assert from "node:assert/strict";
import {
  chmodSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, it } from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  buildPageExtractionRecord,
  sealPageMap,
  sealQualificationReceipt,
  sha256,
  summarizeWarnings,
  type PdfPageMapBody,
  type PdfQualificationReceiptBody,
} from "../../src/lib/knowledge/pdf-page-extraction-qualification";
import {
  SOURCE_ANALYSIS_INPUT_READINESS,
  SourceAnalysisInputManifestSchema,
  SourceAnalysisInputRepositoryPathSchema,
  canonicalNormalizedInputBytes,
  sealSourceAnalysisInputManifest,
  serializeNormalizedInput,
  verifySourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import {
  PDF_EXTRACTION_LIBRARY_PATH,
  PDF_EXTRACTION_RECEIPT_DIRECTORY,
  PDF_PAGE_MAP_DIRECTORY,
  SOURCE_ANALYSIS_INPUT_GENERATOR_PATH,
  SOURCE_ANALYSIS_INPUT_GENERATION_MANIFEST_PATH,
  SOURCE_ANALYSIS_INPUT_JSON_SCHEMA_PATH,
  SOURCE_ANALYSIS_INPUT_LIBRARY_PATH,
  SOURCE_ANALYSIS_INPUT_MANIFEST_DIRECTORY,
  SOURCE_ANALYSIS_INPUT_README_PATH,
  SOURCE_ANALYSIS_INPUT_SUMMARY_PATH,
  checkPrivateSourceAnalysisInputBundle,
  checkTrackedSourceAnalysisInputBundle,
  parseSourceAnalysisInputCliArgs,
  writeSourceAnalysisInputBundle,
} from "../../scripts/knowledge/generate-source-analysis-input-manifests";
import { sourceAnalysisCombinedInputFixture } from "../fixtures/source-analysis-combined-fixture";

const jsonSchema = JSON.parse(
  readFileSync(SOURCE_ANALYSIS_INPUT_JSON_SCHEMA_PATH, "utf8"),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateJsonSchema = ajv.compile(jsonSchema);

const temporaryRoots: string[] = [];

afterEach(() => {
  for (const path of temporaryRoots.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function write(path: string, value: string | Buffer, mode?: number): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
  if (mode !== undefined) chmodSync(path, mode);
}

function fixture(
  options: { blockedIdentity?: boolean; unregisteredIdentity?: boolean } = {},
): {
  repositoryRoot: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  rawPdfSha256: string;
  pageTexts: string[];
} {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-analysis-input-fixture-")),
  );
  temporaryRoots.push(root);
  const repositoryRoot = join(root, "repo");
  const primaryCorpusRoot = join(root, "primary");
  const replicaCorpusRoot = join(root, "replica");
  const rawPdf = Buffer.from("%PDF-source-analysis-input-fixture");
  const rawPdfSha256 = sha256(rawPdf);
  const pageTexts = ["Alpha one.\n", "Beta two.\n"];
  const records = pageTexts.map((text, index) => {
    const bytes = Buffer.from(text);
    return buildPageExtractionRecord({
      pageNumber: index + 1,
      rawBytes: bytes,
      rawText: text,
      normalizedBytes: bytes,
      normalizedText: text,
      extractorStderr: Buffer.alloc(0),
      rawTextLocator: `private://corpus/pdf-page-extraction/v1/sha256/${rawPdfSha256}/pages/page-${String(index + 1).padStart(4, "0")}.raw.txt`,
      normalizedTextLocator: `private://corpus/pdf-page-extraction/v1/sha256/${rawPdfSha256}/pages/page-${String(index + 1).padStart(4, "0")}.normalized.txt`,
    });
  });
  const sourceBinding = {
    title: "Fixture document",
    doi: null,
    officialUrl: "https://example.test/fixture.pdf",
    corpusIdentityVerified: false as const,
    scopeDisposition: options.blockedIdentity
      ? ("pending_owner_disposition_likely_out_of_scope" as const)
      : ("pending_owner_classification" as const),
  };
  const identityAssociation = options.unregisteredIdentity
    ? ({
        state: "unregistered_source_candidate" as const,
        intendedLabel: "Unregistered fixture source",
        observedDocumentTitle: "Fixture document",
        blockerCode: "database_registration_required" as const,
      } as const)
    : options.blockedIdentity
      ? ({
          state: "blocked_legacy_alias_scope_mismatch" as const,
          intendedLabel: "Legacy fixture alias",
          observedDocumentTitle: "Fixture document",
          blockerCode: "legacy_alias_scope_mismatch" as const,
        } as const)
      : ({
          state: "provisional_metadata_match" as const,
          intendedLabel: "Fixture document",
          observedDocumentTitle: "Fixture document",
          blockerCode: null,
        } as const);
  const pageMapBody: PdfPageMapBody = {
    schemaVersion: "1.0.0",
    artifactType: "pdf_page_extraction_map",
    pipelineVersion: "1.0.0",
    processingUnit: { algorithm: "sha256", rawPdfSha256 },
    identityKeys: ["document:fixture"],
    identityAssociation,
    sourceBinding,
    extractionEngine: {
      name: "pdftotext",
      version: "fixture",
      argumentsTemplate: [],
    },
    expectedPageCount: records.length,
    extractedPageCount: records.length,
    pageSequenceComplete: true,
    privateStorageOnly: true,
    textIncludedInTrackedArtifact: false,
    languagePolicy: {
      pageLanguageDetection: "not_computed",
      reason: "no_version_pinned_reliable_detector_configured",
    },
    promotionState: {
      aiAnalysisComplete: false,
      ownerReviewComplete: false,
      independentValidationComplete: false,
      rightsCleared: false,
      publicationReady: false,
      coveragePromotionAllowed: false,
    },
    pages: records,
  };
  const pageMap = sealPageMap(pageMapBody);
  const pageMapPath = `${PDF_PAGE_MAP_DIRECTORY}/${rawPdfSha256}.page-map.v1.json`;
  const receiptPath = `${PDF_EXTRACTION_RECEIPT_DIRECTORY}/${rawPdfSha256}.receipt.v1.json`;
  const warningSummary = summarizeWarnings(records);
  const receiptBody: PdfQualificationReceiptBody = {
    schemaVersion: "1.0.0",
    receiptType: "pdf_page_extraction_technical_qualification",
    pipelineVersion: "1.0.0",
    qualificationState:
      options.blockedIdentity || options.unregisteredIdentity
        ? "technical_extraction_passed_identity_blocked"
        : "technical_extraction_passed_with_warnings",
    processingUnit: { algorithm: "sha256", rawPdfSha256 },
    identityKeys: pageMap.identityKeys,
    identityAssociation,
    sourceBinding,
    sourceFile: {
      expectedSizeBytes: rawPdf.length,
      observedSizeBytes: rawPdf.length,
      headerMagic: "%PDF-",
      encryptionState: "not_encrypted",
      pageCount: records.length,
      pdfVersion: "1.7",
      primaryCopy: {
        locator: `private://corpus/sha256/${rawPdfSha256}.pdf`,
        sha256: rawPdfSha256,
        sizeBytes: rawPdf.length,
        fileMode: "0400",
        verified: true,
      },
      replicaCopy: {
        locator: `private://bigbrain-corpus/sha256/${rawPdfSha256}.pdf`,
        sha256: rawPdfSha256,
        sizeBytes: rawPdf.length,
        fileMode: "0400",
        verified: true,
      },
    },
    extraction: {
      pdfinfoVersion: "fixture",
      pdftotextVersion: "fixture",
      argumentsTemplate: [],
      pageMapLocator: pageMapPath,
      pageMapSha256: pageMap.pageMapSha256,
      extractedPageCount: records.length,
      rawTextFileCount: records.length,
      normalizedTextFileCount: records.length,
      primaryPrivateOutputVerified: true,
      replicaPrivateOutputVerified: true,
    },
    totals: {
      rawSizeBytes: records.reduce(
        (total, page) => total + page.rawText.sizeBytes,
        0,
      ),
      rawCharacterCount: records.reduce(
        (total, page) => total + page.rawText.characterCount,
        0,
      ),
      normalizedSizeBytes: records.reduce(
        (total, page) => total + page.normalizedText.sizeBytes,
        0,
      ),
      normalizedCharacterCount: records.reduce(
        (total, page) => total + page.normalizedText.characterCount,
        0,
      ),
      wordCount: records.reduce(
        (total, page) => total + page.normalizedText.wordCount,
        0,
      ),
      warningPageCount: records.filter((page) => page.warnings.length > 0)
        .length,
      blankPageCount: 0,
      lowTextPageCount: records.length,
    },
    warningSummary,
    languagePolicy: {
      pageLanguageDetection: "not_computed",
      reason: "no_version_pinned_reliable_detector_configured",
    },
    semantics: {
      technicalExtractionOnly: true,
      fullTextStoredInRepository: false,
      aiAnalysisComplete: false,
      ownerReviewComplete: false,
      independentValidationComplete: false,
      rightsCleared: false,
      publicationReady: false,
      coveragePromotionAllowed: false,
    },
  };
  const receipt = sealQualificationReceipt(receiptBody);
  write(join(repositoryRoot, pageMapPath), prettyJson(pageMap));
  write(join(repositoryRoot, receiptPath), prettyJson(receipt));
  for (const [path, content] of [
    [SOURCE_ANALYSIS_INPUT_GENERATOR_PATH, "fixture generator source\n"],
    [SOURCE_ANALYSIS_INPUT_LIBRARY_PATH, "fixture input library source\n"],
    [SOURCE_ANALYSIS_INPUT_JSON_SCHEMA_PATH, "{}\n"],
    [PDF_EXTRACTION_LIBRARY_PATH, "fixture extraction library source\n"],
    [SOURCE_ANALYSIS_INPUT_README_PATH, "fixture readme\n"],
  ]) {
    write(join(repositoryRoot, path), content);
  }
  for (const corpusRoot of [primaryCorpusRoot, replicaCorpusRoot]) {
    write(join(corpusRoot, "sha256", `${rawPdfSha256}.pdf`), rawPdf, 0o400);
    for (const [index, text] of pageTexts.entries()) {
      write(
        join(
          corpusRoot,
          "pdf-page-extraction/v1/sha256",
          rawPdfSha256,
          "pages",
          `page-${String(index + 1).padStart(4, "0")}.normalized.txt`,
        ),
        text,
        0o400,
      );
    }
    chmodSync(corpusRoot, 0o700);
  }
  return {
    repositoryRoot,
    primaryCorpusRoot,
    replicaCorpusRoot,
    rawPdfSha256,
    pageTexts,
  };
}

describe("source-analysis input manifests", () => {
  it("uses deterministic, order-sensitive framed serialization", () => {
    const pages = [
      {
        pageNumber: 1,
        normalizedText: {
          sha256: sha256("Alpha\n"),
          sizeBytes: 6,
          characterCount: 6,
          wordCount: 1,
        },
      },
      {
        pageNumber: 2,
        normalizedText: {
          sha256: sha256("Beta\n"),
          sizeBytes: 5,
          characterCount: 5,
          wordCount: 1,
        },
      },
    ];
    const material = {
      pages,
      normalizedPageBytes: [Buffer.from("Alpha\n"), Buffer.from("Beta\n")],
    };
    const canonicalBytes = canonicalNormalizedInputBytes(material);
    const first = serializeNormalizedInput(material);
    const second = serializeNormalizedInput(material);
    assert.deepEqual(first, second);
    assert.equal(first.sha256, sha256(canonicalBytes));
    assert.equal(first.serializedSizeBytes, canonicalBytes.length);
    assert.equal(
      canonicalBytes
        .toString("utf8")
        .startsWith("food-systems/source-analysis-normalized-input/v1\n"),
      true,
    );
    assert.throws(
      () =>
        serializeNormalizedInput({
          pages: [pages[1]!, pages[0]!],
          normalizedPageBytes: [Buffer.from("Beta\n"), Buffer.from("Alpha\n")],
        }),
      /not contiguous/,
    );
    assert.throws(
      () =>
        serializeNormalizedInput({
          pages: [pages[0]!],
          normalizedPageBytes: [Buffer.from("Omega\n")],
        }),
      /SHA-256 differs/,
    );
    const invalidUtf8 = Buffer.from([0xff]);
    assert.throws(
      () =>
        canonicalNormalizedInputBytes({
          pages: [
            {
              pageNumber: 1,
              normalizedText: {
                sha256: sha256(invalidUtf8),
                sizeBytes: 1,
                characterCount: 1,
                wordCount: 0,
              },
            },
          ],
          normalizedPageBytes: [invalidUtf8],
        }),
      /not valid UTF-8/,
    );
  });

  it("writes only tracked manifests and verifies both read-only private copies", () => {
    const roots = fixture();
    const beforeModes = [roots.primaryCorpusRoot, roots.replicaCorpusRoot].map(
      (corpusRoot) =>
        (
          statSync(join(corpusRoot, "sha256", `${roots.rawPdfSha256}.pdf`))
            .mode & 0o777
        )
          .toString(8)
          .padStart(4, "0"),
    );
    const written = writeSourceAnalysisInputBundle(roots);
    assert.equal(written.manifests.length, 1);
    const manifest = written.manifests[0]!;
    assert.equal(manifest.totals.pageCount, 2);
    assert.deepEqual(manifest.readiness, SOURCE_ANALYSIS_INPUT_READINESS);
    assert.equal(
      manifest.workflowEligibility.state,
      "identity_verification_candidate",
    );
    assert.equal(
      manifest.workflowEligibility.identityVerification.allowed,
      true,
    );
    assert.equal(manifest.workflowEligibility.sourceAnalysis.allowed, false);
    const trackedText = readFileSync(
      join(
        roots.repositoryRoot,
        SOURCE_ANALYSIS_INPUT_MANIFEST_DIRECTORY,
        `${roots.rawPdfSha256}.source-analysis-input-manifest.v1.json`,
      ),
      "utf8",
    );
    for (const sourceText of roots.pageTexts)
      assert.equal(trackedText.includes(sourceText.trim()), false);
    const trackedBundleText = [
      trackedText,
      readFileSync(
        join(roots.repositoryRoot, SOURCE_ANALYSIS_INPUT_SUMMARY_PATH),
        "utf8",
      ),
      readFileSync(
        join(
          roots.repositoryRoot,
          SOURCE_ANALYSIS_INPUT_GENERATION_MANIFEST_PATH,
        ),
        "utf8",
      ),
    ].join("\n");
    for (const sourceText of roots.pageTexts)
      assert.equal(trackedBundleText.includes(sourceText.trim()), false);
    assert.equal(trackedBundleText.includes(roots.primaryCorpusRoot), false);
    assert.equal(trackedBundleText.includes(roots.replicaCorpusRoot), false);
    const portable = checkTrackedSourceAnalysisInputBundle({
      repositoryRoot: roots.repositoryRoot,
    });
    assert.equal(portable.privateVerificationPerformed, false);
    const privateCheck = checkPrivateSourceAnalysisInputBundle(roots);
    assert.equal(privateCheck.privateVerificationPerformed, true);
    const afterModes = [roots.primaryCorpusRoot, roots.replicaCorpusRoot].map(
      (corpusRoot) =>
        (
          statSync(join(corpusRoot, "sha256", `${roots.rawPdfSha256}.pdf`))
            .mode & 0o777
        )
          .toString(8)
          .padStart(4, "0"),
    );
    assert.deepEqual(afterModes, beforeModes);
  });

  it("keeps alias-mismatched units blocked from both downstream workflows", () => {
    const roots = fixture({ blockedIdentity: true });
    const manifest = writeSourceAnalysisInputBundle(roots).manifests[0]!;
    assert.equal(
      manifest.identityAssociation.state,
      "blocked_legacy_alias_scope_mismatch",
    );
    assert.equal(manifest.sourceBinding.corpusIdentityVerified, false);
    assert.deepEqual(manifest.workflowEligibility, {
      state: "blocked_identity_association",
      identityVerification: {
        allowed: false,
        blockerCode: "legacy_alias_scope_mismatch",
      },
      sourceAnalysis: {
        allowed: false,
        blockerCode: "identity_association_blocked",
      },
    });
  });

  it("keeps unregistered source candidates blocked until database intake", () => {
    const roots = fixture({ unregisteredIdentity: true });
    const manifest = writeSourceAnalysisInputBundle(roots).manifests[0]!;
    assert.equal(
      manifest.identityAssociation.state,
      "unregistered_source_candidate",
    );
    assert.equal(manifest.sourceBinding.corpusIdentityVerified, false);
    assert.deepEqual(manifest.workflowEligibility, {
      state: "blocked_identity_association",
      identityVerification: {
        allowed: false,
        blockerCode: "database_registration_required",
      },
      sourceAnalysis: {
        allowed: false,
        blockerCode: "identity_association_blocked",
      },
    });
    assert.equal(
      SourceAnalysisInputManifestSchema.safeParse(manifest).success,
      true,
    );
    assert.equal(Boolean(validateJsonSchema(manifest)), true);
  });

  it("fails private validation when one replica page changes", () => {
    const roots = fixture();
    writeSourceAnalysisInputBundle(roots);
    const replicaPage = join(
      roots.replicaCorpusRoot,
      "pdf-page-extraction/v1/sha256",
      roots.rawPdfSha256,
      "pages/page-0002.normalized.txt",
    );
    chmodSync(replicaPage, 0o600);
    writeFileSync(replicaPage, "Changed.\n");
    chmodSync(replicaPage, 0o400);
    assert.throws(
      () => checkPrivateSourceAnalysisInputBundle(roots),
      /private_normalized_page_mismatch/,
    );
  });

  it("rejects aliased roots and same-inode archive files", () => {
    const sameRoot = fixture();
    assert.throws(
      () =>
        writeSourceAnalysisInputBundle({
          ...sameRoot,
          replicaCorpusRoot: sameRoot.primaryCorpusRoot,
        }),
      /private_archive_roots_not_distinct/,
    );

    const symlinkedRoot = fixture();
    const aliasPath = join(
      dirname(symlinkedRoot.primaryCorpusRoot),
      "primary-alias",
    );
    symlinkSync(symlinkedRoot.primaryCorpusRoot, aliasPath, "dir");
    assert.throws(
      () =>
        writeSourceAnalysisInputBundle({
          ...symlinkedRoot,
          primaryCorpusRoot: aliasPath,
        }),
      /private_archive_root_invalid/,
    );

    const hardLinked = fixture();
    const primaryPdf = join(
      hardLinked.primaryCorpusRoot,
      "sha256",
      `${hardLinked.rawPdfSha256}.pdf`,
    );
    const replicaPdf = join(
      hardLinked.replicaCorpusRoot,
      "sha256",
      `${hardLinked.rawPdfSha256}.pdf`,
    );
    unlinkSync(replicaPdf);
    linkSync(primaryPdf, replicaPdf);
    assert.throws(
      () => writeSourceAnalysisInputBundle(hardLinked),
      /private_archive_files_not_distinct/,
    );

    const hardLinkedPage = fixture();
    const primaryPage = join(
      hardLinkedPage.primaryCorpusRoot,
      "pdf-page-extraction/v1/sha256",
      hardLinkedPage.rawPdfSha256,
      "pages/page-0001.normalized.txt",
    );
    const replicaPage = join(
      hardLinkedPage.replicaCorpusRoot,
      "pdf-page-extraction/v1/sha256",
      hardLinkedPage.rawPdfSha256,
      "pages/page-0001.normalized.txt",
    );
    unlinkSync(replicaPage);
    linkSync(primaryPage, replicaPage);
    assert.throws(
      () => writeSourceAnalysisInputBundle(hardLinkedPage),
      /private_archive_files_not_distinct/,
    );
  });

  it("detects tracked source tampering and orphan manifests portably", () => {
    const roots = fixture();
    writeSourceAnalysisInputBundle(roots);
    const pageMapPath = join(
      roots.repositoryRoot,
      PDF_PAGE_MAP_DIRECTORY,
      `${roots.rawPdfSha256}.page-map.v1.json`,
    );
    writeFileSync(pageMapPath, `${readFileSync(pageMapPath, "utf8")} `);
    assert.throws(
      () =>
        checkTrackedSourceAnalysisInputBundle({
          repositoryRoot: roots.repositoryRoot,
        }),
      /generation_manifest_input_hash_mismatch/,
    );

    const clean = fixture();
    writeSourceAnalysisInputBundle(clean);
    write(
      join(
        clean.repositoryRoot,
        SOURCE_ANALYSIS_INPUT_MANIFEST_DIRECTORY,
        "orphan.json",
      ),
      "{}\n",
    );
    assert.throws(
      () =>
        checkTrackedSourceAnalysisInputBundle({
          repositoryRoot: clean.repositoryRoot,
        }),
      /tracked_output_orphan/,
    );
  });

  it("strictly rejects unknown fields and any promoted readiness state", () => {
    const roots = fixture();
    const { manifests } = writeSourceAnalysisInputBundle(roots);
    const manifest = manifests[0]!;
    const unknown = {
      ...manifest,
      accidentalField: true,
    };
    assert.equal(
      SourceAnalysisInputManifestSchema.safeParse(unknown).success,
      false,
    );
    const promoted = structuredClone(manifest) as SourceAnalysisInputManifest;
    Object.assign(promoted.readiness, { ownerReviewComplete: true });
    assert.equal(
      SourceAnalysisInputManifestSchema.safeParse(promoted).success,
      false,
    );
    assert.throws(
      () =>
        verifySourceAnalysisInputManifest({
          ...manifest,
          manifestSha256: "0".repeat(64),
        }),
      /self-hash mismatch/,
    );
  });

  it("keeps Zod and JSON Schema structurally aligned and paths portable", () => {
    const roots = fixture();
    const manifest = writeSourceAnalysisInputBundle(roots).manifests[0]!;
    const assertParity = (value: unknown, expected: boolean): void => {
      const zodResult =
        SourceAnalysisInputManifestSchema.safeParse(value).success;
      const jsonResult = validateJsonSchema(value) as boolean;
      assert.equal(zodResult, expected);
      assert.equal(
        jsonResult,
        expected,
        JSON.stringify(validateJsonSchema.errors),
      );
    };
    assertParity(manifest, true);
    assertParity({ ...manifest, accidentalField: true }, false);

    for (const path of [
      "../outside.json",
      "nested/../outside.json",
      "C:\\private\\file.json",
      "file://private/source.json",
      "nested/file://private/source.json",
      "~/private.json",
      "nested/~private.json",
      "/absolute/private.json",
      "nested//file.json",
    ]) {
      assert.equal(
        SourceAnalysisInputRepositoryPathSchema.safeParse(path).success,
        false,
      );
      const invalid = structuredClone(manifest);
      invalid.bindings.pageMap.path = path;
      assertParity(invalid, false);
    }
    for (const path of [
      "knowledge/file.json",
      "knowledge/a file.json",
      "knowledge/.hidden/file.json",
    ]) {
      assert.equal(
        SourceAnalysisInputRepositoryPathSchema.safeParse(path).success,
        true,
      );
    }

    const { manifestSha256: _manifestSha256, ...body } = manifest;
    const inconsistent = structuredClone(body);
    inconsistent.identityAssociation = {
      state: "blocked_legacy_alias_scope_mismatch",
      intendedLabel: "Legacy alias",
      observedDocumentTitle: "Different source",
      blockerCode: "legacy_alias_scope_mismatch",
    };
    const sealed = sealSourceAnalysisInputManifest(inconsistent);
    assert.throws(
      () => verifySourceAnalysisInputManifest(sealed),
      /workflow eligibility mismatch/,
    );
  });

  it("requires both archive roots for write/private modes but not tracked mode", () => {
    assert.equal(
      parseSourceAnalysisInputCliArgs(["--check-tracked"], { NODE_ENV: "test" })
        .primaryCorpusRoot,
      null,
    );
    assert.throws(
      () => parseSourceAnalysisInputCliArgs(["--write"], { NODE_ENV: "test" }),
      /private_root_missing/,
    );
    const parsed = parseSourceAnalysisInputCliArgs(["--check-private"], {
      NODE_ENV: "test",
      FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT: "/primary",
      FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT: "/replica",
    });
    assert.equal(parsed.mode, "check-private");
  });

  it("keeps the synthetic verified positive state aligned in Zod and JSON Schema", () => {
    const fixture = sourceAnalysisCombinedInputFixture();
    const manifest = JSON.parse(
      Buffer.from(fixture.inputManifestFile.bytes).toString("utf8"),
    ) as SourceAnalysisInputManifest;
    assert.equal(
      SourceAnalysisInputManifestSchema.safeParse(manifest).success,
      true,
    );
    assert.equal(
      validateJsonSchema(manifest),
      true,
      JSON.stringify(validateJsonSchema.errors),
    );
    assert.deepEqual(verifySourceAnalysisInputManifest(manifest), manifest);
    assert.equal(
      manifest.workflowEligibility.state,
      "source_analysis_eligible",
    );
    assert.equal(manifest.workflowEligibility.sourceAnalysis.allowed, true);
    assert.equal(
      manifest.workflowEligibility.sourceAnalysis.combinedValidationRequired,
      true,
    );
  });

  it("binds all fifteen live PDF units with exact aggregate counts and closed states", () => {
    const summary = JSON.parse(
      readFileSync(SOURCE_ANALYSIS_INPUT_SUMMARY_PATH, "utf8"),
    ) as {
      sourceCount: number;
      totals: { pageCount: number; wordCount: number };
      workflowEligibility: {
        identityVerificationCandidateCount: number;
        blockedIdentityAssociationCount: number;
        sourceAnalysisAllowedCount: number;
      };
      textIncludedInTrackedArtifact: boolean;
      readiness: typeof SOURCE_ANALYSIS_INPUT_READINESS;
    };
    assert.equal(summary.sourceCount, 15);
    assert.deepEqual(summary.totals, {
      pageCount: 772,
      normalizedSizeBytes: 1941800,
      normalizedCharacterCount: 1903065,
      wordCount: 272545,
    });
    assert.equal(summary.textIncludedInTrackedArtifact, false);
    assert.deepEqual(summary.readiness, SOURCE_ANALYSIS_INPUT_READINESS);
    assert.deepEqual(summary.workflowEligibility, {
      identityVerificationCandidateCount: 3,
      blockedIdentityAssociationCount: 12,
      sourceAnalysisAllowedCount: 0,
    });
    const portable = checkTrackedSourceAnalysisInputBundle({
      repositoryRoot: process.cwd(),
    });
    assert.equal(portable.manifests.length, 15);
    assert.equal(
      portable.manifests.every((manifest) => manifest.pages.length > 0),
      true,
    );
    assert.equal(
      portable.manifests.every(
        (manifest) =>
          manifest.workflowEligibility.sourceAnalysis.allowed === false,
      ),
      true,
    );
    assert.equal(
      portable.manifests
        .filter(
          (manifest) =>
            manifest.workflowEligibility.state ===
            "identity_verification_candidate",
        )
        .every(
          (manifest) =>
            manifest.workflowEligibility.identityVerification.allowed === true,
        ),
      true,
    );
    assert.equal(
      portable.manifests
        .filter(
          (manifest) =>
            manifest.workflowEligibility.state ===
            "blocked_identity_association",
        )
        .every(
          (manifest) =>
            manifest.workflowEligibility.identityVerification.allowed === false,
        ),
      true,
    );
  });
});
