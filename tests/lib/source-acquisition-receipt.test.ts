import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  generateControlledHttpsFetchReceipt,
  type ControlledFetchRequest,
} from "../../scripts/knowledge/generate-source-acquisition-receipt";

import {
  SOURCE_ACQUISITION_RECEIPT_HASH_DOMAIN,
  SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
  SOURCE_ACQUISITION_RECEIPT_VERSION,
  sealSourceAcquisitionReceipt,
  sourceAcquisitionReceiptStructuralSchema,
  sourceAcquisitionSha256,
  validateSourceAcquisitionReceipt,
  type ControlledHttpsFetchReceipt,
  type ControlledPrivateAccessReceipt,
  type UnsealedSourceAcquisitionReceipt,
} from "../../src/lib/knowledge/source-acquisition-receipt";

const jsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/source-acquisition-receipt.schema.v1.json",
    "utf8",
  ),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateJsonSchema = ajv.compile(jsonSchema);

const HASH = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .map((character) => [
      character,
      sourceAcquisitionSha256(`acquisition-fixture-${character}`),
    ]),
) as Record<string, string>;

export function httpsAcquisitionReceiptFixture(): ControlledHttpsFetchReceipt {
  return sealSourceAcquisitionReceipt({
    schemaVersion: SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
    artifactType: "source_acquisition_receipt",
    receiptId: "receipt.source.acquisition.example.https",
    receiptVersion: SOURCE_ACQUISITION_RECEIPT_VERSION,
    sourceId: "source.example.report",
    acquisitionType: "controlled_https_fetch",
    requestedLocator: "https://authority.example/reports/example-2024",
    finalLocator: "https://authority.example/reports/example-2024.pdf",
    request: {
      method: "GET",
      redirectMode: "manual",
      credentialsMode: "omit",
      maximumRedirects: 5,
    },
    redirectChain: [
      {
        sequence: 0,
        status: 302,
        fromLocator: "https://authority.example/reports/example-2024",
        toLocator: "https://authority.example/reports/example-2024.pdf",
        observedAt: "2026-08-03T08:01:00Z",
      },
    ],
    response: {
      status: 200,
      contentType: "application/pdf",
      contentLengthBytes: 1_024,
      bodySizeBytes: 1_024,
      bodySha256: HASH.e!,
      observedAt: "2026-08-03T08:02:00Z",
    },
    tool: {
      name: "controlled-source-fetch",
      version: "1.0.0",
      workflowRef: "workflow.source.acquisition.https",
      workflowVersion: "1.0.0",
    },
    startedAt: "2026-08-03T08:00:00Z",
    completedAt: "2026-08-03T08:03:00Z",
  }) as ControlledHttpsFetchReceipt;
}

export function privateAcquisitionReceiptFixture(): ControlledPrivateAccessReceipt {
  return sealSourceAcquisitionReceipt({
    schemaVersion: SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
    artifactType: "source_acquisition_receipt",
    receiptId: "receipt.source.acquisition.example.private",
    receiptVersion: SOURCE_ACQUISITION_RECEIPT_VERSION,
    sourceId: "source.example.private",
    acquisitionType: "controlled_private_access",
    requestedLocator: "private://corpus/sha256/example-source",
    finalLocator: "private://corpus/sha256/example-source",
    recoveryManifest: {
      manifestId: "manifest.private.recovery.v1",
      manifestVersion: "1.0.0",
      manifestPath:
        "knowledge/corpus/corpus-private-recovery-candidates.v1.json",
      manifestFileSha256: HASH.a!,
      manifestReceiptSha256: HASH.b!,
      entryId: "recovery.entry.example",
      entryPath: "sha256/example-source.pdf",
      entryLocator: "private://corpus/sha256/example-source",
      entryContentSha256: HASH.e!,
      entrySizeBytes: 1_024,
    },
    content: {
      sizeBytes: 1_024,
      sha256: HASH.e!,
    },
    copyAttestations: [
      {
        copyId: "primary",
        storageRootId: "storage.private.primary",
        storageClass: "private_primary",
        locator: "private://primary/sha256/example-source",
        portablePath: "sha256/example-source.pdf",
        contentSha256: HASH.e!,
        sizeBytes: 1_024,
        fileMode: "0400",
        verifiedAt: "2026-08-03T08:01:00Z",
      },
      {
        copyId: "replica",
        storageRootId: "storage.bigbrain.replica",
        storageClass: "bigbrain_private_replica",
        locator: "private://replica/sha256/example-source",
        portablePath: "sha256/example-source.pdf",
        contentSha256: HASH.e!,
        sizeBytes: 1_024,
        fileMode: "0400",
        verifiedAt: "2026-08-03T08:02:00Z",
      },
    ],
    twoCopyAttestation: {
      requiredCopyCount: 2,
      distinctStorageRoots: true,
      distinctFiles: true,
      contentHashesMatch: true,
      sizesMatch: true,
    },
    tool: {
      name: "controlled-private-verifier",
      version: "1.0.0",
      workflowRef: "workflow.source.acquisition.private",
      workflowVersion: "1.0.0",
    },
    startedAt: "2026-08-03T08:00:00Z",
    completedAt: "2026-08-03T08:03:00Z",
  }) as ControlledPrivateAccessReceipt;
}

