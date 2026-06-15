---
tittel: Food TG — Maktkart Brønnøysund-stikkprøve (primærsjekk §8): funn 2026-06-14
status: Primærsjekk utført (delvis) — løfter intern baseline mot citable
eier: Gabriel
dato: 2026-06-14
arbeidspakke: Maktkart-syntese §8 steg 1 (vei 1 «mot citable») + AP-1/AP-5 claim-gate
datakilde: Brønnøysundregistrene — Enhetsregisteret (`/enheter`) og roller i virksomheten (`/roller`), hentet 2026-06-14
bruksregel: Primærsjekk mot offentlig register. Bekrefter juridisk form, konsernmedlemskap og styre-/daglig-leder-kontroll med dato. Bekrefter IKKE eierandel-% (krever Skatteetaten Aksjonærregisteret). «Makt»/«kontroll» = strukturell posisjon, ikke intensjon. Citable først etter full operator-sekvens (DB-audits).
relaterte_filer:
  - docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md
  - docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap1-dekningsutvidelse-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md
  - research/analyse/ap5-ap1-bronnoysund-stikkprove-2026-06-14.json
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
  - research/CITABLE-KNOWLEDGE-BASE-STATUS.md
---

# Maktkart — Brønnøysund-stikkprøve (primærsjekk §8)

## 1. Kort funn

Maktkart-syntese §8 krever, som første steg mot citable, en Brønnøysund-stikkprøve av (a) ultimate ownership for topp-konsernene (AP-5) og (b) styreverv for topp-broene (AP-1). Begge er nå kjørt mot Brønnøysund-registrene for 22 selskaper.

Resultatet bekrefter maktkartets **struktur** på primærkilde: **22 av 22 selskaper matcher forventet juridisk form** (samvirke = SA, familie/privat = AS, børsnotert = ASA), alle er aktive og konsernregistrerte, og **9 av 10 AP-1-broere er bekreftet med sittende styreverv og dato**. Den ene som ikke ble funnet (Trond Bentestuen) lå utenfor de 22 selskapene i utvalget — verken bekreftet eller avkreftet.

Det stikkprøven **ikke** bekrefter er eierandel-prosentene (AP-5s «kontrollerer 39 selskaper / ≥50 %»). Brønnøysund roller gir styre- og daglig-leder-kontroll, ikke aksjefordeling. Eierandel-laget står fortsatt på årsrapport-kilder (allerede i DB) og bør krysssjekkes mot Skatteetatens Aksjonærregister som neste primærsteg.

Nettoeffekt: maktkartets **kontrollstruktur** (hvem styrer hva, via hvilken selskapsform) er nå primærsjekket; det **kvantitative eierlaget** (hvor stor andel) gjenstår. Det løfter CL-MAKTKART-001 / CL-AP1-001 / CL-AP5-001 fra `intern baseline` til `klar-med-forbehold` for strukturpåstanden, men ikke til full citable før operator-sekvensen er kjørt.

## 2. Metode og avgrensning

For hvert målselskap: orgnr resolvert via Brønnøysund navnesøk (eller seedet der vi hadde høy-konfidens orgnr og verifisert mot returnert navn), deretter hentet `/enheter/{orgnr}` (juridisk form, `erIKonsern`, status, NACE, registreringsdato) og `/enheter/{orgnr}/roller` (styreleder, nestleder, daglig leder, styremedlemmer; `fratraadt`-flagg; `sistEndret`-dato per rollegruppe). Bro-personer bekreftes ved token-subsett-match mot alle hentede roller (så «Dina Thune» matcher «Dina Gjersøyen Rolstad Thune»).

**Hva metoden bekrefter:** juridisk form, konsernmedlemskap, hvem som sitter i styret / er daglig leder, og når styret sist ble endret. **Hva den ikke bekrefter:** eierandel-prosent, transitiv ≥50 %-kontroll, antall kontrollerte datterselskaper. Det krever Aksjonærregisteret (Skatteetaten, åpne årlige data) eller årsrapport-aksjonærlister.

Rådata: `research/analyse/ap5-ap1-bronnoysund-stikkprove-2026-06-14.json`.

