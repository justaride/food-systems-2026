---
tittel: Food TG AP-2 — Kryss-node markeds-HHI: konsentrasjonen topper i foredling, ikke retail (funn 2026-06-15)
status: Internt analysefunn (fan-out-subagenter + coordinator-verifikasjon) — ordinal-funn citable m/forbehold; presise HHI varierer
eier: Gabriel
dato: 2026-06-15
arbeidspakke: AP-2 / maktkart §8 steg 3 (ekte markeds-HHI per node)
metode: Parallell subagent-fan-out (sjømat, meieri+kjøtt, fôr) + coordinator-aritmetikkverifikasjon
bruksregel: Internt analysefunn. «Konsentrasjon» = markedsstruktur, ikke intensjon. HHI = Σ(markedsandel %)²; >2500 = «høyt konsentrert» (US DOJ/FTC). Leder-andeler er kildebelagt; utfordrer-fordelinger er ofte estimert (se datakvalitet). Hver node bærer basis + år + kilde. Går gjennom claim-lock/PCQ før ekstern bruk.
relaterte_filer:
  - docs/project/analysis/food-tg-maktkart-section8-3-4-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md
  - docs/project/analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md
  - docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md
  - docs/project/figures/food-tg-2026-06-15/fig-kryssnode-hhi-profil.svg
---

# AP-2 — Kryss-node markeds-HHI

## 1. Hovedfunn (ikke-opplagt)

Den vanlige fortellingen er at makten i norsk matsystem sitter i dagligvare­leddet («tre kjeder har 96 %»). Et ekte markeds-HHI per verdikjede-node — bygget fra kildebelagte markedsandeler, ikke det n-følsomme inntekts-HHI-et — viser et **annet og skarpere bilde: konsentrasjonen topper *oppstrøms* i foredling, ikke i detaljhandel.** Meieriforedling (HHI ~6000) og rødkjøttslakting (~4600–4800) er **mer konsentrert enn dagligvare (~3327)**, mens primærproduksjon (laks/ørret-oppdrett ~950) er den **minst** konsentrerte noden.

Og det ikke-opplagte poenget: **de to mest konsentrerte nodene — meieri og kjøtt — er samvirkene TINE og Nortura.** Den mest ekstreme markedskonsentrasjonen i norsk mat ligger altså i de medlemseide foredlingsmonopolene, ikke i de familie-/samvirkeeide dagligvarekjedene. Det skjerper AP-2-funnet «samvirke som maktform»: samvirke er ikke bare en eierform som *skjuler* konsentrasjon (jf. lav aksje-HHI) — i foredling *er* det den mest konsentrerte markedsstrukturen.

## 2. Kryss-node markeds-HHI (sortert etter konsentrasjon)

| Node | Markeds-HHI | CR3 | Basis / år | Status |
|---|---:|---:|---|---|
| **Meieri** (foredling) | ~6000 | 94 % | anvendt melk hovedprodukter, 2021 | citable m/forbehold |
| **Rødt kjøtt** (slakt) | ~4600–4800 | 86 % | slaktemengde, 2024 | citable m/forbehold |
| **Egg** (pakkeri) | ~3600 | 90 % | pakkeri-volum, 2023 | needs-data (presise andeler) |
| **Kraftfôr** (input) | ~3100–3700 | 86–88 % | volum, 2023 | citable struktur / needs-data presis |
| **Dagligvare** (retail) | ~3327 | 96,6 % | omsetning, 2024 (KT) | citable m/forbehold ✓ |
| **Kylling** (slakt) | ~3200 | 88 % | slaktemengde, 2024 | citable m/forbehold |
| **Oppdrettsfôr** (input) | ~2500–2900 | 78–90 % | kapasitet/struktur, 2020–22 | citable struktur / needs-data presis |
| **Sjømat** (oppdrett) | ~950–1150 | CR4 56–58 % | slaktevolum GWT, 2024 | citable m/forbehold |

