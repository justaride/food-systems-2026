import type { CitationReadinessLevel } from '@/lib/citations/citation-status'
import type { EvidenceStatus } from '@/lib/visualization/types'

export const MATSYSTEM_SNITT_STAGE_IDS = [
  'inputs',
  'primary',
  'processing',
  'distribution',
  'market',
  'consumption',
  'return-flows',
] as const

export const MATSYSTEM_SNITT_LAYER_IDS = [
  'structure',
  'power',
  'dependency',
  'circularity',
  'evidence',
] as const

export type MatsystemSnittStageId = (typeof MATSYSTEM_SNITT_STAGE_IDS)[number]
export type MatsystemSnittLayerId = (typeof MATSYSTEM_SNITT_LAYER_IDS)[number]

export type MatsystemSnittSourceRef = {
  label: string
  citationReadiness: CitationReadinessLevel
  note: string
  href?: string
  path?: string
}

export type MatsystemSnittEvidence = {
  status: EvidenceStatus
  sourceRefs: readonly MatsystemSnittSourceRef[]
  methodNote: string
}

export type MatsystemSnittSignal =
  | {
      state: 'available'
      title: string
      detail: string
      evidence: MatsystemSnittEvidence
    }
  | {
      state: 'gap'
      title: string
      detail: string
      gap: {
        neededData: string
        nextCheck: string
      }
    }

export type MatsystemSnittStage = {
  id: MatsystemSnittStageId
  order: number
  label: string
  shortLabel: string
  question: string
  href: string
  signals: Record<MatsystemSnittLayerId, MatsystemSnittSignal>
}

export type MatsystemSnittLayer = {
  id: MatsystemSnittLayerId
  label: string
  description: string
}

const SYNTHESIS_SOURCE: MatsystemSnittSourceRef = {
  label: 'Food Systems 2026 synthesis v2',
  citationReadiness: 'internal_context',
  note: 'Kanonisk intern syntese; underliggende kilder må brukes ved ekstern publisering.',
  path: 'research/whitepaper/food-systems-2026-synthesis-v2.md',
}

const COMPLETION_SOURCE: MatsystemSnittSourceRef = {
  label: 'Completion register 2026-07-15',
  citationReadiness: 'internal_context',
  note: 'Kanonisk intern status for complete, human-gated, source-gated og true-C.',
  path: 'docs/project/status/food-systems-completion-register-2026-07-15.md',
}

const TYPE_C_SOURCE: MatsystemSnittSourceRef = {
  label: 'Det Norge ikke måler',
  citationReadiness: 'internal_context',
  note: 'Datert intern syntese av strukturelle målehull og neste kontroll.',
  path: 'research/forstaelse/det-norge-ikke-maaler.md',
}

const MARKET_SOURCE: MatsystemSnittSourceRef = {
  label: 'Konkurransetilsynets Dagligvarerapport 2024–25',
  citationReadiness: 'citable_with_note',
  note: 'Omsetnings-HHI og CR3 gjelder norsk dagligvare i rapportens avgrensning.',
  href: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25-1.pdf',
}

const CIRCULARITY_SOURCE: MatsystemSnittSourceRef = {
  label: 'Kontrollert sirkularitetsgrunnlag',
  citationReadiness: 'internal_context',
  note: 'Kartlagte looper kombinerer observert, estimert og illustrativ evidens.',
  path: 'public/data/food-systems/material-flows.json',
}

function available(
  title: string,
  detail: string,
  status: EvidenceStatus,
  sourceRefs: readonly MatsystemSnittSourceRef[],
  methodNote: string,
): MatsystemSnittSignal {
  return {
    state: 'available',
    title,
    detail,
    evidence: { status, sourceRefs, methodNote },
  }
}

function gap(
  title: string,
  detail: string,
  neededData: string,
  nextCheck: string,
): MatsystemSnittSignal {
  return {
    state: 'gap',
    title,
    detail,
    gap: { neededData, nextCheck },
  }
}

