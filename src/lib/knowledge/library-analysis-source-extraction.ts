import { createHash } from "node:crypto";
import { posix } from "node:path";
import { z } from "zod";

import { canonicalCandidateJson } from "./candidate-analysis-contract";
import type { LogicalContentUnit } from "./library-analysis-content-chunker";

export type LibraryAnalysisExtractionToolBinding = {
  name: string;
  version: string;
  workflowRef: string;
  workflowVersion: string;
};

export type LibraryAnalysisPdfTextProbe = {
  exitCode: number;
  stdout: string;
  stderr: string;
  toolVersion: string;
};

export type LibraryAnalysisExtractionAdapters = {
  runPdfText: (bytes: Buffer) => LibraryAnalysisPdfTextProbe;
  listZipEntries?: (bytes: Buffer) => string[];
  readZipEntry?: (bytes: Buffer, entry: string) => Buffer;
};

export type LibraryAnalysisSourceExtractionInput = {
  sourceKey: string;
  mediaType: string;
  finalLocator: string;
  bytes: Buffer;
};

export type LibraryAnalysisSourceExtractionResult =
  | {
      status: "ready";
      rawSha256: string;
      normalizedTextSha256: string;
      extractor: LibraryAnalysisExtractionToolBinding;
      units: LogicalContentUnit[];
      documentLinkCandidates: string[];
      warnings: string[];
    }
  | {
      status: "blocked";
      reasonCode:
        | "empty_extraction"
        | "ocr_required"
        | "corrupt_payload"
        | "unsupported_media_type";
      detail: string;
    };

export function extractLibraryAnalysisSource(
  input: LibraryAnalysisSourceExtractionInput,
  adapters: LibraryAnalysisExtractionAdapters,
): LibraryAnalysisSourceExtractionResult {
  const mediaType = input.mediaType.split(";", 1)[0]!.trim().toLowerCase();
  if (mediaType === "application/pdf" || looksLikePdfLocator(input.finalLocator)) {
    return extractPdf(input, adapters);
  }
  if (mediaType === "text/csv" || input.finalLocator.toLowerCase().endsWith(".csv")) {
    return extractCsv(input);
  }
  if (
    mediaType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    input.finalLocator.toLowerCase().endsWith(".pptx")
  ) {
    return extractPptx(input, adapters);
  }
  if (mediaType === "text/html" || mediaType === "application/xhtml+xml") {
    return extractHtml(input);
  }
  if (
    mediaType === "text/plain" ||
    mediaType === "application/json" ||
    mediaType.endsWith("+json")
  ) {
    return extractPlainText(input);
  }
  return {
    status: "blocked",
    reasonCode: "unsupported_media_type",
    detail: "unsupported_media_type",
  };
}

const derivedReportSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    fullTitle: z.string().nullable(),
    author: z.string().nullable(),
    institution: z.string().nullable(),
    date: z.string().nullable(),
    year: z.number().int().nullable(),
    reportCategory: z.string().min(1),
    country: z.string().min(1),
    keyFindings: z.array(z.string()),
    recommendations: z.array(z.string()),
    relevance: z.string(),
    tags: z.array(z.string()),
    provenanceType: z.string().nullable(),
    supportingSources: z.array(z.json()),
  })
  .strict();

export function extractLibraryAnalysisDerivedReport(
  rawRecord: unknown,
): LibraryAnalysisSourceExtractionResult {
  const parsed = derivedReportSchema.safeParse(rawRecord);
  if (!parsed.success) {
    return {
      status: "blocked",
      reasonCode: "corrupt_payload",
      detail: "derived_report_schema_invalid",
    };
  }
  const record = {
    ...parsed.data,
    supportingSources: [...parsed.data.supportingSources].sort((left, right) =>
      Buffer.compare(
        Buffer.from(canonicalCandidateJson(left), "utf8"),
        Buffer.from(canonicalCandidateJson(right), "utf8"),
      )),
  };
  const text = canonicalCandidateJson(record);
  return readyResult(
    Buffer.from(text, "utf8"),
    [{
      unitType: "database_record",
      baseLocator: `database:Report:${record.id}`,
      ordinal: 0,
      text,
    }],
    {
      name: "library-derived-report",
      version: "1.0.0",
      workflowRef: "workflow.library-analysis.derived-report-extraction",
      workflowVersion: "1.0.0",
    },
  );
}

