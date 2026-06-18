---
tittel: Food TG — Objektivfunksjon + plattformintegrasjon
status: Analytiker-syntese v0.1 — FORSTÅELSE + plattformforslag (ikke auto-implementert kode)
eier: Gabriel
dato: 2026-06-18
type: analyse + integrasjonsforslag
scope: >
  To ting i ett: (1) hvordan analysen og prioriteringene endrer seg konkret under hvert av de mest
  aktuelle målene (objektivfunksjonen), og (2) hvordan systemmodellen + objektivfunksjonen henger sammen
  med plattformen som allerede finnes. Hovedfunnet: plattformen HALV-implementerer allerede begge — og
  biasen sitter i selve dataskjemaet.
bruksregel: >
  FORSTÅELSE + forslag. Ingen kode endres her; integrasjonsstegene er spesifikasjoner som må gjennom
  control-layer/gates (food-tg-control-layer.ts) som alt annet. Nye objektiv-dimensjoner skal IKKE fylles
  med oppdiktede scorer — tomme scorer er poenget (de synliggjør blindsonene).
relaterte_filer:
  - docs/project/analysis/food-tg-systemmodell-integrert-2026-06-18.md
  - src/lib/data/circular-leverage.ts
  - src/components/charts/CausalLoopDiagram.tsx
  - src/lib/data/food-tg-control-layer.ts
  - src/lib/data/dybdeanalyse.ts
---

# Objektivfunksjon + plattformintegrasjon

## 1. Hovedfunn

Plattformen er lengre fremme enn man skulle tro: den **halv-implementerer allerede** både systemmodellen og objektivfunksjonen. Men begge er (a) delvise/hardkodede og (b) systematisk biaset mot miljø-framen. Det betyr at integrasjonsoppgaven ikke er «bygg alt nytt», men «gjør ferdig og av-bias det som finnes» — og selve den øvelsen synliggjør blindsonene i stedet for å skjule dem.

To konkrete bevis fra koden:

- **`src/components/charts/CausalLoopDiagram.tsx`** koder allerede 3 av de 5 låsesløyfene fra systemmodellen: konsentrasjon → kjøpekraft → lavere innkjøpspris → margin → invest → ekspansjon → konsentrasjon (= **L1**, forsterkende), etableringshindre → mangfold (= **L2**, balanserende), regulering ↔ konsentrasjon (= **L4**, balanserende). Men den er hardkodet, merket «konseptuell modell», og mangler **L3** (åpen næringsloop), **L5** (konsentrasjons-fraktal), import-noden og blindsone-nodene.
- **`src/lib/data/circular-leverage.ts`** har allerede en fungerende fler-måls-vekting: hvert leverage-punkt scores på `effects: { klima, natur, forurensning }` med `aggregate` og `relatedLoopIds`/`relatedGapIds`. Det ER en objektivfunksjon i miniatyr — men dimensjonene er **kun miljø**. Det finnes ingen `helse`, ingen `distrikt`/`bondeøkonomi`, ingen `resiliens`. Plattformen kan i dag *bokstavelig talt ikke uttrykke* en helse- eller bondeøkonomi-linse, fordi de ikke er felt i datamodellen.

Det andre punktet er den skarpeste innsikten: **blindsonene fra systemmodellen er ikke bare manglende research — de er manglende skjema-dimensjoner.** Biasen er bygget inn i typene.

## 2. Objektivfunksjonen — hvordan prioritering skifter under hvert mål

Samme modell, ulike mål → ulike strukturbærende noder og ulike topp-tiltak. Kolonnen «plattform-uttrykk» viser hvor i appen målet kan/ikke kan velges i dag.

| Mål (objektivfunksjon) | Kritiske noder/sløyfer | Hva som rangeres øverst | Plattform-uttrykk i dag |
|---|---|---|---|
| **Resiliens/beredskap** | N1 import + N6 beredskap; L1 | Redusere fôr-/fosfat-importavhengighet; beredskapslager | Delvis (beredskap/selvforsyning finnes som data, men ikke som *vektbar linse*) |
| **Klima** | N1 + N10 + drøvtygger/metan; L3 | Lukke næringsloop; redusere import-Scope 3 | **Ja** — `effects.klima` finnes |
| **Forurensning/natur** | N5 + N10 (N/P-tap til fjord); L3 | Lukkede anlegg, struvitt, digestat-retur | **Ja** — `effects.natur`/`effects.forurensning` finnes |
| **Folkehelse** | N7 etterspørsel + N9 helse | Kostholdsskifte, true-cost, tilgjengelighet | **Nei** — ingen `helse`-dimensjon; N7/N9 finnes ikke som noder |
| **Bondelivsgrunnlag/distrikt** | N11 bondeøkonomi; L2 + L5 | Bryte distribusjonsgate; styrke primærledd-margin | **Nei** — ingen `distrikt`-dimensjon; N11 finnes ikke |
| **Sirkularitet** | N5 + L3 | R-stige-løft, høyverdi fremfor «utnyttet» | **Ja** — sterkest dekket (r-ladder, circular-leverage) |