Alle over 2500 = «høyt konsentrert»; sjømat (~950) = «moderat». Dagligvare-HHI (~3327) er fra tidligere (§8 steg 3, KT Dagligvarerapport). Aritmetikk (HHI = Σ andel²) coordinator-verifisert mot de oppgitte andelene.

Figur: `docs/project/figures/food-tg-2026-06-15/fig-kryssnode-hhi-profil.svg` (søylediagram, citable noder solid, needs-data-presis lysere, samvirke merket, 2500-terskel). Også surfacet i `/innsikt` som inline-figur (`kryssnodeHhi`).

## 3. Konsentrasjonsprofilen langs kjeden

Primærproduksjon (sjømat ~950) **→** input/fôr (~2500–3700) **→** foredling (meieri ~6000, kjøtt ~4600) **→** dagligvare (~3327) **→** forbruker. Konsentrasjonen er altså **ikke** monotont stigende mot forbruker; den **topper i foredlingsleddet** (samvirke-monopolene), faller noe i retail, og er lavest i primærproduksjon. Det er et mer presist maktkart enn «retail har 96 %».

## 4. Robusthet — hva tåler forbehold

Den **ordinale** påstanden (foredling > retail > primærproduksjon; samvirke-foredling er mest konsentrert) er **robust mot usikkerheten i utfordrer-fordelingene**, fordi leder-kvadrat-leddene alene gir gulv over retail:

- TINE alene: 76,4² = **5837** (meieri-gulv) — over retail uansett utfordrer-split.
- Nortura alene (rødt kjøtt): 66² = **4356** — over retail uansett.
- Dagligvare 3327 (kjent), sjømat ~950 (to uavhengige baser, se §5).

De **presise** HHI-punktverdiene har derimot usikkerhet (estimerte utfordrer-andeler, ulike referanseår 2021–2024, ulike baser). Derfor: ordinal-funnet er citable m/forbehold; per-node presise verdier varierer i status.

## 5. Sjømat — kryssvalidert (sterkest evidens)

Sjømat-noden har to *uavhengige* baser som gir samme svar:
- Slaktevolum (GWT, 2024, børsrapportert): Mowi 22,1 %, SalMar 15,9 %, Lerøy 12,4 %, Cermaq 5,2 % → CR4 ~56 %, HHI ~950–1150.
- MTB-kapasitet (Fiskeridirektoratet, AP-6): CR4 57,0 %, HHI ~929.

To helt ulike kilder (selskapenes slaktevolum vs. tildelt kapasitet) → nesten identisk konsentrasjon. Det er sterkere evidens enn noen annen node. Forbehold: Norge-only; Nova Sea-volum estimert; Mowis oppkjøp av Nova Sea (etter 2024) løfter HHI ~70–80 poeng.

## 6. Claim-status

| Claim | Status | Begrunnelse |
|---|---|---|
| **CL-KRYSSNODE-HHI-001 (ny, ordinal)** | citable-kvalifisert MED forbehold | «Konsentrasjonen i norsk matsystem topper i foredling (meieri ~6000, kjøtt ~4600), over dagligvare (~3327); primærproduksjon (sjømat ~950) er minst konsentrert. De to mest konsentrerte nodene er samvirkene TINE og Nortura.» Robust ordinalt (leder-gulv). Forbehold: utfordrer-andeler estimert, ulike år/baser. |
| Meieri / rødt kjøtt / sjømat per-node | citable m/forbehold | Leder-andeler kildebelagt; bær basis + år. |
| Egg / oppdrettsfôr / kraftfôr presis HHI | `needs-data` | Struktur/dominans kildebelagt; presise produsentandeler ikke publisert. |
| CL-AP2-001 | oppdatert | Kjernen (makt er samvirke-/styrebåren) styrkes: samvirke-foredling ER mest konsentrert. Ikke bland ekte markeds-HHI med AP-2s inntekts-HHI. |

**Stoppspråk:** Ikke fremstill estimerte utfordrer-andeler som kildebelagte. Ikke bland baser (slakt/foredling/retail/kapasitet) eller år. Ikke si at sjømat er like konsentrert som retail — det er det ikke (~950 vs ~3327). Ikke dobbelttell eier-overlappende aktører (Cardinal/Den Stolte Hane i egg/kylling).

