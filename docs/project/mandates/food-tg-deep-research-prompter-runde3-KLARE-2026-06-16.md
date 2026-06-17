---
tittel: Food TG — Klare Deep Research-prompter, Runde 3 (lukk datahull)
status: Klar til bruk
eier: Gabriel
dato: 2026-06-16
scope: Selvstendige, lim-rett-inn-prompter for å lukke de gjenstående datahullene fra runde 2 + et par anbefalte ekstra søk. Hver prompt er komplett (rolle + datamodus + oppgave + format + guardrails).
bruksregel: >
  Slå på Deep Research i ChatGPT. Lim inn ÉN prompt per tråd. Lagre output som `deep-research-r3-<tema>-YYYY-MM-DD.md`. Output er IKKE faktastemme — den skal gjennom mottak → source-shortlist → PCQ → claim-lock før bruk i deck/whitepaper/plattform. ID-serie for mottak: `DRO-R3-<tema>`.
relaterte_filer:
  - research/external/r2/DRO-R2-INDEX-2026-06-16.md
  - research/external/r2/STATBANK-dk-island-gjodsel-2026-06-16.md
  - research/external/r2/nutrient-loop-realiserte-tonn-2026-06-16.md
  - research/external/r2/SSB-08801-norge-brasil-uttrekk-2026-06-16.md
  - docs/project/mandates/food-tg-runde2-konsolidering-2026-06-16.md
---

# Klare Deep Research-prompter — Runde 3

**Bruk:** Åpne ChatGPT, slå på **Deep Research**, lim inn én prompt. Én prompt = én tråd. Lagre svaret, kjør det gjennom mottak før noe brukes utad.

**Anbefalt rekkefølge:** R3-01 og R3-02 (kjernehull, lukker `sammenligning`-figurens Island-celle og styrker B-spor-narrativet). R3-03 og R3-04 er anbefalte ekstra søk. DEL 3 er ren overvåking — ikke søk nå.

---

# DEL 1 — Kjernehull (parkert fra runde 2)

## R3-01 — Island mineralgjødsel N/P/K (+ digestat)

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Gjør Deep Research og hent et avgrenset datagrunnlag — ikke et essay. Aldri oppdiktede tall.

ARBEIDSREGLER:
- Prioriter primærkilder: offisiell statistikk, regelverk, datasett, institusjons-/aktørrapporter. Sekundærkilder kun som spor.
- Skill (1) fakta, (2) inferens, (3) sekundær omtale, (4) ikke funnet, (5) motbevist. Rapporter negative funn eksplisitt; tomme celler er hovedfunn.

DATAMODUS: All kvantitativ output i tabell: verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet. Oppgi P/K-basis (element vs P2O5/K2O) eksplisitt. Oppgi om data finnes som API/CSV.

CASE: Islands mineralgjødselforbruk (N, P, K), nyeste år, som siste brikke i en nordisk gjødselsammenligning (NO/SE/DK er allerede hentet i element-basis).

Hent mot primærkilde:
1. Statistics Iceland (Hagstofa Íslands) tabell **LAN10001** «Consumption of artificial fertilizers from 1977» — variabler `Ár` (år, nyeste = 2024) og `Áburður` (0 = Nitrogen N, 1 = Phosphorus P, 2 = Potash/Kalium K). Hent N, P, K for nyeste tilgjengelige år. Tabellen ligger i PxWeb (px.hagstofa.is); hvis nettleser/eksport-lenke (CSV/JSON) er tilgjengelig, bruk den.
2. Oppgi eksplisitt om Islands P og K er element-basis (P, K) eller oksid (P2O5, K2O) — dette avgjør sammenlignbarhet mot NO/SE/DK.
3. Bonus hvis tid: finnes det islandske digestat-/biogass-/næringsretur-tall (slam, husdyrgjødsel, geotermisk drivhus-næring)? Kort, kun primærkilde.

SØKESTRENGER: Hagstofa LAN10001 artificial fertilizers consumption; Statistics Iceland fertilizer nitrogen phosphorus potassium 2024; px.hagstofa.is áburður köfnunarefni fosfór kalí.

