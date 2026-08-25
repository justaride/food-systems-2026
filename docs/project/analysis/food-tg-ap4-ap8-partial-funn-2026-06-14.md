---
tittel: Food TG AP-4 + AP-8 — delfunn og needs-data-avgrensning: 2026-06-14
status: Internt — AP-4 delvis (kjerne lukket 2026-08-25: ikke beregnbar som spesifisert, §4b), AP-8 needs-data-kjerne + regionalt null-funn
eier: Gabriel
dato: 2026-06-14
arbeidspakke: AP-4 + AP-8 i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
bruksregel: Internt analysefunn. Korrelasjon ≠ årsak. Begge pakkers kjernehypoteser er DB-/data-avhengige; dette notatet dokumenterer det som er forsvarbart NÅ og spesifiserer presist hva som lukker resten. Går gjennom claim-lock/PCQ før ekstern bruk.
relaterte_filer:
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md
  - docs/project/analysis/food-tg-maktkart-section8-3-4-funn-2026-06-14.md
  - public/data/food-systems/no/value-chain.json
  - public/data/food-systems/financial_insights_2024.json
  - research/analyse/ap3-tilskuddskonsentrasjon.json
---

# AP-4 + AP-8 — delfunn og needs-data-avgrensning

Begge pakkene har en kjernehypotese som krever data prosjektet ikke har tilgjengelig DB-fritt. Dette notatet skiller det forsvarbare **nå** fra det som er `needs-data`, med presis spesifikasjon av hva som lukker hver.

## AP-4 — Verdifangst-asymmetri (volum vs. verdi)

### Delfunn (committet data)

Committet `no/value-chain.json` (2024) gir node-/kjedeledd-tall (ikke per aktør). To forsvarbare observasjoner:

1. **Verdi-tetthet stiger kraftig oppstrøms på lik tonnasje.** Primærlandbruk og sjømat flytter nesten lik tonnasje (3,29 mot 3,80 mill. tonn), men sjømat skaper **~2× verdi per tonn**: ≈16 700 NOK GVA/tonn (sjømat) mot ≈8 500 NOK/tonn (landbruk).
2. **Volum-dominans ≠ marginfangst nedstrøms.** Detaljhandelen har høyest konsentrasjon (CR3 96,6 %, HHI 3327 — KT-omsetning 2024, harmonisert jf. D2/kryss-node §11) men blant de tynneste rapporterte marginene (NorgesGruppen retail-segment 2,6 %, Coop 1,0 %, Virke-snitt 1,9 %). Konkurransetilsynet og Oslo Economics (sitert i `financial_insights_2024.json`) plasserer høyere marginer / «super profit» på **leverandørleddet**, ikke detaljistleddet. Dette er andres analyse referert i committet fil, ikke et eget regnestykke.

### Kjerne = needs-data (DB-join) — *avkreftet som spesifisert, se §4b*

> **Denne spesifikasjonen holder ikke.** Den ble målt mot prod 2026-08-25 og
> bygger på to premisser som begge er feil: at leverandørsiden broes via
> `Company.id`, og at finansdekningen er ~50 %. Avsnittet står som skrevet for
> sporbarhet; §4b under er det som gjelder.

Selve hypotese-testen — per-aktør volum↔margin-divergens — krever DB-en: `DeliveryVolume` (~60 310 rader, volum per leverandør) × `CompanyFinancial` (omsetning/margin), bro via `Company.id`. Metode for lokal kjøring: normaliser volum til tonn per commodity, left-join til regnskap, flagg `hasFinancial` (~50 % treff), Spearman volum↔margin, aggreger til ledd. **Finansdekning ~50 % (funn A1) → systematisk skjev mot store/konsern; ingen korpus-ekstrapolering.**

### §4b — Målt mot prod 2026-08-25: kjernen er ikke `needs-data`, den er ikke beregnbar som spesifisert

