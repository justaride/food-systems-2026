---
tittel: Skrivelogg — hvitbok v3, oppdrag A
dato: 2026-09-18
skribent: Fable (Claude), etter docs/superpowers/plans/2026-09-18-hvitbok-v3-skriveplan.md
status: intern arbeidslogg; ikke ekstern tekst
---

# Skrivelogg for hvitbok v3

## 1. Hva som er levert

| Fil | Innhold | Omfang |
|---|---|---|
| `hvitbok-v3-utkast.md` | Hvitboka: sammendrag, kapittel 1–9, vedlegg A og åtte figurforslag | ca. 13 500 ord totalt; hovedtekst kapittel 1–9 ca. 11 700 ord inkludert markører (ca. 11 500 ord prosa); sammendrag 691 ord |
| `pastandsregister.md` | 141 påstander, én rad per påstand, med katalog-ID, status, kilde og lokator, forbehold, fersksjekk og bruk; opptelling per status; løste statuskonflikter | ca. 8 200 ord |
| `SKRIVELOGG.md` | Denne loggen | – |

Ingen eksisterende fil i repoet er endret. Ingenting er committet, og `research/whitepaper/v3/artikler/` er ikke rørt.

## 2. Lesing

Alle 18 punkter i skriveplanens del 2 er lest i oppgitt rekkefølge: vedtaksnotatet, innsiktskatalogen (hele), arbeidsavklaringen 15.09, møtet 19.06 (§2.4), objektivfunksjonsvedtaket, synthesis-v2 (hele, med statuskoder), WHITEPAPER-REVISJON og README i runde 002, arbeidsutkastet med de fem kandidatkortene, README og WHITEPAPER-TILLEGG i runde 003 og 004, WHITEPAPER-TILLEGG i runde 005, R9, maktkartkapittelet, systemmodellen, konkurssyntesen, EUDR-mottaksnotatet, R6-indeksen og N11-filen, DATAGAP-ANALYSE, roadmap v0.2 og CITABLE-ACCEPTANCE-TESTS. Ingen lenker er fulgt videre, og ingen nettsøk er gjort. Alle tall er hentet fra disse filene.

## 3. Redaksjonelle valg

1. **Tittel:** «Et robust og sirkulært matsystem – hva vi vet, hva vi ikke vet, og hvor vi bør begynne». Valgt fordi den bærer hvitbokas egen logikk: fakta, hypoteser og hull holdes synlig fra hverandre.
2. **Disposisjonen følger skriveplanen** punkt for punkt. Kapittel 2 har fire faste deler per ledd (hva vi vet, styrke, svakhet, hva vi ikke vet). Sammendraget er skrevet sist og gjenbruker markører fra hovedteksten.
3. **Fem satsingsområder, tre foreslått som kjerne (A, B, E).** Skriveplanen ba om 3–5. Fem er beskrevet så Gabriel og Jan Thomas kan velge, og teksten sier eksplisitt at valget er deres. D (markedsadgang) er merket som sensitivt og som dårlig egnet for NordForsk.
4. **Ingen personnavn.** Maktkartets eiernavn (holdingselskaper og familier bak SalMar, Mowi, Orkla og NorgesGruppen) er utelatt selv om de står i kildefilen. Bare selskapsnavn og de tre børsnoterte selskapene nevnes.
5. **Furuset-caset uten virksomhetsnavn.** Katalogen merker BE-11 som sensitivt (navngitt virksomhet, ingen kontakt tatt). Hvitboka beskriver kjeden som «én norsk mølle, én mølle i Malmö og ett bakeri i Oslo». Navnene står i kildefilen og kan settes inn hvis kontakt er tatt.
6. **Tall er bare brukt der status tillater det.** Der katalogen sier «Intern syntese», «Uklar» eller «Blokkert», er funnet skrevet om til hypotese, spørsmål eller hull uten tall, også når et tall fantes i kildefilen (Brasil-andel av soya, ASKO Servering, eiendomsselskapenes eiendeler, Coop i små kommuner, matørken).
7. **Fire nye fakta (NY)** er hentet fra beredskapsrundene 003–005 og runde 002 med sti og lokator: Hias-struvitt 2024, struvittforsøkene, Hylte- og Trelleborg-øvelsene, og den historiske Norge–Finland-avtalen. I tillegg P-141 om økonomisk tilgang til mat fra runde 002. Alle står som «Kontrollert internt (KI-vurdering)» og er merket for stikkprøve.
8. **Eksemplene på spillvarme (SI-13) og Wiig-piloten (SI-14)** står uten aktørnavn i hvitboka; navnene står i registeret. Det gjør teksten mindre utsatt hvis tallene bak eksemplene ikke holder.

