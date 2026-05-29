export type RLevel = 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8' | 'R9'

export type RCategory = 'core-circular' | 'extended-life' | 'useful-application' | 'linear'

export type RLadderStep = {
  id: RLevel
  rank: number
  name: string
  nameNo: string
  description: string
  foodExamples: string[]
  category: RCategory
  color: string
  border: string
}

export const rLadder: RLadderStep[] = [
  {
    id: 'R0',
    rank: 0,
    name: 'Refuse',
    nameNo: 'Nekte / forhindre',
    description:
      'Unngå behov for ressursen helt. For matsystemet: at forbrukere og kjøkken ikke kjøper eller produserer mer enn de faktisk kommer til å spise.',
    foodExamples: [
      'Smarte menyer som reduserer porsjoner etter forbrukstall',
      'Husholdningsplanlegging: kjope bare det som skal spises',
      'Kantiner som dropper buffet-format',
    ],
    category: 'core-circular',
    color: 'bg-emerald-100 text-emerald-800',
    border: 'border-emerald-300',
  },
  {
    id: 'R1',
    rank: 1,
    name: 'Rethink',
    nameNo: 'Tenke nytt',
    description:
      'Intensivere bruken av produktet eller radikalt endre forretningsmodellen. For matsystemet: plattformer og forretningsmodeller som sirkulerer mat som ellers ville vaert kastet.',
    foodExamples: [
      'Too Good To Go (surplus-app)',
      'REKO-ringer (direktesalg Facebook)',
      'Matsentralen (omfordeling til mottakere)',
      'Restaurant-appar som selger usolgte retter kl. 22',
    ],
    category: 'core-circular',
    color: 'bg-emerald-100 text-emerald-800',
    border: 'border-emerald-300',
  },
  {
    id: 'R2',
    rank: 2,
    name: 'Reduce',
    nameNo: 'Redusere',
    description:
      'Bruke mindre ressurser per produkt. For matsystemet: designendringer som reduserer svinn direkte i produksjon eller foredling.',
    foodExamples: [
      'Potetlefser med skall (Sørlandet): -10-15 % svinn',
      'Portion-right-innkjøpsavtaler i skolemat',
      'Emballasje som forlenger holdbarhet',
      'Prosessering som bruker hele råvarer',
    ],
    category: 'core-circular',
    color: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-200',
  },
  {
    id: 'R3',
    rank: 3,
    name: 'Reuse',
    nameNo: 'Gjenbruke',
    description:
      'Bruk igjen av et annet menneske / i samme form. For matsystemet: mat som omfordeles til mennesker i sin opprinnelige form og funksjon.',
    foodExamples: [
      'Matsentralens omfordeling til mottakerorganisasjoner',
      'Pantesystemet for flasker og bokser',
      'Ombruksemballasje (HORECA takeaway)',
    ],
    category: 'core-circular',
    color: 'bg-teal-50 text-teal-700',
    border: 'border-teal-200',
  },
  {
    id: 'R4',
    rank: 4,
    name: 'Repair',
    nameNo: 'Reparere',
    description: 'Vedlikeholde og reparere for å forlenge levetid. Begrenset relevans i matsystemet.',
    foodExamples: [
      'Reparasjon av meieri- og prosessutstyr i stedet for utskifting',
      'Vedlikehold av kjølekjede for å hindre svinn',
    ],
    category: 'extended-life',
    color: 'bg-blue-50 text-blue-700',
    border: 'border-blue-200',
  },
  {
    id: 'R5',
    rank: 5,
    name: 'Refurbish',
    nameNo: 'Oppgradere',
    description: 'Oppdatere og restaurere. Mest relevant for matindustri-infrastruktur.',
    foodExamples: [
      'Modernisering av eldre slakterier og meierier',
      'Retrofit av kuldelager med CO2-vaeske',
    ],
    category: 'extended-life',
    color: 'bg-blue-50 text-blue-700',
    border: 'border-blue-200',
  },
  {
    id: 'R6',
    rank: 6,
    name: 'Remanufacture',
    nameNo: 'Regenerere',
    description:
      'Bruk deler av kasserte produkter i nye med samme funksjon. I matsystemet: produktinnovasjoner som bygger nytt produkt av side- eller reststrommer.',
    foodExamples: [
      'Myse fra osteproduksjon til proteinprodukter (TINE)',
      'Restbrod til ol og knekkebrod',
      'Pressavfall fra havremelk til bakevarer',
    ],
    category: 'useful-application',
    color: 'bg-amber-50 text-amber-700',
    border: 'border-amber-200',
  },
  {
    id: 'R7',
    rank: 7,
    name: 'Repurpose',
    nameNo: 'Omforme',
    description:
      'Bruk kasserte produkter i annen funksjon. I matsystemet: mat og avfall som gar til dyrefor, fertilisator eller andre ikke-mat-anvendelser.',
    foodExamples: [
      'Fiskeavfall til fiskemel/fiskeolje (Pelagia)',
      'Insektprotein fra matavfall (Volare, Enorm)',
      'Slakteriavfall til dyrefor (Nortura)',
      'AX Framtidens Fisk: fiskefor fra 20 sideressurser',
      'Kalundborg industriell symbiose',
    ],
    category: 'useful-application',
    color: 'bg-amber-100 text-amber-800',
    border: 'border-amber-300',
  },
  {
    id: 'R8',
    rank: 8,
    name: 'Recycle',
    nameNo: 'Materialgjenvinning',
    description:
      'Prosessere materialer tilbake til rastoffer av samme eller lavere kvalitet. I matsystemet: emballasje og naeringsgjenvinning.',
    foodExamples: [
      'Gront Punkt EPR (emballasje)',
      'Kompostering til jordforbedring',
      'Naeringsgjenvinning svartvann (Helsingborg): N, P, K til jordbruk',
      'Oppdrettsslam til jordforbedringsprodukter',
    ],
    category: 'useful-application',
    color: 'bg-orange-50 text-orange-700',
    border: 'border-orange-200',
  },
  {
    id: 'R9',
    rank: 9,
    name: 'Recover',
    nameNo: 'Energigjenvinning',
    description:
      'Forbrenning med energigjenvinning eller biogassproduksjon. Lineær logikk — energien tas ut men materialet er tapt som råvare. Nederste trinn for sirkulær.',
    foodExamples: [
      'Biogass fra matavfall (Den Magiske Fabrikken, Gasum)',
      'Biogassproduksjon fra matsvinn og gjødsel',
      'Forbrenningsanlegg med fjernvarme',
      'Wageningen/Moerman-kaskade brukes som metode-lens for å holde energi nederst - ikke effektbevis',
    ],
    category: 'linear',
    color: 'bg-stone-100 text-stone-700',
    border: 'border-stone-300',
  },
]

