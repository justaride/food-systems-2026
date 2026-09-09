# Library recovery sample

Dato: 2026-09-09
Omfang: fem P1-poster fra den private 392-worklisten; ingen databaseendring, analyse, review eller promotion

## Resultat

Fire komplette PDF-filer ble hentet fra de registrerte utgiverlenkene og bevart
med HTTP-headere, råfilhash, teksthash og første/siste side som visuell kontroll.
Én nettside ble blokkert av AWS WAF og ga ingen kildetekst. Artefakter og
maskinlesbart manifest ligger privat i
`restlist/library-recovery-sample/manifest.json`.

| Post og kjede | Faktisk resultat | Neste behandling |
| --- | --- | --- |
| ECR Dagligvarukartan 2024, `cmsompj05017tknkx5geygmf1`; SourceDoc `src-82` → Document `cmr1wg7rt000vc53g9qabc5mt` | 14-siders PDF, SHA-256 `95ba5529…00753`. Tekstuttrekket har bare 249 ord fordi mye av innholdet er grafiske kart/tabeller; råfilen er komplett, maskinteksten er delvis. | Behold PDF som primærinput og gjør sidevis visuell/tabelluttrekking før ny hashbundet analyse. |
| Rest Oslo Michelin, `cmsomp80600lzknkxq9fud4tp`; URL → Document `cmo8ica2v00j926moeqrkh172`, ingen SourceDoc | HTTP 202 med `x-amzn-waf-action: challenge`, tom respons og ingen tekst. | Behold blokkert til siden kan hentes gjennom autorisert nettleser eller stabil Michelin-endepunkt. |
| Baltic Sea Food B2B, `cmsompkkc01b1knkxpb98z8r8`; SourceDoc `src-innh-2026-08-05-001` → manglende Document | 76-siders PDF, råhash `98fbc4ba…c9128`, 36 059 ord og teksthash `9ace221d…5aa8`. Forside, siste referanseside og tekstslutt samsvarer med identiteten. | Bygg en hashbundet Document-kandidat og kontroller identiteten før eventuell senere binding. |
| Konkurrensverket Rapport 2025:5, `cmsompkpt01bcknkxam8jg0zx`; SourceDoc `src-innh-2026-08-05-012` → manglende Document | 112-siders PDF, råhash `d2421cb1…982c`, 39 991 ord og teksthash `ad5fb6b9…2dad`. Metadata, forside og sluttside samsvarer med utgiver og rapportnummer. | Bygg en hashbundet Document-kandidat med eksakte sidehenvisninger; identitetskontroll kreves før binding. |
| NORSUS/Matvett OR.28.24, `cmsompkra01bfknkxjdivih2c`; SourceDoc `src-innh-2026-08-05-015` → manglende Document | 54-siders PDF, råhash `f92a1d71…2dc3`, 19 657 ord og teksthash `64f686ea…4780`. Forsiden bekrefter tittel, forfattere, rapportnummer og år; uttrekket når sluttsiden. | Bygg hashbundet Document-kandidat og bevar rapportens sidenummerering før binding eller analyse. |

## Autoritetsgrense

Innhentingen viser at fire av fem poster har et langt eller visuelt rikt
originalgrunnlag som kan klargjøres teknisk. Den endrer ikke de eksisterende
LibraryAnalysisRecord-radene. `low_text_quality` fjernes ikke automatisk, og
`review_required` består til en separat, autorisert prosess har bundet eksakt
kildeinnhold, bygget ny analyse og gjennomført nødvendig review.