LEVERANSEFORMAT: datatabell (N/P/K, nyeste år, element/oksid-basis) + kildeledger + kort dom + «ikke si»-liste.
Hvis verdiene ikke kan hentes (POST-/eksport-blokkert), rapporter det eksplisitt som hovedfunn og oppgi nøyaktig hvilken tabell/variabel/år som mangler. Statusord: deckklart internt / needs-primary-check / needs-data.
```

## R3-02 — Nordiske digestat- og næringsretur-volumer (DK / FI / NO / IS)

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Gjør Deep Research og hent et avgrenset datagrunnlag — ikke et essay. Aldri oppdiktede tall.

ARBEIDSREGLER:
- Prioriter primærkilder (statistikkbyrå, energimyndigheter, bransjeorganer, fagrapporter). Sekundærkilder kun som spor.
- Skill fakta / inferens / sekundær / ikke funnet / motbevist. Rapporter negative funn eksplisitt.
- VIKTIG skille: energiutnyttelse (biogass) ≠ næringsretur. Bare dokumentert bruk av digestat/biorest/slam/husdyrgjødsel som faktisk erstatter mineralgjødsel teller som næringssirkularitet.

DATAMODUS: All kvantitativ output i tabell: verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet. Skill «produsert digestatmengde» fra «realisert næringsretur (N/P/K)». Oppgi API/CSV-tilgjengelighet.

CASE: Realisert næringsretur fra biogass/digestat i Norden per land. Sverige er allerede dekket (Avfall Sverige: ~1 200 t P, ~3 700 t K, ~6 200 t NH4-N på åkermark, 2024). Hullet er DK, FI, NO og IS.

Hent mot primærkilder, per land (DK, FI, NO, IS):
1. Produsert digestat-/biorestmengde per år (tonn) fra biogassanlegg (husdyrgjødsel + matavfall).
2. Realisert næringsretur i tonn N / P / K som faktisk brukes som gjødsel på jord (ikke bare energiproduksjon).
3. Andel av nasjonalt mineralgjødselforbruk som digestat-/biorest-næring tilsvarer (hvis kilden oppgir det).
Kilder å sjekke: DK — Energistyrelsen, Biogas Danmark, Danmarks Statistik. FI — Statistics Finland (PxWeb), Luke, Gasum, Suomen Biokierto ja Biokaasu. NO — NIBIO, Avfall Norge, Miljødirektoratet, Landbruksdirektoratet. IS — Umhverfisstofnun, Orkustofnun.

SØKESTRENGER (lokalt + EN): Energistyrelsen biogas afgasset biomasse næringsindhold; Biogas Danmark digestat fosfor kvælstof; Statistics Finland biogas digestate nutrient; Luke biokaasu mädäte ravinne; NIBIO biorest næringsinnhold gjødsel volum; Avfall Norge biogjødsel tonn.

LEVERANSEFORMAT: én tabell per land (digestatmengde + realisert N/P/K-retur) + kildeledger + kort dom + datagap-liste («hvilke land har bare energitall, ikke næringsretur»).
Ikke si at biogass = næringssirkularitet uten dokumentert retur. Tomme celler er hovedfunn. Statusord: deckklart internt / needs-primary-check / needs-data.
```

---

# DEL 2 — Anbefalte ekstra søk

## R3-03 — Norsk fiskeslam: realisert bruk per sluttbruk (aktørcensus)

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Gjør Deep Research og bygg en aktør-/anleggscensus — ikke et essay. Aldri oppdiktede tall. Et godt dokumentert negativfunn er gyldig.

ARBEIDSREGLER:
- Prioriter primærkilder: aktørenes egne rapporter/årsregnskap, Norske Utslipp / Statsforvalter-rapporter, Mattilsynet-register, SINTEF/Nofima. Sekundærkilder kun som spor.
- Skill REALISERT (målt/rapportert) fra POTENSIAL/MODELLERT. Skill prosessbiprodukt (restråstoff) fra ekskret-/slamgjenvinning — IKKE bland SINTEFs 89 %-restråstofftall inn som slamtall.

DATAMODUS: tabell per aktør/anlegg: aktør | lokasjon | mengde slam (t/år) | sluttbruk (gjødsel/biogass/eksport) | år | kilde | URL | locator | datakvalitet.

CASE: Realisert bruk av norsk oppdrettsslam etter sluttbruk. Runde 2 bekreftet at det IKKE finnes et nasjonalt aggregat; målet nå er en bottom-up-census fra navngitte aktører/anlegg.

Hent mot primærkilder:
1. De største slam-/biorest-aktørene: Bioretur, Sterner, Blue Ocean Technology, HØST/Grønn Vekst, Scanship/Vow, settefisk-/landbaserte oppdrettsanlegg med slamoppsamling. Årlig slammengde behandlet + sluttbruk.
2. Eksportstrømmer av slambasert gjødsel (f.eks. Terramarine/Grønn Vekst ~5 500 t blandet gjødsel ~2020 — verifiser/oppdater).
3. Hvilket organ som EVENTUELT ville holdt et nasjonalt aggregat (Fiskeridirektoratet, Miljødirektoratet, SSB) — bekreft om det finnes eller er et reelt hull.

SØKESTRENGER: Bioretur slam tonn årsrapport; oppdrettsslam gjødsel eksport Norge; Grønn Vekst Terramarine fiskeslam Vietnam; settefiskanlegg slamoppsamling tonn Statsforvalteren; Blue Ocean Technology slam gjenvinning.

