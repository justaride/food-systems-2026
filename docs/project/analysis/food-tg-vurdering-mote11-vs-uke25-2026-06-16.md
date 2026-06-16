---
tittel: Vurdering — Møte 11 (09.06) opp mot ukens arbeid (uke 25)
status: Intern, kandid egenvurdering
eier: Gabriel
dato: 2026-06-16
formål: Vurdere i hvilken grad ukens arbeid svarer ut fokuset Jan Thomas satte i møtet forrige uke (09.06), kvaliteten på arbeidet, hvor vi kan stå støtt og hvor vi må validere/forske mer — og hva vi kunne gjort bedre.
metode: Lest Møte 11-transkripsjon (09.06) og Møte 10-uttak (02.06), begge ukesrapportene (15./16.06), JT-uke25-pakken (statusnotat, beslutningssaker, deck v0.1, sendepakke, operatorlogg), de 7 case-avsjekkene (12.06), casestatus.ts, minimumsvedtak-casekort og decision-log. Kryssreferert mot git-logg uke 24–25.
bruksregel: Internt arbeidsdokument. Ingen kildefiler endret.
---

# Vurdering: svarte vi ut JTs fokus fra forrige uke?

## 1. Sammendrag (kortversjon)

**Forrige ukes møte** (Møte 11, 09.06 — *"arbeidsavklaring og case-spissing"*) hadde ett tydelig hovedbudskap fra JT: **gå fra "hele matsystemet" til noen få konkrete kunnskapsankre og verdikjeder** der NCH/Natural State allerede har data, relasjoner eller innganger — og lever det som en strukturert pakke (5–7 case, claim-hygiene, stakeholders, funding-vinkel, tidslinje).

**Ukens arbeid** har gått i to spor samtidig:

- **Spor A — Maktkartet** (eierskap/konsentrasjon/HHI): løftet fra "klar med forbehold" til **`citable_with_note`**; eierandel-% verifisert mot primærkilder; en kritisk publiseringsfeil på `/eierskap` rettet og bekreftet live; Brønnøysund-audit kjørt; 544/544 tester grønt.
- **Spor B — Case-spissingen** (det JT faktisk ba om 09.06): **7 caseanker med fullverdige case-avsjekker** (kvantifisert med Comtrade/SINTEF/OFG-tall, go/no-go, ikke-si-lister), surfacet på plattformen via `casestatus.ts`, pluss en komplett **JT-uke25-beslutningspakke** (statusnotat, 4 beslutningssaker, deck v0.1 + PPTX, sendepakke, DASK-0906-001/002).

**Hoveddommen:** Vi har **svart ut JTs fokus på struktur- og innholdsnivå, og med uvanlig god kildedisiplin** — men **det formelle vedtaket som låser opp leveransen er fortsatt ikke fattet** (decision-log viser fire saker som "venter vedtak"), og **den dypeste, mest siterbare leveransen ligger på maktkart-sporet, ikke på case-porteføljen JT satte i sentrum**. Vi står *støtt* på maktkartets hovedfunn og på claim-hygienen. Vi bør *validere/forske mer* på relasjonscasene (kaffe/kakao), fôr/import-sporet (JTs uttalte hovedspor, som mangler egen dyp avsjekk) og aktørvalideringen — men flere av disse er bevisst gatet, ikke uferdige ved uhell.

**Tre ting å gripe nå:** (1) lås minimumsvedtaket og H1/H2 i uke 25-møtet — ikke bygg mer rundt et uavklart sentrum; (2) bestem bevisst om maktkartet eller case-porteføljen er ryggraden i H1-leveransen; (3) tett fôr/import-hullet og lag den konsoliderte stakeholder-/funding-oversikten JT ba om.

**Karakter (intern):** Håndverk og epistemikk: 9/10. Dekning av JTs fokusbredde: 6–7/10. Organisatorisk fremdrift (vedtak låst): 4/10.

---

## 2. Hva JT faktisk ba om 09.06 — referansepunktet

