#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_FORMAT,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_KEY_ID,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_PATH,
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256,
  canonicalSourceRegistrationAuthorizationJson,
  createSourceRegistrationReleaseAuthorizationEnvelope,
  sourceRegistrationAuthorizationSha256,
} from "./source-registration-release-authorization.mjs";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;

class SourceRegistrationReleaseSignerError extends Error {
  constructor(message) {
    super(message);
    this.name = "SourceRegistrationReleaseSignerError";
  }
}

function fail(message) {
  throw new SourceRegistrationReleaseSignerError(
    `Source-registration release signer failed: ${message}`,
  );
}

function safeFailure(error, message) {
  if (error instanceof SourceRegistrationReleaseSignerError) return error;
  return new SourceRegistrationReleaseSignerError(
    `Source-registration release signer failed: ${message}`,
  );
}

export function safeSourceRegistrationReleaseSignerErrorMessage(error) {
  if (error instanceof SourceRegistrationReleaseSignerError) {
    return error.message;
  }
  return "Source-registration release signer failed: controlled signer operation failed";
}

function readStableRegularFile(path, label, privateFile) {
  if (typeof path !== "string" || !isAbsolute(path)) {
    fail(`${label} must be an absolute path`);
  }
  let pathStats;
  try {
    pathStats = lstatSync(path);
  } catch {
    fail(`${label} is missing or unreadable`);
  }
  const permissions = pathStats.mode & 0o777;
  if (
    !pathStats.isFile() ||
    pathStats.isSymbolicLink() ||
    pathStats.nlink !== 1 ||
    (privateFile && permissions !== 0o400 && permissions !== 0o600)
  ) {
    fail(`${label} is not a controlled regular single-link file`);
  }
  let descriptor;
  try {
    descriptor = openSync(
      path,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
  } catch {
    fail(`${label} could not be opened safely`);
  }
  try {
    const before = fstatSync(descriptor, { bigint: true });
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      bytes.length !== Number(before.size)
    ) {
      fail(`${label} changed while it was read`);
    }
    return bytes;
  } finally {
    closeSync(descriptor);
  }
}

function parentIdentity(stats) {
  return {
    dev: stats.dev,
    gid: stats.gid,
    ino: stats.ino,
    mode: stats.mode,
    uid: stats.uid,
  };
}

function fileIdentity(stats) {
  return {
    ...parentIdentity(stats),
    mtimeNs: stats.mtimeNs,
    nlink: stats.nlink,
    size: stats.size,
  };
}

function sameParentIdentity(left, right) {
  return (
    left.dev === right.dev &&
    left.gid === right.gid &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.uid === right.uid
  );
}

function sameFileIdentity(left, right) {
  return (
    sameParentIdentity(left, right) &&
    left.mtimeNs === right.mtimeNs &&
    left.nlink === right.nlink &&
    left.size === right.size
  );
}

function readPrivateParentIdentity(parent) {
  let resolved;
  let stats;
  try {
    resolved = realpathSync(parent);
    stats = lstatSync(parent, { bigint: true });
  } catch (error) {
    throw safeFailure(error, "output parent is missing or unreadable");
  }
  if (
    resolved !== parent ||
    !stats.isDirectory() ||
    stats.isSymbolicLink() ||
    stats.nlink < 1n ||
    (stats.mode & 0o777n) !== 0o700n
  ) {
    fail("output parent is not a private canonical mode-0700 directory");
  }
  return parentIdentity(stats);
}

function validateOutputPath(outputPath) {
  if (
    typeof outputPath !== "string" ||
    !isAbsolute(outputPath) ||
    /[\0\r\n]/.test(outputPath)
  ) {
    fail("output path must be absolute");
  }
  const parent = dirname(outputPath);
  const leaf = basename(outputPath);
  if (!leaf || leaf === "." || leaf === ".." || leaf !== leaf.trim()) {
    fail("output leaf name is invalid");
  }
  const parentFileIdentity = readPrivateParentIdentity(parent);
  let outputExists = false;
  try {
    lstatSync(outputPath);
    outputExists = true;
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw safeFailure(error, "output existence could not be checked");
    }
  }
  if (outputExists) fail("output already exists; refusing to overwrite");
  return { parent, parentFileIdentity, leaf };
}

function assertParentUnchanged(parent, expected) {
  if (!sameParentIdentity(expected, readPrivateParentIdentity(parent))) {
    fail("output parent changed during publication");
  }
}

