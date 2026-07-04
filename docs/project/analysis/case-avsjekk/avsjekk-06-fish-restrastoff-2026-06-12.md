---
tittel: Case-avsjekk 06 — 100% Fish / marint restråstoff (PILOT for avsjekk-formatet)
status: Intern analyse — pilot; formatet godkjennes av Gabriel før utrulling på de seks andre casene
eier: Gabriel
dato: 2026-06-12
scope: Dypdykk-avsjekk av caset mot eget underlag, målt mot JTs sirkularitetsdimensjoner (RP-seriens tema-tabell). Konklusjon per nøkkelspørsmål: BESVART / DELVIS / ÅPENT, og Deep Research-prompts for det som står åpent. Følger claim-lock; ingenting her er ekstern faktastemme.
relaterte_filer:
  - research/external/dro-0906/drr-0906-007-100-fish-iceland-ocean-cluster.md
  - research/external/spor1-uttak-2026-06-12/uttak-01-statistics-iceland-sja09114.md
  - research/external/spor1-uttak-2026-06-12/uttak-02-sintef-fhf-restrastoff.md
  - docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/analysis/food-tg-innsiktssyntese-2026-06-12.md
---

# Avsjekk: 100% Fish / marint restråstoff

## 1. Casets plass i JTs sirkularitetsramme

| JT-dimensjon (RP-tema) | Treffer caset? | Hvordan |
|---|---|---|
| Verdikjedeflyt og kast (RP-01) | Ja | Restråstoffstrømmen ER kasteleddet i sjømatkjeden; SINTEF-tallene er flytdata |
| R9 per ledd (RP-03) | Ja, kjernen | Dagens norske fordeling er i praksis R8/R9 (fôr/energi); caset handler om å flytte tonn opp mot R3–R7 (humant konsum, høyverdikomponenter) |
| Høyverdi vs. energiutnyttelse (RP-03/RP-04) | Ja, kjernen | Hele verdimiks-innsikten: 89 % «utnyttet», men 19 % går til biogass = energi, ikke løkke |
| Matsvinnkvalitet/kontaminering (RP-04) | Ja | Segregering ombord/på anlegg er kvalitetsgaten som avgjør om fraksjonen kan opp i hierarkiet |
| Næringsstoffløkker (RP-05) | Delvis | Marint restråstoff er N/P-bærer; kobler mot oppdrettsslam-delfeltet |
| Suksess/fiasko (RP-06) | Delvis | IOC/100% Fish er suksess-benchmark; norske høyverdi-forsøk hører i ledgeren |

R9-plassering i dag (internt, fra SINTEF-fordelingen): hovedvekt R8 (fôr 66 %) og R9 (biogass 19 %); målbildet i caset er forskyvning mot R3–R7. Energiutnytting skal aldri klassifiseres høyere enn R9 recover (JTs regel i RP-03).

## 2. Kunnskapsstatus per nøkkelspørsmål

Statusvokabular: **BESVART** = kan presenteres internt med kilde+locator innenfor claim-lock, ingen ny research nødvendig. **DELVIS** = kjernen står, men en navngitt bit mangler. **ÅPENT** = krever ny research (prompt finnes i kap. 4). **AKTØRGATE** = kan kun besvares av aktør/menneske — utenfor vår loop, ligger i AASK.