function extractHtml(
  input: LibraryAnalysisSourceExtractionInput,
): LibraryAnalysisSourceExtractionResult {
  const decoded = decodeUtf8(input.bytes);
  if (decoded === null) return corruptUtf8();
  const withoutInactiveContent = decoded
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/giu, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/giu, " ");
  const documentLinkCandidates = extractSameOriginPdfLinks(
    withoutInactiveContent,
    input.finalLocator,
  );
  const text = normalizeHtmlText(withoutInactiveContent);
  if (text.length === 0) return emptyExtraction();
  const units: LogicalContentUnit[] = [{
    unitType: "web_section",
    baseLocator: input.finalLocator,
    ordinal: 0,
    text,
  }];
  return readyResult(
    input.bytes,
    units,
    {
      name: "library-html-text",
      version: "1.0.0",
      workflowRef: "workflow.library-analysis.html-extraction",
      workflowVersion: "1.0.0",
    },
    documentLinkCandidates,
  );
}

function extractPlainText(
  input: LibraryAnalysisSourceExtractionInput,
): LibraryAnalysisSourceExtractionResult {
  const decoded = decodeUtf8(input.bytes);
  if (decoded === null) return corruptUtf8();
  const text = normalizeLineEndings(decoded);
  if (text.trim().length === 0) return emptyExtraction();
  const units: LogicalContentUnit[] = [{
    unitType: "document_section",
    baseLocator: input.finalLocator,
    ordinal: 0,
    text,
  }];
  return readyResult(input.bytes, units, {
    name: "library-plain-text",
    version: "1.0.0",
    workflowRef: "workflow.library-analysis.plain-text-extraction",
    workflowVersion: "1.0.0",
  });
}

function extractCsv(
  input: LibraryAnalysisSourceExtractionInput,
): LibraryAnalysisSourceExtractionResult {
  const decoded = decodeUtf8(input.bytes);
  if (decoded === null) return corruptUtf8();
  const parsed = parseCsv(normalizeLineEndings(decoded).replace(/^\ufeff/u, ""), ",");
  if (parsed.status === "blocked") return parsed;
  if (parsed.rows.length < 2) return emptyExtraction();
  const [header, ...dataRows] = parsed.rows;
  const units: LogicalContentUnit[] = [];
  for (let start = 0; start < dataRows.length; start += 100) {
    const rows = dataRows.slice(start, start + 100);
    const firstRow = start + 2;
    const lastRow = start + rows.length + 1;
    units.push({
      unitType: "sheet_range",
      baseLocator: appendLocator(input.finalLocator, `rows=${firstRow}-${lastRow}`),
      ordinal: units.length,
      text: [header!, ...rows].map((row) => serializeCsvRow(row, ",")).join("\n"),
    });
  }
  return readyResult(input.bytes, units, {
    name: "library-csv-rfc4180",
    version: "1.0.0",
    workflowRef: "workflow.library-analysis.csv-extraction",
    workflowVersion: "1.0.0",
  });
}

function parseCsv(
  value: string,
  delimiter: string,
): { status: "ready"; rows: string[][] } | Extract<LibraryAnalysisSourceExtractionResult, { status: "blocked" }> {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]!;
    if (quoted) {
      if (character === '"' && value[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }
    if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) return corruptExtraction("csv_unterminated_quote");
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return { status: "ready", rows: [] };
  const width = rows[0]!.length;
  if (width === 0 || rows.some((candidate) => candidate.length !== width)) {
    return corruptExtraction("csv_column_count_mismatch");
  }
  return { status: "ready", rows };
}

function serializeCsvRow(row: readonly string[], delimiter: string): string {
  return row.map((field) => {
    if (field.includes(delimiter) || field.includes("\n") || field.includes('"')) {
      return `"${field.replaceAll('"', '""')}"`;
    }
    return field;
  }).join(delimiter);
}