export const rLadderById: Record<RLevel, RLadderStep> = rLadder.reduce(
  (acc, step) => ({ ...acc, [step.id]: step }),
  {} as Record<RLevel, RLadderStep>,
)

export type ValueChainSlot =
  | 'primary'
  | 'processing'
  | 'distribution'
  | 'retail'
  | 'horeca'
  | 'household'
  | 'seafood'
  | 'waste'

export const valueChainSlots: { id: ValueChainSlot; label: string; labelNo: string }[] = [
  { id: 'primary', label: 'Primary production', labelNo: 'Primaerprod.' },
  { id: 'processing', label: 'Processing', labelNo: 'Foredling' },
  { id: 'distribution', label: 'Distribution', labelNo: 'Distribusjon' },
  { id: 'retail', label: 'Retail', labelNo: 'Retail' },
  { id: 'horeca', label: 'HORECA', labelNo: 'HORECA' },
  { id: 'household', label: 'Household', labelNo: 'Husholdning' },
  { id: 'seafood', label: 'Seafood', labelNo: 'Sjomat' },
  { id: 'waste', label: 'Waste', labelNo: 'Avfall' },
]

export const rCategoryColors: Record<RCategory, string> = {
  'core-circular': 'bg-emerald-500',
  'extended-life': 'bg-blue-500',
  'useful-application': 'bg-amber-500',
  linear: 'bg-stone-500',
}