## 7. Node-dekningskart — lukket så langt åpne data tillater (oppdatert 2026-06-15)

- **Dekket (citable m/forbehold):** retail (~3327), meieri (~6000), rødt kjøtt (~4600), sjømat (~950), kylling (~3200).
- **Delvis (citable struktur, needs-data presis HHI):** oppdrettsfôr (~2500–2900), kraftfôr (~3100–3700), egg (~3600), logistikk/grossist (~3300–3700), foodservice-distribusjon (ASKO/NG-dominert; leder-andel 36–50 % usikker).
- **Strukturelt uegnet for HHI / needs-data:** foodservice-operatører (kontrakts-catering er et anbudsmarked med lave byttekostnader — Konkurransetilsynet advarer at spot-andeler *overdriver* konsentrasjon; ISS-ledet, andeler sladdet).

Dette lukker §8 steg 3 så langt åpne kilder rekker: 5 noder har ekte markeds-HHI, 5 har citable struktur + needs-data på presis verdi, og 1 (catering-operatører) er metodisk uegnet for HHI. Se §11 for logistikk/foodservice-detaljene.

## 8. Datakvalitet (oppsummert)

- **Solid (kildebelagt, volum/andel):** TINE 76,4 % (Oslo Economics/Landbruksdirektoratet 2021); Nortura/KLF 66/34 % (KLF); Nortura kylling <50 % (2024); sjømat slaktevolum (børsrapporter) + MTB (Fiskeridirektoratet); fôr-struktur (4 aktører ≈ 100 %, peer-reviewed + Landbruksdirektoratet); dagligvare (KT).
- **Estimert (flagget):** alle utfordrer-fordelinger under markedsleder; fôr-produsentenes presise volumandeler (produsentene publiserer ikke); FKAs *nasjonale* kraftfôr-andel (dokumentert 65 % er *regionalt*).
- **Forbehold:** ulike referanseår (2021–2024); ulike baser per node; samvirke-dobbeltrolle (TINE/Nortura er både markedsregulator og aktør).

## 9. Verifikasjon

Markedsandeler hentet fra åpne/autoritative kilder av tre parallelle subagenter; HHI/CR-aritmetikk (Σ andel²) er coordinator-reberegnet og samsvarer med subagentenes tall (meieri 6035, rødt kjøtt ~4784, egg 3598, dagligvare 3327, kylling 3178, kraftfôr 3310, oppdrettsfôr 2520–2878, sjømat ~950–1150). Sjømat er kryssvalidert mot AP-6 MTB. Ingen committet fil endret under analysen. Ingen påstand løftet til ekstern faktastemme; ordinal-funnet er det sterkeste og bør route gjennom claim-lock før bruk.

## 10. Kilder

