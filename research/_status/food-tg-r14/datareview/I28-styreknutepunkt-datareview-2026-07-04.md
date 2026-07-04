---
tittel: I28 styreknutepunkt datareview
dato: 2026-07-04
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# I28 styreknutepunkt datareview

## Kort dom

I28 skal ikke bli egen innsiktsnode nå. AP-1 gir en nyttig intern observasjon: BAMA Gruppen AS og ASKO Norge AS er høyt sammenkoblede selskapsnoder i den interne styregrafen. Men I28 er aktørspesifikk og lett å overlese som makt-, kontroll- eller koordineringspåstand. Trygg bruk er som maktkart-/I37-observasjon med tydelig grafunivers og dekningsforbehold, ikke som frittstående BAMA/ASKO-claim.

## Reviewgrunnlag

| Kilde | Rolle i review |
|---|---|
| `docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md` | Hovedanalyse for styreoverlapp, sektorbroer og selskapsinterlock-grad. |
| `research/analyse/ap1-styreoverlapp.json` | Råaggregat for AP-1-baseline. |
| `scripts/analyze-board-interlocks.ts` og `tests/scripts/analyze-board-interlocks.test.ts` | Reproduserbar beregning og enhetstestet interlock-logikk. |
| `docs/project/analysis/food-tg-ap1-dekningsutvidelse-funn-2026-06-14.md` | Viser at baseline-dekning 98/275 kan løftes, men at etter-tall er projisert til DB-kjøring. |
| `docs/project/analysis/food-tg-maktkart-bronnoysund-stikkprove-2026-06-14.md` | Primærsjekk av juridisk form og topp-broere, inkludert BAMA/ASKO-relaterte roller. |
| `Food Systems Obsidian/10 Innsiktskart/Innsikter/I37 Maktkartet må leses gjennom fire linser.md` | Tryggere eksisterende hjem for AP-1 som én av flere linser. |

## Datareview

| Kriterium | Status | Konsekvens |
|---|---|---|
| Grafunivers eksplisitt | Delvis. AP-1 baseline har styredata for 98 av 275 selskaper; dekningsutvidelsen er delvis projisert til DB-kjøring. | Ikke bruk I28 som komplett verdikjedeunivers eller helhetlig markedsmaktkart. |
| Metric eksplisitt | Ja. "Selskapsknutepunkt" betyr deler styremedlem med andre selskaper i intern styregraf. | Ikke oversett til eierskap, kontroll, koordinering, markedsandel eller konkurranserettslig funn. |
| Aktørspesifikk sensitivitet | Høy. BAMA/ASKO kan lett leses som aktørkritikk. | Må ha claim-lock og trygg språkpakke før ekstern bruk. |
| Primærstøtte | Delvis. Brønnøysund-stikkprøven støtter juridisk form og flere topp-broer, men AP-1 er fortsatt strukturell posisjon. | Primærsjekk støtter at rollene finnes; den beviser ikke intensjon eller atferd. |
| Triangulering | Ja som intern maktkart-linse. AP-1 blir sterkere sammen med AP-5/eiergraf, ikke alene. | Bruk i I37/maktkartet heller enn å lage en smal I28-aktørnode. |
| Publiserbar formulering | Nei som I28. Ja internt: "AP-1 peker på BAMA/ASKO som sentrale noder i den interne styregrafen." | Behold som intern cockpit-/maktkart-observasjon. |

## Beslutning

- I28 forblir parkert som egen I-node.
- Ingen `Food Systems Obsidian/10 Innsiktskart/Innsikter/I28 ...` skal genereres i denne runden.
- AP-1 kan brukes internt i I37/maktkartet som styregraf-linse, med synlig dekning og "struktur, ikke atferd"-språk.
- En senere I28 kan bare åpnes etter eksplisitt ny beslutning og AP-1 claim-lock med grafunivers, dekningsgrad, metode, dato, Brreg-støtte og aktørspesifikk stopplinje.

## Ikke si

- Ikke si at BAMA eller ASKO er "maktens knutepunkt" som ekstern påstand fra AP-1 alene.
- Ikke si at styreoverlapp beviser koordinering, intensjon, ulovlighet, markedsmakt eller operativ kontroll.
- Ikke fremstille 98/275-styregrafen som komplett verdikjedeunivers.
- Ikke bruke BAMA/ASKO-raden som enkelaktørkritikk eller distribusjonsblokkeringsclaim.
- Ikke blande AP-1 styreverv med AP-5 eierskap eller AP-2 markeds-HHI uten tydelig lenseforklaring.
- Ikke generer I28 uten eksplisitt menneskelig beslutning.