## 3. AP-5 — ultimate ownership: form- og kontrollsjekk (topp-konsern)

Maktkart §4 hevder en bestemt eiertype-typologi per aktør. Brønnøysund bekrefter formen og navngir kontrollpersonene:

| Aktør | Orgnr | Form (forventet→funnet) | Konsern | Styreleder | Daglig leder | Styre sist endret |
|---|---|---|---|---|---|---|
| NorgesGruppen ASA | 819731322 | ASA → **ASA ✓** | ja | **Johan Johannson** | Runar Hollevik | 2026-02-17 |
| Reitan AS | 912609987 | AS → **AS ✓** | ja | **Odd Reitan** | Odd Reitan | 2025-01-07 |
| Coop Norge SA | 936560288 | SA → **SA ✓** | ja | Runar Laukvik Leite | Philipp L. H. Engedal | 2026-02-02 |
| BAMA Gruppen AS | 914224314 | AS → **AS ✓** | ja | Kristian Nergaard | Bent Andersen | 2026-05-08 |
| Nortura SA | 938752648 | SA → **SA ✓** | ja | Johan Narum | Morten Henriksen | 2025-08-06 |
| Felleskjøpet Agri SA | 911608103 | SA → **SA ✓** | ja | Jens Lippestad | Svenn Ivar Fure | 2026-05-06 |
| TINE SA | 947942638 | SA → **SA ✓** | ja | Rolf Øyvind Thune | Ann-Beth N. J. Freuchen | 2026-05-08 |
| Mowi ASA | 964118191 | ASA → **ASA ✓** | ja | (vakant/fratrådt v. uttrekk) | Ivan Vindheim | 2026-03-01 |

Tre kontrollstrukturer bekreftes direkte av styresammensetningen:

- **NorgesGruppen** styres av **Johan Johannson** (Johannson-familien) som styreleder, med Runar Hollevik som konsernsjef. Bekrefter familiekontroll.
- **Reitan AS** har **Odd Reitan** som både styreleder og daglig leder, med Ole Robert Reitan, Magnus Reitan og Sunniva Reitan i styret. Bekrefter familiekontroll.
- **BAMA Gruppen** har **Runar Hollevik (NorgesGruppen) og Ole Robert Reitan (Reitan)** i styret samtidig. Det er direkte primærbekreftelse av maktkartets «delt kontroll (NG/Reitan)» over BAMA.

**Presisering (mindre avvik):** §4 merker NorgesGruppen som «samvirke/familie (Johannson)». Brønnøysund-formen er ASA med Johannson-familien i kontroll — altså **familie/privat, ikke samvirke**. De ekte samvirkene er Coop (SA), TINE (SA), Nortura (SA) og Felleskjøpet (SA), alle bekreftet. NG-etiketten bør strammes til «familie (Johannson)».

## 4. Seafood/Møgster-klyngen — kontrollsjekk (fra AP-1-dekningsutvidelsen)

