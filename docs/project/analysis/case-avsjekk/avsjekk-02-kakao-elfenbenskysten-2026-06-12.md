---
tittel: Case-avsjekk 02 — Kakao / Elfenbenskysten
status: Intern analyse — følger pilotformatet fra avsjekk-06 (fish/restråstoff)
eier: Gabriel
dato: 2026-06-12
scope: Dypdykk-avsjekk av caset mot eget underlag, målt mot JTs sirkularitetsdimensjoner (RP-seriens tema-tabell). Konklusjon per nøkkelspørsmål: BESVART / DELVIS / ÅPENT / AKTØRGATE, og Deep Research-prompts for det som står åpent. Følger claim-lock; ingenting her er ekstern faktastemme.
relaterte_filer:
  - research/external/dro-0906/drr-0906-002-elfenbenskysten-kakao-eudr.md
  - docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md
  - research/external/spor1-uttak-2026-06-12/uttak-07-kakao-eu-omvei.md
  - docs/project/mandates/food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md
  - docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md
  - docs/project/figures/food-tg-2026-06-12/README.md (fig2)
  - "På gren codex/food-tg-arbeidsplan-2026-06-12: research/external/dro-0906/eurostat-comext-cocoa-nl-be-de-to-nordics-hs1801-1806-2022-2024.csv + docs/project/mandates/food-tg-eudr-treffkart-2026-06-12.md"
---

# Avsjekk: Kakao / Elfenbenskysten

## 1. Casets plass i JTs sirkularitetsramme

| JT-dimensjon (RP-tema) | Treffer caset? | Hvordan |
|---|---|---|
| Verdikjedeflyt og kast (RP-01) | Delvis | Caset kartlegger en importkjede (CI → EU-havn/maler → nordisk merkevare → norsk dagligvare, fig2), ikke en kaste-/svinnstrøm; flytlogikken er den samme som RP-01s leddstruktur |
| Importavhengighet (RP-02) | Ja, kjernen | Indirekte importavhengighet er hele funnet: direkteimport er motbevist, eksponeringen ligger i EU-leddet; metodisk parallell til Brasil-aksen (handelsakse-visning) med Comext i stedet for Comtrade |
| R9 per ledd (RP-03) | Marginalt | Ingen dokumentert R-strategi-strøm i caset i dag; eneste sirkularitetsspor er kakaoreststrømmene (pulp, pod husk, skall — REST-1/REST-2 i DRR-002), som står watchlist/benchmark-only |
| Matsvinnkvalitet/kontaminering (RP-04) | Nei | Ikke berørt i underlaget |
| Suksess/fiasko (RP-06) | Delvis | Kumasi (kakaopulp til EU-drikkemarked) er benchmark-kandidat for ledgeren — men kun som omtalt eksempel i NCH-artikkel, ikke dokumentert pilot |

Sporplassering: caset står i C-sporet som EUDR-/sporbarhets- og strukturcase (casestatus: `kakao-elfenbenskysten`, go/no-go: «Go som EUDR-/sporbarhetskontekst med caveat; no-go som relasjonscase uten dokument»). Det er IKKE et løkkecase i dag — reststrømsporet er casets eneste R-stige-inngang og får én smal kill/validate-prompt (kap. 4) før eventuelt bevisst stopp.

## 2. Kunnskapsstatus per nøkkelspørsmål

Statusvokabular: **BESVART** = kan presenteres internt med kilde+locator innenfor claim-lock, ingen ny research nødvendig. **DELVIS** = kjernen står, men en navngitt bit mangler. **ÅPENT** = krever ny research (prompt finnes i kap. 4). **AKTØRGATE** = kan kun besvares av aktør/menneske — utenfor vår loop, ligger i AASK/DASK.

