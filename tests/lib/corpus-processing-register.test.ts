import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  CORPUS_PROCESSING_PATHS,
  LIVE_INVENTORY_SNAPSHOT_PATH,
  buildCorpusProcessingArtifacts,
  buildLiveInventorySnapshot,
  checkPrivateRecoveryCopies,
  classifyCorpusRole,
  parseLibraryAnalysisLedgerJsonl,
  parseCorpusProcessingCliArgs,
  validateCorpusProcessingRegister,
  writeOrCheckCorpusProcessingArtifacts,
  type LibraryAnalysisLedgerRow,
} from "../../scripts/knowledge/generate-corpus-processing-register";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const baselineObservedAt = "2026-08-02T20:58:11Z";
const ledgerObservedAt = "2026-07-28T05:32:26.743Z";

function ledgerRow(
  sourceKey: string,
  canonicalPath: string | null,
  overrides: Partial<LibraryAnalysisLedgerRow> = {},
): LibraryAnalysisLedgerRow {
  const sourceKind = sourceKey.split(":")[0] ?? "document";
  return {
    sourceKind,
    sourceKey,
    title: `Title ${sourceKey}`,
    canonicalPath,
    status: "approved_internal",
    usageRule: "safe_for_ai_context",
    reviewRequired: false,
    riskFlags: [],
    claimCandidateCount: 0,
    contentHash: "a".repeat(64),
    currentContentHash: "a".repeat(64),
    linkedDocumentId:
      sourceKind === "document" ? sourceKey.slice("document:".length) : null,
    linkedSourceDocId: null,
    linkedReportId: null,
    linkedThesisId: null,
    citationReadiness: null,
    externalCitationEligible: false,
    reviewStatus: "not_required",
    reviewedAt: null,
    reviewer: null,
    ...overrides,
  };
}

