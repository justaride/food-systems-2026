# Retention- og rettighetsmatrise for parkerte visual-atlas-filer

**Dato:** 2026-08-31<br>
**Status:** Intern beslutningsstøtte, `human_gate`<br>
**Omfang:** 14 parkerte filer fra `codex/visual-system-atlas-v1` ved `d35b2065a3b67785aa53c1bed954649e70baacde`<br>
**Arbeidsgrunnlag:** `main` ved merge-SHA `eb3e68cc5285f9c8f173b0f7fc1998f56691e55f`

Dette dokumentet er en kilde- og risikoklassifisering, ikke juridisk rådgivning eller rettighetsklarering. Ingen fil er slettet, flyttet, publisert eller gitt ny autoritetsstatus. Alle 14 objektene beholder `rightsStatus: human_gate` inntil en navngitt eier har godkjent en konkret disposisjon.

## Beslutningsregler

- Offentlig tilgjengelig betyr ikke automatisk at en komplett nettsidefangst kan redistribueres.
- En lisens for artikkeltekst omfatter ikke nødvendigvis nettstedkode, grafikk, logoer, fotografier eller tredjepartsmateriale.
- Offisielle lover, forskrifter og visse myndighetsdokumenter kan være uten opphavsrettslig vern, men dette gjør ikke hele nettsideinnpakningen fri.
- `retain_recovery_only` betyr at eksisterende Git-historikk bevares som en begrenset recovery-kilde; filen kopieres ikke til `main` eller en publiseringsflate.
- `replace_then_remove` betyr at en kildeavgrenset og rettighetskompatibel erstatning må verifiseres før eier eventuelt godkjenner sletting av den rå lokale kopien.
- Hash, URL, locator og beslutningskvittering skal beholdes selv om en råfil senere fjernes.

## Beslutningsmatrise

