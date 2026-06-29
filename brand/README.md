# Natural State — brand-assets (staging)

Kopiert fra **«Natural State Deployments And MainBoards»** (iCloud-repo), 2026-06-17, for flaggskip-rapporten til Cathrine & JT. Skal migreres til et dedikert `ns-design`-repo — jf. `docs/project/status/NS-design-konsolideringsplan-2026-06-17.md`.

## Innhold her
- `ns-tokens.css` — de ekte NS-designtokenene. **Instrument Serif** (display) + **Instrument Sans** (brødtekst); mørk-først palett (`#060606` / paper `#f7f6f2`) med light-variant; fire aksenter; radius/skygger/easing.
- `assets/sphere-{internal,lab,place,market}.svg` — de fire NS sphere-symbolene (rene, inline-bare SVG-er).

## De fire sfærene (signatur)
| Symbol | Tema | Strokefarge (SVG) | Mønster |
|---|---|---|---|
| `sphere-internal` | Human | `#F5A623` amber | vertikale ellipser |
| `sphere-lab` | Society | `#D0422A` rød | horisontale ringer |
| `sphere-place` | Nature | `#5CB85C` grønn | diagonale, tiltet |
| `sphere-market` | Market | `#38A4D0` blå | diagonale |

## Ikke kopiert (binær — håndteres i bygge-økt)
- **Wordmark:** `…/Natural State Deployments And MainBoards/public/assets/logo-wordmark.webp`. For rapporten kan vi enten referere denne, eller sette «Natural State» typografisk i Instrument Serif.
- **Logoer PNG/PSD:** `NS_LOGO_HVIT/SORT_SYMBOLER`, `naturallogoneue` (i NS-repoet).

## Merknader for konsolideringen
- **Liten inkonsistens å harmonisere:** aksentfargene i `ns-tokens.css` og i sphere-SVG-ene avviker noe (f.eks. grønn `#78c840` vs `#5CB85C`, amber `#f8b038` vs `#F5A623`). Velg ett sett i det dedikerte repoet.
- **Kanonisk kilde:** `elements/`-systemet i NS-repoet (tokens, elements.css, ikoner, react, motion). **Ignorer** `design-system/natural-state/MASTER.md` — utdatert auto-generert mal (Lora/Raleway, generisk).
