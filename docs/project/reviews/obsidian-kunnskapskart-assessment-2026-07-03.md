---
tittel: Obsidian kunnskapskart - assessment
dato: 2026-07-03
arbeidsflate: Food Systems Obsidian/
status: intern-vurdering
siterbarhet: intern
---

# Obsidian kunnskapskart - assessment

## Kort konklusjon

Ja, Obsidian-kartet gir mening, men det bør leses som et internt cockpit-kart og ikke som en lineær rapport. Det viser hvor innsikter, gaps, verdikjedeledd, aktører og makt-/eierskapsstruktur henger sammen.

Det viktigste for leseren er at en node i grafen betyr "her finnes et arbeidsobjekt eller en kobling", ikke "dette er en ferdig ekstern konklusjon".

## Hva kartet forteller

- `Welcome.md` gir inngangen og bruksregelen: kartet er internt, og ekstern bruk krever claim-lock.
- `0 Kart/HUB – Kunnskapsdatabasen.md` er arkiv- og navigasjonslaget.
- `10 Innsiktskart/Innsiktskartet.md` er analyseflaten: beviskjede, gaps, looper, Norden og verdikjede.
- `11 Maktkart/Maktkartet.md` er strukturflaten: eierskap, konsern, styreoverlapp og kontrollbaner.
- `.obsidian/graph.json` filtrerer bort store deler av arkivet i standardvisningen for å gjøre grafen mer lesbar.

## Hvorfor det kan kjennes uklart

Kartet blander tre ulike brukeropplevelser:

1. Arkiv: hvor ligger kunnskapen?
2. Analyse: hvilke mønstre peker materialet mot?
3. Presentasjon: hvilke flater kan brukes i møte, app eller rapport?

Det er riktig for et arbeidskart, men det betyr at Obsidian-grafen alene kan virke mer mystisk enn den er. Standardgrafen er et kuratert utsnitt, ikke hele kunnskapsbasen.

## Repo-bevis

Assessmenten bygger på en ren sjekk fra `origin/main` 2026-07-03.

- Vaultflater: 795 totalt.
- Markdown-noter: 764.
- Canvas-flater: 31.
- Omtrent synlig i standardgrafen: 167 flater.
- Omtrent skjult av standardfilteret: 628 flater.

Kontroller kjørt:

- `npm run vault:check` - grønn.
- `npm run vault:review-preflight` - grønn.
- `npm run vault:review-samples` - grønn.
- `npm run vault:review-closeout` - grønn.

## Anbefalt leserekkefølge

1. `Food Systems Obsidian/Welcome.md`
2. `Food Systems Obsidian/0 Kart/HUB – Kunnskapsdatabasen.md`
3. `Food Systems Obsidian/10 Innsiktskart/Innsiktskartet.md`
4. `Food Systems Obsidian/11 Maktkart/Maktkartet.md`
5. Canvas-flater etter behov: `Oversiktskart`, `Verdikjedekart`, `Maktkart`, `Sirkularitet`, `Norden`.

## Vurdering

Kartet er meningsfullt som intern styrings- og analyseflate. Det gjør særlig tre ting godt:

- Det skiller kunnskapsarkiv fra innsiktskart og maktkart.
- Det gjør gaps og neste research-spørsmål synlige.
- Det holder siterbarhet og intern bruksregel eksplisitt.

Svakheten er primært pedagogisk: en ny bruker kan trenge en tydeligere "les dette først"-sti og en kort forklaring på at grafnoder ikke er ferdige claims.

## Stopplinje

Ikke bruk grafen som eksternt bevis i seg selv. For ekstern bruk må tall, aktørpåstander, personkoblinger og årsaksspråk fortsatt gå gjennom claim-lock og siterbarhets-gate.
