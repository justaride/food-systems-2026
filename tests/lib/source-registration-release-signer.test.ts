import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import {
  chmodSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ACKNOWLEDGEMENT,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_DATABASE_ROLE,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_OPERATOR_ID,
  canonicalSourceRegistrationAuthorizationJson,
  sourceRegistrationAuthorizationSha256,
  verifySourceRegistrationReleaseAuthorizationEnvelopeBytes,
} from "../../scripts/knowledge/source-registration-release-authorization.mjs";
import { publishSourceRegistrationReleaseAuthorization } from "../../scripts/knowledge/sign-source-registration-release-authorization.mjs";

const hash = (character: string) => character.repeat(64);
const now = "2026-08-03T03:00:00.000Z";

function bodyFixture() {
  return {
    authorizationId: "018f6f24-742a-7c01-8f4a-4fdfbf338721",
    scope: "source-registration.new-official-2026-08-02.exact-apply",
    operator: {
      operatorId: SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_OPERATOR_ID,
      authorityClass: "codex_ai_local_operator_pre_human_validation",
      exactApplyAuthorized: true,
      humanApprovalClaimed: false,
      ownerExactHashReviewClaimed: false,
      expertValidationClaimed: false,
      rightsHolderApprovalClaimed: false,
      keyCustody: "local_owner_accessible_file_not_hardware_backed",
    },
    issuedAtUtc: "2026-08-03T02:55:00.000Z",
    notBeforeUtc: "2026-08-03T02:55:00.000Z",
    expiresAtUtc: "2026-08-03T05:55:00.000Z",
    nonce: hash("a"),
    mutation: {
      action: "register_exact_locked_official_sources",
      acknowledgement:
        SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ACKNOWLEDGEMENT,
      databaseRole: SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_DATABASE_ROLE,
      documentCreatesMax: 10,
      libraryAnalysisRecordCreatesMax: 10,
      controlledMutationAuditCreatesMax: 1,
      otherDatabaseWritesAuthorized: false,
      lifecyclePromotionAuthorized: false,
      sourceAnalysisPromotionAuthorized: false,
      externalUseAuthorized: false,
    },
    bindings: {
      planSha256: hash("1"),
      planFileSha256: hash("2"),
      beforeSnapshotSha256: hash("3"),
      databaseIdentityUuid: "90e3e24d-230f-42f7-b178-5bcd5b861e84",
      sourceDatabaseName: "foodsystems",
      applyContractSha256: hash("4"),
      dependencyStateSha256: hash("5"),
      operationKey: `source-registration-new-official-v1:${hash("6")}`,
      codeBindingsSha256: hash("7"),
      databaseTargetSha256: hash("8"),
      databaseCatalogSha256: hash("9"),
      contentStateSha256: hash("a"),
      backupSha256: hash("b"),
      backupBytes: 29_494_452,
      backupMetadataSha256: hash("c"),
      structuralRestoreReceiptSha256: hash("d"),
      logicalRestoreCompanionReceiptSha256: hash("1"),
      logicalCloneRehearsalReceiptFileSha256: hash("2"),
      logicalCloneRehearsalReceiptSelfSha256: hash("3"),
      completedMigrationLedgerSha256: hash("e"),
      targetFingerprintSha256: hash("f"),
      targetSetSha256: hash("0"),
    },
    restoreProof: {
      sourceContentStateSha256: hash("a"),
      restoredContentStateSha256: hash("a"),
      contentMatch: true,
      restoredDatabaseDropped: true,
      restoredDatabaseAbsenceConfirmed: true,
      postRehearsalCloneFullStateMatched: true,
      sourceStillMatchedAfterRehearsal: true,
      structuralRestoreCompletedAtUtc: "2026-08-03T02:30:00.000Z",
      logicalCloneRehearsalCompletedAtUtc: "2026-08-03T02:35:00.000Z",
      logicalRestoreCompanionCompletedAtUtc: "2026-08-03T02:40:00.000Z",
      logicalComparisonProofSha256: hash("7"),
      logicalCloneRehearsalOperationKey: `source-registration-logical-clone-rehearsal-v1:${hash("8")}`,
      logicalCloneRehearsalRuntimeAttestationSha256: hash("9"),
      restoreRunnerSha256: hash("1"),
      backupVerifierSha256: hash("2"),
      backupContractHelperSha256: hash("3"),
      databaseLogicalDigestSha256: hash("4"),
      psqlBinarySha256: hash("5"),
      psqlRuntimeClosureSha256: hash("6"),
    },
  };
}

