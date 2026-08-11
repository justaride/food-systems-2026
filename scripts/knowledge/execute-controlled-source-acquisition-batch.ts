import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { request } from "node:https";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

import {
  generateControlledHttpsFetchReceipt,
  type ControlledFetchRequest,
  type ControlledFetchResponse,
} from "./generate-source-acquisition-receipt";
import {
  sourceAcquisitionSha256,
  validateSourceAcquisitionReceipt,
} from "../../src/lib/knowledge/source-acquisition-receipt";

type BatchSource = {
  receiptId: string;
  sourceId: string;
  requestedLocator: string;
  expectedBodySha256: string;
  expectedBodySizeBytes: number;
  archivePortablePath: string;
  archiveMode: "require_existing" | "create_new";
  receiptPath: string;
  transport?: "node_https1" | "curl_http2";
};

type BatchManifest = {
  schemaVersion: "1.0.0";
  batchId: string;
  purpose: string;
  tool: {
    name: string;
    version: string;
    workflowRef: string;
    workflowVersion: string;
  };
  sources: BatchSource[];
};

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const PORTABLE_PATH_PATTERN = /^[a-z0-9][a-zA-Z0-9._/-]*$/;
const RECEIPT_PATH_PATTERN =
  /^knowledge\/corpus\/source-acquisition-receipts\/receipts\/[a-z0-9][a-z0-9._-]*\.json$/;
const execFileAsync = promisify(execFile);

function fail(message: string): never {
  throw new Error(`Controlled acquisition batch failed: ${message}`);
}

function argument(name: string): string | null {
  const prefix = `--${name}=`;
  return (
    process.argv
      .slice(2)
      .find((value) => value.startsWith(prefix))
      ?.slice(prefix.length) ?? null
  );
}

function requireArgument(name: string): string {
  const value = argument(name);
  if (!value) fail(`missing --${name}=...`);
  return value;
}

function validatePortablePath(value: string, label: string): void {
  if (
    !PORTABLE_PATH_PATTERN.test(value) ||
    value.startsWith("/") ||
    value.includes("\\") ||
    value
      .split("/")
      .some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    fail(`${label} is not a normalized portable relative path`);
  }
}

function parseManifest(path: string): BatchManifest {
  const value = JSON.parse(readFileSync(path, "utf8")) as BatchManifest;
  if (
    value.schemaVersion !== "1.0.0" ||
    !IDENTIFIER_PATTERN.test(value.batchId) ||
    typeof value.purpose !== "string" ||
    value.purpose.length < 1 ||
    !Array.isArray(value.sources) ||
    value.sources.length < 1
  ) {
    fail("batch manifest header is invalid");
  }
  const receiptIds = new Set<string>();
  const receiptPaths = new Set<string>();
  for (const [index, source] of value.sources.entries()) {
    const label = `sources[${index}]`;
    if (
      !IDENTIFIER_PATTERN.test(source.receiptId) ||
      !IDENTIFIER_PATTERN.test(source.sourceId)
    ) {
      fail(`${label} has an invalid receiptId or sourceId`);
    }
    let locator: URL;
    try {
      locator = new URL(source.requestedLocator);
    } catch {
      fail(`${label}.requestedLocator is invalid`);
    }
    if (
      locator.protocol !== "https:" ||
      locator.username ||
      locator.password ||
      locator.hash
    ) {
      fail(`${label}.requestedLocator must be credential-free HTTPS`);
    }
    if (
      !SHA256_PATTERN.test(source.expectedBodySha256) ||
      !Number.isSafeInteger(source.expectedBodySizeBytes) ||
      source.expectedBodySizeBytes < 1
    ) {
      fail(`${label} has an invalid expected body binding`);
    }
    validatePortablePath(
      source.archivePortablePath,
      `${label}.archivePortablePath`,
    );
    if (
      source.archiveMode !== "require_existing" &&
      source.archiveMode !== "create_new"
    ) {
      fail(`${label}.archiveMode is not supported`);
    }
    if (!RECEIPT_PATH_PATTERN.test(source.receiptPath)) {
      fail(`${label}.receiptPath is outside the controlled receipt directory`);
    }
    if (
      source.transport !== undefined &&
      source.transport !== "node_https1" &&
      source.transport !== "curl_http2"
    ) {
      fail(`${label}.transport is not supported`);
    }
    if (
      receiptIds.has(source.receiptId) ||
      receiptPaths.has(source.receiptPath)
    ) {
      fail(`${label} duplicates a receipt ID or path`);
    }
    receiptIds.add(source.receiptId);
    receiptPaths.add(source.receiptPath);
  }
  return value;
}