| # | Nøkkelspørsmål | Svar fra underlaget | Status |
|---|---|---|---|
| 1 | Importerer Norden kakao direkte fra Côte d'Ivoire? | Nei — motbevist for ALLE kakaokapitler 1801–1806 i 2024: råbønner (1801) = 0 kg til NO/SE/DK/FI; største post overhodet er 36,5 t kakaosmør til Norge. Kilde: Comtrade-uttrekk 12.06 (desk-logg kap. 4) | **BESVART** (kill bekreftet) |
| 2 | Hvor lander og males CI-kakaoen i EU? | Trase oppgir EU-andel 66,2 % av CI-eksport 2024 (NL 42,0 / BE 17,3 / DE 13,9 % av EU-importen); CBI oppgir CI = 51 % av EUs bulk-bønneimport; prosessorlandskapet (Cargill Zaandam/Wormer, ofi Koog aan de Zaan, Barry Callebaut Wieze, ECOM) er dokumentert med locator per anlegg. Kilde: uttak-07 kap. 1 | **BESVART** |
| 3 | Hvor stor er EU-omveien kvantitativt (NL/BE/DE → Norden)? | Lukket i fase 2: Comext-CSV (195 datarader, ds-045409, 2022–2024) kvantifiserer strømmen. 2024: 121 038 t / 968 MEUR totalt til Norden, herav 41 355 t halvfabrikata (1803 masse + 1804 smør + 1805 pulver) og 77 405 t sjokolade (1806); Norge alene 9 911 t halvfabrikata + 11 281 t sjokolade; råbønner til Norden kun 195 t — bønneleddet stopper i EU. Forbehold: (a) CSV-en ligger på `codex/food-tg-arbeidsplan-2026-06-12` og må flettes + registreres (source-shortlist/CoverageProfile) før bruk; (b) Comext viser EU-eksport av alle opprinnelser — CI-andelen i strømmen kan ikke avledes (se #5) | **BESVART** (med flette- og opprinnelsesforbehold) |
| 4 | Hvilke nordiske merkevarer har CI-eksponering? | Besvart på programnivå med egenrapporterte kilder: Freia/Marabou via Cocoa Life (mass balance, CI i 2024-volumene), Fazer med eget bondeprogram i CI + Cocoa Horizons, Nidar RA/Vest-Afrika (mass balance jan–sep 2025), Cloetta 100 % RA uten oppgitt land, Toms som Ghana-kontrast. Språkregel fulgt («X oppgir at ...»). Kilde: uttak-07 kap. 2 | **BESVART** (programnivå) |
| 5 | Produktnivå-sporbarhet: hvilken EU-prosessor leverer til hvilket nordisk anlegg, og hvilken CI-andel ligger i hvert produkt? | Ukjent for alle merkevarer (uttak-07 ledd 4: «ukjent for alle»); mass balance gjør koblingen per definisjon udokumenterbar i åpne kilder. Krever aktørsvar (Mondelez/Orkla/Fazer: leverandør, HS-posisjon, DDS-referanseflyt) | **AKTØRGATE** — mer websøk løser det ikke |
| 6 | EUDR-rammen: omfang, frister, risikoklasse, hvor treffer DDS-plikten? | Kakao inkl. masse/smør/pulver/sjokolade omfattet; CI = standard risk (ikke high); frister 30.12.2026 (store/mellomstore) og 30.06.2027 (mikro/små); etter revisjonsenigheten 04.12.2025 ligger DDS-plikten hos EU-førsteleddet (importør/maler), nedstrøms primært referansenummer. Kilder: DRR-002, uttak-07 kap. 3, EUDR-treffkart (gren) | **BESVART** |
| 7 | Norsk EØS-særtilfelle? | Miljødirektoratet oppgir delvis innføring: kakaobønner, -skall og -avfall (HS 1801/1802) faller utenfor EØS-avtalen, videreforedlede kakaovarer omfattes ved import til Norge; norsk ikrafttredelse ikke fastsatt (Landbruksdirektoratet 05.05.2026: ikke innlemmet ennå). Asymmetrien treffer akkurat det norske importmønsteret fra #3 (masse/smør, ikke bønner) | **BESVART** (med tidscaveat — norsk forskriftsstatus sjekkes løpende) |
| 8 | CI-siden: hva dokumenterer det nasjonale sporbarhetssystemet faktisk? | Myndighetsomtale er sikret (dekret 13.09.2023, RPCCV ~1 mill. produsenter, 950 000 produsentkort, 37,4 %-avskogingstall) — men kun som artikkel på gouv.ci; selve dekretteksten, registermetoden og metoden bak 37,4 %-tallet mangler | **DELVIS** → prompt P-KAKAO-2 (primærdokumentjakt, ikke aktørkontakt) |
| 9 | Kakaoreststrømmer (pulp, pod husk, skall, Kumasi) — finnes et dokumenterbart sirkularitetscase? | Står watchlist/benchmark-only i DRR-002 (REST-1/REST-2): NCH-artikkelen tematiserer mulighetene, men ingen pilot med aktør + lokasjon + volum + output er funnet. Én smal desk-kill-test gjenstår før bevisst stopp | **ÅPENT** (smal) → prompt P-KAKAO-1; ved null funn: bevisst stopp, watchlist |
| 10 | Relasjonssporet: Natural State/NCH–LEAD Ivory Coast-MOU? | Kun aktøreid intensjonsomtale (LinkedIn-post); DRR-002s søkestrenger er uttømt uten avtaledokument. Avgjøres av intern dokumentask DASK-0906-002 (MOU/LOI, parter, scope, omtalerett) | **AKTØRGATE** — utenfor vår loop |

### Tallgrunnlag for #3 (regnet 12.06 direkte fra Comext-CSV-en på grenen; alle opprinnelser, NL+BE+DE → NO/SE/DK/FI)

| HS-kapittel | 2022 (t) | 2023 (t) | 2024 (t) | 2024 (MEUR) |
|---|---:|---:|---:|---:|
| 1801 råbønner | 125 | 216 | 195 | 1,5 |
| 1802 skall/avfall | 699 | 465 | 2 083 | 0,4 |
| 1803 kakaomasse | 12 221 | 12 556 | 13 009 | 116,4 |
| 1804 kakaosmør | 17 462 | 18 204 | 17 071 | 216,8 |
| 1805 kakaopulver | 9 226 | 9 564 | 11 275 | 48,8 |
| 1806 sjokolade mv. | 83 353 | 81 257 | 77 405 | 584,3 |
| **Sum 2024** | | | **121 038** | **968** |

Avsenderfordeling 2024: DE 56 634 t, NL 43 901 t, BE 20 502 t. Norge 2024: 1803 = 3 550 t, 1804 = 4 298 t, 1805 = 2 063 t (halvfabrikata 9 911 t), 1806 = 11 281 t, 1801 = 29 t. Verdiøkningen 2023→2024 ved ~flatt volum (særlig 1803/1804) speiler kakaoprissjokket — samme mønster som kaffeserien i desk-logg kap. 3. Tallene er interne arbeidstall til CSV-en er flettet og registrert i kontrollstacken.

## 3. Konklusjon for caset

**Kjernen er besvart.** Spørsmål 1–4, 6 og 7 — direkteimport-killen, EU-leddets struktur, kvantifiseringen av omveien og hele EUDR-/EØS-rammen — står på primær- eller aktøreide kilder med locator og tåler intern presentasjon i dag. Fortellingen er komplett med fig2: «Nordisk CI-eksponering er reell, men går via EU-prosessering og merkevareprogrammer — ikke via direkteimport», nå med tall på selve omveien (121 000 t / 968 MEUR i 2024, Norge ~9 900 t halvfabrikata).

**Ett handlingsnotat før tallbruk:** Comext-CSV-en og EUDR-treffkartet ligger på `codex/food-tg-arbeidsplan-2026-06-12` og må flettes til hovedgrenen og registreres i kontrollstacken (mottak → source-shortlist/CoverageProfile → PCQ) før #3-tallene brukes utenfor intern arbeidsflate.

**To ting står åpne og har hver sin prompt (kap. 4):** reststrøm-kill-testen (P-KAKAO-1 — casets eneste sirkularitetsspor; smal, med eksplisitt stoppkriterium) og CI-primærdokumentpakken (P-KAKAO-2 — dekretet og metoden bak 37,4 %-tallet).

**To ting skal vi bevisst IKKE researche mer på:** (1) LEAD Ivory Coast-relasjonen — det er DASK-0906-002, og DRR-002 har allerede uttømt de åpne søkene; (2) produktnivå-sporbarheten gjennom mass balance-leddet — den er per konstruksjon utilgjengelig i åpne kilder og hører i aktørask (samme fellestime som i avsjekk-06: mer websøk løser ikke aktørgater).

## 4. Research-prompts (Deep Research-format)

Kjøreregel: hver prompt kjøres i egen tråd, ETTER masterprompten fra `food-tg-deep-research-prompt-pack-2026-06-10.md` + datamodus-tillegget fra `food-tg-jt-tema-research-prosesser-og-modellkobling-2026-06-10.md` kap. 2. Output lagres som `deep-research-kakao-<id>-YYYY-MM-DD.md` og går gjennom kontrollstacken (mottak → SRC/PCQ → claim-lock) før bruk.

### P-KAKAO-1: Kill/validate-test for kakaoreststrømmer (smal)

```text
Oppgave: Kill/validate-test — finnes minst ÉN dokumentert pilot eller operasjon for valorisering av kakaoreststrømmer (kakaopulp/mucilage, pod husk/kabosser, bønneskall) i Côte d'Ivoire eller med eksplisitt Côte d'Ivoire-råvare, som oppfyller ALLE fire krav: navngitt operatør, lokasjon, volum (tonn/år eller batch), og dokumentert output/marked?

Søk kun i dokumenterbare kilder: FAO/UNIDO-prosjektdokumenter, Conseil du Café-Cacao, EU-finansierte prosjektdatabaser (CORDIS, DeSIRA), universitetspiloter med publisert rapport, selskapers egne kanaler (f.eks. Kumasi Drinks: hvilke land, hvilke volum, hvilken EU-kunde — kun det de selv dokumenterer). Fransk søkespråk er påkrevd parallelt med engelsk (valorisation des cabosses, coques de cacao, résidus).

Leveranseformat: ledger-tabell initiativ | reststrøm | operatør | lokasjon | volum | enhet | år | output/marked | TRL/status | kilde | URL | locator | datakvalitet. Initiativ som mangler ett eller flere av de fire kravene føres i egen "ufullstendig"-tabell — de teller IKKE som funn.

Stoppkriterium (skal stå i konklusjonen): hvis ingen rad oppfyller alle fire krav, er konklusjonen "bekreftet watchlist/benchmark-only — bevisst stopp", etter samme mønster som Polen-kill-testen (desk-logg kap. 7). Ikke bruk Kumasi-omtalen i NCH-artikkelen som funn — den er sekundær. Ikke bruk Ghana-piloter som bevis for Côte d'Ivoire.
```

### P-KAKAO-2: CI-sporbarhetens primærdokumenter (dokumentjakt, ikke aktørkontakt)

```text
Oppgave: Hent og vurder primærdokumentene bak Côte d'Ivoires nasjonale kakao-sporbarhetssystem, som i dag kun er belagt med myndighetsartikkelen på gouv.ci (07.10.2024).

1. Dekretet av 13. september 2023 om nasjonalt sporbarhetssystem for kaffe-kakao: finn selve dekretteksten (Journal Officiel de la République de Côte d'Ivoire, nummer/dato), og oppgi hva den faktisk hjemler — systemeier, datainnhold, geolokalisering/polygonkrav, datatilgang for kjøpere.
2. RPCCV-registeret: finnes en registerrapport eller teknisk dokumentasjon fra Conseil du Café-Cacao som belegger tallene ~1 mill. registrerte produsenter, 3,2 mill. ha, 950 000 produserte / ~807 000 distribuerte kort — med metode og oppdateringsdato?
3. 37,4 %-tallet («kakaoens andel av avskogingen»): finn opprinnelig studie/rapport med metode, tidsperiode og datakilde. Hvis tallet bare finnes som sekundær gjengivelse, merk raden "sekundær — finn primær" og rapporter det som funn.
4. EUDR-kompatibilitet: finnes offentlig dokumentasjon (EU-CI-dialog, Sustainable Cocoa Initiative, ARS-1000-standard) på om/hvordan systemets data kan brukes i DDS — uten å anta at det kan?

Leveranseformat: dokumenttabell (dokument | utgiver | dato | offisiell referanse | URL | locator | hva det beviser | hva det ikke beviser), deretter datatabell etter datamodus-skjemaet for tallene i punkt 2–3, deretter claim-lock-forslag: 1–2 trygge formuleringer + 2–3 hold-tilbake-formuleringer.
Ikke kontakt aktører i denne kjøringen — alt som krever svar fra CCC/myndigheter går til DASK, ikke hit. Ikke omtal Côte d'Ivoire som high risk (EU-klassifisering: standard risk).
```

## 5. Avsjekknotat

Avsjekken bruker pilotmalen fra `avsjekk-06-fish-restrastoff-2026-06-12.md` kap. 5 uendret. Korreksjoner som overstyrer eldre dokumenter er kontrollert mot dette caset: KT-overtakelsen av god handelsskikk (30.04.2026), bortleggingen av innkjøpsbetingelses-forslaget (03.10.2025) og DRR-003/004-duplikatene berører ikke kakaocasets kilder eller statuser — ingen av dem er brukt som belegg her.
