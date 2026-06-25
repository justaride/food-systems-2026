---
id: R13-LAND-006
tittel: Figurkandidater og visualiseringsstopper
dato: 2026-06-25
gate: internal
status: mottaksført
lagre_output: docs/project/mandates/R13-LAND-006-figurkandidater.md
bruksregel: Intern figurkø. Ingen figur skal lages før gate, kildeklasse, metode, tomme celler og "ikke si" er synlig.
---

# R13-LAND-006 - figurkandidater

## Kort dom

R13 gir flere mulige figurkandidater, men nesten alle må vente. De tryggeste neste figurene er ikke "store fortellinger", men små kontrollfigurer der metode, scope og tomme celler vises i selve figuren.

## Figurkø

| Figuridé | Kan vurderes etter | Må vise | Stoppregel |
|---|---|---|---|
| Importnode-tabell per HS-kode | PCQ av SSB/HS-rader | Varekode, år, foreløpig/endelig status, sluttbruksgap. | Ikke kall importvolum kritisk uten sluttbruk/proxy. |
| Marint restråstoff R-stige | PCQ av SINTEF/FHF-rader | Fraksjon, enhet, metode, faktisk bruk vs potensial. | Ikke bland dagens bruk og potensiell bruk. |
| Matsvinn baseline per sektor | PCQ av Matvett/NORSUS-rader | Sektor, år, metode, usikkerhet. | Ikke sammenlign sektorer uten metodeforskjell. |
| Protein/fôr modenhetsmatrise | Source-shortlist + PCQ | Teknologi, status, kapasitet vs realisert volum, regulatorisk status. | Ikke vis planlagt kapasitet som produksjon. |
| Aktørregister-dekning | Actor-gate etter aktiv-statuskontroll | Kilde per node, aktiv-verifisert, ubekreftet, kandidat. | Ikke tegn produsentkart fra plattformtreff alene. |
| Økoareal og policy-mål | PCQ av SSB/Debio/LMD | Sertifisert vs karens, målår, definisjon. | Ikke bland omsetning, areal og produksjon. |
| Biodiversitetsproxyer | Source-shortlist + metodekort | Proxytype, habitat/scope, indikatorår, kilde. | Ikke gjør proxy til kausal driftsclaim. |
| Makt-/eierstruktur | PCQ + Brreg/shareholder locators | Dato, prosent, ledd, juridisk enhet, tomme celler. | Ikke vis eierstruktur som intensjon eller kartell. |
| Nettverksrelasjoner | Source-shortlist + actor-gate | Relasjonstype, kilde, dato, aktiv-status. | Ikke gjør event/samvær til formelt partnerskap. |
| Datagap-atlas | Etter intern metodegjennomgang | Type A/B/C, hvorfor gapet finnes, neste handling. | Ikke visualiser datagap som fravær av aktivitet. |

## Minimumskrav før en figur åpnes

| Krav | Forklaring |
|---|---|
| Gate | PCQ, source-shortlist, actor-gate, forståelse, internal eller parkert må stå i figuren. |
| Kildeklasse | A/B/C per rad eller markør. |
| Metode | Enhet, nevner, år, scope og foreløpig/endelig status. |
| Tomme celler | Hva som mangler må være synlig, ikke bare i fotnote. |
| Ikke si | Overclaim-stopper må være omsatt til tekst/legend/etikett. |
| Tolkning | Figurtekst må beskrive hva figuren kan og ikke kan bære. |

## Prioriterte ikke-figurer

Følgende bør forbli tabeller eller kontrollkort inntil videre:

- Founders/eierskap for altprotein/CEA uten aksjonærregister.
- Regenerative praktikere uten aktiv-status per gård.
- Økologiske/regenerative effekter uten baseline/resultatdata.
- Grossist-/franchisevilkår uten kontrakts- eller aktørdata.
- Sidestrømmer uten faktisk behandlings- og dobbelttellingskontroll.

## Ikke si

- Ikke si at en figur er trygg fordi den er pen.
- Ikke si at en radar, rangering eller spider chart er nøytral når inputgatene er blandet.
- Ikke skjul C-hull i fotnote.
- Ikke bruk forståelsesnotater som datakilde.
- Ikke lag whitepaper-/deckstemme fra denne køen.

## Anbefalt gate

`internal`. Dette er en figurkø og stoppliste, ikke visualiseringsgrunnlag.
