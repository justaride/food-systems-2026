import {
  SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
  SOURCE_ACQUISITION_RECEIPT_VERSION,
  sealSourceAcquisitionReceipt,
  sourceAcquisitionSha256,
  type ControlledHttpsFetchReceipt,
} from "../../src/lib/knowledge/source-acquisition-receipt";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export type ControlledFetchRequest = {
  url: string;
  method: "GET";
  redirect: "manual";
  credentials: "omit";
};

export type ControlledFetchResponse = {
  status: number;
  headers: Readonly<Record<string, string | undefined>>;
  body: Buffer;
  observedAt: string;
};

export type InjectedControlledFetch = (
  request: ControlledFetchRequest,
) => Promise<ControlledFetchResponse>;

export type ControlledHttpsFetchInput = {
  receiptId: string;
  sourceId: string;
  requestedLocator: string;
  tool: {
    name: string;
    version: string;
    workflowRef: string;
    workflowVersion: string;
  };
  startedAt: string;
  maximumRedirects?: number;
  maximumBodySizeBytes?: number;
  fetch: InjectedControlledFetch;
  completedAt: () => string;
};

export type ControlledHttpsFetchResult = {
  receipt: ControlledHttpsFetchReceipt;
  bodyBytes: Buffer;
};

function fail(message: string): never {
  throw new Error(`Controlled source fetch failed: ${message}`);
}

function controlledHttpsLocator(value: string, base?: string): string {
  let locator: URL;
  try {
    locator = base ? new URL(value, base) : new URL(value);
  } catch {
    fail(`invalid locator: ${value}`);
  }
  if (locator.protocol !== "https:")
    fail(`non-HTTPS locator is forbidden: ${locator.href}`);
  if (locator.username || locator.password || locator.hash) {
    fail(`locator credentials or fragments are forbidden: ${locator.href}`);
  }
  return locator.href;
}

function header(
  headers: Readonly<Record<string, string | undefined>>,
  name: string,
): string | null {
  const exact = headers[name];
  if (exact !== undefined) return exact.trim();
  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return entry?.[1]?.trim() ?? null;
}

function normalizedContentType(value: string | null): string {
  const mediaType = value?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(mediaType)) {
    fail("final response is missing a valid Content-Type");
  }
  return mediaType;
}

function contentLength(value: string | null): number | null {
  if (value === null) return null;
  if (!/^\d+$/.test(value))
    fail("Content-Length is not a non-negative integer");
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed))
    fail("Content-Length exceeds safe integer range");
  return parsed;
}

export async function generateControlledHttpsFetchReceipt(
  input: ControlledHttpsFetchInput,
): Promise<ControlledHttpsFetchResult> {
  const requestedLocator = controlledHttpsLocator(input.requestedLocator);
  const maximumRedirects = input.maximumRedirects ?? 5;
  if (
    !Number.isInteger(maximumRedirects) ||
    maximumRedirects < 0 ||
    maximumRedirects > 10
  ) {
    fail("maximumRedirects must be an integer from 0 through 10");
  }
  const maximumBodySizeBytes = input.maximumBodySizeBytes ?? 100 * 1024 * 1024;
  if (!Number.isSafeInteger(maximumBodySizeBytes) || maximumBodySizeBytes < 1) {
    fail("maximumBodySizeBytes must be a positive safe integer");
  }

  const redirectChain: ControlledHttpsFetchReceipt["redirectChain"] = [];
  let currentLocator = requestedLocator;
  let finalResponse: ControlledFetchResponse | null = null;
  while (finalResponse === null) {
    const response = await input.fetch({
      url: currentLocator,
      method: "GET",
      redirect: "manual",
      credentials: "omit",
    });
    if (!Buffer.isBuffer(response.body))
      fail("injected fetch must return body bytes as Buffer");
    if (!Number.isFinite(Date.parse(response.observedAt))) {
      fail("injected fetch returned an invalid observedAt timestamp");
    }
    if (REDIRECT_STATUSES.has(response.status)) {
      if (redirectChain.length >= maximumRedirects)
        fail("redirect limit exceeded");
      const location = header(response.headers, "location");
      if (!location) fail(`redirect ${response.status} is missing Location`);
      const nextLocator = controlledHttpsLocator(location, currentLocator);
      redirectChain.push({
        sequence: redirectChain.length,
        status: response.status as 301 | 302 | 303 | 307 | 308,
        fromLocator: currentLocator,
        toLocator: nextLocator,
        observedAt: response.observedAt,
      });
      currentLocator = nextLocator;
      continue;
    }
    finalResponse = response;
  }

  if (finalResponse.status < 200 || finalResponse.status > 299) {
    fail(`final HTTP status is not successful: ${finalResponse.status}`);
  }
  if (finalResponse.body.length < 1) fail("final response body is empty");
  if (finalResponse.body.length > maximumBodySizeBytes) {
    fail("final response body exceeds maximumBodySizeBytes");
  }
  const observedContentLength = contentLength(
    header(finalResponse.headers, "content-length"),
  );
  if (
    observedContentLength !== null &&
    observedContentLength !== finalResponse.body.length
  ) {
    fail("Content-Length does not match the observed response body");
  }

  const receipt = sealSourceAcquisitionReceipt({
    schemaVersion: SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
    artifactType: "source_acquisition_receipt",
    receiptId: input.receiptId,
    receiptVersion: SOURCE_ACQUISITION_RECEIPT_VERSION,
    sourceId: input.sourceId,
    acquisitionType: "controlled_https_fetch",
    requestedLocator,
    finalLocator: currentLocator,
    request: {
      method: "GET",
      redirectMode: "manual",
      credentialsMode: "omit",
      maximumRedirects,
    },
    redirectChain,
    response: {
      status: finalResponse.status,
      contentType: normalizedContentType(
        header(finalResponse.headers, "content-type"),
      ),
      contentLengthBytes: observedContentLength,
      bodySizeBytes: finalResponse.body.length,
      bodySha256: sourceAcquisitionSha256(finalResponse.body),
      observedAt: finalResponse.observedAt,
    },
    tool: input.tool,
    startedAt: input.startedAt,
    completedAt: input.completedAt(),
  });
  if (receipt.acquisitionType !== "controlled_https_fetch") {
    fail("internal receipt variant mismatch");
  }
  return { receipt, bodyBytes: Buffer.from(finalResponse.body) };
}
