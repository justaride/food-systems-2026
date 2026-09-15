# Beredskap og kompetanse – researchmateriale runde 2

Svar på promptene i [RUNDE2-RESEARCHPROMPTER.md](../../docs/project/analysis/beredskap-kompetanse-2026-09-14/RUNDE2-RESEARCHPROMPTER.md), kontrollert mot kildene 15. september 2026. Følger samme metode som [runde 1](../beredskap-kompetanse-2026-09-15/OVERSIKT.md).

**Start her:** [KUNNSKAPSGRUNNLAG-RUNDE2.md](KUNNSKAPSGRUNNLAG-RUNDE2.md).

## Innhold

| Fil | Hva |
|---|---|
| `rapporter/R1-maltider.md` | R1 Offentlige måltider som beredskapsfunksjon |
| `rapporter/R2-ovelser.md` | R2 Øvelser og læring etter hendelser |
| `rapporter/R3-kritiske-roller.md` | R3 Kritiske roller og personell i matkjeden |
| `rapporter/R4-transport.md` | R4 Transport, grossistledd og kjølekjede |
| `rapporter/R5-veterinar.md` | R5 Veterinær- og mattilsynsberedskap |
| `rapporter/R6-forskning-praksis.md` | R6 Fra forskning til praksis |
| `rapporter/R7-taus-kunnskap.md` | R7 Taus kunnskap og generasjonsskifte (uten påstandstabell og URL-er, se under) |
| `rapporter/R8-husholdninger.md` | R8 Sårbare husholdninger og kommunenes ansvar |
| `rapporter/X-nordisk-oversikt.md` | Ekstra generell nordisk oversikt (se under) |
| `pastander-samlet.csv` | De 189 påstandene fra CSV-blokkene i R1–R6 og R8 (R1 42, R2 22, R3 18, R4 25, R5 29, R6 20, R8 33), med kolonnene `prompt` og `kildefil` lagt til. `status` finnes bare for R5 og R8, og `niva` (bruksnivå 1–5) bare for R6. Feltene er tomme ellers. |
| `kontroll/R1–R8-kontroll.md`, `kontroll/X-kontroll.md` | Første kontroll per rapport |
| `kontroll/ANDRE-RUNDE-R3-R4.md`, `kontroll/ANDRE-RUNDE-X.md`, `kontroll/ANDRE-RUNDE-R7.md` | Nytt forsøk på påstander som ikke ble verifisert, og sjekk av kilder som bare var lest via sammendrag |

Rapportene er lagret uendret, bortsett fra at mellomrom på slutten av linjer og tomme sluttlinjer er fjernet. Kildemarkørene («citeturn…») er ubrukelige rester fra ChatGPT og er latt stå.

**Den ekstra oversikten (X)** er en generell rapport om kompetanse og beredskap i nordiske matsystemer. Den svarer ikke på R5–R8. Den har ingen påstandstabell, ingen påstands-ID-er og ingen URL-er, og mye av teksten er anbefalinger og analytiske vurderinger. Kontrollen trakk derfor selv ut 35 faktapåstander (X-001–035) og fant kildene. Disse påstandene står bare i `kontroll/X-kontroll.md`, ikke i `pastander-samlet.csv`. Anbefalingene og rangeringen av landene er ikke kontrollert og er ikke brukt i kunnskapsgrunnlaget.

**R7** fulgte heller ikke leveranseformatet, selv om den oppdaterte prompten krevde full tabell med URL-er. Kontrollen trakk ut 33 påstander (R7-001–033) og fant kildene selv. De står bare i `kontroll/R7-kontroll.md`. Den analytiske syntesen i R7 er ikke kontrollert.

## Metode

Én kontroll per rapport, med nettoppslag. For hver påstand ble det sjekket om den stemmer, om sitatet er ordrett, om publiseringsår og dataår er holdt fra hverandre, om lenken går til selve dokumentet, om utgiver er riktig, om planer eller oppdrag er omtalt som gjennomført, og om ambisjoner er omtalt som forpliktelser. Der CSV-tabellen ikke dekket bærende påstander eller tall i teksten, fikk de egne ID-er (`R2-TEKST-001` osv.). Fraværsfunn («ikke funnet i avgrenset søk») er ikke kontrollert, fordi et fravær ikke kan bekreftes med én kilde.

