---
tittel: Food Systems 2026 — visuell produksjonsrekkefølge
dato: 2026-07-16
status: aktiv produksjon
gate: internal
eier: prosjektledelsen
---

# Visuell produksjonsrekkefølge

Dette dokumentet er utførelseskontrakten for den visuelle videreutviklingen av
plattformen. Det oppretter ikke en ny faktakilde. Tall, aktørkoblinger og
publiseringsstatus følger fortsatt claim-lock, kildekontrakter og
`food-systems-completion-register-2026-07-15.md`.

## Prinsipp

Plattformen skal utvikles som ett systematlas, ikke som flere parallelle
dashboards. Farge viser analyselag. Linjemønster viser evidenstype. Gap vises som
gap og skal ikke fylles med illustrative verdier.

## Produksjonsrekkefølge

| Slice | Leveranse | Status | Definition of done |
|---|---|---|---|
| V1 | Felles evidensgrammatikk og Matsystemets snitt | Implementert og verifisert lokalt | Sju ledd, fem lag, kategoriske forbindelser, gapmarkering, desktop/mobil-QA og grønne porter |
| V2 | Påstandens røntgenbilde | Neste | Påstand → beregning → kilder → forbehold → bruk, med fail-closed ekstern status |
| V3 | Kunnskapsfronten | Kø | Domene × dekning × sikkerhet × gaptype × neste kontroll, uten kunstig ferdigprosent |
| V4 | Maktprofil gjennom verdikjeden | Kø | Punkt, intervall, gulv og manglende verdi holdes metodisk atskilt |
| V5 | Nordisk metodepass | Kø | Definisjon, år, enhet, marked og kilde må passere før land sammenlignes |
| V6 | Case × beslutningsport | Kø | Eier, data, aktør, off-taker, juss, baseline, budsjett og neste handling i én matrise |
| V7 | Matsystemets metabolisme | Senere | R-stige, N/P/K og materialflyt samlet uten å overdrive realiserte mengder |
| V8 | Sårbarhetskaskade | Blokkert av data | Kapasitet, redundans, lager og tidshorisont dokumentert før scenarioflate |

## V1-grenser

- Systemkartet er navigasjon og forklaring, ikke massebalanse.
- Like brede forbindelser betyr kategorisk kobling, ikke volum.
- `EvidenceStatus`, `CitationReadinessLevel` og `ResearchEvidenceStatus` holdes
  som tre separate akser.
- Omsetnings-HHI 3 327 og CR3 96,6 % holdes atskilt fra butikkantall-proxy.
- Manglende nodekapasitet og realisert N/P/K-retur vises eksplisitt som gap.

## V1-verifikasjon

- Fokuserte kontraktstester: 57 av 57 bestått.
- Full testsuite: 809 av 809 bestått.
- Lint og produksjonsbygg: bestått.
- Overclaim-port og siterbar rapportkontroll: bestått.
- Nettleser-QA: analyselag, statusmønstre og gaptilstander kontrollert på desktop;
  375 px mobilvisning har sju like brede, vertikalt stablede kort uten horisontal
  overflyt.
- Genererte måle- og dekningsfiler ble ikke tatt inn som del av slisen; kun
  tidsstempelstøy fra verifikasjonen ble normalisert bort.

## Neste produksjonsstart

V2 starter med en liten, kontrollert claim-kontrakt og én demonstrator fra
dagligvarekonsentrasjon. Den skal ikke åpne generell ekstern publisering.
