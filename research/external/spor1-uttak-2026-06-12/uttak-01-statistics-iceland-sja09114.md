---
tittel: Uttak 01 — Statistics Iceland SJA09114 biproduktdata (100% Fish)
status: Intern arbeidslogg — uvalidert
eier: Gabriel
dato: 2026-06-12
scope: Lukker DR-1-blokkeren fra desk-research-loggen 12.06 (POST-uttrekk fra PxWeb API v1). Datauttrekk for biproduktlandinger Island, SJA09114, med locator og metode.
relaterte_filer:
  - docs/project/analysis/desk-research-logg-dro-0906-2026-06-12.md
  - research/external/dro-0906/sja09114-by-products-2018-2024.csv
  - research/external/dro-0906/sja09114-all-species-total-1992-2024.csv
---

# Uttak 01 — Statistics Iceland SJA09114

## Metode og locator

- Kilde: Hagstofa Íslands (Statistics Iceland), tabell SJA09114 «Catch and value of by-products by species and type 1992-2024».
- API: `https://px.hagstofa.is/pxen/api/v1/en/Atvinnuvegir/sjavarutvegur/aflatolur/radsofun_afla_vinnsla/SJA09114.px`
- Uttrekk utført 12.06.2026 via HTTP POST (PxWeb API v1, format csv) fra nettlesersesjon. Metadata verifisert via GET samme dag (33 arter × 20 biproduktkategorier × 1992–2024 × tonn/1000 ISK).
- Query A: Fiskitegund {0=All species, 1=Cod} × alle biprodukter × 2018–2024 × begge enheter → `sja09114-by-products-2018-2024.csv`
- Query B: All species × All by-product × 1992–2024 × begge enheter → `sja09114-all-species-total-1992-2024.csv`

## Nøkkelfunn (internt, regnet fra CSV-ene)

1. **Langserien viser en topp-og-fall-bue, ikke jevn vekst:** registrerte biproduktlandinger gikk fra 1 613 t (1992) til topp 58 467 t (2013), deretter ned til 26 000–32 000 t/år (2019–2024). 2024: 30 424 t.
2. **Verdien stiger mens volumet faller:** 7,26 mrd ISK i 2024 (høyeste i serien) mot 5,0 mrd ISK i 2013 ved dobbelt volum. Implisitt snittverdi ~239 ISK/kg i 2024 mot ~85 ISK/kg i 2013 (nominelt, ujustert) — konsistent med høyverdi-dreining.
3. **Lever og hoder dominerer:** 2024 All species: lever 8 524 t / 1,66 mrd ISK; hoder 9 193 t / 2,81 mrd ISK. Hoder har høyest verdi per tonn av volumfraksjonene (~305 ISK/kg).
4. **Torsk bærer biproduktøkonomien:** 12 959 t av 30 424 t (43 %) og 3,26 av 7,26 mrd ISK (45 %) i 2024.
5. **Tunger/kjaker er reelle, men marginale i volum:** fish tongues 10 t, cheeks 1 t (2024) — relevante som høyverdi-eksempler, ikke som volumfortelling.

## Viktige forbehold (ikke-si)

- Tabellen er **registrerte landinger/disponering av biprodukter**, ikke total biomasse eller total utnyttelse. Den kan ikke alene brukes til å beregne en islandsk «utnyttelsesgrad» à la SINTEF-tallene for Norge (89 %). Sammenligning Island–Norge krever metodeavklaring (jf. Strand et al. 2024-referansen i uttak-02).
- Nedgangen etter 2013 må ikke fortolkes som «Island utnytter mindre» uten kvotekontekst (torskekvoter, loddesvikt) — All species-serien samvarierer med totalfangst.
- Verdier er nominelle ISK; ingen KPI-/valutajustering er gjort.

## Ikke hentet / neste steg

- SJA09110 og SJA04903 (de to andre tabellene identifisert i desk-research-loggen) er ikke trukket ut ennå — samme POST-metode fungerer.
- Komponent-/anvendelsesdata (hva leveren/hodene brukes til) finnes ikke i SJA09114; krever IOC/Matís-kilder (AASK-spor).

## Foreslått konsekvens for PCQ/source-shortlist (ikke utført)

- PCQ-0906-007: DR-1-blokkeren «datauttrekk krever manuell PxWeb-eksport» kan lukkes; datagrunnlag ligger som CSV med locator.
- Source-shortlist: SJA09114-uttrekket kan registreres som primærkilde med fil-locator etter mottaksprotokollen.
