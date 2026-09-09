import { z } from "zod";

import {
  candidateAnalysisSha256,
  type CandidateJsonValue,
} from "./candidate-analysis-contract";

export const LIBRARY_ANALYSIS_WORK_PACKET_SCHEMA =
  "library-analysis-work-packet/v1" as const;

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const nonEmptyTextSchema = z.string().min(1);

export type LibraryAnalysisWorkPacketInput = {
  contentUnitId: string;
  locator: string;
  text: string;
};

export type LibraryAnalysisWorkItem = {
  itemId: string;
  contentUnitId: string;
  locator: string;
  startCodePoint: number;
  endCodePoint: number;
  text: string;
  kind: "content" | "heading" | "table_header" | "table_separator";
  contextItemIds: string[];
};

export type LibraryAnalysisWorkPacket = {
  schema: typeof LIBRARY_ANALYSIS_WORK_PACKET_SCHEMA;
  items: LibraryAnalysisWorkItem[];
  workPacketHash: string;
};

const LibraryAnalysisWorkItemSchema = z.object({
  itemId: nonEmptyTextSchema,
  contentUnitId: nonEmptyTextSchema,
  locator: nonEmptyTextSchema,
  startCodePoint: z.number().int().nonnegative(),
  endCodePoint: z.number().int().nonnegative(),
  text: nonEmptyTextSchema,
  kind: z.enum(["content", "heading", "table_header", "table_separator"]),
  contextItemIds: z.array(nonEmptyTextSchema),
}).strict();

export const LibraryAnalysisWorkPacketSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_WORK_PACKET_SCHEMA),
  items: z.array(LibraryAnalysisWorkItemSchema),
  workPacketHash: hashSchema,
}).strict();

export type LibraryAnalysisItemCoverage = {
  itemId: string;
  status: "covered" | "blocked" | "structural";
  claimOrdinals: number[];
  reason?: string;
};

export const LibraryAnalysisItemCoverageSchema = z.array(z.object({
  itemId: nonEmptyTextSchema,
  status: z.enum(["covered", "blocked", "structural"]),
  claimOrdinals: z.array(z.number().int().nonnegative()),
  reason: nonEmptyTextSchema.optional(),
}).strict());

export type LibraryAnalysisWorkClaim = {
  localOrdinal: number;
  contentUnitId: string;
  evidence: string;
};

