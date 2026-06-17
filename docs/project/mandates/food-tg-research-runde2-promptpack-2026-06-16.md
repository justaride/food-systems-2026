---
tittel: Food TG — Research runde 2: prompt-pack for de seks underdekkede feltene
status: Aktiv intern arbeidsordre (utkast v0.1)
eier: Gabriel
dato: 2026-06-16
scope: Planlegger en gated researchprosess + leverer prompter for de seks feltene vurderingen 16.06 flagget som underdekket — Fisk-bacalhau Norge–Brasil, akvaponikk/nutrient loops, kunstgjødsel/Yara/biogas, Danmark/animalsk, offentlig innkjøp, Nederland. To-lags promptmodell: forståelsesprompt (orientering) + datasøk-prompt (claim-locked intake).
bruksregel: >
  Ingen claim åpnes av denne filen. Datasøk-output går gjennom samme kontrollstack som all annen Deep Research (mottakslogg → SRC/PCQ → claim-lock → casekort). Forståelsesprompt-output er bakgrunn/orientering, merkes `forståelse — ikke faktastemme`, og skal ALDRI importeres til claim-lock, casestatus, deck eller ekstern tekst som fakta. Datasøk-promptene for de nye benchmark-casene (Danmark, Nederland) bør sekvenseres etter/med uke25-minimumsvedtaket, ikke startes som drift.
relaterte_filer:
  - docs/project/analysis/food-tg-vurdering-mote11-vs-uke25-2026-06-16.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md
  - docs/project/analysis/case-avsjekk/README.md
  - docs/project/analysis/case-avsjekk/kjoreordre-case-avsjekk-prompter-2026-06-12.md
  - docs/project/mandates/food-tg-minimumsvedtak-casekort-2026-06-09.md
---

# Research runde 2 — prompt-pack for de seks underdekkede feltene

## 1. Hva jeg tenker (anbefaling først)

Tre ting før vi kjører noe:

**(1) Det meste er allerede skrevet — gapet er kjøring + mottak, ikke prompting.** Da jeg krysset de seks feltene mot promptbiblioteket, viste det seg at **fire av seks allerede har ferdige prompter** i RP-serien og case-biblioteket. De er bare aldri *kjørt* gjennom Deep Research og tatt inn via mottakskjeden. Det betyr at jobben er billigere enn den ser ut: disiplinkostnaden ligger i intaket (mottakslogg → SRC/PCQ → claim-lock), ikke i å forfatte nytt. Bare **to felt** (Danmark/animalsk og Nederland) er reelle prompt-hull — de forfatter jeg ferdig her.

**(2) Den reelle risikoen er at runde 2 undergraver JTs spissing.** Hele poenget hans 09.06 var å gå *fra* «hele matsystemet». Hvis vi promoterer alle seks til likestilte case-avsjekker, er vi tilbake på 13 case og har re-bredd scopet. Derfor **tierer** jeg dem (se §2): noen foldes inn i eksisterende kjernespor, noen holdes eksplisitt som benchmark — ikke som nye norske case.

**(3) To-lags promptmodell — som svarer direkte på det du ba om.** Du ba om både «konkrete søk» og «overhengende kunnskap og forståelse». Det er to forskjellige behov som ikke skal blandes:
- **Forståelsesprompt** (ny type, §3): bygger lagforståelse av feltet — aktører, mekanismer, hva som er omstridt, hvor gearingen ligger. Bevisst *ikke* claim-locked. Masterprompt v1 forbyr «generelt essay» med vilje — så forståelsessporet må holdes fysisk adskilt fra datastacken, ellers forurenser det claim-lock.
- **Datasøk-prompt** (eksisterende stack): den smale, tabelltvingende, primærkilde-først-jakten som mates inn i modellene.

**Sekvens jeg anbefaler:** forståelsespromptene kan kjøres nå (lav risiko, ingen claims). Datasøk-promptene — særlig de to nye benchmark-casene — bør **gates på uke25-minimumsvedtaket** (alternativ A/B/C i `jt-beslutningssaker-uke-25`). Å starte en andre case-bølge før det første minimumsvedtaket er låst, er nøyaktig «bygge rundt et uavklart sentrum»-feilen vurderingsnotatet advarte mot. La runde 2 være et *bevisst* utvidelsesvedtak, ikke drift.