LEVERANSEFORMAT: aktør-/anleggscensus-tabell + kildeledger + kort dom + eksplisitt «nasjonalt aggregat finnes/finnes ikke»-konklusjon.
Ikke oppgi modellerte potensialtall (300 000+ t) som realisert. Statusord: deckklart internt / needs-primary-check / needs-data / needs-actor-validation.
```

## R3-04 — Brasil-soyaandelens fall i 2025: reell endring eller revisjon?

```text
Du er researchanalytiker for et prosjekt om sirkulære nordiske matsystemer. Gjør Deep Research og avklar ett spesifikt funn — ikke et essay. Aldri oppdiktede tall.

ARBEIDSREGLER:
- Prioriter primærkilder (SSB, Comtrade, aktørenes egne rapporter). Skill fakta / inferens / sekundær / ikke funnet.
- Skill «foreløpige tall som revideres» fra «reell strukturell endring».

DATAMODUS: tabell: verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet.

CASE: SSB tabell 08801 viser at Brasils andel av norsk soyabønneimport (HS 12019090, mengde) falt fra ~70–80 % (2015–2024) til ~42 % i 2025 (foreløpige tall). Spørsmål: er dette en reell endring eller et artefakt av foreløpig statistikk?

Avklar mot primærkilder:
1. SSB 08801 for 2025 (foreløpig): Brasils mengde + Verden, og hvilke ANDRE land som økte sin andel av norsk soyaimport i 2025 (USA, Canada, Paraguay, Argentina?).
2. Denofa og Felleskjøpet Agri: omtaler de en endring i soya-opprinnelse / leverandørmiks i 2024–2025 (årsrapport, bærekraftrapport, pressemelding)?
3. Avskoging/EUDR-drevet sourcing: finnes dokumentasjon på at norske aktører flytter soyakjøp bort fra Brasil av sporbarhets-/avskogingsgrunner?
4. Når revideres SSBs 2025-tall til endelige, og hvor mye pleier foreløpige tall å bli justert?

SØKESTRENGER: SSB 08801 soyabønner import land 2025; Denofa soya origin 2025 sustainability; Felleskjøpet soya Brasil USA Canada 2025; norsk soyaimport opprinnelse endring 2025 avskoging.

LEVERANSEFORMAT: tabell over soyaimport per opprinnelsesland 2024 vs 2025 + aktøromtaler + kort dom (reell endring / revisjonsusikkerhet / uavklart) + «ikke si»-liste.
Ikke si at Brasil-andelen «har falt til 42 %» som etablert faktum før 2025-tallene er endelige. Statusord: deckklart internt / needs-primary-check / needs-data.
```

---

# DEL 3 — Monitor (datostyrt — IKKE søk nå)

Disse skal ikke researches nå; de re-sjekkes når en konkret hendelse inntreffer. Legg dem i en oppfølgingsliste.

| Punkt | Re-sjekk når | Hva | Kilde |
|---|---|---|---|
| Dansk landbruks-CO2e-avgift | Lovforslag fremsettes (forventet mot 2030-ikrafttredelse) | Endelig vedtatt lovtekst, sats, bunnfradrag | Retsinformation / Skatteministeriet |
| Dansk nitrogen-lov | H1 2026 → virkning 2027 | Vedtatt modell, baseline, rekalibrering | Folketinget / Miljøministeriet |
| DK mineralgjødsel 2023/24 | Endelig revisjon (~des 2026) | Bekreft P/K-verdiene (nå foreløpige) | Danmarks Statistik GOEDSALG |
| SSB soya 2025 | Endelig revisjon (mai 2026/2027) | Bekreft Brasil-andel (nå foreløpig ~42 %) | SSB 08801 |
| Varde §25-høring (spillvarme) | Etter 25.06.2026 | Utfall + ev. navngitt drivhusoperatør | Statsforvalter / eInnsyn |

---

## Mottak og prioritering

- Alle DEL 1–2-utfall: `deep-research-r3-<tema>-YYYY-MM-DD.md` → mottakslogg (`DRO-R3-<tema>`) → SRC/PCQ → claim-lock før bruk.
- **R3-01 lukker** Island-cellen i `sammenligning`-gjødselfiguren (i dag «ikke hentet»).
- **R3-02 styrker** B-spor-narrativet (realisert næringsretur per land, ikke bare energi).
- **R3-03** gir en ærlig norsk fiskeslam-census (eller bekrefter hullet endelig).
- **R3-04** avklarer det mest slående enkeltfunnet i handelsaksen før det brukes utad.

*Jeg kan også forsøke å hente R3-01 (Island) og R3-02 (digestat) direkte via statistikk-API-ene (slik SSB/DST ble hentet), hvis du heller vil ha tallene rett inn enn å kjøre promptene i ChatGPT. Si fra.*