function sha256(bytes: Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function assertRoot(
  root: string,
  label: string,
): {
  realpath: string;
  device: number;
  inode: number;
} {
  const realpath = realpathSync(root);
  const stat = statSync(realpath);
  if (!stat.isDirectory()) fail(`${label} is not a directory`);
  if ((stat.mode & 0o777) !== 0o700) fail(`${label} mode must be 0700`);
  return { realpath, device: stat.dev, inode: stat.ino };
}

function assertArchivedCopy(
  root: string,
  portablePath: string,
  expectedSha256: string,
  expectedSizeBytes: number,
  label: string,
): { realpath: string; device: number; inode: number } {
  const path = resolve(root, portablePath);
  const rootPrefix = `${resolve(root)}/`;
  if (!path.startsWith(rootPrefix)) fail(`${label} escaped its storage root`);
  const realpath = realpathSync(path);
  if (!realpath.startsWith(`${realpathSync(root)}/`)) {
    fail(`${label} resolves outside its storage root`);
  }
  const stat = statSync(realpath);
  if (!stat.isFile()) fail(`${label} is not a regular file`);
  if ((stat.mode & 0o777) !== 0o400) fail(`${label} mode must be 0400`);
  if (stat.size !== expectedSizeBytes) fail(`${label} size does not match`);
  const bytes = readFileSync(realpath);
  if (sha256(bytes) !== expectedSha256) fail(`${label} hash does not match`);
  return { realpath, device: stat.dev, inode: stat.ino };
}

function archivedCopyPath(root: string, portablePath: string): string {
  const path = resolve(root, portablePath);
  if (!path.startsWith(`${resolve(root)}/`)) {
    fail("archive path escaped its storage root");
  }
  return path;
}

function writeArchivedCopyExclusive(
  root: string,
  portablePath: string,
  bytes: Buffer,
  label: string,
): void {
  const path = archivedCopyPath(root, portablePath);
  const parent = dirname(path);
  mkdirSync(parent, { recursive: true, mode: 0o700 });
  const realParent = realpathSync(parent);
  if (!realParent.startsWith(`${realpathSync(root)}/`)) {
    fail(`${label} parent resolves outside its storage root`);
  }
  if ((statSync(realParent).mode & 0o777) !== 0o700) {
    fail(`${label} parent mode must be 0700`);
  }
  const descriptor = openSync(path, "wx", 0o400);
  try {
    writeFileSync(descriptor, bytes);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function responseHeaders(
  headers: NodeJS.Dict<string | string[]>,
): Readonly<Record<string, string | undefined>> {
  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [
      name,
      Array.isArray(value) ? value.join(", ") : value,
    ]),
  );
}

function controlledNodeHttpsFetch(
  input: ControlledFetchRequest,
): Promise<ControlledFetchResponse> {
  return new Promise((resolveResponse, rejectResponse) => {
    const requestStartedAt = new Date().toISOString();
    const networkRequest = request(
      input.url,
      {
        method: input.method,
        headers: {
          Accept: "application/pdf, application/octet-stream;q=0.9, */*;q=0.1",
          "Accept-Encoding": "identity",
          "User-Agent": "Food-Systems-2026-controlled-source-fetch/1.0",
        },
        timeout: 60_000,
      },
      (response) => {
        const chunks: Buffer[] = [];
        let sizeBytes = 0;
        response.on("data", (chunk: Buffer | string) => {
          const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          sizeBytes += bytes.length;
          if (sizeBytes > 100 * 1024 * 1024) {
            networkRequest.destroy(
              new Error("response exceeded the 100 MiB adapter limit"),
            );
            return;
          }
          chunks.push(bytes);
        });
        response.on("end", () => {
          resolveResponse({
            status: response.statusCode ?? 0,
            headers: responseHeaders(response.headers),
            body: Buffer.concat(chunks),
            observedAt: requestStartedAt,
          });
        });
      },
    );
    networkRequest.on("timeout", () => {
      networkRequest.destroy(new Error("request timed out"));
    });
    networkRequest.on("error", rejectResponse);
    networkRequest.end();
  });
}

function parseCurlHeaders(bytes: Buffer): {
  status: number;
  headers: Readonly<Record<string, string | undefined>>;
} {
  const text = bytes.toString("latin1");
  const blocks = text
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter((block) => /^HTTP\/\d(?:\.\d)?\s+\d{3}\b/i.test(block));
  const block = blocks.at(-1);
  if (!block) fail("curl did not emit a parseable HTTP response header");
  const lines = block.split(/\r?\n/);
  const statusMatch = lines[0]?.match(/^HTTP\/\S+\s+(\d{3})\b/i);
  if (!statusMatch) fail("curl response status is invalid");
  const headers: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const separator = line.indexOf(":");
    if (separator < 1) fail("curl response contains a malformed header");
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    headers[name] = headers[name] ? `${headers[name]}, ${value}` : value;
  }
  return { status: Number(statusMatch[1]), headers };
}

