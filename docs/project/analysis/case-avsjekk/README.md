---
tittel: Case-avsjekk Food TG — indeks og promptbibliotek
status: Aktiv intern
eier: Gabriel
dato: 2026-06-12
scope: Indeks over dypdykk-avsjekkene av de syv caseankrene mot eget underlag, målt mot JTs sirkularitetsdimensjoner, med samlet promptbibliotek for videre research. Alle prompts kjøres etter masterprompt v1 (food-tg-deep-research-prompt-pack-2026-06-10.md) + datamodus-tillegget (food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md kap. 2), og all output går gjennom kontrollstacken før bruk.
---

# Case-avsjekk: indeks og promptbibliotek

## 1. Hovedkonklusjon på tvers

**Kjernen er besvart i alle syv case.** Ingen av dem trenger bred ny research. Det som står åpent er smale, navngitte hull — hvert med en ferdig prompt — pluss aktørgater som bevisst IKKE researches mer (websøk løser dem ikke; de ligger i DASK/AASK).

| Avsjekk | Case | BESVART | DELVIS | ÅPENT | AKTØRGATE | Kjernekonklusjon |
|---|---|---:|---:|---:|---:|---|
| [01](avsjekk-01-kaffe-brasil-2026-06-12.md) | Kaffe/Brasil | 4 | 1 | 3 | 1 | Import-/EUDR-kjernen står kvantifisert og kryssverifisert; sirkularitetsvinkelen er casets svakeste side (ærlig flagget); relasjonssporet er aktørgate |
| [02](avsjekk-02-kakao-elfenbenskysten-2026-06-12.md) | Kakao/Elfenbenskysten | 6 | 1 | 1 | 2 | Direkteimport-kill + EU-omvei kvantifisert (Comext-CSV fra fase 2 lukket gapet: 121 038 t / 968 MEUR NL+BE+DE→Norden 2024); EØS-særtilfellet står |
| [03](avsjekk-03-valio-finland-2026-06-12.md) | Valio/Finland | 5 | 1 | 3 | 1 | Governance-kjernen og NO–FI-symmetrien komplett (Finland-1201 verifisert: 6–25 kt/år — Norges bønnestrøm er 14–58× større); husdyr-splitten lukket via Landbruksdirektoratet-XLSX |
| [04](avsjekk-04-distribusjon-adoption-2026-06-12.md) | Distribusjon/adopsjon | 4 | 1 | 3 | 1 | Strukturkjernen står i korrigert form (presiseringshøringen er det aktive vinduet); neste verdi ligger i RP-06-ledgeren, ikke mer strukturresearch |
| [05](avsjekk-05-spillvarme-2026-06-12.md) | Spillvarme | 4 | 2 | 3 | 1 | Hima/Frövi bærer caset; Wiig er menneskegate (innsynskrav klart), Varde er datostyrt (25.06); koblingsmangelen er systeminnsikten |
| [06](avsjekk-06-fish-restrastoff-2026-06-12.md) | 100% Fish/restråstoff (PILOT) | 3 | 2 | 3 | 1 | Baseline, gap og benchmark står på primærkilder; verdimiks-fortellingen er komplett; norsk pristabell er viktigste åpne hull |
| [07](avsjekk-07-skottland-polen-2026-06-12.md) | Skottland/Polen | 4 | 2 | 2 | 0 | Struktur/prisskille står med 2019-caveat; aktualitet er svakheten (P-SKOT-1); Polen bevisst uten prompt (sovende oppfølging, ikke bibliotek) |

Sum: 30 BESVART, 10 DELVIS, 18 ÅPENT, 7 AKTØRGATE av 65 nøkkelspørsmål.

## 2. Promptbiblioteket (18 prompts)

Kjøreregel for alle: én kjøring per Deep Research-tråd = masterprompt v1 + datamodus + prompten. Output lagres som `deep-research-<case>-<id>-YYYY-MM-DD.md`, valideres med v1-valideringsprompten, registreres i mottakslogg → SRC/PCQ → claim-lock før bruk.

### Selvstendige prompts (egen tråd)

