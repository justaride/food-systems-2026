import type { EvidenceStatus } from '@/lib/visualization/types'
import type { CitationReadinessLevel } from '@/lib/citations/citation-status'
import { gateReadinessForLocators } from '@/lib/citations/citable-acceptance'

export type DybdeanalyseFigure = 'lorenz' | 'sektorbro' | 'kryssnodeHhi' | null

export type DybdeanalyseFinding = {
  id: string
  arbeidspakke: string
  claimId: string
  title: string
  kortFunn: string
  evidenceStatus: EvidenceStatus
  /**
   * Siterbarhetsnivå for funn som IKKE er dekket av en acceptance-test.
   *
   * Settes bare når `docRefs` ikke treffer noen lokator i
   * `citable-acceptance.ts`. Er funnet gate-dekket, utledes nivået derfra —
   * se `citationReadinessFor`. Invarianten håndheves av
   * `tests/lib/dybdeanalyse-readiness.test.ts`: nøyaktig én av de to kildene
   * skal gjelde per funn, aldri begge og aldri ingen.
   */
  readinessWhenUngated?: CitationReadinessLevel
  citationNote: string
  coverageNote: string
  method: string
  figure: DybdeanalyseFigure
  tags: string[]
  sources: string[]
  notSay: string[]
  graphHref?: string
  docRefs: string[]
}

export const DYBDEANALYSE_UPDATED = '2026-08-24'

/**
 * Siterbarhetsnivået som skal vises for et funn.
 *
 * Gaten (`citable-acceptance.ts`) er sannhetskilden der den har en mening.
 * Bare når ingen acceptance-test dekker funnets lokatorer faller vi tilbake på
 * `readinessWhenUngated`. Poenget er at nivået ikke skal kunne gjentas to
 * steder og drive fra hverandre — det var nettopp det som skjedde med AP-3,
 * AP-5 og AP-6 fram til 2026-08-24.
 */
export function citationReadinessFor(finding: DybdeanalyseFinding): CitationReadinessLevel {
  return gateReadinessForLocators(finding.docRefs) ?? finding.readinessWhenUngated ?? 'blocked_unsourced'
}

/** Om nivået kommer fra gaten eller fra funnets eget fallback-felt. */
export function citationReadinessSourceFor(finding: DybdeanalyseFinding): 'gate' | 'ungated' {
  return gateReadinessForLocators(finding.docRefs) === null ? 'ungated' : 'gate'
}

export const DYBDEANALYSE_RULE =
  'Interne dybdeanalyse-funn fra arbeidspakkene (AP). «Makt»/«konsentrasjon» betyr strukturell posisjon i data, ikke intensjon eller anklage. ' +
  'Alle funn står som intern baseline bak claim-lock: ingen er eksternt validert, og tallene re-verifiseres før ekstern bruk.'

