# Rapport AP-8: Skive 08

**Status:** FULLFØRT
**Agent:** Codex (GPT-5)
**Tidsrom:** 2026-08-04 – 2026-08-04 (nøyaktig klokkeslett ikke logget)
**Gren / worktree:** kun lesing
**Commits laget:** ingen

## 1. Hva som ble gjort

Jeg leste briefet og AP-8-fanout-instruksen i sin helhet, inkludert stoppregler, regelen om trygg fart og DATAGAP-taksonomien. Jeg hentet slice 08 fra manifestet, åpnet hver av de 26 manifestkildene i lesekatalogen og skrev én triage-post per identitetsnøkkel til skivens JSONL-fil.

Kildene omfatter to akademiske PDF-er, en juridisk konkurranseavgjørelse, en offentlig matsvinnrapport, svenske økologi- og havbruks-/ressursrapporter, en medieartikkel, CSV-/locatorfiler og flere interne research-synteser. Locatorer, mottaksdokumenter og interne synteser er merket som operational_control eller internal_synthesis når innholdet ikke er selve primærkilden. Ingen påstand er løftet fra kildeutsagn til bekreftet sannhet.

## 2. Kommandoer og resultat

- sed -n på 00-BRIEF-NATTSESJON.md og AP-8-kildelesing-fanout.md: brief, stoppregler, DATAGAP-slugs, skjema og rapportkrav lest.
- jq -c med slice 08-filter på triage-manifest.jsonl: 26 manifestenheter.
- pdfinfo og pdftotext på PDF-kildene: metadata, innholdsfortegnelse, sammendrag og relevante metode-/resultat-/konklusjonsseksjoner lest.
- sed -n på hver markdown-/CSV-kilde: alle 26 manifestkilder åpnet; lokale locatorer og mottaksnotater ble lest som de faktisk foreligger.
- Python JSON-validering av skivefila: 26 gyldige JSON-linjer, alle obligatoriske felt til stede, provisional=true og korrekt producedBy på alle poster.
- Manifest-/postkontroll: 26 manifest-ID-er, 26 poster, ingen manglende eller uventede ID-er, 26 av 26 kildestier finnes.
- DATAGAP-validering: ingen ugyldige slugs.
- Kildelesekatalogens Git-status etter lesing: ingen endringer i worktree.

## 3. Verifikasjon

- Antall enheter i skiven: **26**
- Antall poster skrevet: **26**
- readState:
  - read_fully: **22**
  - read_partially: **4**
  - unreadable: **0**
- verdictForOwner:
  - prioriter: **14**
  - standard: **7**
  - lav: **5**
  - ut_av_omfang: **0**
- machineRoleWasCorrect=false: **16 av 26**
- Duplikatmistanker: **ingen**

De tre mest verdifulle funnene i skiven:

1. document:cmp8xyokv00kgvvvmcn7xoh4l: Matsvinnutvalgets rapport rapporterer rundt 450 000 tonn kartlagt matsvinn i 2021 og rundt 73 500 tonn for dagligvare, grossist og KBS, samtidig som den beskriver definisjons- og dobbelttellingsusikkerhet.
2. document:cmp8xyoa100jxvvvmiwmt6hs8: Konkurranserådsavgjørelsen om Salling/Coop kombinerer konkret eierskaps- og grossiststruktur med en kundeundersøkelse på 6 122 respondenter og lokal overlappsanalyse.
3. document:cmp8xynbq00hlvvvmewdaausj: Nature-studien rapporterer kontrollerte forsøk der CB-01 reduserte N2O i flere jordtyper, men skiller dette fra usikker langtidseffekt i felt og modellert europeisk skalering.

DoD-punktene er innfridd for antall, JSONL-format, obligatoriske felt, provisional/provenance-felter, faktisk lesing, innholdsfunderte rolbegrunnelser, ordrette DATAGAP-slugs og differensierte owner-verdicts. Det er ikke skrevet til corpus, register, kø, evidence-pack eller andre filer enn skivens JSONL og denne rapporten.

## 4. Hva som gjenstår

Fire enheter er lest så langt den lokale kilden tillater, men er ikke fulltekst av den underliggende eksterne publikasjonen:

- WUR-rapporten om agri-residues
- KRAVs Ekobarometer 2023
- Blue Empire-landingssiden
- JRCs SPP-publikasjonsside

Disse er merket read_partially og skal ikke promoteres til full evidens uten separat åpning av underliggende PDF-/rapporttekst. De interne research-notatene og R12/R13-ledgerne trenger på samme måte primærkildekontroll før enkeltclaims kan brukes.

## 5. Beslutninger Gabriel må ta

1. Om de fire read_partially-enhetene skal prioriteres for fulltekstinnhenting. **Anbefaling:** ja, men behold locatorstatus og provisionalitet inntil fulltekst og metode er kontrollert.
2. Om de 16 feilklassifiserte maskinrollene skal sendes videre som et AP-9-systemfunn. **Anbefaling:** ja; særlig mottaks-README-er, interne synteser, locatorer og CSV-indeksen ble maskinelt foreslått som primary_evidence.
3. Om owner-review skal prioritere Type C-gapene for realisert nordisk fôrprotein og nasjonal oppdrettsslam-massestrøm. **Anbefaling:** ja; begge ledgerne viser eksplisitt at kapasitet, modellert utslipp og plan ikke er realisert volum.

## 6. Risiko og forbehold

- Alle poster er foreløpige og er triage, ikke claim-lock eller eiergodkjenning.
- Interne synteser refererer til eksterne kilder, men er ikke disse kildene; deres tall og status er derfor ikke bekreftet av denne triagen.
- Flere markeds-, kapasitets- og effektpåstander er aktør-, modell- eller sekundærkildepåstander.
- Svenske og danske kilder gir sammenligningsdata, ikke automatisk norsk evidens.
- machineRoleWasCorrect=false i 16 poster viser at filstiheuristikken ofte overvurderer materiale under eksterne/evidence-relaterte mapper som primærevidens.
- Delvise lesinger og manglende underliggende primærkilder er synliggjort i readNotes, qualityFlags, uncertainty og owner-verdict; ingen identiteter er flettet.
