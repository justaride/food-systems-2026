import type { EvidenceStatus } from '@/lib/visualization/types'
import type { CitationReadinessLevel } from '@/lib/citations/citation-status'

export type DybdeanalyseFigure = 'lorenz' | 'sektorbro' | null

export type DybdeanalyseFinding = {
  id: string
  arbeidspakke: string
  claimId: string
  title: string
  kortFunn: string
  evidenceStatus: EvidenceStatus
  citationReadiness: CitationReadinessLevel
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

export const DYBDEANALYSE_UPDATED = '2026-06-14'

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
      'Gini ~0,52 (2022–2023). Øverste 10 % av mottakerne får omtrent en tredjedel av tilskuddene, øverste 1 % bare ~5 %, og medianmottakeren ~250 000 kr. Nederste halvpart deler ~12 %. Konsentrasjonen er strukturdrevet (husdyr/areal) og peker mot at makten ligger i marked/distribusjon, ikke i selve støtten.',
    evidenceStatus: 'observed',
    citationReadiness: 'internal_context',
    citationNote: 'Intern baseline — ikke ekstern faktastemme før PCQ-verifisering av 2024 og strukturkontroll.',
    coverageNote: 'Dekning: 2022–2024 pålitelig. 2024 lukket 2026-06-14 (tidligere «kun 3 av 15 ordninger» var en kolonnematch-bug, nå fikset; total 18,61 mrd verifisert mot publisert 18,39 mrd).',
    method: 'Reproduserbart skript mot Landbruksdirektoratets åpne data; Gini/Lorenz enhetstestet.',
    figure: 'lorenz',
    tags: ['tilskudd', 'gini', 'konsentrasjon'],
    sources: ['funnnotat AP-3', 'analyze-subsidy-concentration.ts', 'ap3-tilskuddskonsentrasjon.json'],
    notSay: [
      'Ikke si at tilskudd er «kapret av de store».',
      'Ikke fremstill den tidligere 2024-totalen (10,94 mrd) som reell nedgang — det var et skript-artefakt, nå rettet.',
      'Ikke kall konsentrasjonen urettferdig uten struktur-/policy-kontekst.',
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
    citationReadiness: 'internal_context',
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
    citationReadiness: 'internal_context',
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
    citationReadiness: 'internal_context',
    citationNote: 'Intern baseline — ikke ekstern bruk før stikkprøve av ultimate ownership mot Brønnøysund.',
    coverageNote: 'Dekning: 183/275 selskaper i eiergrafen (67 %). Kontroll = datter/≥50 %; JV/delt kontroll (f.eks. BAMA) underrapporteres. Eierskap ≠ operativ kontroll.',
    method: 'Skript mot intern DB (CompanyOwnership × Company); transitiv kontroll-rekkevidde enhetstestet.',
    figure: null,
    tags: ['eierskap', 'konsern', 'krysseie'],
    sources: ['funnnotat AP-5', 'analyze-cross-holdings.ts', 'ap5-krysseie.json'],
    notSay: [
      'Ikke si «samordner» eller «operativ kontroll» — dette er eierstruktur.',
      'Ikke tell research/property/holding som verdikjede-integrasjon.',
      'Ikke bruk ultimate-eierskap eksternt før stikkprøve mot Brønnøysund.',
    ],
    graphHref: '/graf',
    docRefs: ['docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md'],
  },
]