For å vurdere "svarte vi ut fokuset" må vi være presise på hva fokuset var. Møte 11 er et **bearbeidet arbeidsnotat**, ikke et formelt vedtak. JTs føringer, slik de står i transkripsjonen:

**Kjernebudskap:**
> "Vi må ikke late som vi kan alt om mat. Vi må bygge på det vi faktisk kan noe om."

Spisse fra hele matsystemet til **spesifikke verdikjeder og problemstillinger** der det finnes (a) importavhengighet/eksportstrømmer med sirkularitetsutfordring, (b) sidestrømmer som kan løftes i verdihierarkiet, (c) tydelige systembarrierer (markedsmakt, distribusjon, manglende offentlig etterspørselsmakt), (d) nordiske suksesshistorier å sammenligne mot.

**De ~14 navngitte kunnskapsankrene:** kaffe/Brasil · fisk-bacalhau Norge–Brasil · soya/fôrimport fra Brasil · kakao/Elfenbenskysten · frukt-grønt/lokal produksjon · spillvarme/drivhus · akvaponikk/hydroponi · Island 100% Fish · Danmark/animalsk · Valio/Finland (soya-fase-ut) · kunstgjødsel/Yara/Haber-Bosch/biogas · Polen · Nederland · Skottland.

**Tverrgående temaer JT løftet eksplisitt:** beredskap/matsikkerhet/selvforsyning (korrigert for importert fôr) · offentlig innkjøp som etterspørselsmotor (Danmark/København) · markedsmakt og distribusjonsbarrierer (Bama, dagligvare) · dyrevelferd/verdikjedekritikk (Anders Nordstad — som *indikator på systemsvikt*, ikke eget moralsk sidespor).

**Den konkrete leveransestrukturen JT skisserte (§7):**
1. Executive summary på 1 side
2. 5–7 prioriterte caseområder
3. Per case: problem · data · barrierer · stakeholders · funding-vinkel · første handling · hva må valideres
4. En "claim hygiene"-tabell som skiller validerte funn fra hypoteser
5. Tidslinje juni–desember
6. Liste over konkrete dokumenter/funn som skal inn i slide deck

**Pluss arbeidsoppgavene (§6):** A) trekk ut lovende spor fra eksisterende plattform/deck · B) lag case-shortlist · C) skill påstander fra validerte funn · D) **stakeholder-kart** (navngir ~10 aktører).

**Prosess/tidslinje JT skisserte:** Juni = ferdigstill bred analyse + scope ned. August = stakeholder-møte + funding-prioritering + whitepaper-draft. September = whitepaper. Slutten av oktober = mulig Oslo Innovation Week (3 dager). November = ferdigstill whitepaper/roadmap.

> **Merk:** Møte 10 (02.06) la til tre plattformgrep (verdikjede-akse, "hva mangler = handlingssonen", "registrert ≠ målt strøm") og en finansieringskrok (~27 mill. samfunnsoppdrag om sirkulære symbioser). Disse hører også med i "forrige ukes fokus" hvis man regner begge de ferske møtene.

---

## 3. Hva vi faktisk leverte denne uken

### Spor A — Maktkartet (eierskap/konsentrasjon)
- Strøm A kjørt ferdig lokalt; kildekvalitetsporten rød → grønn; **maktkartet løftet til `citable_with_note`** (siterbart med fotnote).
- Eierandel-% **verifisert mot offentlige primærkilder** (IR-/årsrapporter), uten å vente på Aksjonærregisteret.
- **Publiseringsfeil på `/eierskap` oppdaget, rettet, deployet og bekreftet live** 16.06.
- Brønnøysund-audit (250+ navn/roller) — avvik kosmetiske, påvirker ikke maktkartet.
- Leveranser: 2 ukesrapporter, policy-oppsummering (1–2 s.), whitepaper-kapittel, 4 figurer, Brreg-triage, finishlinje-plan, Strøm A-runbook. 544/544 tester, ESLint ren, `db:audit` grønn.
- **Hovedfunn:** konsentrasjonen topper i **foredling** (meieri ~6000, egg ~5500–6800, rødt kjøtt ~4600), over dagligvare (~3327), og de tre tyngste leddene er **samvirke** (TINE, Nortura/Prior). Havbruk er minst konsentrert (~950).

