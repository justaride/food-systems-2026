---
tittel: I27+ kandidatgodkjenning for Obsidian-kunnskapskart
status: krever menneskelig godkjenning for generering
dato: 2026-07-02
fase: VK-2
plan: docs/project/plans/obsidian-kunnskapskart-masterplan-v3-2026-07-02.md
vk5_review_protokoll: docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md
---

# I27+ kandidatgodkjenning

Dette dokumentet er porten i VK-2: Codex kan foreslå I27+-innsikter, men skal ikke generere nye innsiktsnoter før listen er eksplisitt besluttet. V2-runden under er selektivt besluttet etter brukerordre om å implementere intern-cockpit-planen; dette lukker ikke VK-5 menneskelig Obsidian-review.

## Selektiv V2-beslutning 2026-07-02

- Generer bare kandidater som styrker kartets interne beslutningsverdi uten å kreve nye tallclaims: I27, I31, I34, I36, I37 og I38.
- Parker aktørspesifikke, proxy-tunge eller kildeumodne kandidater til senere claim-lock/datareview: I28, I29, I30, I32, I33 og I35.
- Alle genererte I27+-noter skal være `siterbarhet: intern` og tydelig merket som arbeidsnoder.

## Kandidatliste til godkjenning

| Foreslått ID | Arbeidstittel | Kildegrunnlag | Hvorfor kandidat | Status |
|---|---|---|---|---|
| I27 | Styreoverlappet samler retail, logistikk og foredling i et smalt bro-mønster | `docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md` | AP-1 er allerede kilde for maktkartet og kan bli egen bevisnode etter claim-lock. | godkjenn med endring |
| I28 | BAMA og ASKO er sentrale selskapsknutepunkter i styregrafen | `docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md` | Underbygger Nordstad-tesen med AP-1-nettverksdata. | parkert |
| I29 | Nodekonsentrasjon viser at makt ligger i utvalgte knutepunkter, ikke bare markedsandeler | `docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md` | Kobler grafanalyse til verdikjede- og distribusjonsmakt. | parkert |
| I30 | Tilskuddskonsentrasjon må tolkes som systemfordeling, ikke enkelaktørkritikk | `docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md` | Supplerer maktbildet med offentlig støtteflyt og bonde-/distriktsvinkel. | parkert |
| I31 | Krysseie og transitive eierskap må vises som konserntrær, ikke flate lister | `docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md` | Direkte relevant for VK-1-konserncanvas og eierskapslag. | godkjenn med endring |
| I32 | Havbrukskonsentrasjon gir en egen matmaktakse utenfor dagligvaretriopolet | `docs/project/analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md` | Utvider kartet fra dagligvare til sjømat/havbruk. | parkert |
| I33 | Pris-asymmetri i havbruk/foredling er proxy-testbar, men trenger native serie før sterk claim | `docs/project/analysis/food-tg-ap7-prisasymmetri-funn-2026-06-14.md` | God kandidat hvis den beholdes caveat-first. | parkert |
| I34 | Fem fokusområder peker fra analyse til transition-group prioritering | `content/hvitbok/03-fokusomraader.md` | Kobler innsiktskartet til handlekartet. | godkjenn med endring |
| I35 | Soya-sporbarhet og EUDR gjør fôr/import til nordisk sårbarhetsakse | `content/hvitbok/02-nordisk-sirkularitet.md` | Binder import, fôr, policy og Norden-noder sammen. | parkert |
| I36 | Næringsgjenvinning har stort potensial, men minimal realisering i norsk kontekst | `content/hvitbok/03-fokusomraader.md` | Direkte relevant for norske gap-noder og VK-4 missions. | godkjenn med endring |
| I37 | Maktkart-syntesen krever fire linser før offentlig formulering | `docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md` | Kan bli meta-innsikt om hvordan maktclaims skal bygges trygt. | godkjenn med endring |
| I38 | Objective-function-modellen skiller mellom beslutningsverdi og publiserbarhet | `docs/project/analysis/food-tg-objektivfunksjon-VEDTAK-2026-06-18.md` | Kan hjelpe kartet å vise interne vs eksterne brukslag. | godkjenn med endring |

## Ikke generer ennå

- Ingen I27+-noter skal opprettes før denne listen er godkjent.
- Kandidater som inneholder tall, aktørnavn eller årsaksspråk skal gjennom claim-lock før ekstern bruk.
- Etter godkjenning skal hver ny innsiktsnote ha minst én kildenote-lenke og eksplisitt `siterbarhet`.
