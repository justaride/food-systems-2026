# Gap-gjennomgang — de nyeste Food-møtene (Møte 9 26.05 + oppdatering 02.06)

**Dato:** 2026-06-08
**Formål:** Gå nøye gjennom de to ferskeste møte-/statuspunktene i Food Systems og avdekke arbeid og detaljer som ennå ikke er fulgt opp.
**Kilder lest i sin helhet:** `docs/meetings/JT-GABRIEL - Metodeoverforing Cities Food mai 2026.md` (Møte 9, 26.05), `docs/meetings/food-tg-oppdatering-2026-06-02.html` (oppdatering 26.05→02.06), `docs/meetings/STATUS-2026-05-26.md`. Kryssreferert mot `MØTEOVERSIKT.md`, `decision-log-food-tg.md`, `MANDATE-OPEN-FIELDS-STATUS-2026-05-26.md`, samt git-logg og filendringer etter 02.06.

> **Avgrensning (avtalt scope):** Kun de nyeste Food-møtene. Tidligere møter (1–8) og WCEF-prosjektet er holdt utenfor. Ingen kildefiler er endret.

---

## 1. Sammendrag

De to ferskeste punktene er **ikke formelle vedtaksmøter**: Møte 9 (26.05) er et *cross-project intake-notat* (Wageningen/Moerman/R9-metode), og 02.06 er en *skriftlig statusoppdatering*, ikke et møte. Begge lister selv åpne punkter — og når disse kryssrefereres mot repoet per i dag, peker nesten alt tilbake til **én felles rotårsak: scope-vedtaket er fortsatt ikke fattet/registrert**. Det blokkerer mandatfelt, metode-eierbeslutning, outreach og valideringssprint.

Samtidig viser git-loggen at arbeidet **siden 02.06** har gått til sirkularitetsrapport v1.3 og kilde-governance — godt arbeid, men **ikke** de møte-avledede åpne punktene. De er altså verken lukket eller flyttet videre på seks dager.

**De tre viktigste uadresserte punktene:** (1) bekreft om scope-møtet har skjedd og lås minimumsvedtaket, (2) fyll de 7 åpne mandatfeltene som henger på det, (3) Food TG-beslutning om hvordan Wageningen/Moerman/R9 skal stå.

---

## 2. Hva de «nyeste møtene» faktisk er — og svaret på «møte for en uke siden»

| Punkt | Dato | Hva det er | Formell status |
|---|---|---|---|
| Møte 9 | 26.05 | Cross-project intake (metodeoverføring) | **Ikke** formelt Food TG-vedtak (eksplisitt) |
| Oppdatering | 02.06 | Skriftlig prosjektoppdatering fra Gabriel | Statusnotat, ikke møte |
| **Siste formelle Food TG-møte** | **21.04 (Møte 8)** | Mandat/scoping | Eneste formelle vedtaksmøte i `docs/meetings/` |

**Viktig funn:** Hvis du tenker på et reelt møte «for en uke siden» (~1. juni), ligger det **ikke** som referat i filene. Det ferskeste skrevne er 02.06-oppdateringen (ikke et møte). `STATUS-2026-05-26.md` flagger selv at det kan ha vært mandags-/tirsdagsmøter i mai som aldri ble loggført, og at **«Notion er sannsynligvis kanonisk … repoet henger 5+ uker etter»**. `decision-log-food-tg.md` har dessuten **null registrerte beslutninger** («ingen ennå»), til tross for kvalitetsregelen om at møtevedtak skal loggføres samme dag.

→ Dette er i seg selv et hull: **møtelogg og beslutningslogg er ikke à jour.** Eventuelle mai-/juni-møter, inkludert et scope-møte, mangler referat i repoet.

---

## 3. Rotårsak: scope-vedtaket (linchpin)

Flere åpne punkter er ikke uavhengige — de henger alle på ett uavklart vedtak:

```
decision-memo-food-tg-scope-v0.3 (28.04): anbefaler Spor A+B, Spor C som gate
        │  foreslår scope-møte tidlig mai (05.05 / ~18.05)
        ▼
scope-decision-request sendt 21.05  →  «Venter bekreftelse» (JTO/Cathrine/Einar)
        │  scope-møtet er IKKE registrert som gjennomført (STATUS 26.05, blindsone 1)
        ▼
   BLOKKERER:
   ├─ Mandatfelt 1,2,4,5 (godkjenningsdato, reviewdato, chair, medlemsliste)
   ├─ Metode-eierbeslutning (hvordan Wageningen/R9 skal stå)  ← 02.06 §1 «krever vedtak etter scope»
   ├─ Outreach / P1-aktørliste (all aktivitet «venter scope-vedtak»)
   └─ Formalisering av valideringssprint
```