### Spor B — Case-spissingen (operasjonaliserer Møte 11)
- **7 caseanker med fulle case-avsjekker** (12.06), hver 13–14 KB, kvantifisert og kildebelagt:
  - Kaffe/Brasil (Brasil-andel 45–48 % av norsk råkaffeimport; +65 % pris 24→25; go som import-/EUDR-case, no-go som relasjonscase)
  - Kakao/Elfenbenskysten (direkteimport neglisjerbar; EUDR-kontekst; relasjonscase gated)
  - Valio/Finland (soyafri governance — *ikke* "importfritt fôr"; rapsmel ~216 000 t/år)
  - Distribusjon/adoption (norskandel frukt/grønt 44 %; BAMA >500 000 t; KT-håndheving fra 01.05.2026)
  - Spillvarme (Hima/Rjukan operativt; Frövi benchmark; no-go for nasjonalt TWh-claim)
  - 100% Fish/marint restråstoff (norsk utnyttelse 89 %, men kun ~15 % human konsum; benchmark for designkrav)
  - Skottland (benchmark) / Polen (watchlist, kill-test bestått)
- 4 deep-research-filer (distribusjon, fisk, Valio), mottakslogg, kjøreordre.
- Surfacet på plattformen via `casestatus.ts` (case-maturity-matrix) — committet i dag (16.06).
- **JT-uke25-pakke:** statusnotat, 4 beslutningssaker, deck v0.1 (10 slides + redigerbar PPTX), sendepakke, operatorlogg, møteinvitasjon, DASK-0906-001/002 (kaffe/kakao dokumentask, copy-ready).

---

## 4. Dekningsmatrise — JTs fokus vs. levert

### 4a. JTs leveransestruktur (§7)

| JT ba om | Levert | Vurdering |
|---|---|---|
| 1-side executive summary | Policy-oppsummering (1–2 s.) | **Delvis** — finnes, men er *maktkart-sentrert*, ikke en case-portefølje-oppsummering. Mangler den "her er de 7 casene"-1-sideren JT så for seg. |
| 5–7 prioriterte caseområder | 7 caseanker m/ avsjekk | **Ja** ✓ — sterkt. |
| Per case: problem/data/barriere/stakeholder/funding/første handling/validering | Case-avsjekk har problem, data, barriere, go/no-go, ikke-si | **Delvis** — problem/data/barriere/validering er sterkt; **stakeholder per case og funding-vinkel per case er tynt**; "første handling" delvis (DASK for kaffe/kakao). |
| Claim hygiene-tabell | Status-ord-taksonomi + go/no-go + ikke-si-lister + claim-lock | **Ja, over forventning** ✓✓ — dette er prosjektets sterkeste side. |
| Tidslinje juni–desember | H1/H2-todeling + neste-14-dager + uke 28–31 | **Ja** ✓ |
| Dokumentliste til deck | Deck v0.1 m/ proof objects per slide | **Delvis** ✓ — deck finnes; ikke en separat kuratert dokument-/funn-liste. |
| Stakeholder-kart (§D) | Aktør-hint i deck + DASK-mottakere | **Nei/tynt** — JT navnga ~10 aktører; vi har ikke en konsolidert stakeholder-kart-leveranse. |

### 4b. JTs 14 kunnskapsankre — dybde

