---
tittel: Food TG — Beslutningsnotat: objektivfunksjon + flersporet arbeidsmodell
status: Beslutningsnotat v0.1 — anbefalinger, for ditt vedtak
eier: Gabriel
dato: 2026-06-18
type: strategi/governance (forståelse — ikke faktastemme)
scope: >
  To beslutninger som henger sammen: (1) hvilke 2–3 mål objektivfunksjonen skal være, og (2) en arbeidsmodell
  som åpner for flere spor med ulike beviskrav — så vi kan jobbe utforskende og strategisk uten å forurense
  det siterbare kunnskapsgrunnlaget, og uten å la den strenge prosessen kvele alt annet.
bruksregel: >
  Strategi/anbefaling. Endrer ingen claims. Det siterbare grunnlaget (Track A) beholder sine regler uendret;
  poenget er å gi de andre sporene legitimitet og fart, med eksplisitt brannmur.
relaterte_filer:
  - docs/project/analysis/food-tg-systemmodell-integrert-2026-06-18.md
  - docs/project/analysis/food-tg-objektivfunksjon-plattform-2026-06-18.md
  - src/lib/data/food-tg-control-layer.ts
  - research/forstaelse/
---

# Beslutningsnotat — objektivfunksjon + arbeidsmodell

## 1. Hvorfor de to henger sammen

Objektivfunksjonen sier *hva vi optimerer for*. Arbeidsmodellen sier *hvilke beviskrav som gjelder hvor*. De to dukket opp samtidig fordi det samme stramme regimet (primærkilde → claim-lock → gate) i dag gjelder alt — og det er for trangt for strategi, scenarier og produktidéer, samtidig som det er helt riktig for det siterbare grunnlaget. Løsningen er ikke å løsne på grunnlaget, men å gi de andre sporene et eget, legitimt hjem med tydelig membran.

---

## DEL A — Objektivfunksjonen

## 2. Kandidat-sett og avveininger

Fra systemmodellen: prosjektet står analytisk **sterkest for sirkularitet og resiliens, svakest for helse og bondeøkonomi.** Tre realistiske mål-sett:

| Sett | Mål | Styrke | Pris |
|---|---|---|---|
| **I — Spill på styrke** | Resiliens (primær) + Sirkularitet (sekundær) | Bygger på det vi alt dekker dypt; lav ekstra kostnad; politisk høyaktuelt (totalberedskap) | Sier lite om *hvorfor det betyr noe for folk* (helse) |
| **II — Fullfør narrativet** | Resiliens + Sirkularitet + **Bondeøkonomi/distrikt** | Lukker den manglende halvdelen av konsentrasjonshistorien; distrikts­politisk sentralt; tractabelt | Krever ett nytt research-spor (N11) |
| **III — Maksimal ekstern slagkraft** | Helse/true-cost (primær) + Resiliens | True-cost-linsen flytter mest en ekstern leser; sterkest «hvorfor» | Dyrest og mest fremmed for dagens korpus; stor ny innsats |

## 3. Anbefaling (objektivfunksjon)

**Velg Sett II: Resiliens (primær) + Sirkularitet (sekundær) + Bondeøkonomi/distrikt som den ene blindsonen vi åpner.**

Begrunnelse:
- **Resiliens** er det mest forsvarbare «bra for hva» gitt det vi har: import-avhengighet, beredskap og selvforsyning er allerede kartlagt, og det binder L1+L3 sammen. Det er også det mest politisk aktuelle akkurat nå.
- **Sirkularitet** er prosjektets dypeste kompetanse (R-stige, sidestrømmer) og alt plattform-støttet — billig å holde som sekundærmål.
- **Bondeøkonomi/distrikt** fremfor helse som blindsonen-å-åpne, av tre grunner: (a) det *fullfører* en historie vi allerede forteller (vi har den som presser — N2/N3 — ikke den som presses — N11), så det er additivt, ikke et helt nytt felt; (b) det er distriktspolitisk kjernestoff i norsk matdebatt; (c) det er mer tractabelt enn full helse/true-cost, som er et enormt felt.

**Når dette ikke gjelder:** hvis hovedformålet skifter til *ekstern påvirkning/overtalelse* fremfor analytisk dybde, vinner helse/true-cost (Sett III) — true-cost-tall flytter beslutningstakere mer enn resiliens-tall. Da bør N9 prioriteres tross kostnaden. Det er en verdivurdering bare du kan ta; jeg anbefaler Sett II med mindre ekstern slagkraft er det uttalte primærmålet.

---

## DEL B — Flersporet arbeidsmodell

## 4. Fire spor med ulike beviskrav

