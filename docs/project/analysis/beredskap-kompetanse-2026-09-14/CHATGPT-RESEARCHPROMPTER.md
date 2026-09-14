# Researchprompter for ChatGPT Pro – beredskap og kompetanse

Seks frittstående prompter (P1–P6) og én sammenstillingsprompt (P7). Laget 15. september 2026.

Promptene handler om **forståelse av emnet**: fakta, begreper, historikk og erfaringer. De handler ikke om prosjektet, søknader, partnere eller tiltak. Det skiller dem fra Grok-planen, som tar søknadsfit, ansvar og aktører. Der sporene overlapper, gir det to uavhengige kilder til samme spørsmål.

## Slik kjører du dem

1. Start én ny samtale per prompt, med dyp research (Deep Research) slått på. P1–P6 er uavhengige og kan kjøres samtidig.
2. Kopier hele blokken for én prompt. Hver blokk har egen kontekst, kilderegler og leveranseformat.
3. Lagre hvert svar som markdown: `P1-begreper.md`, `P2-historikk.md` og så videre.
4. Når P1–P6 er ferdige: start en ny samtale, last opp de seks svarene og kjør P7.
5. Legg alle filene i `research/beredskap-kompetanse-2026-09-15/chatgpt/` for kontroll mot primærkilder.

Påstands-ID-ene starter med `P1-`, `P2-` osv., så de ikke kolliderer med Grok-leveransen (`G…`).

---

## P1 – Begreper og teori

```text
Du skal gjøre et grundig litteratur- og kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om hvordan kompetanse henger sammen med beredskap i matsystemer, med vekt på Norge, Sverige, Danmark, Finland og Island. Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.

"Kompetanse" brukes i fire betydninger. Merk hvert funn med én eller flere koder:
K1 Praktisk kompetanse i matkjeden (bønder, fagarbeidere, sjåfører, veterinærer, kokker)
K2 Institusjonell kompetanse (myndigheters og organisasjoners evne til å planlegge, koordinere, øve og lære)
K3 Kunnskap i samfunnet (forskning, utdanning, erfaringskunnskap, taus kunnskap)
K4 Husholdningenes kompetanse (matlaging, lagring, konservering, egenberedskap)

SPØRSMÅL
Hvordan beskriver forskningen forholdet mellom kompetanse og resiliens i matsystemer?
1. Resiliensbegreper: absorptiv, adaptiv og transformativ kapasitet. Hvor kommer menneskelig kompetanse inn? Start i litteraturen om matsystemresiliens (for eksempel Tendall m.fl. 2015) og i sosio-økologisk resiliensteori.
2. Humankapital og sosial kapital i kriser: hva sier forskningen om ferdigheter, nettverk og tillit når systemer er under stress?
3. Taus kunnskap og erfaringskunnskap i matproduksjon (bondekunnskap, lokal kunnskap, håndverk), og hvordan den går tapt ved spesialisering og sentralisering.
4. Effektivitet mot redundans: just-in-time, spesialisering og konsentrasjon som gir lavere kostnad, men mindre slakk, også i personell og ferdigheter.
5. Nordiske begreper: totalforsvar, helhetlig sikkerhet (kokonaisturvallisuus), samfunnssikkerhet og forsyningssikkerhet. Hva betyr de, og hvordan skiller de seg?
6. Hvor er det faglig uenighet eller uklare begreper?

KILDEREGLER
- Primærkilder først: fagfellevurdert forskning, offisielle dokumenter, anerkjente kunnskapsoversikter. Merk sekundærkilder.
- Hver påstand: URL, utgiver/forfatter, år, lokator (side/avsnitt), kort ordrett sitat (maks 25 ord).
- Ikke finn på referanser. Finner du ikke noe: skriv "ikke funnet i avgrenset søk".
- Behold faglig uenighet synlig. Skill definisjon, empirisk funn og tolkning.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt, hvert med kilde-ID og sikkerhet: godt dokumentert / delvis / svakt / omstridt)
B. Begrepsnotat: 12–15 begreper med definisjon, opphav, bruk og kilde
C. Hvordan kompetanse inngår i de viktigste resiliensrammeverkene (tabell)
D. Faglig uenighet og uklarheter
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: P1-001 osv.; type: definisjon|forskningsfunn|fakta|tolkning; kildetype: primær|sekundær; sikkerhet: godt_dokumentert|delvis|svakt|omstridt)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## P2 – Historikk: nordisk matberedskap og kompetanse fra 1945 til i dag

```text
Du skal gjøre et grundig historisk kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om hvordan kompetanse henger sammen med beredskap i matsystemer i Norge, Sverige, Danmark, Finland og Island. Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.

