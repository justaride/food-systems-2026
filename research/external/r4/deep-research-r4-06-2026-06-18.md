# Spillvarme/veksthus — normalisert energi/areal og NVE-hjemmel

**ID:** DRO-R4-06 · 2026-06-18 · felt: Spillvarme/drivhus · hull-type: A  
**Agent:** claude-sonnet-4-6 · sesjon local_305cc1f7  
**Primærkilder:** NVE (lovdata/veiledere.nve.no), SINTEF Energi AS (via Landbruksdirektoratet), SSB, Sweco/WA3RM (prosjektdok)  
**Sekundærkilder:** Agri-e.no, Impact Loop, Nordic Prosjekt

---

## Kort dom

P-VARME-2: Normaliserte norske veksthus-nøkkeltall eksisterer fra SINTEF 2022 og SSB-serien 1989–2018, men SINTEF-PDF-filen var utilgjengelig for direkte innhenting (HTTP 403/timeout). SSB-trenddata er gjengitt via sekundærkilde. Frövi-caset (Sverige) er et enkelt-case (industriell symbiose cellulosefabrikk), ikke overførbar som norsk benchmark uten justeringer. GWh/tonn-tall er beregnede (ikke direkte målt og publisert) fra prosjektdata.

P-VARME-3: NVE-hjemmelen er fullstendig dokumentert fra primærkilde (veiledere.nve.no). Forskrift FOR-2024-09-25-2263 hjemlet i energiloven § 7-2, ikrafttredelse 01.04.2025. Datasenter-terskel: >2 MW samlet tilført elektrisk effekt. Faktisk praksis dokumentert gjennom publisert kost-nytteanalyse for WS Computing AS (Google Skien, Sweco 2025).

---

## Datatabell

