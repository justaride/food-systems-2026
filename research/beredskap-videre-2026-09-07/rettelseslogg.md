# Rettelseslogg – beredskapsgrunnlag

Dato: 2026-09-07. Status: interne redaksjonelle rettelser; ingen human_verified eller kanonisk godkjenning.

Originale inputversjoner er hashfestet i [input-manifest.json](input-manifest.json). Rapporten [kunnskapsgrunnlag](../../docs/project/analysis/matsikkerhet-beredskap-kunnskapsgrunnlag-2026-09-07.md) forklarer kilde- og metodegrensen. «Lukket i arbeidsdokument» betyr ikke at database og publiserte visninger er oppdatert.

## QA-01

- **Opprinnelig problem:** Fravær i kildeutvalg ble tolket som målegap.
- **Utført:** Kilde-/tilgangsgap og sammenligningsgrense presisert.
- **Berørt:** INNSIKT-SPOR/ANALYSE-beredskap_import.md; INNSIKT-SPOR/SYNTESE.md; gapstudie MD/HTML.
- **Belegg/lokator:** Nyeste syntese v2 §11; dataklassifisering.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** Matsystem-snitt og kanoniske visninger må følges opp ved data-/kodeinnføring.

## QA-02

- **Opprinnelig problem:** Augustrettelser manglet i septemberstudien.
- **Utført:** Augustmatrisen avstemt; historiske E1–E3 merket med etterkontroll.
- **Berørt:** Primærkildematrisen; gapstudie; analyse; SYNTESE.
- **Belegg/lokator:** Landmetodekort og fersk hovedgren.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** Historiske ordlyder bevart som historikk, ikke aktuell fasit.

## QA-03

- **Opprinnelig problem:** Norsk offentlig lagerdata var for svakt fremstilt.
- **Utført:** Mål, kontrakter og historisk innlagring skilt; årsrapport2025 lagt til.
- **Berørt:** Analyse; gapstudie; landkort.
- **Belegg/lokator:** NO-S11; QA-S03; QA-S04.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** Disponibel beholdning nå og foredling under sjokk ikke kjent.

## QA-04

- **Opprinnelig problem:** FI plan, resultat og rettslig nivå ble blandet.
- **Utført:** 6/8,5/9 skilt med dato og dokumenttype.
- **Berørt:** Analyse; SYNTESE; gapstudie; landkort; matrise.
- **Belegg/lokator:** FI-S01; FI-S02; FI-S03; QA-S05.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** Nåværende fysisk reserve og uttaks-/kapasitetsdata mangler.

## QA-05

- **Opprinnelig problem:** Svensk 2024-status ble brukt som nåstatus.
- **Utført:** 2026-ordning og statlig roterende vare skilt fra historisk utredning.
- **Berørt:** Analyse; SYNTESE; gapstudie; landkort.
- **Belegg/lokator:** SE-S01.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** Fullt nasjonalt innlagret volum ikke dokumentert.

## QA-06

- **Opprinnelig problem:** 39 prosent var feilaktig kalt dekningsgrad.
- **Utført:** Indikatornavn, fiskescope og fôrkorreksjon rettet;45 merket estimat.
- **Berørt:** Analyse; nordisk inngangsnotat; landkort.
- **Belegg/lokator:** QA-S07, Meld. St.11 §§2.1.2–2.2.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** Ingen harmonisering mot senere reviderte serier.

## QA-07

- **Opprinnelig problem:** Islandske mediekilder ble oppgradert til primærbevis.
- **Utført:** Mediehendelse nedgradert; LBHI2021, LBHI2024 og HI2025 skilt.
- **Berørt:** Analyse; gapstudie; metode-og-island.
- **Belegg/lokator:** iceland-althingi-1505-2025-2026; iceland-lbhi-139-2021; iceland-ruv-mill-2025.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** HI2025fulltekst og primær driftsstatus mangler;LBHI2021arkiv ustabilt.

## QA-08

- **Opprinnelig problem:** Nordisk tabell hadde blankettsmerket Validert.
- **Utført:** Ubegrunnet rangering fjernet fra aktivt inngangsnotat.
- **Berørt:** research/norden/nordisk-selvforsyning-beredskap-2026.md; gapstudie.
- **Belegg/lokator:** Femlandskort og registrerte primærkilder.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** Felles sammenlignbar metode er ikke oppnådd.

## QA-09

- **Opprinnelig problem:** Eksisterende resiliensakse ble oversett.
- **Utført:** Kvalitativ dimensjon skilt fra målt, scenariobasert effekt; ubegrunnede presentasjonsmålere fjernet.
- **Berørt:** Samtaleanalyse §9; gapstudie MD/HTML.
- **Belegg/lokator:** src/lib/data/circular-leverage.ts; src/components/charts/EffektTab.tsx.
- **Status:** Rettet eller eksplisitt nedgradert i arbeidsdokumentene.
- **Gjenstår:** Ingen effektmodell, kode eller produksjonsplattform validert.

## Kontroll av de nye leveransene

Hovedgjennomgangen avviste og rettet en gjentakelse av 39-prosentfeilen, feilblanding av trykte sidetall og PDF-sider, en tom EU-katalogkopi, overføring av tørket prøveprofil til våt sidestrøm og kildehenvisninger uten spor i register. Tørrstoffregneenheten er kun illustrasjon. Source IDs er lokale til hvert register; S1–S8 tilhører forcase-sources.json.

Nye råkopier ligger utenfor Git. Avvist/tom kildefangst får ingen gyldig hash. Lokal maskinlesbar kontroll finnes i [validation.json](validation.json). Ingen påstand er merket menneskeverifisert.