| Anker | Status |
|---|---|
| Kaffe/Brasil | **Dyp avsjekk** ✓ |
| Kakao/Elfenbenskysten | **Dyp avsjekk** ✓ |
| Valio/Finland | **Dyp avsjekk** ✓ |
| Distribusjon/marked (Bama) | **Dyp avsjekk** ✓ |
| Spillvarme/drivhus | **Dyp avsjekk** ✓ |
| Island 100% Fish / restråstoff | **Dyp avsjekk** ✓ |
| Skottland / Polen | **Dyp avsjekk** ✓ (benchmark/watchlist) |
| **Soya/fôrimport Brasil — "hovedspor"** | **Hull** — behandlet som A-ramme/deck-slide, **ingen egen dyp avsjekk** som de 7. (38 KB sjømatfôr-fil ligger *uncommittet*.) |
| Fisk-bacalhau Norge–Brasil | Delvis dekket inn under fôr/import + kaffe-aksen; ikke egen case |
| Akvaponikk/hydroponi/nutrient loops | Foldet inn i spillvarme; ikke egen case |
| Kunstgjødsel/Yara/Haber-Bosch/biogas | **Ikke case-avsjekk** — kun nevnt |
| Danmark/animalsk (svin/meieri) | **Ikke case** |
| Offentlig innkjøp (Danmark/København) | **Tema, ikke case** — selv om JT løftet det sterkt |
| Nederland | **Ikke gjort** |

**Lesning:** 7 av 14 ankre ble dype avsjekker. Det er en *forsvarlig prioritering* (man kan ikke gjøre alle 14 dypt på én runde), men utvalget er **smalere enn JTs samtale antydet**, og — viktig — **utvalget er ikke sporet til et JT-vedtak**, fordi minimumsvedtaket ikke er låst (se §6). Vi valgte de 7, men JT har ikke formelt sagt "ja, de 7."

### 4c. Tverrgående temaer
- Markedsmakt/distribusjon: **dekket dypt** (både maktkart-sporet *og* distribusjon/adoption-casen). ✓
- Beredskap/selvforsyning: rammet inn (fôr/import-vinkel), men ikke tallfestet som egen leveranse.
- Offentlig innkjøp: **undervurdert** relativt til hvor mye JT vektla det.
- Dyrevelferd/verdikjedekritikk: korrekt holdt som indikator, ikke utviklet (i tråd med JTs egen føring).

---

## 5. Kvalitetsvurdering

### Det som er sterkt (stå støtt her)
1. **Kildedisiplin og claim-hygiene er førsteklasses.** Hvert utsagn bærer kilde/år/grunnlag; status-ord-taksonomien (`intern baseline` / `deckklart internt` / `needs-primary-check` / `needs-actor-validation` / `benchmark-only` / `watchlist`) + ikke-si-lister gjør **nøyaktig** det JT ba om i §C ("skill mellom påstander og validerte funn"). Dette er bedre enn det de fleste team leverer.
2. **Casene er reelt kvantifisert**, ikke bare beskrevet: Comtrade-uttrekk kryssverifisert mot NKI/tolldata, SINTEF/FHF-utnyttelsestall, OFG-norskandeler. Tall + eksplisitt usikkerhet.
3. **Maktkartets hovedfunn er robust.** "Konsentrasjon topper i foredling/samvirke, ikke i dagligvare" holder selv med tall-usikkerhet, fordi markedslederen alene gir et høyt gulv. Triangulering (styrebroer + eierandel-% + kryss-node-HHI) gir samme bilde fra uavhengige kilder.
4. **Verifikasjon er ekte:** live-reverifiserte lenker, 544/544 tester, `db:audit` grønn, citation-kø ~null, publiseringsfeil fanget og fikset.
5. **Beslutningstvingende ramme.** Uke25-pakken gjør materiale om til 4 konkrete vedtak — direkte svar på den gjentatte risikoen "materiale blir ikke til beslutninger."