function extractPptx(
  input: LibraryAnalysisSourceExtractionInput,
  adapters: LibraryAnalysisExtractionAdapters,
): LibraryAnalysisSourceExtractionResult {
  if (!input.bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
    return corruptExtraction("pptx_zip_signature_missing");
  }
  if (!adapters.listZipEntries || !adapters.readZipEntry) {
    return corruptExtraction("pptx_zip_adapter_missing");
  }
  let entries: string[];
  try {
    entries = adapters.listZipEntries(input.bytes);
  } catch {
    return corruptExtraction("pptx_zip_listing_failed");
  }
  const entrySet = new Set<string>();
  for (const entry of entries) {
    if (
      entry.length === 0 ||
      entry.startsWith("/") ||
      entry.includes("\\") ||
      entry.split("/").some((segment) => segment === "" || segment === "." || segment === "..") ||
      entrySet.has(entry)
    ) {
      return corruptExtraction("pptx_zip_entry_invalid");
    }
    entrySet.add(entry);
  }
  const readText = (entry: string): string | null => {
    if (!entrySet.has(entry)) return null;
    try {
      return decodeUtf8(adapters.readZipEntry!(input.bytes, entry));
    } catch {
      return null;
    }
  };
  for (const entry of entries.filter((name) => name.endsWith(".rels"))) {
    const relationships = readText(entry);
    if (relationships === null) return corruptExtraction("pptx_relationship_read_failed");
    if (/\bTargetMode\s*=\s*["']External["']/iu.test(relationships)) {
      return corruptExtraction("pptx_external_relationship_forbidden");
    }
  }
  const presentation = readText("ppt/presentation.xml");
  const presentationRelationships = readText("ppt/_rels/presentation.xml.rels");
  if (presentation === null || presentationRelationships === null) {
    return corruptExtraction("pptx_presentation_parts_missing");
  }
  const relationshipTargets = parseRelationshipTargets(presentationRelationships);
  const slideRelationshipIds = [...presentation.matchAll(/<p:sldId\b([^>]*)\/?\s*>/giu)]
    .map((match) => xmlAttribute(match[1] ?? "", "r:id"))
    .filter((value): value is string => value !== null);
  if (slideRelationshipIds.length === 0) return emptyExtraction();
  const units: LogicalContentUnit[] = [];
  for (const [slideIndex, relationshipId] of slideRelationshipIds.entries()) {
    const target = relationshipTargets.get(relationshipId);
    if (!target) return corruptExtraction("pptx_slide_relationship_missing");
    const slidePath = resolveZipRelationshipTarget("ppt/presentation.xml", target);
    if (slidePath === null) return corruptExtraction("pptx_slide_target_invalid");
    const slideXml = readText(slidePath);
    if (slideXml === null) return corruptExtraction("pptx_slide_part_missing");
    const text = extractXmlTextNodes(slideXml);
    if (text.length === 0) continue;
    units.push({
      unitType: "slide",
      baseLocator: appendLocator(input.finalLocator, `slide=${slideIndex + 1}`),
      ordinal: slideIndex,
      text,
    });
  }
  if (units.length === 0) return emptyExtraction();
  return readyResult(input.bytes, units, {
    name: "library-pptx-xml",
    version: "1.0.0",
    workflowRef: "workflow.library-analysis.pptx-extraction",
    workflowVersion: "1.0.0",
  });
}

function parseRelationshipTargets(xml: string): Map<string, string> {
  const targets = new Map<string, string>();
  for (const match of xml.matchAll(/<Relationship\b([^>]*)\/?\s*>/giu)) {
    const attributes = match[1] ?? "";
    const id = xmlAttribute(attributes, "Id");
    const target = xmlAttribute(attributes, "Target");
    if (id && target) targets.set(id, decodeHtmlEntities(target));
  }
  return targets;
}

function xmlAttribute(attributes: string, name: string): string | null {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = attributes.match(new RegExp(`(?:^|\\s)${escapedName}\\s*=\\s*(["'])(.*?)\\1`, "iu"));
  return match?.[2] ?? null;
}

function resolveZipRelationshipTarget(baseEntry: string, target: string): string | null {
  if (target.startsWith("/") || target.includes("\\")) return null;
  const resolved = posix.normalize(posix.join(posix.dirname(baseEntry), target));
  if (resolved.startsWith("../") || resolved === ".." || !resolved.startsWith("ppt/")) return null;
  return resolved;
}

function extractXmlTextNodes(xml: string): string {
  return [...xml.matchAll(/<a:t\b[^>]*>([\s\S]*?)<\/a:t>/giu)]
    .map((match) => decodeHtmlEntities(match[1] ?? ""))
    .join("\n")
    .trim();
}

function extractPdf(
  input: LibraryAnalysisSourceExtractionInput,
  adapters: LibraryAnalysisExtractionAdapters,
): LibraryAnalysisSourceExtractionResult {
  if (input.bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
    return {
      status: "blocked",
      reasonCode: "corrupt_payload",
      detail: "pdf_signature_missing",
    };
  }
  const probe = adapters.runPdfText(input.bytes);
  if (probe.exitCode !== 0) {
    return {
      status: "blocked",
      reasonCode: "corrupt_payload",
      detail: "pdf_text_extraction_failed",
    };
  }
  const pages = normalizeLineEndings(probe.stdout).split("\f");
  const units = pages.flatMap((page, pageIndex): LogicalContentUnit[] => {
    const text = page.trim();
    if (text.length === 0) return [];
    return [{
      unitType: "pdf_page",
      baseLocator: appendLocator(input.finalLocator, `page=${pageIndex + 1}`),
      ordinal: pageIndex,
      text,
    }];
  });
  if (units.length === 0) {
    return {
      status: "blocked",
      reasonCode: "ocr_required",
      detail: "pdf_contains_no_extractable_text",
    };
  }
  return readyResult(input.bytes, units, {
    name: "pdftotext",
    version: normalizedToolVersion(probe.toolVersion),
    workflowRef: "workflow.library-analysis.pdf-text-extraction",
    workflowVersion: "1.0.0",
  });
}

function readyResult(
  rawBytes: Buffer,
  units: LogicalContentUnit[],
  extractor: LibraryAnalysisExtractionToolBinding,
  documentLinkCandidates: string[] = [],
): LibraryAnalysisSourceExtractionResult {
  const normalizedText = units.map((unit) => unit.text).join("\f");
  return {
    status: "ready",
    rawSha256: sha256(rawBytes),
    normalizedTextSha256: sha256(Buffer.from(normalizedText, "utf8")),
    extractor,
    units,
    documentLinkCandidates,
    warnings: [],
  };
}

function decodeUtf8(bytes: Buffer): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function normalizeHtmlText(html: string): string {
  const withBlockBoundaries = html
    .replace(/<br\s*\/?\s*>/giu, "\n\n")
    .replace(/<\/(?:address|article|aside|blockquote|div|dl|fieldset|figure|footer|form|h[1-6]|header|li|main|nav|ol|p|pre|section|table|tr|ul|a)>/giu, "\n\n")
    .replace(/<[^>]+>/gu, " ");
  return decodeHtmlEntities(withBlockBoundaries)
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/giu, (match, entity: string) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith("#x")) {
      return safeCodePoint(Number.parseInt(normalized.slice(2), 16)) ?? match;
    }
    if (normalized.startsWith("#")) {
      return safeCodePoint(Number.parseInt(normalized.slice(1), 10)) ?? match;
    }
    return named[normalized] ?? match;
  });
}

