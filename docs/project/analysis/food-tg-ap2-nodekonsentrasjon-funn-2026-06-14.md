---
tittel: Food TG AP-2 — Eier- og inntektskonsentrasjon per verdikjede-node: funn 2026-06-14
status: Internt analysefunn (første kjøring)
eier: Gabriel
dato: 2026-06-14
arbeidspakke: AP-2 i docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
datakilde: Intern DB — Company.valueChainStage × CompanyFinancial.revenueNok × Shareholder (ownershipPct/type/isControlling)
bruksregel: Internt analysefunn. HHI er beregnet blant kartlagte selskaper med data, ikke et fullstendig markeds-HHI. Sammenligning av HHI på tvers av noder er ikke gyldig (mekanisk n-følsom). Eierstruktur-funnet er det robuste. Går gjennom claim-lock/PCQ før ekstern bruk.
relaterte_filer:
  - docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
  - scripts/analyze-node-concentration.ts
  - tests/scripts/analyze-node-concentration.test.ts
  - research/analyse/ap2-nodekonsentrasjon.json
  - docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md
---

# AP-2 — Eier- og inntektskonsentrasjon per verdikjede-node: funn

## 1. Kort funn

AP-2 bekrefter **ikke** AP-1 på den opplagte måten — og det er nettopp poenget. Inntekts-HHI per node kan ikke sammenlignes på tvers, fordi den er mekanisk følsom for hvor mange selskaper vi har kartlagt (retail har n=100 og dermed lav HHI; inputs har n=13 og dermed høy — uavhengig av faktisk marked). De høyeste HHI-tallene (export-promotion, research, circular) er rene små-n-artefakter.

Det robuste funnet er **strukturelt**: hver node har en distinkt eiersignatur. Retail og logistikk er kooperativ-/familiedominert (Coop, NorgesGruppen, Reitan/REMA, BAMA), sjømat er børsnotert (Mowi, Lerøy, Austevoll), fôr/inputs er kooperativ (Felleskjøpet) pluss utenlandsk (BioMar, Cargill), og foredling er familie + samvirke (Nortura, TINE).

Det forklarer hvorfor AP-1 (styrer) fant makten i retail/logistikk som AP-2 (eierandeler) *ikke* ser: i disse leddene går kontrollen gjennom **samvirke og styreverv, ikke gjennom en konsentrert aksjepost**. Lensen avgjør hva du ser — og det er i seg selv innsikten.

## 2. Tall

Selskaper med data: 173/275 har inntekt (63 %); bare 66/275 har eierdata (24 %). Substansielle noder (n ≥ 10 eller ≥ 4 m/inntekt):

| Node | n | m/inntekt | Inntekts-HHI* | Topp-3 | Kontroll-prevalens | Dominerende eiertype | Toppselskaper |
|---|---|---|---|---|---|---|---|
| foodservice | 17 | 8 | 2 714 | 78 % | 71 % | foreign/family | ISS, BAMA Storkjøkken, Compass |
| inputs/fôr | 13 | 11 | 2 431 | 80 % | 38 % | cooperative (9) | Felleskjøpet Agri, BioMar, Mowi Feed |
| retail | 100 | 61 | 1 637 | 52 % | 19 % | family (40)/cooperative (26) | Coop Norge, Uno-X, Norsk Butikkdrift |
| seafood | 21 | 20 | 1 484 | 57 % | 33 % | listed (15) | Mowi, Austevoll, Lerøy |
| logistics | 25 | 21 | 1 184 | 49 % | 16 % | family (22) | REMA Distribusjon, BAMA, ASKO |
| processing | 52 | 42 | 1 122 | 52 % | 27 % | family (20)/cooperative (16) | Nortura, TINE, Unil |

\* HHI blant kartlagte selskaper — **ikke** markeds-HHI, og **ikke** sammenlignbar på tvers (se §4).

## 3. Tolkning — synet på tvers av AP-1, AP-2, AP-3

De tre analysene gir nå én sammenhengende, ikke-opplagt historie, fra tre uavhengige datakilder:

1. **AP-3 (tilskudd):** produksjonsstøtten er bare moderat konsentrert og strukturdrevet — makten ligger ikke der.
2. **AP-1 (styrer):** maktnettverket av styreoverlapp klumper seg i retail/logistikk/foredling.
3. **AP-2 (eierskap):** akkurat de leddene er *ikke* konsentrert som aksjeeie — de er samvirke- og familiestrukturerte, mens sjømat (børsnotert) er der aksjelensen faktisk virker.