- Meieri: Oslo Economics, «Konkurransen i meierimarkedet» (2023, ref.år 2021) — <https://osloeconomics.no/wp-content/uploads/2023/03/Konkurransen-i-meierimarkedet-konkurransefremmende-tiltak.pdf>
- Kjøtt/egg: KLF «Hvem er KLF» (<https://kjottbransjen.no/hvem-vi-er/>); Animalia slaktestatistikk (<https://www.animalia.no/no/statistikk/slakting_klassifisering_og_eggproduksjon/>); Bondebladet (Nortura kylling <50 %).
- Sjømat: selskapenes Q4/FY2024-rapporter (Mowi, SalMar, Lerøy, Cermaq, Nordlaks, Grieg); SSB/Eurofish totalvolum; AP-6 (Fiskeridirektoratet MTB).
- Fôr: Aas et al. 2022 *Aquaculture Reports* (4 produsenter ≈ 100 %); iLaks 2018 (kapasitet); Landbruksdirektoratet kraftfôrstatistikk + arbeidsgrupperapport korn/kraftfôr.
- Dagligvare: Konkurransetilsynet Dagligvarerapport 2024-25 (jf. §8 steg 3).

## 11. Logistikk + foodservice — §8 steg 3 lukket (tillegg 2026-06-15)

De to siste nodene er like mye et **strukturfunn** som et HHI-tall.

**Logistikk/grossist — distribusjon er internalisert, ikke et eget marked.** Norsk dagligvaredistribusjon består av **kun tre vertikalt integrerte fullsortimentsgrossister** — ASKO (NorgesGruppen), REMA Distribusjon (Reitan), Coop Distribusjon (Coop) — som leverer **70–85 %** av sin egen kjedes varer (Menon/regjeringen 2025). Genuint uavhengig, kjedenøytralt dagligvare-grossistvolum er **<1 %**. Et grossist-omsetnings-HHI (Menon 2023: NG/ASKO 46,2 %, Coop 34,5 %, REMA 19,3 %) gir **~3 696** — litt *høyere* enn retail (~3327), fordi Bunnpris (eneste ikke-integrerte retail-aktør) ikke har egen grossist og forsvinner inn i ASKO. Men poenget er strukturelt: «HHI» her måler **samme konsentrasjon som retail**, ikke et uavhengig konkurransemarked. Det forsterker maktkartets vertikal-integrasjons-tese — de samme 3–4 konsernene kontrollerer både butikk og distribusjon, uten et åpent mellomledd.

**Foodservice — to lag, begge needs-data på presis HHI.**
- *Distribusjon (storhusholdnings-engros):* ASKO Storhusholdning (NorgesGruppen) er dominerende fullsortimentsgrossist (sitert ~36 %, muligens >50 %; NHO Reiseliv 2018: «i realiteten ingen reell konkurranse»), med Servicegrossistene (~4 mrd) og DLVRY (~3 mrd) som øvrige fullsortiment. Citable struktur (ASKO-dominert), men presis HHI `needs-data` (leder-andel 36–50 % usikker, utfordrer-split upublisert).
- *Cateringoperatører (kantinedrift):* ISS er størst (Konkurransetilsynets ord), med Compass (kjøpte 4Service 2024), Sodexo, COOR, Aramark. Alle andeler er **sladdet** i KTs fusjonsvedtak. Markedet er et **anbudsmarked** med lave byttekostnader og kjøpermakt — KT advarer eksplisitt at spot-andeler *overdriver* konsentrasjon. HHI er derfor **metodisk uegnet** her, ikke bare needs-data.

**Claim-status (nye):**
- CL-LOGISTIKK-001: `citable struktur / needs-data presis` — «Norsk dagligvaredistribusjon er vertikalt internalisert i de tre paraplykjedene (ASKO/NG, REMA, Coop); ingen åpent grossistmarked av betydning. Grossist-HHI ~3300–3700, men måler samme konsentrasjon som retail.»
- CL-FOODSERVICE-DIST-001: `citable struktur / needs-data presis` — ASKO/NG-dominert; leder-andel ikke låst.
- CL-FOODSERVICE-OPS-001: `needs-data` + HHI metodisk uegnet (anbudsmarked).

**Stoppspråk:** Ikke fremstill distribusjon som et selvstendig konkurransemarked. Ikke bland storhusholdnings-grossister inn i dagligvare-HHI. Ikke beregn catering-operatør-HHI fra spot-andeler. Verifiser ASKO-foodservice-andelen (~36 %) mot NG-årsrapport før ekstern bruk.

**Kilder (tillegg):** Menon Economics, «Kartlegging av tilgang til dagligvaregrossisttjenester» (regjeringen.no 2025); Handelswatch (ASKO >100 mrd 2024); NHO Reiseliv høringssvar 2018; Konkurransetilsynet vedtak 2024_633 (Compass–4Service); committet `logistics_hubs.geojson` + `value-chain.json` (`distribution`-noden, `volume_tonnes: null`, «vertically integrated»-note).

**Datakvalitets-merknad:** `value-chain.json` har et retail-HHI på 3445 (NG 48,4/Coop 27,1/Reitan 18,0/Bunnpris 6,6), mens dette notatet bruker 3327 (KT-andeler). Disse bør harmoniseres ved neste oppdatering av surfacingen.
