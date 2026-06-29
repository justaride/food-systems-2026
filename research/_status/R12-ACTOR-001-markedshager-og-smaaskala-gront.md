---
tittel: R12-ACTOR-001 - Markedshager og småskala grønt
status: Batch 04 research-output - kandidatkart, ikke claim
id: R12-ACTOR-001
priority: P0
theme: actor-map
geo: NO
gate: actor-gate
accessedAt: 2026-06-24
sourceClass: A/B med Type B-hull
---

# R12-ACTOR-001 - Markedshager og småskala grønt

## Kort dom

Markedshager og småskala grøntprodusenter kan utvides som et kandidatkart, men ikke som en komplett nasjonal produsentliste. Markedshager Norge gir et offentlig kart- og regioninngangspunkt, Småskala Grønt Norge er etablert som ny nasjonal produsentorganisasjon, og nyere Landbruksdirektoratet-/NIBIO-/NLR-kilder viser at feltet er i vekst og sterkt knyttet til direktesalg.

Dette bør importeres som actor-gate-underlag: nettverk, regionnoder og kandidatprodusenter kan registreres, men hver produsentrad må ha egen primærlokator før den brukes som aktørfakta.

## Sterkeste kilde

- Markedshager Norge, "Finn markedshager", med fylkes-/regionsinnganger og kart.
- Markedshager Norge, "Veileder kart", som avgrenser kartet til seriøse markedshageaktører med småskala grøntproduksjon for salg.
- Landbruksdirektoratet, "Produksjon av økologiske jordbruksvarer 2025", kap. 6.3.2 om markedshager og STYRK-undersøkelsen.
- NLR, "Grupperåd Markedshage i Gudbrandsdalen", 2025, som gir konkrete Innlandet-kandidatspor.

## Svakeste punkt

Kart og nettverk bekrefter feltet, men ikke en komplett, deduplisert nasjonal produsentliste. Mange rader er kandidat- eller nettverksnoder, og produksjonsstatus, omsetning, areal, sertifisering og salgskanal må bekreftes per aktør.

## Kandidat-CSV

```csv
candidate_id,navn,type,geo,locator,kildeklasse,status,caveat,neste_gate
ACTOR001-001,Markedshager Norge,nettverk/kart,Norge,https://www.markedshage.no/markedshager-i-fylkene/,A,kildeanker,"Kart/regioninngang; ikke komplett produsentregister uten uttrekk.",actor-gate
ACTOR001-002,Småskala Grønt Norge,organisasjon,Norge,https://www.markedshage.no/nb/nyheter/2026/06/smaskala-gront-norge-har-apnet-for-innmelding/,A,kildeanker,"Ny organisasjon for grønt/frukt/urter/bær/blomster; medlemstall ikke åpnet i kilden.",actor-gate
ACTOR001-003,Markedshager Norge kartpunkt,produsentkandidat,Norge,https://www.markedshage.no/skjulte-sider/veileder-kart/,A/B,kandidat,"Kartpunkt er for aktører som produserer for salg; hver aktør må verifiseres separat.",actor-gate
ACTOR001-004,Innlandet småskala grønt og markedshagesatsing,regional hub,Innlandet,https://www.statsforvalteren.no/innlandet/landbruk-og-mat/landbruk-og-mat---nyheter/2025/10/satsing-pa-smaskala-gronnsaksproduksjon-og-markedshager-i-innlandet/,A,kandidatregion,"Statsforvalteren oppgir trolig rundt 40 produsenter i Innlandet; ikke navneliste.",actor-gate
ACTOR001-005,Avdem gardsgrønt / Sofia Bang Elm,produsentkandidat,Lesja/Innlandet,https://www.nlr.no/nyhetsarkiv/default/2025/grupperad-markedshage-i-gudbrandsdalen,B,kandidat,"Nevnt via NLR som prosjekt-/faggruppenode; primær bedriftslokator må hentes før import.",actor-gate
ACTOR001-006,Rønnaug Stjernvang markedshage,produsentkandidat,Vågå/Innlandet,https://www.nlr.no/nyhetsarkiv/default/2025/grupperad-markedshage-i-gudbrandsdalen,B,kandidat,"NLR beskriver drift/salgskanaler; primær bedriftslokator må hentes før import.",actor-gate
ACTOR001-007,NLR Øko-grupperåd markedshage,rådgivningsnode,Innlandet,https://www.nlr.no/nyhetsarkiv/default/2025/grupperad-markedshage-i-gudbrandsdalen,A/B,kildeanker,"Rådgivnings-/faggruppe, ikke produsent.",actor-gate
ACTOR001-008,STYRK / markedshageundersøkelse,datakilde,Norge,https://www.agropub.no/uploads/images/4620-2.pdf,A/B,kildeanker,"Undersøkelsesdata, ikke åpent aktørregister; kan gi metode og segmenter.",PCQ
```

## Funn-tabell

| Indikator/aktør | År/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---|---|---|---|
| Nasjonal kartinngang for markedshager | 2026-sjekk | Markedshager Norge / kart og fylkeslenker | A | Kildeanker | Google-kart/regionsider må trekkes ut og dedupliseres før aktørimport. |
| Kartets avgrensning | Ikke datert tydelig, side tilgjengelig | Markedshager Norge veileder kart | A | Definisjonsanker | Avgrenser til salg/seriøse aktører, men er ikke sertifiseringsbevis. |
| Ny produsentorganisasjon | Stiftet/åpnet 2026-kilde, stiftelsesmøte 2026-03-25 | Småskala Grønt Norge | A | Organisasjonsnode | Medlemsliste og dekningsgrad er ikke åpen. |
| Innlandet regionestimat | 2025 | Statsforvalteren i Innlandet | A/B | Kandidatregion | "Trolig rundt 40" er regionalt anslag, ikke nasjonalt tall. |
| Markedshage/STYRK-populasjon | 2025-rapport, prosjekt 2023-2026 | Landbruksdirektoratet/AgriAnalyse/Telemarksforskning | A/B | Metode-/surveyanker | Om lag 450 kontaktet og 170 svar er surveygrunnlag, ikke registertotal. |
| Direkte salgskanaler | 2025 | Landbruksdirektoratet og NLR | A/B | Struktur | Gårdssalg, REKO, torg/marked/restauranter må merkes som salgskanal, ikke volum. |

## Tomme celler

- Komplett nasjonal produsentliste med navn, org.nr., kommune og aktiv status er ikke funnet i åpen primærkilde.
- Markedshager Norge-kart må trekkes ut teknisk og kontrolleres mot aktørenes egne sider før radimport.
- Småskala Grønt Norge-medlemstall og medlemsliste er ikke offentlig i denne runden.
- Produksjonsvolum, areal, omsetning og økologisk sertifisering mangler per kandidat.
- REKO-/gårdssalg-/restaurantandel per produsent er ikke nasjonalt målt.

## Ikke-si

- Ikke si at kandidat-CSV-en er en komplett nasjonal liste over markedshager.
- Ikke si at kartpunkt beviser aktiv drift i 2026 uten aktørens egen primærlokator.
- Ikke bruk Innlandet-anslaget som nasjonalt estimat.
- Ikke si at småskala grønt = regenerativt eller permakultur uten metode-/praksisbelegg.
- Ikke bland nettverk, rådgivere og produsenter som samme aktørtype.

## Anbefalt gate

Actor-gate. Importer nettverks- og regionnoder som kildeankre, men krev primærlokator per produsent før produsentlisten løftes til source-shortlist eller claim-lock-kandidat.