## 4. Brukt og utelatt fra v2 (synthesis-v2)

| Del av v2 | Bruk i v3 | Grunn |
|---|---|---|
| §1.1 hovedfunn, §2 systemgrense, §3 metode | Brukt (kap. 1, vedlegg A) | [K]/[F] |
| §1.2 fem porteføljeforslag, §10 fem overgangslevere | Slått sammen med kandidatkortene til kap. 8 | [I/H]; brukt som forslag |
| §4.1–4.2 dagligvare og foredling | Brukt (kap. 2.3, 2.5, 3) | [K]/[F] |
| §4.3 eierkart [I; S15] | Bare via MA-07 og MA-09 (siterbare) | [I] i v2; katalogen har siterbare rader for det som er brukt |
| §4.4 markedsadgang [I; S13] | Brukt som hypotese og som pilotgate-liste (kap. 5.4) | [I] |
| §5 pris og margin | Bare metoden (KPI/PPI er ikke margin); «reverse gap» og «juli-effekt» er ikke brukt | [I; S04], MA-14 |
| §6.1 nordisk HHI-tabell | Bare kvalitativt, ingen landtall, ingen rangering | [F] i v2, men MA-15 er intern syntese i katalogen |
| §6.2 Finland § 4a, §6.3 København, §6.4 matsvinnmetode og Salling | Brukt (kap. 2.6, 3.3, 6) | [K]/[F] |
| §6.5 nordisk arbeidsdeling | Brukt som agenda for validering (kap. 6.4) | [H-02/H-05] |
| §7.1 selvforsyning 45/35 % | Brukt med metodeetikett (kap. 2.1) | [F; S05] |
| §7.2 importnoder og fosfor | Bare som kunnskapshull | [I; S21] |
| §7.3 hub-scenario 24 t/72 t/2 uker | Brukt som forslag, ikke funn (kap. 2.4, 8A) | [I; S06] |
| §8.1–8.2 kaskade og mattrygghet | Brukt (kap. 5.1) | [F; S07] |
| §8.3 matsvinnbaseline (407 100 t osv.) | **Utelatt med tall**; bare metodepoenget om kompositt | [I/F] → svakeste ledd [I]; ikke åpnet i R14 |
| §8.4 restråstoff-tabell | Bare 89 % og 15 %/70 000 av 476 000 t via SI-01; fôr- og energiandelene er utelatt | Tabellen er [I; S10]; SI-01 er kontrollert internt |
| §8.5 N/P/K-kjede | Brukt som kunnskapshull og metode | [I] |
| §8.6 emballasje og PPWR | **Utelatt** | [H-04] juridisk; ikke i disposisjonen |
| §9.1 økologi areal/produksjon/import | **Utelatt** | [I; S21]; ikke i disposisjonen |
| §9.2 jordkarbon og pollinatorer | Brukt som daterte hull (kap. 7) | [I]; T4-formuleringene brukt |
| §9.3 alternative proteiner, modenhetsstige | Brukt som hypotese og metode (kap. 5.5) | [I/H] |
| §11 «Hva Norge ikke måler» | Brukt som ramme for kap. 7, med formuleringsregelen | [I/H] |
| §12.2 horisont 0 (kontrakt P25013, juli 2026) | **Utelatt** | Datert og passert; roadmap v0.2 brukt i stedet |
| §12.5 observatorium, §13 begrensninger og forbudt språk, §15 porter | Brukt (kap. 9, vedlegg A) | [K]/[H] |

## 5. Brukt og utelatt fra september-utkastet og rundene

