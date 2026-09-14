# Bibliotek: gjennomført lokal reparasjonsforberedelse

9. september 2026. Fire dokumentidentiteter er klargjort som kandidater, og den eksisterende 392-posters køen er avstemt. Ingen post er importert, bundet, menneskelig vurdert eller flyttet ut av produksjonens review-kø.

## Fire originalrapporter

| Registrert post | Kontrollert original og ny kandidat | Neste avgrensede behandling |
|---|---|---|
| ECR Dagligvarukartan 2024/2025 | Forsiden sier **Dagligvarukartan 2024**, DLF/Delfi. Alle 14 fysiske sider er visuelt lest. Syv svenske aktørrader og 39 regionale detaljrader er transkribert med fysiske sidereferanser. | Uavhengig kontroll av det visuelle uttrekket før tallbruk; avklar de registrerte sum-/scopeavvikene. |
| Baltic Sea Food | Forsiden sier **Local Food Business-to-Business Distribution Model**; side 2 navngir Kjersti Bjørke, Hardanger Business Garden. 76 fysiske sider med tekstbindinger. År er ikke bekreftet fra identitetssidene. | Kontroller Document-kandidat og kildeidentitet; full faglig analyse gjenstår. |
| Konkurrensverket 2025:5 | Tittel og rapportnummer er bekreftet fra forside; kolofon sier oktober 2025 og Kristin Kindgren som prosjektleder. 112 fysiske sider. | Kontrollert dokumentbinding og full faglig analyse. Dette notatet tolker ikke loven eller dens effekter. |
| NORSUS OR.28.24 | Tittel, rapportnummer, år 2024 og forfatterne Sigrid Møyner Hohle/Aina Stensgård er bekreftet. 54 fysiske PDF-sider; kolofonen oppgir 39 sider. Begge opplysningene beholdes med sin betydning. | Bruk fysiske sidereferanser og separate trykte sidenumre. Estimater fra rapporten er ikke målt innsamlingsflyt. |

[Dokumentkandidatene](library-document-candidates.json) binder kilde-URL, eksisterende post-ID-er, råfil, tekst, kontrollsummer, forsidekontroll og begrensninger. [Sideindeksen](library-page-index.json) binder alle 256 fysiske sider til tekstsegmenter. Sideindeksering er ikke full semantisk lesing av rapportene.

Råkilder og sidebilder forblir i de private røttene angitt i kandidatene. Ingen PDF eller fulltekst er kopiert inn i Git. Kandidatene gir et reviewbart grunnlag for en senere, kontrollert binding; de er ikke en databaseimport eller en source-identity-sealer-kvittering.

## Det visuelle uttrekket fra Dagligvarukartan

[Uttrekk og kontroll](ecr-visual-extraction.json) beholder originalens opplysninger og sidereferanser:

- De syv svenske aktørandelene summerer til 100,0 prosent. De oppgitte aktørsalgene summerer til 337,6 milliarder SEK, lik figurens total.
- På sidene 8, 9, 11, 12 og 13 er summen av de trykte omsetningsradene én million SEK høyere enn trykt total. Dette kan være avrunding eller en kildeinkonsistens; ingen verdi er rettet eller utpekt som fasit.
- Danmark på side 4 viser både «Købmænd/den frie sektor» og detaljerte etiketter. Alle synlige andeler summerer til 130,7 prosent. Det mulige forholdet mellom samlet kategori og underkategorier må avklares mot navngitt originalkilde. Diagrammet er ikke normalisert til et nytt landregnskap.
- Omsetning per kvadratmeter er ikke rekalkulert fra gjennomsnittstall. Uavrundede arealnevnere mangler.
- Publikasjonen er 2024-utgaven; salgsperiodene er hovedsakelig 2023 med navngitte unntak på side 1. Den er ikke et nytt 2026-markedsbilde eller bevis på disponibel beredskapskapasitet.

## Michelin: nytt presist stopp

Den registrerte [Rest-lenken](https://guide.michelin.com/gb/en/oslo-region/oslo/restaurant/rest) ble åpnet i Codex-nettleseren i denne kjøringen. Etter avvisning av valgfrie informasjonskapsler viser siden «Restaurant not found» og «Restaurant details are not available in the MICHELIN Guide United Kingdom.»

Dette erstatter ikke den tidligere AWS WAF-kvitteringen; det er en ny observasjon av denne URL-en og denne regionale utgaven. Det dokumenterer ikke at restauranten er stengt eller at en historisk utmerkelse er trukket tilbake. Ingen aktuell restauranttekst ble gjenopprettet. En avgrenset søking ga eldre Michelin-artikler, men ingen av dem er brukt som erstatning for den aktuelle kildeposten.

Neste nødvendige underlag er en faktisk tilgjengelig Michelin-oppføring med riktig sted/utgave, eller en eksplisitt historisk kildedisposisjon. Postens faglige status forblir uavklart.

## Hele 392-køen

[Reparasjonskøen](library-repair-queue.json) viderefører eksakt 392 unike post-ID-er fra produksjonsuttrekket 9. september kl. 01.36 UTC: 169 P1 og 223 P2. 187 poster har minst én lokal filkandidat på de undersøkte stiene. En fil med passende sti er ikke bekreftet kildeidentitet.

Fire poster har de nye dokumentkandidatene ovenfor. 388 poster mangler en slik ny kandidat i denne leveransen. **Alle 392 står fortsatt i produksjonens review-kø.** Rest Oslo inngår i de 388.

Reproduser og kontroller uten nettverk eller database:

```sh
python3 docs/project/status/followup-2026-09-09/library-recovery.py
```

Programmet verifiserer opprinnelige kildehash, PDF-sidetall, tekstsegmenter, unike post-ID-er og at avledede filer stemmer med grunnlaget. `--write` regenererer bare denne lokale leveransens avledede JSON-filer. Ingen modellversjonsport eller produksjonskvalifisering er opphevet. Den tidligere Sol/Terra-prøvens manglende eksakte modellversjonsattestasjon og de gamle karantenene består.