**Konsekvens:** Selv om mye plattform- og rapportarbeid er levert, står den *organisatoriske* kjernen stille. `MANDATE-OPEN-FIELDS-STATUS` sier det rett ut: «alle 7 [mandatfelt] fortsatt åpne … hovedårsaken er et uavklart scope-vedtak.»

---

## 4. Åpne punkter fra Møte 9 (26.05) — status per i dag

Møte 9s egne «Follow-Up» og «Guardrails», kryssreferert mot repoet:

| # | Møte 9 sa | Status nå | Vurdering |
|---|---|---|---|
| F1 | Lukk eksakte side-/tabell-/figur-locators for `SRC-B-035` | Locator-ledger opprettet 26.05; ikke bekreftet lukket | **Delvis** |
| F2 | Koble Wageningen-bruk til Food claim-IDer før det havner i deck/rapport/whitepaper/app | 6 claim-IDer koblet som *caveated/internt* (`CL-B-008/009/021/022/023`, `CL-C-015`); claim-register finnes | **Delvis** — gjelder som intern gate, ikke lukket |
| F3 | Bruk scorecard som **valideringssprint-prompt** (matsvinnkvalitet, okara/BSG, nutrient loops, insektprotein) | Ingen resultat-/sprintlogg funnet etter 02.06; står fortsatt som «neste steg» i 02.06 §5 | **Ikke gjort** |
| F4 | Returner status til Circular **først** når Food har registrert claim-readiness | Ingen registrert tilbakemelding funnet | **Åpent** |
| G | Guardrails: ikke merk Wageningen eksternt validert; ikke kall Ghana/Costa Rica/Nederland nordisk bevis; ikke gjør cascade/WUR-score til pilotmodenhet | Delvis håndhevet via overclaim-audit (fanger 4 koder) | **Delvis** — men **eierbeslutningen om metoden gjenstår** |

**Detalj som lett overses:** Møte 9 sier eksplisitt at metoden er «ikke claim-lukket, ikke eksternt validert, ikke formelt TG-vedtak». 02.06 §1 legger til et **åpent eierpunkt**: Food TG må beslutte om metoden skal stå som *synlig metode / internt scoringstemplate / vedlegg / parkert kildekandidat* — og dette «krever beslutning etter minimumsvedtaket på scope». Altså nok en avhengighet til §3.

---

## 5. Åpne punkter fra 02.06-oppdateringen — status per i dag

02.06 §4 (åpne punkter) og §5 (neste steg), sjekket mot repoet seks dager etter:

| Punkt (02.06) | Status nå | Vurdering |
|---|---|---|
| **Møtekadens/møtelogg:** avklar mai-møter, registrer `meeting-10,11…`, avklar mandag vs. tirsdag | Ingen nye møtefiler etter 02.06; `MØTEOVERSIKT` slutter på Møte 9; kadens uavklart | **Ikke gjort** |
| **Mandat:** fyll åpne felt så scope/minimumsvedtak kan låses | Alle 7 felt fortsatt åpne (`MANDATE-OPEN-FIELDS-STATUS` urørt etter 02.06) | **Ikke gjort** (blokkert av §3) |
| **Metode:** kjør valideringssprint (matsvinnkvalitet først), oppdater claim-status datert | Ingen sprintresultat funnet | **Ikke gjort** |
| **Eierbeslutning metode:** synlig/intern/vedlegg/parkert | Ikke besluttet | **Ikke gjort** (blokkert av §3) |
| **Outreach:** fortsatt ingen eksterne partnere kontaktet | Uendret | **Ikke gjort** (bevisst pauset til scope) |
| **Ekstern lesbarhet:** vurder guidet «5-minutters»-inngang før bredere deling | Ingen guidet inngang bygget; kun nevnt i planer | **Ikke gjort** |

**Det som faktisk er gjort siden 02.06** (git-logg): sirkularitetsrapport v1.3 (P1–P7: R-stige/materialflyt-kobling, NO-bias-kalibrering, datostempel, citable-gates), «Harden source governance audits», claim-register/claim-lock-oppdateringer, SKILLS-PLAN. → Innsats er reell, men ligger på **rapport/governance-sporet**, ikke på de møte-avledede punktene over.

---

## 6. Detaljer som lett overses