Dommer: behold, rett, forkast, ikke_verifisert og intern_kilde (viser bare til prosjektets egne filer).

## Kontroll

| Rapport | Behold | Rett | Forkast | Ikke verifisert | Intern kilde |
|---|---:|---:|---:|---:|---:|
| R1 | 26 | 9 | 0 | 0 | 0 |
| R2 | 21 | 12 | 0 | 0 | 0 |
| R3 | 23 | 8 | 1 | 0 | 0 |
| R4 | 18 | 16 | 0 | 1 | 0 |
| R5 | 25 | 11 | 0 | 0 | 0 |
| R6 | 24 | 12 | 0 | 0 | 0 |
| R7 | 20 | 10 | 0 | 3 | 0 |
| R8 | 22 | 16 | 0 | 0 | 0 |
| X | 24 | 10 | 0 | 1 | 0 |
| **Første runde** | **203** | **104** | **1** | **5** | **0** |
| **Etter andre runde** | **206** | **106** | **1** | **0** | **0** |

I andre runde ble alle avklart: R4-EU-004 (ATP) ble behold via ATP-forskriften og Mattilsynet, fordi UNECE-siden hadde robotsjekk. X-026 (finsk kontrollplan) ble rett. I tillegg ble R3-DK-003 rettet på nytt (2 585 butikker, ikke «over 3 000»), og R3-NO-003 ble bekreftet i primærkildene. For R7 ble NIBIO-rapporten (R7-019) og NESAs «ca. 1 500» virksomheter (R7-028) bekreftet, mens R7-020 ble rettet (søkningen er lav, ikke fallende).

Rettelsesandelen (ca. en tredjedel) er høyere enn i runde 1. De vanligste feilene var sitater som ikke var ordrette, feil lokator eller dato, døde eller generiske lenker, planer omtalt som ferdige (norsk drivstoffprioritering, TIETO26, DSB-evalueringen) og generelle metodebeskrivelser lest som funn (Nordic Food Alert). I R5–R7 kom i tillegg feil bruksnivå, bransjeundersøkelser med gamle data og samme TIETO26-feil som i R2. Den ene forkastede påstanden gjaldt «teknisk service» i den svenske covid-listen.

## Prompter som mangler

| Prompt | Tema | Status |
|---|---|---|
| R1–R4 | Måltider, øvelser, kritiske roller, transport | Kjørt og kontrollert |
| R5–R7 | Veterinærberedskap, forskning til praksis, taus kunnskap | Kjørt med oppdaterte prompter og kontrollert |
| R8 | Sårbare husholdninger og kommunenes ansvar | Kjørt og kontrollert |
| R9 | Sammenstilling | **Ikke gjort.** Gjøres i repoet i en egen økt, på de kontrollerte filene, ikke i ChatGPT. |

Promptene for R5–R8 og oppgavebeskrivelsen for R9: [RUNDE2-R5-R8-PROMPTER.md](../../docs/project/analysis/beredskap-kompetanse-2026-09-14/RUNDE2-R5-R8-PROMPTER.md).

## Grenser

- Kontrollen er KI-basert. Den er ikke faglig godkjenning.
- Høyst ca. 35 påstander per rapport er kontrollert. R1 har sju fraværsfunn uten kilde som ikke er kontrollert. Fraværsfunn i R5–R8 er heller ikke kontrollert.
- Noen kilder er lest via sammendrag eller sekundærkilder, og det står i kontrollfilene (blant annet MSBs ASF-evaluering og TIETO20-sluttrapporten, der bare omtalen er lest).
- Ingen PDF-er eller nedlastede kilder er lagt i repoet.
- Ingen databaseimport, publisering eller kontakt er gjort. Ekstern bruk krever claim-lock og kildepolicy.