Kompetansekoder for hvert funn:
K1 Praktisk kompetanse i matkjeden
K2 Institusjonell kompetanse (planlegging, koordinering, øvelser, institusjonell hukommelse)
K3 Kunnskap i samfunnet (forskning, utdanning, erfaringskunnskap)
K4 Husholdningenes kompetanse

SPØRSMÅL
Hvordan har matberedskap, og kompetansen bak den, endret seg i hvert av de fem landene?
1. Den kalde krigens matberedskap: lager, planverk, rasjonering, organisering og opplæring.
2. Nedbyggingen etter 1990: hva ble avviklet, når og med hvilken begrunnelse? (For eksempel norske statlige kornlagre og svenske beredskapslagre. Verifiser år og omfang.)
3. Finland som kontrast: hvorfor ble forsyningsberedskapen videreført, og hvordan?
4. Gjenoppbyggingen etter 2014, 2020 og 2022.
5. Hva skjedde med kompetansen underveis? Forsvant det folk, fagmiljøer, utdanninger, øvelser eller institusjonell hukommelse? Finn kilder som beskriver dette direkte, og skill dem fra din egen tolkning.

KILDEREGLER
- Primærkilder først: offentlige utredninger, stortings-/riksdagsdokumenter, lover, offisielle rapporter, historisk forskning. Merk sekundærkilder.
- Hver påstand: URL, utgiver, år, lokator (side/avsnitt), kort ordrett sitat (maks 25 ord).
- Årstall og omfang må stå i kilden. Ikke finn på. Finner du ikke noe: skriv "ikke funnet i avgrenset søk".
- Skill vedtak, gjennomføring og effekt. Behold motstridende kilder synlige.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Tidslinje per land: år | hendelse eller vedtak | betydning for lager, organisering eller kompetanse | kilde-ID
C. Sammenligning av landenes veivalg (kort tabell og tekst)
D. Hva som skjedde med kompetansen – det kildene faktisk sier
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: P2-NO-001 osv.; type: historisk_hendelse|vedtak|fakta|tall|tolkning)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## P3 – Erfaringer fra kriser og forstyrrelser

```text
Du skal gjøre et grundig kildestudie av faktiske hendelser. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om hvordan kompetanse henger sammen med beredskap i matsystemer, med vekt på Norge, Sverige, Danmark, Finland og Island. Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak.

Kompetansekoder for hvert funn:
K1 Praktisk kompetanse i matkjeden
K2 Institusjonell kompetanse
K3 Kunnskap i samfunnet
K4 Husholdningenes kompetanse

SPØRSMÅL
Hva har faktiske hendelser vist om kompetansens rolle i matforsyningen? Mulige eksempler, som må verifiseres:
- Covid-19 (2020–2021): mangel på sesongarbeidere i jordbruk og sjømatforedling, omstilling i storkjøkken, endret matlaging i husholdninger
- Krigen i Ukraina (2022): sjokk i pris og tilgang for gjødsel, fôr og energi, og hvordan aktører tilpasset seg
- Digitale angrep og IT-bortfall, for eksempel løsepengevirusangrepet som stengte Coop-butikker i Sverige i 2021: hva viste det om manuelle rutiner?
- Strømbrudd, uvær og flom i Norden og konsekvenser for matkjeden
- Island: finanskrisen i 2008 og importavhengighet
- Streik og transportstans som har rammet matforsyningen
- Relevante evalueringer utenfor Norden (for eksempel sjåførmangelen i Storbritannia 2021 og jordskjelvene i New Zealand) når de sier noe om kompetanse

For hver hendelse: hva skjedde, hvilken funksjon i matkjeden ble rammet, var mangel på folk eller ferdigheter en del av problemet eller løsningen, hvordan ble det håndtert, og finnes det en offentlig evaluering?

KILDEREGLER
- Offentlige evalueringer, granskinger og forskning først. Medieomtale er sekundærkilde og skal merkes.
- Hver påstand: URL, utgiver, dato, lokator, kort ordrett sitat (maks 25 ord).
- Skill evaluering fra medieomtale, og årsak fra samtidighet. Ikke finn på. Finner du ikke noe: "ikke funnet i avgrenset søk".
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Hendelsestabell: hendelse | land | år | funksjon rammet | kompetansens rolle (problem/løsning/ukjent) | håndtering | evaluering finnes (ja/nei) | kilde-ID
C. Kort beskrivelse av de 5–8 best dokumenterte hendelsene
D. Mønstre på tvers av hendelsene, med tydelig skille mellom det kildene sier og din tolkning
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: P3-001 osv.; type: historisk_hendelse|evaluering|fakta|tall|tolkning)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## P4 – Kompetanse og arbeidskraft i matkjeden i dag: fakta og tall

```text
Du skal samle og forklare offisiell statistikk og forskning. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om hvordan kompetanse henger sammen med beredskap i matsystemer i Norge, Sverige, Danmark, Finland og Island. Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak. Hovedkode for denne oppgaven er K1 (praktisk kompetanse i matkjeden); bruk K3 der utdanning inngår.