| metrikk | verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet |
|---------|-------|-------|-----|----------|--------|-----------|-----|---------|--------------|
| Normalisert energiforbruk norsk veksthus (samlet) | 514 | kWh/m²/år | 1989 | Norge | SSB-statistikk gartneri | SSB (via sekundærkilde) | https://sintef.brage.unit.no/sintef-xmlui/bitstream/handle/11250/3023994/2022-00331_2.PDF | SINTEF-rapport 2022-00331, omtale av SSB-trend | Sekundær – PDF utilgjengelig for direkte verifisering |
| Normalisert energiforbruk norsk veksthus (samlet) | 414 | kWh/m²/år | 2018 | Norge | SSB-statistikk gartneri | SSB (via sekundærkilde) | https://sintef.brage.unit.no/sintef-xmlui/bitstream/handle/11250/3023994/2022-00331_2.PDF | SINTEF-rapport 2022-00331, trend 1989–2018 | Sekundær – PDF utilgjengelig for direkte verifisering |
| Total energibruk norsk veksthussektor | 708 | GWh/år | 2018 | Norge | SSB-statistikk gartneri | SSB (via sekundærkilde) | https://sintef.brage.unit.no/sintef-xmlui/bitstream/handle/11250/3023994/2022-00331_2.PDF | SINTEF-rapport 2022-00331, sektoroversikt | Sekundær – PDF utilgjengelig for direkte verifisering |
| Andel elektrisitet (belysning) av total veksthusenergi | 44 | % | 2018 | Norge | SSB-statistikk gartneri | SSB (via sekundærkilde) | https://sintef.brage.unit.no/sintef-xmlui/bitstream/handle/11250/3023994/2022-00331_2.PDF | SINTEF-rapport 2022-00331, energifordeling | Sekundær – PDF utilgjengelig for direkte verifisering |
| Andel varme av total veksthusenergi | 56 | % | 2018 | Norge | SSB-statistikk gartneri | SSB (via sekundærkilde) | https://sintef.brage.unit.no/sintef-xmlui/bitstream/handle/11250/3023994/2022-00331_2.PDF | SINTEF-rapport 2022-00331, energifordeling | Sekundær – PDF utilgjengelig for direkte verifisering |
| Energiandel strøm/varme norsk veksthus (Agri-e) | 60–70 / 30–40 | % strøm / % varme | udatert | Norge | Bransje­estimat Agri-e/NIBIO | Agri-e (sekundær) | https://www.agri-e.no/forside/fornybar-energi-til-veksthus | Energibehov og leveranse-avsnitt | Sekundær/bransjeaktør – ikke vitenskapelig |
| Energikostnader som andel av driftskostnader norsk veksthus | 25–40 | % | udatert | Norge | Bransje­estimat | Agri-e (sekundær) | https://www.agri-e.no/forside/fornybar-energi-til-veksthus | Energibehov og leveranse-avsnitt | Sekundær/bransjeaktør |
| El per kg agurk (norsk veksthus) | 11 | kWh/kg | udatert (ref. NIBIO Særheim) | Norge | Forskningsdata NIBIO | NIBIO (via sekundærkilde) | https://sintef.brage.unit.no/sintef-xmlui/bitstream/handle/11250/3023994/2022-00331_2.PDF | Omtale i SINTEF-rapport | Sekundær – kun elektrisitet, ikke totalt varmebehov |
| Frövi-case: spillvarme tilført fra Billerud kartongfabrikk | ~50 | GWh/år | 2024 | Frövi, Sverige | Prosjektdata WA3RM/PE | WA3RM / Impact Loop (sekundær) | https://www.impactloop.se/artikel/har-ska-8-000-ton-tomater-odlas-med-spillvarme | Artikkeltekst | Sekundær – enkelt-case, ikke normalisert benchmark |
| Frövi-case: veksthusareal | 100 000 | m² | 2024 | Frövi, Sverige | Prosjektdata Sweco | Sweco Sverige | https://www.sweco.se/projekt/wa3rms-vaxthus-renergy-frovi/ | Faktaboks prosjekt | Primær (prosjektdok) |
| Frövi-case: tomatproduksjon | 8 000 | tonn/år | 2024 | Frövi, Sverige | Prosjektdata WA3RM | Sweco Sverige | https://www.sweco.se/projekt/wa3rms-vaxthus-renergy-frovi/ | Faktaboks prosjekt | Primær (prosjektdok) |
| Frövi-case: implisitt spillvarme per areal (beregnet) | ~500 | kWh/m²/år | 2024 | Frövi, Sverige | Avledet (50 GWh ÷ 100 000 m²) | Beregnet fra WA3RM-data | Se over | Avledet verdi | Enkelt-case, ikke validert mot målte driftsdata |
| Frövi-case: implisitt spillvarme per tonn tomat (beregnet) | ~6,25 | GWh/tonn | 2024 | Frövi, Sverige | Avledet (50 GWh ÷ 8 000 t) | Beregnet fra WA3RM-data | Se over | Avledet verdi | **OBS: GWh/tonn er svært høyt og avspeiler varme til hele veksthuset per produsert tonn, ikke prosessvarme per kg produkt** |
| Veksthus effektbehov (næringsbygg som proxy i kost-nytteanalyse) | 35 | W/m² | 2025 | Skien, Norge | Teknisk forutsetning kost-nytteanalyse | Sweco / WS Computing AS kost-nytteanalyse | https://cdn.prod.website-files.com/66d6cb8b8d395a1adb6aa47a/68b93fcc8538d29553cd188a_Kost%20nytteanalyse%20overskuddsvarme%20WS%20Computing%20AS_V1.pdf | Kap. 3.3 tekniske forutsetninger | Prosjektdok – næringsbygg, ikke spesifikt veksthus |
| CO2-utslippsreduksjon Frövi | >12 500 | tonn CO2/år | 2024 | Frövi, Sverige | WA3RM-estimat | WA3RM (sekundær) | https://www.sweco.se/projekt/wa3rms-vaxthus-renergy-frovi/ | Projektbeskrivelse | Sekundær – leverandørestimert |

---

## NVE-hjemmel

### Eksakt hjemmel

