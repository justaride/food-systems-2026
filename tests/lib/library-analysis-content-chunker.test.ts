import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY,
  SECTION_LIBRARY_ANALYSIS_CHUNK_POLICY,
  chunkLogicalContentUnit,
  reconstructLogicalContentUnit,
} from "../../src/lib/knowledge/library-analysis-content-chunker";

const logical = (text: string, baseLocator = "repository:test") => ({
  unitType: "document_section" as const,
  baseLocator,
  ordinal: 0,
  text,
});

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

test("section policy keeps company headings with their body and has a distinct hash", () => {
  const text = `${"p".repeat(3_850)}\n\n## 1. Company\nCompany body stays with its heading.\n\n## 2. Next\nNext body.`;
  const chunks = chunkLogicalContentUnit(logical(text), SECTION_LIBRARY_ANALYSIS_CHUNK_POLICY);

  assert.equal(chunks.some((chunk) => chunk.text.includes("## 1. Company\nCompany body stays")), true);
  assert.equal(reconstructLogicalContentUnit(chunks), text);
  assert.notEqual(chunks[0]?.chunkPolicyHash, chunkLogicalContentUnit(
    logical(text),
    DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY,
  )[0]?.chunkPolicyHash);
});

test("section policy preserves tables, non BMP text, and bounds oversized sections", () => {
  const table = "| Company | Value |\n| --- | --- |\n| Fjord 🧭 | 1 |\n| North | 2 |\n";
  const text = `${"x".repeat(3_970)}\n\n${table}${"z".repeat(4_500)}`;
  const chunks = chunkLogicalContentUnit(logical(text, "repository:table"), SECTION_LIBRARY_ANALYSIS_CHUNK_POLICY);

  assert.equal(reconstructLogicalContentUnit(chunks), text);
  assert.ok(chunks.every((chunk) => Array.from(chunk.text).length <= 4_000));
  assert.ok(chunks.some((chunk) => chunk.text.includes(table)));
  assert.equal(Array.from(text).length, chunks.reduce((total, chunk) => total + Array.from(chunk.text).length, 0));
});

test("section policy rejects unknown version and max combinations", () => {
  assert.throws(
    () => chunkLogicalContentUnit(logical("text"), { version: "1.1.0", maxCodePoints: 12_000 } as never),
    /library_chunk_policy_invalid/,
  );
});
