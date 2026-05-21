# Statusrapport til Jan Thomas (HTML) — design

## Problem

Food Systems trenger en sendbar leveranse til Jan Thomas: en rapport som både
gir ham en kort inngang til plattformen og rapporterer hvor prosjektet står —
status og faglige funn. Dagens materiale er spredt: `teaser-jan-thomas-2026-04-30.md`
(utkast), hvitbok-kapitlene i appen, og statusdokumenter i `docs/project/status/`.
Ingenting av dette er ett samlet, sendbart dokument.

## Løsning

Én selvstendig HTML-fil, `RAPPORT-JAN-THOMAS-2026-05-21.html`, i repo-roten.
Rapport-tung: kort plattform-inngang, så prosjektstatus, så faglige funn, med
lenker inn i den deployede appen. Innhold syntetiseres fra eksisterende
materiale — ingen nye faglige påstander.

Filen følger mønsteret til de eksisterende `STATUS-*.html` / `RAPPORT-*.html`
i repo-roten: selvstendig, inline `<style>`, ingen eksterne avhengigheter.
`.gitignore` fanger `RAPPORT-*.html`, så filen er et lokalt, sendbart artefakt
og committes ikke.

### Dokumentstruktur

Seks seksjoner, i rekkefølge:

1. **Topptekst** — tittel («Food Systems 2026 — Statusrapport for Jan Thomas»),
   dato (21. mai 2026), «Til: Jan Thomas / Fra: Gabriel», én linje formål.
2. **Kort om plattformen** — 2-3 setninger om hva
   `food-systems.naturalstateproject.com` er; fremtredende lenke til forsiden;
   3-4 nøkkelsider å starte på (`/hvitbok`, `/graf`, `/sammenligning`,
   `/innsikt`) med én linje hver.
3. **Prosjektstatus** — hvor prosjektet står: datadekning, hva som er bygget,
   nylige milepæler. Konsist, punktbasert.
4. **Faglige funn** — de viktigste matsystem-innsiktene som seksjoner/kort.
   Hvert funn har en kildehenvisning og en lenke til relevant plattformside.
5. **Fokusområder og videre** — de fem foreslåtte satsingene (fra teaseren)
   som tabell, pluss neste steg.
6. **Bunntekst** — lenke til plattformen, kontakt (gabriel@naturalstate.no).

### Innholdskilder

Alt innhold synteseres fra eksisterende materiale — ingen nye påstander:

- **Faglige funn + fokusområder:** `teaser-jan-thomas-2026-04-30.md`
  (5 funn + fokusområde-tabell) og hvitbok-kapitlene i `content/hvitbok/`.
- **Prosjektstatus:** `docs/project/status/`-filene og git-historikk
  (hvitbok-ruten, produsent-separasjon, datadekning).
- **Plattform-inngang:** kort, faktisk beskrivelse av appen og dens sider
  (avledet fra `src/lib/data/nav.ts`).

### Lenker

Alle lenker er absolutte (`https://food-systems.naturalstateproject.com/...`)
siden filen er frittstående, og har `target="_blank" rel="noopener"`.

- Plattform-inngang → forsiden + `/hvitbok`, `/graf`, `/sammenligning`,
  `/innsikt`.
- Hvert faglig funn → sin relevante side (f.eks. `/eierskap`,
  `/forsyningskjede`, `/sammenligning`, `/havbruk`).
- Fokusområder → `/mandat`, `/innsikt`.

Hver lenkesti må tilsvare en reell rute under `src/app/`.

### Visuell stil

- Emerald/stone-palett som appen og `STATUS-CATHRINE-THOMAS-2026-04-29.html`
  — inline CSS-variabler, ren sans-serif-typografi, linjehøyde ~1.55.
- Faglige funn som kort med tydelig overskrift; nøkkeltall fremhevet visuelt
  (større/farget tall med enhet og kilde).
- Utskriftsvennlig: lesbar ved utskrift til PDF (ingen mørk bakgrunn på store
  flater, sidebrytning ikke kritisk).
- Responsiv nok til å leses på mobil (maks bredde ~720–800px, fluid).

### Verifisering

- Åpne filen i nettleser; bekreft at alle seks seksjoner rendres korrekt og at
  layouten er ren på både desktop-bredde og smal bredde.
- Bekreft at hver lenke er en velformet absolutt URL, og at hver sti tilsvarer
  en eksisterende rute under `src/app/`.
- Skriv ut til PDF (eller print-preview) og bekreft at dokumentet er lesbart.

## Avgrensning (YAGNI)

- Ingen generator, mal eller byggesteg — én håndlaget statisk fil.
- Gjenbruker ikke hvitbok-render-laget; rapporten er et frittstående øyeblikks-
  bilde som *lenker* til hvitbok, ikke avledes fra den.
- Ingen nye faglige påstander — kun syntese av eksisterende, kildebelagt
  materiale.
- Filen committes ikke (fanget av `.gitignore`).
