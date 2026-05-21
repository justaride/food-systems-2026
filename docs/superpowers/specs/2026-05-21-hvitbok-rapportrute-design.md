# Hvitbok-rapportrute — design

## Problem

Food Systems mangler en strukturert, visuelt polert flate for prosjektets
*egne* leveranser — notater, rapporter og informasjonsskriv til Jan Thomas og
transition group. Dagens `/rapporter` er en database-drevet liste over
*eksterne* rapporter, og «Nordisk sirkularitetsrapport» er en isolert statisk
side uten navigasjon eller kobling til appens visualiseringer. Leveranser bor
ellers som løse `.md`/`.html`-filer i repo-roten.

Søsterprosjektet Circular Cities har en `/hvitbok`-funksjon — ett sammenhengende
dokument delt i navigerbare kapitler, der hvert kapittel rendres som stylet HTML
og lenker til relevante visualiseringer. Denne specen tar samme mønster inn i
Food Systems, men med rikere innebygde elementer (levende grafer, faktabokser).

## Løsning

En ny `/hvitbok`-rute: ett levende hvitbok-dokument delt i kapitler. Kapittel-
prosa lagres som markdown-filer i repoet og rendres til rikt stylet HTML.
Markdown kan inneholde plassholder-tokens som flettes til React-komponenter
(nøkkeltall-bokser, callout-bokser, innebygde grafer, relaterte-viz-kort).

`/rapporter` forblir uendret. Hvitboka er en separat, ny rute med eget nav-punkt.

### Arkitektur

To ruter, statisk generert via `generateStaticParams`:

- **`/hvitbok`** — innholdsfortegnelse: hero + kapittelliste med status og
  målgruppe per kapittel.
- **`/hvitbok/[chapter]`** — kapittelside: header-kort, rendret innhold med
  innebygde embeds, prev/neste-navigasjon.

Et nytt nav-punkt **«Hvitbok»** legges til i `src/components/layout/Header.tsx`.

### Filstruktur

```
content/hvitbok/                       ← kapittel-markdown (ny mappe, git-versjonert)
src/lib/hvitbok/
  chapters.ts        ← typet kapittelregister + oppslagsfunksjoner
  loader.ts          ← leser .md-fil fra disk, teller ord
  embeds.ts          ← embed-typer + per-kapittel embed-definisjoner
  render-chapter.tsx ← token-parser: splitter på {{type:id}}, fletter inn komponenter
src/components/hvitbok/
  KeyFigureBox.tsx   ← nøkkeltall-boks
  CalloutBox.tsx     ← callout/sitat-boks
  RelatedVisuals.tsx ← «Relaterte visualiseringer»-kort
  EmbeddedChart.tsx  ← innebygd levende graf
src/app/hvitbok/page.tsx           ← innholdsfortegnelse
src/app/hvitbok/[chapter]/page.tsx ← kapittelside
```

`content/hvitbok/` er en ny toppnivå-mappe. Den leses ikke av
`scripts/import-root-docs.ts` (som leser navngitte rotfiler + `docs/meetings/`)
og skal ikke gitignoreres.

### Enheter

**Kapittelregister — `src/lib/hvitbok/chapters.ts`**

- `type Chapter = { slug: string; number: string; title: string;
  subtitle?: string; filePath: string; audience?: string; status?: string }`.
- `chapters: Chapter[]` — kapitler i rekkefølge.
- `getChapterBySlug(slug): Chapter | undefined`.
- `getAdjacentChapters(slug): { prev?: Chapter; next?: Chapter }`.

**Loader — `src/lib/hvitbok/loader.ts`**

- `readChapterMarkdown(filePath: string): string` — leser fila relativt til
  prosjektroten; kaster hvis fila mangler.
- `countChapterWords(filePath: string): number`.

**Embed-register — `src/lib/hvitbok/embeds.ts`**

Fire embed-typer. Innhold defineres typet, knyttet til kapittel-slug + token-id:

| Type | Komponent | Definisjonsform |
|---|---|---|
| `nokkeltall` | `KeyFigureBox` | `{ label: string; value: string; enhet?: string; kilde: string }` |
| `callout` | `CalloutBox` | `{ tekst: string; kilde?: string; variant: 'info' \| 'sitat' \| 'advarsel' }` |
| `viz` | `EmbeddedChart` el. `RelatedVisuals` | `{ chartId?: string; href: string; label: string; description: string }` |
| `relatert` | `RelatedVisuals` | liste av `{ href; label; description }` |

