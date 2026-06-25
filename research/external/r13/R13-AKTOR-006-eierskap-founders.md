---
tittel: R13-AKTOR-006 — Eierskap og founders i sirkulær/altprotein/CEA
dato: 2026-06-25
status: Intern R13-output — PCQ med C-celler
gate: PCQ
---

# R13-AKTOR-006 — Eierskap og founders i sirkulær/altprotein/CEA

| Felt | Svar |
|---|---|
| Kort dom | Brreg Enhetsregisteret og roller-API gir verifiserbar selskapsstruktur, org.nr, registreringsdato, næringskode og roller for utvalgte aktører. Det lukker ikke aksjonærer/founders/kapital fullt ut; aksjonærregister, regnskap og stiftelsesdokumenter må hentes som neste PCQ-steg før founder- eller eierskapsclaim. |
| Sterkeste kilde | Brønnøysundregistrene Enhetsregisteret API og roller-API, besøkt 2026-06-25. |
| Svakeste punkt | Styre/daglig leder er ikke det samme som eiere eller founders; kapital/aksjonærer er C-celler i denne desk-runden. |
| Anbefalt gate | PCQ |

## Funn-tabell

| Selskap | Org.nr | Struktur/rolledata | Registerdato | Kildeklasse | Caveat |
|---|---:|---|---:|---|---|
| AVISOMO AS | 920937659 | Daglig leder Martin Molenaar; styre registrert i roller-API; næringskode FoU naturvitenskap/teknikk. | 2018-06-02 | A | Roller er ikke eierskap/founderfasit. |
| ONNA GREENS AS | 917653135 | Daglig leder Tobias Eckbo Dager; styre registrert; næringskode dyrking av grønnsaker. | 2016-09-02 | A | Eierskap/aksjonærer ikke hentet. |
| INVERTAPRO AS | 917809755 | Daglig leder Alexander Solstad Ringheim; styre registrert; næringskode produksjon av fôrvarer. | 2016-10-06 | A | Founder/aksjonærdata krever aksjonærregister/regnskap. |
| HIMA SEAFOOD AS | 924847190 | Daglig leder Annar Bøhn; styre registrert; næringskode utleie fast eiendom. | 2020-03-27 | A | Må skille holdingselskap/management/produksjonsselskap. |
| HIMA SEAFOOD MANAGEMENT AS | 928734412 | Daglig leder Annar Bøhn; styre registrert; næringskode ferskvannsproduksjon. | 2022-02-14 | A | Struktur, ikke intensjon. |
| HIMA SEAFOOD RJUKAN AS | 915308775 | Daglig leder Simon Nyquist Martinsen; styre registrert; næringskode ferskvannsproduksjon. | 2015-04-30 | A | Kinesisk/norsk eierstruktur må hentes fra aksjonærregister. |
| N2 APPLIED AS | 995723735 | Daglig leder Carl Gunnar Hansson; roller-API viser også bostyrer/konkursrelatert rolle. | 2010-07-28 | A | Må kontrolleres særskilt mot konkurs-/regnskapsstatus før bruk. |

## Tomme celler

- Aksjonærer/eierandeler per selskap og registerdato.
- Founderhistorikk og stiftelsesdokumenter.
- Kapital, emisjoner og konsernstruktur.
- Endringer over tid, inkludert konkurs-/tvangsavviklingsstatus der relevant.
- Kobling fra selskap til sirkulær/altprotein/CEA-kategori med kilde.

## Ikke si

- Ikke si at styreleder eller daglig leder er founder/eier uten egen kilde.
- Ikke gjøre eierskap til intensjon, strategi eller bærekraftsclaim.
- Ikke blande Hima-enheter uten selskapsnivå og org.nr.
- Ikke bruke Brreg-rolledata som aksjonærregister.
- Ikke utelate registerdato når strukturen kan ha endret seg.

## Kilder hentet

| Kilde | URL | Tilgangsdato | Klasse | Bruk |
|---|---|---:|---|---|
| Brreg Enhetsregisteret API | https://data.brreg.no/enhetsregisteret/api/enheter | 2026-06-25 | primary/register | Selskapsnavn, org.nr, form, dato, næringskode. |
| Brreg roller-API eksempel Invertapro | https://data.brreg.no/enhetsregisteret/api/enheter/917809755/roller | 2026-06-25 | primary/register | Rolledata og API-mønster. |
| Brreg roller-API eksempel Avisomo | https://data.brreg.no/enhetsregisteret/api/enheter/920937659/roller | 2026-06-25 | primary/register | Rolledata. |
| Brreg roller-API eksempel ONNA Greens | https://data.brreg.no/enhetsregisteret/api/enheter/917653135/roller | 2026-06-25 | primary/register | Rolledata. |
| Brreg roller-API eksempel Hima Seafood Rjukan | https://data.brreg.no/enhetsregisteret/api/enheter/915308775/roller | 2026-06-25 | primary/register | Rolledata og selskapsnivå. |
