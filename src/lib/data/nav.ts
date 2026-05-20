export type NavItem = { name: string; href: string; description: string }
export type NavGroup = { label?: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  {
    items: [
      { name: 'Oversikt', href: '/', description: 'Fase, fremdrift, neste steg' },
    ],
  },
  {
    label: 'Intern',
    items: [
      { name: 'Team', href: '/team', description: 'Medlemmer og roller' },
      { name: 'Møter', href: '/moter', description: 'Møtesammendrag og referater' },
      { name: 'Kommunikasjon', href: '/kommunikasjon', description: 'E-post og korrespondanse' },
      { name: 'Mandat', href: '/mandat', description: 'Food TG scope, claims og validering' },
      { name: 'Metodikk', href: '/metodikk', description: 'Ten Step, KPIs og deep research-prompter' },
      { name: 'Tidslinje', href: '/tidslinje', description: 'Faser og søknader' },
    ],
  },
  {
    label: 'Selskap & Eierskap',
    items: [
      { name: 'Eierskap', href: '/eierskap', description: 'Konsernstrukturer og eiertrær' },
      { name: 'Eiendommer', href: '/eiendommer', description: 'Selskapseiendommer og lokaler' },
      { name: 'Styremedlemmer', href: '/styremedlemmer', description: 'Krysstyrer og nettverk' },
    ],
  },
  {
    label: 'Matsystem',
    items: [
      { name: 'Verdikjede', href: '/verdikjede', description: 'Nordisk verdikjedeanalyse' },
      { name: 'Forsyningskjede', href: '/forsyningskjede', description: 'Leverandørrelasjoner, primærleveranser og selvhandel' },
      { name: 'Havbruk', href: '/havbruk', description: 'Lokaliteter og søknader (Fiskeridir)' },
      { name: 'Subsidier', href: '/subsidier', description: 'Tilskudd per kommune, ordning og mottaker' },
      { name: 'Sirkularitet', href: '/sirkularitet', description: 'R-stige, 10 spørsmål, looper og caser' },
      { name: 'Økonomi', href: '/okonomi', description: 'Finansielle trender og sammenligning' },
    ],
  },
  {
    label: 'Nordisk',
    items: [
      { name: 'Sammenligning', href: '/sammenligning', description: 'Nordisk sammenligning' },
      { name: 'Politikk', href: '/politikk', description: 'Nordisk matpolitikk-sammenligning' },
      { name: 'Kart', href: '/kart', description: 'Butikker og kommunegrenser' },
      { name: 'Media', href: '/media', description: 'Medieomtale og narrativer' },
    ],
  },
  {
    label: 'Kunnskap',
    items: [
      { name: 'Innsikt', href: '/innsikt', description: 'Forskning, kartlegging, analyse' },
      { name: 'Forskningsrunder', href: '/forskningsrunder', description: 'Food Research Process 20. april 2026' },
      { name: 'Akademia', href: '/masteroppgaver', description: 'Master- og PhD-avhandlinger' },
      { name: 'Graf', href: '/graf', description: 'Kunnskapsgraf og koblinger' },
    ],
  },
  {
    label: 'Bibliotek',
    items: [
      { name: 'Rapporter', href: '/rapporter', description: 'Offentlige og bransjeanalyser' },
      { name: 'Bibliotek', href: '/bibliotek', description: 'Fulltekst forskningsdokumenter' },
      { name: 'Kilder', href: '/kilder', description: 'Dokumenter og referanser' },
      { name: 'Aktører', href: '/aktorer', description: 'Prioritering, asks og relasjoner' },
      { name: 'Selskaper', href: '/selskap', description: 'Selskapsdata og regnskap' },
      { name: 'Personer', href: '/personer', description: 'Nøkkelpersoner og roller' },
      { name: 'Søk', href: '/sok', description: 'Søk på tvers av alt' },
    ],
  },
]
