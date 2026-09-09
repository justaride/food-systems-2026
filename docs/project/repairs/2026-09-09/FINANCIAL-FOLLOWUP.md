# FS04/09 - Holdbart 2024 oppfølging

Dato: 2026-09-09
Status: mekanisk avvik avklart; eksakt NOK-verdi krever fortsatt menneskelig valg

## Faktisk avklart

1-kronesavviket kan reproduseres fra samme offisielle 2024-kopi:

- De fire kostnadslinjene summerer til 556 138 448 NOK.
- Den viste summen for driftskostnader er 556 138 449 NOK, altså én krone høyere.
- Driftsinntekter 579 112 420 minus kostnadslinjene gir 22 973 972 NOK. Dette er driftsresultatet på fysiske PDF-sider 16 og 27.
- Driftsinntekter minus den viste kostnadssummen gir 22 973 971 NOK. Dette er driftsresultatet på fysisk PDF-side 2.
- Netto finans 3 336 822 pluss 22 973 972 gir vist resultat før skatt 26 310 794. Den lavere driftsresultatverdien ville gitt 26 310 793.

Avviket skyldes dermed mekanisk en intern inkonsistens mellom kostnadssummen og kostnadslinjene. Kilden rapporterer hele NOK og gir ikke grunnlag for å forklare dette som avrunding.

En ny nedlasting fra samme Brreg-endepunkt har samme størrelse og identiske gjengivelser av sidene 2, 16 og 27. PDF-hashen er ulik bare fordi trailerens dokument-ID er regenerert; den nye kopien løser ikke regnskapsavviket. Brregs åpne nøkkeltall-API ga ikke et reproduserbart historisk 2024-oppslag i denne kontrollen og brukes derfor ikke som påstandsgrunnlag.

## Det som mangler

Ingen kildegjengivelse forklarer om kostnadssummen eller en underliggende kostnadslinje er feilført. Det finnes derfor fortsatt ikke kildegrunnlag for å kalle én eksakt NOK-verdi endelig korrekt.

## Kandidat og menneskelig valg

Hvis feltet må lagres i eksakte NOK, er 22 973 972 NOK den sterkest støttede kandidaten: den følger komponentregningen, gjentas på sidene 16 og 27 og avstemmer mot resultat før skatt. Et eventuelt valg må samtidig bevare at side 2 og den viste kostnadssummen gir 22 973 971 NOK.

Hvis feltet brukes med MNOK-presisjon, kan 23,00 MNOK beholdes uten å avgjøre 1-kronesavviket. Valget mellom eksakt kandidat med avviksnote og avrundet verdi krever menneskelig review.

Originaler, sidegjengivelser, eksakte utdrag og maskinlesbar avstemming ligger privat i `restlist/financial-followup`. Ingen import, promotering, reviewregistrering eller kontakt med Holdbart er utført.
