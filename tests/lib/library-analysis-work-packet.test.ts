import assert from "node:assert/strict";
import test from "node:test";

import {
  LibraryAnalysisItemCoverageSchema,
  buildLibraryAnalysisWorkPacket,
  validateLibraryAnalysisItemCoverage,
} from "../../src/lib/knowledge/library-analysis-work-packet";

test("builds exact Unicode and CRLF line ranges", () => {
  const packet = buildLibraryAnalysisWorkPacket([{
    contentUnitId: "unit-1",
    locator: "source:1",
    text: "\n## Sápmi 🧭\r\nTall 2\r\n\r\n",
  }]);
  assert.deepEqual(packet.items.map(({ text, startCodePoint, endCodePoint }) => ({ text, startCodePoint, endCodePoint })), [
    { text: "## Sápmi 🧭", startCodePoint: 1, endCodePoint: 11 },
    { text: "Tall 2", startCodePoint: 13, endCodePoint: 19 },
  ]);
  assert.equal(packet.items.length, 2);
  assert.equal(packet.items[0]?.text, "## Sápmi 🧭");
});

test("hashes and structural context are stable", () => {
  const input = [{
    contentUnitId: "unit-1",
    locator: "source:1",
    text: "# Parent\n## Child\n| A | B |\n| --- | --- |\n| 1 | 2 |",
  }];
  const first = buildLibraryAnalysisWorkPacket(input);
  const second = buildLibraryAnalysisWorkPacket(input);
  assert.equal(first.workPacketHash, second.workPacketHash);
  assert.equal(first.items[1]?.kind, "heading");
  assert.deepEqual(first.items[1]?.contextItemIds, [first.items[0]?.itemId]);
  assert.equal(first.items[2]?.kind, "table_header");
  assert.deepEqual(first.items[2]?.contextItemIds, [first.items[0]?.itemId, first.items[1]?.itemId]);
  assert.equal(first.items[3]?.kind, "table_separator");
  assert.deepEqual(first.items[3]?.contextItemIds, [first.items[0]?.itemId, first.items[1]?.itemId, first.items[2]?.itemId]);
});

test("coverage accepts covered, structural, and blocked rows", () => {
  const packet = buildLibraryAnalysisWorkPacket([{
    contentUnitId: "unit-1",
    locator: "source:1",
    text: "## Company\nRevenue was 42.\n\nBlocked detail",
  }]);
  const content = packet.items.filter((item) => item.kind === "content");
  const heading = packet.items.find((item) => item.kind === "heading")!;
  const claims = [{ localOrdinal: 7, contentUnitId: "unit-1", evidence: "Revenue was 42." }];
  const units = [{ contentUnitId: "unit-1", locator: "source:1", text: "## Company\nRevenue was 42.\n\nBlocked detail" }];
  const coverage = [
    { itemId: heading.itemId, status: "structural" as const, claimOrdinals: [], reason: "heading" },
    { itemId: content[0]!.itemId, status: "covered" as const, claimOrdinals: [7] },
    { itemId: content[1]!.itemId, status: "blocked" as const, claimOrdinals: [], reason: "source unavailable" },
  ];
  assert.deepEqual(LibraryAnalysisItemCoverageSchema.parse(coverage), coverage);
  assert.doesNotThrow(() => validateLibraryAnalysisItemCoverage(packet, coverage, claims, units));
});

test("coverage rejects missing, duplicate, foreign, and false mappings", () => {
  const packet = buildLibraryAnalysisWorkPacket([{ contentUnitId: "unit-1", locator: "s", text: "One\nTwo" }]);
  const units = [{ contentUnitId: "unit-1", locator: "s", text: "One\nTwo" }];
  const [one, two] = packet.items;
  const claim = { localOrdinal: 1, contentUnitId: "unit-1", evidence: "One" };
  assert.throws(() => validateLibraryAnalysisItemCoverage(packet, [], [], units), /item_set_mismatch/u);
  assert.throws(() => validateLibraryAnalysisItemCoverage(packet, [
    { itemId: one!.itemId, status: "covered", claimOrdinals: [1] },
    { itemId: one!.itemId, status: "covered", claimOrdinals: [1] },
  ], [claim], units), /item_set_mismatch/u);
  assert.throws(() => validateLibraryAnalysisItemCoverage(packet, [
    { itemId: one!.itemId, status: "covered", claimOrdinals: [1] },
    { itemId: "foreign", status: "blocked", claimOrdinals: [], reason: "x" },
  ], [claim], units), /item_set_mismatch/u);
  assert.throws(() => validateLibraryAnalysisItemCoverage(packet, [
    { itemId: one!.itemId, status: "covered", claimOrdinals: [1] },
    { itemId: two!.itemId, status: "covered", claimOrdinals: [] },
  ], [claim], units), /covered_claim_required/u);
  assert.throws(() => validateLibraryAnalysisItemCoverage(packet, [
    { itemId: one!.itemId, status: "covered", claimOrdinals: [1] },
    { itemId: two!.itemId, status: "blocked", claimOrdinals: [], reason: "x" },
  ], [{ ...claim, evidence: "Two" }], units), /evidence_mismatch/u);
});