| ID | Parkert fil | Kildetype og rettighetsindikasjon | Anbefalt disposisjon | Eierbeslutning som gjenstår |
|---|---|---|---|---|
| `T01` | `research/bibliotek/primaerkilder-2026-08-05/landbruksdirektoratet-82500-tonn-matkorn-2029.html` | Norsk myndighetsnyhet. Ingen eksplisitt gjenbrukslisens ble funnet på den kontrollerte siden. Siden inneholder også fotografier og nettsideelementer. | `retain_recovery_only`; bruk nåværende URL og en kort, kontrollert faktaekstraksjon i kanonisk evidens. Ikke redistribuer rå HTML. | Avgjør om myndighetsteksten skal rettighetsvurderes separat fra foto og sideinnpakning. |
| `T02` | `research/bibliotek/primaerkilder-2026-08-05/landbruksdirektoratet-matkorn-kontrakter-2026-2027.html` | Norsk myndighetsnyhet med samme uavklarte skille mellom tekst, foto og nettsideinnpakning som `T01`. | `retain_recovery_only`; ikke kopier eller publiser rå HTML. | Samme avgrensede rettighetsbeslutning som `T01`. |
| `T03` | `research/bibliotek/primaerkilder-2026-08-05/leroy-kelp-mussel-meal.html` | Privat selskapsnettside. Den kontrollerte siden oppgir «All Rights Reserved» og ingen åpen gjenbrukslisens. | `retain_recovery_only`; bruk kildehenvisning og korte, korrekt attribuerte fakta. Ikke redistribuer fangsten. | Godkjenn begrenset intern bevaring eller innhent eksplisitt tillatelse før annen bruk. |
| `T04` | `research/bibliotek/primaerkilder-2026-08-05/miljodirektoratet-landbasert-oppdrett-utslippskontroll-2025.html` | Norsk myndighetsnyhet. Ingen eksplisitt gjenbrukslisens ble funnet på den kontrollerte siden; komplette HTML-bytes omfatter mer enn myndighetsutsagnet. | `retain_recovery_only`; erstatt operativ bruk med URL, dato, locator og kontrollert faktaekstraksjon. | Avgjør om tekstinnholdet omfattes av myndighetsunntaket; hold bilder og wrapper utenfor. |
| `T05` | `research/bibliotek/primaerkilder-2026-08-05/nesa-finland-emergency-grain-stockpiles-2022.html` | Finsk myndighetsnyhet. Ingen eksplisitt gjenbrukslisens ble funnet i den avgrensede kontrollen. | `retain_recovery_only`; ikke redistribuer rå HTML. | Få en eksplisitt lisens-/eieravgjørelse før eventuell viderebruk ut over sitat og kildehenvisning. |
| `T06` | `research/bibliotek/primaerkilder-2026-08-05/ragnsells-insect-breakthrough.html` | Privat pressemelding. Publiseringsformålet tilsier deling av informasjon, men ingen eksplisitt lisens for redistribusjon av hele siden ble funnet. | `retain_recovery_only`; behold kun kildehenvisning og kontrollerte påstander i kanonisk materiale. | Godkjenn begrenset intern bevaring eller innhent tillatelse for fulltekst/sidekopi. |
| `T07` | `research/bibliotek/primaerkilder-2026-08-05/riksdagen-prop-2025-26-205-beredskapslager.html` | Svensk proposisjon. Svensk opphavsrettslov § 9 unntar blant annet forfatninger, myndighetsvedtak og myndighetsuttalelser, men sidewrapper, foto og særskilte verk kan fortsatt være beskyttet. | `replace_then_remove`: bind kanonisk evidens til proposisjonens offisielle dokument/PDF eller åpne data, og behold ikke rå nettsidewrapper som publiseringsartefakt. | Godkjenn erstatningen og deretter eventuell fjerning fra aktiv recovery; ikke omskriv historisk Git uten særskilt beslutning. |
| `U01` | `research/innhenting-2026-08-05/staging/brod-2017-ambio-fish-sludge-pmc.html` | Fagartikkel med eksplisitt CC BY 4.0 for artikkelinnholdet. Fangsten inneholder også PMC-sideelementer; tilleggsmateriale kan ha egne vilkår. | `replace_then_remove`: lag en ren artikkeltekst-/metadatarepresentasjon med forfattere, DOI, CC BY 4.0-lenke og endringsnotis; ikke bruk full PMC-wrapper. | Godkjenn den lisenskompatible erstatningen og deretter sletting av lokal rå HTML. |
| `U02` | `research/innhenting-2026-08-05/staging/estatenyheter-coop-union-2015.html` | Opphavsrettslig redaksjonell artikkel; ingen åpen lisens ble funnet. Full HTML inneholder også annonse-, bilde- og plattformelementer. | `replace_then_remove`: behold URL, forfatter, dato, locator, hash og kun nødvendige, selvstendig formulerte fakta. | Godkjenn minimumsekstraktet og sletting av full rå HTML, eller dokumenter særskilt legitimt internt bevaringsbehov. |
| `U03` | `research/innhenting-2026-08-05/staging/estatenyheter-coop-union-2015.md` | Nær fulltekstlig tekstuttrekk av samme redaksjonelle artikkel som `U02`; ingen åpen lisens ble funnet. | `replace_then_remove`; dette er høyeste prioritet for innholdsminimering fordi filen gjengir nesten hele artikkelteksten. | Godkjenn kort fakta-/locatornotat og sletting av fulltekstuttrekket. |
| `U04` | `research/innhenting-2026-08-05/staging/frontiers-p-flow-norway-2023.html` | Fagartikkelen er CC BY 4.0, men Frontiers opplyser at nettstedets kombinerte uttrykk, kode og enkelte tredjepartselementer har andre rettigheter. | `replace_then_remove`: bruk ren artikkeltekst/PDF/metadata med full attribusjon og lisens, ikke komplett nettsidefangst. | Godkjenn lisenskompatibel erstatning og deretter sletting av rå HTML. |
| `U05` | `research/innhenting-2026-08-05/staging/lovdata-forskrift-2023-12-11-2037.html` | Selve forskriften er uten vern etter åndsverkloven § 14. Lovdatas HTML-wrapper, navigasjon og tekniske elementer følger ikke automatisk samme unntak. | `replace_then_remove`: bind til forskrifts-ID og en ren, kontrollert offisiell tekst; fjern wrapper fra aktivt korpus. | Godkjenn ren tekstkilde og deretter sletting av rå HTML. |
| `U06` | `research/innhenting-2026-08-05/staging/lovdata-forskrift-2023-12-11-2037.txt` | Tekstuttrekk av forskriften, men inneholder UI-rester og mangler en fullstendig proveniens-/versjonsblokk. Selve forskriftsteksten er uten vern etter åndsverkloven § 14. | `replace_then_remove`: normaliser mot offisiell kunngjort tekst, registrer tilgangsdato og eksakt locator, og behold kun den verifiserte varianten. | Godkjenn normalisert erstatning og sletting av råuttrekket. |
| `Q01` | `f-test-folketall-trend-import-urbaniseringsgrad.png` | Lokal QA-skjermdump, 1489 × 2104. Bildet viser et F-test-resultat, men filen mangler datasettbinding, kommando, modellspesifikasjon og genereringskvittering. | `delete_after_receipt`: ikke integrer eller publiser. Behold midlertidig til eier har avgjort om analysen skal reproduseres og dokumenteres. | Enten bind bildet til en reproducerbar analyse, eller godkjenn sletting som foreldreløs QA-artefakt. |

