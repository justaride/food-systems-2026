import { createHash } from "node:crypto";

import {
  candidateAnalysisSha256,
  type CandidateContentUnitType,
} from "./candidate-analysis-contract";

export type LibraryAnalysisChunkPolicy = {
  version: "1.0.0";
  maxCodePoints: 12_000;
};

export const DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY = Object.freeze({
  version: "1.0.0",
  maxCodePoints: 12_000,
} satisfies LibraryAnalysisChunkPolicy);

export type LogicalContentUnit = {
  unitType: CandidateContentUnitType;
  baseLocator: string;
  ordinal: number;
  text: string;
};

export type ChunkedContentUnit = {
  unitType: CandidateContentUnitType;
  baseLocator: string;
  logicalOrdinal: number;
  chunkOrdinal: number;
  startCodePoint: number;
  endCodePoint: number;
  locator: string;
  text: string;
  contentHash: string;
  chunkPolicyHash: string;
};

export function chunkLogicalContentUnit(
  input: LogicalContentUnit,
  policy: LibraryAnalysisChunkPolicy,
): ChunkedContentUnit[] {
  validateInput(input, policy);
  const codePoints = Array.from(input.text);
  if (codePoints.length === 0) return [];

  const chunkPolicyHash = candidateAnalysisSha256(
    "library-analysis-chunk-policy",
    policy,
  );
  const chunks: ChunkedContentUnit[] = [];
  let startCodePoint = 0;
  while (startCodePoint < codePoints.length) {
    const hardEnd = Math.min(
      startCodePoint + policy.maxCodePoints,
      codePoints.length,
    );
    const endCodePoint = hardEnd === codePoints.length
      ? hardEnd
      : preferredBoundary(codePoints, startCodePoint, hardEnd);
    const text = codePoints.slice(startCodePoint, endCodePoint).join("");
    const chunkOrdinal = chunks.length;
    chunks.push({
      unitType: input.unitType,
      baseLocator: input.baseLocator,
      logicalOrdinal: input.ordinal,
      chunkOrdinal,
      startCodePoint,
      endCodePoint,
      locator: chunkLocator(input.baseLocator, startCodePoint, endCodePoint),
      text,
      contentHash: sha256Text(text),
      chunkPolicyHash,
    });
    startCodePoint = endCodePoint;
  }
  return chunks;
}

export function reconstructLogicalContentUnit(
  chunks: readonly ChunkedContentUnit[],
): string {
  if (chunks.length === 0) return "";
  const first = chunks[0]!;
  let expectedStart = 0;
  for (const [index, chunk] of chunks.entries()) {
    if (chunk.chunkOrdinal !== index) {
      throw new Error("library_chunk_ordinal_invalid");
    }
    if (
      chunk.logicalOrdinal !== first.logicalOrdinal ||
      chunk.unitType !== first.unitType ||
      chunk.baseLocator !== first.baseLocator ||
      chunk.chunkPolicyHash !== first.chunkPolicyHash
    ) {
      throw new Error("library_chunk_group_binding_mismatch");
    }
    if (chunk.startCodePoint !== expectedStart) {
      throw new Error("library_chunk_offsets_not_contiguous");
    }
    const codePointLength = Array.from(chunk.text).length;
    if (
      codePointLength === 0 ||
      codePointLength > DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY.maxCodePoints ||
      chunk.endCodePoint !== chunk.startCodePoint + codePointLength
    ) {
      throw new Error("library_chunk_offsets_invalid");
    }
    if (
      chunk.locator !==
      chunkLocator(chunk.baseLocator, chunk.startCodePoint, chunk.endCodePoint)
    ) {
      throw new Error("library_chunk_locator_mismatch");
    }
    if (sha256Text(chunk.text) !== chunk.contentHash) {
      throw new Error("library_chunk_content_hash_mismatch");
    }
    expectedStart = chunk.endCodePoint;
  }
  return chunks.map((chunk) => chunk.text).join("");
}

function validateInput(
  input: LogicalContentUnit,
  policy: LibraryAnalysisChunkPolicy,
): void {
  if (input.baseLocator.length === 0) {
    throw new Error("library_chunk_base_locator_required");
  }
  if (!Number.isInteger(input.ordinal) || input.ordinal < 0) {
    throw new Error("library_chunk_logical_ordinal_invalid");
  }
  if (policy.version !== "1.0.0" || policy.maxCodePoints !== 12_000) {
    throw new Error("library_chunk_policy_invalid");
  }
}

function preferredBoundary(
  codePoints: readonly string[],
  start: number,
  hardEnd: number,
): number {
  for (let index = hardEnd; index > start; index -= 1) {
    if (codePoints[index - 2] === "\n" && codePoints[index - 1] === "\n") {
      return index;
    }
  }
  for (let index = hardEnd; index > start; index -= 1) {
    const before = codePoints[index - 1];
    const after = codePoints[index];
    if (before !== undefined && /[.!?]/u.test(before) && after !== undefined && /\s/u.test(after)) {
      return index;
    }
  }
  return hardEnd;
}

function chunkLocator(
  baseLocator: string,
  startCodePoint: number,
  endCodePoint: number,
): string {
  const separator = baseLocator.includes("#") ? "&" : "#";
  return `${baseLocator}${separator}chars=${startCodePoint}-${endCodePoint}`;
}

function sha256Text(value: string): string {
  return createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
}
