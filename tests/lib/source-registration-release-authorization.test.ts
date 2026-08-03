import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020";

import {
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_ACKNOWLEDGEMENT,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_DATABASE_ROLE,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_OPERATOR_ID,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_PATH,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_KEY_ID,
  canonicalSourceRegistrationAuthorizationJson,
  createSourceRegistrationReleaseAuthorizationEnvelope,
  sourceRegistrationAuthorizationSha256,
  verifySourceRegistrationReleaseAuthorization,
  verifySourceRegistrationReleaseAuthorizationEnvelopeBytes,
} from "../../scripts/knowledge/source-registration-release-authorization.mjs";

const hash = (character: string) => character.repeat(64);
const now = "2026-08-03T03:00:00.000Z";

function keyPair() {
  const pair = generateKeyPairSync("ed25519");
  return {
    privateKeyBytes: Buffer.from(
      pair.privateKey.export({ type: "pkcs8", format: "pem" }),
    ),
    publicKeyBytes: Buffer.from(
      pair.publicKey.export({ type: "spki", format: "pem" }),
    ),
  };
}

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
  publicKeyBytes: Buffer,
  envelope: Buffer,
) {
  return {
    authorizationEnvelopeSha256:
      sourceRegistrationAuthorizationSha256(envelope),
    publicKeyFileSha256: sourceRegistrationAuthorizationSha256(publicKeyBytes),
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

function signedFixture(body = bodyFixture(), keys = keyPair()) {
  const envelope = createSourceRegistrationReleaseAuthorizationEnvelope({
    body,
    ...keys,
    now,
  });
  return {
    body,
    keys,
    envelope,
    expected: expectedFixture(body, keys.publicKeyBytes, envelope),
  };
}

test("verifies an exact signed envelope and returns no paths or human claims", () => {
  const fixture = signedFixture();
  const verified = verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
    authorizationBytes: fixture.envelope,
    publicKeyBytes: fixture.keys.publicKeyBytes,
    expected: fixture.expected,
    now,
  });

  assert.equal(verified.algorithm, "Ed25519");
  assert.equal(verified.operatorId, fixture.body.operator.operatorId);
  assert.equal(verified.planSha256, fixture.body.bindings.planSha256);
  assert.equal(
    verified.contentStateSha256,
    fixture.body.bindings.contentStateSha256,
  );
  assert.equal(verified.humanApprovalClaimed, false);
  assert.equal(verified.expertValidationClaimed, false);
  assert.equal(verified.rightsHolderApprovalClaimed, false);
  assert.equal(verified.otherDatabaseWritesAuthorized, false);
  assert.equal(JSON.stringify(verified).includes("/Users/"), false);
});

test("refuses a non-Codex operator, wrong database role, or wrong acknowledgement", () => {
  for (const mutate of [
    (body: ReturnType<typeof bodyFixture>) => {
      body.operator.operatorId = "gabriel";
    },
    (body: ReturnType<typeof bodyFixture>) => {
      body.mutation.databaseRole = "postgres";
    },
    (body: ReturnType<typeof bodyFixture>) => {
      body.mutation.acknowledgement = "REGISTER_SOMETHING_ELSE";
    },
  ]) {
    const body = structuredClone(bodyFixture());
    mutate(body);
    const keys = keyPair();
    assert.throws(
      () =>
        createSourceRegistrationReleaseAuthorizationEnvelope({
          body,
          ...keys,
          now,
        }),
      /operator authority boundary|mutation boundary/,
    );
  }
});

test("rejects tampering, the wrong key, and a mismatched expected binding", () => {
  const fixture = signedFixture();
  assert.throws(
    () =>
      verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
        authorizationBytes: fixture.envelope,
        publicKeyBytes: fixture.keys.publicKeyBytes,
        expected: { ...fixture.expected, databaseRole: "postgres" },
        now,
      }),
    /expected databaseRole must be foodsystems/,
  );
  assert.throws(
    () =>
      verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
        authorizationBytes: fixture.envelope,
        publicKeyBytes: fixture.keys.publicKeyBytes,
        expected: { ...fixture.expected, acknowledgement: "wrong" },
        now,
      }),
    /expected acknowledgement differs/,
  );
  const parsed = JSON.parse(fixture.envelope.toString("utf8"));
  parsed.body.bindings.backupSha256 = hash("0");
  const tampered = Buffer.from(
    `${canonicalSourceRegistrationAuthorizationJson(parsed)}\n`,
  );
  assert.throws(
    () =>
      verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
        authorizationBytes: tampered,
        publicKeyBytes: fixture.keys.publicKeyBytes,
        expected: {
          ...fixture.expected,
          authorizationEnvelopeSha256:
            sourceRegistrationAuthorizationSha256(tampered),
          backupSha256: hash("0"),
        },
        now,
      }),
    /signature is invalid/,
  );

  const wrongKeys = keyPair();
  assert.throws(
    () =>
      verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
        authorizationBytes: fixture.envelope,
        publicKeyBytes: wrongKeys.publicKeyBytes,
        expected: {
          ...fixture.expected,
          publicKeyFileSha256: sourceRegistrationAuthorizationSha256(
            wrongKeys.publicKeyBytes,
          ),
        },
        now,
      }),
    /keyId is not the supplied key/,
  );

  assert.throws(
    () =>
      verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
        authorizationBytes: fixture.envelope,
        publicKeyBytes: fixture.keys.publicKeyBytes,
        expected: { ...fixture.expected, planSha256: hash("0") },
        now,
      }),
    /planSha256 differs from expected/,
  );
});