SPØRSMÅL
Beskriv dagens situasjon og utviklingen de siste 10–20 årene:
1. Primærproduksjon: antall bønder og utvikling over tid, aldersstruktur, rekruttering, landbruksutdanning, andel utenlandsk arbeidskraft (sesong og fast).
2. Fiskeri og havbruk: arbeidskraft i foredling, andel utenlandske arbeidere.
3. Foredling og næringsmiddelindustri: sysselsetting, fagarbeidere, mangelyrker.
4. Transport og logistikk: sjåførmangel og aldersstruktur.
5. Veterinær og mattrygghet: veterinærdekning, særlig i distrikter.
6. Storkjøkken: hvor mye mat lages fra bunnen i offentlige kjøkken (skole, sykehjem, sykehus), og hvor mye er ferdigmat? Utdanning av kokker og kjøkkenpersonell.

Startpunkter (verifiser): SSB, SCB, Statistics Finland, Danmarks Statistik, Hagstofa Íslands, Eurostat, landbruksdirektorater, NAV bedriftsundersøkelse, Arbetsförmedlingen, OECD og nordiske forskningsrapporter.

KILDEREGLER
- Offisiell statistikk og forskning først. Bransjeorganisasjoner og medier er sekundærkilder og skal merkes.
- Hvert tall: enhet, år, nevner, geografi, tabell-ID eller lokator, URL.
- Sammenlign bare land der definisjonene er like; skriv det når de ikke er det. Egne beregninger skal merkes med metode.
- Ikke finn på. Finner du ikke noe: "ikke funnet i avgrenset søk".
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Faktatabeller per område (1–6): indikator | land | verdi | enhet | år | nevner | kilde-ID | sammenlignbar (ja/delvis/nei)
C. Utviklingstrekk og sårbarheter som kildene selv beskriver
D. Definisjons- og sammenligningsproblemer
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: P4-NO-001 osv.; type: tall|fakta|forskningsfunn|tolkning)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## P5 – Husholdningenes kompetanse og egenberedskap

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om hvordan kompetanse henger sammen med beredskap i matsystemer i Norge, Sverige, Danmark, Finland og Island. Målet er forståelse, ikke anbefalinger. Beskriv og forklar; ikke foreslå tiltak. Hovedkode for denne oppgaven er K4 (husholdningenes kompetanse).

SPØRSMÅL
1. Hva sier forskningen om matlagingsferdigheter og matkompetanse (food skills, food literacy) i de nordiske befolkningene, og om utviklingen over tid?
2. Hvilke råd gir myndighetene om egenberedskap, og hva sies om mat? (DSB i Norge, MSB-brosjyren "Om krisen eller kriget kommer" i Sverige, finske 72-timersråd, danske og islandske råd.) Hvordan har rådene endret seg?
3. Finnes det undersøkelser av hvor mange som har matlager hjemme, hvor lenge det rekker, og om folk kan tilberede mat uten strøm?
4. Hvem er mest sårbare (eldre, lav inntekt, personer som bor alene, personer med særlige kostbehov), og hva vet vi om det?
5. Hva er kjent om husholdningenes faktiske adferd i tidligere kriser (hamstring, endret matlaging, matsvinn)?

KILDEREGLER
- Forskning, offisielle undersøkelser og myndighetsråd først. Medier er sekundærkilder og skal merkes.
- Hver påstand: URL, utgiver, år, lokator, kort ordrett sitat (maks 25 ord). Tall med utvalg, år og metode.
- Skill råd (hva myndighetene anbefaler) fra målt adferd (hva folk faktisk gjør). Ikke finn på. Finner du ikke noe: "ikke funnet i avgrenset søk".
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Myndighetsråd per land: land | utgiver | dokument | år | hva som sies om mat | kilde-ID
C. Målt kompetanse og egenberedskap: undersøkelse | land | år | utvalg | hovedfunn | kilde-ID
D. Sårbare grupper – hva kildene sier
E. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: P5-NO-001 osv.; type: fakta|tall|forskningsfunn|myndighetsråd|tolkning)
F. Det vi ikke vet
G. Søkelogg (kort)
```

---

## P6 – Institusjoner, øvelser og forskningsstatus

```text
Du skal gjøre et grundig kildestudie. Ikke still oppklarende spørsmål; bruk avgrensningen under.