async function controlledCurlHttp2Fetch(
  input: ControlledFetchRequest,
): Promise<ControlledFetchResponse> {
  if (
    input.method !== "GET" ||
    input.redirect !== "manual" ||
    input.credentials !== "omit"
  ) {
    fail("curl adapter received a non-controlled request shape");
  }
  const requestStartedAt = new Date().toISOString();
  const temporaryDirectory = mkdtempSync(
    resolve(tmpdir(), "food-systems-controlled-curl."),
  );
  const headerPath = resolve(temporaryDirectory, "response.headers");
  const bodyPath = resolve(temporaryDirectory, "response.body");
  try {
    const result = await execFileAsync(
      "curl",
      [
        "--disable",
        "--config",
        "/dev/null",
        "--silent",
        "--show-error",
        "--http2",
        "--proto",
        "=https",
        "--request",
        "GET",
        "--connect-timeout",
        "30",
        "--max-time",
        "60",
        "--max-filesize",
        String(100 * 1024 * 1024),
        "--header",
        "Accept: application/pdf, application/octet-stream;q=0.9, */*;q=0.1",
        "--header",
        "Accept-Encoding: identity",
        "--user-agent",
        "Food-Systems-2026-controlled-source-fetch/1.0",
        "--dump-header",
        headerPath,
        "--output",
        bodyPath,
        "--write-out",
        "%{http_code}",
        "--url",
        input.url,
      ],
      { encoding: "utf8", maxBuffer: 1024 * 1024, timeout: 75_000 },
    );
    const parsed = parseCurlHeaders(readFileSync(headerPath));
    if (result.stdout.trim() !== String(parsed.status)) {
      fail("curl status output and response headers disagree");
    }
    return {
      status: parsed.status,
      headers: parsed.headers,
      body: readFileSync(bodyPath),
      observedAt: requestStartedAt,
    };
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

function writeExclusive(path: string, bytes: Buffer): void {
  mkdirSync(dirname(path), { recursive: true });
  const descriptor = openSync(path, "wx", 0o600);
  try {
    writeFileSync(descriptor, bytes);
  } finally {
    closeSync(descriptor);
  }
}

async function main(): Promise<void> {
  const checkOnly = process.argv.includes("--check-only");
  const executeNetwork = process.argv.includes("--execute-network");
  if (checkOnly && executeNetwork) {
    fail("--check-only and --execute-network are mutually exclusive");
  }
  if (!checkOnly && !executeNetwork) {
    fail("refusing network access without the explicit --execute-network gate");
  }
  const manifestPath = requireArgument("manifest");
  const primaryRoot = requireArgument("primary-root");
  const replicaRoot = requireArgument("replica-root");
  const manifest = parseManifest(manifestPath);
  const primary = assertRoot(primaryRoot, "primary root");
  const replica = assertRoot(replicaRoot, "replica root");
  if (
    primary.realpath === replica.realpath ||
    (primary.device === replica.device && primary.inode === replica.inode)
  ) {
    fail("primary and replica roots must be distinct directories");
  }
  for (const source of manifest.sources) {
    if (checkOnly) {
      if (!existsSync(source.receiptPath)) {
        fail(`missing expected receipt ${source.receiptPath}`);
      }
      const receiptBytes = readFileSync(source.receiptPath);
      let rawReceipt: unknown;
      try {
        rawReceipt = JSON.parse(receiptBytes.toString("utf8"));
      } catch {
        fail(`${source.receiptPath} is not valid UTF-8 JSON`);
      }
      const receipt = validateSourceAcquisitionReceipt(rawReceipt);
      if (
        receipt.acquisitionType !== "controlled_https_fetch" ||
        receipt.receiptId !== source.receiptId ||
        receipt.sourceId !== source.sourceId ||
        receipt.requestedLocator !== new URL(source.requestedLocator).href ||
        receipt.response.contentType !== "application/pdf" ||
        receipt.response.bodySha256 !== source.expectedBodySha256 ||
        receipt.response.bodySizeBytes !== source.expectedBodySizeBytes ||
        JSON.stringify(receipt.tool) !== JSON.stringify(manifest.tool)
      ) {
        fail(`${source.receiptPath} does not match its batch binding`);
      }
      const primaryCopy = assertArchivedCopy(
        primary.realpath,
        source.archivePortablePath,
        source.expectedBodySha256,
        source.expectedBodySizeBytes,
        `${source.sourceId} primary copy`,
      );
      const replicaCopy = assertArchivedCopy(
        replica.realpath,
        source.archivePortablePath,
        source.expectedBodySha256,
        source.expectedBodySizeBytes,
        `${source.sourceId} replica copy`,
      );
      if (
        primaryCopy.realpath === replicaCopy.realpath ||
        (primaryCopy.device === replicaCopy.device &&
          primaryCopy.inode === replicaCopy.inode)
      ) {
        fail(`${source.sourceId} archive copies are not distinct files`);
      }
      process.stdout.write(
        `${JSON.stringify({
          receiptId: receipt.receiptId,
          sourceId: receipt.sourceId,
          receiptPath: source.receiptPath,
          receiptFileSha256: sourceAcquisitionSha256(receiptBytes),
          receiptSha256: receipt.receiptSha256,
          bodySha256: receipt.response.bodySha256,
          bodySizeBytes: receipt.response.bodySizeBytes,
          archiveCopiesVerified: 2,
          state: "validated_existing",
        })}\n`,
      );
      continue;
    }
    if (existsSync(source.receiptPath)) {
      fail(`refusing to overwrite existing receipt ${source.receiptPath}`);
    }
    if (source.archiveMode === "require_existing") {
      assertArchivedCopy(
        primary.realpath,
        source.archivePortablePath,
        source.expectedBodySha256,
        source.expectedBodySizeBytes,
        `${source.sourceId} primary copy`,
      );
      assertArchivedCopy(
        replica.realpath,
        source.archivePortablePath,
        source.expectedBodySha256,
        source.expectedBodySizeBytes,
        `${source.sourceId} replica copy`,
      );
    } else if (
      existsSync(
        archivedCopyPath(primary.realpath, source.archivePortablePath),
      ) ||
      existsSync(archivedCopyPath(replica.realpath, source.archivePortablePath))
    ) {
      fail(`${source.sourceId} create_new refuses a pre-existing archive copy`);
    }
    const startedAt = new Date().toISOString();
    const generated = await generateControlledHttpsFetchReceipt({
      receiptId: source.receiptId,
      sourceId: source.sourceId,
      requestedLocator: source.requestedLocator,
      tool: manifest.tool,
      startedAt,
      maximumRedirects: 5,
      maximumBodySizeBytes: 100 * 1024 * 1024,
      fetch:
        source.transport === "curl_http2"
          ? controlledCurlHttp2Fetch
          : controlledNodeHttpsFetch,
      completedAt: () => new Date().toISOString(),
    });
    if (
      sourceAcquisitionSha256(generated.bodyBytes) !==
        source.expectedBodySha256 ||
      generated.bodyBytes.length !== source.expectedBodySizeBytes
    ) {
      fail(`${source.sourceId} fresh response differs from the expected bytes`);
    }
    if (source.archiveMode === "create_new") {
      writeArchivedCopyExclusive(
        primary.realpath,
        source.archivePortablePath,
        generated.bodyBytes,
        `${source.sourceId} primary copy`,
      );
      writeArchivedCopyExclusive(
        replica.realpath,
        source.archivePortablePath,
        generated.bodyBytes,
        `${source.sourceId} replica copy`,
      );
    }
    const primaryCopy = assertArchivedCopy(
      primary.realpath,
      source.archivePortablePath,
      source.expectedBodySha256,
      source.expectedBodySizeBytes,
      `${source.sourceId} primary copy`,
    );
    const replicaCopy = assertArchivedCopy(
      replica.realpath,
      source.archivePortablePath,
      source.expectedBodySha256,
      source.expectedBodySizeBytes,
      `${source.sourceId} replica copy`,
    );
    if (
      primaryCopy.realpath === replicaCopy.realpath ||
      (primaryCopy.device === replicaCopy.device &&
        primaryCopy.inode === replicaCopy.inode)
    ) {
      fail(`${source.sourceId} archive copies are not distinct files`);
    }
    validateSourceAcquisitionReceipt(generated.receipt);
    const receiptBytes = Buffer.from(
      `${JSON.stringify(generated.receipt, null, 2)}\n`,
      "utf8",
    );
    writeExclusive(source.receiptPath, receiptBytes);
    process.stdout.write(
      `${JSON.stringify({
        receiptId: generated.receipt.receiptId,
        sourceId: generated.receipt.sourceId,
        receiptPath: source.receiptPath,
        receiptFileSha256: sourceAcquisitionSha256(receiptBytes),
        receiptSha256: generated.receipt.receiptSha256,
        bodySha256: generated.receipt.response.bodySha256,
        bodySizeBytes: generated.receipt.response.bodySizeBytes,
        archiveCopiesVerified: 2,
      })}\n`,
    );
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