- `chapterEmbeds: Record<string, Record<string, EmbedDefinition>>` — ytre nøkkel
  kapittel-slug, indre nøkkel token-id.
- `getEmbed(chapterSlug, tokenId): EmbedDefinition | undefined`.
- `EMBEDDABLE_CHARTS: Set<string>` — kortliste over `chartId`-er som kan rendres
  som levende graf. `viz`-embeds med `chartId` utenfor lista faller tilbake til
  lenkekort.

**Token-renderer — `src/lib/hvitbok/render-chapter.tsx`**

- `renderChapter(markdown: string, chapterSlug: string): ReactNode[]`.
- Tokens er blokk-nivå: en `{{type:id}}` regnes kun som token når den står
  alene på en linje. En `{{...}}` som forekommer inne i et avsnitt lar
  parseren stå urørt som bokstavelig tekst.
- Splitter markdown på blokk-nivå-tokens.
- Markdown-segmenter rendres via `marked` (`gfm: true`) til HTML.
- På hver token-posisjon slås embed-definisjonen opp og tilsvarende komponent
  flettes inn.
- Selve split/parse-logikken er en ren funksjon og enhetstestes.

**Embed-komponenter — `src/components/hvitbok/`**

Presentasjonelle server-komponenter (ingen klient-JS unntatt der en innebygd
graf krever det). `EmbeddedChart` gjenbruker eksisterende, selvstendige chart-
komponenter fra `src/components/charts`.

**Sider**

- `src/app/hvitbok/page.tsx` — hero + kapittelliste fra `chapters`.
- `src/app/hvitbok/[chapter]/page.tsx` — `generateStaticParams` over alle slugs;
  header-kort (nummer, tittel, subtittel, status, målgruppe, ordtelling);
  rendret innhold via `renderChapter`; prev/neste-navigasjon.

### Dataflyt

Ved bygg/forespørsel: side leser `Chapter` fra registeret → `loader` leser
`.md`-fila → `renderChapter` splitter teksten, rendrer markdown-segmenter og
slår opp embed-definisjoner i `embeds.ts` → produserer et flettet React-tre.

### Feilhåndtering

- Ukjent kapittel-slug → `notFound()`.
- Token uten embed-definisjon → integritetstesten feiler (fanges før deploy);
  i `NODE_ENV=development` rendres en synlig inline-advarsel i stedet for å
  krasje siden.
- Manglende `.md`-fil → loaderen kaster ved bygg; integritetstesten fanger det
  tidligere.

### Testing

Tester med `node:test` (FS-konvensjon):

- **Token-parser:** korrekt segmentering; ukjent token-type; token alene på
  linje gir embed mens `{{...}}` inne i et avsnitt blir stående som tekst;
  markdown uten tokens; tomt innhold.
- **Integritetstest:** alle kapittel-slugs unike; alle `filePath` finnes på
  disk; hver token i hver `.md`-fil har en embed-definisjon; hver embed-
  definisjon refereres av minst én token (ingen døde definisjoner); alle
  `viz`-`href`-er peker på en eksisterende app-rute.

Embed-komponentene er presentasjonelle og verifiseres via lint, typecheck,
full testsuite og dev-server — konsistent med øvrige presentasjonskomponenter
i repoet.

### Startinnhold

2-3 ekte kapitler seedes fra eksisterende materiale, slik at ruten er reelt
brukbar når implementeringsplanen er ferdig:

1. **Kort til Jan Thomas** — fra `teaser-jan-thomas-2026-04-30.md` (5 funn +
   fokusområde-tabell).
2. **Nordisk sirkularitet** — fra sirkularitetsrapport-materialet
   (`public/reports/nordisk-sirkularitetsrapport-2026-05.html`).
3. Ett ytterligere kapittel fra samme kilder, valgt etter hva som gir et
   sammenhengende dokument.

Hvert seed-kapittel demonstrerer minst én `nokkeltall`-, `callout`- og
`viz`-embed, så de fungerer som mønster for senere kapitler.

## Avgrensning (YAGNI)

- Ingen database — kapitler er markdown-filer i git.
- Ingen redigering inne i appen.
- Ingen MDX/JSX i kapittelfiler — kun plassholder-tokens.
- Ikke enhver visualiseringsrute er innebyggbar; kun `EMBEDDABLE_CHARTS`-lista.
  Resten er lenkekort. Lista kan utvides senere uten endring i token-systemet.
- `/rapporter` og «Nordisk sirkularitetsrapport»-siden røres ikke.
