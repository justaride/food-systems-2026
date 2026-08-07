import { createHash } from "node:crypto";

import { z } from "zod";

export const SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION =
  "source-acquisition-receipt-v1" as const;
export const SOURCE_ACQUISITION_RECEIPT_VERSION = "1.0.0" as const;
export const SOURCE_ACQUISITION_RECEIPT_HASH_DOMAIN =
  "food-systems-2026:source-acquisition-receipt:v1\0" as const;

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;
const DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const PRIVATE_LOCATOR_PATTERN = /^private:\/\/[a-z0-9][a-z0-9._:/-]*$/;
const PORTABLE_PATH_PATTERN = /^[a-z0-9][a-zA-Z0-9._/-]*$/;

const sha256Schema = z.string().regex(HASH_PATTERN);
const identifierSchema = z.string().regex(IDENTIFIER_PATTERN);
const versionSchema = z.string().regex(VERSION_PATTERN);
const dateTimeSchema = z
  .string()
  .regex(DATE_TIME_PATTERN)
  .refine(
    (value) => Number.isFinite(Date.parse(value)),
    "Expected an ISO 8601 date-time with an explicit UTC offset",
  );
const httpsLocatorSchema = z
  .string()
  .url()
  .startsWith("https://")
  .superRefine((value, context) => {
    const url = new URL(value);
    if (url.username || url.password || url.hash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "HTTPS locators cannot contain credentials or fragments",
      });
    }
  });
const privateLocatorSchema = z.string().regex(PRIVATE_LOCATOR_PATTERN);
const portablePathSchema = z
  .string()
  .regex(PORTABLE_PATH_PATTERN)
  .superRefine((value, context) => {
    if (
      value.startsWith("/") ||
      value.includes("\\") ||
      value
        .split("/")
        .some(
          (segment) => segment === "" || segment === "." || segment === "..",
        )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Expected a normalized portable relative path without traversal",
      });
    }
  });

const toolBindingSchema = z
  .object({
    name: z.string().min(1).max(200),
    version: z.string().min(1).max(200),
    workflowRef: z.string().min(1).max(500),
    workflowVersion: versionSchema,
  })
  .strict();

const receiptCore = {
  schemaVersion: z.literal(SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION),
  artifactType: z.literal("source_acquisition_receipt"),
  receiptId: identifierSchema,
  receiptVersion: versionSchema,
  sourceId: identifierSchema,
  tool: toolBindingSchema,
  startedAt: dateTimeSchema,
  completedAt: dateTimeSchema,
  receiptSha256: sha256Schema,
};

const redirectHopSchema = z
  .object({
    sequence: z.number().int().nonnegative(),
    status: z.union([
      z.literal(301),
      z.literal(302),
      z.literal(303),
      z.literal(307),
      z.literal(308),
    ]),
    fromLocator: httpsLocatorSchema,
    toLocator: httpsLocatorSchema,
    observedAt: dateTimeSchema,
  })
  .strict();

const controlledHttpsFetchReceiptSchema = z
  .object({
    ...receiptCore,
    acquisitionType: z.literal("controlled_https_fetch"),
    requestedLocator: httpsLocatorSchema,
    finalLocator: httpsLocatorSchema,
    request: z
      .object({
        method: z.literal("GET"),
        redirectMode: z.literal("manual"),
        credentialsMode: z.literal("omit"),
        maximumRedirects: z.number().int().min(0).max(10),
      })
      .strict(),
    redirectChain: z.array(redirectHopSchema).max(10),
    response: z
      .object({
        status: z.number().int().min(200).max(299),
        contentType: z
          .string()
          .regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/),
        contentLengthBytes: z.number().int().nonnegative().nullable(),
        bodySizeBytes: z.number().int().positive(),
        bodySha256: sha256Schema,
        observedAt: dateTimeSchema,
      })
      .strict(),
  })
  .strict();

const privateCopyAttestationCore = {
  storageRootId: identifierSchema,
  storageClass: identifierSchema,
  locator: privateLocatorSchema,
  portablePath: portablePathSchema,
  contentSha256: sha256Schema,
  sizeBytes: z.number().int().positive(),
  fileMode: z.literal("0400"),
  verifiedAt: dateTimeSchema,
};

