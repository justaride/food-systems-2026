# Datatilgang fra Brønnøysund — kartlegging og anbefalinger

> Dato: 2026-06-16
> Omfang: Hvorfor konsern-dataene ser tynne ut, hvor mye som faktisk kan hentes gratis, og hva som bør bygges.
> Kilder: Brønnøysund Enhetsregisteret + Regnskapsregisteret (åpne API-er), prøvd live 2026-06-16. Rådata arkivert i `research/evidence-pack/registry-sources/regnskapsregisteret/`.

## Kortversjon

Dataene mangler ikke der ute — de er gratis, ferske og maskinlesbare. Problemet er at prosjektet aldri har bygget et uttrekk mot **Regnskapsregisteret**, så alle regnskapstall er håndskrevne literals i import-skript (~180 rader totalt). Et stikkprøve-uttrekk mot 10 konsern-røtter ga **100 % treff**: alle hadde innleverte årsregnskap tilgjengelig via API, alle på 2024 eller nyere, og to (TINE, REMA) hadde allerede 2025 levert. Den samme infrastrukturen som allerede henter selskapsstruktur (`refresh:brreg`) kan utvides til regnskap med få dagers arbeid.

Den viktigste fellen: API-ets standardrecord er **selskapsregnskap** (enkeltenhet), ikke konsernregnskap. For holdingmødre som NorgesGruppen ASA gir det 590 MNOK i stedet for konsernets ~100 mrd. Et naivt uttrekk vil derfor *overskrive* de korrekte konserntallene med feil tall. Anbefalingen tar høyde for dette.

---

## 1. Hva som er gjort i denne omgangen (kodefikser)

| # | Fil | Endring | Effekt |
|---|---|---|---|
| 1 | `src/lib/queries/ownership.ts` | Konsern-dossier + indeks summerer nå hvert selskaps *siste tilgjengelige* regnskapsår, ikke et fast `currentYear-1` | Toppboksene (Sum omsetning / Sum ansatte) viser tall for **alle** konsern, ikke "—" |
| 2 | `src/lib/queries/konsern.ts` | Seksjon 4 ("topp 5", "uten siste regnskap") bruker per-selskap-siste år | Konsekvent med toppboksene |
| 3 | `scripts/audit-konsern-coverage.ts` | "Måltår"-logikken erstattet med en fast ferskhetsterskel (`currentYear-2`) per selskap | Gap-teksten "har bare eldre regnskap enn målt år 2025" forsvinner; kvalitetsscore straffes ikke lenger av ett streif-2025-tall |
| 4 | `scripts/import-company-data.ts` | Ekte 2025-regnskap for REMA 1000 Norge AS fra Regnskapsregisteret | REMA-dossieret viser 5,9 mrd / 550 ansatte |
| 5 | `src/lib/queries/ownership.ts` + `data/konsern-coverage.json` | REMA 1000 Norge fjernet som egen konsern-rot | Vises nå kun i Reitan Retail-treet |

Verifisert: `npm run test` (546 grønne), `tsc --noEmit` og `eslint` rene på endrede filer, DB-fri `compute-metrics` kjører.

### Hvorfor "per-selskap-siste år" og ikke "gruppens maks-år"

Audit-laget brukte før gruppens høyeste regnskapsår som referanse. Stikkprøven viser hvorfor det er feil: enkelte tre inneholder ett selskap som allerede har levert neste år (f.eks. en nordisk enhet på 2025), noe som dyttet "måltåret" til 2025 og fikk alle de korrekte 2024-selskapene til å se ut som etterslep. Per-selskap-siste dropper aldri et selskap fra summen og feilstempler ingen.

---

## 2. Hvor mye kan vi faktisk hente? (stikkprøve 2026-06-16)

Alle tall er **driftsinntekter fra `regnskapstype=SELSKAP`** (enkeltenhet). 10 av 10 testede røtter hadde regnskap tilgjengelig gratis via API.

| Konsern (rot) | Org.nr | Form | Siste levert | Driftsinntekter (selskap) | Merknad |
|---|---|---|---|---:|---|
| NorgesGruppen ASA | 819731322 | ASA | 2024 | 590 MNOK | ⚠ holding — konsern ~100 mrd ligger ikke i selskapsrecord |
| Orkla ASA | 910747711 | ASA | 2024 | 292 MNOK | ⚠ holding — konsern i årsrapport |
| Coop Norge SA | 936560288 | SA | 2024 | 62 245 MNOK | enheten bærer driftsinntekter |
| Nortura SA | 938752648 | SA | 2024 | 23 881 MNOK | |
| TINE SA | 947942638 | SA | **2025** ✅ | 24 229 MNOK | 2025 allerede levert |
| SalMar ASA | 960514718 | ASA | 2024 | 331 MNOK | ⚠ holding |
| BAMA Gruppen AS | 914224314 | AS | 2024 | 12 864 MNOK | mor bærer driftsinntekter |
| ASKO Norge AS | 929228723 | AS | 2024 | 524 MNOK | ⚠ `smaaForetak=true` — trolig feil/holding-enhet; reell ASKO ~50 mrd |
| REMA 1000 Norge AS | 982254604 | AS | **2025** ✅ | 5 890 MNOK | franchise/IP-enhet |