function expectedFixture(
  body: ReturnType<typeof bodyFixture>,
  envelope: Buffer,
  publicKey: Buffer,
) {
  return {
    authorizationEnvelopeSha256:
      sourceRegistrationAuthorizationSha256(envelope),
    publicKeyFileSha256: sourceRegistrationAuthorizationSha256(publicKey),
    acknowledgement: body.mutation.acknowledgement,
    operatorId: body.operator.operatorId,
    databaseRole: body.mutation.databaseRole,
    ...body.bindings,
    structuralRestoreCompletedAtUtc:
      body.restoreProof.structuralRestoreCompletedAtUtc,
    logicalCloneRehearsalCompletedAtUtc:
      body.restoreProof.logicalCloneRehearsalCompletedAtUtc,
    logicalRestoreCompanionCompletedAtUtc:
      body.restoreProof.logicalRestoreCompanionCompletedAtUtc,
    logicalComparisonProofSha256:
      body.restoreProof.logicalComparisonProofSha256,
    logicalCloneRehearsalOperationKey:
      body.restoreProof.logicalCloneRehearsalOperationKey,
    logicalCloneRehearsalRuntimeAttestationSha256:
      body.restoreProof.logicalCloneRehearsalRuntimeAttestationSha256,
    restoredDatabaseDropped: body.restoreProof.restoredDatabaseDropped,
    restoredDatabaseAbsenceConfirmed:
      body.restoreProof.restoredDatabaseAbsenceConfirmed,
    postRehearsalCloneFullStateMatched:
      body.restoreProof.postRehearsalCloneFullStateMatched,
    sourceStillMatchedAfterRehearsal:
      body.restoreProof.sourceStillMatchedAfterRehearsal,
    restoreRunnerSha256: body.restoreProof.restoreRunnerSha256,
    backupVerifierSha256: body.restoreProof.backupVerifierSha256,
    backupContractHelperSha256: body.restoreProof.backupContractHelperSha256,
    databaseLogicalDigestSha256: body.restoreProof.databaseLogicalDigestSha256,
    psqlBinarySha256: body.restoreProof.psqlBinarySha256,
    psqlRuntimeClosureSha256: body.restoreProof.psqlRuntimeClosureSha256,
  };
}

function fixture() {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), "source-registration-release-signer-")),
  );
  chmodSync(root, 0o700);
  const body = bodyFixture();
  const request = Buffer.from(
    `${canonicalSourceRegistrationAuthorizationJson(body)}\n`,
  );
  const pair = generateKeyPairSync("ed25519");
  const privateKey = Buffer.from(
    pair.privateKey.export({ type: "pkcs8", format: "pem" }),
  );
  const publicKey = Buffer.from(
    pair.publicKey.export({ type: "spki", format: "pem" }),
  );
  const requestPath = join(root, "request.json");
  const privateKeyPath = join(root, "private.pem");
  const publicKeyPath = join(root, "public.pem");
  const outputPath = join(root, "authorization.json");
  writeFileSync(requestPath, request, { mode: 0o600 });
  writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
  writeFileSync(publicKeyPath, publicKey, { mode: 0o600 });
  return {
    root,
    body,
    request,
    requestPath,
    privateKeyPath,
    publicKey,
    publicKeyPath,
    outputPath,
  };
}

test("publishes one private signed file and returns a path-free receipt", () => {
  const input = fixture();
  try {
    const result = publishSourceRegistrationReleaseAuthorization({
      requestPath: input.requestPath,
      privateKeyPath: input.privateKeyPath,
      publicKeyPath: input.publicKeyPath,
      outputPath: input.outputPath,
      expectedRequestSha256: sourceRegistrationAuthorizationSha256(
        input.request,
      ),
      now,
    });
    const envelope = readFileSync(input.outputPath);
    const stats = lstatSync(input.outputPath);
    assert.equal(stats.mode & 0o777, 0o400);
    assert.equal(stats.nlink, 1);
    assert.equal(
      result.authorizationEnvelopeSha256,
      sourceRegistrationAuthorizationSha256(envelope),
    );
    assert.equal(JSON.stringify(result).includes(input.root), false);

    const verified = verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
      authorizationBytes: envelope,
      publicKeyBytes: input.publicKey,
      expected: expectedFixture(input.body, envelope, input.publicKey),
      now,
    });
    assert.equal(verified.planSha256, input.body.bindings.planSha256);

    assert.throws(
      () =>
        publishSourceRegistrationReleaseAuthorization({
          requestPath: input.requestPath,
          privateKeyPath: input.privateKeyPath,
          publicKeyPath: input.publicKeyPath,
          outputPath: input.outputPath,
          expectedRequestSha256: sourceRegistrationAuthorizationSha256(
            input.request,
          ),
          now,
        }),
      /refusing to overwrite/,
    );
  } finally {
    rmSync(input.root, { force: true, recursive: true });
  }
});