**Kort sagt:** kjør forståelsessporet fritt nå for å bygge teamets felt-forståelse; kjør RP-02 (bacalhau) og RP-05 (nutrient loops/gjødsel) som de neste datakjøringene siden de styrker eksisterende kjernespor; elevér offentlig innkjøp fra dist-tillegg til egen C-undercase; hold Danmark og Nederland som benchmark som først åpnes av minimumsvedtaket.

---

## 2. Dekningskart — felt × eksisterende prompt × tier

| Felt (vurderingen 16.06) | Finnes allerede som | Reelt gap | Tier | Anbefalt behandling |
|---|---|---|---|---|
| **Fisk-bacalhau Norge–Brasil** | **RP-02** (handelsaksen Norge↔Brasil: soya HS 1201/2304 inn, klippfisk HS 0305 ut + Comtrade speiltall) — skrevet, prioritet 2, ikke kjørt | Kjøring + intake + sirkularitets-/Scope3-vinkel | **1 — kjernespor** | Kjør RP-02 nå. Folder inn i fôr/import-hovedsporet. Legg til én case-validerings-prompt for bacalhau-spesifikt (P-BACALHAU-1, §4.1). |
| **Akvaponikk / hydroponi / nutrient loops** | **RP-05 delfelt A** (oppdrettsslam/næringstap) + **RP-08** (spillvarme/drivhus datadel) + avsjekk-05 (kjørt) | Nutrient-loop-vinkelen, ikke generisk hydroponi | **1 — kjernespor** | IKKE eget akvaponikk-case. Folder inn i **RP-05** som næringsstoffløkke (slam → plante). Akvaponikk = én rad i RP-05-ledgeren. |
| **Kunstgjødsel / Yara / Haber-Bosch / biogas** | **RP-05 delfelt C** (mineralgjødsel vs. gjenvunnet næring) + RP-04 (biorest/mikroplast) | Yara/Haber-Bosch industrikontekst; biogass-digestat som gjødselerstatter | **1 — kjernespor** | Slå sammen med nutrient-loops til ÉN «næringsstoffløkker»-case via RP-05. Forståelsesprompt §4.3 dekker Yara/Haber-Bosch-konteksten. |
| **Offentlig innkjøp (DK/København)** | **P-DIST-2** (offentlige innkjøp som alt. kanal, avsjekk-04) + RP-06 (innkjøp som fix) | Elevering fra dist-tillegg til egen vinkel | **1–2 — C-undercase** | Elevér P-DIST-2 til egen C-gate-undercase. JT vektla dette sterkt; i dag er det et tillegg under distribusjon. |
| **Danmark / animalsk (svin/meieri)** | — (berører RP-01 for DK + RP-07 DK-narrativ) | **Reelt prompt-hull** | **2 — benchmark** | Ny datasøk-prompt §4.4. Strikt benchmark: «hva kan Norden lære», ikke norsk pilot. Par med offentlig innkjøp (begge DK). |
| **Nederland** | — | **Reelt prompt-hull** | **2 — benchmark** | Ny datasøk-prompt §4.6. KUN benchmark/inspirasjon. **Wageningen-guardrail (Møte 9): WUR-score/Moerman skal ikke brukes som nordisk bevis.** |

**Lesning:** Tier 1 utvider *eksisterende* spor (fôr/import, B-sidestrøm, C-adoption) — det er trygt mot scope-creep. Tier 2 er eksplisitt benchmark — de tilfører læring uten å åpne nye norske case-løp.

---

## 3. To-lags promptmodell

### Lag A — Forståelsesprompt (ny type)

**Formål:** gi teamet *overhengende kunnskap og forståelse* i et felt før/ved siden av de smale datajaktene — mentale modeller, hovedaktører, mekanismer, hva som er omstridt, hvor gearingen ligger.

**Hard regel:** forståelsesprompt-output er **orientering, ikke faktastemme.** Den lagres separat (`research/forstaelse/forstaelse-<felt>-YYYY-MM-DD.md`), merkes `forståelse — ikke faktastemme`, og importeres **aldri** til claim-lock, casestatus, deck eller ekstern tekst som fakta. Hvis et forståelsesnotat avdekker en konkret påstand vi vil bruke, skal den re-hentes som primærkilde gjennom datasøk-sporet — forståelsesnotatet teller ikke som kilde.