| ID | Tema | Fil | Prioritet |
|---|---|---|---|
| P-FISH-1 | Norsk fraksjon-til-marked-tabell med priser (+ P-SKOT-2-tillegget kjøres i samme tråd) | avsjekk-06 | **1** — mater verdimiks-fortellingen direkte |
| P-VALIO-1 | Luke/Ruokavirasto/Tulli: finsk fôrforbruksdata | avsjekk-03 | 2 |
| P-DIST-1 | Produkteksempler mot adopsjonsgaten (mater RP-06-ledgeren) | avsjekk-04 | **2** — tester C-tesen empirisk |
| P-SKOT-1 | Nyere skotske data enn 2019-surveyen | avsjekk-07 | 3 |
| P-KAKAO-2 | CI-sporbarhet primærdokumenter (dekret 13.09.2023, RPCCV, 37,4 %-metoden) | avsjekk-02 | 3 |
| P-KAFFE-2 | Norsk EUDR-gjennomføringsstatus for kaffe | avsjekk-01 | 3 — rydder også casestatus-formulering |
| P-FISH-2 | Metodebro Island–Norge (LESEOPPGAVE på Strand et al. 2024 — ikke websøk) | avsjekk-06 | 2 — rask |
| P-VALIO-2 | Nordisk governance-bølge (Arla juli 2018 + SE/DK-symmetri) | avsjekk-03 | 4 |
| P-DIST-2 | Offentlige innkjøp som alternativ kanal | avsjekk-04 | 4 |
| P-VARME-2 | Energi-/arealregnestykke: X MW → Y tonn mat | avsjekk-05 | 4 |
| P-VARME-3 | NVE-kravet >2 MW: hjemmel og praksis | avsjekk-05 | 4 |
| P-KAKAO-1 | Kakaoreststrømmer kill/validate (Polen-mønsteret: null funn = stopp) | avsjekk-02 | 5 |
| P-KAFFE-1 | CONAB Parque Cafeeiro datatilgang | avsjekk-01 | 5 |
| P-KAFFE-3 | Norsk grut-massestrøm (smal; gjenoppliver IKKE biogass-claimen) | avsjekk-01 | 5 |

### Tillegg som kjøres i andre tråder (ikke egne kjøringer)

| ID | Kjøres i | Hva |
|---|---|---|
| P-FISH-3 | RP-04-tråden | Marint kvalitets-/regelverkstillegg (ombordhåndtering, ABP kat. 3) |
| P-SKOT-2 | P-FISH-1-tråden | Norsk-skotsk strukturbro (to-anleggs-konsentrasjon vs. norsk mottak) |
| P-VARME-1 | RP-08-tråden | Kvantitativ mini-ledger med noder/lokasjon (= RP-08; logges DRO-RP-08) |
| P-VALIO-3 | RP-05-tråden | Sidestrøms-/fôr-løkke-tillegg (rypsi-puriste som oljesidestrøm) |

RP-serien (RP-01–08, JTs temabestillinger) ligger i `food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md` og er en del av biblioteket; avsjekk-promptene er designet for å mate og utvide RP-kjøringene, aldri duplisere dem.

### Kjørte prompts

| Dato | ID | Resultat | Status |
|---|---|---|---|
| 2026-06-13 | P-FISH-1 + P-SKOT-2 | [Deep Research - P-FISH-1 + P-SKOT-2](deep-research-fish-p-fish-1-p-skot-2-2026-06-13.md) | Delvis lukket: volum/struktur lukket; offentlige fraksjonspriser kun som HS-produktproxy |
| 2026-06-13 | P-DIST-1 | [Deep Research - P-DIST-1](deep-research-dist-p-dist-1-2026-06-13.md) | Delvis lukket: RP-06-ledger og produkt-årsdata lukket; månedlig produktimport og aktørvilkår står som datagap/aktørgate |
| 2026-06-13 | P-FISH-2 | [Deep Research - P-FISH-2](deep-research-fish-p-fish-2-2026-06-13.md) | Ikke lukket: Strand et al. 2024-PDF mangler lokalt; Island-Norge-metodebro holdes tilbake |
| 2026-06-13 | P-VALIO-1 | [Deep Research - P-VALIO-1](deep-research-valio-p-valio-1-2026-06-13.md) | Lukket for datasettgrunnlag: Ruokavirasto/Luke/Uljas kildelag og API/CSV-uttrekk etablert; Valio-andeler og GM-soyafigur står med caveat |

## 3. Utenfor vår loop (skal IKKE researches mer)

- **Aktørgatene (7):** Brasil-MOU/Fuglen/NKI-roller, LEAD Ivory Coast, produktnivå kakao-sporbarhet, Valios fôrkurv/PFAD, BAMA-/Gartnerhallen-vilkår og marginer, Hima driftstall, IOC claim-metode/norske aktørdata. Ligger i DASK/AASK; åpnes av vedtak, ikke av prompts.
- **Menneskeoppgaver:** Klepp-innsynskravet (tekst klar i uttak-03), ev. SBMT-avklaringsmail.
- **Datostyrt:** Varde 25.06, presiseringshøringens utfall, SINTEF/FHF 2025-årgang (Q3).
- **Bevisst sovende:** Polen full kill-test (ingen prompt utstedt — kapasitetsoppfølging i fase 5).

## 4. Funn til neste kontrollerte oppdatering (ikke utført her)

1. Casestatus-formuleringen «kaffe er innlemmet i den norske EUDR-gjennomføringen» er sterkere enn EUDR-treffkartet bærer — presiseres etter P-KAFFE-2 (avsjekk-01).
2. Comext-CSV-en (kakao) ligger på codex-grenen og må flettes + registreres i source-shortlist før tallene brukes utenfor avsjekken (avsjekk-02).
3. Polen-full-kill bør flyttes semantisk fra blockers til oppfølging i casestatus (avsjekk-07).
4. Fig3 kan oppdateres med Finland-1201-tallene (avsjekk-03) — «ikke trukket»-boksen kan fjernes.