| Kilde | Bruk | Grunn |
|---|---|---|
| Arbeidsutkastets ledersyntese og leserreise | Innarbeidet i kap. 4.1 og 5 | Retning, ikke funn |
| Fem kandidatkort | Slått sammen med v2 §10 til kap. 8; alle beskrevet med feltene fra planen | BE-15: mangler effekt og partnerforankring; sagt eksplisitt |
| Revisjonen §2 korn (A1) | Brukt (kap. 4.2) | Kontrollert internt (KI) |
| Revisjonen §2 mask (A2) og fôrforsøk | Brukt (kap. 5.2) | BE-08 og KI-vurderinger |
| Revisjonen §2 tilgang (A3): SIFO, FIES, FAOSTAT, StatFin 15 celler | Bare prinsippet om at tilgang må måles separat (P-141); ingen tall | Tall og indikatorer har ingen katalograd og er ikke nødvendige for poenget |
| Revisjonen §2 Island og KORNAX (A4) | Brukt uten selskapsnavn (kap. 4.4) | Kontrollert internt (KI); navnet er ikke nødvendig |
| Revisjonen §2 nordisk (A5) | Brukt som hypotese (kap. 4.4) | Kandidattekst |
| Runde 003: fosfor, måltider, klima 2018 (persentiler «nær 40 %» og «68 %») | Fosfor og måltider brukt (NY); klimapersentilene **utelatt** | Persentiltallene gjelder areal og målestasjoner, ikke matleveranser, og trengs ikke når 2018-panelet fra runde 004 er brukt |
| Runde 003: StatFin, SIFO byteidentitet, Finlex-rettelse | Bare Finlex-avtalen brukt (NY, P-097) | Dokumentkontroll av historisk tekst |
| Runde 004: 2018-panelet | Brukt med alle forbehold (kap. 4.2, 6.2) | BE-13 |
| Runde 005: Furuset-caset (Bjølsen, Malmö, mottaker) | Brukt som metode uten virksomhetsnavn (kap. 4.2, 8A) | BE-11 blokkert og sensitivt |
| Runde 002 README: 127 observasjoner, 117/4/6 | Brukt i kap. 4.1 og vedlegg A | BE-09 |

## 6. Utelatt fra innsiktskatalogen, med grunn

- **MA-08** (styrebroer): blokkert, personnavn. Bare som holdt-tilbake-funn.
- **MA-14** (prisdynamikk), **MA-17** (verdifangst per tonn): intern syntese uten katalogbruk i H; ikke nødvendige.
- **MA-16** (Dagligvaretilsynet): uklar; bare som spørsmål.
- **SI-10** (relasjonsdokumenter Brasil-MOU m.m.), **SI-15** (Sankey): blokkert/plattform; ikke relevante for hvitboka.
- **SI-18** og **SI-19**: tallene utelatt; SI-18 som hypotese uten tall.
- **BE-06**: Brasil-andelen utelatt; hypotese uten tall.
- **BE-20**: matørken bare som spørsmål.
- **HV-01, HV-03, HV-04, HV-09, HV-10, HV-11, HV-12**: prosess- og plattformstatus; hører ikke hjemme i hvitbokteksten. HV-03 (93 strøkne tall) er indirekte respektert ved at ingenting fra innsiktssporets runde 1 er brukt.
- **HV-13**: bare som spørsmål.
- **Del 4 (strøket):** ingenting brukt. Registeret nevner fem av formuleringene i kolonnen «Forbehold», bare som «ikke brukt».

## 7. Tidskritiske fakta (merket i registeret)

14 rader er merket «Tidskritisk: per 15.09.2026, fersksjekkes før bruk»: EUDR-status i EU og Norge (P-119, P-120, P-121), gebyrsaken (P-035), god handelsskikk og Dagligvaretilsynet (P-036, P-040), kornlageret (P-077, P-078, P-080), den nordiske erklæringen (P-093, P-096), norsk høring om sju dagers matlager (P-047, P-092) og NordForsk-fristen (P-134).

## 8. Tall som mangler eller bør åpnes

- Kornlagerets beholdning per september 2026 (BE-03 sier at register mangler).
- Fôr- og energiandelene for marint restråstoff (66 %/19 % i v2 §8.4) står som [I]; hvis de åpnes i kildekontrollen, kan figur 5 vise hele kaskaden.
- Matsvinnets delserier (v2 §8.3) står som [I/F]; hvis de åpnes, kan kap. 2.8 få tall.
- Brasil-andelen av soyaimport (BE-06) må trekkes på nytt med autorisasjon.
- Antall sentrallagre og andel egen/innleid transport (KO-14): finnes ikke i åpne kilder.
- Harmoniserte nordiske HHI-tall (MA-15): finnes ikke.
- Norsk statistikk for offentlig matinnkjøp (HV-05): finnes ikke.
- Realisert volum for alternative proteinspor (HV-06): finnes ikke åpent.
- Tall bak spillvarme-eksemplene (SI-13) og Wiig-pilotens status (SI-14): ikke verifisert/innsyn.
- Margin per kilo etter kjøperprisavtale (R6 type B): aktørdata.
- Kornkjede-caset: alle mengdefelt (BE-11).