| # | Nøkkelspørsmål | Svar fra underlaget | Status |
|---|---|---|---|
| 1 | Hvor mye marint restråstoff finnes i Norge, og hvor mye utnyttes? | 1,094 mill. t tilgjengelig, 976 000 t utnyttet = 89 % (2024); trend 87→88→89 % fra 2022. Kilde: SINTEF/FHF 2024 (primær-PDF hentet 12.06; detaljer kryssjekket via Nofima 33/2025) | **BESVART** |
| 2 | Hva brukes det til — og hvor mye er reell løkke vs. energi? | Fôr 66 %, biogass 19 %, humant konsum ~15 %. Høyverdi (pharma/kosmetikk/kosttilskudd) omtales kun kvalitativt som «lite» — ingen andel finnes i kilden | **DELVIS** — aggregat besvart; høyverdi-andelen er udokumentert i offentlig statistikk (selve datagapet er et funn) |
| 3 | Hvor sitter det største norske gapet? | Havgående hvitfiskflåte: ~43 % utnyttelse (kystflåte ~95 %); ~118 000 t uutnyttet totalt, hovedsakelig sløyd om bord uten ilandføring; største enkeltfraksjon laksblod 34 300 t. Kilde: SINTEF/FHF 2024 | **BESVART** |
| 4 | Hva dokumenterer Island-benchmarken egentlig? | Clusterlogikk og produktkaskade: dokumentert (IOC/Matís). Bokstavelig «100 %»: svekket av Matís — claim-lock-formulering finnes. Landingsdata: SJA09114 trukket til CSV (1992–2024); SJA09110/04903 trukket 12.06 (fase 2) | **BESVART** (med claim-lock) |
| 5 | Hva er verdipotensialet ved segregering? | Retning og størrelsesorden: Skottland 2019 viser 3–7× prispremie (£62–173 vs. £250–520/t); Island viser verdivekst ved fallende volum (~85→~239 ISK/kg implisitt 2013→2024, nominelt). **Norske priser per fraksjon: ikke i underlaget** | **DELVIS** — retningen er solid, norsk pristabell mangler |
| 6 | Er Island–Norge-sammenligningen metodisk holdbar? | Strand et al. 2024 (Resources, Environment and Sustainability 16:100157) var forventet på lokal sti, men 13.06-mottaket dokumenterer at PDF-en ikke finnes i repoet. Artikkelen er derfor ikke lest eller vurdert mot SINTEF/FHF og SJA09114. | **ÅPENT** → prompt P-FISH-2 (primært en leseoppgave når PDF foreligger, ikke websøk) |
| 7 | Hvilke fraksjoner kan realistisk løftes i Norge — til hvilke markeder? | DRR-007 gir produktkaskaden konseptuelt (hoder, lever, rogn, skinn/kollagen, olje, enzymer); norsk fraksjon-til-marked-kobling med priser, volum og kvalitetskrav finnes ikke i underlaget | **ÅPENT** → prompt P-FISH-1 |
| 8 | Hvilke kvalitets-/regulatoriske krav avgjør om en fraksjon kan opp i hierarkiet? | Ikke dekket for marine strømmer i underlaget (fôrhygiene/ABP kat. 3, humant konsum-krav, ombordhåndtering) | **ÅPENT** → dekkes av RP-04-kjøringen med marint tillegg (P-FISH-3) |
| 9 | Hva sier IOC om metoden bak sine tall, og hva kan norske aktører (Pelagia, Lerøy, Scanbio m.fl.) dokumentere? | Krever aktørsvar; ligger som AASK-0906-006 + IOC claim-metode i DASK-0906-007 | **AKTØRGATE** — utenfor vår loop |

## 3. Konklusjon for caset

**Kjernen er besvart.** Spørsmål 1, 3 og 4 — den norske baselinen, gapet og benchmark-statusen — står på primærkilder med locator og tåler intern presentasjon i dag. Verdimiks-innsikten («Norden har løst utnyttelse, ikke verdi») er komplett som fortelling med fig4/fig5/fig6.

**Tre ting står åpent og har hver sin prompt (kap. 4):** norsk fraksjon-til-marked-tabell med priser (P-FISH-1), metodebroen Island–Norge (P-FISH-2 — leseoppgave på allerede hentet artikkel), og kvalitets-/regelverksgaten (P-FISH-3, som marint tillegg til RP-04 så vi ikke kjører dobbelt).

**Én ting skal vi bevisst IKKE researche mer på:** IOC-metoden og norske aktørdata — det er aktørgate (AASK), og mer websøk løser det ikke (samme konklusjon som DRR-008s fellestime).

## 4. Research-prompts (Deep Research-format)

Kjøreregel: hver prompt kjøres i egen tråd, ETTER masterprompten fra `food-tg-deep-research-prompt-pack-2026-06-10.md` + datamodus-tillegget fra `food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md` kap. 2. Output lagres som `deep-research-fish-<id>-YYYY-MM-DD.md` og går gjennom kontrollstacken (mottak → SRC/PCQ → claim-lock) før bruk.

### P-FISH-1: Norsk fraksjon-til-marked-tabell med priser

```text
Oppgave: Bygg en fraksjon-til-marked-tabell for norsk marint restråstoff, med priser der de finnes offentlig.

For hver fraksjon (hoder, lever, rogn/melke, slo/innmat, rygger/avskjær, skinn, blod — hvitfisk og laksefisk separat):
1. Dagens hovedanvendelse i Norge og estimert volum (kilde: SINTEF/FHF 2024-serien, rapportnr. 2025:00517 — bruk eksakte tabell-locatorer).
2. Dokumenterte norske høyverdianvendelser i drift i dag: produkt, produsent, marked — kun med navngitt aktør og kilde (årsrapport, produktside, eksportstatistikk). Eksempler å verifisere, ikke anta: tran/oljer, rogn til konsum, kollagen fra skinn, hydrolysat/proteinpulver, enzymer.
3. Prisindikasjoner per fraksjon og anvendelse: norsk eksportstatistikk (SSB/sjømatrådet per varenummer), auksjons-/markedspriser, eller publiserte bransjetall. Oppgi varenummer/HS-kode eksplisitt. Hvis pris kun finnes for produkt (f.eks. tran) og ikke råfraksjon, si det.
4. Sammenlign mot Skottland 2019-spennet (£62–173/t blandet vs. £250–520/t segregert) KUN som referanseramme — ikke som norsk fakta.

Leveranseformat: fraksjon | art/sektor | volum i dag | dagens sluttbruk | dokumentert høyverdianvendelse | aktør | prisindikasjon | enhet | år | kilde | URL | locator | datakvalitet.
Tomme prisceller er hovedfunn — rapporter dem eksplisitt i egen tabell.
Ikke bruk islandske priser som norske. Ikke estimer potensial i kroner. Ikke gjør aktørclaims utover det aktørens egne kanaler dokumenterer.
```