### Det som er svakt / risiko
1. **Linchpin-en står fortsatt åpen.** `decision-log-food-tg.md`: ingen formelle vedtak; fire uke25-saker "venter vedtak"; 2A-minimum kun *"operativt bekreftet"* av Gabriel selv, *"formell eierbekreftelse gjenstår."* Møtet er ikke avholdt (foreslått ons–fre uke 25). Strategisk står vi i **samme posisjon som GAP-NYESTE-MOTER flagget 08.06**: vi bygger beslutningsklart materiale rundt et uavklart sentrum. Dette er den enkeltstående største tingen å passe på.
2. **To-spors-divergens.** Den dypeste, mest siterbare leveransen (maktkart) ligger på **ett** av JTs temaer (markedsmakt), mens case-spissingen JT satte i sentrum er bevisst frosset på "internt, må valideres." Risiko: maktkartets tyngde trekker prosjektets narrative tyngdepunkt tilbake mot "konsentrasjon/makt" (vår gamle styrke) i stedet for den brede sirkulære verdikjede-porteføljen JT ville ha.
3. **Dekningshull mot JTs ankre:** fôr/import-Brasil (uttalt **hovedspor**) mangler egen dyp avsjekk; kunstgjødsel/biogas/nutrient loops, offentlig innkjøp/København, Nederland og dansk animalsk er tema-nivå eller fraværende.
4. **Stakeholder-kart og funding-vinkel per case er tynt** — begge eksplisitt etterspurt. ~27 mill.-symbiose-kroken fra Møte 10 er notert, men ikke koblet per case.
5. **Ekstern klarering henger fortsatt på den lokale DB-kjøringen** — en enkeltmaskin-avhengighet som har vært "det siste steget" i ~2 uker. Gjentakende flaskehals.
6. **Rapporteringen underselger case-sporet.** Begge ukesrapportene er ~90 % maktkart; en leser (JT) kan gå glipp av at case-spissingen han ba om faktisk rykket vesentlig fram. Det dypeste case-arbeidet (12.06) er nesten usynlig i ukesrapport-narrativet.

---

## 6. Står vi støtt, eller bør vi forske mer?

**Stå støtt på (klar til intern beslutning, og forsiktig ekstern bruk med forbehold):**
- Maktkartets hovedfunn (foredling > dagligvare; samvirke-konsentrasjon) — `citable_with_note`.
- Claim-hygiene-apparatet og status-ord-taksonomien.
- 7-case-strukturen og de kvantifiserte import-/restråstoff-tallene *med* sine forbehold.
- Den beslutningstvingende uke25-rammen.

**Validér/forsk mer før ekstern bruk (men flere er bevisst gatet — ikke ufullført ved uhell):**
- Relasjonsclaims kaffe/kakao → korrekt gatet på DASK-0906-001/002. Send dem.
- Valio "importfritt" → allerede nedjustert til soyafri governance. Riktig.
- 100% Fish norsk pilot → benchmark-only. Riktig.
- Spillvarme nasjonalt TWh → no-go. Riktig.
- **Fôr/import-dypdykk → konsolider den uncommittede 38 KB-filen til en ekte avsjekk.** Dette er det reelle, ikke-bevisste hullet.
- Aktørvalidering for distribusjon/adoption; verdifangst per selskap (krever DB); Strøm E node-andeler.

**Beslutt (ikke forsk — det er et vedtak, ikke et datahull):**
- Lås minimumsvedtaket + H1/H2 i uke25-møtet.
- Bestem bevisst: er maktkartet eller case-porteføljen ryggraden i H1?
- Tett fôr/import-hullet *eller* nedprioriter det eksplisitt — ikke la det henge.

**Er sektoren/emnene gjennomarbeidet helt og grundig?** Ærlig svar: **dypt, men selektivt.** Markedsmakt/eierskap-delen er blant det grundigste i hele prosjektet. Den sirkulære verdikjede-porteføljen er vesentlig framskutt (7 kvantifiserte case) men **ikke komplett** mot JTs kart — den er smalere, valideringsgatet, og mangler fôr-dypdykk, gjødsel/nutrient-loop, offentlig innkjøp og Nederland. Vi har ikke "dekket hele sektoren JT skisserte"; vi har gått dypt på et forsvarlig utvalg.