#### Forståelsesprompt — mastermal (kopier først, fyll inn feltblokken fra §4)

```text
Du er fagbriefer for Food Systems Transition Group i Natural State. Oppgaven er å gi teamet en presis, ærlig ORIENTERING i et felt — slik at vi kan stille bedre spørsmål og lese senere data riktig. Dette er IKKE en faktakilde og skal ikke ende i en sluttrapport som bevis; det er en mental modell.

Skriv strukturert, ikke som essay. Vær eksplisitt på hva som er etablert, hva som er omstridt, og hva du er usikker på. Når du oppgir et tall eller en påstand, marker den som [etablert] / [omstridt] / [anekdotisk] og ta med kilde der du kan — men målet er forståelse, ikke kildejakt.

Lever i denne strukturen:
1. Feltet på 5 setninger: hva det handler om og hvorfor det er relevant for sirkularitet i nordiske matsystemer.
2. Systemkart: hovedleddene/strømmene i feltet, og hvor verdien/tapet sitter. Gjerne som enkel tekst-flyt (A → B → C).
3. Nøkkelaktører og roller: hvem produserer, kontrollerer, regulerer, finansierer, forsker — navngitt, med ett ord om rolle.
4. De viktigste mekanismene: de 5–8 årsak-virkning-relasjonene man må forstå for å lese feltet riktig.
5. Hva er omstridt / misforstått: vanlige feilslutninger, motstridende narrativer, tall som ofte gjengis feil.
6. Hvor er gearingen for sirkularitet: hvor i feltet kan et tiltak faktisk flytte noe (høyverdi, ikke bare volum)? Hvor er det bare symbolikk?
7. Systembarrierer: marked, distribusjon, pris, regulering, kapital, data, kultur — hvilke gjelder her?
8. Nordisk vinkel: hva er spesifikt nordisk/norsk her, og hva er importert kontekst?
9. Koblinger til våre spor: A (fôr/import), B (sidestrøm/restråstoff), C (distribusjon/adoption) — hvor treffer feltet?
10. De 8–12 spørsmålene vi burde kunne svare på etter datasøk — rangert etter beslutningsverdi.
11. Ordliste: 10–15 fagbegreper teamet bør kjenne, med én linje hver.
12. Lese-/lyttetips: 5 autoritative innganger (rapporter, datasett, oversikter) for videre fordypning.

Avslutt med: "Tre ting vi sannsynligvis tar feil om i dette feltet i dag."

Felt og fokus for denne kjøringen:
{LIM INN FELTBLOKK FRA §4}
```

### Lag B — Datasøk-prompt (eksisterende stack)

Bruk **uendret** den etablerte kjøreregelen: **masterprompt v1** (`food-tg-deep-research-prompt-pack-2026-06-10.md`) + **datamodus-tillegget** (RP-filen kap. 2) + selve datasøk-prompten. Output → `deep-research-r2-<felt>-YYYY-MM-DD.md` → kjør **valideringsprompten** → mottakslogg → SRC/PCQ → claim-lock → casekort. Ingen aktørkontakt.

For Tier 1-feltene er datasøk-prompten allerede skrevet (RP-02, RP-05, P-DIST-2) — §4 peker på eksakt ID og hva case-valideringslaget legger til. For Tier 2 (Danmark, Nederland) står de nye, fullstendige datasøk-promptene i §4.4 og §4.6.

---

## 4. Per felt — forståelsesblokk + datasøk

> Bruk: kopier feltblokken inn i forståelsesprompt-malen (§3) for orienteringssporet. For datasporet, følg «Datasøk»-anvisningen.

### 4.1 Fisk-bacalhau Norge–Brasil (Tier 1)