## 9. Statuskonflikter og tolkninger skribenten har tatt

Se også registerets siste del.

- **v2 [K]/[F] mot katalogens «Intern syntese»** (MA-02, MA-15): vedtaksnotatet tillater [K]/[F] i v2 som fakta. MA-02 er brukt som fakta med nevnerforbehold, slik skriveplanen selv skriver («MA-02 med nevnerforbehold»). MA-15 er brukt uten tall. Begge bør avklares i fase 2.
- **Sammensatt status [I/F] og [F/I] i v2**: svakeste ledd er lagt til grunn for [I/F] (matsvinn, ikke tall); for [F/I] i §4.2 er bare F-delen brukt.
- **KI-vurderte funn fra rundene 002–005**: behandlet som «Kontrollert internt (KI-vurdering)» analogt med BE-09, og merket for stikkprøve. Katalogen gir ikke egne rader for de fleste av dem.
- **SI-09 Comext-tallet (121 038 t)**: katalogen kaller det «internt tallgrunnlag», mottaksnotatet sier «ingen publikasjonsformulering er åpnet». Det står i hvitboka med fullt forbehold fordi raden er kontrollert internt og CSV-en er etterregnet mot API. Kan tas ut hvis Gabriel vil holde det til artikkel V6.
- **Menon/Kvale-funnet** (v2 §4.2 [F/I]) er brukt som fakta om hva rapporten fant, ikke som konklusjon om åpen tilgang. SI-S2 (grossister nekter tilgang) er ikke brukt, og teksten sier eksplisitt at prosjektet ikke har dokumentasjon for påstanden.
- **Gini for tilskudd**: katalogen 0,52–0,55, maktkartkapittelet 0,52–0,54. Katalogen er fulgt.

## 10. Spørsmål til Gabriel og Jan Thomas

1. **Satsingsområder:** Skal hvitboka ende på tre (A, B, E) eller fem? Skal D (markedsadgang) stå i presentasjonsversjonen, gitt at den krever juridisk kontroll (H-04)?
2. **NordForsk:** Tema 1 eller 2, og hvilken forskningspartner? Kapittel 9.2 forutsetter tema 2 som hovedlogikk, slik gap-studien og arbeidsavklaringen peker.
3. **Furuset-caset:** Skal mølle og bakeri navngis i presentasjonsversjonen? Det krever at kontakt er tatt (BE-11).
4. **Maktkapittelet (kap. 3):** Skal det med i full lengde for partnere og NCH, eller kortes ned til presentasjonsversjonen til H-04 er passert?
5. **Åpning av tall:** Skal matsvinnets delserier og restråstoffets fôr-/energiandeler åpnes i kildekontrollen (claim-lock), slik at kap. 2.8 og figur 5 kan få tall?
6. **Comext-tallet for kakao:** Skal det stå i hvitboka (kap. 6.2) eller bare i artikkel V6?
7. **KI-tallene i vedlegg A** (127/117/4/6 og 707/532/169): Skal de stå, eller er det for mye metode for leseren?
8. **Engelsk:** Trenger NCH et engelsk sammendrag nå, eller etter fase 3?
9. **Hovedpublikum og kanal** for hvitboka og artiklene, og om oktober-eventet blir lansering (åpent siden 15.09).

## 11. Egenkontroll (skriveplanen del 5)

- [x] Alle `[P-nnn]` i teksten finnes i registeret (141 unike, 294 forekomster), og alle 141 rader er brukt i teksten.
- [x] Ingen rad med status Intern syntese, Uklar eller Blokkert bærer et tall eller en faktasetning. Slike rader er formulert som hypotese, spørsmål eller kunnskapshull.
- [x] Søk etter de strøkne formuleringene fra skriveplanen gir null treff i hvitboka. I registeret forekommer fem av dem, bare i kolonnen «Forbehold» som «ikke brukt».
- [x] Ingen personnavn fra maktkartet. Kontrollert mot kjente navn i kildefilene.
- [x] HHI står aldri med prosenttegn. Butikkandel kalles andel av butikkantall, ikke omsetningsandel.
- [x] Tidskritiske fakta er merket i registeret (14 rader).
- [x] Skriveloggen lister det som er utelatt fra v2 og september-utkastet (del 4–6).
- [x] Ingen avsluttende mellomrom eller tabulatorer i de tre filene (kontrollert med grep; `git diff --check` dekker ikke usporede filer).
