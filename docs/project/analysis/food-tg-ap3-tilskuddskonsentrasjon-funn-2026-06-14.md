---
tittel: Food TG AP-3 — Tilskuddskonsentrasjon: funn 2026-06-14
status: Internt analysefunn (første kjøring)
eier: Gabriel
dato: 2026-06-14
arbeidspakke: AP-3 i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
datakilde: Landbruksdirektoratet åpne data — produksjons- og avløsertilskudd (samme primærkilde som scripts/import-produksjonstilskudd.ts)
bruksregel: Internt analysefunn. Tilskudd ≠ misbruk. Tallene er mottaker-nivå (sum av alle ordninger per orgnr/år), ikke transaksjoner. Går gjennom claim-lock/PCQ før ekstern bruk. 2024-tallene er ufullstendige (se §4) og skal ikke brukes som sammenligning før verifisert.
relaterte_filer:
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - scripts/analyze-subsidy-concentration.ts
  - tests/scripts/analyze-subsidy-concentration.test.ts
  - research/analyse/ap3-tilskuddskonsentrasjon.json
  - research/norge/kvantitativ-dybdeanalyse.md
  - docs/project/figures/food-tg-2026-06-14/fig-ap3-lorenz-tilskudd.svg
---

# AP-3 — Tilskuddskonsentrasjon: funn

## 1. Kort funn

Norske produksjons- og avløsertilskudd er **moderat konsentrert — ikke ekstremt**. På mottakernivå er Gini ~0,52, de øverste 10 % av mottakerne får omtrent en tredjedel av pengene, og de øverste 1 % får bare ~5 %. Medianmottakeren får ~250 000 kr. Det nyanserer den vanlige antakelsen om at «tilskuddene går til de store» — fordelingen har en betydelig midtgruppe. Samtidig får den nederste halvparten av mottakerne bare ~12 % av totalen, så det finnes en lang hale av små mottakere.

Konsentrasjonen drives av de strukturavhengige ordningene (husdyr-, areal- og kulturlandskapstilskudd), som skalerer med dyretall og areal — så en del av konsentrasjonen reflekterer gårdsstruktur, ikke «kapring». Dette er et kalibreringsfunn, ikke en anklage.

**Datakvalitetsflagg:** 2024-tallene er ufullstendige i åpne data (kun 3 av 15 ordninger fylt inn) og er holdt utenfor sammenligningen — se §4.

## 2. Tall

Pålitelige år (alle ordninger til stede): **2022 og 2023**.

| År | Mottakere | Total (mrd NOK) | Gini (mottaker) | Topp 1 % | Topp 10 % | Median | Gini (kommune) |
|---|---|---|---|---|---|---|---|
| 2022 | 37 748 | 15,21 | 0,521 | 5,3 % | 32,2 % | 244 000 | 0,471 |
| 2023 | 37 390 | 17,25 | 0,541 | 5,5 % | 33,8 % | 260 000 | 0,476 |
| 2024* | 36 730 | 10,94* | 0,512* | 6,2 % | 34,4 % | 192 000 | 0,474 |

\* 2024 er ufullstendig (kun 3 ordninger i åpne data per 14.06.2026); total er ~⅓ for lav. Ikke bruk som trend.

Lorenz-kurven (2023): nederste 50 % av mottakerne holder 11,8 %, nederste 70 % holder 29,1 %, øverste 10 % holder 33,8 %. Figur: `docs/project/figures/food-tg-2026-06-14/fig-ap3-lorenz-tilskudd.svg`.

Topp-ordninger 2023 (andel av total): husdyrtilskudd 26,5 %, arealtilskudd 18,2 %, kulturlandskapstilskudd 15,0 %, melkeproduksjon 12,1 %, avløsertilskudd 8,9 %.

## 3. Tolkning — er dette ikke-opplagt?

Tre forsvarbare, ikke-trivielle observasjoner:

1. **Moderat, ikke ekstrem konsentrasjon.** Gini ~0,52 og topp-10 %-andel på ~⅓ er langt fra et bilde der «de store tar alt». Til sammenligning er inntekts-Gini i Norge ~0,27 — tilskuddene er altså mer ujevnt fordelt enn inntekt, men med en stor midtgruppe (median ~250 k). Dette er en kvantifisert korreksjon av en utbredt antakelse.
2. **Tynn bunn, ikke tung topp.** Skjevheten ligger mer i halen enn i toppen: nederste 50 % deler ~12 %, mens topp 1 % bare tar ~5 %. Fordelingen er «mange små, en bred midt», ikke «få giganter».
3. **Strukturdrevet.** Konsentrasjonen følger husdyr-/areal-/kulturlandskapsordningene, som per design skalerer med produksjonsomfang. Det betyr at konsentrasjonen delvis måler gårdsstruktur, ikke fordelingspolitisk skjevhet — en viktig nyanse før noen leser tallet som «urettferdig».

