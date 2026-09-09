# A3 – søkelogg

Arbeidsdato: 2026-09-08. Alle søk, åpninger og API-kall nedenfor ble gjort i denne researchrunden. Ingen dataeiere ble kontaktet. Råkopier som faktisk ble lastet ned ligger privat under `/Users/gabrielfreeman/.codex/private/food-systems-a3-2026-09-08/`, ikke i worktree-et.

## Faktiske søk og åpninger

### A3-L001 — SIFO-rapport og matsikkerhetsinstrument

- Spørsmål: A3-Q1, A3-Q2, A3-Q3.
- Eksakt søk: `SIFO-rapport 7-2025 Familiefattigdom matsikkerhet PDF`.
- Åpnet: OsloMet publikasjonsside `https://www.oslomet.no/no/om/sifo/publikasjoner` og offentlig PDF-speil `https://www.parat.com/files/2025/08/21/SIFO-rapport%207-2025%20Familiefattigdom.pdf`.
- Resultat: Full relevant tekst lest, inkludert trykt s. 11–13, 22–24 og 50, Tabell 2-1 og Figur 4-3/4-4. Speilet ble arkivert privat og hashet i A3-S001.
- Videre handling: Registrerte ODA som separat metadata-/tilgangskilde i A3-S002 og brukte den åpne rapportkopien som lesekilde.

### A3-L002 — FAO/FIES-kataloger

- Spørsmål: A3-Q4.
- Eksakt søk: `site:microdata.fao.org FIES Norway 2022 microdata catalog`.
- Åpnet: Norge 2022 `https://microdata.fao.org/index.php/catalog/2480`, related materials `https://microdata.fao.org/index.php/catalog/2480/related-materials`, og katalogsidene for Sverige 2022 (`/catalog/2490`), Finland 2022 (`/catalog/2462`), Island 2022 (`/catalog/2469`), Danmark 2024 (`/catalog/2747`), Norge 2020 (`/catalog/1966`) og Finland 2020 (`/catalog/1972`).
- Resultat: Åtte FIES-spørsmål, 12-måneders tilbakeblikk, individ 15+, CATI, design effect, margin of error, feltperioder og vektingsbeskrivelse ble lest. Sampling procedure står som NA i flere 2022-kataloger; punktestimat og faktisk N er ikke synlige i metadatautdraget.
- Videre handling: Brukte metadata til metode-/sammenlignbarhetsobservasjoner, ikke til å konstruere prevalenser.

### A3-L003 — Fafo/matutdeling

- Spørsmål: A3-Q5.
- Eksakt søk: `site:fafo.no 20952 Matutdeling 2026`.
- Åpnet: `https://fafo.no/images/pub/2026/20952.pdf`.
- Resultat: Full relevant tekst lest, trykt s. 5, 18–20 og 29–36. Organisasjonsutvalg, 1 906 mottakere/31 steder og representativitetsbegrensning er dokumentert.
- Videre handling: Holdt matutdeling som tjeneste-/mottakerindikator, ikke nasjonal prevalens.

### A3-L004 — svensk pris- og kjøpsatferd

- Spørsmål: A3-Q5.
- Eksakt søk: `site:livsmedelsverket.se höjda matpriser konsumenternas köpbeteende 2023`.
- Åpnet: `https://www.livsmedelsverket.se/globalassets/publikationsdatabas/pm/2023/pm-2023-hur-paverkar-hojda-matpriser-konsumenternas-kopbeteende.pdf`.
- Resultat: Offisiell PDF funnet og lest. Metode og trykt s. 10–13 gir n=1 024, inntektsgruppenes basis-N, ferske grønnsaker/frukt/frosne grønnsaker og prisbekymring.
- Videre handling: Registrert som selvrapportert prispress/kjøpsatferd i A3-S013 og A3-O023.

### A3-L005 — første finske nasjonale søkevariant

- Spørsmål: A3-Q5.
- Eksakte søk:
  - `site:thl.fi ruokaturvattomuus Finland survey food insecurity household food insecurity experience scale primary data`
  - `site:stat.fi food insecurity Finland household survey food insecurity experience scale`
  - `site:ruokavirasto.fi ruokaturvattomuus tutkimus kysely Finland`
  - `site:valtioneuvosto.fi ruokaturva kotitaloudet Finland food insecurity`
- Resultat: Ingen åpen, gjentatt finsk nasjonal FIES-/SIFO-lik serie ble funnet i denne runden. Treffene var hovedsakelig FAO/SDG-referanser, matstrategi eller generelle livsvilkårskilder.
- Videre handling: Gjennomførte alternativt finsk språk-/institusjonssøk A3-L006 og åpnet Statistics Finland PxWeb A3-L007/A3-L008.

### A3-L006 — alternativt finsk språk- og forskningssøk

- Spørsmål: A3-Q5 og A3-Q3.
- Eksakte søk:
  - `site:stat.fi ruokaturvattomuus ruokaturva kotitalous kysely Finland`
  - `site:thl.fi ruokaturvattomuus ruokaturva kysely kotitalous Finland`
  - `site:ruokavirasto.fi ruokaturvattomuus tutkimus kysely Finland`
  - `site:helsinki.fi ruokaturvattomuus Suomi tutkimus kotitalous`
- Resultat: Fant University of Helsinki Research Portal for Kähäri mfl. og Journal.fi-artikkelen `https://journal.fi/sla/article/view/153482`, med n=991 og ett-item-måling.
- Videre handling: Åpnet tidsskriftutgaven, PDF-lenken og full PDF A3-S010. Fant også Statistics Finland-tabellen A3-S011.