export const matsystemSnittLayers: readonly MatsystemSnittLayer[] = [
  {
    id: 'structure',
    label: 'System',
    description: 'Følg funksjonene fra ressursgrunnlag til forbruk og tilbakeføring.',
  },
  {
    id: 'power',
    label: 'Makt',
    description: 'Se hvor eierskap, konsentrasjon og tilgang til marked samler innflytelse.',
  },
  {
    id: 'dependency',
    label: 'Avhengighet',
    description: 'Se import-, kapasitets- og infrastrukturavhengigheter — og hvor måling mangler.',
  },
  {
    id: 'circularity',
    label: 'Sirkularitet',
    description: 'Følg forebygging, sidestrømmer og mulig retur av materialer og næringsstoffer.',
  },
  {
    id: 'evidence',
    label: 'Evidens',
    description: 'Se hvilke deler som bygger på observasjon, estimat, proxy, modell eller åpne gap.',
  },
] as const

export const matsystemSnittStages: readonly MatsystemSnittStage[] = [
  {
    id: 'inputs',
    order: 1,
    label: 'Innsatsvarer',
    shortLabel: 'Innsats',
    question: 'Hva må inn i systemet før mat kan produseres?',
    href: '/verdikjede',
    signals: {
      structure: available('Ressursgrunnlaget', 'Gjødsel, fôr, frø, energi, teknologi og areal.', 'illustrative', [SYNTHESIS_SOURCE], 'Kategorisk oversikt; ingen mengder sammenlignes.'),
      power: available('Leverandørmakt', 'Flere kritiske innsatsledd har få sentrale leverandører.', 'proxy', [SYNTHESIS_SOURCE], 'Strukturell analyse, ikke ett harmonisert konsentrasjonsmål.'),
      dependency: available('Importavhengighet', 'Fôr, fosfat, kali og energi kobler Norge til globale markeder.', 'proxy', [SYNTHESIS_SOURCE], 'Avhengigheten er ulikt målt per råvare og periode.'),
      circularity: available('Sekundære råvarer', 'Returstrømmer kan redusere uttak, men realisert effekt må måles.', 'illustrative', [CIRCULARITY_SOURCE], 'Mulighetsrom, ikke dokumentert substitusjon.'),
      evidence: available('Blandet grunnlag', 'Primærstatistikk finnes side om side med strukturelle målehull.', 'estimated', [SYNTHESIS_SOURCE, TYPE_C_SOURCE], 'Status må leses per indikator, ikke per ledd samlet.'),
    },
  },
  {
    id: 'primary',
    order: 2,
    label: 'Primærproduksjon',
    shortLabel: 'Primær',
    question: 'Hvor og hvordan oppstår råvarene?',
    href: '/produsenter',
    signals: {
      structure: available('Råvarer fra land og sjø', 'Jordbruk, husdyr, villfisk og akvakultur danner råvarebasen.', 'illustrative', [SYNTHESIS_SOURCE], 'Sektorer samles funksjonelt, ikke som volumregnskap.'),
      power: available('Eierskap og samvirke', 'Samvirker, kvoter og private eierstrukturer former markedstilgang.', 'proxy', [SYNTHESIS_SOURCE], 'Maktformen varierer mellom produktkategorier.'),
      dependency: available('Produksjonsvilkår', 'Klima, areal, fôr og innsatsvarer påvirker robustheten.', 'estimated', [SYNTHESIS_SOURCE], 'Sammenhengen er dokumentert ulikt mellom sektorene.'),
      circularity: available('Jord og næringsretur', 'Jordhelse og tilbakeføring er sentralt, men delvis modellert.', 'proxy', [SYNTHESIS_SOURCE, TYPE_C_SOURCE], 'Nasjonal direkte målt SOC-baseline mangler.'),
      evidence: available('Primærstatistikk', 'Produksjonsdata finnes, men nordisk harmonisering er ufullstendig.', 'observed', [SYNTHESIS_SOURCE], 'Observerte serier har ulike definisjoner og år.'),
    },
  },
  {
    id: 'processing',
    order: 3,
    label: 'Foredling',
    shortLabel: 'Foredling',
    question: 'Hvem omformer råvarer til mat og ingredienser?',
    href: '/selskap',
    signals: {
      structure: available('Industri og foredling', 'Råvarer sorteres, prosesseres, pakkes og gjøres markedsbare.', 'illustrative', [SYNTHESIS_SOURCE], 'Funksjonell plassering, ikke full kapasitetsoversikt.'),
      power: available('Kategori for kategori', 'Foredlingsmakt samles ulikt i meieri, kjøtt, sjømat og merkevarer.', 'proxy', [SYNTHESIS_SOURCE], 'Nodeverdier bruker forskjellige markeder og beregningsbaser.'),
      dependency: gap('Reservekapasitet', 'Sammenlignbar åpen kapasitet er ikke samlet på tvers av anlegg.', 'Anleggsvis kapasitet, utnyttelse, substitusjonsmulighet og tid.', 'Ved nytt register- eller aktøruttrekk.'),
      circularity: available('Sidestrømmer', 'Restråstoff og biprodukter kan gå til mat, fôr, biogass eller gjødsel.', 'estimated', [CIRCULARITY_SOURCE], 'Volum, kvalitet og faktisk sluttbruk varierer.'),
      evidence: available('Selskapsdata og estimater', 'Regnskap er sterkere enn sammenlignbar fysisk kapasitetsdata.', 'proxy', [SYNTHESIS_SOURCE, COMPLETION_SOURCE], 'Ikke oversett omsetning til produksjonsvolum.'),
    },
  },
  {
    id: 'distribution',
    order: 4,
    label: 'Grossist og logistikk',
    shortLabel: 'Logistikk',
    question: 'Hvordan flyttes, lagres og fordeles maten?',
    href: '/forsyningskjede',
    signals: {
      structure: available('Flyt og infrastruktur', 'Grossist, lager, havn, transport og kjølekjede binder leddene sammen.', 'illustrative', [SYNTHESIS_SOURCE], 'Forbindelsene er kategoriske og likebrede.'),
      power: available('Vertikal integrasjon', 'Grossist og distribusjon er tett koblet til de store kjedene.', 'proxy', [SYNTHESIS_SOURCE], 'Relasjoner og markedsandel må holdes atskilt.'),
      dependency: gap('Nodekapasitet', 'Åpen, sammenlignbar kapasitet for havn, kaldkjede og sentrallager mangler.', 'Kapasitet, utnyttelse, redundans, lagerdøgn og alternative ruter.', 'Årlig Type-C-kontroll eller ved ny offentlig datakilde.'),
      circularity: available('Returlogistikk', 'Innsamling og retur er en muliggjører, ikke dokumentert effekt alene.', 'illustrative', [CIRCULARITY_SOURCE], 'Kartlagt forbindelse må ikke omtales som realisert kretsløp.'),
      evidence: gap('Strukturelt målehull', 'Infrastruktur finnes, men åpen kapasitetsserie er ikke identifisert.', 'Felles node- og kapasitetskontrakt.', 'Neste kontroll i Type-C-registeret.'),
    },
  },
  {
    id: 'market',
    order: 5,
    label: 'Markedskanaler',
    shortLabel: 'Marked',
    question: 'Hvem bestemmer tilgang, sortiment og pris mot markedet?',
    href: '/innsikt',
    signals: {
      structure: available('Handel og kanaler', 'Dagligvare, HoReCa, offentlig innkjøp og direktekanaler møter tilbudet.', 'illustrative', [SYNTHESIS_SOURCE], 'Kanalene har ulike datagrunnlag og markedsgrenser.'),
      power: available('HHI 3 327 · CR3 96,6 %', 'Kontrollert norsk omsetningsmål for dagligvaremarkedet.', 'observed', [MARKET_SOURCE], 'Holdes atskilt fra butikkantall-proxy og nordiske rangeringer.'),
      dependency: available('Kanalavhengighet', 'Tre kjeder dominerer norsk dagligvare; andre kanaler er svakere målt.', 'observed', [MARKET_SOURCE], 'Gjelder dagligvareomsetning, ikke hele matsystemet.'),
      circularity: available('Krav og insentiver', 'Sortiment, innkjøp, emballasje og svinn påvirkes av markedskanalene.', 'estimated', [SYNTHESIS_SOURCE], 'Effekt må dokumenteres per tiltak og ledd.'),
      evidence: available('Sterkt norsk snapshot', 'Norsk dagligvare er kontrollert; full nordisk omsetningsparitet mangler.', 'observed', [MARKET_SOURCE, COMPLETION_SOURCE], 'Sammenlign ikke butikkantall-HHI med omsetnings-HHI.'),
    },
  },
  {
    id: 'consumption',
    order: 6,
    label: 'Forbruk og måltid',
    shortLabel: 'Forbruk',
    question: 'Hvordan blir maten valgt, kjøpt, tilberedt og spist?',
    href: '/sammenligning',
    signals: {
      structure: available('Husholdning og storhusholdning', 'Pris, kosthold, tilgjengelighet og praksis former etterspørselen.', 'illustrative', [SYNTHESIS_SOURCE], 'Forbrukskanaler samles uten å anta lik adferd.'),
      power: available('Pris og innkjøpsmakt', 'Kjedemakt møter offentlige innkjøp, HoReCa og husholdningsvalg.', 'proxy', [SYNTHESIS_SOURCE], 'Påvirkning er ikke ett direkte målt makttall.'),
      dependency: available('Tilgang og pris', 'Geografi, inntekt og kanalvalg påvirker tilgang og sårbarhet.', 'estimated', [SYNTHESIS_SOURCE], 'Dekning og definisjon varierer mellom datasettene.'),
      circularity: available('Forebygg først', 'Forebygging, omfordeling og bedre bruk kommer før behandling av avfall.', 'estimated', [SYNTHESIS_SOURCE, CIRCULARITY_SOURCE], 'Tiltakseffekt krever baseline og systemgrense.'),
      evidence: available('Snapshots og delserier', 'Flere indikatorer finnes, men få er lange og nordisk harmoniserte.', 'estimated', [SYNTHESIS_SOURCE, COMPLETION_SOURCE], 'Vis periode og definisjon på hver indikator.'),
    },
  },
  {
    id: 'return-flows',
    order: 7,
    label: 'Rest- og næringsstrømmer',
    shortLabel: 'Retur',
    question: 'Hva forebygges, brukes om igjen eller føres tilbake?',
    href: '/sirkularitet',
    signals: {
      structure: available('Retur til systemet', 'Svinn, restråstoff, organisk materiale og N/P/K kan få nye løp.', 'illustrative', [CIRCULARITY_SOURCE], 'Returpilen viser funksjon, ikke massebalanse.'),
      power: available('Kontroll over sluttbruk', 'Eierskap til strøm, teknologi og mottakere er ujevnt kartlagt.', 'proxy', [CIRCULARITY_SOURCE], 'Aktørforekomst er ikke realisert volum eller kontroll.'),
      dependency: gap('Realisert næringsretur', 'Nasjonal aggregert N/P/K-retur fra biorest og slam mangler.', 'Anleggsvis innmating, behandling, produktkvalitet og faktisk sluttbruk.', 'Årlig Type-C-kontroll eller ved nytt nasjonalt måleregime.'),
      circularity: available('Kartlagte kretsløp', 'Loopene viser mulige og eksisterende forbindelser; full balanse mangler.', 'illustrative', [CIRCULARITY_SOURCE], 'Observerte, estimerte og illustrative strømmer må vises separat.'),
      evidence: gap('Modellert og ufullstendig', 'Materialstrømmene kan ikke bære et nasjonalt realisert effektregnskap.', 'Målte mengder, systemgrense, tidsperiode og kildelocator per strøm.', 'Ved finansiert materialstrømmodell og nye primærdata.'),
    },
  },
] as const

export const matsystemSnittTopologyNote =
  'Kategorisk systemkart; forbindelser og bredder viser ikke sammenlignbare mengder eller en full massebalanse.'