Membranen finnes allerede i kim: `research/forstaelse/` er et lavere-bar-spor adskilt fra claim-lock, og control-layer har statuser som `hypotese`, `pilotkandidat`, `sekundaerspor`. Vi formaliserer og utvider det til fire eksplisitte spor:

| Spor | Hva | Beviskrav | Hjem | Kan siteres utad? |
|---|---|---|---|---|
| **A — Kunnskapsgrunnlag** | Siterbare fakta | Primærkilde + claim-lock + gate + adversariell verifikasjon | `research/external/`, casestatus-flate | Ja (med caveats) |
| **B — Analyse/syntese** | Systemmodell, objektivfunksjon, kryss-koblinger | Logisk koherens + evidens-pekere til A; «ikke faktastemme» | `research/forstaelse/`, `docs/project/analysis/` | Som analyse, aldri som fakta |
| **C — Utforskning/strategi** | Scenarier, hypoteser, «hva hvis», produktidéer, provokasjoner, brainstorm | Eksplisitt spekulativ; merket; ingen kildekrav | ny `docs/project/sandbox/` (eller `research/utforskning/`) | Nei — internt sandbox |
| **D — Produkt/plattform** | App-bygging | Kode-gater: lint/build/test + control-layer | `src/`, PR-er | Produktet selv |

Poenget: **Spor C er det du ba om — et sted å jobbe fritt uten å være låst av claim-lock.** Det er ikke slurv; det er et bevisst rom for tenkning som ennå ikke skal være fakta. Forskjellen fra A er bare at det er *merket* som utforskning, så det aldri forveksles med grunnlaget.

## 5. Brannmurer og forfremmelsesvei (det som gjør det trygt)

Regelen som holder det hele sammen: **idéer kan bare forfremmes oppover ved å møte det høyere sporets bar — aldri implisitt.**

- **C → B:** en hypotese fra sandbox blir analyse først når den forankres i evidens-pekere til A.
- **B → A:** en syntese blir siterbar fakta først når det siterte re-hentes som primærkilde og verifiseres (akkurat slik R5-konverteringene fungerte).
- **Nedover er fritt:** A og B kan alltid mate C (du kan spekulere på toppen av fakta).
- **Ingen lekkasje oppover:** spor C-materiale går aldri inn i deck/hvitbok/claim-lock uten å gå gjennom forfremmelsen. Det er hele forskjellen på «åpne opp» og «miste tilliten».

Dette er presis samme disiplin vi alt brukte (forståelse ≠ fakta), bare gjort til en eksplisitt, tosidig membran med flere rom.

## 6. Hvordan sporene reflekteres i plattformen

Plattformen har allerede byggeklossene (jf. plattform-notatet):
- **Tillit-/spor-badge:** gjenbruk `citationReadiness`/`coverageNote`-mønsteret fra `dybdeanalyse.ts` til en synlig markør «A: siterbar / B: analyse / C: utforskning» på hvert element. En leser ser umiddelbart hvilket epistemisk nivå hun ser på.
- **Control-layer-taksonomi:** utvid `FoodTgControlStatus` med eksplisitte spor-tagger, så styringen av kunnskapen kjenner sporet.
- **Sandbox-rute (valgfri):** en intern `/sandbox` eller seksjon som er tydelig merket utforskning, adskilt fra `/innsikt` og `/hvitbok`.

Da blir flersporetheten ikke bare en mappestruktur, men noe leseren *ser* — som er den ærlige måten å ha både et stramt grunnlag og et åpent tankerom i samme produkt.

## 7. Anbefalte neste tre trekk

1. **Vedta objektivfunksjonen** (anbefalt: Sett II — resiliens + sirkularitet + bondeøkonomi som blindsonen). Alt annet kalibreres mot den.
2. **Opprett spor C formelt** — en `docs/project/sandbox/`-mappe + en kort «spor-regler»-side som koder membranen i §5. Da kan vi umiddelbart begynne å jobbe utforskende (scenarier, strategi, produktidéer) uten claim-lock-friksjon.
3. **Implementér S1 fra plattform-notatet** (utvid `effects` med helse/distrikt/resiliens + lins-velger) — speilet på den valgte objektivfunksjonen, så biasen blir synlig og linsen velgbar i appen.

---

*Kort sagt: behold det stramme grunnlaget urørt, men gi tenkning, scenarier og strategi et eget merket rom (spor C) med en enveis-membran oppover. Da kan vi jobbe i flere spor samtidig — fritt der det skal være fritt, strengt der det skal være siterbart — uten at de to forurenser hverandre. Den ene beslutningen som låser opp resten er objektivfunksjonen.*