export const dybdeanalyseFindings: DybdeanalyseFinding[] = [
  {
    id: 'ins-ap3-001',
    arbeidspakke: 'AP-3',
    claimId: 'CL-AP3-001',
    title: 'Produksjonstilskudd: moderat konsentrert, ikke ekstremt',
    kortFunn:
      'Gini 0,52–0,55 (2022–2025). Øverste 10 % av mottakerne får omtrent en tredjedel av tilskuddene, øverste 1 % bare ~5 %, og medianmottakeren ~250 000 kr. Nederste halvpart deler ~12 %. Konsentrasjonen er strukturdrevet (husdyr/areal) og peker mot at makten ligger i marked/distribusjon, ikke i selve støtten.',
    evidenceStatus: 'observed',
    citationNote:
      'Alle fire år (2022–2025) er avstemt mot publisert primærtotal og reprodusert 2026-08-24. Avviket mot Landbruksdirektoratets februar-utbetaling (+1,2 % for 2024, +1,4 % for 2025) skyldes juni-etterbetalinger som ligger i årsdatasettet. Lever alltid med struktur-forbeholdet (husdyr/areal).',
    coverageNote:
      'Dekning: 2022–2025. 2024 lukket 2026-06-14 (tidligere «kun 3 av 15 ordninger» var en kolonnematch-bug, nå fikset; total 18,61 mrd verifisert mot publisert 18,39 mrd). 2022–2024 ble reprodusert identisk 2026-08-24; 2025 (18,97 mrd, Gini 0,547) er lagt til og avstemt mot publisert hovedutbetaling «nærmere 18,7 mrd» (11.02.2026).',
    method: 'Reproduserbart skript mot Landbruksdirektoratets åpne data; Gini/Lorenz enhetstestet.',
    figure: 'lorenz',
    tags: ['tilskudd', 'gini', 'konsentrasjon'],
    sources: ['funnnotat AP-3', 'analyze-subsidy-concentration.ts', 'ap3-tilskuddskonsentrasjon.json'],
    notSay: [
      'Ikke si at tilskudd er «kapret av de store».',
      'Ikke fremstill den tidligere 2024-totalen (10,94 mrd) som reell nedgang — det var et skript-artefakt, nå rettet.',
      'Ikke kall konsentrasjonen urettferdig uten struktur-/policy-kontekst.',
      'Ikke presenter 2022→2025 (0,521→0,547) som en etablert stigende trend — fire årspunkter uten usikkerhetsestimat bærer ingen trendpåstand.',
      'Ikke oppgi totalene som eksakte kronetall — avstemmingen mot publisert total er på prosentnivå, siden pressemeldingene runder av.',
    ],
    docRefs: ['docs/project/analysis/food-tg-ap3-tilskuddskonsentrasjon-funn-2026-06-14.md'],
  },
  {
    id: 'ins-ap1-001',
    arbeidspakke: 'AP-1',
    claimId: 'CL-AP1-001',
    title: 'Maktnettverket bygger broer i retail, logistikk og foredling',
    kortFunn:
      '32 interlockere og 11 tverrsektorielle broer i styregrafen. Sterkest: logistikk↔retail (7) og foredling↔retail (6). Knutepunkter etter interlock-grad: BAMA, ASKO, NorgesGruppen, Reitan. Broene fordeler seg ikke jevnt over verdikjeden — de klumper seg i marked/distribusjon.',
    evidenceStatus: 'estimated',
    citationNote: 'Intern baseline — pekepinn for AP-2/AP-5, ikke konklusjon. Ikke ekstern bruk før primærsjekk og dekningsutvidelse.',
    coverageNote: 'Dekning: 98 av 275 selskaper har styredata (36 %); favoriserer store/velinnsamlede selskaper.',
    method: 'Skript mot intern DB (BoardMember × Company); interlock-logikk enhetstestet.',
    figure: 'sektorbro',
    tags: ['eierskap', 'maktnettverk', 'styreoverlapp'],
    sources: ['funnnotat AP-1', 'analyze-board-interlocks.ts', 'ap1-styreoverlapp.json'],
    notSay: [
      'Ikke si «kontrollerer», «koordinerer» eller «skjult makt» fra AP-1 alene.',
      'Ikke generaliser til hele selskapsuniverset uten utvidet styredekning.',
    ],
    graphHref: '/graf',
    docRefs: ['docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md'],
  },
  {
    id: 'ins-ap2-001',
    arbeidspakke: 'AP-2',
    claimId: 'CL-AP2-001',
    title: 'Makt i dagligvare/distribusjon vises ikke i eierandeler — den er kooperativ og styrebåren',
    kortFunn:
      'Inntekts-HHI kan ikke sammenlignes på tvers av noder (mekanisk n-følsom: retail n=100 vs inputs n=13). Det robuste funnet er strukturelt: retail/logistikk er kooperativ-/familiedominert (Coop, NorgesGruppen, Reitan, BAMA), sjømat er børsnotert (Mowi/Lerøy/Austevoll), fôr er kooperativ + utenlandsk. Derfor fanget AP-1 (styrer) makten i retail/logistikk som AP-2 (eierandeler) ikke ser — kontrollen går via samvirke og styreverv, ikke via konsentrert aksjepost.',
    evidenceStatus: 'estimated',
    readinessWhenUngated: 'internal_context',
    citationNote: 'Intern baseline — ekte markeds-HHI er needs-data. Ikke ekstern bruk før markedscensus og eierdekning.',
    coverageNote: 'Dekning: 173/275 selskaper m/inntekt; bare 66/275 m/eierdata (24 %). HHI ikke sammenlignbar på tvers.',
    method: 'Skript mot intern DB (Company × Financial × Shareholder); HHI/topp-andel enhetstestet.',
    figure: null,
    tags: ['eierskap', 'konsentrasjon', 'hhi'],
    sources: ['funnnotat AP-2', 'analyze-node-concentration.ts', 'ap2-nodekonsentrasjon.json'],
    notSay: [
      'Ikke sammenlign HHI på tvers av noder som markedskonsentrasjon (n-følsom).',
      'Ikke si at en node er «mest konsentrert» fra disse tallene.',
      'Ikke tolk lav kontroll-prevalens i retail som spredt makt — det reflekterer samvirke/familieeie.',
    ],
    docRefs: ['docs/project/analysis/food-tg-ap2-nodekonsentrasjon-funn-2026-06-14.md'],
  },
  {
    id: 'ins-ap5-001',
    arbeidspakke: 'AP-5',
    claimId: 'CL-AP5-001',
    title: 'Få konsern kontrollerer vertikalt på tvers av butikk, logistikk og foredling',
    kortFunn:
      'AP-5 sporer kontrollerende eierskap (datter/≥50 %) gjennom konsernstrukturen og finner 19 tverrsektorielle kontrollører. NorgesGruppen kontrollerer 39 selskaper over fire ledd (butikk + logistikk + foredling + servering); Reitan, Coop, BAMA og samvirkene (TINE, Nortura, Felleskjøpet) spenner tre. Sektorparene (logistikk↔retail 7, foredling↔retail 6) er nesten identiske med AP-1s styrebroer — to uavhengige datakilder gir samme strukturkart. Det forklarer AP-2: makten som ikke vises i aksje-HHI vises som vertikal konsernkontroll.',
    evidenceStatus: 'observed',
    citationNote:
      'Struktur primærsjekket mot Brønnøysund + offentlige primærkilder 2026-06-15 (§6b). Restforbehold: BAMA-splitten NG/Reitan er ikke register-bekreftet, og Reitan/ASKO 100 % er strukturelt sikkert men inferert.',
    coverageNote:
      'Dekning: 183/275 selskaper i eiergrafen (67 %). Kontroll = datter/≥50 %; JV/delt kontroll (f.eks. BAMA) underrapporteres. Eierskap ≠ operativ kontroll. Eierandel-% er verifisert for ni av ni konsern mot IR-/årsrapportsider.',
    method: 'Skript mot intern DB (CompanyOwnership × Company); transitiv kontroll-rekkevidde enhetstestet.',
    figure: null,
    tags: ['eierskap', 'konsern', 'krysseie'],
    sources: ['funnnotat AP-5', 'analyze-cross-holdings.ts', 'ap5-krysseie.json'],
    notSay: [
      'Ikke si «samordner» eller «operativ kontroll» — dette er eierstruktur.',
      'Ikke tell research/property/holding som verdikjede-integrasjon.',
      'Ikke fremstill SalMar (44,3 %), Mowi (15,5 %) eller Orkla (25,3 %) som majoritetseid — der er topp-eieren største aksjeblokk, ikke flertall.',
      'Ikke oppgi en eksakt NG/Reitan-split for BAMA — den er ikke register-bekreftet.',
    ],
    graphHref: '/graf',
    docRefs: ['docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md'],
  },
  {
    id: 'ins-ap2-002',
    arbeidspakke: 'AP-2',
    claimId: 'CL-KRYSSNODE-HHI-001',
    title: 'Konsentrasjonen topper i foredling, ikke i dagligvare',
    kortFunn:
      'Et ekte markeds-HHI per node — bygget fra kildebelagte markedsandeler, ikke det n-følsomme inntekts-HHI-et — viser at konsentrasjonen topper oppstrøms i foredling: meieri (~6000), egg (~5500–6800) og rødt kjøtt (~4600–4800) er mer konsentrert enn dagligvare (~3327), mens primærproduksjon (laks/ørret ~950) er minst konsentrert. De tre mest konsentrerte nodene er alle samvirke-foredling — TINE (meieri) og Nortura/Prior (egg + kjøtt). Ordinal-funnet (foredling > retail > primær) er robust mot usikkerhet i utfordrer-andelene fordi leder-kvadratleddet alene gir gulv over retail (TINE 76,4² = 5837; Nortura egg 70² = 4900).',
    evidenceStatus: 'estimated',
    citationNote:
      'Citable m/forbehold — ordinal-funnet (foredling > retail > primær) er robust via leder-gulv. Per-node presise HHI varierer (estimerte utfordrer-andeler, ulike referanseår/baser).',
    coverageNote:
      'Dekning: 7 noder med ekte markeds-HHI (meieri ~6000, egg ~5500–6800, rødt kjøtt ~4600, logistikk ~3697, retail ~3327, kylling ~3200, sjømat ~950). Egg + logistikk kildebelagt 2026-06-15 (Strøm E). Foodservice citable som range (~2900–5400, leder omtvistet); oppdrettsfôr + kraftfôr forblir needs-data på presis HHI. Catering-operatører metodisk uegnet (anbudsmarked).',
    method:
      'Markeds-HHI = Σ(andel%)²; >2500 = «høyt konsentrert» (US DOJ/FTC). Kildebelagte leder-andeler + estimerte utfordrer-split; fan-out-subagenter + coordinator-aritmetikk. Sjømat kryssvalidert mot AP-6 MTB.',
    figure: 'kryssnodeHhi',
    tags: ['konsentrasjon', 'hhi', 'foredling', 'samvirke'],
    sources: [
      'funnnotat AP-2 kryss-node',
      'Oslo Economics meierimarked 2023',
      'KLF/Animalia slaktestatistikk',
      'Konkurransetilsynet Dagligvarerapport 2024-25',
      'Fiskeridirektoratet MTB (AP-6)',
    ],
    notSay: [
      'Ikke fremstill estimerte utfordrer-andeler som kildebelagte.',
      'Ikke bland baser (slakt/foredling/retail/kapasitet) eller referanseår.',
      'Ikke si at sjømat er like konsentrert som retail (~950 vs ~3327).',
      'Ikke dobbelttell eier-overlappende aktører (Cardinal/Den Stolte Hane i egg/kylling).',
    ],
    docRefs: ['docs/project/analysis/food-tg-ap2-kryssnode-hhi-funn-2026-06-15.md'],
  },
  {
    id: 'ins-ap6-001',
    arbeidspakke: 'AP-6',
    claimId: 'CL-AP6-001',
    title: 'Havbruk: sjøbasert produksjon er langt mer konsentrert enn totaltallet viser',
    kortFunn:
      'Fire konsern (Mowi, SalMar, Lerøy, Cermaq) kontrollerer ~57 % av sjøbasert MTB (CR4 57 %, HHI ~929). Regnes alle kommersielle matfisk-tillatelser med (inkl. store land-RAS/offshore-utviklingstillatelser) faller HHI til ~510 — de nye tillatelsene har høy nominell MTB men ligger ofte på én lokalitet og er ennå ikke i drift, så de fortynner totaltallet og maskerer at produksjonen som faktisk genererer marint restråstoff i dag er vesentlig mer konsentrert. Siden restråstoff skalerer med biomasse, er MTB-konsentrasjonen rett utgangspunkt for «hvem genererer restråstoff-strømmene».',
    evidenceStatus: 'observed',
    citationNote:
      'Konsern-rollup stikkprøvet mot Brønnøysund 2026-06-15 (§7b) — ingen feilallokering funnet. Restforbehold: eierandels-% er offentlig kjent men ikke register-bekreftet (→ AP-5), og MTB er tildelt kapasitet, ikke slaktevolum.',
    coverageNote:
      'Dekning: sjøbasert matfisk laks/ørret, n=92 innehavere (konsern-rollup); total-MTB-brakett n=140. MTB = tildelt kapasitet, ikke realisert slaktevolum. Restråstoffvolum per aktør = needs-data (RUBIN/SINTEF).',
    method:
      'Fiskeridirektoratet Akvakulturregister (åpen pub-aqua CSV, 15.06.2026); dedup på tillatelsesnr; MTB = sum tillatelseskapasitet; konsern-rollup på innehaver; HHI = Σ(andel%)². Sjømat kryssvalidert mot AP-2 slaktevolum.',
    figure: null,
    tags: ['havbruk', 'konsentrasjon', 'mtb', 'restråstoff'],
    sources: ['funnnotat AP-6', 'Fiskeridirektoratet Akvakulturregister', 'aquaculture_sites.geojson'],
    notSay: [
      'Ikke konflater lokalitet, MTB og restråstoffvolum — tre atskilte nivåer.',
      'Ikke sammenlign denne MTB-HHI direkte mot AP-2s node-HHI (ulike størrelser).',
      'Restråstoff-kontroll er strukturell posisjon, ikke målt strøm eller intensjon.',
    ],
    docRefs: ['docs/project/analysis/food-tg-ap6-havbrukskonsentrasjon-funn-2026-06-14.md'],
  },
  {
    id: 'ins-ap7-001',
    arbeidspakke: 'AP-7',
    claimId: 'CL-AP7-001r',
    title: 'Pris-asymmetri i fiskeforedling: retning bekreftet, signifikans ikke',
    kortFunn:
      'Nedstrøms produsentprisindeks for fiskeforedling (SSB 12462, SNN102) fanger kumulativt ~0,27 av oppstrøms lakseråpris-økninger (SSB 03024), men kun ~0,13 av prisfall (2019M01–2026M07, n=91). Retningen reproduserer, men den er ikke statistisk etablert: i differansespesifikasjonen er asymmetrien ikke signifikant (t=1,25), og med valutakontroll faller den fra +0,21 til +0,08. Mønsteret er svakest i hjemmemarkedet og sterkest i eksportmarkedet — som om en vesentlig del er NOK-svekkelse. Fôr→oppdrett-leddet er separat testet og gir nullfunn.',
    evidenceStatus: 'estimated',
    readinessWhenUngated: 'internal_context',
    citationNote:
      'Intern SVEKKET — retning bekreftet, signifikans ikke etablert. Status revidert fra «STØTTET» 2026-08-24 etter reproduksjon med skript; CL-AP7-001 trukket og erstattet av CL-AP7-001r (§5 i funnnotatet). Ikke ekstern faktastemme.',
    coverageNote:
      'Dekning: 91 månedsobservasjoner 2019M01–2026M07; ett domene (laks→foredling). SNN102 dekker all fisk, ikke kun laks. Valuta er nå kontrollert (USDNOK som eksogen regressor + hjemme-/eksportmarked hver for seg) og fjerner mesteparten av asymmetrien. Fôr→oppdrett-leddet er kjørt via fôrråvare-proxy og lukket som «testet, negativt» — ikke lenger needs-data.',
    method:
      'Reproduserbart skript (scripts/analyze-price-asymmetry.ts, enhetstestet): distribuert lag 0–3 i log-differanser med opp/ned-splittet oppstrøms som hovedspesifikasjon, nivåregresjon på partialsummer for sammenlignbarhet, fortegnstest, Newey-West-HAC. Kilder: SSBs åpne JSON-stat-API, Norges Bank EXR, Verdensbankens Pink Sheet.',
    figure: null,
    tags: ['pris', 'asymmetri', 'havbruk', 'foredling'],
    sources: [
      'funnnotat AP-7 §6c',
      'analyze-price-asymmetry.ts',
      'ap7-prisasymmetri.json',
      'SSB 03024 lakseeksport kilopris',
      'SSB 12462 PPI SNN102',
      'Norges Bank EXR USDNOK',
      'Verdensbanken Pink Sheet (fôrråvarer)',
    ],
    notSay: [
      'Formuler som prisatferd/mønster, ikke intensjon eller margin-anklage.',
      'Ikke generaliser til grønt eller andre utestede domener.',
      'Ikke bruk «NARDL t=14,0» eller «statistisk sterk» — den t-verdien kom fra en nivåregresjon på trendende serier og reproduserer ikke i differansespesifikasjonen.',
      'Ikke si at fôrpris slår asymmetrisk ut i lakseprisen — det leddet er testet og gir nullfunn.',
    ],
    docRefs: ['docs/project/analysis/food-tg-ap7-prisasymmetri-funn-2026-06-14.md'],
  },
  {
    id: 'ins-ap4-001',
    arbeidspakke: 'AP-4',
    claimId: 'CL-AP4-001',
    title: 'Verdifangst: sjømat skaper ~2× verdi per tonn — per-aktør-testen er needs-data',
    kortFunn:
      'På 2024-tall flytter norsk primærlandbruk og sjømat tilnærmet lik tonnasje (3,3 mot 3,8 mill. tonn), men sjømat skaper ~2× verdi per tonn (≈16 700 mot ≈8 500 NOK GVA/tonn). Nedstrøms har detaljhandelen høyest konsentrasjon (CR3 96,6 %) men blant de laveste rapporterte prosentmarginene (NG retail-segment 2,6 %, Coop 1,0 %); Konkurransetilsynet/Oslo Economics plasserer høyere marginer oppstrøms. Selve per-aktør volum↔margin-testen krever en DB-join (DeliveryVolume × CompanyFinancial, ~50 % dekning) og står som needs-data.',
    evidenceStatus: 'observed',
    readinessWhenUngated: 'internal_context',
    citationNote:
      'Delfunn klar-med-forbehold (committet value-chain/financial_insights). Hovedpåstanden (per-aktør volum↔margin) er needs-data — krever DB-join, ikke ekstrapolerbar (~50 % finansdekning).',
    coverageNote:
      'Dekning: node-/kjedeledd-tall fra committet 2024-data, ikke per aktør. GVA/tonn blander inn importert råstoff (sjømat-fôr ~92 % importert) → verdi/tonn ≠ ren norsk verdiskaping. Node-margin for foredling/distribusjon mangler i committet data.',
    method:
      'Committet value-chain.json + financial_insights_2024.json (2024). Hovedtest = DeliveryVolume × CompanyFinancial Spearman-join (needs-data, DB).',
    figure: null,
    tags: ['verdifangst', 'margin', 'volum', 'needs-data'],
    sources: ['funnnotat AP-4/AP-8', 'value-chain.json', 'financial_insights_2024.json'],
    notSay: [
      'Ikke fremstill GVA/tonn som ren norsk verdiskaping (importert råstoff inngår).',
      'Ikke presenter referert KT/Oslo Economics-marginanalyse som eget regnestykke.',
      'Ikke ekstrapoler ~50 %-finansdekningen til hele selskapskorpuset.',
    ],
    docRefs: ['docs/project/analysis/food-tg-ap4-ap8-partial-funn-2026-06-14.md'],
  },
  {
    id: 'ins-ap8-001',
    arbeidspakke: 'AP-8',
    claimId: 'CL-AP8-001',
    title: 'Tilskudd↔konsentrasjon: regionalt strukturnøytralt; node-HHI-testen er needs-data',
    kortFunn:
      'Den egentlige testen (tilskuddsintensitet per node × node-markeds-HHI) er blokkert: produksjonstilskudd går til primærprodusenter, og ekte markeds-HHI mangler for produksjonsnodene — så aksen hypotesen krever, finnes ikke ennå (needs-data). Et testbart regionalt resultat finnes: produksjonstilskudd fordeles i hovedsak proporsjonalt med mottakertetthet (r ≈ 0,92), uten signifikant samvariasjon mellom mottakertetthet og tilskudd per mottaker (r ≈ −0,05, ikke-sign., n ≈ 350, alle tre år) — støtten er regionalt strukturnøytral på dette målet.',
    evidenceStatus: 'observed',
    readinessWhenUngated: 'internal_context',
    citationNote:
      'Regional subpåstand klar-med-forbehold; kjernen (node-HHI × tilskudd) er needs-data. Ikke lån retail-HHI eller AP-2s inntekts-HHI inn i en tilskuddskorrelasjon.',
    coverageNote:
      'Dekning: kommune-aggregat 2022–2024 (Landbruksdirektoratet, eksakt match mot AP-3-aggregat). Mottakertetthet er proxy for fragmentering, ikke markeds-HHI; mottaker-nivå, brutto.',
    method:
      'Reprodusert fra ap3-tilskuddskonsentrasjon.json; Pearson r på kommune-aggregat (n ≈ 350) med signifikans rapportert.',
    figure: null,
    tags: ['tilskudd', 'konsentrasjon', 'regional', 'needs-data'],
    sources: ['funnnotat AP-4/AP-8', 'ap3-tilskuddskonsentrasjon.json', 'Landbruksdirektoratet'],
    notSay: [
      'Korrelasjon ≠ årsak; dette er en regional struktur-test, ikke node-HHI-testen AP-8 spesifiserer.',
      'Ikke lån retail-HHI eller AP-2s inntekts-HHI inn i tilskuddskorrelasjonen.',
      'Ikke tolk mottakertetthet som markedskonsentrasjon.',
    ],
    docRefs: ['docs/project/analysis/food-tg-ap4-ap8-partial-funn-2026-06-14.md'],
  },
]
