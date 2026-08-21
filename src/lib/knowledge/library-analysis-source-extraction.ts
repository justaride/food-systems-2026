import { createHash } from "node:crypto";

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
