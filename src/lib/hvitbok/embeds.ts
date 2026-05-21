export type NokkeltallEmbed = {
  kind: 'nokkeltall'
  label: string
  value: string
  enhet?: string
  kilde: string
}

export type CalloutEmbed = {
  kind: 'callout'
  tekst: string
  kilde?: string
  variant: 'info' | 'sitat' | 'advarsel'
}

export type VizEmbed = {
  kind: 'viz'
  chartId?: string
  href: string
  label: string
  description: string
}

export type RelatertEmbed = {
  kind: 'relatert'
  lenker: Array<{ href: string; label: string; description: string }>
}

export type EmbedDefinition =
  | NokkeltallEmbed
  | CalloutEmbed
  | VizEmbed
  | RelatertEmbed

export const EMBEDDABLE_CHARTS: Set<string> = new Set(['zipf-distribution'])

export const chapterEmbeds: Record<string, Record<string, EmbedDefinition>> = {
  'kort-til-jan-thomas': {
    'oeko-melk-anvendelse': {
      kind: 'nokkeltall',
      label: 'Anvendelsesgrad økologisk melk',
      value: '80',
      enhet: '%',
      kilde: 'Landbruksdirektoratet 2026',
    },
    'landbruksdir-sitat': {
      kind: 'callout',
      variant: 'sitat',
      tekst:
        'Det var ikke nok økologisk melk til å dekke etterspørselen. Norsk melkeråvare avkortet derfor leveranser av økologisk melk i store deler av 2025.',
      kilde: 'Landbruksdirektoratet 2026',
    },
    'butikk-zipf': {
      kind: 'viz',
      chartId: 'zipf-distribution',
      href: '/sammenligning',
      label: 'Zipf-fordeling — butikker per kommune',
      description: 'Hvor konsentrert butikkstrukturen er på tvers av kommuner.',
    },
    'jt-relatert': {
      kind: 'relatert',
      lenker: [
        {
          href: '/eierskap',
          label: 'Eierskap',
          description: 'Hvem som eier de store dagligvareaktørene.',
        },
        {
          href: '/graf',
          label: 'Kunnskapsgraf',
          description: 'Relasjoner mellom selskaper, personer og roller.',
        },
      ],
    },
  },
  'nordisk-sirkularitet': {
    'dk-soya-sporing': {
      kind: 'nokkeltall',
      label: 'Fysisk sporbar dansk soya-import',
      value: '6',
      enhet: '%',
      kilde: 'IFRO/KU 2025',
    },
    'eudr-frist': {
      kind: 'callout',
      variant: 'advarsel',
      tekst:
        'EUDR krever 100 % sporing fra 30.12.2026. Norge har eksplisitt unntatt soya — en EU-norsk asymmetri.',
      kilde: 'EUDR / egen analyse',
    },
    'sirk-relatert': {
      kind: 'relatert',
      lenker: [
        {
          href: '/forsyningskjede',
          label: 'Forsyningskjede',
          description: 'Nordisk dekning av forsyningskjede-data.',
        },
        {
          href: '/verdikjede',
          label: 'Verdikjede',
          description: 'Verdikjede-flyt i matsektoren.',
        },
      ],
    },
  },
  fokusomraader: {
    'fokus-intro': {
      kind: 'callout',
      variant: 'info',
      tekst:
        'De fem fokusområdene er rangert etter score i transition-group-vurderingen.',
    },
    'fokus-relatert': {
      kind: 'relatert',
      lenker: [
        {
          href: '/mandat',
          label: 'Mandat',
          description: 'Transition groupens mandat og avgrensning.',
        },
        {
          href: '/innsikt',
          label: 'Innsikt',
          description: 'Innsiktskorpus bak fokusområdene.',
        },
      ],
    },
  },
}

export function getEmbed(
  chapterSlug: string,
  tokenId: string,
): EmbedDefinition | undefined {
  return chapterEmbeds[chapterSlug]?.[tokenId]
}