**Feltblokk (til forståelsesprompt):**
```text
Felt: Den bilaterale mat-handelsaksen Norge–Brasil. Fokus: klippfisk/saltfisk/tørrfisk (bacalhau) UT av Norge til Brasil, og soya/fôrråvarer INN til Norge fra Brasil — som to motstrømmer i samme akse. Hvorfor det er sirkularitets-relevant: norsk matproduksjon ser nasjonal ut i territorielle regnskap, men er avhengig av importerte innsatsfaktorer (fôr); samtidig eksporterer vi høyverdi marint protein. Belys Scope 3, importavhengighet, beredskap, og hva avhengigheten av brasiliansk soya betyr for norsk kjøtt/oppdrett. Sentrale aktører: norske fôrkonsern, sjømateksportører, Sjømatrådet, brasilianske importører, soyaleverandører. Kontroverser: avskoging/EUDR på soya, «selvforsyning» korrigert for fôr.
```
**Datasøk:** Kjør **RP-02** (allerede skrevet i RP-filen §4) — masterprompt v1 + datamodus + RP-02. Den dekker HS 1201/2304 (soya inn), HS 0305 (klippfisk ut), Brasil-andel og Comtrade speiltall-kontroll.
**Case-valideringstillegg (nytt, P-BACALHAU-1 — kjøres i RP-02-tråden):**
```text
Tilleggskrav til RP-02: For bacalhau-motstrømmen spesifikt, lever (a) tidsserie norsk klippfisk/saltfisk-eksport til Brasil 2015–nyeste år (tonn + verdi, HS 0305), (b) Brasils andel av total norsk klippfiskeksport, (c) eventuelle dokumenterte restråstoff-/sidestrøms-tap i klippfiskproduksjonen (avskjær, salt, lake) med kilde, og (d) om noe primærkildemateriale kobler de to strømmene (soya-avhengighet + bacalhau-eksport) i samme analyse. Ikke koble til EUDR-vurdering her — kun datagrunnlag. Rapporter tomme celler eksplisitt.
```

### 4.2 Akvaponikk / hydroponi / nutrient loops (Tier 1 — foldes inn i RP-05)

**Feltblokk (til forståelsesprompt):**
```text
Felt: Næringsstoffløkker i matproduksjon — kan næringsstrømmer fra oppdrett (slam/fekalier/fôrspill) og urbant avløp gjøres sirkulære og brukes i planteproduksjon? Presiser: mye norsk grønnsaksproduksjon (agurk, tomat) er ALLEREDE hydroponisk/substratbasert — poenget er ikke at hydroponi er nytt, men om NÆRINGSSTRØMMENE kan lukkes (oppdrettsslam → plante; svartvann → P/N/K). Skill akvaponikk (fisk+plante koblet), hydroponi (substrat+næringsløsning) og vertikal dyrking. Sentrale spørsmål: hva hindrer trygg, effektiv bruk av oppdrettsslam i plantenæring; hvor står norske aktører; hva er gearingen vs. symbolikk.
```
**Datasøk:** Kjør **RP-05 delfelt A** (oppdrettsslam, oppsamlingsgrad, bruk) — masterprompt v1 + datamodus + RP-05. Akvaponikk registreres som rad(er) i RP-05-ledgeren, IKKE som eget case. Ikke dupliser spillvarme-datadelen (den ligger i RP-08).

### 4.3 Kunstgjødsel / Yara / Haber-Bosch / biogas (Tier 1 — samme RP-05-case)

**Feltblokk (til forståelsesprompt):**
```text
Felt: Mineralgjødsel og næringsstoffenes industrielle kretsløp. Bakgrunn: Haber-Bosch-prosessen muliggjorde enorm produktivitetsvekst, men skaper avhengighet av energi/fossil gass, jordforringelse, avrenning og lineære N/P/K-strømmer. Norge har en historisk/industriell posisjon via Hydro/Yara. Fokus for oss: kan gjenvunnet næring (biogass-digestat/biorest, oppdrettsslam, husdyrgjødsel) erstatte virgin mineralgjødsel — med hvilken kvalitet, mengde og barriere (mikroplast, hygiene, logistikk, regelverk)? Skill energiutnyttelse (forbrenning/biogass UTEN næringsretur) fra ekte næringssirkularitet. Sentrale aktører: Yara, biogassaktører, NIBIO, RISE, Miljødirektoratet.
```
**Datasøk:** Kjør **RP-05 delfelt C** (mineralgjødselforbruk vs. potensial i gjenvunnet næring) sammen med delfelt A/B i samme tråd, og koble til **RP-04** (biorest/mikroplast-kvalitet) for kontamineringsbarrieren. Resultatet blir ÉN «næringsstoffløkker»-case (slam + svartvann + gjødselkobling), ikke tre. Yara/Haber-Bosch-industrikonteksten dekkes av forståelsessporet, ikke av en egen claim.