export function buildLibraryAnalysisWorkPacket(
  units: readonly LibraryAnalysisWorkPacketInput[],
): LibraryAnalysisWorkPacket {
  const items: LibraryAnalysisWorkItem[] = [];
  const headingStack = new Map<number, string>();

  for (const unit of units) {
    if (unit.contentUnitId.length === 0 || unit.locator.length === 0) {
      throw new Error("library_analysis_work_unit_identity_required");
    }
    const lines = splitLines(unit.text);
    const tableKinds = classifyTableLines(lines);
    headingStack.clear();
    let activeTableHeader: string | undefined;
    let activeTableSeparator: string | undefined;

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]!;
      if (line.text.trim().length === 0) {
        activeTableHeader = undefined;
        activeTableSeparator = undefined;
        continue;
      }
      // Thematic breaks carry no claim-bearing text. Treat them like other
      // layout-only lines, while leaving GFM table separators to the table
      // classifier below.
      if (tableKinds.get(index) === undefined && isThematicBreak(line.text)) {
        activeTableHeader = undefined;
        activeTableSeparator = undefined;
        continue;
      }
      const kind = tableKinds.get(index) ?? (isHeading(line.text) ? "heading" : "content");
      const isTableLine =
        kind === "table_header" ||
        kind === "table_separator" ||
        (kind === "content" && isTableRow(line.text));
      if (activeTableHeader !== undefined && (!isTableLine || kind === "table_header")) {
        activeTableHeader = undefined;
        activeTableSeparator = undefined;
      }
      if (kind === "heading") {
        const level = headingLevel(line.text)!;
        for (const existing of headingStack.keys()) {
          if (existing >= level) headingStack.delete(existing);
        }
      }
      const contextItemIds = [...headingStack.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, itemId]) => itemId);
      if (kind === "table_separator" && activeTableHeader !== undefined) {
        contextItemIds.push(activeTableHeader);
      } else if (activeTableHeader !== undefined && kind === "content" && activeTableSeparator !== undefined) {
        contextItemIds.push(activeTableHeader, activeTableSeparator);
      }

      const itemId = workItemId({
        contentUnitId: unit.contentUnitId,
        locator: unit.locator,
        startCodePoint: line.startCodePoint,
        endCodePoint: line.endCodePoint,
        text: line.text,
        kind,
      });
      const item: LibraryAnalysisWorkItem = {
        itemId,
        contentUnitId: unit.contentUnitId,
        locator: unit.locator,
        startCodePoint: line.startCodePoint,
        endCodePoint: line.endCodePoint,
        text: line.text,
        kind,
        contextItemIds,
      };
      items.push(item);

      if (kind === "heading") {
        const level = headingLevel(line.text)!;
        headingStack.set(level, itemId);
        activeTableHeader = undefined;
        activeTableSeparator = undefined;
      } else if (kind === "table_header") {
        activeTableHeader = itemId;
        activeTableSeparator = undefined;
      } else if (kind === "table_separator") {
        activeTableSeparator = itemId;
      } else if (kind === "content" && activeTableHeader !== undefined && activeTableSeparator !== undefined && !isTableRow(line.text)) {
        // A non-table line closes the table context.
        activeTableHeader = undefined;
        activeTableSeparator = undefined;
      }
    }
  }

  const core = { schema: LIBRARY_ANALYSIS_WORK_PACKET_SCHEMA, items };
  return {
    ...core,
    workPacketHash: candidateAnalysisSha256(
      "library-analysis-work-packet",
      core as CandidateJsonValue,
    ),
  };
}

export function validateLibraryAnalysisItemCoverage(
  packet: LibraryAnalysisWorkPacket,
  coverage: readonly LibraryAnalysisItemCoverage[],
  claims: readonly LibraryAnalysisWorkClaim[],
  units: readonly LibraryAnalysisWorkPacketInput[],
): void {
  const authoritativePacket = buildLibraryAnalysisWorkPacket(units);
  if (
    packet.schema !== authoritativePacket.schema ||
    packet.workPacketHash !== authoritativePacket.workPacketHash ||
    JSON.stringify(packet.items) !== JSON.stringify(authoritativePacket.items)
  ) {
    throw new Error("library_analysis_work_packet_mismatch");
  }
  const itemById = new Map<string, LibraryAnalysisWorkItem>();
  for (const item of packet.items) {
    if (itemById.has(item.itemId)) throw new Error("library_analysis_work_item_duplicate");
    itemById.set(item.itemId, item);
  }
  if (coverage.length !== itemById.size) throw new Error("library_analysis_work_coverage_item_set_mismatch");

  const claimByOrdinal = new Map<number, LibraryAnalysisWorkClaim>();
  for (const claim of claims) {
    if (claimByOrdinal.has(claim.localOrdinal)) throw new Error("library_analysis_work_claim_ordinal_duplicate");
    claimByOrdinal.set(claim.localOrdinal, claim);
  }
  const mapped = new Set<number>();
  const seenCoverage = new Set<string>();
  for (const row of coverage) {
    if (!itemById.has(row.itemId) || seenCoverage.has(row.itemId)) {
      throw new Error("library_analysis_work_coverage_item_set_mismatch");
    }
    seenCoverage.add(row.itemId);
    const item = itemById.get(row.itemId)!;
    const rowClaims = new Set(row.claimOrdinals);
    if (rowClaims.size !== row.claimOrdinals.length) throw new Error("library_analysis_work_row_claim_duplicate");
    for (const ordinal of row.claimOrdinals) {
      const claim = claimByOrdinal.get(ordinal);
      if (claim === undefined) throw new Error("library_analysis_work_claim_mapping_invalid");
      if (claim.contentUnitId !== item.contentUnitId || !evidenceOverlapsItem(claim.evidence, item, units)) {
        throw new Error("library_analysis_work_claim_evidence_mismatch");
      }
      mapped.add(ordinal);
    }
    if (row.status === "covered" && row.claimOrdinals.length === 0) {
      throw new Error("library_analysis_work_covered_claim_required");
    }
    if (row.status === "blocked" && (row.claimOrdinals.length > 0 || !hasReason(row.reason))) {
      throw new Error("library_analysis_work_blocked_reason_required");
    }
    if (row.status === "structural" && (row.claimOrdinals.length > 0 || !hasReason(row.reason) || item.kind === "content")) {
      throw new Error("library_analysis_work_structural_item_invalid");
    }
  }
  if (seenCoverage.size !== itemById.size) throw new Error("library_analysis_work_coverage_item_set_mismatch");
  if (mapped.size !== claimByOrdinal.size) throw new Error("library_analysis_work_claim_unmapped");
}

