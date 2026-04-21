// Mapping bygget ved å krysse aktørnavn fra public/data/food-systems/circularity-loops.json mot slugs i src/lib/data/actors.ts (case-insensitive, med fallback for parentetiske suffix og konsernvariantter)

export type CircularityActorLink = {
  type: 'actor' | 'company'
  href: string
}

export const CIRCULARITY_ACTOR_MAP: Record<string, CircularityActorLink> = {
  // existing_loops aktører
  'Infinitum': { type: 'actor', href: '/aktorer/infinitum' },
  'TINE SA': { type: 'actor', href: '/aktorer/tine' },
  'Nortura SA': { type: 'actor', href: '/aktorer/nortura' },
  'Orkla': { type: 'actor', href: '/aktorer/orkla' },
  'HOFF': { type: 'actor', href: '/aktorer/hoff-sa' },
  'Biomega': { type: 'actor', href: '/aktorer/biomega-norway' },
  'Nofima': { type: 'actor', href: '/aktorer/nofima' },
  'Gront Punkt Norge': { type: 'actor', href: '/aktorer/gront-punkt-norge' },
  'Greve Biogass': { type: 'actor', href: '/aktorer/greve-biogass' },
  'St1 Biokraft': { type: 'actor', href: '/aktorer/st1-biokraft' },
  'Nature Energy': { type: 'actor', href: '/aktorer/nature-energy-shell' },
  'Gasum': { type: 'actor', href: '/aktorer/gasum-finland' },
  'Gasum SE': { type: 'actor', href: '/aktorer/gasum-finland' },
  'Matsentralen (8 locations)': { type: 'actor', href: '/aktorer/matsentralen-norge' },
  'Too Good To Go': { type: 'actor', href: '/aktorer/too-good-to-go' },
  'REKO-ringer': { type: 'actor', href: '/aktorer/reko-norge' },
  'Compass Group': { type: 'actor', href: '/aktorer/compass-group' },
  'Sodexo': { type: 'actor', href: '/aktorer/sodexo' },
  'PeelPioneers': { type: 'actor', href: '/aktorer/peelpioneers' },
  'Foodsharing Copenhagen': { type: 'actor', href: '/aktorer/foodsharing-copenhagen' },

  // actor_cases / additional_success / additional_failure
  'Restaurant Rest': { type: 'actor', href: '/aktorer/restaurant-rest' },
  'Enorm Biofactory': { type: 'actor', href: '/aktorer/enorm-biofactory' },
  'Infarm': { type: 'actor', href: '/aktorer/infarm' },
  'Mycorena': { type: 'actor', href: '/aktorer/mycorena' },
  'DUG Foodtech': { type: 'actor', href: '/aktorer/dug-foodtech' },
  'Hooked Foods': { type: 'actor', href: '/aktorer/hooked-foods' },
  'Meatless Farm': { type: 'actor', href: '/aktorer/meatless-farm' },
  'Ynsect': { type: 'actor', href: '/aktorer/ynsect' },
  'Volare': { type: 'actor', href: '/aktorer/volare-finland' },
  'Finnforel': { type: 'actor', href: '/aktorer/finnforel' },
  'Solar Foods (Solein)': { type: 'actor', href: '/aktorer/solar-foods' },
  'VermiNord': { type: 'actor', href: '/aktorer/verminord' },
  'Bokashi Norge / Bokashi Norden': { type: 'actor', href: '/aktorer/bokashi-norge' },
  'Oatly okara-håndtering': { type: 'actor', href: '/aktorer/oatly' },
  'Melta': { type: 'actor', href: '/aktorer/melta-iceland' },

  // AX Foundation pilots/prosjekter — alle lenker til axfoundation
  'AX Foundation — Framtidens Fisk': { type: 'actor', href: '/aktorer/axfoundation' },
  'AX Foundation — Smart Svensk Sjömat': { type: 'actor', href: '/aktorer/axfoundation' },
  'Kernza / Knylkorn (AX Foundation pilot)': { type: 'actor', href: '/aktorer/axfoundation' },
  'Svensk Baljväxtfärs (AX Foundation)': { type: 'actor', href: '/aktorer/axfoundation' },
}