### A3-L007 — Statistics Finland API-metadata

- Spørsmål: A3-Q5.
- Endepunkt: `GET https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/eot/132a.px`.
- Resultat: Variablene for husholdningslivsløp, år og informasjon ble hentet. Tabellen har all households, couples with children og single-parent households, med prosentmål for økonomiske vansker. Metadata viser oppdatering 2026-03-06 og metodeendring i 2022.
- Videre handling: Brukte API-uttak A3-L008 og registrerte tabellen som økonomisk proxy, ikke mat-usikkerhet.

### A3-L008 — Statistics Finland API-datauttak

- Spørsmål: A3-Q5.
- Endepunkt: `POST https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/eot/132a.px`.
- Filter: `elinvaihe_5_20200201 = SS,31,32`; `timeperiod_y = 2021,2022,2023,2024,2025`; `contentscode = koti_vaik_pros,hlo_vaik_pros,la_vaik_pros,koti_pie_pros,hlo_pie_pros,la_pie_pros`; format `csv`.
- Resultat: Hentet de rapporterte prosentene som ligger i A3-O012. Ingen råfil ble lagret.
- Videre handling: Registrerte manglende N/konfidensintervall som gap, og metodeendringen i 2022 som sammenlignbarhetsforbehold.

### A3-L009 — finsk originalartikkel/PDF

- Spørsmål: A3-Q3 og A3-Q5.
- Eksakt søk: `10.23990/sa.153482 full text PDF`.
- Åpnet: Journal.fi issue `https://journal.fi/sla/issue/view/13147`, artikkelside `https://journal.fi/sla/article/view/153482` og PDF `https://journal.fi/sla/article/download/153482/121257/452596`.
- Tilgang: Artikkelsiden viste bot-beskyttelse, men issue-siden eksponerte PDF-lenken og PDF-en kunne åpnes/lastes ned. Full relevant tekst og metode/Tabell 1 er lest; PDF arkivert privat som A3-S010.
- Videre handling: Brukte artikkelen som original, fagfellevurdert Finland-kilde og dokumenterte dens egen anbefaling om flerdimensjonal, regelmessig måling.

### A3-L010 — FAOSTAT bulkdata

- Spørsmål: A3-Q4.
- Endepunkt: `https://bulks-faostat.fao.org/production/Food_Security_Data_E_All_Data_(Normalized).zip`.
- Resultat: ZIP lastet ned privat, SHA-256 `1ccced40d8e228693c6fcc5d172de9bcaa3a1c6a1581ebde345d71c1dfa9b692`. Item-code CSV identifiserer 210091 som «Prevalence moderate or severe food insecurity total population (percent) (3-year average)». Nordic Value/lower/upper-rader ble lest.
- Videre handling: Brukte treårsgjennomsnittet som egen observasjonstype; ingen egen beregning ble gjort.

### A3-L011 — IFRO sekundæranalyse

- Spørsmål: A3-Q4.
- Endepunkt: `https://fvm.dk/Media/638481696155213837/IFRO_Commissioned_Work_2024_06.pdf`.
- Resultat: 37-siders PDF åpnet. Sammendrag og innledning/FAO-figurtekst, PDF s. 2–8, lest. Rapporten skiller økonomisk tilgang fra total tilgjengelighet og oppgir FAO som underliggende datakilde.
- Videre handling: Klassifisert som sekundær kontekst, ikke som ny FIES-observasjon.

### A3-L012 — mislykket direkte SIFO-ODA-tilgang

- Spørsmål: A3-Q1–Q3.
- Endepunkter forsøkt: `https://oda.oslomet.no/oda-xmlui/bitstream/handle/11250/3213110/SIFO-rapport%207-2025%20Familiefattigdom.pdf?sequence=9` og samme URL med `?isAllowed=y&sequence=6`.
- Resultat/tilgangsproblem: Web/`curl` returnerte liten HTML/Handle-proxy, ikke PDF. Fulltekststatus er derfor ikke satt på A3-S002.
- Videre handling: Brukte offentlig speil A3-S001, arkivert privat, og beholdt ODA-blokkeringen som eksplisitt tilgangsopplysning.

### A3-L013 — mislykket nettleseråpning av svensk original-PDF

- Spørsmål: A3-Q5.
- Endepunkt: samme offisielle Livsmedelsverket-PDF som A3-L004.
- Resultat/tilgangsproblem: Nettleseråpning ga HTTP 403 i denne runden. `curl` mot samme offentlige URL lykkes og PDF-en ble lest/hashet privat som A3-S013.
- Videre handling: Kilden er fortsatt brukt som fulltekstlest original; 403 er bare registrert som nettleser-/tilgangsproblem.

## Status for søkeomfang

- A3-Q1: funn fra SIFO-instrumentet, med gap for full item-/vektingstabell.
- A3-Q2: bølge-N og figurverdier er hentet; delgruppe-N og full usikkerhet mangler.
- A3-Q3: SIFO, Finland ISSP og SIFO-begrensninger gir funn; representativitet og robust undergruppeanalyse er gap.
- A3-Q4: FAO/FIES-kataloger og FAOSTAT er åpnet; punktestimat, faktisk N og country-specific sampling er gap.
- A3-Q5: Fafo, Sverige, Finland-artikkel og Statistics Finland gir separate indikatorer; en harmonisert finsk/nordisk husholdningsserie mangler.
