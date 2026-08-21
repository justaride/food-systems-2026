import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY,
  chunkLogicalContentUnit,
  reconstructLogicalContentUnit,
} from "../../src/lib/knowledge/library-analysis-content-chunker";

test("chunker prefers paragraph boundaries and reconstructs exact text", () => {
  const text = `${"a".repeat(7_000)}\n\n${"b".repeat(7_000)}`;
  const chunks = chunkLogicalContentUnit({
    unitType: "document_section",
    baseLocator: "database:Document:d:content",
    ordinal: 0,
    text,
  }, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY);

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0]?.text, `${"a".repeat(7_000)}\n\n`);
  assert.equal(chunks[0]?.startCodePoint, 0);
  assert.equal(chunks[0]?.endCodePoint, 7_002);
  assert.equal(chunks[1]?.startCodePoint, 7_002);
  assert.equal(reconstructLogicalContentUnit(chunks), text);
  assert.ok(chunks.every((chunk) => Array.from(chunk.text).length <= 12_000));
});

test("chunker counts Unicode code points rather than UTF-16 code units", () => {
  const text = `${"🧭".repeat(12_000)}x`;
  const chunks = chunkLogicalContentUnit({
    unitType: "web_section",
    baseLocator: "https:source#section=1",
    ordinal: 4,
    text,
  }, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY);

  assert.equal(chunks.length, 2);
  assert.equal(Array.from(chunks[0]!.text).length, 12_000);
  assert.equal(chunks[0]?.locator, "https:source#section=1&chars=0-12000");
  assert.equal(chunks[1]?.locator, "https:source#section=1&chars=12000-12001");
  assert.equal(reconstructLogicalContentUnit(chunks), text);
});

test("chunker prefers a sentence boundary before hard fallback", () => {
  const firstSentence = `${"a".repeat(10_000)}.`;
  const text = `${firstSentence} ${"b".repeat(10_000)}`;
  const chunks = chunkLogicalContentUnit({
    unitType: "document_section",
    baseLocator: "repository:source",
    ordinal: 0,
    text,
  }, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY);

  assert.equal(chunks[0]?.text, firstSentence);
  assert.equal(chunks[1]?.text.startsWith(" "), true);
  assert.equal(reconstructLogicalContentUnit(chunks), text);

  const hardFallback = chunkLogicalContentUnit({
    unitType: "document_section",
    baseLocator: "repository:hard",
    ordinal: 0,
    text: "z".repeat(20_000),
  }, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY);
  assert.equal(Array.from(hardFallback[0]!.text).length, 12_000);
  assert.equal(Array.from(hardFallback[1]!.text).length, 8_000);
});

test("chunker emits no empty unit and preserves CRLF bytes as text", () => {
  assert.deepEqual(chunkLogicalContentUnit({
    unitType: "document_section",
    baseLocator: "repository:empty",
    ordinal: 0,
    text: "",
  }, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY), []);

  const text = `${"a".repeat(11_999)}\r\nb`;
  const chunks = chunkLogicalContentUnit({
    unitType: "document_section",
    baseLocator: "repository:crlf",
    ordinal: 0,
    text,
  }, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY);
  assert.equal(reconstructLogicalContentUnit(chunks), text);
});

test("reconstruction rejects overlap gaps order drift and mutated chunk text", () => {
  const chunks = chunkLogicalContentUnit({
    unitType: "slide",
    baseLocator: "repository:deck#slide=1",
    ordinal: 1,
    text: "x".repeat(13_000),
  }, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY);

  assert.throws(
    () => reconstructLogicalContentUnit([
      chunks[0]!,
      { ...chunks[1]!, startCodePoint: chunks[1]!.startCodePoint - 1 },
    ]),
    /library_chunk_offsets_not_contiguous/,
  );
  assert.throws(
    () => reconstructLogicalContentUnit([
      { ...chunks[0]!, chunkOrdinal: 1 },
      chunks[1]!,
    ]),
    /library_chunk_ordinal_invalid/,
  );
  assert.throws(
    () => reconstructLogicalContentUnit([
      { ...chunks[0]!, text: `y${chunks[0]!.text.slice(1)}` },
      chunks[1]!,
    ]),
    /library_chunk_content_hash_mismatch/,
  );
});