Dekningsutvidelsen (task #22) avdekket Møgster- og Witzøe-klyngene i styregrafen. Brønnøysund bekrefter dem på primærkilde:

| Selskap | Orgnr | Form | Styreleder | Daglig leder | Møgster/Witzøe i styret |
|---|---|---|---|---|---|
| Austevoll Seafood ASA | 929975200 | ASA ✓ | Helge Singelstad | **Arne Møgster** | Helge Arvid Møgster, Lill Maren Møgster |
| Lerøy Seafood Group ASA | 975350940 | ASA ✓ | **Arne Møgster** | Henning K. Beltestad | Karoline Møgster |
| Laco AS | 937305354 | AS ✓ | **Helge Arvid Møgster** | Helge Singelstad | June, Lill Maren, Karoline, Arne, Patrick Møgster |
| Kverva AS | 919818824 | AS ✓ | **Gustav Witzøe** | Torgeir Johan Svae | (Nordhammer, Therese Log Bergjord) |
| Kverva Industrier AS | 960329856 | AS ✓ | Torgeir Johan Svae | — | — |
| SalMar ASA | 960514718 | ASA ✓ | **Gustav Witzøe** | Frode Arntsen | (Leif Inge Nordhammer) |

Bekreftet: **Arne Møgster** er daglig leder i Austevoll og styreleder i Lerøy (Austevoll kontrollerer Lerøy) — primærbekreftelse av den vertikale sjømat-kontrollen. **Laco AS** er Møgster-familieholdingen (fem Møgster i styret). **Gustav Witzøe** er styreleder i både SalMar og Kverva. **Leif Inge Nordhammer** sitter i både SalMar og Kverva; **Therese Log Bergjord** i Kverva (og Fiskå Mølle — inputs↔sjømat-broen fra dekningsutvidelsen). Klyngene er reelle, ikke artefakter.

## 5. AP-1 — styreverv-stikkprøve (topp-broer, med dato)

9 av 10 topp-bro-personer fra AP-1 er bekreftet med sittende verv i de hentede selskapene:

| Bro-person | Bekreftet i (rolle) |
|---|---|
| **Runar Hollevik** | NorgesGruppen ASA (daglig leder), BAMA (styremedlem), ASKO (styreleder), NG Data (styreleder), Kiwi (styreleder), MENY (styreleder), NG Servicehandel (styreleder) — **7 selskaper** |
| Ole Robert Reitan | Reitan AS (styremedlem), BAMA (styremedlem), Uno-X Mobility (styreleder), Reitan Kapital (styremedlem) |
| Kristine Stranne | ASKO (styremedlem), NG Servicehandel (daglig leder) |
| Magnus Reitan | Reitan AS (styremedlem), Reitan Kapital (daglig leder) |
| Tore Bekken | ASKO (daglig leder), NG Data (styremedlem) |
| Dina Thune | ASKO (styremedlem) — registrert som «Dina Gjersøyen Rolstad Thune» |
| Øyvind Andersen | Kiwi Norge (styremedlem) |
| Finn Torstein Dybvik | NG Servicehandel (styremedlem) |
| Johan Johannson | NorgesGruppen ASA (styreleder) |
| Trond Bentestuen | **Ikke i utvalget** (verken bekreftet eller avkreftet) |

Styredatoene (`sistEndret`) for de bekreftende selskapene ligger i 2021–2026, de fleste 2024–2026 — vervene er gjeldende, ikke historiske. Runar Hollevik er empirisk bekreftet som det sentrale bro-punktet: konsernsjef i NorgesGruppen + styreleder i seks NG-sfære-selskaper + styremedlem i BAMA. Det er nøyaktig AP-1s topp-interlocker (10 selskaper), nå primærsjekket.

Selskapene i AP-1s «mest sammenkoblede» liste er også verifisert som aktive med gjeldende styrer: ASKO Norge AS (929228723), NorgesGruppen Data AS (971047917), Kiwi Norge AS (975959171), MENY AS (977066727), NorgesGruppen Servicehandel AS (976769511), Uno-X Mobility AS (988247111), Reitan Kapital AS (935873177), Reitan Convenience Norway AS (983415660).

## 6. Hva som er bekreftet vs. hva som gjenstår

**Bekreftet på primærkilde (Brønnøysund, 2026-06-14):**

1. Juridisk-form-typologien i maktkart §4 (samvirke SA / familie AS / børsnotert ASA): 22/22 selskaper.
2. Kontrollpersonene: Johannson (NG), Reitan-familien (Reitan), Møgster (Austevoll/Lerøy/Laco), Witzøe (SalMar/Kverva); delt NG/Reitan-kontroll i BAMA.
3. AP-1s bro-struktur: 9/10 topp-broere med sittende verv og dato; Hollevik som sentralt knutepunkt.
4. Alle 22 selskaper aktive og konsernregistrerte.

**Gjenstår (ikke dekket av denne stikkprøven):**

1. **Eierandel-prosent / transitiv ≥50 %-kontroll** (AP-5: «39 selskaper», «52,7 % av Lerøy»). Roller ≠ aksjefordeling. **Verktøy bygget:** `scripts/verify-ownership-aksjonaerregister.ts` (enhetstestet) sjekker eierandel-% per målselskap mot Skatteetatens Aksjonærregister og sporer eierkjeder (f.eks. Laco→Austevoll→Lerøy). Registeret er **bestillingsbasert**, ikke direkte nedlasting: bestill uttrekk på <https://www.skatteetaten.no/en/deling/aksjonarregisteret/> (e-postlenke gyldig 1 uke; dekker AS/ASA). Samvirkene (Coop, TINE, Nortura, Felleskjøpet — SA) står ikke i registeret; deres medlemseide form er allerede bekreftet av SA-formen over. Sekundær-korroborasjon innhentet 2026-06-14: NorgesGruppen ≈ 74,4 % Johannson-familien, og kjeden Laco→Austevoll→Lerøy (Møgster) bekreftes av offentlige kilder (se §8).
2. **Trond Bentestuen** — utenfor utvalget; hent hans rollehistorikk separat hvis han skal stå i bro-listen.
3. **Full operator-sekvens** (`research/CITABLE-KNOWLEDGE-BASE-STATUS.md`): `npm run db:audit:strict-sources`, `audit:citable`, m.fl. — DB-avhengig, kjøres lokalt.
4. **Markedscensus** (AP-2 ekte node-HHI) og **2024-tilskudd** (AP-3) — separate §8-steg, ikke berørt her.

## 7. Claim-status-oppdatering

| Claim | Før | Etter denne stikkprøven |
|---|---|---|
| CL-AP1-001 (styrebroer) | intern baseline | **klar-med-forbehold** — bro-struktur + 9/10 personer primærsjekket m/dato; ekstern bruk fortsatt etter operator-sekvens |
| CL-AP5-001 (konsernkontroll) | intern baseline | **klar-med-forbehold for kontroll-STRUKTUR** (form + styrekontroll bekreftet); **eierandel-% fortsatt krever-bekreftelse** (Aksjonærregister) |
| CL-MAKTKART-001 (syntese) | intern baseline | **klar-med-forbehold for strukturpåstanden**; kvantitativt eierlag + operator-sekvens gjenstår før full citable |

Stoppspråk uendret: ikke «samordner», «kartell» eller «operativ kontroll»; ikke bruk eierandel-% som primærsjekket før Aksjonærregister; ikke bruk som ekstern faktastemme før operator-sekvensen er grønn.

## 8. Verifikasjon

Alle tall og navn er hentet direkte fra Brønnøysund Enhetsregisteret og roller-API 2026-06-14 og ligger i `research/analyse/ap5-ap1-bronnoysund-stikkprove-2026-06-14.json` med per-selskap kilde-URL (`/enheter/{orgnr}` og `/enheter/{orgnr}/roller`). Formmatch 22/22; bro-bekreftelse 9/10. Ingen påstand er løftet til ekstern faktastemme i dette notatet; eierandel-laget og operator-sekvensen er eksplisitt merket som gjenstående. Kildelenker er offentlige og etterprøvbare per orgnr.

**Eierandel-lag (sekundær-korroborasjon, 2026-06-14):** NorgesGruppen ≈ 74,4 % kontrollert av Johannson-familien, og Johan Johannson overtok styreledervervet i 2022 etter Knut Hartvig Johannson — i tråd med Brønnøysund-funnet (Johan Johannson styreleder; Knut Hartvig Johannson i ASKO-styret). Eierkjeden Laco AS → Austevoll Seafood → Lerøy (Møgster-familien) er bekreftet av offentlige kilder. Eksakte prosenter for de børsnoterte sjømatselskapene verifiseres primært via det bestilte Aksjonærregister-uttrekket (`scripts/verify-ownership-aksjonaerregister.ts`). Sekundærkilder: [NorgesGruppen/Johannson (Tharawat Magazine)](https://www.tharawat-magazine.com/fbl/johannson-family/), [Johan Johannson (Wikipedia)](https://en.wikipedia.org/wiki/Johan_Johannson_(businessman,_born_1967)), [Austevoll Seafood (Wikipedia)](https://en.wikipedia.org/wiki/Austevoll_Seafood), [Lerøy største aksjonærer (IR)](https://www.leroyseafood.com/en/investor/stock/largest-shareholders/).
