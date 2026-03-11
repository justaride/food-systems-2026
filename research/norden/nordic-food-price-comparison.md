# Nordisk matpris-sammenligning: inflasjon vs prisnivå

**Dato:** 10. mars 2026  
**Status:** Første kvantitative draft for nordisk prisdel  
**Formål:** Skille mellom to ulike spørsmål:
- Hvor raskt har matprisene steget?
- Hvor dyrt er mat faktisk i hvert land?

---

## Hovedfunn

1. **Sverige hadde sterkest matprisvekst**, ikke Norge.  
   Harmonisert matprisindeks (HICP) steg **51,9 %** i Sverige fra januar 2015 til desember 2025, mot **42,8 %** i Norge.

2. **Norge var likevel det dyreste matmarkedet i Norden i 2024.**  
   Eurostats prisnivåindeks for mat og alkoholfrie drikkevarer var **131,2** i Norge, mot **120,2** i Danmark, **109,8** i Finland og **106,4** i Sverige.

3. **Norsk prisvekst har vært særlig sterk de siste tre årene.**  
   Fra januar 2023 til desember 2025 steg norsk HICP for mat med **17,6 %**, mot **9,1 %** i Sverige, **8,0 %** i Danmark og **3,3 %** i Finland.

4. **Norges problem er derfor ikke bare inflasjon, men nivå.**  
   Selv når Sverige har hatt sterkere samlet inflasjon, er norsk mat fortsatt dyrere i absolutt forstand.

---

## Sammenlikningstabell

| Land | HICP matvekst 2015-01 → 2025-12 | HICP matvekst 2021-01 → 2025-12 | HICP matvekst 2023-01 → 2025-12 | HICP matvekst 2024-12 → 2025-12 | Prisnivå 2024 (EU27_2020=100) | Norsk premium |
|---|---:|---:|---:|---:|---:|---:|
| Norge | 42,8 % | 29,4 % | 17,6 % | 5,2 % | 131,2 | — |
| Danmark | 35,0 % | 28,6 % | 8,0 % | 3,5 % | 120,2 | +9,2 % |
| Sverige | 51,9 % | 34,1 % | 9,1 % | 3,6 % | 106,4 | +23,3 % |
| Finland | 24,3 % | 23,1 % | 3,3 % | 2,0 % | 109,8 | +19,5 % |

---

## Tolkning

### 1. Inflasjon og prisnivå er ikke det samme

Dette er den viktigste avklaringen i det nordiske materialet:

- **Sverige** har hatt den sterkeste prosentvise matprisveksten i perioden.
- **Norge** har det høyeste absolutte prisnivået.

Det betyr at fortellingen ikke bør være «Norge har hatt mest inflasjon». Den mer presise formuleringen er:

> Norge kombinerer høyt prisnivå med sterk nyere prisvekst.

### 2. Norge skiller seg mer ut etter 2023

Fra januar 2023 til desember 2025 ligger Norge klart over Danmark, Sverige og Finland i veksttakt. Det peker på at den norske matprisutviklingen etter selve inflasjonssjokket ikke bare følger et generelt nordisk mønster.

### 3. Danmark er dyrt, men Norge er dyrere

Danmark er nærmest Norge i prisnivå, men ligger fortsatt **9,2 %** lavere i 2024. Det er viktig fordi Danmark samtidig har lavere markedskonsentrasjon og høyere selvforsyning. Danmark blir derfor et nyttig kontrastcase.

### 4. Sverige er det beste sammenlikningslandet for "dyrt vs. inflasjon"

Sverige er interessant fordi landet:
- har høy konsentrasjon
- har hatt sterk matinflasjon
- men fortsatt ligger klart under Norge i absolutt prisnivå

Det gjør Sverige nyttig for å teste hvor mye av Norges særstilling som kan forklares av generell inflasjon, og hvor mye som må forklares av markedsstruktur, importavhengighet eller politikk.

---

## Hvordan dette kan brukes i whitepaperet

Tre formuleringer som er mer presise enn den nåværende norske prisfortellingen:

1. **Norge er ikke landet med høyest samlet matinflasjon i Norden, men det er landet med høyest matprisnivå.**
2. **Etter 2023 har norsk matprisvekst vært sterkere enn i Danmark, Sverige og Finland.**
3. **Norsk mat framstår som både dyr og nylig raskt dyrere, noe som styrker argumentet om en særnorsk sårbarhet.**

---

## Figurer

- `research/visualisering/figurer/fig10_nordic_food_inflation_hicp.png`
- `research/visualisering/figurer/fig11_nordic_food_price_levels.png`

---

## Metode

### Datakilder

- `research/data/eurostat_hicp_food_monthly_2015_2026.csv`
- `research/data/eurostat_price_level_indices_food_2015_2024.csv`

### Definisjoner

- **HICP:** Harmonised Index of Consumer Prices. Brukes for sammenliknbar inflasjon på tvers av land.
- **Prisnivåindeks (PLI):** Prisnivå relativt til EU27=100. Viser hvor dyrt mat faktisk er, ikke bare hvor raskt prisene stiger.

### Viktig begrensning

HICP-serien går til **desember 2025**, mens prisnivåindeksen foreløpig bare går til **2024**. De to målene beskriver derfor ulike sider av prisbildet og bør ikke blandes sammen ukritisk.