### 4.4 Danmark / animalsk — svin & meieri (Tier 2 — benchmark, NY datasøk-prompt)

**Feltblokk (til forståelsesprompt):**
```text
Felt: Dansk animalsk produksjon (svin, meieri) som nordisk benchmark — høy produksjon, stor eksport, og sterke miljøpolitiske konflikter rundt areal, vann, nitrogen og klima. Belys: skala og eksportandel; nitrogen-/arealpolitikk og eventuell nedskalering; CO2-avgift på landbruk; Arla som systemaktør (soyafri/fôr-governance); husdyrgjødsel → biogass (Danmark er biogass-ledende). Hva kan Norge/Norden lære? Hva er IKKE overførbart (struktur, klima, eksportmodell)? Hold dette som læring, ikke som norsk fasit.
```
**Datasøk (ny — P-DK-ANIMALSK-1; masterprompt v1 + datamodus + denne):**
```text
Case: Dansk animalsk produksjon (svin + meieri) som benchmark for nordisk sirkularitet og politikkvirkemidler. Mål: strukturert data, ikke essay. Strikt benchmark — ikke norsk pilotbevis.

Valider/hent mot primærkilder:
1. Skala: dansk svine- og melkeproduksjon nyeste år (antall dyr, slaktevolum tonn, melkevolum tonn, eksportandel %), HS-koder/definisjon oppgitt. Kilde: Danmarks Statistik, Landbrug & Fødevarer.
2. Miljø/areal/nitrogen: hva sier danske primærkilder (Miljøstyrelsen, Aarhus DCE, lovtekst) om nitrogen-/arealregulering, «grøn trepart»-avtalen og eventuell CO2-afgift på landbruk — vedtatt tekst, ikraftdato, omfang? Skill vedtatt fra foreslått.
3. Eventuell nedskalering av svineproduksjon: hva er faktisk dokumentert (tall, vedtak, frivillig vs. regulatorisk), og hva er bare medieomtale?
4. Fôr-governance: Arlas soya-/fôrkrav (egne rapporter) — soyafri/avskogingsfri policy, dokumentert omfang. Skill «soyafri» fra «importfri».
5. Husdyrgjødsel → biogass: dansk biogass fra husdyrgjødsel (andel, anlegg, digestat-bruk som gjødsel) — Energistyrelsen/biogass-bransje.

Leveranseformat: per punkt en datatabell (metrikk | verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet) + kildeledger. Oppgi om data finnes som datasett (API/CSV) eller bare rapport.
Søkestrenger (DK + EN): "Danmarks Statistik" svineproduktion mælkeproduktion eksport; "grøn trepart" landbrug kvælstof aftale; CO2-afgift landbrug Danmark lovtekst; Arla soy deforestation-free feed report; biogas husdyrgødsel digestat Danmark Energistyrelsen.
Ikke si at Danmark er en norsk pilot. Ikke bland vedtatt politikk med forslag. Rapporter tomme celler eksplisitt. Skill overførbart fra ikke-overførbart i en egen kort merknad.
```

### 4.5 Offentlig innkjøp (DK/København) (Tier 1–2 — elevér P-DIST-2)

**Feltblokk (til forståelsesprompt):**
```text
Felt: Offentlig innkjøp som etterspørselsmotor for sirkulære/bærekraftige matverdikjeder — ikke bare som klima-/miljøsymbol. JT løftet København spesielt (svært høy økologisk andel i offentlige måltider). Spørsmål: hvilke virkemidler gjør at Danmark/København ligger høyt på økologisk og foodservice; hva er mekanismen (omlegging av menyer/sesong/innkjøpskrav, ikke bare mer penger); kan skolemåltider/kantiner gjøre sirkulære verdikjeder skalerbare; hva er overførbart til Norge/nordisk nivå. Sentrale aktører: Københavns Madhus/House of Food, danske kommuner, EU-anskaffelsesregler, norske motparter.
```
**Datasøk:** Kjør **P-DIST-2** (ligger i avsjekk-04 / kjøreordre andre bølge) — masterprompt v1 + datamodus + P-DIST-2 — men elevér mål: behandle offentlig innkjøp som egen C-undercase, ikke bare som «alternativ kanal til grossist». Suppler med København-spesifikt:
```text
Tilleggskrav til P-DIST-2: Lever et København/Danmark-fokusert delsett: (a) økologisk andel i offentlige måltider i København over tid (%, år, kilde: Københavns Madhus/House of Food), (b) hvilket virkemiddel som drev omleggingen (budsjett vs. menyomlegging vs. innkjøpskrav), (c) sammenlignbare norske tall (Oslo/andre kommuner, Landbruksdirektoratet/Matprat-offentlig data hvis det finnes), og (d) hva som juridisk er mulig under norsk/EØS-anskaffelsesrett. Skill EU-rett, dansk praksis og norsk hjemmel.
```