function safeCodePoint(value: number): string | null {
  if (!Number.isInteger(value) || value < 0 || value > 0x10ffff) return null;
  if (value >= 0xd800 && value <= 0xdfff) return null;
  return String.fromCodePoint(value);
}

function extractSameOriginPdfLinks(html: string, finalLocator: string): string[] {
  let base: URL;
  try {
    base = new URL(finalLocator);
  } catch {
    return [];
  }
  const found = new Set<string>();
  const hrefPattern = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/giu;
  for (const match of html.matchAll(hrefPattern)) {
    const href = decodeHtmlEntities(match[1] ?? match[2] ?? match[3] ?? "");
    let candidate: URL;
    try {
      candidate = new URL(href, base);
    } catch {
      continue;
    }
    if (
      candidate.protocol === "https:" &&
      candidate.origin === base.origin &&
      candidate.username.length === 0 &&
      candidate.password.length === 0 &&
      candidate.hash.length === 0 &&
      candidate.pathname.toLowerCase().endsWith(".pdf")
    ) {
      found.add(candidate.href);
    }
  }
  return [...found].sort();
}

function normalizedToolVersion(value: string): string {
  return value.match(/\d+(?:\.\d+)+/u)?.[0] ?? value.trim();
}

function looksLikePdfLocator(locator: string): boolean {
  try {
    return new URL(locator).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

function appendLocator(locator: string, suffix: string): string {
  return `${locator}${locator.includes("#") ? "&" : "#"}${suffix}`;
}

function corruptUtf8(): LibraryAnalysisSourceExtractionResult {
  return {
    status: "blocked",
    reasonCode: "corrupt_payload",
    detail: "invalid_utf8",
  };
}

function corruptExtraction(
  detail: string,
): Extract<LibraryAnalysisSourceExtractionResult, { status: "blocked" }> {
  return {
    status: "blocked",
    reasonCode: "corrupt_payload",
    detail,
  };
}

function emptyExtraction(): LibraryAnalysisSourceExtractionResult {
  return {
    status: "blocked",
    reasonCode: "empty_extraction",
    detail: "extracted_text_empty",
  };
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}
