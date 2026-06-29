---
tittel: R12-FARM-001 - N11 bondemargin
status: Batch 01 research-output - delvis kildeankret, ikke claim
id: R12-FARM-001
priority: P0
theme: farm-economy
geo: NO
gate: PCQ
accessedAt: 2026-06-24
sourceClass: A med Type A-uttrekkshull
---

# R12-FARM-001 - N11 bondemargin

## Kort dom

NIBIO/Budsjettnemnda for jordbruket gir offisielt primærgrunnlag for N11/bondemargin gjennom Totalkalkylen, referansebruk og 2026-grunnlagsmaterialet. Det er kildegrunnlag nok til å starte en PCQ-kontrollert marginakse.

Denne batchen fullfører ikke per-produksjonstype skvis. Det må gjøres som tabelluttrekk fra `UT-2-2026 Referansebruksberegninger` og vedlegg/Excel før noe kan bli claim-nært.

## Sterkeste kilde

- NIBIO/BFJ, "Budsjettnemnda for jordbruket", `https://www.nibio.no/tema/landbruksokonomi/budsjettnemnda-for-jordbruket`
- NIBIO, "Totalkalkylen for jordbrukssektoren", `https://www.nibio.no/tema/landbruksokonomi/totalkalkylen`
- NIBIO, "Nye tal frå SSB gav store utslag i årets berekningar for jordbruksoppgjeret", publisert 2026-04-16.
- NIBIO PDF, `UT-2-2026 Referansebruksberegninger.pdf`.
- NIBIO PDF, `UT-2-2026 Referansebruksberegninger_VEDLEGG.pdf`.
- Landbruks- og matdepartementet, "Grunnlagsmaterialet for jordbruksforhandlingene er klart", 2026-04-16.

## Svakeste punkt

Totalkalkylen og referansebruk er normaliserte/framregnede forhandlingsgrunnlag og ikke faktisk driftsregnskap for hver bonde. De kan brukes til system- og produksjonstypeakse, men ikke som direkte kjøperpris-/per-kg-margin uten aktørdata.

## Funn-tabell

| Funn | Kilde | År/periode | Kildeklasse | Caveat |
|---|---|---|---|---|
| BFJ-materialet består av Totalkalkylen, Referansebruk og Resultatkontrollen. | NIBIO BFJ-side | live 2026 | A | Strukturkilde for hvor N11-data skal hentes. |
| Referansebruk viser inntektsutvikling for ulike produksjoner, størrelser og områder. | NIBIO BFJ-side / Referansebruk-side | live 2026 | A | Representativ modell, ikke faktisk regnskap per bruk. |
| Årsresultat per familieårsverk inkl. jordbruksfradrag: 502 900 kr for 2024, 600 500 kr for 2025, 628 700 kr budsjett 2026. | NIBIO nyhet 2026-04-16 | 2024-2026 | A | Samlet jordbruk/aktive jordbruksbedrifter, ikke produksjonstype. |
| LMD oppgir BFJs beregnede vekst i sammenligningsinntekt: 114 000 kr / 22,8 prosent fra 2024 til 2025 og 6,9 prosent fra 2025 til 2026. | Regjeringen.no 2026-04-16 | 2024-2026 | A | Politisk/forhandlingsgrunnlag, ikke margin per produkt. |
| LMD oppgir anslått differanse til sammenligningsgruppen på vel 63 000 kr i 2026. | Regjeringen.no 2026-04-16 | 2026 | A | Differanse til lønnstakergruppe, ikke produksjonstype. |
| Referansebruksvedlegg finnes med detaljer per referansebruk og variabelnummer, inkludert inntekter, kostnader og resultatregning. | UT-2-2026 vedlegg | 2024-2026 | A | Krever maskinelt/cellevis uttrekk før claim. |

## Tomme celler

- Per-produksjonstype skvis må trekkes ut fra referansebrukene, minst for melk, korn, sau, ammeku, svin, egg/fjørfe og grønnsaker.
- Kjøperprisavtaler, bonuser, etterbetaling og per-kg-marginer for kjøtt og meieri er ikke desk-researchbare i denne batchen.
- Variasjon mellom bruk innen samme produksjon må ikke forsvinne i ett gjennomsnittstall.

## Ikke-si

- Ikke si at Totalkalkylen er faktisk driftsregnskap for enkeltbønder.
- Ikke si at samlet årsresultat beviser margin per produksjonstype.
- Ikke si per-kg-margin uten kjøperpris- eller aktørdata.
- Ikke bruk positiv inntektsvekst til å avvise kostnads-/investeringsskvis uten å vise kostnadssiden.
- Ikke gjør forhandlingsgrunnlag til ekstern claim uten PCQ.

## Anbefalt gate

PCQ med importbeslutning `vent`. Kildene er gode nok til å etablere N11 som analyseakse, men per-produksjonstype marginpress må kjøres som egen tabelluttrekksrunde fra `UT-2-2026` før claim-lock.