const primaryCopyAttestationSchema = z
  .object({
    copyId: z.literal("primary"),
    ...privateCopyAttestationCore,
  })
  .strict();

const replicaCopyAttestationSchema = z
  .object({
    copyId: z.literal("replica"),
    ...privateCopyAttestationCore,
  })
  .strict();

const controlledPrivateAccessReceiptSchema = z
  .object({
    ...receiptCore,
    acquisitionType: z.literal("controlled_private_access"),
    requestedLocator: privateLocatorSchema,
    finalLocator: privateLocatorSchema,
    recoveryManifest: z
      .object({
        manifestId: identifierSchema,
        manifestVersion: versionSchema,
        manifestPath: portablePathSchema,
        manifestFileSha256: sha256Schema,
        manifestReceiptSha256: sha256Schema,
        entryId: identifierSchema,
        entryPath: portablePathSchema,
        entryLocator: privateLocatorSchema,
        entryContentSha256: sha256Schema,
        entrySizeBytes: z.number().int().positive(),
      })
      .strict(),
    content: z
      .object({
        sizeBytes: z.number().int().positive(),
        sha256: sha256Schema,
      })
      .strict(),
    copyAttestations: z.tuple([
      primaryCopyAttestationSchema,
      replicaCopyAttestationSchema,
    ]),
    twoCopyAttestation: z
      .object({
        requiredCopyCount: z.literal(2),
        distinctStorageRoots: z.literal(true),
        distinctFiles: z.literal(true),
        contentHashesMatch: z.literal(true),
        sizesMatch: z.literal(true),
      })
      .strict(),
  })
  .strict();

export const sourceAcquisitionReceiptStructuralSchema = z.discriminatedUnion(
  "acquisitionType",
  [controlledHttpsFetchReceiptSchema, controlledPrivateAccessReceiptSchema],
);

export type SourceAcquisitionReceipt = z.infer<
  typeof sourceAcquisitionReceiptStructuralSchema
>;
export type ControlledHttpsFetchReceipt = z.infer<
  typeof controlledHttpsFetchReceiptSchema
>;
export type ControlledPrivateAccessReceipt = z.infer<
  typeof controlledPrivateAccessReceiptSchema
>;
export type UnsealedSourceAcquisitionReceipt =
  | Omit<ControlledHttpsFetchReceipt, "receiptSha256">
  | Omit<ControlledPrivateAccessReceipt, "receiptSha256">;

export type SourceAcquisitionJsonValue =
  | null
  | boolean
  | number
  | string
  | SourceAcquisitionJsonValue[]
  | { [key: string]: SourceAcquisitionJsonValue };

function fail(message: string): never {
  throw new Error(`Source-acquisition receipt failed: ${message}`);
}

export function canonicalSourceAcquisitionJson(
  value: SourceAcquisitionJsonValue,
): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalSourceAcquisitionJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalSourceAcquisitionJson(value[key] as SourceAcquisitionJsonValue)}`,
    )
    .join(",")}}`;
}

export function sourceAcquisitionSha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function hashSourceAcquisitionReceipt(
  value: UnsealedSourceAcquisitionReceipt,
): string {
  const canonical = canonicalSourceAcquisitionJson(
    value as SourceAcquisitionJsonValue,
  );
  return sourceAcquisitionSha256(
    `${SOURCE_ACQUISITION_RECEIPT_HASH_DOMAIN}${canonical}`,
  );
}

function validateChronology(receipt: SourceAcquisitionReceipt): void {
  const startedAt = Date.parse(receipt.startedAt);
  const completedAt = Date.parse(receipt.completedAt);
  if (startedAt > completedAt) fail("receipt completes before it starts");

  const observations =
    receipt.acquisitionType === "controlled_https_fetch"
      ? [
          ...receipt.redirectChain.map((hop) => hop.observedAt),
          receipt.response.observedAt,
        ]
      : receipt.copyAttestations.map((copy) => copy.verifiedAt);
  let previous = startedAt;
  for (const [index, observedAt] of observations.entries()) {
    const observed = Date.parse(observedAt);
    if (observed < previous || observed > completedAt) {
      fail(`observation ${index} falls outside the ordered receipt window`);
    }
    previous = observed;
  }
}

