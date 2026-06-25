# Food TG R13 Batch 03 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 03.
**Batch:** `R13-WASTE-003`, `R13-WASTE-004`, `R13-WASTE-005`, `R13-WASTE-007`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R13-WASTE-003`, `R13-WASTE-004`, `R13-WASTE-005`, `R13-WASTE-007` |
| actor-gate | 0 | - |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-WASTE-003 | Matsentralen gir B-anker for 5 735 tonn omfordelt i 2024; ikke nasjonal redistribusjonstotal. | Matsentralen, Matvett, Too Good To Go | Ingen metodekonsistent nasjonal sum uten dobbelttelling. | B actor/NGO, C national total | Type B actor; Type C national total | source-shortlist | importer |
| R13-WASTE-004 | Matvett/NORSUS gir baseline, men sektorer og metoder må vises per rad. | Matvett/NORSUS, SSB, SINTEF | Ulike år/metoder; SSB matavfall er ikke lik spiselig matsvinn. | A/B with caveats | Type A/B baseline; Type C harmonization | PCQ | importer |
| R13-WASTE-005 | Sverige er A-anker via SPCR 120; Norge har ikke lukket faktisk NPK-retur. | Avfall Sverige, Biogodsel.se, Energimyndigheten, NIBIO | Produsert, sertifisert og spredd digestat blandes lett. | A for SE, B/C Nordic | Type A SE; Type B/C actual NPK return | PCQ | importer |
| R13-WASTE-007 | Industrielle sidestrømmer kan bli fraksjonsledger, ikke nasjonal volumclaim. | Norsk Dyremat, Animalia, Mattilsynet, Nofima | Volum per fraksjon er ofte actor/case, og dagens bruk er ikke potensial. | B/C per fraction | Type B actor/case; Type C national fractions | source-shortlist | importer |

## Per-target outcome

### R13-WASTE-003 - ENRICH

Output: `research/external/r13/R13-WASTE-003-matsvinn-redistribusjon.md`

Verified source anchors:

- Matsentralen årsrapport 2024: `https://www.matsentralen.no/rapporter/arsrapport-matsentralen-norge`
- Matvett om Matsentralene: `https://www.matvett.no/bransje/aktuelt/matsentralene-har-kapasitet-til-a-ta-i-mot-mye-mer-mat`
- Too Good To Go resources/impact: `https://www.toogoodtogo.com/en-us/resources`

Outcome: Source-shortlist. Matsentralen kan brukes som aktøravgrenset volum, men private/app-kanaler og nasjonal total må til actor-gate/metode.

### R13-WASTE-004 - ENRICH

Output: `research/external/r13/R13-WASTE-004-husholdning-detalj-matsvinn.md`

Verified source anchors:

- Matvett/NORSUS faktaark 2024: `https://www.matvett.no/uploads/documents/Faktaark-om-matsvinn-i-Norge-2024-alle-sektorer.pdf`
- SSB notat 2025/37: `https://www.ssb.no/natur-og-miljo/avfall/artikler/matavfall-og-matsvinnstatistikk/_/attachment/inline/94d9fa84-86a0-4d50-826c-b06eb703ac4b%3A7766af10975a5a29f2454f2bd04dc3a88420b1a5/NOT2025-37.pdf`
- SSB avfall fra hushalda: `https://www.ssb.no/natur-og-miljo/avfall/statistikk/avfall-fra-hushalda`

Outcome: PCQ. Baseline er nyttig, men krever metodekolonner for ar, sektor, definisjon og kildeklasse.

### R13-WASTE-005 - ENRICH

Output: `research/external/r13/R13-WASTE-005-digestat-npk-retur.md`

Verified source anchors:

- Avfall Sverige SPCR 120 2024: `https://www.avfallsverige.se/media/p2akb3gx/a-rsrapport-spcr-120-2024.pdf`
- Biogodsel.se SPCR 120: `https://www.biogodsel.se/certifiering/spcr-120/`
- Energimyndigheten biogas/rotrester: `https://www.energimyndigheten.se/statistik/officiell-energistatistik/tillforsel-och-anvandning/Produktion-av-biogas-och-rotrester/`
- NIBIO biorest: `https://www.nibio.no/tema/jord/organisk-avfall-som-gjodsel/biorest`

Outcome: PCQ. Sverige kan brukes som A-anker; Norge og ovrige nordiske land star med NPK-retur som B/C-metodegap.

### R13-WASTE-007 - ENRICH

Output: `research/external/r13/R13-WASTE-007-industrielle-sidestrommer.md`

Verified source anchors:

- Norsk Dyremat sustainability report 2024: `https://norskdyremat.no/sustainability-report-2024/`
- Animalia spiselige kjottbiprodukter: `https://www.animalia.no/no/samfunn/kjottforbruk/spiselige-kjottbiprodukter/`
- Mattilsynet animaliebiprodukter: `https://www.mattilsynet.no/animaliebiprodukter/veileder-for-animalske-biprodukter`
- Nofima underutnyttede restrastoff: `https://nofima.no/prosjekt/optimal-bruk-av-underutnyttede-marine-rastoff/`

Outcome: Source-shortlist. Fraksjonsledger er styrket, men nasjonale volum og R-stige per fraksjon ma ikke lukkes uten nye data.

## Stop-regler som ble brukt

- Aktorrapportert redistribusjon ble ikke gjort til nasjonal sum.
- Matavfall og spiselig matsvinn ble holdt adskilt.
- Svensk SPCR 120 ble ikke overfort til norsk NPK-retur.
- Industrielle case-/aktørvolum ble ikke gjort til nasjonale fraksjonsvolum.

## Må ikke visualiseres ennå

- `R13-WASTE-003`: ingen nasjonal redistribusjonsgraf uten metode og dobbelttellingskontroll.
- `R13-WASTE-004`: ingen sektorfigur uten år/metode/scope per rad.
- `R13-WASTE-005`: ingen nordisk NPK-rangering eller digestat-returfigur uten faktisk spredd mengde.
- `R13-WASTE-007`: ingen R-stige eller sidestrømsvolum som blander dagens bruk og potensial.
