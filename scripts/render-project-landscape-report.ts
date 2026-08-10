import fs from "node:fs";
import path from "node:path";

type Row = Record<string, any>;
const root = process.cwd();
const landscapeDir = path.join(root, "research", "landscape");
const evidenceDir = path.join(root, "research", "evidence-pack", "project-landscape-2026-08-10");
const readJsonl = (name: string): Row[] => fs.readFileSync(path.join(landscapeDir, name), "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const projects = readJsonl("projects-2026-08-10.jsonl");
const candidates = readJsonl("longlist-2026-08-10.jsonl");
const sources = readJsonl("sources-2026-08-10.jsonl");
const searchPasses = readJsonl("search-log-2026-08-10.jsonl");
const ranked = [...projects].sort((a, b) => b.analysis.priorityScore - a.analysis.priorityScore || a.canonicalName.localeCompare(b.canonicalName, "nb"));
const ids = (rows: Row[]) => rows.map((row) => row.id).join(",");
const esc = (value: unknown) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const listIds = (rows: Row[]) => rows.map((row) => `\`${row.id}\``).join(", ");
const projectLink = (project: Row) => project.urls.official || project.urls.documentation || project.urls.publication;
const countryLabels: Record<string, string> = { NO: "Norge", SE: "Sverige", DK: "Danmark", FI: "Finland", IS: "Island", GL: "Grønland", FO: "Færøyene", AX: "Åland" };
const countryRows = Object.entries(countryLabels).map(([code, label]) => {
  const matches = projects.filter((project) => project.geography.countries.includes(code));
  return `| ${label} | ${matches.length} | ${matches.length ? listIds(matches) : "Eksplisitt hull"} |`;
});
const sapmi = projects.filter((project) => project.geography.indigenousRegions.includes("Sápmi"));
countryRows.push(`| Sápmi | ${sapmi.length} | ${sapmi.length ? listIds(sapmi) : "Eksplisitt hull"} |`);

const themeMap: Array<[string, string, (project: Row) => boolean]> = [
  ["Produksjon", "production", (p) => p.coverage.valueChainStages.includes("production")],
  ["Foredling", "processing", (p) => p.coverage.valueChainStages.some((v: string) => ["processing", "small_scale_processing"].includes(v)) || p.coverage.themes.includes("small_scale_processing")],
  ["Distribusjon", "distribution", (p) => p.coverage.valueChainStages.some((v: string) => ["distribution", "supply_chain"].includes(v)) || p.coverage.themes.includes("supply_chain")],
  ["Forbruk og helse", "consumption", (p) => p.coverage.valueChainStages.includes("consumption") || p.coverage.themes.includes("consumption_health")],
  ["Sjømat", "seafood", (p) => p.coverage.themes.includes("seafood")],
  ["Lokalmat", "local_food", (p) => p.coverage.themes.includes("local_food")],
  ["Sirkularitet", "circularity", (p) => p.coverage.themes.includes("circularity")],
  ["Beredskap", "preparedness", (p) => p.coverage.themes.includes("preparedness") || p.coverage.themes.includes("resilience")],
  ["Makt/governance", "governance", (p) => p.coverage.themes.includes("governance") || p.coverage.themes.includes("food_democracy") || p.coverage.valueChainStages.includes("system_governance")],
  ["Data/modeller", "data_models", (p) => p.coverage.themes.includes("data_models") || ["dataset", "model"].includes(p.entityKind)],
];
const themeRows = themeMap.map(([label, , predicate]) => { const matches = projects.filter(predicate); return `| ${label} | ${matches.length} | ${listIds(matches.slice(0, 8))}${matches.length > 8 ? ", …" : ""} |`; });

const winnerSpecs: Array<[string, keyof Row["analysis"]]> = [
  ["Direkte overlapp", "directOverlap"], ["Komplementaritet", "complementarity"], ["Nordisk relevans", "nordicRelevance"],
  ["Kvalitativ dybde", "qualitativeDepth"], ["Læringsnyhet", "learningNovelty"], ["Overførbarhet", "transferability"],
  ["Modenhet", "maturity"], ["Samarbeidspotensial", "collaborationPotential"],
];
const winnerRows = winnerSpecs.map(([label, field]) => {
  const max = Math.max(...projects.map((project) => project.analysis[field]));
  const winners = ranked.filter((project) => project.analysis[field] === max).slice(0, 4);
  return `| ${label} | ${max}/5 | ${listIds(winners)} |`;
});

const table = (rows: Row[], start = 1) => rows.map((project, index) => `| ${start + index} | \`${project.id}\` | [${esc(project.canonicalName)}](${projectLink(project)}) | ${project.entityKind} | ${project.analysis.priorityScore.toFixed(2)} | ${project.analysis.evidenceScore.toFixed(1)} | ${project.lifecycle.status} |`).join("\n");
const independent = sources.filter((source) => source.independence === "independent");
const ownerAffiliated = sources.filter((source) => ["owner", "affiliated"].includes(source.independence));
const rightsUnknown = sources.filter((source) => ["unknown", "link_only"].includes(source.rightsStatus));
const qualitativeProjects = projects.filter((project) => project.methods.some((method: Row) => ["qualitative", "ethnographic", "participatory"].includes(method.type)));
const evaluatedFindings = projects.flatMap((project) => project.qualitativeFindings).filter((finding) => finding.type === "evaluated_outcome" || finding.evidenceStatus === "independently_documented");
const ownerReportedFindings = projects.flatMap((project) => project.qualitativeFindings).filter((finding) => ["owner_reported", "project_reported"].includes(finding.evidenceStatus));
const missingDates = projects.filter((project) => !project.lifecycle.startDate || !project.lifecycle.endDate);
const active = projects.filter((project) => project.lifecycle.status === "active");
const completed = projects.filter((project) => ["completed", "archived"].includes(project.lifecycle.status));

const report = `# Revidert nordisk prosjektlandskap og styrt kunnskapsinntak

Versjon og cutoff: \`2026-08-10\`

Formål: intern, kildeavgrenset beslutningsstøtte — ikke en fullstendig Norden- eller verdenscensus.

<!-- TOP10_IDS: ${ids(ranked.slice(0, 10))} -->
<!-- TOP25_IDS: ${ids(ranked.slice(0, 25))} -->
<!-- TOP40_IDS: ${ids(ranked)} -->

## Go/no-go

**GO for intern prioritering og metodevalg. NO-GO for ukvalifisert ekstern publisering, effektpåstander, automatisk databaseinntak og kontakt med prosjektene.** Registeret har nøyaktig ${projects.length} scorebare hovedprofiler, ${candidates.length} kandidat-/disposisjonsrader og ${sources.length} kilder. Den strategiske scoren er skilt fra evidenskvaliteten.

Alle hovedprofiler har dokumentert identitet og statuskilde. ${independent.length} av ${sources.length} kilder er klassifisert som uavhengige; ${ownerAffiliated.length} er eier- eller prosjektnære. Prosjektresultater beholdes derfor som *rapporterte* med mindre en uavhengig evaluering faktisk støtter dem. Completion-registeret er fortsatt kanonisk for kilde-, menneske- og publiseringsporter.

## Topp 10

| Rang | ID | Profil | Entitet | Strategisk | Evidens | Livsløp |
|---:|---|---|---|---:|---:|---|
${table(ranked.slice(0, 10))}

## Topp 25

| Rang | ID | Profil | Entitet | Strategisk | Evidens | Livsløp |
|---:|---|---|---|---:|---:|---|
${table(ranked.slice(0, 25))}

## Topp 40

| Rang | ID | Profil | Entitet | Strategisk | Evidens | Livsløp |
|---:|---|---|---|---:|---:|---|
${table(ranked, 1)}

## Porteføljevinnere per perspektiv

| Perspektiv | Høyeste verdi | Profiler |
|---|---:|---|
${winnerRows.join("\n")}

Vinnerne er sammenligningspunkter, ikke en samlet kvalitetsdom. En teknisk modell kan vinne på modenhet, mens et samisk prosjekt kan vinne på kvalitativ dybde og læringsnyhet.

## Geografisk dekning

| Område | Verifiserte profiler | Dokumentasjon |
|---|---:|---|
${countryRows.join("\n")}

Færøyene er den verifiserte småøys-/selvstyrte dekningscellen. Grønland og Åland er fortsatt eksplisitte hull på prosjektnivå og skal søkes på nytt i neste daterte versjon.

## Tematisk dekning

| Celle | Antall | Eksempler |
|---|---:|---|
${themeRows.join("\n")}

Matrisen viser forekomst, ikke jevn dybde. Foredling, sjømat og beredskap har færre kvalitative caser enn produksjon, governance og data/modeller.

## Dataunderlag

- ${projects.length} hovedprofiler har strukturerte \`dataAssets\`, metoder, leveranser og livsløp; ${active.length} er aktive og ${completed.length} avsluttet/arkivert ved cutoff.
- ${qualitativeProjects.length} profiler dokumenterer minst én kvalitativ, etnografisk eller deltakende metode. Det er en tydelig forbedring fra det teknisk orienterte seed-settet, men ikke tilstrekkelig til å behandle alle 40 likt som kvalitative caser.
- ${missingDates.length} profiler mangler fortsatt minst én eksakt start-/sluttdato. Status kan være verifisert fra en aktiv flate selv om komplett livsløp ikke er dokumentert; dette er synlig og scoreøker ikke evidensen.
- ${rightsUnknown.length} kilder har ukjent eller lenke-begrenset rettighetsstatus. Ingen rå PDF-er eller intervjumateriale er lagret i Git.
- Eierkilder dokumenterer identitet, formål og rapporterte resultater. De teller ikke som uavhengig evaluering, og antallet deres inngår ikke i strategisk score.

## Kvalitative læringsmønstre

1. **Kunnskapsstyring er selve designet.** \`biebmolassi\` og \`mahtut\` viser hvorfor urfolkskunnskap, språk, samtykke, eierskap og sitatrett må modelleres som porter — ikke som fritekst pyntet på et datasett.
2. **Lokale markedsnettverk er sosial infrastruktur.** \`digifood\` kombinerer observasjon, spørreundersøkelser og digitale spor rundt REKO. Prosjektets egen rapportering sier samtidig at påvirkning på bredere matpolitikk er vanskelig å fastslå; begrensningen er et læringsfunn, ikke et hull som skal skjules.
3. **Samskaping krever rolle- og maktbevissthet.** \`foster-fokis\`, \`innofoodlabs\`, \`trails4soil\` og \`agroecology-partnership\` er overførbare metodebanker for living labs, men deltakelse i seg selv dokumenterer ikke effekt eller representativitet.
4. **Rapportert utfall må ikke bli evaluert utfall ved transformasjon.** Registeret har ${ownerReportedFindings.length} eier-/prosjektrapporterte kvalitative funn og ${evaluatedFindings.length} uavhengig dokumenterte/evaluerte funn. Resten er dokumenterte beskrivelser, intern analyse, åpne spørsmål eller menneskeporter.
5. **Beredskap og helse trenger egne kvalitative spor.** De verifiserte nordiske programmene gir struktur og indikatorer, mens ResNor, RegioFoodS, CREEP og FULCRUM forblir kandidater til dedikerte prosjektposter og resultater foreligger.

## Usikkerhet og konflikter

- Strategisk relevans er en intern vurdering; evidensscore beskriver dokumentasjonskvalitet og skal leses separat.
- \`independent\` betyr uavhengig av prosjektets eier/konsortium og domene for den aktuelle metadata- eller metodepåstanden. Det betyr ikke automatisk at kilden er en uavhengig effektevaluering.
- Finansieringsregistre kan bekrefte identitet, periode og plan, men prosjektinnsendt perioderapportering beskrives fortsatt som rapportert.
- Samiske kilder gir ikke tillatelse til å hente, sitere eller gjenbruke intervjuer, workshopmateriale eller tradisjonell kunnskap. Slike handlinger er \`human_gated\`.
- Longlisten er ikke rangert. \`candidate\`, \`not_same\`, \`duplicate\`, \`source_blocked\` og \`human_gated\` må løses før eventuell promotering.
- Cutoff er låst til 10. august 2026. Senere aktivitet krever ny datert versjon, ikke overskriving av denne.

## Prioriterte neste handlinger

1. Løs dedikerte prosjektidentiteter og metode-/resultatkilder for \`resnor\`, \`regiofoods\`, \`creep-food-systems\` og \`fulcrum-food-systems-labs\`; behold dem utenfor rangeringen til det er gjort.
2. Kjør et nytt, datert dybdepass for Grønland og Åland, og dokumenter enten kvalifiserte treff eller eksplisitt nullfunn.
3. Finn uavhengige evalueringer av de høyest rangerte eier-rapporterte utfallene. Oppgrader bare den konkrete claimkoblingen, aldri hele prosjektet samlet.
4. Utarbeid separate intervju-/workshopprotokoller for samiske kunnskapsbærere, lokale produsenter, REKO-administratorer, beredskapsaktører og offentlige innkjøpere. Protokollen må angi målgruppe, kunnskapshull, samtykke, lagring, rettigheter og sitatgodkjenning før kontakt.
5. Bruk feltmappingen i README til en senere, eksplisitt dry-run mot \`SourceCitation\`, \`Document\` og \`LibraryAnalysisRecord\`. Ikke kjør \`--apply\`, og ikke map eksterne prosjekter til \`Actor\` eller \`ProjectTask\`.

## Søke- og stopregelstatus

${searchPasses.length} søkepass dekker ${new Set(searchPasses.map((pass) => pass.sourceClass)).size} kildeklasser. Hver klasse har to pass; pass 2 har null nye kvalifiserte Tier A/B-treff og en eksplisitt stopbegrunnelse. Dette lukker avtalt pass ved cutoff, men er ikke et fullstendighetsbevis.

## Reproduserbarhet

Rapportens rangering, vinnerkort, dekningsmatriser og nøkkeltall genereres fra JSONL med:

\`\`\`bash
npm run landscape:report
npm run landscape:validate
\`\`\`

Rangeringen bruker: \`0,20 direkte overlapp + 0,15 komplementaritet + 0,15 nordisk relevans + 0,15 kvalitativ dybde + 0,15 læringsnyhet + 0,10 overførbarhet + 0,05 modenhet + 0,05 samarbeidspotensial\`.
`;

fs.writeFileSync(path.join(landscapeDir, "report-2026-08-10.md"), report);
fs.mkdirSync(evidenceDir, { recursive: true });
const selectedIds = new Set(["biebmolassi", "mahtut", "digifood", "foster-fokis", "innofoodlabs", "trails4soil", "agroecology-partnership", "nordic-healthy-sustainable-food-systems", "nordic-food-alert", "resnor", "regiofoods", "creep-food-systems", "fulcrum-food-systems-labs", "nordforsk-food-security-call-2026"]);
const manifest = sources.filter((source) => selectedIds.has(source.projectId)).map((source) => ({ sourceId: source.id, projectId: source.projectId, url: source.url, accessedAt: source.accessedAt, locator: source.locator, captureMethod: source.captureMethod, localPath: source.localPath, fileHash: source.fileHash, rightsStatus: source.rightsStatus, intakeStatus: source.intakeStatus }));
fs.writeFileSync(path.join(evidenceDir, "verified-source-manifest-2026-08-10.jsonl"), `${manifest.map((row) => JSON.stringify(row)).join("\n")}\n`);
console.log(`Rendered report and ${manifest.length}-row evidence manifest.`);
