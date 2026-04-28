---
tittel: Mini-verifikasjon 2B/2D recovery
status: Utført internt
eier: Master recovery
dato: 2026-04-28
neste_handling: Integrer kun rader merket `integrer nå`; øvrige går til actor validation pack eller primary-check queue.
---

# Mini-verifikasjon 2B/2D recovery

Kontroll av recovery-handoffene:

- `2026-04-28-worker-2b-importdata-recovery.md`
- `2026-04-28-worker-2d-prosess-sidestroemmer-recovery.md`

Regler brukt i kontrollen:

- Ingen funn er eksternvalidert av aktør; status i claim-register skal fortsatt være `Utført internt`.
- L4/Perplexity/forskningsrunde kan bare brukes som kildejakt/hypotese.
- Juridiske/regulatoriske funn må ha primærkilde eller stå som `needs-primary-check`.
- Tall må ha definisjon, år, geografi, enhet og kilde.

## 2B importdata - klassifisering

| Funn | Foreslått SRC/EV/CL | Kvalitetssjekk | Klassifisering | Master-beslutning |
|---|---|---|---|---|
| Denofa importerer ca. 450 000 tonn soyabønner årlig til Fredrikstad og beskriver opprinnelse/foredling. | SRC-A-013 / EV-A-017 / CL-A-020, CL-C-011 | Aktør-primærkilde, men ikke offisiell norsk totalstatistikk. Tall har geografi, enhet og kilde; år er nettsidestatus/årlig. | integrer nå | Integrer som actor-tall med tydelig forbehold. |
| Fiskeridirektoratet `Nøkkeltall 2024`, tabell 43: omsetning av fôr i oppdrettsnæringen 2020-2024. | SRC-A-014 / EV-A-018 / CL-A-020 | Institusjonskilde med tabell/sidetall og full tallserie. Definisjon er oppdrettsfôr, ikke bare laksefôr. | integrer nå | Integrer som norsk oppdrettsfôr-baseline. |
| Skretting Norway 2024: SPC, vegetabilske/marine råvarer og sertifisering i eget fôr. | SRC-A-015 / EV-A-019 / CL-A-020, CL-C-011 | Aktør-primærkilde, år/geografi/enhet tydelig, men bare Skretting Norge. | integrer nå | Integrer som actor-data; ikke bruk som bransjeproxy. |
| EUMOFA 2025 fiskemel/fiskeolje: global/EU produksjon og akvakulturbruk. | SRC-A-016 / EV-A-020 / CL-A-020 | EU/sekundær-offentlig fagrapport med side/kapittel; gir ikke norsk importserie. | integrer nå | Integrer som global/EU kontekst. |
| EUDR dekker soya og gjør fôrimport til due diligence-/sporbarhetsspørsmål; EU-frister 30.12.2026 og 30.06.2027. | SRC-C-018 / EV-C-017 / CL-C-011 | EU-kommisjonen er primærkilde for EU-frister og råvarescope. Norsk/EØS-innlemmelse er komplisert og må ikke forenkles. | integrer nå for EU; needs-primary-check for Norge | Integrer EU-kontekst; norsk praktisk scope går til queue. |
| Norsk total soyaimport 550-600 000 tonn/år fra L4-notat. | ingen | Ikke låst til SSB/HS med år/geografi/enhet. | archive/reject | Ikke integrer. |
| Fordeling av norsk soya mellom Skretting, Cargill, Felleskjøpet eller andre kjøpere. | ingen | Mangler actor-/bransjedata. | needs-actor-validation | Legg i actor validation pack, ikke canonical claim. |
| Soyamel/SPC/kraftfôr per varekode og sluttbruk i Norge. | mulig senere EV | Må sjekkes mot SSB/HS, Animalia/Felleskjøpet/fôraktører. | needs-primary-check | Legg i primary-check queue. |

## 2D prosess-sidestrømmer - klassifisering

