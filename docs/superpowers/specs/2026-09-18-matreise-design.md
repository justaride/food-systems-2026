# Matreisen: en illustrert reise gjennom matsystemet

> Dato: 2026-09-18
> Status: spec og plan for første versjon
> Valg tatt av Gabriel 18.09.2026: fokus forsyningssikkerhet, ny side i appen, publikum partnere/NCH/eventer.

## Mål

Én side, `/reise`, som viser hvordan det norske matsystemet fungerer i dag, fra innsatsvarer til tallerken og tilbake til jorda. Hvert ledd leses med ett spørsmål: får folk fortsatt mat når noe svikter?

Siden er for partnere, NCH og eventer. Den er presentasjonsflate, ikke offentlig publisering. Den har samme status som hvitbok v3: utkast til påstandene er stikkprøvet og fersksjekket.

## Avgrensning mot det som finnes

- **Matsystemets snitt** (forsiden) er en matrise: sju ledd × fem lag. Den er et oppslagsverktøy.
- **`/verdikjede`** er nordisk, databasedrevet og har eldre tall som ikke er kontrollert mot påstandsregisteret.
- **Matreisen** er en fortelling med én linse. Den lenker til de to andre, og erstatter dem ikke.

## Innhold og kilde

Alt innhold er kortet ned fra `research/whitepaper/v3/hvitbok-v3-utkast.md`, kapittel 1.2, 2 og 4.2. Ingen nye tall og ingen ny analyse.

- Hver setning med tall har minst én `P-nnn` som peker til `research/whitepaper/v3/pastandsregister.md`.
- Siden viser status per påstand i fem klasser: siterbar, kontrollert internt, hypotese/åpent spørsmål, kunnskapshull, vedtak/metode.
- Tidskritiske påstander (kornlager, høringsfrist) merkes «fersksjekk».
- Vurderinger under «dette holder» som hvitboka selv har uten P-markør, står uten tall og med kapittelhenvisning.
- Personer og den navngitte virksomheten i kornreferansekjeden nevnes ikke.

## Struktur

1. Inngang: tittel, utkastmerke, hva forsyningssikkerhet betyr her, slik leser du reisen.
2. Kart over reisen: åtte stasjoner som lenker nedover, med sløyfe tilbake til start.
3. Åtte stasjoner, i hvitbokas rekkefølge med havet ved siden av gården:
   innsatsvarer → gården → havet → foredling → grossist og logistikk → butikken → kjøkkenet → tilbake til jorda.
   Hver stasjon har illustrasjon, «hva skjer her», ett til tre nøkkeltall, «dette holder», «her kan det ryke», «dette vet vi ikke» og lenker videre i appen.
4. Eksempel hele veien: fra kornlager til brød («reserve er ikke mat»), fem trinn.
5. Tre ting reisen viser, og lenke til hvitboka.

## Visuelt

Følger `DESIGN.md`: steinflater, Outfit, flatt. Emerald for styrke, amber for sårbarhet og utkast, rose for kunnskapshull, sky for evidensstatus. Illustrasjonene er enkle strektegninger i inline SVG, `aria-hidden`, uten egne farger utenfor paletten. Ingen animasjon.

## Teknisk

- `src/lib/data/matreise.ts`: typet innhold og påstandskart (P-ID → status, tidskritisk).
- `src/app/reise/page.tsx` og `ReiseContent.tsx`: serverkomponent, ingen database, ingen klientkode.
- `src/app/reise/StasjonIllustrasjon.tsx`: SVG-scener.
- Navigasjon: ny post først i gruppen Matsystem, med tekst i `messages/no.json` og `messages/en.json`.
- `tests/lib/matreise.test.ts` vokter mot drift:
  - alle P-ID-er finnes i påstandsregisteret,
  - status og tidskritisk-merke stemmer med registeret,
  - ingen tekst med tall står uten P-ID,
  - alle interne lenker peker til ruter som finnes,
  - siden rendres med åtte stasjoner og utkastmerke.

## Ikke med i første versjon

Engelsk innhold, interaktive scenarier, kobling til levende data, nordisk sammenligning per stasjon, PDF-eksport.

## Verifisering

`npm run test`, `npm run lint`, `npm run build`, og visuell kontroll i nettleser på desktop og mobil.