function unlinkOwnedOutput(outputPath, parent, ownedInode) {
  if (!ownedInode) return;
  try {
    const observed = lstatSync(outputPath, { bigint: true });
    if (
      observed.isFile() &&
      !observed.isSymbolicLink() &&
      observed.dev === ownedInode.dev &&
      observed.ino === ownedInode.ino
    ) {
      unlinkSync(outputPath);
      const parentDescriptor = openSync(parent, constants.O_RDONLY);
      try {
        fsyncSync(parentDescriptor);
      } finally {
        closeSync(parentDescriptor);
      }
    }
  } catch {
    // Cleanup never replaces the controlled publication failure.
  }
}

export function publishPrivateFile(outputPath, bytes, faultHooks = {}) {
  const { parent, parentFileIdentity, leaf } = validateOutputPath(outputPath);
  faultHooks.afterOutputPathCheck?.();
  const temporaryPath = join(
    parent,
    `.${leaf}.tmp.${randomBytes(16).toString("hex")}`,
  );
  let descriptor;
  let linked = false;
  let ownedInode;
  try {
    descriptor = openSync(
      temporaryPath,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        (constants.O_NOFOLLOW ?? 0),
      0o600,
    );
    let offset = 0;
    while (offset < bytes.length) {
      offset += writeSync(descriptor, bytes, offset, bytes.length - offset);
    }
    fsyncSync(descriptor);
    fchmodSync(descriptor, 0o400);
    fsyncSync(descriptor);
    const temporaryStats = fstatSync(descriptor, { bigint: true });
    if (
      !temporaryStats.isFile() ||
      temporaryStats.isSymbolicLink() ||
      temporaryStats.nlink !== 1n ||
      (temporaryStats.mode & 0o777n) !== 0o400n ||
      temporaryStats.size !== BigInt(bytes.length)
    ) {
      fail("temporary authorization output did not seal correctly");
    }
    assertParentUnchanged(parent, parentFileIdentity);
    ownedInode = { dev: temporaryStats.dev, ino: temporaryStats.ino };
    linkSync(temporaryPath, outputPath);
    linked = true;
    faultHooks.afterHardLink?.();
    const linkedTemporary = lstatSync(temporaryPath, { bigint: true });
    const linkedOutput = lstatSync(outputPath, { bigint: true });
    if (
      !linkedTemporary.isFile() ||
      linkedTemporary.isSymbolicLink() ||
      !linkedOutput.isFile() ||
      linkedOutput.isSymbolicLink() ||
      linkedTemporary.dev !== linkedOutput.dev ||
      linkedTemporary.ino !== linkedOutput.ino ||
      linkedTemporary.nlink !== 2n ||
      linkedOutput.nlink !== 2n
    ) {
      fail("authorization hard-link publication was not exact");
    }
    unlinkSync(temporaryPath);
    const outputIdentity = fileIdentity(
      fstatSync(descriptor, { bigint: true }),
    );
    if (
      outputIdentity.nlink !== 1n ||
      (outputIdentity.mode & 0o777n) !== 0o400n ||
      outputIdentity.size !== BigInt(bytes.length)
    ) {
      fail("authorization output did not publish as one private file");
    }
    const directoryDescriptor = openSync(parent, constants.O_RDONLY);
    try {
      const openedParent = parentIdentity(
        fstatSync(directoryDescriptor, { bigint: true }),
      );
      if (!sameParentIdentity(parentFileIdentity, openedParent)) {
        fail("output parent changed before fsync");
      }
      fsyncSync(directoryDescriptor);
    } finally {
      closeSync(directoryDescriptor);
    }
    assertParentUnchanged(parent, parentFileIdentity);
    const outputDescriptor = openSync(
      outputPath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    try {
      const before = fileIdentity(
        fstatSync(outputDescriptor, { bigint: true }),
      );
      if (!sameFileIdentity(outputIdentity, before)) {
        fail("authorization output identity changed before readback");
      }
      const readBack = readFileSync(outputDescriptor);
      const after = fileIdentity(fstatSync(outputDescriptor, { bigint: true }));
      if (!sameFileIdentity(outputIdentity, after) || !readBack.equals(bytes)) {
        fail("authorization output bytes changed after publication");
      }
    } finally {
      closeSync(outputDescriptor);
    }
    assertParentUnchanged(parent, parentFileIdentity);
    return Object.freeze({ bytes, privateMode: 0o400, singleLink: true });
  } catch (error) {
    if (linked) unlinkOwnedOutput(outputPath, parent, ownedInode);
    throw safeFailure(error, "authorization could not be published safely");
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    try {
      unlinkSync(temporaryPath);
    } catch {
      // The temporary was removed after hard-link publication or never created.
    }
  }
}

/**
 * @param {{ requestPath: string, privateKeyPath: string, publicKeyPath: string, outputPath: string, expectedRequestSha256: string, now?: Date | string | number, publicationFaultHooks?: { afterOutputPathCheck?: () => void, afterHardLink?: () => void } }} input
 */
export function publishSourceRegistrationReleaseAuthorization({
  requestPath,
  privateKeyPath,
  publicKeyPath,
  outputPath,
  expectedRequestSha256,
  now,
  publicationFaultHooks,
}) {
  if (
    typeof expectedRequestSha256 !== "string" ||
    !SHA256_PATTERN.test(expectedRequestSha256)
  ) {
    fail("expected request SHA-256 is invalid");
  }
  const requestBytes = readStableRegularFile(requestPath, "request", true);
  if (
    sourceRegistrationAuthorizationSha256(requestBytes) !==
    expectedRequestSha256
  ) {
    fail("request SHA-256 differs from expected");
  }
  let body;
  try {
    body = JSON.parse(requestBytes.toString("utf8"));
  } catch {
    fail("request is not JSON");
  }
  if (
    !requestBytes.equals(
      Buffer.from(
        `${canonicalSourceRegistrationAuthorizationJson(body)}\n`,
        "utf8",
      ),
    )
  ) {
    fail("request is not canonical JSON with one final newline");
  }
  const privateKeyBytes = readStableRegularFile(
    privateKeyPath,
    "private key",
    true,
  );
  const publicKeyBytes = readStableRegularFile(
    publicKeyPath,
    "public key",
    false,
  );
  const envelope = createSourceRegistrationReleaseAuthorizationEnvelope({
    body,
    privateKeyBytes,
    publicKeyBytes,
    now,
  });
  publishPrivateFile(outputPath, envelope, publicationFaultHooks);
  const parsedEnvelope = JSON.parse(envelope.toString("utf8"));
  return Object.freeze({
    format: "foodsystems-source-registration-release-sign-result",
    version: 1,
    authorizationFormat: SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_FORMAT,
    authorizationEnvelopeSha256:
      sourceRegistrationAuthorizationSha256(envelope),
    keyId: parsedEnvelope.keyId,
    authorizedAtUtc: body.issuedAtUtc,
    expiresAtUtc: body.expiresAtUtc,
  });
}

function main() {
  if (process.argv.length !== 2) fail("command-line arguments are forbidden");
  const requestPath = process.env.SOURCE_REGISTRATION_RELEASE_REQUEST_PATH;
  const privateKeyPath =
    process.env.SOURCE_REGISTRATION_RELEASE_PRIVATE_KEY_PATH;
  const outputPath =
    process.env.SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_OUTPUT_PATH;
  if (
    typeof requestPath !== "string" ||
    typeof privateKeyPath !== "string" ||
    typeof outputPath !== "string"
  ) {
    fail(
      "request, private-key and output paths are required in the environment",
    );
  }
  const repositoryRoot = realpathSync(
    fileURLToPath(new URL("../../", import.meta.url)),
  );
  const assertOutsideRepository = (path, label, useParent = false) => {
    let resolved;
    try {
      resolved = realpathSync(useParent ? dirname(path) : path);
    } catch {
      fail(`${label} is missing or its parent is unreadable`);
    }
    if (
      resolved === repositoryRoot ||
      resolved.startsWith(`${repositoryRoot}/`)
    ) {
      fail(`${label} must remain outside the repository`);
    }
  };
  assertOutsideRepository(requestPath, "request");
  assertOutsideRepository(privateKeyPath, "private key");
  assertOutsideRepository(outputPath, "output", true);
  const pinnedPublicKeyPath = fileURLToPath(
    new URL(
      `../../${SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_PATH}`,
      import.meta.url,
    ),
  );
  const result = publishSourceRegistrationReleaseAuthorization({
    requestPath,
    privateKeyPath,
    publicKeyPath: pinnedPublicKeyPath,
    outputPath,
    expectedRequestSha256:
      process.env.SOURCE_REGISTRATION_RELEASE_EXPECTED_REQUEST_SHA256,
  });
  if (
    result.keyId !== SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_KEY_ID ||
    sourceRegistrationAuthorizationSha256(readFileSync(pinnedPublicKeyPath)) !==
      SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256
  ) {
    fail("production signer did not use the one pinned public key");
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const invoked = process.argv[1]
  ? fileURLToPath(import.meta.url) === realpathSync(process.argv[1])
  : false;
if (invoked) {
  try {
    main();
  } catch (error) {
    process.stderr.write(
      `${safeSourceRegistrationReleaseSignerErrorMessage(error)}\n`,
    );
    process.exitCode = 1;
  }
}