**Primærlov:** Lov om endringer i energiloven og naturgassloven (overskuddsvarme, energikartlegging, måling og fakturering), vedtatt av Stortinget 16. juni 2023 (lov 2023-06-16-69). Endret energiloven § 7-2 til å inkludere datasenter.

**Forskrift:** FOR-2024-09-25-2263 — Forskrift om kost-nytteanalyse av mulighetene for å utnytte overskuddsvarme. Vedtatt av Energidepartementet 25. september 2024.

**Lovdata-referanse:** https://lovdata.no/dokument/SF/forskrift/2024-09-25-2263

**Ikrafttredelse:** 1. april 2025 (§ 20 i forskriften, energiloven-endringen og forskriften trådte i kraft simultant).

### Relevante paragraf-referanser

- **Energiloven § 7-2 første ledd bokstav e:** Datasenter med mer enn 2 MW samlet tilført elektrisk effekt er pliktsubjekt for kost-nytteanalyse.
- **Forskriften § 2 (Virkeområde):** «Forskriften gjelder gjennomføring, godkjenning og oppfølging av kost-nytteanalyser ved planlegging av nye anlegg omfattet av energiloven § 7-2 første ledd.»
- **Forskriften § 4 (Plikt til å gjennomføre kost-nytteanalyser):** «For alle anlegg omfattet av energiloven § 7-2 første ledd, skal tiltakshaver senest før bygging settes i gang gjennomføre en kost-nytteanalyse av mulighetene for å utnytte overskuddsvarme.»
- **Effektgrense datasenter:** >2 MW samlet tilført elektrisk effekt (ikke ≥2 MW; et anlegg med nøyaktig 2 MW er ikke omfattet).
- **§ 20 (Ikrafttredelse):** «Denne forskriften settes i kraft 1. april 2025.» Ingen tilbakevirkende kraft – bygging påbegynt før 01.04.2025 er unntatt.
- **§ 5 (Unntak):** Industrianlegg, datasenter og andre anlegg som har konkrete og dokumenterbare planer om å levere varmen til et fjernvarmenett, er unntatt analyseplikten.

### EØS-bakgrunn

Lovendringen og forskriften gjennomfører energieffektiviseringsdirektivet fra 2012 artikkel 14 nr. 5 (som endret ved direktiv (EU) 2018/2002). EØS-komiteen besluttet 11. juli 2025 å formelt ta direktivet inn i EØS-avtalen. Loven og forskriften skal tolkes i lys av dette direktivet.

### Faktisk praksis

Praksis er dokumentert gjennom en publisert godkjent kost-nytteanalyse:

**WS Computing AS (Google Skien Gromstul), Sweco 2025:**
- Utarbeidet av Sweco Norge AS for WS Computing AS (lokal enhet for Google i Skien).
- Datasenter med kapasitet >2 MW — analyseplikt utløst under FOR-2024-09-25-2263.
- Første byggetrinn: kapasitet til eksport av ~38,5 MW / ~337 GWh varme til eksterne brukere.
- Spillvarme tilgjengelig på 30°C (sekundærside) — lavtemperatur begrenser direkte veksthusbruk.
- Alternativ 1 (lokal fjernvarme på Gromstul): NNV 13,3 MNOK ved 7% kalkylerente; IRR 8,9%.
- Konklusjon i analysen: Ingen aktuelle varmemottakere pr. dags dato innenfor 2 km. Ny næringsvirksomhet (inkl. veksthus) nevnt eksplisitt som mulig framtidig avtagerkategori.
- Dokument levert NVE 18.08.2025. Referanseforskrift oppgitt som FOR-2024-09-25-2263.

**Kilde:** https://cdn.prod.website-files.com/66d6cb8b8d395a1adb6aa47a/68b93fcc8538d29553cd188a_Kost%20nytteanalyse%20overskuddsvarme%20WS%20Computing%20AS_V1.pdf (Sweco prosjektnr 10248342, godkjentversjon rev.01)

### NVE digital veileder

https://veiledere.nve.no/kost-nytteanalyse-av-overskuddsvarme/ — publisert 27.03.2025, sist endret 02.09.2025. Gjennomgår alle 20 paragrafer.