### P-FISH-2: Metodebro Island–Norge (leseoppgave på hentet kilde)

```text
Oppgave: Vurder om Island–Norge-sammenligning av restråstoffutnyttelse er metodisk holdbar, basert på Strand et al. 2024 (Resources, Environment and Sustainability 16:100157). Forventet locator-notat er `research/external/dro-0906/downloads/strand-etal-2024.md`. 13.06-mottaket dokumenterte opprinnelig at PDF-en manglet; 2026-07-04-closeout portet metadata/source note og `research/external/spor1-uttak-2026-06-12/uttak-09-fase2-uthenting-og-arkiv.md` inn fra recovery-worktree. Bruk uttak-09 som oppdatert metodebro-status før eventuell claim-lock.

Svar presist på:
1. Hvilke definisjoner bruker artikkelen for «restråstoff», «utnyttet» og «tilgjengelig» — og er de kompatible med (a) SINTEF/FHF-metoden (teoretisk tilgjengelig vs. anvendt) og (b) Hagstofa SJA09114 (registrerte landinger/disponering)?
2. Hvilke tall oppgir artikkelen for Island og Norge, for hvilke år, og med hvilke forbehold?
3. Hva er den sterkeste sammenligningen vi KAN gjøre med dekning i kildene — og hvilke sammenligninger må vi avstå fra (ikke-si-kandidater)?
4. Konkluder med claim-lock-forslag: 1–2 trygge formuleringer + 2–3 hold-tilbake-formuleringer.

Leveranseformat: definisjonstabell (begrep | artikkelens definisjon | SINTEF-ekvivalent | SJA09114-ekvivalent | kompatibel? ja/delvis/nei), deretter talltabell med locator (sidetall), deretter claim-forslagene.
Ikke hent nye eksterne kilder i denne kjøringen — dette er en lese- og metodevurdering av foreliggende dokument.
```

### P-FISH-3: Marint tillegg til RP-04 (kvalitets-/regelverksgate)

```text
Tilleggskrav til RP-04-kjøringen (matsvinnkvalitet), marint delfelt:

5. For marine restråstofffraksjoner spesifikt: hvilke krav i fôrhygieneregelverket, animaliebiproduktforordningen (kat. 3) og næringsmiddelregelverket avgjør om en fraksjon kan gå til (a) humant konsum, (b) fôr, (c) kun energi/biogass? Konkret: hva kreves av håndtering OM BORD (kjøling, tid, segregering) for at hoder/lever/rogn fra havgående flåte skal kunne ilandføres til konsum- eller fôrkvalitet — og er disse kravene den reelle årsaken til at ~57 % av havgående hvitfisk-restråstoff ikke utnyttes?
6. Finnes dokumenterte estimat på MERKOSTNADEN (utstyr, plass, tid) ved ombordhåndtering/ilandføring for havgående flåte — fra Nofima, SINTEF, FHF-prosjekter eller fartøyeiernes egne utredninger?

Samme leveranseformat som RP-04 (regelverkstabell + måletabell + strømtabell). Locator-krav: hjemmel med paragraf.
Ikke si at regelverket ER barrieren uten kilde som sier det — kostnads- og logistikkbarrierer kan være viktigere; rapporter begge spor.
```

## 5. Formatnotat (for utrulling til de seks andre)

Malen er kap. 1 (JT-dimensjonstreff) → kap. 2 (nøkkelspørsmål med firedelt status) → kap. 3 (konklusjon: besvart-kjerne / åpne prompts / bevisste stopp) → kap. 4 (prompts i v1-masterprompt-økosystemet, aldri frittstående). Avsjekkene nummereres etter casestatus-rekkefølgen: 01 kaffe, 02 kakao, 03 valio, 04 distribusjon, 05 spillvarme, 06 fish (denne), 07 skottland-polen. Promptbiblioteket er summen av kap. 4-ene + RP-serien, indeksert i én README når alle syv er kjørt.