test("publication race preserves the other file and post-link failure cleans only owned output", () => {
  const race = fixture();
  const attackerBytes = Buffer.from("attacker-owned\n", "utf8");
  try {
    assert.throws(
      () =>
        publishSourceRegistrationReleaseAuthorization({
          requestPath: race.requestPath,
          privateKeyPath: race.privateKeyPath,
          publicKeyPath: race.publicKeyPath,
          outputPath: race.outputPath,
          expectedRequestSha256: sourceRegistrationAuthorizationSha256(
            race.request,
          ),
          now,
          publicationFaultHooks: {
            afterOutputPathCheck() {
              writeFileSync(race.outputPath, attackerBytes, { mode: 0o400 });
            },
          },
        }),
      /authorization could not be published safely/,
    );
    assert.deepEqual(readFileSync(race.outputPath), attackerBytes);
    unlinkSync(race.outputPath);

    let postLinkError: unknown;
    try {
      publishSourceRegistrationReleaseAuthorization({
        requestPath: race.requestPath,
        privateKeyPath: race.privateKeyPath,
        publicKeyPath: race.publicKeyPath,
        outputPath: race.outputPath,
        expectedRequestSha256: sourceRegistrationAuthorizationSha256(
          race.request,
        ),
        now,
        publicationFaultHooks: {
          afterHardLink() {
            throw new Error(
              "postgresql://operator:must-not-leak@host/db /private/key/path",
            );
          },
        },
      });
    } catch (error) {
      postLinkError = error;
    }
    assert.ok(postLinkError instanceof Error);
    assert.match(
      postLinkError.message,
      /authorization could not be published safely/,
    );
    assert.equal(postLinkError.message.includes("must-not-leak"), false);
    assert.throws(() => lstatSync(race.outputPath), { code: "ENOENT" });
  } finally {
    rmSync(race.root, { force: true, recursive: true });
  }
});

test("fails before publication on request drift or unsafe key permissions", () => {
  const drift = fixture();
  try {
    assert.throws(
      () =>
        publishSourceRegistrationReleaseAuthorization({
          requestPath: drift.requestPath,
          privateKeyPath: drift.privateKeyPath,
          publicKeyPath: drift.publicKeyPath,
          outputPath: drift.outputPath,
          expectedRequestSha256: hash("0"),
          now,
        }),
      /request SHA-256 differs from expected/,
    );
    assert.equal(lstatSync(drift.root).isDirectory(), true);
  } finally {
    rmSync(drift.root, { force: true, recursive: true });
  }

  const permissions = fixture();
  try {
    chmodSync(permissions.privateKeyPath, 0o644);
    assert.throws(
      () =>
        publishSourceRegistrationReleaseAuthorization({
          requestPath: permissions.requestPath,
          privateKeyPath: permissions.privateKeyPath,
          publicKeyPath: permissions.publicKeyPath,
          outputPath: permissions.outputPath,
          expectedRequestSha256: sourceRegistrationAuthorizationSha256(
            permissions.request,
          ),
          now,
        }),
      /private key is not a controlled regular single-link file/,
    );
  } finally {
    rmSync(permissions.root, { force: true, recursive: true });
  }
});

test("production signer refuses all command-line path arguments", () => {
  const signer = resolve(
    process.cwd(),
    "scripts/knowledge/sign-source-registration-release-authorization.mjs",
  );
  const result = spawnSync(
    process.execPath,
    [signer, "--private-key=/tmp/key"],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        LANG: "C",
        LC_ALL: "C",
        PATH: process.env.PATH ?? "/usr/bin:/bin",
        TMPDIR: "/tmp",
        TZ: "UTC",
      } as unknown as NodeJS.ProcessEnv,
    },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /command-line arguments are forbidden/);
  assert.equal(result.stderr.includes("/tmp/key"), false);
});