---

## Kildeledger

| # | kildetype | kildeeier | tittel | URL | hentedato | tilgjengelighet |
|---|-----------|-----------|--------|-----|-----------|-----------------|
| K1 | Primær – lovverk | NVE / Energidepartementet | FOR-2024-09-25-2263 Forskrift om kost-nytteanalyse av overskuddsvarme | https://lovdata.no/dokument/SF/forskrift/2024-09-25-2263 | 2026-06-18 | Tom respons (lovdata krever innlogging for fullversjon) |
| K2 | Primær – veileder | NVE | Kost-nytteanalyse av overskuddsvarme (digital veileder) | https://veiledere.nve.no/kost-nytteanalyse-av-overskuddsvarme/ | 2026-06-18 | Hentet OK |
| K3 | Primær – veileder | NVE | § 2 Virkeområde | https://veiledere.nve.no/kost-nytteanalyse-av-overskuddsvarme/kapittel-1-formal-virkeomrade-og-definisjoner/2-virkeomrade/ | 2026-06-18 | Hentet OK |
| K4 | Primær – veileder | NVE | § 4 Plikt til å gjennomføre kost-nytteanalyser | https://veiledere.nve.no/kost-nytteanalyse-av-overskuddsvarme/kapittel-2-plikt-til-a-gjennomfore-kost-nytteanalyse/4-plikt-til-a-gjennomfore-kost-nytteanalyser/ | 2026-06-18 | Hentet OK |
| K5 | Primær – veileder | NVE | § 20 Ikrafttredelse | https://veiledere.nve.no/kost-nytteanalyse-av-overskuddsvarme/kapittel-5-diverse-bestemmelser/20-ikrafttredelse/ | 2026-06-18 | Hentet OK |
| K6 | Primær – lov | Lovdata | Lov 2023-06-16-69 (endringer i energiloven) | https://lovdata.no/lov/2023-06-16-69 | 2026-06-18 | Identifisert via websøk |
| K7 | Primær – forskningsrapport | SINTEF Energi AS | Energibruk i norske veksthus (rapport 2022-00331) | https://sintef.brage.unit.no/sintef-xmlui/bitstream/handle/11250/3023994/2022-00331_2.PDF | 2026-06-18 | IKKE hentet – PDF returnerte tom respons. Rapport også tilgjengelig via Landbruksdirektoratet (URL for lang for direkte fetch). |
| K8 | Primær – prosjektdokument | Sweco Norge AS / WS Computing AS | Kost-nytteanalyse overskuddsvarme datasenter WS Computing AS Skien Gromstul (rev.01, 18.08.2025) | https://cdn.prod.website-files.com/66d6cb8b8d395a1adb6aa47a/68b93fcc8538d29553cd188a_Kost%20nytteanalyse%20overskuddsvarme%20WS%20Computing%20AS_V1.pdf | 2026-06-18 | Hentet OK (fullversjon) |
| K9 | Primær – prosjektdokument | Sweco Sverige | WA3RMs växthus Renergy Frövi (prosjektsidé) | https://www.sweco.se/projekt/wa3rms-vaxthus-renergy-frovi/ | 2026-06-18 | Hentet OK |
| K10 | Sekundær – bransjeaktør | Agri-e | Fornybar energi til veksthus | https://www.agri-e.no/forside/fornybar-energi-til-veksthus | 2026-06-18 | Hentet OK |
| K11 | Sekundær – næringsmedie | Impact Loop | Här ska 8 000 ton tomater odlas med spillvärme | https://impactloop.se/artikel/har-ska-8-000-ton-tomater-odlas-med-spillvarme | 2026-06-18 | Hentet OK (ingress, resten bak betalingsmur) |

---

## Overførbarhetsvurdering: Frövi til norsk kontekst

