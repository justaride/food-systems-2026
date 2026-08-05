# Mission 1 — klargjøringsstatus før utsending

**Dato:** 2026-08-05
**Status:** Gjennomgang av eksisterende pakke. INGENTING er sendt; pakken er **ikke utsendingsklar**.
**Pakke:** `research/_plans/gap-program-2026-07-21/prosess/mission-1-intervjupakke.md` (datert 2026-07-21, «Beslutningsklart utkast, ikke utsendingsklart»). Status bekreftet av `docs/project/STATUS-2026-08-05.md` punkt 5: «pakken er ferdig, ikke utsendt; ledetid 2–3 uker; blokkerer hvitbok-kvalitet».

## 1. Hva som finnes i pakken (verifisert)

| Komponent | Sted i pakken | Status |
|---|---|---|
| Utvalgsdesign: 5 roller (leverandør dagligvare, primærprodusent, uavhengig grossist, kommunal innkjøper, alt-protein-gründer) + 2 reserver | §1 | Ferdig — **ingen navngitte kandidater valgt** |
| Booking-epost (norsk mal) | §2 | Ferdig som mal — har klammeparenteser og personvern-avhengige løfter |
| Samtykke-/bruksrettsskjema | §3 | Kun **innholdsstruktur** — eksplisitt «ikke et godkjent samtykkeskjema» |
| Intervjuguide, 15 spørsmål, semistrukturert | §4 | Ferdig |
| Pipeline opptak → transkript → sitatuttrekk → godkjenning → import med `provenanceType = own_interview` | §5 | Ferdig som design — ikke testet |
| Sjekkliste (Bølge 0) | §6 | Alle 9 punkter **ukrysset** |

Pakken dekker med andre ord innholdet (epostmal, samtykkestruktur, guide). Det er **ikke nødvendig å lage ny kontaktepost eller nytt samtykkedokument fra bunnen** — malene i §2 og §3 brukes som de er. Det som gjenstår, er beslutninger og ferdigstilling, ikke nytt innhold.

## 2. Gjenstående før utsending — nøyaktig liste

Gruppert etter pakkens egen sjekkliste (§6) og stopplinje:

**Personvern (blokkerer alt — pakken krever «kvalifisert personvernlesning»):**
1. Bekreft behandlingsansvarlig juridisk enhet, org.nr. og kontaktpunkt (pakkens §3 har [————]-felt).
2. Dokumenter formål per behandling, datatyper (kontaktdata, lydopptak, transkript, sitatuttrekk), lagrings-/slettefrister per datatype, databehandlere og eventuell tredjelandsoverføring.
3. Få samtykke- og informasjonsteksten (§3) kontrollert av kvalifisert personvernressurs; bekreft behandlingsgrunnlag (utkastet antar samtykke, GDPR art. 6(1)(a)).
4. Lag samtykkeskjemaet som PDF klart til utsending.

**Mottakere:**
5. Velg 5 navngitte kandidater (én per rolle i §1) og innhent kontaktinfo. Ingen kandidatliste finnes i pakken eller i statusdokumentene — dette er eiers avgjørelse.
6. Personaliser booking-eposten (§2) per kandidat: fyll inn [Navn], rolle-spesifikk formulering, [telefon]/[e-post], og legg ved/lenk til godkjent personverninformasjon.

**Verifisering av løftene i eposten:**
7. Kontroller at avsender faktisk kan holde det eposten lover: sitatgodkjenning før publisering, sletting av opptak etter transkripsjon, tilbaketrekking like enkelt som samtykke. Pakken krever dette eksplisitt før utsending.

**Logistikk:**
8. Kalender klar for booking straks svar kommer (ledetid 2–3 uker er allerede flagget som kritisk for hvitboken).
9. Test opptaksverktøy + transkripsjonsflyt (`import-transcripts.ts`-mønsteret) på ett prøveintervju.
10. Lag sitat-godkjenningsmal (tilbakesending av ordrette sitater per e-post/skjema, jf. §5) — ikke utarbeidet i pakken.

**Gate:**
11. Eiers eksplisitte godkjenning av ekstern utsending. Først deretter sendes epostene individuelt, og dato/mottaker logges.

## 3. Beslutningspunkter for eier (oppsummert)

- **D1 — Behandlingsansvarlig:** Natural State AS? (samsvarer med avsender-antakelsen i innsynsbrevene; samme beslutning bør tas én gang for hele fase 2.)
- **D2 — Personvernressurs:** hvem gjør den kvalifiserte lesningen av §3-teksten, og når? Uten denne er samtykket ugyldig i pakkens egen vurdering.
- **D3 — Kandidatliste:** 5 navn per rolle, med kontaktinfo. Bør velges slik at ingen har åpenbar interessekonflikt med prosjektet (jf. stopplinjen om at kun samtykket primærmateriale får `own_interview`-tag).
- **D4 — Publiseringsgrense:** hvor detaljert kan roller angis før indirekte identifisering blir et problem (f.eks. «uavhengig grossist» i et lite marked)? Kryssvalgene i §3 må speile reelle anonymiseringsnivåer.
- **D5 — Kanal:** e-post fra hvilken konto/adresse? (Samme avsenderidentitet som innsynsbrevene anbefales.)

## 4. Hva denne mappen *ikke* gjør

Booking-epost og samtykkestruktur er **ikke kopiert hit** — de ligger i pakken og skal redigeres der (én kilde, ikke to). Denne filen er kun status og handlingsliste. Hvis eier vil ha utfylte, personaliserte versjoner per kandidat, skjer det etter at D1–D4 er avgjort.