function validateHttpsReceipt(receipt: ControlledHttpsFetchReceipt): void {
  if (receipt.redirectChain.length > receipt.request.maximumRedirects) {
    fail("redirect chain exceeds the declared maximum");
  }
  let expectedFrom = receipt.requestedLocator;
  receipt.redirectChain.forEach((hop, index) => {
    if (hop.sequence !== index)
      fail("redirect sequence must start at zero and be contiguous");
    if (hop.fromLocator !== expectedFrom)
      fail("redirect chain is not contiguous");
    expectedFrom = hop.toLocator;
  });
  if (
    receipt.redirectChain.length === 0 &&
    receipt.requestedLocator !== receipt.finalLocator
  ) {
    fail("a changed final locator requires an explicit redirect chain");
  }
  if (expectedFrom !== receipt.finalLocator) {
    fail("final locator does not match the end of the redirect chain");
  }
  if (
    receipt.response.contentLengthBytes !== null &&
    receipt.response.contentLengthBytes !== receipt.response.bodySizeBytes
  ) {
    fail("HTTP Content-Length does not match the observed body size");
  }
}

function validatePrivateReceipt(receipt: ControlledPrivateAccessReceipt): void {
  if (
    receipt.requestedLocator !== receipt.finalLocator ||
    receipt.finalLocator !== receipt.recoveryManifest.entryLocator
  ) {
    fail(
      "private locator must match the exact recovery-manifest entry locator",
    );
  }
  if (
    receipt.recoveryManifest.entryContentSha256 !== receipt.content.sha256 ||
    receipt.recoveryManifest.entrySizeBytes !== receipt.content.sizeBytes
  ) {
    fail("recovery-manifest entry does not bind the exact private content");
  }
  const [primary, replica] = receipt.copyAttestations;
  if (
    primary.storageRootId === replica.storageRootId ||
    primary.locator === replica.locator
  ) {
    fail(
      "primary and replica attestations must name distinct roots and locators",
    );
  }
  for (const copy of receipt.copyAttestations) {
    if (
      copy.contentSha256 !== receipt.content.sha256 ||
      copy.sizeBytes !== receipt.content.sizeBytes
    ) {
      fail(
        `${copy.copyId} attestation does not bind the exact private content`,
      );
    }
  }
}

export function validateSourceAcquisitionReceipt(
  value: unknown,
): SourceAcquisitionReceipt {
  const parsed = sourceAcquisitionReceiptStructuralSchema.safeParse(value);
  if (!parsed.success) {
    fail(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  }
  const receipt = parsed.data;
  validateChronology(receipt);
  if (receipt.acquisitionType === "controlled_https_fetch")
    validateHttpsReceipt(receipt);
  else validatePrivateReceipt(receipt);

  const { receiptSha256, ...body } = receipt;
  const expectedReceiptSha256 = hashSourceAcquisitionReceipt(body);
  if (receiptSha256 !== expectedReceiptSha256) {
    fail(
      "receipt hash does not match the domain-separated canonical receipt body",
    );
  }
  return receipt;
}

export function sealSourceAcquisitionReceipt(
  value: UnsealedSourceAcquisitionReceipt,
): SourceAcquisitionReceipt {
  return validateSourceAcquisitionReceipt({
    ...value,
    receiptSha256: hashSourceAcquisitionReceipt(value),
  });
}

export function sourceAcquisitionContent(receipt: SourceAcquisitionReceipt): {
  sha256: string;
  sizeBytes: number;
} {
  if (receipt.acquisitionType === "controlled_https_fetch") {
    return {
      sha256: receipt.response.bodySha256,
      sizeBytes: receipt.response.bodySizeBytes,
    };
  }
  return receipt.content;
}
