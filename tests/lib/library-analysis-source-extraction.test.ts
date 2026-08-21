import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  extractLibraryAnalysisSource,
  type LibraryAnalysisExtractionAdapters,
} from "../../src/lib/knowledge/library-analysis-source-extraction";

const unusedPdfAdapter: LibraryAnalysisExtractionAdapters = {
  runPdfText: () => {
    throw new Error("unexpected_pdf_adapter_call");
  },
};

test("HTML extraction removes inactive content and finds only same-origin PDF links", () => {
  const bytes = Buffer.from([
    "<html><head><title>Hidden</title></head><body>",
    "<h1>A</h1><script>bad()</script><style>.x{}</style>",
    "<p>B &amp; C</p>",
    '<a href="/files/report.pdf">Report</a>',
    '<a href="https://foreign.test/other.pdf">Foreign</a>',
    "</body></html>",
  ].join(""), "utf8");

  const result = extractLibraryAnalysisSource({
    sourceKey: "source_doc:src-1",
    mediaType: "text/html; charset=utf-8",
    finalLocator: "https://example.test/reports/landing",
    bytes,
  }, unusedPdfAdapter);

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.equal(result.rawSha256, createHash("sha256").update(bytes).digest("hex"));
  assert.equal(result.units.length, 1);
  assert.equal(result.units[0]?.unitType, "web_section");
  assert.equal(result.units[0]?.text, "A\n\nB & C\n\nReport\n\nForeign");
  assert.deepEqual(result.documentLinkCandidates, [
    "https://example.test/files/report.pdf",
  ]);
  assert.doesNotMatch(result.units[0]!.text, /Hidden|bad|\.x/);
});

test("plain text extraction preserves paragraphs and rejects invalid UTF-8", () => {
  const ready = extractLibraryAnalysisSource({
    sourceKey: "source_doc:text",
    mediaType: "text/plain",
    finalLocator: "https://example.test/source.txt",
    bytes: Buffer.from("First\r\n\r\nSecond", "utf8"),
  }, unusedPdfAdapter);
  assert.equal(ready.status, "ready");
  if (ready.status === "ready") {
    assert.equal(ready.units[0]?.text, "First\n\nSecond");
    assert.equal(ready.units[0]?.unitType, "document_section");
  }

  const invalid = extractLibraryAnalysisSource({
    sourceKey: "source_doc:invalid",
    mediaType: "text/plain",
    finalLocator: "https://example.test/invalid.txt",
    bytes: Buffer.from([0xc3, 0x28]),
  }, unusedPdfAdapter);
  assert.deepEqual(invalid, {
    status: "blocked",
    reasonCode: "corrupt_payload",
    detail: "invalid_utf8",
  });
});

test("PDF extraction preserves page identity and extractor binding", () => {
  const adapters: LibraryAnalysisExtractionAdapters = {
    runPdfText: (bytes) => {
      assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-");
      return {
        exitCode: 0,
        stdout: "Page one\n\fPage two\r\n\f",
        stderr: "",
        toolVersion: "pdftotext 25.06.0",
      };
    },
  };
  const result = extractLibraryAnalysisSource({
    sourceKey: "report:r-1",
    mediaType: "application/pdf",
    finalLocator: "https://example.test/report.pdf",
    bytes: Buffer.from("%PDF-1.7 fixture", "ascii"),
  }, adapters);

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.deepEqual(result.units.map((unit) => ({
    ordinal: unit.ordinal,
    locator: unit.baseLocator,
    text: unit.text,
  })), [
    { ordinal: 0, locator: "https://example.test/report.pdf#page=1", text: "Page one" },
    { ordinal: 1, locator: "https://example.test/report.pdf#page=2", text: "Page two" },
  ]);
  assert.equal(result.extractor.name, "pdftotext");
  assert.equal(result.extractor.version, "25.06.0");
});

test("PDF extraction blocks corrupt and scanned-only payloads", () => {
  const corrupt = extractLibraryAnalysisSource({
    sourceKey: "report:corrupt",
    mediaType: "application/pdf",
    finalLocator: "https://example.test/corrupt.pdf",
    bytes: Buffer.from("not a pdf", "utf8"),
  }, unusedPdfAdapter);
  assert.deepEqual(corrupt, {
    status: "blocked",
    reasonCode: "corrupt_payload",
    detail: "pdf_signature_missing",
  });

  const scanned = extractLibraryAnalysisSource({
    sourceKey: "report:scan",
    mediaType: "application/pdf",
    finalLocator: "https://example.test/scan.pdf",
    bytes: Buffer.from("%PDF-1.7 scan", "ascii"),
  }, {
    runPdfText: () => ({
      exitCode: 0,
      stdout: "\f \n\f",
      stderr: "",
      toolVersion: "pdftotext 25.06.0",
    }),
  });
  assert.deepEqual(scanned, {
    status: "blocked",
    reasonCode: "ocr_required",
    detail: "pdf_contains_no_extractable_text",
  });
});

test("extraction blocks unsupported media and failed PDF tooling", () => {
  const unsupported = extractLibraryAnalysisSource({
    sourceKey: "source_doc:image",
    mediaType: "image/png",
    finalLocator: "https://example.test/image.png",
    bytes: Buffer.from("png", "utf8"),
  }, unusedPdfAdapter);
  assert.equal(unsupported.status, "blocked");
  if (unsupported.status === "blocked") {
    assert.equal(unsupported.reasonCode, "unsupported_media_type");
  }

  const failed = extractLibraryAnalysisSource({
    sourceKey: "report:failed",
    mediaType: "application/pdf",
    finalLocator: "https://example.test/failed.pdf",
    bytes: Buffer.from("%PDF-1.7 failed", "ascii"),
  }, {
    runPdfText: () => ({
      exitCode: 1,
      stdout: "",
      stderr: "syntax error with /private/path",
      toolVersion: "pdftotext 25.06.0",
    }),
  });
  assert.deepEqual(failed, {
    status: "blocked",
    reasonCode: "corrupt_payload",
    detail: "pdf_text_extraction_failed",
  });
});
