---
tittel: "Metode og Island – avgrenset primærkildelesing"
dato: "2026-09-07"
status: "Intern kandidat-research; ikke human_verified eller godkjent for publisering"
formål: "P0.3 i matsikkerhet- og beredskapsarbeidet"
---

# Metode og Island

## Avgrensning og leseloggen

Relevante deler er lest med AI-assistert fulltekstsøk og kontroll mot primærkildenes PDF-lokatorer i tre kilder: EU/JRCs *Operational framework for stress testing EU food security* (98 sider, PDF JRC145765), HLPE-FSNs *Building resilient food systems* (158 sider) og Landbúnaðarháskóli Íslands (LBHÍ) *Fæðuöryggi á Íslandi*, Rit LbhÍ nr. 139 (60 sider, 2021). EU- og HLPE-PDF-ene er arkivert utenfor Git og hashfestet. LBHÍ-PDF-en er tilgjengelig i søkeindeksert offisiell universitetsvisning, men den nåværende URL-en returnerte 404 ved lokal nedlasting; derfor er kildeteksten uarkivert/provisorisk og har ingen lokal hash i denne kjøringen. Alle lokatorer nedenfor er **PDF-side** (1-basert).

Ikke lest eller ikke lokalisert i fulltekst: EU-rapportens underliggende datasett og empiriske casefiler; HLPE-FSNs kildeartikler; Islands 2025 HÍ-rapport om forslag til nødlagre; en primær drifts-/eierdokumentasjon for kornmølle; og eventuell 2025 dokumentasjon som bekrefter demonteringstidspunktet. Nett- og mediekilder brukes derfor bare til å dokumentere kilde- og tilgangsgap, ikke som erstatning for originalbevis.

## EU/JRC: operasjonell stresstestmetode

Kilde: Magnuszewski et al., JRC145765, 10.04.2026, DOI 10.2760/5895818, offisiell fulltekst i kilderegisteret.

EU-rapporten definerer stresstest som et «hva hvis?»-arbeid som undersøker hvordan forsyningskjeder tåler og gjenoppretter seg etter forstyrrelser; det er ikke en prognose (PDF-s. 7). Arbeidsflyten er: avgrens mål, sektorer, sjokk og tid; kartlegg innsatsvarer og produktflyt; bygg plausible scenarioer; analyser sårbarheter og virkningsintervaller; og samskap responser (PDF-s. 7–8). Den kan skaleres fra skrivebordsresearch/ekspertmøter til modeller og sosiale simuleringer (PDF-s. 7, 80–81).

Rammen bruker seks sammenkoblede dimensjoner: tilgjengelighet, fysisk/økonomisk tilgang, ernæringsmessig utnyttelse, stabilitet, bærekraft og agency (PDF-s. 14–16). Den krever synliggjøring av pris, inntekt, geografi, utsatte grupper, mattrygghet og mikronæringsstoffer, ikke bare produksjon og lager. Scenarier skal være plausible og gjensidig forskjellige, med problem-eiere som kan handle (PDF-s. 17–20). Forsyningskartet bør ha eksplisitt systemgrense og vise utløsere, overføring, virkning og intervensjon, også på tvers av grenser (PDF-s. 21–23, 57–66). Sjokk velges etter virkning, plausibilitet og sårbarhet; sammensatte sjokk er relevante (PDF-s. 55–56).

**Prosjektets egen tolkning:** Et Food Systems-testdesign bør derfor koble lager til mølle/foredling, energi, transport, distribusjon, pris/tilgang og ernæring, og registrere bivirkninger/burden shifting. Dette er vår anvendelse av metoden, ikke et resultat EU-rapporten har vurdert.

## HLPE-FSN 2025: resiliens, agency og vurdering

Kilde: HLPE. 2025. *Building resilient food systems*, report #20, FAO/CFS. Lokatorene under er **PDF-side**, 1-basert.

HLPE-FSN beskriver resiliens som fortsatt funksjon gjennom sjokk og stress, men anbefaler å gå fra «bouncing back» til **Equitably Transformative Resilience (ETR)**: endringer som adresserer strukturelle sårbarheter, ulikhet, makt og økologiske avhengigheter (PDF-s. 16–18 og 56–61). Rapporten identifiserer seks dimensjoner: availability, accessibility, utilization, stability, sustainability og agency (PDF-s. 18–19 og 26–28).

Metodisk er tre prinsipper særlig relevante: beredskap, kontinuitetsplanlegging og foresight som eget innsatsområde (PDF-s. 79–82); scenarioarbeid som utforsker usikkerhet gjennom kvantitativ og/eller deltakende kvalitativ vurdering (PDF-s. 82); og stedsspesifikke, samskapte indikatorer med håndterbart omfang, makt- og rettferdighetsperspektiv (PDF-s. 153–154).

ETR-prinsippene er socioøkologisk rettferdighet, utsattes kunnskap og kapasitet, håndtering av strukturell ulikhet/makt og menneskerettigheter/agency (PANTHER) (PDF-s. 57–58). Det gir en begrunnelse for at tilgang og ernæring må ligge i scenariotesten, mens agency og bærekraft vurderes som virkninger og fordelingsspørsmål. Food Systems-designet er vår egen anvendelse.