function assertStructuralParity(value: unknown, expected: boolean): void {
  assert.equal(
    sourceAcquisitionReceiptStructuralSchema.safeParse(value).success,
    expected,
  );
  assert.equal(
    Boolean(validateJsonSchema(value)),
    expected,
    JSON.stringify(validateJsonSchema.errors),
  );
}

function resealAcquisition<
  T extends ControlledHttpsFetchReceipt | ControlledPrivateAccessReceipt,
>(receipt: T): T {
  const { receiptSha256: _oldSeal, ...body } = receipt;
  return sealSourceAcquisitionReceipt(
    body as UnsealedSourceAcquisitionReceipt,
  ) as T;
}

test("HTTPS and controlled-private receipts have Zod and JSON Schema parity", () => {
  const https = httpsAcquisitionReceiptFixture();
  const privateReceipt = privateAcquisitionReceiptFixture();
  assertStructuralParity(https, true);
  assertStructuralParity(privateReceipt, true);
  assert.doesNotThrow(() => validateSourceAcquisitionReceipt(https));
  assert.doesNotThrow(() => validateSourceAcquisitionReceipt(privateReceipt));

  const unknown = structuredClone(https) as unknown as Record<string, unknown>;
  unknown.untrackedProof = true;
  assertStructuralParity(unknown, false);
});

test("uses a domain-separated self-hash and rejects resealing by field replacement", () => {
  assert.match(
    SOURCE_ACQUISITION_RECEIPT_HASH_DOMAIN,
    /source-acquisition-receipt:v1\0$/,
  );
  const receipt = httpsAcquisitionReceiptFixture();
  const drifted = structuredClone(receipt);
  drifted.response.bodySha256 = HASH.z!;
  assert.throws(
    () => validateSourceAcquisitionReceipt(drifted),
    /domain-separated canonical receipt body/,
  );
});

test("rejects incomplete, reordered and non-HTTPS redirect chains", () => {
  const missingHop = structuredClone(httpsAcquisitionReceiptFixture());
  missingHop.redirectChain = [];
  assert.throws(
    () => resealAcquisition(missingHop),
    /changed final locator requires an explicit redirect chain/,
  );

  const wrongSequence = structuredClone(httpsAcquisitionReceiptFixture());
  wrongSequence.redirectChain[0]!.sequence = 1;
  assert.throws(
    () => resealAcquisition(wrongSequence),
    /redirect sequence must start at zero/,
  );

  const downgrade = structuredClone(
    httpsAcquisitionReceiptFixture(),
  ) as unknown as Record<string, unknown>;
  const redirects = downgrade.redirectChain as Array<Record<string, unknown>>;
  redirects[0]!.toLocator = "http://authority.example/report.pdf";
  assertStructuralParity(downgrade, false);

  const credentials = structuredClone(
    httpsAcquisitionReceiptFixture(),
  ) as unknown as Record<string, unknown>;
  credentials.requestedLocator =
    "https://username:password@authority.example/report.pdf";
  assertStructuralParity(credentials, false);
});

test("rejects mismatched HTTP size, chronology and response status", () => {
  const wrongLength = structuredClone(httpsAcquisitionReceiptFixture());
  wrongLength.response.contentLengthBytes = 1_025;
  assert.throws(
    () => resealAcquisition(wrongLength),
    /Content-Length does not match/,
  );

  const timeTravel = structuredClone(httpsAcquisitionReceiptFixture());
  timeTravel.redirectChain[0]!.observedAt = "2026-08-03T07:59:00Z";
  assert.throws(
    () => resealAcquisition(timeTravel),
    /outside the ordered receipt window/,
  );

  const errorPage = structuredClone(
    httpsAcquisitionReceiptFixture(),
  ) as unknown as Record<string, unknown>;
  const response = errorPage.response as Record<string, unknown>;
  response.status = 404;
  assertStructuralParity(errorPage, false);
});