### 4.6 Nederland (Tier 2 — benchmark/inspirasjon, NY datasøk-prompt)

**Feltblokk (til forståelsesprompt):**
```text
Felt: Nederland som benchmark for sirkulær bioøkonomi og høyintensiv matproduksjon. Belys: «Kringlooplandbouw» (sirkulærlandbruks-visjon mot 2030), glastuinbouw (veksthus) med geotermi/CHP/CO2-gjenbruk, cascading/bioraffinering, og nitrogenkrisen (stikstofcrisis) som strukturell driver. VIKTIG GUARDRAIL: Wageningen (WUR), Moerman-stigen og WUR-score skal IKKE brukes som nordisk bevis eller pilotmodenhet (jf. Møte 9-stoppsignal) — kun som omtalt rammeverk/inspirasjon. Nederland er en høyintensiv eksportmodell; kontrast eksplisitt mot nordisk kontekst. Hva kan vi LÆRE (mekanisme), ikke kopiere.
```
**Datasøk (ny — P-NL-1; masterprompt v1 + datamodus + denne):**
```text
Case: Nederland som benchmark for sirkulær bioøkonomi i mat. Mål: strukturert data + mekanismeforståelse, ikke essay. Strikt benchmark/inspirasjon — ikke nordisk bevis. Wageningen/Moerman/WUR-score brukes KUN som omtalt rammeverk, aldri som effektbevis.

Valider/hent mot primærkilder:
1. Kringlooplandbouw: hva er den nederlandske sirkulærlandbruks-visjonen mot 2030 konkret (mål, virkemidler, status)? Kilde: Ministerie van LNV / Rijksoverheid primærdokument.
2. Glastuinbouw: nederlandsk veksthussektor — energikilde-miks (geotermi, CHP, restvarme), CO2-gjenbruk fra industri, areal, og dokumentert ressurseffektivitet. Kilde: CBS, Glastuinbouw Nederland, Topsector.
3. Cascading/bioraffinering: konkrete nederlandske eksempler på høyverdi-valorisering av matsidestrømmer (aktør, lokasjon, output) — ikke generiske påstander.
4. Stikstof (nitrogen): kort, hva er nitrogenkrisen og hvilke regulatoriske grep er faktisk vedtatt — som strukturell driver for sirkulær omlegging.
5. Overførbarhet: en kort merknad om hva som er nordisk-relevant mekanisme vs. hva som er unikt nederlandsk (klima, intensitet, eksportmodell, arealpress).

Leveranseformat: per punkt datatabell (metrikk | verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet) + kildeledger. Oppgi datasett-tilgjengelighet (CBS/Eurostat API/CSV).
Søkestrenger (NL + EN): Kringlooplandbouw 2030 LNV visie; Nederland glastuinbouw geothermie CO2 hergebruk CBS; circular bioeconomy Netherlands food side streams valorisation; stikstofcrisis maatregelen overheid.
Ikke bruk WUR-score/Moerman som bevis. Ikke fremstill nederlandsk høyintensitet som nordisk mal. Rapporter tomme celler eksplisitt.
```

---

## 5. Intake og mottak (uendret stack + forståelsessporets unntak)

