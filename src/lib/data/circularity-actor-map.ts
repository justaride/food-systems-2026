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

  // Alias-navn (samme anlegg som allerede mappede aktører)
  // "Den Magiske Fabrikken" er navnet på Greve Biogass sitt anlegg i Vestfold
  'Den Magiske Fabrikken': { type: 'actor', href: '/aktorer/greve-biogass' },

  // Circular food research actors (2026-04-23)
  'Norsoek': { type: 'actor', href: '/aktorer/norsok' },
  'NORSOEK': { type: 'actor', href: '/aktorer/norsok' },
  'Nutricycle': { type: 'actor', href: '/aktorer/nutricycle' },
  'Columbi Farms': { type: 'actor', href: '/aktorer/nutricycle' },
  'Onnest': { type: 'actor', href: '/aktorer/onnest' },
  'RISE': { type: 'actor', href: '/aktorer/rise' },
  'IVL': { type: 'actor', href: '/aktorer/ivl' },
  'KTH PLENTY': { type: 'actor', href: '/aktorer/kth-plenty' },
  'KTH PLATE': { type: 'actor', href: '/aktorer/kth-plate' },
  'LTU': { type: 'actor', href: '/aktorer/lulea-tekniska-universitet' },
  'Jalm&B': { type: 'actor', href: '/aktorer/jalm-b' },
  'Circular Food Technology': { type: 'actor', href: '/aktorer/circular-food-technology' },
  'Peter Larsen Coffee': { type: 'actor', href: '/aktorer/peter-larsen-coffee' },
  'PhosphorCare': { type: 'actor', href: '/aktorer/phosphorcare' },
  'Reduced': { type: 'actor', href: '/aktorer/reduced' },
  'Nordic Circular Hotspot': { type: 'actor', href: '/aktorer/nordic-circular-hotspot' },
}