1. **Kadens-drift tirsdag → mandag.** Møte 5 (13.04) vedtok «fast prosjektdag: tirsdag fra uke 17». `notion-sync-food-tg-2026-05-04` refererer i stedet til **mandagsmøter** uke 17/18. Ukedagen kan ha skiftet uten at det er dokumentert. Uavklart.
2. **Møte 8s action items har ingen oppfølgingsrapportering.** Aktørkartlegging, 3–5 dybdeintervjuer og mandatutfylling (Møte 8, 21.04) er ikke rapportert lukket — og 02.06 bekrefter «fortsatt ingen eksterne partnere kontaktet». Sporet har stått i ~7 uker.
3. **Den tomme beslutningsloggen.** `decision-log-food-tg.md` har null rader. Hvis det *har* vært muntlige avklaringer (scope, kadens), bryter det med prosjektets egen kvalitetsregel om loggføring samme dag — og gjør at prioriteringsendringer ikke kan spores til formelt vedtak.
4. **Geografisk minstekrav** (mandatfelt 3) kan i prinsippet avgjøres uavhengig av scope (forslag i underlaget: 4/5 land), men er ikke satt. Et «quick win» som ikke krever scope-møtet.
5. **Annex-strategi** (mandatfelt 6/7): Ten-Step (Annex 1) finnes i `PROJECT-OVERVIEW.md`, og workplan (Annex 2) i Notion — men ingen er formalisert som mandat-annex. Lav innsats å lukke med en peker-fil.

---

## 7. Prioritert handlingsliste (kun uadresserte punkter)

| # | Punkt | Kilde | Avhengighet | Prioritet |
|---|---|---|---|---|
| 1 | Bekreft m/ Einar: **har scope-møtet skjedd?** Hvis ja → loggfør dato + utfall; hvis nei → planlegg | STATUS 26.05; decision-log | Linchpin | **Kritisk** |
| 2 | Lås **minimumsvedtak på scope** (A+B / C-gate) så avhengighetene løsner | 02.06 §1; decision-request 21.05 | #1 | **Kritisk** |
| 3 | **Få mai-/juni-møtelogg fra Cathrine/JT**, registrer `meeting-10+`, avklar mandag vs. tirsdag | 02.06 §4–5; STATUS | — | **Høy** |
| 4 | **Food TG-eierbeslutning** om Wageningen/Moerman/R9 (synlig/intern/vedlegg/parkert) | Møte 9; 02.06 §1 | #2 | **Høy** |
| 5 | Kjør **valideringssprint** på kandidatstrømmer (matsvinnkvalitet først), datert claim-status | Møte 9 F3; 02.06 §5 | løs fra #2 | **Høy** |
| 6 | Fyll **mandatfelt** etter scope-vedtak (1,2,4,5); sett felt 3 nå (4/5 land) | MANDATE-STATUS | #2 (delvis) | Middels |
| 7 | Bygg/skissér **guidet 5-min-inngang** før plattformen deles bredere | 02.06 §5; brukergjennomgang 27.05 | — | Middels |
| 8 | Loggfør ev. muntlige vedtak i **decision-log** (kadens, scope) | decision-log kvalitetsregel | — | Middels |
| 9 | Lukk `SRC-B-035`-locators og bekreft claim-koblinger før ekstern bruk | Møte 9 F1–F2 | — | Middels |

---

## 8. Hva som ER gjort/dekket (grensen)

For å være ærlig på omfanget: 02.06-oppdateringen dokumenterer betydelig faktisk leveranse — kildedeknings-/proveniens-system med overclaim-audit, sirkulær materialflyt-modell (Sankey + nettverk + Kalundborg med ekte romlig gips-strøm), R-stige justert til Potting 2017-kanon, QA-sveip etter ekstern brukergjennomgang, og 435/435 grønne tester. Plattformen vurderes som intern beslutnings- og valideringsklar. Metodepakken fra Møte 9 er QA-lukket internt (28.05) med kontrollartefakter. Siden 02.06 er sirkularitetsrapport v1.3 og kilde-governance videreført.

De uadresserte punktene over er altså i hovedsak **organisatoriske/forankrings-hull, ikke leveransehull** — men #1–#2 (scope) er rotårsaken som låser opp resten, og bør avklares før mer Cities-materiale flyttes inn eller plattformen deles eksternt.

---

*Neste steg: avklar §7 #1–#2 med Einar/JTO/Cathrine. Ingen kildefiler er endret i denne gjennomgangen.*
