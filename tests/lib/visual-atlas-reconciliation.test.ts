import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path: string) => fs.readFileSync(path, "utf8");
const loops = JSON.parse(read("public/data/food-systems/circularity-loops.json"));
const loop = (id: string) => loops.existing_loops.find((row: { id: string }) => row.id === id);

test("vault distinguishes store-count proxy from turnover HHI", () => {
  const note = read("Food Systems Obsidian/10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md");
  assert.match(note, /butikkantall[\s\S]*3 445/i);
  assert.match(note, /omsetning[\s\S]*3 327[\s\S]*96,6 %/i);
  assert.match(note, /research\/CITABLE-ACCEPTANCE-TESTS\.md[\s\S]*CA-004/i);
  assert.match(note, /public\/data\/food-systems\/no\/value-chain\.json/i);
});

test("Nordic HHI note refuses an unharmonised ranking", () => {
  const note = read("Food Systems Obsidian/10 Innsiktskart/Innsikter/I10 Hele Norden er høykonsentrert.md");
  assert.match(note, /kan ikke rangeres direkte/i);
  assert.doesNotMatch(note, /Norge er ikke unikt, men mest ekstremt/);
});

test("unsupported Matsentralen and REKO quantities are unavailable", () => {
  assert.match(loop("no-matsentralen").volume, /^Unavailable:/);
  assert.match(loop("fi-se-reko").volume, /^Unavailable:/);
  assert.doesNotMatch(loop("no-matsentralen").volume, /5,735|10\.2M/);
  assert.doesNotMatch(loop("fi-se-reko").volume, /274|786,000|500 MNOK/);
  assert.doesNotMatch(JSON.stringify(loop("fi-se-reko")), /\b274\b/);
});

test("unresolved company identities are not deleted from generated state", () => {
  const companies = JSON.parse(read("data/vault-export/companies.json"));
  const ids = new Set(companies.map((row: { orgNr?: string }) => row.orgNr));
  assert.ok(ids.has("DK-38714295"));
  assert.ok(ids.has("DK-DAGROFA"));
});