## Island: original kilde og kontroll av de tre påstandene

### LBHÍ-rapporten fra 2021

Den originale universitetsrapporten er *Fæðuöryggi á Íslandi*, Rit LbhÍ nr. 139, skrevet av Landbúnaðarháskóli Íslands for departementet (2021). Den er lest i den søkeindekserte offisielle PDF-visningen, men inputen er ikke lokalt arkivert og må behandles som provisorisk inntil en stabil kopi er gjenfunnet. Forordet avgrenser den tydelig: nasjonalt nivå, innenlandsk produksjon, innsatsvarer, import og produksjon av grunnråvarer; den undersøker **ikke** økonomisk tilgang for alle grupper/husholdninger (forord og innledning).

Rapporten sier i sammendraget at innenlandsk matkornproduksjon er «um 1% af heildarneyslu» – omtrent 1 % av totalforbruket – i den søkeindekserte visningen. Kornseksjonen omtaler også årlig matkornproduksjon og importert matkorn i 2019. Dette er en historisk, kontekstavhengig rapportpåstand som ikke er klarert for ubegrenset gjenbruk mens originalfilen er uarkivert. Den er ikke en all-food, kalori-, protein- eller selvforsyningsandel. Inntil stabil originalkopi og nevner er gjenfunnet skal den bare brukes som **provisorisk historisk matkornindikator**, ikke som publiseringsklar 1 %-påstand.

Rapporten identifiserer fire forutsetninger for nasjonalt matsikkerhetsarbeid – ressurser, kunnskap/utstyr, tilgang til innsatsvarer og lager av mat som ikke kan produseres innenlands (sammendraget). Dette er rapportens analyser og modellforutsetninger fra 2021, ikke nåstatus i 2026.

### 2025 HÍ-rapporten om nødlagre

Et offisielt svar fra Alþingi (þingskjal 1505, 2025–2026) bekrefter at en rapport om *tillögur að neyðarbirgðum matvæla á Íslandi* ble utarbeidet av Matvæla- og næringarfræðideild Háskóla Íslands november 2024–juni 2025. Samme svar skiller den fra en LBHÍ-rapport om nødlagre for **innlandsk matvareproduksjon**, utarbeidet september–desember 2024, og opplyser at begge ble presentert på et møte i november 2025. Selve HÍ-rapporten ble ikke funnet som offentlig fulltekst i avgrenset søk og er derfor ikke lest. Påstander om dens metode, tall eller anbefalinger skal stå som uverifisert kildegap.

### «Eneste mølle» og demontering i 2025

RÚV skrev 7. juli 2025, med intervju med HÍ-fagperson, at «eina kornmyllan á Íslandi hafi verið tekin niður á árinu» – den eneste kornmøllen skal ha blitt tatt ned i løpet av året. Dette er en sekundær mediekilde/intervju, ikke original drifts-, eier- eller myndighetsdokumentasjon. Jeg fant ingen offentlig primærkilde som dokumenterer at dette var Islands eneste mølle, nøyaktig demonteringsdato, anleggets eier/status eller om annen foredlingskapasitet kunne brukes. Formuleringen må derfor nedgraderes til: **«RÚV intervjuet i juli 2025 en HÍ-fagperson som oppga at den eneste kornmøllen var tatt ned i løpet av året; dette er ikke primærverifisert.»** «Demontert i 2025» og «eneste mølle» skal ikke brukes som faktum i whitepaper eller database.

## Kandidat for neste stress-test

Et avgrenset islandsk/nordisk case kan testes som `matkorn -> tørking/lager -> mølle -> bakeri/distribusjon -> husholdning`. Scenariofelt bør minst være geografi, produkt (for eksempel bygg/havre versus importert hvetemel), befolkning og utsatte grupper, sesong, sjokk, varighet, fungerende funksjoner, innsatsvarer, energi, transport, foredling, pris/tilgang, ernæring og aktør med beslutningsmyndighet. Det provisoriske 1 %-tallet skal ikke brukes som modellinput før originalkopi, år og nevner er avklart.

Før analyse eller publisering må følgende lukkes: offentlig kopi av HÍs 2025 nødlagerrapport; originalkilden bak møllepåstanden; operatør-/myndighetsstatus for møller og eventuell gjenværende kapasitet; og en eksplisitt, tidsfestet nevner for 1 %-beregningen. Inntil da er islandsk møllekapasitet og 2025-hendelsen et `unverified` kildegap.

## Kilde- og artefaktstatus

Kildene og lokatorene er registrert i `metode-sources.json`. Rå PDF-er og fulltekstuttrekk ligger utenfor Git i `/Users/gabrielfreeman/.codex/artifacts/food-beredskap-2026-09-07/metode/`. Ingen påstand i dette notatet er `human_verified`; dokumentet er kun en kandidat-researchleveranse til videre kontroll.