function write(root: string, path: string, content: string) {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

function fixtureRoot(rows: LibraryAnalysisLedgerRow[]): string {
  const root = mkdtempSync(join(tmpdir(), "corpus-processing-register-"));
  const ledgerContent =
    rows.map((row) => JSON.stringify(row)).join("\n") + "\n";
  const inventorySnapshot = buildLiveInventorySnapshot({
    liveRows: rows,
    ledgerContent,
    observedAt: baselineObservedAt,
  });
  write(
    root,
    "knowledge/corpus/corpus-processing-baseline.v1.json",
    JSON.stringify(
      {
        schemaVersion: "1.0.0",
        baselineId: "whole-corpus-processing-baseline.v1",
        observedAt: baselineObservedAt,
        ledgerObservedAt,
        expectedActiveRows: 1555,
        expectedRetainedHistoryRows: 17,
        retainedHistoryNonAdditive: true,
        authoritativeInventorySnapshot: {
          path: LIVE_INVENTORY_SNAPSHOT_PATH,
          snapshotId: inventorySnapshot.snapshotId,
          observedAt: inventorySnapshot.observedAt,
          activeRows: inventorySnapshot.activeRows,
          identityContentSetSha256: inventorySnapshot.identityContentSetSha256,
          sourceKindCountsSha256: inventorySnapshot.sourceKindCountsSha256,
          ledgerSha256: inventorySnapshot.ledger.sha256,
        },
        purpose: "Test fixture baseline that does not promote readiness.",
      },
      null,
      2,
    ) + "\n",
  );
  write(
    root,
    LIVE_INVENTORY_SNAPSHOT_PATH,
    JSON.stringify(inventorySnapshot, null, 2) + "\n",
  );
  write(
    root,
    "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
    JSON.stringify(
      {
        schemaVersion: "1.0.0",
        registerId: "corpus-private-recovery-candidates.v1",
        captureRecordedOn: "2026-08-02",
        purpose: "Test fixture with no private recovery candidates.",
        storageVerificationContract: {
          requiredCopies: ["private_primary", "bigbrain_private_replica"],
          bothCopiesSha256MatchCandidate: true,
          bothCopiesSizeBytesMatchCandidate: true,
          bothCopiesFileMode: "0400",
          verificationRecordedOn: "2026-08-02",
        },
        candidates: [],
      },
      null,
      2,
    ) + "\n",
  );
  write(root, "research/_status/library-analysis-ledger.jsonl", ledgerContent);
  for (const path of [
    "src/lib/library-analysis-retained-history-contract.ts",
    "src/lib/knowledge/corpus-processing-lifecycle.ts",
    "scripts/knowledge/generate-corpus-processing-register.ts",
  ])
    write(root, path, `fixture source for ${path}\n`);
  return root;
}

describe("whole-corpus processing register generator", () => {
  it("materializes one active row per identity while preserving retained history as non-additive", () => {
    const rows = [
      ledgerRow("document:doc-a", "research/evidence-pack/akademia/a.pdf"),
      ledgerRow("document:doc-b", "research/evidence-pack/akademia/a-copy.pdf"),
      ledgerRow("report:report-c", null, {
        sourceKind: "report",
        linkedDocumentId: null,
      }),
    ];
    const root = fixtureRoot(rows);
    write(root, "research/evidence-pack/akademia/a.pdf", "same source bytes");
    write(
      root,
      "research/evidence-pack/akademia/a-copy.pdf",
      "same source bytes",
    );

    const first = buildCorpusProcessingArtifacts(root, {
      expectedActiveRows: 3,
    });
    const second = buildCorpusProcessingArtifacts(root, {
      expectedActiveRows: 3,
    });
    assert.deepEqual(first.bundle, second.bundle);
    assert.equal(first.rows.length, 3);
    assert.deepEqual(
      first.rows.map((row) => row.identityKey),
      ["document:doc-a", "document:doc-b", "report:report-c"],
    );
    assert.equal(
      (first.summary.activeCorpus as Record<string, unknown>).total,
      3,
    );
    assert.deepEqual(first.summary.retainedHistoryBoundary, {
      total: 17,
      nonAdditive: true,
      externalUseAllowed: false,
      contractSha256:
        first.summary.retainedHistoryBoundary &&
        (first.summary.retainedHistoryBoundary as Record<string, unknown>)
          .contractSha256,
    });
    assert.equal(first.fullTextProcessingQueue.length, 2);
    assert.deepEqual(
      first.fullTextProcessingQueue.map((item) => item.identityKeys),
      [["report:report-c"], ["document:doc-a", "document:doc-b"]],
    );
    assert.equal(first.ownerReviewQueue.length, 3);
    assert.equal(first.roleClassificationQueue.length, 3);
    assert.equal(first.missingFilesQueue.length, 1);
    assert.equal(first.contentHashDuplicateQueue.length, 1);
    assert.ok(
      first.rows.every(
        (row) => row.lifecycle.textAvailability.state === "unavailable",
      ),
    );
    assert.ok(
      first.rows.every(
        (row) => row.lifecycle.ownerReviewStatus.state === "not_requested",
      ),
    );
    assert.ok(
      first.rows.every(
        (row) =>
          row.lifecycle.sourceRoleConfirmationStatus.state ===
            (row.roleClassification.role === "unknown"
              ? "unknown"
              : "machine_provisional") &&
          row.lifecycle.sourceRoleConfirmationStatus.receipt === null,
      ),
    );
    assert.ok(
      first.rows.every(
        (row) =>
          row.permissions.sourceRoleOwnerConfirmed === false &&
          row.permissions.aiReadyForOwnerReview === false &&
          row.permissions.blockers.includes(
            "source_role_owner_confirmation_missing",
          ),
      ),
    );
    assert.ok(
      first.rows.every(
        (row) => row.queueMemberships.roleClassification === true,
      ),
    );
    assert.ok(
      first.rows.every(
        (row) => row.roleClassification.ownerConfirmed === false,
      ),
    );
    assert.ok(
      first.roleClassificationQueue.every(
        (entry) =>
          entry.ownerConfirmed === false &&
          entry.decisionReceiptRequired === true &&
          entry.resolved === false,
      ),
    );
    assert.ok(
      first.ownerReviewQueue.every(
        (entry) =>
          Array.isArray(entry.blockedBy) &&
          entry.blockedBy.includes("source_role_owner_confirmation_missing"),
      ),
    );
    assert.ok(
      first.rows.every((row) => row.promotionState.externalUseReady === false),
    );
    assert.equal(
      (
        (first.summary.activeCorpus as Record<string, unknown>)
          .authoritativeInventorySnapshot as Record<string, unknown>
      ).portableSnapshotBindingVerified,
      true,
    );
    assert.equal(
      (
        (first.summary.activeCorpus as Record<string, unknown>)
          .authoritativeInventorySnapshot as Record<string, unknown>
      ).liveDatabaseVerifiedThisRun,
      false,
    );
  });

  it("normalizes optional research roots and classifies safe external sources before filename controls", () => {
    assert.equal(
      classifyCorpusRole(
        ledgerRow("document:pdf", "research/evidence-pack/akademia/source.pdf"),
      ).role,
      "primary_evidence",
    );
    assert.equal(
      classifyCorpusRole(
        ledgerRow("document:control", "research/_status/STATUS.md"),
      ).role,
      "operational_control",
    );
    assert.equal(
      classifyCorpusRole(
        ledgerRow("document:generated", "research/ocr-output/source.md"),
      ).role,
      "generated_projection",
    );
    assert.equal(
      classifyCorpusRole(
        ledgerRow("document:synthesis", "research/bibliotek/summary.md"),
      ).role,
      "internal_synthesis",
    );
    assert.equal(
      classifyCorpusRole(
        ledgerRow("document:external", "external/barekraft/note.md"),
      ).role,
      "primary_evidence",
    );
    for (const path of [
      "research/external/vision-2030-action-plan.md",
      "research/external/vision-2030-status-report-2023.md",
      "research/external-cdrc-priority-places.md",
      "research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-government-organic-action-plan-2024.md",
    ]) {
      const result = classifyCorpusRole(ledgerRow(`document:${path}`, path));
      assert.equal(result.role, "primary_evidence", path);
      assert.equal(result.ruleId, "trusted_external_source_path", path);
    }
    assert.equal(
      classifyCorpusRole(
        ledgerRow("document:pdf-status", "archive/status-report.pdf"),
      ).role,
      "primary_evidence",
    );
    assert.equal(
      classifyCorpusRole(
        ledgerRow("report:report-source", "_status/status.md", {
          sourceKind: "report",
          linkedDocumentId: null,
        }),
      ).role,
      "primary_evidence",
    );
    assert.equal(
      classifyCorpusRole(
        ledgerRow(
          "document:evidence-control",
          "research/evidence-pack/source-manifest.md",
        ),
      ).role,
      "operational_control",
    );
    assert.equal(
      classifyCorpusRole(
        ledgerRow(
          "document:gap-card",
          "research/evidence-pack/gap-cards/gap-card.md",
        ),
      ).role,
      "internal_synthesis",
    );
    assert.equal(
      classifyCorpusRole(
        ledgerRow("document:archive", "arkiv-sortert/working/deep-research.md"),
      ).role,
      "unknown",
    );
    const misleadingAlias = classifyCorpusRole(
      ledgerRow(
        "document:cmppajyve0013njvmw7zok4yr",
        "research/evidence-pack/nordisk/nordic-food-alert-2025.pdf",
        {
          title:
            "Beyond Zero — Nordic Architecture on the Road Towards Renewed Practices (Nord 2025:010)",
        },
      ),
    );
    assert.equal(misleadingAlias.role, "unknown");
    assert.equal(
      misleadingAlias.ruleId,
      "known_legacy_alias_identity_mismatch",
    );
  });

  it("rejects duplicate active identities before generation", () => {
    const duplicate = ledgerRow(
      "document:duplicate",
      "research/bibliotek/duplicate.md",
    );
    assert.throws(
      () =>
        parseLibraryAnalysisLedgerJsonl(
          `${JSON.stringify(duplicate)}\n${JSON.stringify(duplicate)}\n`,
        ),
      /Duplicate active corpus identity: document:duplicate/,
    );
  });

  it("requires exact live-inventory identity/content parity and exact baseline binding", () => {
    const row = ledgerRow("document:doc-a", "research/bibliotek/a.md");
    const ledgerContent = `${JSON.stringify(row)}\n`;
    assert.throws(
      () =>
        buildLiveInventorySnapshot({
          liveRows: [{ ...row, contentHash: "b".repeat(64) }],
          ledgerContent,
          observedAt: baselineObservedAt,
        }),
      /do not exactly match the tracked ledger/,
    );

    const root = fixtureRoot([row]);
    write(root, "research/bibliotek/a.md", "fixture source");
    const baselinePath = join(
      root,
      "knowledge/corpus/corpus-processing-baseline.v1.json",
    );
    const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as {
      authoritativeInventorySnapshot: { identityContentSetSha256: string };
    };
    baseline.authoritativeInventorySnapshot.identityContentSetSha256 =
      "b".repeat(64);
    write(
      root,
      "knowledge/corpus/corpus-processing-baseline.v1.json",
      `${JSON.stringify(baseline, null, 2)}\n`,
    );
    assert.throws(
      () => buildCorpusProcessingArtifacts(root, { expectedActiveRows: 1 }),
      /baseline is not bound to the exact tracked live-inventory snapshot/i,
    );
  });

  it("fails when required inputs are missing", () => {
    const root = mkdtempSync(
      join(tmpdir(), "corpus-processing-missing-input-"),
    );
    assert.throws(
      () => buildCorpusProcessingArtifacts(root, { expectedActiveRows: 1 }),
      /Missing required corpus-processing input: knowledge\/corpus\/corpus-processing-baseline\.v1\.json/,
    );
  });

  it("detects stale generated output in check mode", () => {
    const root = fixtureRoot([
      ledgerRow("document:doc-a", "research/bibliotek/a.md"),
    ]);
    write(root, "research/bibliotek/a.md", "fixture source");
    const artifacts = buildCorpusProcessingArtifacts(root, {
      expectedActiveRows: 1,
    });
    writeOrCheckCorpusProcessingArtifacts(root, artifacts, false);
    write(
      root,
      CORPUS_PROCESSING_PATHS.summary,
      `${readFileSync(join(root, CORPUS_PROCESSING_PATHS.summary), "utf8")}stale\n`,
    );
    assert.throws(
      () => writeOrCheckCorpusProcessingArtifacts(root, artifacts, true),
      /Generated corpus-processing file is stale/,
    );
  });

  it("rejects forbidden readiness promotion without processing and review receipts", () => {
    const root = fixtureRoot([
      ledgerRow("document:doc-a", "research/bibliotek/a.md"),
    ]);
    write(root, "research/bibliotek/a.md", "fixture source");
    const artifacts = buildCorpusProcessingArtifacts(root, {
      expectedActiveRows: 1,
    });
    const promoted = structuredClone(artifacts.rows[0]!);
    promoted.promotionState.externalUseReady = true as false;
    assert.match(
      validateCorpusProcessingRegister([promoted]).join("\n"),
      /forbidden readiness promotion externalUseReady/,
    );
    const roleQueueBypass = structuredClone(artifacts.rows[0]!);
    roleQueueBypass.queueMemberships.roleClassification = false;
    assert.match(
      validateCorpusProcessingRegister([roleQueueBypass]).join("\n"),
      /role-classification queue membership must remain true/,
    );
  });

  it("rejects unrecognized private-recovery fields instead of silently widening authority", () => {
    const root = fixtureRoot([
      ledgerRow("document:doc-a", "research/bibliotek/a.md"),
    ]);
    write(root, "research/bibliotek/a.md", "fixture source");
    const path = join(
      root,
      "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
    );
    const register = JSON.parse(readFileSync(path, "utf8")) as Record<
      string,
      unknown
    >;
    register.rightsCleared = true;
    write(
      root,
      "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
      `${JSON.stringify(register, null, 2)}\n`,
    );
    assert.throws(
      () => buildCorpusProcessingArtifacts(root, { expectedActiveRows: 1 }),
      /Unrecognized key[\s\S]*rightsCleared/,
    );
  });

  it("keeps portable private attestations separate from explicit live two-copy verification", () => {
    const bytes = Buffer.from("%PDF-1.7\nprivate recovery fixture\n%%EOF\n");
    const digest = sha256(bytes);
    const row = ledgerRow(
      "document:private-doc",
      "research/missing/private-doc.pdf",
    );
    const root = fixtureRoot([row]);
    write(
      root,
      "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
      JSON.stringify(
        {
          schemaVersion: "1.0.0",
          registerId: "corpus-private-recovery-candidates.v1",
          captureRecordedOn: "2026-08-02",
          purpose: "Test one controlled private recovery candidate.",
          storageVerificationContract: {
            requiredCopies: ["private_primary", "bigbrain_private_replica"],
            bothCopiesSha256MatchCandidate: true,
            bothCopiesSizeBytesMatchCandidate: true,
            bothCopiesFileMode: "0400",
            verificationRecordedOn: "2026-08-02",
          },
          candidates: [
            {
              identityKey: row.sourceKey,
              canonicalPath: row.canonicalPath,
              sha256: digest,
              sizeBytes: bytes.length,
              internalLocator: `private://corpus/sha256/${digest}`,
              replicaClass: "bigbrain_private_replica",
              repositoryAvailable: false,
              fullTextReviewed: false,
              rightsState: "pending_not_cleared",
            },
          ],
        },
        null,
        2,
      ) + "\n",
    );

    const portable = buildCorpusProcessingArtifacts(root, {
      expectedActiveRows: 1,
    });
    const privateSummary = portable.summary.privateRecovery as Record<
      string,
      unknown
    >;
    assert.deepEqual(privateSummary.liveVerifiedThisRun, {
      performed: false,
      primaryCopiesVerified: 0,
      replicaCopiesVerified: 0,
      verifiedCandidateCount: 0,
    });
    assert.equal(
      (privateSummary.recorded as Record<string, unknown>).candidateCount,
      1,
    );

    const primaryRoot = join(
      mkdtempSync(join(tmpdir(), "corpus-private-primary-")),
      "corpus",
    );
    const replicaRoot = join(
      mkdtempSync(join(tmpdir(), "corpus-private-replica-")),
      "corpus",
    );
    for (const corpusRoot of [primaryRoot, replicaRoot]) {
      const shaDirectory = join(corpusRoot, "sha256");
      mkdirSync(shaDirectory, { recursive: true, mode: 0o700 });
      chmodSync(corpusRoot, 0o700);
      chmodSync(shaDirectory, 0o700);
      const file = join(shaDirectory, `${digest}.pdf`);
      writeFileSync(file, bytes);
      chmodSync(file, 0o400);
    }

    const verified = checkPrivateRecoveryCopies({
      repositoryRoot: root,
      primaryCorpusRoot: primaryRoot,
      replicaCorpusRoot: replicaRoot,
    });
    assert.deepEqual(verified.liveVerifiedThisRun, {
      performed: true,
      primaryCopiesVerified: 1,
      replicaCopiesVerified: 1,
      verifiedCandidateCount: 1,
      fileMode: "0400",
      directoryMode: "0700",
    });
    assert.equal(
      (verified.semantics as Record<string, unknown>).trackedSummaryMutated,
      false,
    );

    assert.throws(
      () =>
        checkPrivateRecoveryCopies({
          repositoryRoot: root,
          primaryCorpusRoot: primaryRoot,
          replicaCorpusRoot: primaryRoot,
        }),
      /must resolve to distinct directories/,
    );

    chmodSync(join(replicaRoot, "sha256", `${digest}.pdf`), 0o600);
    assert.throws(
      () =>
        checkPrivateRecoveryCopies({
          repositoryRoot: root,
          primaryCorpusRoot: primaryRoot,
          replicaCorpusRoot: replicaRoot,
        }),
      /must use mode 0400/,
    );
  });

  it("requires private roots only for explicit private verification mode", () => {
    const emptyEnv: NodeJS.ProcessEnv = { NODE_ENV: "test" };
    assert.deepEqual(parseCorpusProcessingCliArgs(["--check"], emptyEnv), {
      mode: "check",
      primaryCorpusRoot: null,
      replicaCorpusRoot: null,
    });
    assert.throws(
      () => parseCorpusProcessingCliArgs(["--check-private"], emptyEnv),
      /Private check requires explicit roots/,
    );
    assert.equal(
      parseCorpusProcessingCliArgs(
        [
          "--check-private",
          "--primary-corpus-root",
          "/tmp/private-primary",
          "--replica-corpus-root",
          "/tmp/private-replica",
        ],
        emptyEnv,
      ).mode,
      "check_private",
    );
  });

  it("checks the tracked 1,555-row corpus snapshot and exact PDF duplicate boundary", () => {
    const artifacts = buildCorpusProcessingArtifacts(repositoryRoot);
    writeOrCheckCorpusProcessingArtifacts(repositoryRoot, artifacts, true);
    assert.equal(artifacts.rows.length, 1555);
    assert.equal(
      new Set(artifacts.rows.map((row) => row.identityKey)).size,
      1555,
    );
    assert.equal(artifacts.missingFilesQueue.length, 29);
    assert.equal(artifacts.ownerReviewQueue.length, 1555);
    assert.equal(artifacts.roleClassificationQueue.length, 1555);
    assert.equal(artifacts.retainedHistoryBoundary.retainedHistoryRows, 17);
    assert.equal(artifacts.retainedHistoryBoundary.nonAdditive, true);

    const pdfRows = artifacts.rows.filter(
      (row) => row.repositoryFile.mediaType === "application/pdf",
    );
    const pdfHashDuplicateGroups = artifacts.contentHashDuplicateQueue.filter(
      (entry) => entry.mediaTypes.includes("application/pdf"),
    );
    assert.equal(pdfRows.length, 122);
    assert.equal(
      pdfRows.filter((row) => row.repositoryFile.state === "present").length,
      111,
    );
    assert.equal(
      pdfRows.filter((row) => row.privateRecoveryCandidate !== null).length,
      11,
    );
    assert.equal(pdfHashDuplicateGroups.length, 13);
    assert.equal(
      new Set(pdfHashDuplicateGroups.flatMap((entry) => entry.identityKeys))
        .size,
      26,
    );
    const knownAliasRows = artifacts.rows.filter(
      (row) =>
        row.roleClassification.ruleId ===
        "known_legacy_alias_identity_mismatch",
    );
    assert.deepEqual(
      knownAliasRows.map((row) => row.identityKey),
      [
        "document:cmppajyvb0012njvmnphhze07",
        "document:cmppajyve0013njvmw7zok4yr",
      ],
    );
    assert.ok(
      knownAliasRows.every((row) => row.roleClassification.role === "unknown"),
    );
    assert.ok(
      artifacts.rows.every(
        (row) =>
          row.queueMemberships.roleClassification === true &&
          row.roleClassification.ownerConfirmed === false &&
          row.lifecycle.sourceRoleConfirmationStatus.receipt === null &&
          row.lifecycle.sourceRoleConfirmationStatus.state ===
            (row.roleClassification.role === "unknown"
              ? "unknown"
              : "machine_provisional") &&
          row.permissions.sourceRoleOwnerConfirmed === false &&
          row.permissions.aiReadyForOwnerReview === false &&
          row.permissions.blockers.includes(
            "source_role_owner_confirmation_missing",
          ),
      ),
    );
    assert.ok(
      artifacts.ownerReviewQueue.every(
        (entry) =>
          Array.isArray(entry.blockedBy) &&
          entry.blockedBy.includes("source_role_owner_confirmation_missing"),
      ),
    );
    for (const path of [
      "research/external/vision-2030-action-plan.md",
      "research/external/vision-2030-status-report-2023.md",
      "research/external-cdrc-priority-places.md",
      "research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-government-organic-action-plan-2024.md",
    ]) {
      const row = artifacts.rows.find(
        (candidate) => candidate.canonicalPath === path,
      );
      assert(row, `Expected tracked regression source: ${path}`);
      assert.equal(row.roleClassification.role, "primary_evidence", path);
      assert.equal(
        row.roleClassification.ruleId,
        "trusted_external_source_path",
        path,
      );
    }
    assert.equal(
      (artifacts.summary.repositoryFiles as Record<string, unknown>)
        .lifecycleContentHashBound,
      1537,
    );
    assert.equal(
      (artifacts.summary.repositoryFiles as Record<string, unknown>)
        .contentHashUnavailable,
      18,
    );
    const privateSummary = artifacts.summary.privateRecovery as Record<
      string,
      unknown
    >;
    assert.equal(
      (privateSummary.recorded as Record<string, unknown>).candidateCount,
      11,
    );
    assert.deepEqual(privateSummary.liveVerifiedThisRun, {
      performed: false,
      primaryCopiesVerified: 0,
      replicaCopiesVerified: 0,
      verifiedCandidateCount: 0,
    });
    const activeSnapshot = (
      artifacts.summary.activeCorpus as Record<string, unknown>
    ).authoritativeInventorySnapshot as Record<string, unknown>;
    assert.equal(activeSnapshot.portableSnapshotBindingVerified, true);
    assert.equal(activeSnapshot.liveDatabaseVerifiedThisRun, false);
    assert.equal(activeSnapshot.path, LIVE_INVENTORY_SNAPSHOT_PATH);
    const manifest = JSON.parse(
      artifacts.bundle.find(
        (item) => item.path === CORPUS_PROCESSING_PATHS.generationManifest,
      )!.content,
    ) as { inputs: Array<{ path: string }> };
    assert.ok(
      manifest.inputs.some(
        (input) => input.path === LIVE_INVENTORY_SNAPSHOT_PATH,
      ),
    );
    assert.ok(
      pdfRows
        .filter((row) => row.privateRecoveryCandidate)
        .every(
          (row) =>
            row.repositoryFile.state === "missing" &&
            row.privateRecoveryCandidate?.rightsState ===
              "pending_not_cleared" &&
            row.lifecycle.fileAvailability.state === "missing" &&
            row.lifecycle.textAvailability.state === "unavailable" &&
            row.lifecycle.sourceIdentity.contentSha256 !== null,
        ),
    );
    const privateUnits = artifacts.fullTextProcessingQueue.filter(
      (item) =>
        item.processingInputState ===
        "private_capture_available_internal_processing",
    );
    assert.equal(privateUnits.length, 11);
    assert.ok(
      privateUnits.every((item) => item.privateCaptureRightsCleared === false),
    );
  });
});