**Frövi-casets egenskaper (enkelt-case, IKKE normalisert benchmark):**
- Spillvarmekilde: industriprosess cellulose/kartong (Billerud), høy og stabil varmeflyt, trolig >60°C tilgjengelig temperatur.
- Skala: 100 000 m² (industriell storskala, unik i Norden).
- Klima Frövi (Västmanland): ligner Oslofjord/Innlandet, sammenlignbart vinterklima med Sørøst-Norge.
- Implidert ~500 kWh/m²/år er trolig primært varme (ikke inkludert belysningselektrisitet). Norsk bransjesnitt 2018: 414 kWh/m²/år totalt (inkl. belysning), hvorav ~56% varme ≈ 232 kWh/m²/år varme.

**Overførbarhets-assessment:**
- Klimamessig: Moderat overførbarhet til Sørøst-Norge (±10% for klimakorreksjon).
- Spillvarmekvalitet: Frövi bruker høytemperatur industrispillvarme. Datasenter-spillvarme (WS Computing: 30°C sekundærside) er lavtemperatur og krever varmepumpe for veksthusbruk – annen økonomi og energieffektivitet.
- Skala: Enkelt-case, ikke statistisk normalisert. Kan ikke uten videre brukes som nordisk benchmark.
- Kultur (tomat): Norsk gjennomsnitt ~232 kWh varme/m²/år. Frövi-case impliserer ca. 500 kWh/m²/år (spillvarme inkl. prosessvarme for hele anlegget). Avviket skyldes trolig forskjell i belysningsintensitet, driftstid og at Frövi-data er prosjekterte, ikke validerte driftsdata.

**Konklusjon overførbarhet:** Frövi-tallene er **enkelt-case-data** som kun illustrerer størrelsesorden. De er ikke overførbare uten eksplisitt klimakorreksjon, kulturspesifisering og dokumentasjon av spillvarme-temperaturnivå. Norsk normatall for totalenergi er ~400–420 kWh/m²/år (2018-baseline), hvorav varme ~230–240 kWh/m²/år. Disse er bedre utgangspunkt for norsk dimensjonering.

---

## Tomme celler / ikke funnet

1. **SINTEF-rapport 2022-00331 direkte PDF-innhold**: Filen ved primær-URL og Landbruksdirektoratets URL var ikke tilgjengelig for innhenting (tom respons / URL for lang). Rapporten eksisterer og er bekreftet publisert via Landbruksdirektoratets filarkiv, men detaljerte tabellverdier (kWh/m²-fordeling per kultur, temperaturkrav) er ikke verifisert fra primærkilde i dette søket.
2. **Normaliserte kWh/m²-tall per kultur (tomat vs. agurk separat)**: Ikke funnet i tilgjengelige primærkilder. SSB og SINTEF-sammendrag oppgir sektorgjennomsnitt, ikke kulturspesifikke tall.
3. **GWh/tonn validert av uavhengig kilde**: Frövi-avledet GWh/tonn-tall er beregnet fra prosjektdata, ikke hentet fra vitenskapelig kilde. Ingen nordisk normverdi for GWh/tonn funnet.
4. **Gartnerhallen energistatistikk**: Ingen tilgjengelig offentlig datakilde fra Gartnerhallen med normaliserte nøkkeltall funnet i dette søket.
5. **SSB-data nyere enn 2018 for veksthusenergi per m²**: SSB-serie identifisert, men 2022/2023-tall på per-m²-nivå ikke tilgjengelig i åpne søkeresultater. Kjent at naturgassforbruk falt kraftig i 2022 (16 GWh) pga. energiprisnivå, men dette gjenspeiler pris-atferd, ikke strukturelt varmebehov.
6. **NVE-kravets faktiske godkjenningspraksis (antall behandlede analyser)**: Regelverket trådte i kraft 01.04.2025. Kun én publisert kost-nytteanalyse (WS Computing/Google Skien, levert NVE 18.08.2025) er funnet. Aggregert oversikt over antall innsendte/godkjente analyser ikke funnet i offentlige kilder.
7. **Lovdata fullversjon FOR-2024-09-25-2263**: Fullparagrafer ikke hentet (krever innlogging/betalingstjeneste). Innhold bekreftet via NVEs digitale veileder som gjengir forskriftsteksten direkte.