test("all claims must be mapped and foreign claims are rejected", () => {
  const packet = buildLibraryAnalysisWorkPacket([{ contentUnitId: "unit-1", locator: "s", text: "One" }]);
  const units = [{ contentUnitId: "unit-1", locator: "s", text: "One" }];
  const item = packet.items[0]!;
  const row = { itemId: item.itemId, status: "covered" as const, claimOrdinals: [1] };
  assert.throws(() => validateLibraryAnalysisItemCoverage(packet, [row], [], units), /claim_mapping_invalid/u);
  assert.throws(() => validateLibraryAnalysisItemCoverage(packet, [row], [{ localOrdinal: 1, contentUnitId: "unit-2", evidence: "One" }], units), /evidence_mismatch/u);
});

test("one multiline claim may cover multiple exact item ranges", () => {
  const units = [{ contentUnitId: "unit-1", locator: "s", text: "## Company\nRevenue 42\nEmployees 7" }];
  const packet = buildLibraryAnalysisWorkPacket(units);
  const [heading, revenue, employees] = packet.items;
  const claim = { localOrdinal: 3, contentUnitId: "unit-1", evidence: "## Company\nRevenue 42\nEmployees 7" };
  assert.doesNotThrow(() => validateLibraryAnalysisItemCoverage(packet, [
    { itemId: heading!.itemId, status: "structural", claimOrdinals: [], reason: "heading" },
    { itemId: revenue!.itemId, status: "covered", claimOrdinals: [3] },
    { itemId: employees!.itemId, status: "covered", claimOrdinals: [3] },
  ], [claim], units));
});

test("table context continues through rows and stops before prose", () => {
  const units = [{ contentUnitId: "unit-1", locator: "s", text: "# H\n| A | B |\n| --- | --- |\n| 1 | 2 |\n| 2 | 3 |\nProse" }];
  const packet = buildLibraryAnalysisWorkPacket(units);
  const rows = packet.items.filter((item) => item.text.startsWith("| 1") || item.text.startsWith("| 2"));
  const prose = packet.items.find((item) => item.text === "Prose")!;
  const tableHeader = packet.items.find((item) => item.kind === "table_header")!;
  assert.ok(rows.every((row) => row.contextItemIds.includes(tableHeader.itemId)));
  assert.equal(prose.contextItemIds.includes(tableHeader.itemId), false);
});

test("sibling headings do not retain a previous sibling context", () => {
  const packet = buildLibraryAnalysisWorkPacket([{ contentUnitId: "unit-1", locator: "s", text: "## One\nbody\n## Two\nbody" }]);
  const headings = packet.items.filter((item) => item.kind === "heading");
  assert.equal(headings[1]!.contextItemIds.includes(headings[0]!.itemId), false);
});

test("coverage rejects a forged packet even with matching looking coverage", () => {
  const units = [{ contentUnitId: "unit-1", locator: "s", text: "One" }];
  const packet = buildLibraryAnalysisWorkPacket(units);
  const forged = { ...packet, items: [{ ...packet.items[0]!, text: "Forged" }] };
  assert.throws(() => validateLibraryAnalysisItemCoverage(forged, [
    { itemId: packet.items[0]!.itemId, status: "covered", claimOrdinals: [1] },
  ], [{ localOrdinal: 1, contentUnitId: "unit-1", evidence: "One" }], units), /packet_mismatch/u);
});