KONTEKST
Jeg bygger et kunnskapsgrunnlag om hvordan kompetanse henger sammen med beredskap i matsystemer i Norge, Sverige, Danmark, Finland og Island. Målet er forståelse, ikke anbefalinger. Beskriv; ikke vurder hvem som gjør det best, og ikke foreslå tiltak. Hovedkoder for denne oppgaven er K2 (institusjonell kompetanse) og K3 (kunnskap i samfunnet).

SPØRSMÅL
1. Hvordan er ansvaret for matforsyning i krise organisert i hvert land (stat, region, kommune og næringsliv)? Kort, med kilde.
2. Finnes det dokumenterte øvelser for matforsyning, og hva har evalueringene vist om kompetanse, roller og koordinering?
3. Hvordan er Finlands offentlig–private samarbeid om forsyningsberedskap bygget opp (Huoltovarmuuskeskus og sektorpoolene), og hva sier kildene om hvordan kunnskap deles og holdes ved like?
4. Hva har riksrevisjoner og tilsvarende kontrollorganer funnet om matberedskap (for eksempel Riksrevisjonen i Norge og Riksrevisionen i Sverige)? Hva sies om kompetanse og kunnskap?
5. Forskningsstatus: hvilke kunnskapsoversikter og review-artikler finnes om matberedskap og matsystemresiliens i Norden? Hvilke kunnskapshull påpeker de selv?

KILDEREGLER
- Lover, offentlige dokumenter, evalueringer, revisjonsrapporter og forskning først. Medier er sekundærkilder og skal merkes.
- Hver påstand: URL, utgiver, år, lokator, kort ordrett sitat (maks 25 ord).
- Skill lov/plan fra gjennomføring, og gjennomføring fra evaluert effekt. Ikke finn på. Finner du ikke noe: "ikke funnet i avgrenset søk".
- Ikke samle informasjon om enkeltpersoner.
- Svar på norsk bokmål; sitater på originalspråket.

LEVERANSE (markdown)
A. Hovedinnsikter (6–10 avsnitt med kilde-ID og sikkerhet)
B. Ansvarsorganisering per land: nivå | institusjon | ansvar for matforsyning | hjemmel/dokument | kilde-ID
C. Øvelser og evalueringer: øvelse | land | år | hva som ble øvd | funn om kompetanse/koordinering | kilde-ID
D. Revisjonsfunn: organ | land | år | rapport | hovedfunn om matberedskap og kompetanse | kilde-ID
E. Forskningsstatus: kunnskapsoversikt | år | omfang | kunnskapshull de påpeker | kilde-ID
F. Påstandstabell som CSV-blokk med kolonnene:
id,k_kode,land,verdikjedeledd,pastand,type,tall,enhet,aar,kilde_url,utgiver,publisert,lokator,sitat,kildetype,sikkerhet,kommentar
(id: P6-NO-001 osv.; type: fakta|lov_eller_plan|evaluering|revisjonsfunn|forskningsfunn|tolkning)
G. Det vi ikke vet
H. Søkelogg (kort)
```

---

## P7 – Sammenstilling (kjøres etter P1–P6, med de seks svarene lastet opp)

```text
Jeg har lastet opp seks researchleveranser (P1–P6) om kompetanse og beredskap i nordiske matsystemer. Ikke still oppklarende spørsmål. Ikke gjør ny research på nettet, med ett unntak: du kan åpne en kilde for å kontrollere en påstand der leveransene er i motstrid.

OPPGAVE
Lag et samlet kunnskapsgrunnlag som forklarer emnet. Ikke skriv anbefalinger eller tiltak.

1. Hovedinnsikter på tvers (10–12 avsnitt). Hver innsikt skal vise hvilke påstands-ID-er den bygger på, og hvor sikker den er (godt dokumentert / delvis / svakt / omstridt).
2. En forklaringsmodell i tekst: hvordan de fire kompetansebetydningene (K1 praktisk, K2 institusjonell, K3 kunnskap i samfunnet, K4 husholdninger) virker inn på matforsyningen i de tre tidshorisontene akutt sjokk, kontinuitet og strukturell resiliens.
3. Motstrid: der leveransene sier ulike ting. Beskriv forskjellen (definisjon, år, kilde) og hva som er best dokumentert.
4. Svake punkter: påstander som bare har sekundærkilde, mangler lokator eller er merket svakt.
5. De viktigste kunnskapshullene samlet, gruppert etter K-kode og land.
6. En samlet ordliste (maks 20 begreper).
7. Samlet påstandstabell: slå sammen alle CSV-blokkene, behold opprinnelige ID-er, fjern eksakte duplikater og legg til kolonnen "motstrid_med" med ID-ene til påstander som er i motstrid.

Skriv på norsk bokmål. Skill tydelig mellom det kildene sier og din sammenstilling.
```