**Datasøk-spor (claim-locked):** identisk med eksisterende kjøreregel —
1. Output lagres `deep-research-r2-<felt>-YYYY-MM-DD.md`.
2. Kjør valideringsprompten (masterprompt-fila) på hele outputen.
3. Mottaksrad: kort dom, sterkeste kilde, svakeste punkt, claim-effekt, PCQ-effekt, importbeslutning.
4. Nye kilder klassifiseres (primær/sekundær/bakgrunn/aktørgate) → source-shortlist.
5. Nye tall: verdi/enhet/år/geografi/metode/kildeeier/URL/locator/datakvalitet → PCQ.
6. Claim-lock-effekt eksplisitt (åpner ingen / styrker caveat / svekker / krever actor validation / intern m/forbehold).
7. Ikke-si-liste oppdateres. Ingen aktørkontakt.
8. Bruk ID-serie `DRO-R2-<felt>` så runde 2 ikke blandes med 0906- og RP-løypene.

**Forståelsesspor (IKKE claim-locked):**
- Output lagres `research/forstaelse/forstaelse-<felt>-YYYY-MM-DD.md`, merket `forståelse — ikke faktastemme`.
- Går IKKE i source-shortlist/PCQ/claim-lock/casestatus/deck.
- Eneste lovlige videreføring: hvis et forståelsesnotat peker på en konkret påstand vi vil bruke, åpnes en datasøk- eller primary-check-kjøring som henter den som primærkilde. Forståelsesnotatet er da bare et spor, aldri kilden.

---

## 6. Kjøreplan (prioritert, gated)

| # | Kjøring | Spor | Avhengighet | Når |
|---:|---|---|---|---|
| 1 | Forståelsesprompt × 6 felt (én tråd per felt) | Forståelse | Ingen — lav risiko | Kan starte nå |
| 2 | **RP-02** (+ P-BACALHAU-1-tillegg) | Datasøk | Styrker fôr/import-kjernesporet | Neste datakjøring |
| 3 | **RP-05** A+C (+ RP-04-kobling) = næringsstoffløkker-case | Datasøk | Folder inn akvaponikk + Yara/biogas | Etter #2 |
| 4 | **P-DIST-2** + København-tillegg (offentlig innkjøp) | Datasøk | Elevér til egen C-undercase | Etter #3 |
| 5 | **P-DK-ANIMALSK-1** (benchmark) | Datasøk | **Gate: uke25-minimumsvedtak** (utvidelse) | Etter vedtak |
| 6 | **P-NL-1** (benchmark, Wageningen-guardrail) | Datasøk | **Gate: uke25-minimumsvedtak** (utvidelse) | Etter vedtak |

Regel: én kjøring per Deep Research-tråd. Forståelse og datasøk blandes aldri i samme tråd.

---

## 7. Anti-scope-creep-vakter (les før du utvider)

1. **Tier 2 forblir benchmark.** Danmark og Nederland skal gi *læring*, ikke bli nye norske case-løp. Hvis en av dem viser seg å fortjene case-status, er det et eget JT-vedtak — ikke en automatisk konsekvens av at dataen var god.
2. **Ikke 13 likestilte case.** Tier 1 utvider eksisterende A/B/C-spor; ikke opprett seks nye avsjekk-numre. Akvaponikk + kunstgjødsel + nutrient loops = ÉN næringsstoffløkker-case.
3. **Wageningen-guardrail (Møte 9).** WUR-score/Moerman/Ghana–Costa Rica–Nederland-caser er ikke nordisk bevis. Nederland-sporet håndhever dette eksplisitt.
4. **Gate de nye benchmark-casene på minimumsvedtaket.** Ikke gjenta «bygge rundt et uavklart sentrum». Forståelsessporet er fritt; ny datasøk på Tier 2 venter på alternativ A/B/C.
5. **Forståelse ≠ fakta.** Ingen forståelsesoutput inn i claim-lock/deck. Brudd på dette er den raskeste veien til overclaiming.
6. **Ingen aktørkontakt.** Alt her er desk/primærkilde. Aktørgater (MOU, vilkår, driftstall) ligger fortsatt i DASK/AASK og åpnes av vedtak, ikke av prompts.

---

*Neste handling: kjør forståelsesprompt for de 2–3 feltene du vil forstå best først (jeg vil foreslå nutrient loops + Danmark animalsk, fordi de er minst dekket fra før), og sett RP-02 som neste datakjøring. Hold P-DK-ANIMALSK-1 og P-NL-1 til uke25-minimumsvedtaket er låst.*