| Funn | Foreslått SRC/EV/CL | Kvalitetssjekk | Klassifisering | Master-beslutning |
|---|---|---|---|---|
| Axfoundation/Over & Oat: ca. 0,2 liter okara per liter havredrikk og ca. 25 000 tonn okara/år i Sverige. | SRC-B-024 / EV-B-018 / CL-B-014, CL-B-021, CL-B-009 | Aktør-/prosjektkilde med tydelig geografi, enhet og kilde. År er nettsidestatus, ikke årlig statistikk. | integrer nå | Integrer som svensk benchmark og prosjektcase, ikke nordisk total. |
| Chalmers Industriteknik: ca. 0,2 kg okara per kg havredrikk, prosjektpartnere, finansiering og 2023-2026 prosjektperiode. | SRC-B-025 / EV-B-018 / CL-B-014, CL-B-021 | Prosjekt-/forskningskilde med partner- og prosjektperiode. | integrer nå | Integrer sammen med Axfoundation i EV-B-018. |
| RISE/Brewed & Renewed: ca. 180 g bryggerimask per liter øl, ca. 80 000 tonn/år i Sverige, 70-80 % fukt og mikrobiell risiko. | SRC-B-026 / EV-B-019 / CL-B-014, CL-B-021, CL-B-009 | Institutt-/prosjektkilde med svensk tall og klare barrierer. Ikke norsk/nordisk total. | integrer nå | Integrer som svensk benchmark og candidate stream. |
| SINTEF `Analyse marint restråstoff 2024`: ca. 1,1 mill. tonn oppstått, 976 000 tonn utnyttet, 118 000 tonn uutnyttet i Norge. | SRC-B-027 / EV-B-020 / CL-B-009, CL-B-021 | Institutt-/forskningsrapport med år, geografi, enhet og kilde. | integrer nå | Integrer som norsk sjømatrestråstoff-benchmark. |
| Nordisk okara-total 100 000-400 000 tonn eller 50 000-60 000 tonn fra L4/Perplexity. | ingen | Ikke primærkilde; konflikt med prosjektkilder og mangler definisjon. | archive/reject | Ikke integrer. |
| Okara direkte pilotklar som B1 uten produsentdata. | ingen | Mangler lokal aktør, volum, kvalitet, hygiene, holdbarhet, kjøper og logistikk. | needs-actor-validation | Behold CL-B-021 med lav konfidens og actor gate. |
| Plantebaserte sidestrømmer utover okara, for eksempel potetskrell, eplepressrest, kaffegrut. | ingen | Prosjekt-/aktørdata ikke låst i recovery. | needs-primary-check | Legg i queue eller senere kildejakt; ikke integrer som claim nå. |
| Sjømatrestråstoff som første ren plantebasert prosesspilot. | ingen | Feil kategorisering. Sjømat er relevant B-benchmark, men ikke plantebasert batchstrøm. | archive/reject som formulert | Bruk som eget sjømat-/høyverdispor, ikke okara/BSG-substitutt. |

## Rader som kan gå til canonical nå

| Canonical mål | Nye ID-er | Vilkår |
|---|---|---|
| Source shortlist | SRC-A-013 til SRC-A-016, SRC-C-018, SRC-B-024 til SRC-B-027 | Legg inn kilde og forbehold i manuell-sjekk-tabellen. |
| Evidence matrix | EV-A-017 til EV-A-020, EV-C-017, EV-B-018 til EV-B-020 | Hovedfunn skal skille actor-tall, svensk benchmark, norsk benchmark og global/EU kontekst. |
| Claim register | CL-A-020, CL-C-011, CL-B-014, CL-B-021, CL-B-009, CL-C-015 | Bare evidenslenker og presiseringer; status forblir `Utført internt`. |
| Track briefs | A, B, C | Bare oppdatere `Hva vi vet`, aktører, barrierer og valideringsgate; ikke endre til ekstern validering. |

## Primary-check queue fra mini-verifikasjon

| Queue-tema | Hvorfor |
|---|---|
| SSB/HS-serie for soyabønner, soyamel/oljekake, soyaolje og SPC 2020-2025 | Trengs før total norsk importclaim. |
| Norsk/EØS EUDR-scope for soya og fôrimport | Juridisk/regulatorisk funn må primærkildesjekkes. |
| Fôraktørdata fra Skretting, BioMar, Cargill, Mowi og Sjømat Norge | Trengs før bransjeproxy eller kjøperfordeling. |
| Norsk/nordisk fiskemelimport og faktisk fôrbruk | EUMOFA gir global/EU kontekst, ikke norsk aktørserie. |
| Okara-volum per nordisk produsent/anlegg | Svensk benchmark er ikke nordisk total. |
| Bryggerimaskvolum per norsk/nordisk bryggeri og matgrade-status | RISE gir svensk benchmark, ikke norsk pilotvolum. |
| Mattilsynet-/Novel Food-/hygienevurdering for okara, fermentert okara og bryggerimask | Må avklare lovlig sluttbruk og dokumentasjonskrav. |
| SINTEF/FHF/aktørdata for hvilke marine restfraksjoner kan gå til humant konsum/høyverdi | SINTEF total er sterk, men pilotvalg krever fraksjonsdata. |