test("every companion and rehearsal authorization field is an exact expected binding", () => {
  const fixture = signedFixture();
  const mismatches: Array<[keyof typeof fixture.expected, unknown]> = [
    ["structuralRestoreReceiptSha256", hash("0")],
    ["logicalRestoreCompanionReceiptSha256", hash("0")],
    ["logicalCloneRehearsalReceiptFileSha256", hash("0")],
    ["logicalCloneRehearsalReceiptSelfSha256", hash("0")],
    ["structuralRestoreCompletedAtUtc", "2026-08-03T02:31:00.000Z"],
    ["logicalRestoreCompanionCompletedAtUtc", "2026-08-03T02:41:00.000Z"],
    ["logicalComparisonProofSha256", hash("0")],
    [
      "logicalCloneRehearsalOperationKey",
      `source-registration-logical-clone-rehearsal-v1:${hash("0")}`,
    ],
    ["logicalCloneRehearsalRuntimeAttestationSha256", hash("0")],
    ["logicalCloneRehearsalCompletedAtUtc", "2026-08-03T02:36:00.000Z"],
    ["restoredDatabaseDropped", false],
    ["restoredDatabaseAbsenceConfirmed", false],
    ["postRehearsalCloneFullStateMatched", false],
    ["sourceStillMatchedAfterRehearsal", false],
  ];
  for (const [key, replacement] of mismatches) {
    const expected = structuredClone(fixture.expected);
    (expected as Record<string, unknown>)[key] = replacement;
    assert.throws(
      () =>
        verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
          authorizationBytes: fixture.envelope,
          publicKeyBytes: fixture.keys.publicKeyBytes,
          expected,
          now,
        }),
      /differs from expected|must be true/,
      key,
    );
  }
});

test("each structural, rehearsal and companion completion rejects stale or future time", () => {
  const keys = keyPair();
  const timestampKeys = [
    "structuralRestoreCompletedAtUtc",
    "logicalCloneRehearsalCompletedAtUtc",
    "logicalRestoreCompanionCompletedAtUtc",
  ] as const;
  for (const key of timestampKeys) {
    for (const value of [
      "2026-08-01T02:30:00.000Z",
      "2026-08-03T03:01:00.000Z",
    ]) {
      const body = bodyFixture();
      body.restoreProof[key] = value;
      assert.throws(
        () =>
          createSourceRegistrationReleaseAuthorizationEnvelope({
            body,
            ...keys,
            now,
          }),
        /restore evidence is future-dated or stale/,
        `${key}:${value}`,
      );
    }
  }
});

test("swapping companion and rehearsal file bindings is rejected", () => {
  const original = bodyFixture();
  const swapped = structuredClone(original);
  [
    swapped.bindings.logicalRestoreCompanionReceiptSha256,
    swapped.bindings.logicalCloneRehearsalReceiptFileSha256,
  ] = [
    swapped.bindings.logicalCloneRehearsalReceiptFileSha256,
    swapped.bindings.logicalRestoreCompanionReceiptSha256,
  ];
  const keys = keyPair();
  const envelope = createSourceRegistrationReleaseAuthorizationEnvelope({
    body: swapped,
    ...keys,
    now,
  });
  assert.throws(
    () =>
      verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
        authorizationBytes: envelope,
        publicKeyBytes: keys.publicKeyBytes,
        expected: expectedFixture(original, keys.publicKeyBytes, envelope),
        now,
      }),
    /logicalCloneRehearsalReceiptFileSha256 differs from expected|logicalRestoreCompanionReceiptSha256 differs from expected/,
  );
});