Konklusjonen: **norsk dagligvare- og distribusjonsmakt er ikke synlig gjennom en eierandels-lense — den utøves gjennom kooperativ governance og sammenvevde styrer.** Det er derfor AP-1 lyste opp retail/logistikk mens AP-2s eier-HHI ikke gjør det. En ren eierskapsanalyse ville *bommet* på den makten. Valg av lense er innsikten.

## 4. Datakvalitetsflagg

- **HHI ikke sammenlignbar på tvers av noder.** HHI faller mekanisk med antall kartlagte selskaper. retail (n=100) får lav HHI, inputs (n=13) høy — det måler vår kartleggingsdekning, ikke markedet. De tre høyeste (export-promotion n=1, research n=5, circular n=5) er små-n-artefakter og skal ikke brukes.
- **Eierdekning lav:** kun 66/275 selskaper (24 %) har eierdata; eierstruktur-funnet er en sterk indikasjon, ikke en komplett census.
- **Tomme noder:** property, wholesale, holding, production m.fl. mangler inntektsdata (HHI 0) → `needs-data`.
- **Kontroll-prevalens må tolkes forsiktig:** lav prevalens i retail/logistikk (16–19 %) betyr *ikke* spredt makt — det reflekterer at samvirke og familieeie ikke kodes som «kontrollerende aksjonær».

## 5. Lakmustest

> Produserer pakken minst én påstand en bransjeinnsider ikke allerede vet, forsvarbar med data?

**Ja.** Ikke via HHI (som her ikke holder som markedstall), men via lense-innsikten: at makten i dagligvare/distribusjon er kooperativ- og styrebåren snarere enn aksjekonsentrert, og at det er derfor styre-lensen (AP-1) avslører den. Det er en ikke-triviell metodisk og substansiell observasjon, og den gjør de tre analysene til mer enn summen av delene.

## 6. Claim-lock-rad (utkast)

| Felt | Innhold |
|---|---|
| Claim-ID | CL-AP2-001 (utkast) |
| Påstand | Norske verdikjede-ledd har distinkte eiersignaturer; retail/logistikk er kooperativ-/familiestrukturert (lav formell aksjekontroll), sjømat børsnotert, fôr kooperativ/utenlandsk. Makt i dagligvare/distribusjon vises i governance og styrer, ikke i aksjekonsentrasjon. |
| Evidens | `research/analyse/ap2-nodekonsentrasjon.json`; Company.ownershipType + Shareholder + CompanyFinancial; sammenholdt med AP-1. |
| Dekning | 173/275 m/inntekt; 66/275 m/eierdata (24 %). |
| Risiko | HHI kan feiltolkes som markedskonsentrasjon; lav kontroll-prevalens kan feiltolkes som spredt makt. |
| Stoppspråk | Ikke sammenlign HHI på tvers av noder som markedstall. Ikke si en node er «mest konsentrert». Ikke kall samvirke-/familieledd «lavt konsentrert makt». Ikke bruk tomme noder. |
| Status | `intern baseline` — ekte markeds-HHI er `needs-data`; ikke ekstern bruk før markedscensus og eierdekning. |

## 7. Forbehold

- **HHI blant kartlagte selskaper**, ikke markeds-HHI; ikke sammenlignbar på tvers (n-følsom).
- **Eierdekning 24 %** — strukturmønsteret er indikativt.
- **Siste tilgjengelige regnskapsår** per selskap; ikke ett felles år.
- **Eiertype-koding** (cooperative/family/listed/foreign) er DB-klassifisering som bør stikkprøves mot Brønnøysund ved ekstern bruk.

## 8. Neste

1. **AP-5 (krysseie/konsern)** er nå den riktige neste lensen: samvirke-/familiekontrollen i retail/logistikk synliggjøres best via konsern- og krysseie-struktur, ikke aksje-HHI.
2. For ekte markeds-HHI: hent markedsandelsgrunnlag per node (`needs-data`) — uten det forblir HHI intern relativ-indikasjon.
3. Stikkprøv eiertype-kodingen for topp-selskapene per node mot Brønnøysund.
4. Løft CL-AP2-001 til claim-register først etter markedsgrunnlag og eierdekning.

## 9. Verifikasjon

Tall er produsert av `scripts/analyze-node-concentration.ts` kjørt 14.06.2026 mot intern DB; råaggregat i `research/analyse/ap2-nodekonsentrasjon.json`. HHI/topp-andel/node-aggregering er enhetstestet i `tests/scripts/analyze-node-concentration.test.ts` mot kjente verdier (lik fordeling 4×25 % → HHI 2500; monopol → 10000; topp-andel; node-konsentrasjon på syntetisk data). n-følsomhetsforbeholdet er utledet av at HHI-rekkefølgen følger 1/n snarere enn markedsstruktur. Ingen påstand er løftet til ekstern bruk.