---

## 7. Hva vi kunne gjort bedre

1. **Tvunget scope-vedtaket tidligere og skriftlig.** Linchpin-en har stått åpen siden 21.05. I stedet for å vente på et møte kunne vi bedt om et asynkront skriftlig ja/nei (mikro-vedtak) fra JT/Einar. Vi fortsetter å bygge rundt et udefinert sentrum.
2. **Levert JTs §7-struktur som ÉN konsolidert "case-shortlist v0.1".** Vi *har* alle delene (casestatus.ts, 7 avsjekker, deck, minimumsvedtak) — men ikke det ene artefaktet i den formen JT ba om: 1 side × 7 case × [problem/data/barriere/stakeholder/funding/første handling/må valideres]. JT må i dag lese fem filer for å se det han skisserte som én.
3. **Lukket fôr/import-dypdykket.** Det er JTs navngitte hovedspor og det med størst nærhet til eksisterende maktkart-data (havbruk, fôr-pris-asymmetri, restråstoff). Å la det stå som A-ramme-paraply undertjener den uttalte prioriteringen. 38 KB sjømatfôr-filen burde vært sjekket inn og konvertert.
4. **Bygd stakeholder-kartet og funding-vinkelen per case** — begge eksplisitt etterspurt, begge tynne.
5. **Latt være å la maktkartets momentum sette ukesnarrativet.** Ukesrapportene burde løftet at case-spissingen JT ba om faktisk rykket fram — slik den er skrevet nå, kan JT tro vi "bare" jobbet med maktkart.
6. **Loggført vedtak i decision-log.** Prosjektets egen 48-timers/samme-dag-regel brytes; den tomme vedtaksloggen gjør det vanskelig å *bevise* "svarte vi ut JT", selv når vi gjorde mye av arbeidet.

---

## 8. Anbefalt neste steg (prioritert)

| # | Handling | Hvorfor | Prioritet |
|---|---|---|---|
| 1 | **Avhold uke25-møtet og lås Sak 1–4 i decision-log samme dag.** | Låser opp alt nedstrøms; avslutter linchpin-driften. | **Kritisk** |
| 2 | **Bestem H1-ryggrad:** maktkart vs. case-portefølje vs. begge med klar vekting. | Hindrer at narrativet sklir tilbake til "makt" alene. | **Kritisk** |
| 3 | **Kjør den lokale DB-kjøringen** (Strøm A-runbook) → løft maktkartet til forbeholdsfritt. | Eneste steget til full ekstern klarering. | Høy |
| 4 | **Konsolider "case-shortlist v0.1" i JTs §7-form** (1 side, 7 case, alle felt). | Gir JT leveransen i formen han ba om. | Høy |
| 5 | **Send DASK-0906-001/002** (etter Sak 4-vedtak). | Avgjør go/no-go for kaffe/kakao relasjonscase. | Høy |
| 6 | **Lukk fôr/import-dypdykket** (sjekk inn + konverter 38 KB-filen til avsjekk-08). | JTs hovedspor; minst dekket av de sentrale. | Høy |
| 7 | **Bygg stakeholder-kart + per-case funding-vinkel** (inkl. ~27 mill.-symbiose-kroken). | Eksplisitt etterspurt; tynt i dag. | Middels |
| 8 | **Vurder dekning av offentlig innkjøp/København + Nederland** som neste case-runde. | JT vektla begge; nå underdekket. | Middels |

---

*Konklusjon: Vi har gjort sterkt, etterprøvbart arbeid og svart ut JTs fokus på innholds- og struktur­nivå med uvanlig god disiplin — men vi står og venter på vedtaket som gjør arbeidet til leveranse, og den dypeste leveransen ligger på et annet spor enn det JT satte i sentrum. Stå støtt på maktkart-funnet og claim-hygienen; lås vedtaket; tett fôr-/stakeholder-/funding-hullene før neste runde.*