Regional fordeling er jevnere (Gini ~0,47 over 350 kommuner) enn mottakerfordelingen — pengene er spredt bredere geografisk enn per foretak.

## 4. Datakvalitetsflagg: 2024 ufullstendig

Analysen fanget en datafelle som illustrerer hvorfor disiplinen finnes. 2024-datasettet i Landbruksdirektoratets åpne data har **kun 3 av 15 ordninger fylt inn** (husdyr-, areal-, kulturlandskapstilskudd) — melkeproduksjon, avløser- og resten mangler. Det gir en kunstig lav total (10,94 mrd mot 15–17 mrd) og en lavere median. **2024-tallene skal ikke brukes som reell nedgang eller trend** før de er verifisert mot Landbruksdirektoratets publiserte totaler for søknadsåret. Et tall som *ser ut* som en dramatisk kutt (−37 %) er nesten sikkert et artefakt av ufullstendig åpne data.

## 5. Lakmustest

> Produserer pakken minst én påstand en bransjeinnsider ikke allerede vet, forsvarbar med data?

**Ja, betinget.** At norske produksjonstilskudd er *moderat* (ikke ekstremt) konsentrert, med tallfestet topp-10 %-andel og en tynn bunnhale, er en kalibrering de fleste ikke har kvantifisert — og den peker mot at den virkelig konsentrerte makten ligger andre steder enn i produksjonstilskuddet (marked/distribusjon, kvoter, eierskap), som er nettopp det C-sporet og AP-1/AP-2 skal teste. Caveat: må alltid leveres med struktur-forbeholdet, ellers leses den feil.

## 6. Claim-lock-rad (utkast)

| Felt | Innhold |
|---|---|
| Claim-ID | CL-AP3-001 (utkast) |
| Påstand | Norske produksjons- og avløsertilskudd er moderat konsentrert på mottakernivå (Gini ~0,52, 2022–2023); øverste 10 % får ~⅓, nederste 50 % får ~12 %. |
| Evidens | Landbruksdirektoratet åpne data 2022–2023; mottaker-aggregat; `scripts/analyze-subsidy-concentration.ts` (matematikk enhetstestet). |
| Risiko | Kan leses som «misbruk» eller fordelingsdom; struktur-effekt kan overses. |
| Stoppspråk | Ikke si at tilskudd er «kapret av de store», ikke bruk 2024-total, ikke kall konsentrasjon urettferdig uten struktur-/policy-kontekst. |
| Status | `intern baseline` — ikke ekstern faktastemme før PCQ-verifisering av 2024 og struktur-kontroll. |

## 7. Forbehold

- **Mottaker-nivå, ikke transaksjon:** sum over alle ordninger per orgnr/år; ett foretak = én mottaker.
- **Kun produksjons- og avløsertilskudd:** ikke totalt landbruksstøtte (markedsordninger, investeringsstøtte, kvoteverdi, tollvern er ikke med). Konklusjonen gjelder denne tilskuddstypen.
- **Struktur ≠ skjevhet:** ordningene er delvis utformet etter omfang; konsentrasjon reflekterer dels gårdsstruktur.
- **2024 ufullstendig** (§4).
- **To pålitelige år** gir ikke en trend; 0,521 → 0,541 er innenfor støy.

## 8. Neste

1. Verifiser 2024-fullstendighet mot Landbruksdirektoratets publiserte totaler; kjør analysen på nytt når datasettet er komplett.
2. Kjør AP-1 (styreoverlapp/maktnettverk) — der ligger den mer sannsynlige «makt»-historien.
3. Hvis ønsket: AP-2 (HHI per verdikjede-node) for å teste hypotesen i §5 om at konsentrasjonen er størst utenfor produksjonstilskuddet.
4. Løft CL-AP3-001 til claim-register ved bruk; behold som intern baseline til da.

## 9. Verifikasjon

Tall er produsert av `scripts/analyze-subsidy-concentration.ts` (kjørt 14.06.2026, år 2022–2024) mot Landbruksdirektoratets åpne data; rådata-aggregat i `research/analyse/ap3-tilskuddskonsentrasjon.json`. Gini/Lorenz/topp-andel-funksjonene er enhetstestet i `tests/scripts/analyze-subsidy-concentration.test.ts` mot kjente verdier: lik fordeling → 0, [1,2,3,4] → 0,25, sterkt skjev [1,1,1,100] → 0,7209, toppandel og Lorenz-deciler. 2024-flagget er utledet av at kun 3 ordninger har data i schemeBreakdown. Ingen påstand er løftet til ekstern bruk.