type Line = { startCodePoint: number; endCodePoint: number; text: string };

function splitLines(text: string): Line[] {
  const points = Array.from(text);
  const lines: Line[] = [];
  let start = 0;
  for (let index = 0; index <= points.length; index += 1) {
    const delimiter = points[index];
    if (index !== points.length && delimiter !== "\n" && delimiter !== "\r") continue;
    lines.push({ startCodePoint: start, endCodePoint: index, text: points.slice(start, index).join("") });
    start = index + (delimiter === "\r" && points[index + 1] === "\n" ? 2 : 1);
    if (delimiter === undefined) break;
  }
  return lines;
}

function classifyTableLines(lines: readonly Line[]): Map<number, "table_header" | "table_separator"> {
  const kinds = new Map<number, "table_header" | "table_separator">();
  for (let index = 0; index + 1 < lines.length; index += 1) {
    if (isTableRow(lines[index]!.text) && isTableSeparator(lines[index + 1]!.text)) {
      kinds.set(index, "table_header");
      kinds.set(index + 1, "table_separator");
    }
  }
  return kinds;
}

function isHeading(text: string): boolean { return /^\s*#{1,6}(?:\s|$)/u.test(text); }
function headingLevel(text: string): number | undefined { return /^\s*(#{1,6})(?:\s|$)/u.exec(text)?.[1].length; }
function isTableRow(text: string): boolean { return /^\s*\|.*\|\s*$/u.test(text); }
function isTableSeparator(text: string): boolean { return /^\s*\|?\s*:?-{1,}:?\s*(?:\|\s*:?-{1,}:?\s*)+\|?\s*$/u.test(text); }
function isThematicBreak(text: string): boolean { return /^ {0,3}([*_-])(?:[ \t]*\1){2,}[ \t]*$/u.test(text); }

function workItemId(item: Omit<LibraryAnalysisWorkItem, "itemId" | "contextItemIds">): string {
  return `library-analysis-work-item:${candidateAnalysisSha256("library-analysis-work-item", item as CandidateJsonValue)}`;
}

function evidenceOverlapsItem(
  evidence: string,
  item: LibraryAnalysisWorkItem,
  units: readonly LibraryAnalysisWorkPacketInput[],
): boolean {
  if (evidence.length === 0) return false;
  const unit = units.find((candidate) => candidate.contentUnitId === item.contentUnitId);
  if (unit === undefined) return false;
  let searchFrom = 0;
  while (searchFrom <= unit.text.length - evidence.length) {
    const utf16Start = unit.text.indexOf(evidence, searchFrom);
    if (utf16Start < 0) return false;
    const startCodePoint = Array.from(unit.text.slice(0, utf16Start)).length;
    const endCodePoint = startCodePoint + Array.from(evidence).length;
    if (startCodePoint < item.endCodePoint && endCodePoint > item.startCodePoint) return true;
    searchFrom = utf16Start + 1;
  }
  return false;
}

function hasReason(reason: string | undefined): boolean {
  return reason !== undefined && reason.trim().length > 0;
}