## Replacement preparation (2026-08-31)

Den kandidatavgrensede [manifesten](../../../research/_status/visual-atlas-replacement-manifest-2026-08-31.json) og [forberedelseskvitteringen](visual-atlas-replacement-preparation-receipt-2026-08-31.md) dokumenterer kun at avgrensede erstatningsnotater er klargjort. Dette endrer ikke opprinnelig disposisjon eller rettighetsanalyse i beslutningsmatrisen, og det utgjør ikke klarering, review, kanonisering eller publiseringsgodkjenning.

| ID | Preparasjonsstatus | Erstatningssti | Rettighetsgate | `publication_ready` | `deletion_authorized` |
|---|---|---|---|---|---|
| `U01` | `replacement_candidate_prepared` | `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/ambio-fish-sludge-2017.md` | `human_gate` | `false` | `false` |
| `U03` | `replacement_candidate_prepared` | `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/estate-coop-union-2015.md` | `human_gate` | `false` | `false` |
| `U04` | `replacement_candidate_prepared` | `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/frontiers-phosphorus-flow-norway-2023.md` | `human_gate` | `false` | `false` |
| `T07` | `replacement_candidate_prepared` | `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/riksdagen-prop-2025-26-205.md` | `human_gate` | `false` | `false` |
| `U05` | `replacement_candidate_prepared` | `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/forskrift-2023-12-11-2037.md` | `human_gate` | `false` | `false` |
| `U06` | `replacement_candidate_prepared` | `docs/project/reconciliation/visual-atlas-replacements-2026-08-31/forskrift-2023-12-11-2037.md` | `human_gate` | `false` | `false` |

## Verifisert byteinventar

| ID | Størrelse | Git-objekt | SHA-256 av eksakte bytes |
|---|---:|---|---|
| `T01` | 24 324 | `0a3ea3a0cefc7552f77df1e6aa96b4267b14e2a7` | `78bd27654383c14f57d3858a2ed5159022c18eef76a5743d73e43761e9322265` |
| `T02` | 22 477 | `e68dbeec72ae7e39fbf05cd218c7402575270328` | `eafb391c7f3cbb9039ecd21efc6c917ce336e75a4c13987e66aa11860608e3aa` |
| `T03` | 56 685 | `306edd668193064650de99f26b4d8c758d97deaf` | `78e8622e7513209d6716f45fb092bdc23966c8a5fdcfaa84adb69f181533d52c` |
| `T04` | 842 288 | `276362ce2e5a181d637126e33d3560fba3cd6029` | `5e9fe5b8f79d69e1b7fb5ac80ce547d32372fe81457b3fb9ce0d59e61700a6ee` |
| `T05` | 48 783 | `6d6c03df6fa6ff1f8f1001692f0368b61c757a93` | `21f5ee53f100fe00bb1a6c282505bb0a2e81c01be5961b69a47a237ba366eff0` |
| `T06` | 30 047 | `9f7250d1d0e54419a02f87dd85b124079fdea638` | `f084fcc7e383087f4f2ca969c81cc5d156ee421c70686f560de49c68427cf705` |
| `T07` | 792 954 | `4a34f10cdda13d14e02aaa079bf2b682efd7aefe` | `d8c828f4ee8df48f800b914cac3dea9c69079e8e5ae6cd0a2dd66a2d5574340a` |
| `U01` | 222 605 | ikke versjonert | `7757de89f940ab5853a20b78f63f613f5c0eaae64e8431e3fd9b30ce19487656` |
| `U02` | 293 536 | ikke versjonert | `56e776c3c7b0faa93ed9869dc4f63a9d7b06379c35810a6e511be4d2e57a762e` |
| `U03` | 2 045 | ikke versjonert | `2a42785baf986bf27da0d7abd0d158f79f644f7f95415721ba88c84a6599756e` |
| `U04` | 818 845 | ikke versjonert | `a53c3e5cd5e2a2a21feff75f650338bbd7c96d5d663b4bc08d8907589a17c014` |
| `U05` | 30 752 | ikke versjonert | `ec09e81c924a3ef8da8a39783247208b980ad82258ddb98aa3dd87b122d3e6b2` |
| `U06` | 1 446 | ikke versjonert | `b1983e65a2dcf3c76e85f23b7bba772cb26df635ba6afcdf12d823f860c85e22` |
| `Q01` | 30 617 | ikke versjonert | `a146891607474d790c13276dde0c6ab0570a64f71ae7b41e54b78a36d87ecc0e` |