O1 (PR #372) la finansdekning til `/api/data-status` nettopp for å avgjøre om
AP-4 var verdt å bygge før vi bygget den. Tallet er nå lest. Det avkrefter
premisset, og på en annen måte enn ventet.

**Målt fra prod (`/api/data-status`, commit `8234c2a`):**

| Størrelse | Junianslag | Målt |
|---|---|---|
| Selskaper med regnskap | ~50 % | **16,6 %** (60 av 361) |
| Selskaper med regnskap **og** leveransevolum | forutsatt brukbart | **1** |

Men det andre tallet er ikke et datahull, og det er den viktige delen:

**`DeliveryVolume` har to selskapssider, og spesifikasjonen over peker på feil.**
`deliveriesFrom` (`DeliverySupplier`) er bondeleddet — og bønder ligger i
`Producer` etter produsentseparasjonen, ikke i `Company`. `import-leveransedata.ts`
setter `supplierProducerId` → `Producer`, aldri `supplierId` → `Company`.
Leverandørsiden er derfor tom **ved konstruksjon**. Den blir ikke høyere av mer
import, og «bro via `Company.id`» beskriver en kobling som ikke finnes.

Verdifangst måles uansett på kjøpersiden. Der er grensen hard på en annen måte:
`import-leveransedata.ts` er eneste skriver av `DeliveryVolume`, og den har
**tre** distinkte kjøpere — TINE SA, Nortura SA, Felleskjøpet Agri SA. Hele
kjøpersiden er altså ≤ 3 selskaper.

**Konsekvens for statusen.** AP-4s kjerne er spesifisert som Spearman
volum↔margin *på tvers av aktører*. Med n ≤ 3 er den rangkorrelasjonen ikke
beregnbar — ikke «tynn», ikke «skjev», men uten fortolkning. Kjernen flyttes
derfor fra `needs-data` (som betyr «venter på data») til **`lukket — ikke
beregnbar som spesifisert`**. Det er ikke arbeid som venter på DB-tilgang.

To ting dette **ikke** betyr:

- Det avkrefter ikke delfunnet. Kjedeledd-tallene fra `value-chain.json` (§«Delfunn») står uendret — de er node-nivå og rører ikke per-aktør-joinen.
- Det sier ikke at verdifangst er umålelig i prinsippet. Det sier at *denne* operasjonaliseringen ikke er det mot *denne* datamodellen. En per-aktør-test ville kreve en annen kilde til aktørnivå-volum enn leveranseregisteret — ikke en DB-tilkobling til det vi har.

*Registrert 2026-08-25. Måleendringen som gjør begge sider synlige, ligger i PR #373.*

### CL-AP4-001 (utkast)

> «På 2024-tall flytter norsk primærlandbruk og sjømat tilnærmet lik tonnasje (3,3 mot 3,8 mill. tonn), men sjømat skaper ~2× så mye verdi per tonn (≈16 700 mot ≈8 500 NOK GVA/tonn). Nedstrøms har detaljhandelen høyest konsentrasjon (CR3 96,6 %) men blant de laveste rapporterte prosentmarginene; Konkurransetilsynet/Oslo Economics plasserer høyere marginer oppstrøms. En full volum-mot-verdi-test per aktør er **needs-data** — den krever DB-koblingen DeliveryVolume × CompanyFinancial (~50 % dekning, ikke ekstrapolerbar).»

Status: `klar-med-forbehold` for delfunnet; `needs-data` for hovedpåstanden. Forbehold: ~50 % finansdekning; node-margin for foredling/distribusjon/detalj mangler i committet data; GVA/tonn blander inn importert råstoff (sjømat-fôr ~92 % importert) → verdi/tonn ≠ ren norsk verdiskaping.

## AP-8 — Tilskudd-mot-konsentrasjon-korrelasjon

### Kjerne = needs-data (node-HHI)

Den opplagte testen (tilskuddsintensitet per node × node-markeds-HHI) er **blokkert**: ekte node-markeds-HHI er `needs-data` for nesten alle noder (kun retail har ett, fra §8 steg 3), og produksjonstilskudd går til *primærprodusenter*, ikke retail — så aksen hypotesen krever (subsidie-node = produksjon; HHI-node = produksjon) mangler HHI-siden. AP-2s inntekts-HHI er n-følsom og skal ikke brukes som konsentrasjonsmål (stoppspråk fra AP-2/maktkart). Lukkes av: markeds-HHI for produksjons-/foredlingsnoder (meieri/TINE, kjøtt/Nortura via markedsregulator) + en mapping tilskuddsmottaker(orgnr)→produksjonsnode.

### Regionalt null-funn (testbart nå, gyldig resultat)

Reprodusert fra AP-3-aggregatet (eksakt match mot `ap3-tilskuddskonsentrasjon.json`):

- Regional konsentrasjon **stabil**: giniKommune ~0,47, topp-decil-kommuner ~32 % av total, 2022–2024.
- **Mottakere per kommune vs tilskudd per mottaker:** Pearson r ≈ **−0,05** (ikke-signifikant, n≈350, alle tre år). Tilskudd per bonde er ikke systematisk høyere i fragmenterte eller konsentrerte kommuner.
- Total tilskudd per kommune ∝ antall mottakere (r ≈ 0,92).
- Topp-decil-kommuner: 28,5 % av mottakerne, 32,0 % av pengene (mild per-bonde-intensivering, ~12 % over snitt).

Tolkning: produksjonstilskuddenes regionale fordeling følger i hovedsak *hvor bøndene er*, med kun mild per-bonde-forsterkning i de største regionene — **regionalt strukturnøytral** på per-mottaker-nivå. Et legitimt «testet, negativt»-resultat (arbeidsplan §6) som bekrefter AP-3 (moderat, strukturdrevet konsentrasjon).

### CL-AP8-001 (todelt)

- **Kjerne (node-HHI × tilskudd): `needs-data`.** Ikke lån retail-HHI eller AP-2s inntekts-HHI inn i en tilskuddskorrelasjon.
- **Regional subpåstand: `klar-med-forbehold` (smal):** «Norske produksjonstilskudd fordeles regionalt i hovedsak proporsjonalt med mottakertetthet (r ≈ 0,92, 2022–2024). Ingen signifikant samvariasjon mellom mottakertetthet og tilskudd per mottaker (r ≈ −0,05, ikke-sign., n ≈ 350, alle tre år) — støtten er på dette målet regionalt strukturnøytral.»

Forbehold: korrelasjon ≠ årsak; regional struktur-test, **ikke** node-HHI-testen AP-8 egentlig spesifiserer; mottakertetthet er proxy for fragmentering, ikke markeds-HHI; mottaker-nivå, brutto.

## Verifikasjon

AP-4-tallene er fra committet `value-chain.json`/`financial_insights_2024.json` (alle sitert); kjernen er eksplisitt DB-needs-data. AP-8 reproduserte AP-3-aggregatet eksakt (giniKommune/totaler/mottakertall) fra Landbruksdirektoratets åpne data; korrelasjonene er på kommune-aggregat med n og signifikans rapportert. Ingen committet fil endret under analysen; ingen påstand løftet til ekstern bruk. Begge kjernehypoteser står som `needs-data` med presis datakravsspesifikasjon.