Hver record gir også: driftsresultat, årsresultat, finansposter, sum eiendeler, egenkapital, gjeld (kort/lang), valuta, regnskapsperiode og revisjonsstatus. Enhetsregisteret gir i tillegg `antallAnsatte` og `sisteInnsendteAarsregnskap` — gratis, i samme kall vi allerede gjør.

**Konklusjon:** for den lange halen av operative datterselskap (enkeltenheter) er Regnskapsregisteret en tilnærmet komplett, gratis erstatning for håndkuratering. For de ~6 børsnoterte/holding-mødrene trengs fortsatt konserntall fra årsrapport.

---

## 3. Svakheter i datasettet

1. **Ingen Regnskapsregister-import finnes.** Alle regnskapstall er literals (~156 rader i `import-company-data.ts`, ~24 i `property-companies.ts`). Dette er kjernen i at det "ser ut som vi ikke finner data".
2. **`refresh:brreg` henter allerede ferskhetssignalet og kaster det.** Skriptet kaller Enhetsregisteret (NACE, adresse, ansatte, status) men ignorerer `sisteInnsendteAarsregnskap`. Koden har til og med en kommentar om at Enhetsregisteret *ikke* gir regnskapstall — men oppfølgeren ble aldri bygget.
3. **Selskap- vs konsernregnskap-fellen.** Standard API-record er enkeltenhet. Et naivt uttrekk vil overskrive NorgesGruppens korrekte ~118 mrd (årsrapport) med 590 MNOK (holding-enhet). Må håndteres eksplisitt.
4. **Ansatte vises ikke selv når vi har dem.** Dossier-toppboksen leser `CompanyFinancial.groupEmployees`, ikke `Company.employees`. `refresh:brreg` fyller `Company.employees` fra Enhetsregisteret, men det når aldri toppboksen. Derfor "—" på Sum ansatte.
5. **Mulig feil rot-enhet for ASKO.** 929228723 gir 524 MNOK og `smaaForetak=true` — ikke den operative ASKO (~50 mrd). Bør verifiseres mot Enhetsregisteret (`validate:brreg` finnes allerede og kan utvides).
6. **Eierandeler/styre er fortsatt delvis manuelt.** Enhetsregisterets rolle-API gir styre/daglig leder maskinelt; eierandeler (aksjonærer) ligger i Aksjonærregisteret (Skatteetaten, årlig CSV), ikke i Brønnøysund — det er den ene biten som ikke er et enkelt API-kall.

---

## 4. Anbefalinger (prioritert)

**A. Bygg `scripts/import-brreg-financials.ts`** (størst gevinst, ~1–2 dager).
Speil mønsteret i `refresh-brreg-tracked.ts`: iterér over alle sporede org.nr, `GET /regnskapsregisteret/regnskap/{orgnr}`, upsert `CompanyFinancial` (revenueNok, operatingResult, operatingMargin, groupEmployees, year, source). For hver enhet:
- Foretrekk `regnskapstype=KONSERN` der den finnes; ellers `SELSKAP`.
- Sett en allow-list av børsnoterte/holding-mødre (NG, Orkla, SalMar, Lerøy, Austevoll, Mowi) der API-selskapstall **ikke** skal overskrive eksisterende konserntall fra årsrapport.
- Lagre rå JSON som `registry_snapshot` med `accessedAt` + SHA-256 (som gjort for REMA), så kildepolicyen er oppfylt.

**B. Fang `sisteInnsendteAarsregnskap` i `refresh:brreg`** — gratis ferskhets-/tilgjengelighetsflagg fra kallet vi allerede gjør.

**C. Fiks ansatte-plumbingen** — skriv `antallAnsatte` til siste regnskapsrad som `groupEmployees`, eller la dossieret falle tilbake til `Company.employees`.

**D. Verifiser org.nr mot Enhetsregisteret** (utvid `validate:brreg`) — fang feil røtter som ASKO-tilfellet.

**E. Aksjonærregisteret for eierandeler** — egen, mindre jobb: årlig CSV fra Skatteetaten gir eierandeler maskinelt der vi i dag kurerer manuelt.

### MCP / andre tilkoblinger