## Kontrollerte rettighetskilder

- [Landbruksdirektoratet: 82 500 tonn matkorn på lager innen 2029](https://www.landbruksdirektoratet.no/nb/nyhetsrom/nyhetsarkiv/82-500-tonn-matkorn-pa-lager-innen-2029--i-mal-med-kontrakter)
- [Miljødirektoratet: Landbasert oppdrett har for dårlig utslippskontroll](https://www.miljodirektoratet.no/aktuelt/nyheter/2025/mai-2025/landbasert-oppdrett-har-for-darlig-utslippskontroll/)
- [NESA: National Emergency Supply Agency boosting Finland's emergency grain stockpiles](https://www.huoltovarmuuskeskus.fi/en/a/national-emergency-supply-agency-boosting-finlands-emergency-grain-stockpiles)
- [Lerøy: Increasing production of kelp and mussel meal](https://www.leroyseafood.com/en/tasty-seafood/environment-and-society/increasing-production-of-kelp-and-mussel-meal/)
- [Ragn-Sells: New technology leads to breakthrough in insect feed](https://newsroom.ragnsells.com/posts/pressreleases/new-technology-leads-to-breakthrough-in-insec)
- [Sveriges riksdag: Proposition 2025/26:205](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/beredskapslager-i-livsmedelskedjan_hd03205/)
- [Sveriges riksdag: upphovsrättslag, blant annet § 9](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1960729-om-upphovsratt-till-litterara-och_sfs-1960-729/)
- [Ambio-artikkel, DOI 10.1007/s13280-017-0927-5](https://doi.org/10.1007/s13280-017-0927-5)
- [Frontiers: copyright statement](https://www.frontiersin.org/legal/copyright-statement)
- [Norsk åndsverklov § 14](https://lovdata.no/nav/lov/2018-06-15-40/%C2%A714)

## Anbefalt beslutningsrekkefølge

1. Godkjenn `U03` for innholdsminimering først; det er et nær fulltekstlig, ulisensiert redaksjonelt uttrekk.
2. Godkjenn rene, attribuerte erstatninger for `U01` og `U04` under CC BY 4.0.
3. Godkjenn normalisert offisiell tekst for `T07`, `U05` og `U06`, uten nettsidewrapper.
4. Avgjør begrenset intern retention for `T01`–`T06`; inntil da forblir de kun recovery-materiale.
5. Reproduser eller slett `Q01`; bildet skal ikke bli stående som en uforankret analysebevisflate.

Etter eierbeslutning skal hver utført handling få en kvittering med ID, beslutter, dato, gammel SHA-256, ny artefakt/locator, disposisjon og eksplisitt bekreftelse på at den historiske recovery-grenen enten fortsatt skal bevares eller kan arkiveres etter en separat Git-beslutning.
