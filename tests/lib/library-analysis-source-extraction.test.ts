import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  extractLibraryAnalysisDerivedReport,
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

test("CSV extraction preserves quoted cells and emits stable row ranges", () => {
  const csv = Buffer.from(
    '\ufeffid,title,note,empty\r\n1,"A, B","line one\nline two",\r\n2,C,plain,\r\n',
    "utf8",
  );
  const result = extractLibraryAnalysisSource({
    sourceKey: "library_file:candidates",
    mediaType: "text/csv",
    finalLocator: "repository:research/bibliotek/candidates.csv",
    bytes: csv,
  }, unusedPdfAdapter);

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.equal(result.units.length, 1);
  assert.equal(result.units[0]?.unitType, "sheet_range");
  assert.equal(
    result.units[0]?.baseLocator,
    "repository:research/bibliotek/candidates.csv#rows=2-3",
  );
  assert.equal(
    result.units[0]?.text,
    'id,title,note,empty\n1,"A, B","line one\nline two",\n2,C,plain,',
  );

  const inconsistent = extractLibraryAnalysisSource({
    sourceKey: "library_file:bad-csv",
    mediaType: "text/csv",
    finalLocator: "repository:bad.csv",
    bytes: Buffer.from("a,b\n1\n", "utf8"),
  }, unusedPdfAdapter);
  assert.deepEqual(inconsistent, {
    status: "blocked",
    reasonCode: "corrupt_payload",
    detail: "csv_column_count_mismatch",
  });
});

test("PPTX extraction follows presentation slide order and rejects external relations", () => {
  const entries: Record<string, string> = {
    "ppt/presentation.xml": '<p:presentation xmlns:p="p" xmlns:r="r"><p:sldIdLst><p:sldId r:id="rId2"/><p:sldId r:id="rId1"/></p:sldIdLst></p:presentation>',
    "ppt/_rels/presentation.xml.rels": '<Relationships><Relationship Id="rId1" Type="slide" Target="slides/slide1.xml"/><Relationship Id="rId2" Type="slide" Target="slides/slide2.xml"/></Relationships>',
    "ppt/slides/slide1.xml": '<p:sld xmlns:p="p" xmlns:a="a"><a:t>First</a:t><a:t>slide</a:t></p:sld>',
    "ppt/slides/slide2.xml": '<p:sld xmlns:p="p" xmlns:a="a"><a:t>Second &amp; prior</a:t></p:sld>',
  };
  const result = extractLibraryAnalysisSource({
    sourceKey: "library_file:deck",
    mediaType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    finalLocator: "repository:deck.pptx",
    bytes: Buffer.from("504b0304fixture", "hex"),
  }, {
    ...unusedPdfAdapter,
    listZipEntries: () => Object.keys(entries),
    readZipEntry: (_bytes, entry) => Buffer.from(entries[entry] ?? "", "utf8"),
  });

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.deepEqual(result.units.map((unit) => ({ locator: unit.baseLocator, text: unit.text })), [
    { locator: "repository:deck.pptx#slide=1", text: "Second & prior" },
    { locator: "repository:deck.pptx#slide=2", text: "First\nslide" },
  ]);

  const external = extractLibraryAnalysisSource({
    sourceKey: "library_file:external-deck",
    mediaType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    finalLocator: "repository:external.pptx",
    bytes: Buffer.from("504b0304fixture", "hex"),
  }, {
    ...unusedPdfAdapter,
    listZipEntries: () => ["ppt/presentation.xml", "ppt/_rels/presentation.xml.rels"],
    readZipEntry: (_bytes, entry) => Buffer.from(
      entry.endsWith(".rels")
        ? '<Relationships><Relationship Id="rId1" TargetMode="External" Target="https://example.test/deck"/></Relationships>'
        : '<p:presentation xmlns:p="p" xmlns:r="r"><p:sldIdLst><p:sldId r:id="rId1"/></p:sldIdLst></p:presentation>',
      "utf8",
    ),
  });
  assert.deepEqual(external, {
    status: "blocked",
    reasonCode: "corrupt_payload",
    detail: "pptx_external_relationship_forbidden",
  });
});

test("derived report extraction canonicalizes dependencies and rejects unknown fields", () => {
  const report = {
    id: "internal-report",
    title: "Internal report",
    fullTitle: null,
    author: null,
    institution: "Food Systems",
    date: "2026-08-21",
    year: 2026,
    reportCategory: "internal_synthesis",
    country: "NO",
    keyFindings: [],
    recommendations: [],
    relevance: "Internal source graph",
    tags: ["internal"],
    provenanceType: "internal_synthesis",
    supportingSources: [{ sourceId: "b" }, { sourceId: "a" }],
  };
  const result = extractLibraryAnalysisDerivedReport(report);

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.equal(result.units[0]?.unitType, "database_record");
  assert.equal(result.units[0]?.baseLocator, "database:Report:internal-report");
  assert.match(result.units[0]!.text, /"sourceId":"a".*"sourceId":"b"/);

  assert.deepEqual(extractLibraryAnalysisDerivedReport({
    ...report,
    reviewer: "AI",
  }), {
    status: "blocked",
    reasonCode: "corrupt_payload",
    detail: "derived_report_schema_invalid",
  });
});
