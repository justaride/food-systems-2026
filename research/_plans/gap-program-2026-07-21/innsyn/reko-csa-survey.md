# REKO / CSA — aktivitetssurvey + årsmeldingsuttrekk (T7)

**Dato:** 2026-07-21
**Gap:** T7 / R13-AKTOR-003/008. Nyeste verifiserbare REKO-tall er **2022**; ingen 2026-produsent-/kunde-/omsetningstall. CSA (andelslandbruk) mangler aktiv-telling. Dette blokkerer ethvert utsagn om at lokale kjeder «vokser» eller «tar andeler».
**To-trinns metode (Type A → B):** (1) billig desk research fra årsmeldinger; (2) liten survey til ringadministratorer for det årsmeldingene ikke dekker.
**Status:** Metode- og spørsmålsutkast, **ikke utsendingsklart**. Trinn 1 er ikke
gjennomført. Surveyen mangler bekreftet behandlingsansvarlig, kontaktpunkt,
formål/lagring/sletting, mottakere/databehandlere, samtykkeløsning,
rekrutteringsliste og minstegrense for rapportering. Navn på ordning + kommune
kan identifisere respondent/ring også når navn ikke publiseres.

---

## Trinn 1 — Årsmeldingsuttrekk (Type A, gjør først)

Hent fra åpne årsmeldinger, per organisasjon, med kilde og år:

| Organisasjon | Datapunkt å hente | Kilde |
|---|---|---|
| REKO-ring Norge | antall aktive ringer 2025/26, geografisk fordeling | årsmelding/Facebook-oversikt |
| Bondens marked Norge | antall markeder, produsenter, omsetning | årsmelding |
| Økologisk Norge | CSA-/andelslandbruk-oversikt, aktive lag | årsmelding |
| Norsk Landbruksrådgiving | evt. produsenttall lokalmat | publikasjoner |

Marker eksplisitt hvilket år hvert tall gjelder — poenget er å komme forbi 2022-baseline.

---

## Trinn 2 — Survey til ringadministratorer (Type B)

Kort, 6 spørsmål, sendes til administratorer for REKO-ringer og andelslandbruk. Digitalt skjema.

> **Aktivitetskartlegging: REKO-ringer og andelslandbruk 2026 — intern skjemamal**
> *Food Systems Transition Group (Natural State / Nordic Circular Hotspot). Før
> publisering av skjemaet skal godkjent personverninformasjon, samtykkevalg,
> kontaktpunkt og lagrings-/slettefrist settes inn her.*
>
> 1. Hva slags ordning administrerer du? (REKO-ring / andelslandbruk-CSA / bondens marked / annet)
> 2. Er ordningen **aktiv i 2026**? (ja, fast / ja, sesong / pause / avviklet)
> 3. Omtrent hvor mange **produsenter** deltar nå? (1–5 / 6–15 / 16–30 / 30+)
> 4. Omtrent hvor mange **kunder/medlemmer** er aktive? (<50 / 50–200 / 200–500 / 500+)
> 5. Hvordan har aktiviteten endret seg siste to år? (vokst / stabil / krympet / nystartet)
> 6. Hva er den største hindringen for drift akkurat nå? (fritekst)
>
> Valgfritt: navn på ordning + kommune (for å unngå dobbelttelling). Kontakt for oppfølging: [e-post].

---

## Import og claim-grense

- Årsmeldingstall → `provenanceType = external_report`, med år.
- Surveysvar → `provenanceType = own_survey`, aggregert; **ingen** enkelt-ring navngis uten samtykke.
- «Anonymisert» brukes bare når re-identifisering faktisk er forhindret;
  ellers beskrives materialet som pseudonymisert/aggregert med fastsatt
  minstegrense for rapportering.
- Claim-grense: survey gir *aktivitetsindikasjon og retning*, ikke presis omsetning. «Aktiv 2026»-andelen kan rapporteres; eksakte omsetningstall kan ikke låses fra dette.
- Kanalfordeling (markedsandel per kanal — R13-AKTOR-008) løses **ikke** her; det krever kjøpt handelsdata eller NIBIO-samarbeid (T16, H2). Survey-en reduserer hullet fra «vet ingenting om aktivitet» til «vet retning og grov størrelse».

## Sjekkliste

- [ ] Trinn 1: hent årsmeldingstall (1 økt).
- [ ] Fastsett behandlingsansvarlig, informasjon/samtykke, lagring/sletting og rapporteringsgrense.
- [ ] Bygg surveyskjema (digitalt).
- [ ] Samle administratorkontakter (fra eksisterende REKO-/CSA-lokator i basen).
- [ ] Send + én påminnelse.
- [ ] Aggreger → mottakslogg → base med `own_survey`-proveniens.
