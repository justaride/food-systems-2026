export type NavItem = { key: string; href: string }
export type NavGroup = { groupKey?: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  { items: [
    { key: 'oversikt', href: '/' },
    { key: 'sok', href: '/sok' },
  ]},
  { groupKey: 'intern', items: [
    { key: 'team', href: '/team' },
    { key: 'moter', href: '/moter' },
    { key: 'kommunikasjon', href: '/kommunikasjon' },
    { key: 'mandat', href: '/mandat' },
    { key: 'metodikk', href: '/metodikk' },
    { key: 'tidslinje', href: '/tidslinje' },
  ]},
  { groupKey: 'selskap', items: [
    { key: 'selskaper', href: '/selskap' },
    { key: 'eierskap', href: '/eierskap' },
    { key: 'styremedlemmer', href: '/styremedlemmer' },
    { key: 'personer', href: '/personer' },
    { key: 'eiendommer', href: '/eiendommer' },
  ]},
  { groupKey: 'matsystem', items: [
    { key: 'verdikjede', href: '/verdikjede' },
    { key: 'forsyningskjede', href: '/forsyningskjede' },
    { key: 'havbruk', href: '/havbruk' },
    { key: 'sirkularitet', href: '/sirkularitet' },
    { key: 'okonomi', href: '/okonomi' },
  ]},
  { groupKey: 'produsenter', items: [
    { key: 'produsentregister', href: '/produsenter' },
    { key: 'subsidier', href: '/subsidier' },
  ]},
  { groupKey: 'nordisk', items: [
    { key: 'sammenligning', href: '/sammenligning' },
    { key: 'politikk', href: '/politikk' },
    { key: 'kart', href: '/kart' },
    { key: 'media', href: '/media' },
  ]},
  { groupKey: 'kunnskap', items: [
    { key: 'innsikt', href: '/innsikt' },
    { key: 'forskningsrunder', href: '/forskningsrunder' },
    { key: 'akademia', href: '/masteroppgaver' },
    { key: 'graf', href: '/graf' },
    { key: 'aktorer', href: '/aktorer' },
  ]},
  { groupKey: 'bibliotek', items: [
    { key: 'rapporter', href: '/rapporter' },
    { key: 'hvitbok', href: '/hvitbok' },
    { key: 'bibliotek', href: '/bibliotek' },
    { key: 'kilder', href: '/kilder' },
  ]},
]
