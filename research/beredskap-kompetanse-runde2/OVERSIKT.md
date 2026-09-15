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
| `rapporter/X-nordisk-oversikt.md` | Ekstra generell nordisk oversikt (se under) |
| `pastander-samlet.csv` | De 107 påstandene fra CSV-blokkene i R1–R4 (R1 42, R2 22, R3 18, R4 25), med kolonnene `prompt` og `kildefil` lagt til |
| `kontroll/R1–R4-kontroll.md`, `kontroll/X-kontroll.md` | Første kontroll per rapport |
| `kontroll/ANDRE-RUNDE-R3-R4.md`, `kontroll/ANDRE-RUNDE-X.md` | Nytt forsøk på påstander som ikke ble verifisert, og sjekk av kilder som bare var lest via sammendrag |

Rapportene er lagret uendret, bortsett fra at mellomrom på slutten av linjer og tomme sluttlinjer er fjernet. Kildemarkørene («citeturn…») er ubrukelige rester fra ChatGPT og er latt stå.

**Den ekstra oversikten (X)** er en generell rapport om kompetanse og beredskap i nordiske matsystemer. Den svarer ikke på R5–R8. Den har ingen påstandstabell, ingen påstands-ID-er og ingen URL-er, og mye av teksten er anbefalinger og analytiske vurderinger. Kontrollen trakk derfor selv ut 35 faktapåstander (X-001–035) og fant kildene. Disse påstandene står bare i `kontroll/X-kontroll.md`, ikke i `pastander-samlet.csv`. Anbefalingene og rangeringen av landene er ikke kontrollert og er ikke brukt i kunnskapsgrunnlaget.

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
| X | 24 | 10 | 0 | 1 | 0 |
| **Første runde** | **112** | **55** | **1** | **2** | **0** |
| **Etter andre runde** | **113** | **56** | **1** | **0** | **0** |

I andre runde ble begge avklart: R4-EU-004 (ATP) ble behold via ATP-forskriften og Mattilsynet, fordi UNECE-siden hadde robotsjekk. X-026 (finsk kontrollplan) ble rett. I tillegg ble R3-DK-003 rettet på nytt (2 585 butikker, ikke «over 3 000»), og R3-NO-003 ble bekreftet i primærkildene.

Rettelsesandelen (ca. en tredjedel) er høyere enn i runde 1. De vanligste feilene var sitater som ikke var ordrette, feil lokator eller dato, døde eller generiske lenker, planer omtalt som ferdige (norsk drivstoffprioritering, TIETO26, DSB-evalueringen) og generelle metodebeskrivelser lest som funn (Nordic Food Alert). Den ene forkastede påstanden gjaldt «teknisk service» i den svenske covid-listen.

## Prompter som mangler

| Prompt | Tema | Status |
|---|---|---|
| R1–R4 | Måltider, øvelser, kritiske roller, transport | Kjørt og kontrollert |
| R5 | Veterinær- og mattilsynsberedskap | **Ikke kjørt.** X gir bare ett tall (ca. 80 finske beredskapsveterinærer). |
| R6 | Fra forskning til praksis | **Ikke kjørt** |
| R7 | Taus kunnskap og generasjonsskifte | **Ikke kjørt** |
| R8 | Sårbare husholdninger og kommunenes ansvar | **Ikke kjørt** |
| R9 | Sammenstilling | **Ikke kjørt.** Kunnskapsgrunnlaget her er laget uten R9, bare fra kontrollerte funn. |

Oppdaterte prompter for R5–R8, klare til kjøring: [RUNDE2-R5-R8-PROMPTER.md](../../docs/project/analysis/beredskap-kompetanse-2026-09-14/RUNDE2-R5-R8-PROMPTER.md).

## Grenser

- Kontrollen er KI-basert. Den er ikke faglig godkjenning.
- Høyst ca. 35 påstander per rapport er kontrollert. R1 har sju fraværsfunn uten kilde som ikke er kontrollert.
- Noen kilder er lest via sammendrag eller sekundærkilder, og det står i kontrollfilene (blant annet MSBs ASF-evaluering og TIETO20-sluttrapporten, der bare omtalen er lest).
- Ingen PDF-er eller nedlastede kilder er lagt i repoet.
- Ingen databaseimport, publisering eller kontakt er gjort. Ekstern bruk krever claim-lock og kildepolicy.