Mønsteret er entydig: **plattformen kan i dag bare uttrykke de miljø-/sirkularitetsmålene den allerede har dimensjoner for.** Velger prosjektet helse eller distrikt som (del-)objektiv, finnes verken data eller skjema — og det er presis samme konklusjon som systemmodellens blindsoner, nå sett fra datamodellen.

## 3. Hva som allerede finnes (kartlagt mot faktiske filer)

| Systemmodell-element | Finnes i plattformen som | Status |
|---|---|---|
| Låsesløyfer L1/L2/L4 | `CausalLoopDiagram.tsx` (hardkodet) | Delvis — mangler L3/L5 + import/blindsone-noder, ikke data-drevet |
| Objektivfunksjon (vekting) | `circular-leverage.effects {klima,natur,forurensning}` | Halv — kun miljødimensjoner |
| R-stige (høyverdi vs utnyttet) | `r-ladder.ts` | Ja |
| Node-kobling | `relatedLoopIds`, `relatedGapIds`, `relatedActorCases` | Ja — kryss-linking finnes |
| Claim-lock-governance | `food-tg-control-layer.ts` (gates: scope/claim/figure/case/source/validation) | Ja — moden |
| Dybdefunn m/dekningsnote | `dybdeanalyse.ts` (`coverageNote`, `citationReadiness`, `notSay`) | Ja — gap-bevisst |
| Demand/forbruk (N7), Helse (N9), Bondeøkonomi (N11) | — | **Mangler helt** (verken node eller dimensjon) |

## 4. Konkrete integrasjonssteg (kirurgiske, gjennom gates)

I prioritert rekkefølge. Hvert steg er en spesifikasjon — implementeres som vanlig under control-layer + `npm run lint/build` + relevant gate.

**S1 — Av-bias objektivfunksjonen (minst endring, størst innsikt).**
Utvid `effects`-typen i `circular-leverage.ts` fra `{klima, natur, forurensning}` til å inkludere `helse`, `distrikt` (bondeøkonomi/lokal verdiskaping) og `resiliens`. Legg til en UI-lins-velger (på `/sirkularitet` eller `/innsikt`) som re-rangerer leverage-punktene etter valgt mål. **Poenget:** de nye dimensjonene vil stå tomme/`null` for de fleste punkter — og det er riktig. Det gjør blindsonene *synlige i UI* (en helse-linse viser en nesten tom tavle), i stedet for at biasen er usynlig fordi dimensjonen ikke finnes. Ikke fyll med oppdiktede scorer.

**S2 — Data-driv og fullfør systemkartet.**
Flytt `CausalLoopDiagram` fra hardkodede `NODES`/`LINKS` til en `loops.ts`-datafil, og legg inn L3 (åpen næringsloop) + L5 (konsentrasjons-fraktal) + import-noden (N1) + blindsone-noder (N7/N9/N11) som *eksplisitt merkede* «mangler input/output»-noder. Da blir systemmodellen en navigerbar visning (f.eks. `/innsikt` eller egen `/systemmodell`-rute), koblet til `relatedLoopIds` som allerede finnes.

**S3 — Gjør blindsonene til en førsteklasses coverage-indikator.**
Mønsteret finnes alt (`coverageNote`/`citationReadiness` i dybdeanalyse). Gjenbruk det til en «systemdekning»-markør: hver node/objektiv viser dekningsgrad (dyp/solid/delvis/blind). En leser ser umiddelbart at struktur-laget er dypt og input/output-lagene er tynne — ærlig kalibrering bygget inn i produktet, ikke gjemt i et docs-notat.

**S4 — Koble analysen inn i hvitbok/innsikt.**
Systemmodell-doc og denne analysen bør lenkes fra `/hvitbok` og `/metodikk`, så den monterte motoren og objektivfunksjon-valget er en del av den eksterne fortellingen — ikke bare interne docs.

## 5. Rekkefølge og avhengighet til research

- **Velg objektivfunksjon FØR S1** — utvidelsen av `effects` skal speile de 2–3 målene prosjektet faktisk rangerer (ikke alle seks).
- **S1 før S2:** lins-velgeren gir umiddelbar verdi og synliggjør gapene som S2 så visualiserer.
- **Research følger objektivet:** hvis helse/distrikt velges, er *det* neste research-spor (N7/N9/N11) — ikke mer av det vi alt dekker. Da er R6 begrunnet; ellers ikke.
- **Alt gjennom gates:** nye dimensjoner og noder er claim-/figur-berørende → `gate:overclaim`/`audit:citable` + `lint`/`build`.

---

*Konklusjon: plattformen trenger ikke en ny modul for å bære systemmodellen og objektivfunksjonen — den trenger å av-bias og fullføre strukturer som allerede finnes (`effects`, `CausalLoopDiagram`, `coverageNote`). Den enkleste endringen (S1: utvid `effects` med helse/distrikt/resiliens) er også den som mest ærlig avslører hvor prosjektet ser skarpt og hvor det er blindt — i selve produktet. Men alt henger på ett valg vi ennå ikke har tatt: hvilke 2–3 mål er objektivfunksjonen?*