test("rejects unknown fields, private paths, stale evidence, and expired use", () => {
  const keys = keyPair();
  const unknown = { ...bodyFixture(), unexpected: true };
  assert.throws(
    () =>
      createSourceRegistrationReleaseAuthorizationEnvelope({
        body: unknown,
        ...keys,
        now,
      }),
    /unexpected shape/,
  );

  const privatePath = bodyFixture();
  privatePath.operator.operatorId = "/Users/example/private";
  assert.throws(
    () =>
      createSourceRegistrationReleaseAuthorizationEnvelope({
        body: privatePath,
        ...keys,
        now,
      }),
    /operatorId is invalid/,
  );

  const stale = bodyFixture();
  stale.restoreProof.structuralRestoreCompletedAtUtc =
    "2026-08-01T02:30:00.000Z";
  assert.throws(
    () =>
      createSourceRegistrationReleaseAuthorizationEnvelope({
        body: stale,
        ...keys,
        now,
      }),
    /restore evidence is future-dated or stale/,
  );

  const future = bodyFixture();
  future.issuedAtUtc = "2026-08-03T03:10:00.000Z";
  future.notBeforeUtc = "2026-08-03T03:10:00.000Z";
  future.expiresAtUtc = "2026-08-03T05:10:00.000Z";
  assert.throws(
    () =>
      createSourceRegistrationReleaseAuthorizationEnvelope({
        body: future,
        ...keys,
        now,
      }),
    /issued in the future/,
  );

  const fixture = signedFixture();
  assert.throws(
    () =>
      verifySourceRegistrationReleaseAuthorizationEnvelopeBytes({
        authorizationBytes: fixture.envelope,
        publicKeyBytes: fixture.keys.publicKeyBytes,
        expected: fixture.expected,
        now: "2026-08-03T06:00:00.000Z",
      }),
    /expired or its lifetime is too long/,
  );
});

test("tracked production public key bytes match the hard pin", () => {
  const publicKey = readFileSync(
    join(
      process.cwd(),
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_PATH,
    ),
  );
  assert.equal(
    sourceRegistrationAuthorizationSha256(publicKey),
    SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256,
  );
});

test("production wrapper loads the pinned key and redacts a missing private path", () => {
  const privatePath = "/tmp/source-registration-authorization-does-not-exist";
  assert.throws(
    () =>
      verifySourceRegistrationReleaseAuthorization({
        authorizationPath: privatePath,
        expected: {
          publicKeyFileSha256:
            SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256,
        },
      }),
    (error: unknown) =>
      error instanceof Error &&
      /authorization envelope is missing or unreadable/.test(error.message) &&
      !error.message.includes(privatePath),
  );
});

test("production wrapper requires an outside-repository exact private mode", () => {
  const repositoryRoot = realpathSync(process.cwd());
  const insidePath = join(
    repositoryRoot,
    ".source-registration-auth-test.json",
  );
  const outsideRoot = realpathSync(
    mkdtempSync(join(tmpdir(), "source-registration-auth-mode-")),
  );
  const unsafeModePath = join(outsideRoot, "authorization.json");
  try {
    writeFileSync(insidePath, "{}\n", { mode: 0o600 });
    assert.throws(
      () =>
        verifySourceRegistrationReleaseAuthorization({
          authorizationPath: insidePath,
          expected: {},
        }),
      /canonical and outside the repository/,
    );
    writeFileSync(unsafeModePath, "{}\n", { mode: 0o600 });
    chmodSync(unsafeModePath, 0o700);
    assert.throws(
      () =>
        verifySourceRegistrationReleaseAuthorization({
          authorizationPath: unsafeModePath,
          expected: {
            publicKeyFileSha256:
              SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256,
          },
        }),
      /private mode-0600-or-0400 regular single-link file/,
    );
  } finally {
    rmSync(insidePath, { force: true });
    rmSync(outsideRoot, { force: true, recursive: true });
  }
});

test("tracked JSON Schema accepts the signed shape and rejects extra fields", () => {
  const schema = JSON.parse(
    readFileSync(
      join(
        process.cwd(),
        "knowledge/schema/source-registration-release-authorization.schema.v1.json",
      ),
      "utf8",
    ),
  );
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
    schema,
  );
  const parsed = JSON.parse(signedFixture().envelope.toString("utf8"));
  parsed.keyId = SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_KEY_ID;
  assert.equal(validate(parsed), true, JSON.stringify(validate.errors));
  parsed.body.unexpected = true;
  assert.equal(validate(parsed), false);
});