Connector-registeret har kun betalte, globale finansdata-tjenester (PitchBook, S&P Global, Carta) — ingen er koblet til, og ingen dekker norske selskaper bedre enn det offisielle, gratis registeret. De tilkoblede MCP-ene (Notion, Gmail, Drive, Figma, Slack m.fl.) er produktivitetsverktøy, ikke datakilder for dette. **Riktig "konnektor" her er et direkte Regnskapsregister-uttrekk — ingen MCP nødvendig.**

---

## 5. Hva som må kjøres for å gjøre fiksene live

Kodefiksene (seksjon 1, punkt 1–3 + 5) slår inn ved deploy. For REMA-tallet og oppfrisket dekning trengs DB-tilgang:

```
npm run db:import:companies     # laster REMA 2025-regnskapet
npm run compute-metrics:full    # regenererer konsern-coverage.json + profiles.json
```

Deretter commit + deploy via GitHub `justaride`.

---

## 6. Før/etter-projeksjon (alle 13 konsern)

Effekten kommer i to lag:

**Lag 1 — kodefiksen alene (ved deploy, ingen importer):** Alle 12 konsern-røtter har allerede kuraterte 2024-tall i databasen. Årsfiksen gjør at toppboksene (Sum omsetning / Sum ansatte) går fra "—" til reelle summer **umiddelbart ved deploy** — dette var hele "—"-problemet. Ingen DB-import trengs for dette laget.

**Lag 2 — importeren:** fyller datterselskap som mangler regnskap helt (audit-gapene: NorgesGruppen 3, Coop 1, SalMar 1, m.fl.), oppdaterer enkeltselskapstall, og legger til 2025 etter hvert som det leveres. Holding-mødrene hoppes over så konserntall bevares; Mowi flagges i tillegg som EUR.

Live registertall for alle 13 dossier-røtter (driftsinntekter, `regnskapstype=SELSKAP`, hentet 2026-06-16):

| Konsern (rot) | Org.nr | Form | Reg.-tall (selskap) | År | Klasse | Importer-handling |
|---|---|---|---:|---|---|---|
| NorgesGruppen ASA | 819731322 | ASA | 590 MNOK | 2024 | holding | **SKIP** — behold kuratert konsern (~118 mrd) |
| Orkla ASA | 910747711 | ASA | 292 MNOK | 2024 | holding | **SKIP** — behold kuratert |
| Coop Norge SA | 936560288 | SA | 62 245 MNOK | 2024 | operativ | fyll/oppdater |
| TINE SA | 947942638 | SA | 24 229 MNOK | **2025** ✅ | operativ | legg til 2025 |
| Nortura SA | 938752648 | SA | 23 881 MNOK | 2024 | operativ | fyll/oppdater |
| Felleskjøpet Agri SA | 911608103 | SA | 14 800 MNOK | 2024 | operativ | fyll/oppdater |
| BAMA Gruppen AS | 914224314 | AS | 12 864 MNOK | 2024 | operativ | fyll/oppdater |
| REMA 1000 Norge AS | 982254604 | AS | 5 890 MNOK | **2025** ✅ | franchise/IP | lagt inn (under Reitan) |
| ASKO Norge AS | 929228723 | AS | 524 MNOK | 2024 | ⚠ trolig feil rot | verifiser org.nr (reell ASKO ~50 mrd) |
| Lerøy Seafood Group ASA | 975350940 | ASA | 404 MNOK | 2024 | holding | **SKIP** — konsern ~30 mrd |
| SalMar ASA | 960514718 | ASA | 331 MNOK | 2024 | holding | **SKIP** |
| Mowi ASA | 964118191 | ASA | 1 931 M**EUR** | 2024 | holding + valuta | **SKIP** + EUR-vakt |
| Austevoll Seafood ASA | 929975200 | ASA | 2,5 MNOK | 2024 | holding | **SKIP** |

Nytt funn fra denne runden: **Mowi rapporterer i EUR**, ikke NOK. Importeren har fått en valuta-vakt (`isNokReported`) som hopper over og flagger ikke-NOK-filere for manuell FX (Norges Bank årsgjennomsnitt) i stedet for å lagre EUR-tall som om de var kroner. Dette gjelder potensielt også andre eksportører i den lange halen.

## Vedlegg: kilder

- Regnskapsregisteret API: `https://data.brreg.no/regnskapsregisteret/regnskap/{orgnr}` (åpent, ingen auth)
- Enhetsregisteret API: `https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr}` (åpent, ingen auth)
- Rådata-snapshots: `research/evidence-pack/registry-sources/regnskapsregisteret/` (REMA full record + 10-rot stikkprøve, hentet 2026-06-16)