test("private receipt rejects manifest drift and fake two-copy attestations", () => {
  const manifestDrift = structuredClone(privateAcquisitionReceiptFixture());
  manifestDrift.recoveryManifest.entryContentSha256 = HASH.z!;
  assert.throws(
    () => resealAcquisition(manifestDrift),
    /recovery-manifest entry does not bind/,
  );

  const sameRoot = structuredClone(privateAcquisitionReceiptFixture());
  sameRoot.copyAttestations[1].storageRootId =
    sameRoot.copyAttestations[0].storageRootId;
  assert.throws(
    () => resealAcquisition(sameRoot),
    /distinct roots and locators/,
  );

  const replicaDrift = structuredClone(privateAcquisitionReceiptFixture());
  replicaDrift.copyAttestations[1].contentSha256 = HASH.z!;
  assert.throws(
    () => resealAcquisition(replicaDrift),
    /replica attestation does not bind/,
  );
});

test("private receipt rejects traversal and missing replica structurally", () => {
  const traversal = structuredClone(
    privateAcquisitionReceiptFixture(),
  ) as unknown as Record<string, unknown>;
  const manifest = traversal.recoveryManifest as Record<string, unknown>;
  manifest.entryPath = "../outside.pdf";
  assertStructuralParity(traversal, false);

  const missingReplica = structuredClone(
    privateAcquisitionReceiptFixture(),
  ) as unknown as Record<string, unknown>;
  const copies = missingReplica.copyAttestations as unknown[];
  copies.pop();
  assertStructuralParity(missingReplica, false);
});

test("controlled fetch generator uses only injected manual fetch and records redirects", async () => {
  const requests: ControlledFetchRequest[] = [];
  const responses = [
    {
      status: 302,
      headers: { location: "/reports/example.pdf" },
      body: Buffer.alloc(0),
      observedAt: "2026-08-03T08:01:00Z",
    },
    {
      status: 200,
      headers: {
        "content-type": "application/pdf; charset=binary",
        "content-length": "4",
      },
      body: Buffer.from("PDF!"),
      observedAt: "2026-08-03T08:02:00Z",
    },
  ];
  const generated = await generateControlledHttpsFetchReceipt({
    receiptId: "receipt.generated.example",
    sourceId: "source.example.generated",
    requestedLocator: "https://authority.example/reports/example",
    tool: {
      name: "controlled-source-fetch",
      version: "1.0.0",
      workflowRef: "workflow.source.acquisition.https",
      workflowVersion: "1.0.0",
    },
    startedAt: "2026-08-03T08:00:00Z",
    completedAt: () => "2026-08-03T08:03:00Z",
    fetch: async (request) => {
      requests.push(request);
      const response = responses.shift();
      assert.ok(response);
      return response;
    },
  });
  assert.deepEqual(requests, [
    {
      url: "https://authority.example/reports/example",
      method: "GET",
      redirect: "manual",
      credentials: "omit",
    },
    {
      url: "https://authority.example/reports/example.pdf",
      method: "GET",
      redirect: "manual",
      credentials: "omit",
    },
  ]);
  assert.equal(generated.receipt.finalLocator, requests[1]!.url);
  assert.equal(generated.receipt.redirectChain.length, 1);
  assert.equal(generated.receipt.response.contentType, "application/pdf");
  assert.equal(
    generated.receipt.response.bodySha256,
    sourceAcquisitionSha256("PDF!"),
  );
  assert.deepEqual(generated.bodyBytes, Buffer.from("PDF!"));
  assert.doesNotThrow(() =>
    validateSourceAcquisitionReceipt(generated.receipt),
  );
});

test("controlled fetch generator fails closed on downgrade, bad length and HTTP errors", async () => {
  const base = {
    receiptId: "receipt.generated.negative",
    sourceId: "source.example.negative",
    requestedLocator: "https://authority.example/report",
    tool: {
      name: "controlled-source-fetch",
      version: "1.0.0",
      workflowRef: "workflow.source.acquisition.https",
      workflowVersion: "1.0.0",
    },
    startedAt: "2026-08-03T08:00:00Z",
    completedAt: () => "2026-08-03T08:03:00Z",
  } as const;

  await assert.rejects(
    generateControlledHttpsFetchReceipt({
      ...base,
      fetch: async () => ({
        status: 302,
        headers: { location: "http://authority.example/report.pdf" },
        body: Buffer.alloc(0),
        observedAt: "2026-08-03T08:01:00Z",
      }),
    }),
    /non-HTTPS locator is forbidden/,
  );

  await assert.rejects(
    generateControlledHttpsFetchReceipt({
      ...base,
      fetch: async () => ({
        status: 200,
        headers: { "content-type": "application/pdf", "content-length": "9" },
        body: Buffer.from("PDF!"),
        observedAt: "2026-08-03T08:02:00Z",
      }),
    }),
    /Content-Length does not match/,
  );

  await assert.rejects(
    generateControlledHttpsFetchReceipt({
      ...base,
      fetch: async () => ({
        status: 404,
        headers: { "content-type": "text/html" },
        body: Buffer.from("not found"),
        observedAt: "2026-08-03T08:02:00Z",
      }),
    }),
    /final HTTP status is not successful/,
  );
});
