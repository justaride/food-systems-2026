// Innholdet er kortet ned fra research/whitepaper/v3/hvitbok-v3-utkast.md (kap. 1.2, 2 og 4.2).
// P-ID-ene peker til research/whitepaper/v3/pastandsregister.md. tests/lib/matreise.test.ts
// vokter at status og tidskritisk-merke her følger registeret.

export type MatreiseStatus = 'siterbar' | 'kontrollert' | 'hypotese' | 'hull' | 'vedtak'

export type MatreiseClaim = { status: MatreiseStatus; timeCritical?: true }

export type MatreisePoint = { text: string; claims: readonly string[] }

export type MatreiseFigure = { value: string; label: string; claims: readonly string[] }

export type MatreiseLink = { label: string; href: string }

export type MatreiseStationId =
  | 'innsatsvarer'
  | 'garden'
  | 'havet'
  | 'foredling'
  | 'logistikk'
  | 'butikken'
  | 'kjokkenet'
  | 'tilbake'

export type MatreiseStation = {
  id: MatreiseStationId
  order: number
  title: string
  tagline: string
  chapter: string
  happens: MatreisePoint
  figures: readonly MatreiseFigure[]
  holds: readonly MatreisePoint[]
  breaks: readonly MatreisePoint[]
  unknown: readonly MatreisePoint[]
  links: readonly MatreiseLink[]
}

export type MatreiseBreadStep = {
  title: string
  known: boolean
  text: string
  claims: readonly string[]
}

export type MatreiseTakeaway = { title: string; text: string; claims: readonly string[] }

export const MATREISE_STATUS_LABELS: Record<MatreiseStatus, string> = {
  siterbar: 'Siterbar',
  kontrollert: 'Kontrollert internt',
  hypotese: 'Hypotese eller åpent spørsmål',
  hull: 'Kunnskapshull',
  vedtak: 'Vedtak eller metode',
}

export const matreiseClaims: Record<string, MatreiseClaim> = {
  'P-001': { status: 'vedtak' },
  'P-002': { status: 'kontrollert' },
  'P-004': { status: 'kontrollert' },
  'P-007': { status: 'hull' },
  'P-008': { status: 'hull' },
  'P-009': { status: 'siterbar' },
  'P-010': { status: 'siterbar' },
  'P-011': { status: 'siterbar' },
  'P-012': { status: 'siterbar' },
  'P-013': { status: 'siterbar' },
  'P-014': { status: 'siterbar' },
  'P-016': { status: 'kontrollert' },
  'P-017': { status: 'kontrollert' },
  'P-018': { status: 'hull' },
  'P-019': { status: 'siterbar' },
  'P-020': { status: 'siterbar' },
  'P-021': { status: 'kontrollert' },
  'P-023': { status: 'kontrollert' },
  'P-025': { status: 'siterbar' },
  'P-026': { status: 'kontrollert' },
  'P-027': { status: 'kontrollert' },
  'P-028': { status: 'kontrollert' },
  'P-029': { status: 'hull' },
  'P-032': { status: 'hypotese' },
  'P-033': { status: 'siterbar' },
  'P-034': { status: 'kontrollert' },
  'P-038': { status: 'hypotese' },
  'P-042': { status: 'hypotese' },
  'P-046': { status: 'kontrollert' },
  'P-047': { status: 'kontrollert', timeCritical: true },
  'P-049': { status: 'kontrollert' },
  'P-050': { status: 'kontrollert' },
  'P-052': { status: 'hull' },
  'P-053': { status: 'siterbar' },
  'P-054': { status: 'siterbar' },
  'P-055': { status: 'kontrollert' },
  'P-057': { status: 'kontrollert' },
  'P-059': { status: 'hull' },
  'P-060': { status: 'kontrollert' },
  'P-061': { status: 'hull' },
  'P-062': { status: 'kontrollert' },
  'P-063': { status: 'kontrollert' },
  'P-064': { status: 'hull' },
  'P-065': { status: 'hypotese' },
  'P-077': { status: 'kontrollert', timeCritical: true },
  'P-078': { status: 'kontrollert', timeCritical: true },
  'P-079': { status: 'kontrollert' },
  'P-080': { status: 'hull', timeCritical: true },
  'P-081': { status: 'kontrollert' },
  'P-082': { status: 'hull' },
  'P-128': { status: 'vedtak' },
  'P-142': { status: 'kontrollert' },
  'P-143': { status: 'kontrollert' },
}

export const matreiseIntro: readonly MatreisePoint[] = [
  {
    text: 'Forsyningssikkerhet betyr her at folk fortsatt får nok og egnet mat gjennom en forstyrrelse. Det er mer enn selvforsyning. Lager, transport, energi, folk, data og tid til å komme tilbake teller også.',
    claims: [],
  },
  {
    text: 'Prosjektet vedtok 18. juni 2026 forsyningssikkerhet som hovedmål. Sirkularitet er delmål og vurderes etter om den styrker forsyningssikkerheten.',
    claims: ['P-001'],
  },
]

export const matreiseStations: readonly MatreiseStation[] = [
  {
    id: 'innsatsvarer',
    order: 1,
    title: 'Innsatsvarer',
    tagline: 'Før maten finnes',
    chapter: 'Hvitbok v3, kap. 2.1',
    happens: {
      text: 'Gjødsel, fôrprotein, energi og såvarer må på plass før noe kan dyrkes eller fôres. Mye av det kommer utenfra. Derfor begynner forsyningssikkerheten lenge før gården.',
      claims: [],
    },
    figures: [
      {
        value: 'ca. 45 % / 35 %',
        label: 'selvforsyning uten og med korreksjon for importert kraftfôr (NIBIO, foreløpige tall for 2024). Det er to definisjoner av samme avhengighet.',
        claims: ['P-002'],
      },
      {
        value: '+127 %',
        label: 'prisindeksen for handelsgjødsel fra 2021 til 2023 (Budsjettnemnda for jordbruket, 2024 = 100).',
        claims: ['P-010'],
      },
    ],
    holds: [
      {
        text: 'Norge har gode primærkilder for innsatsleddet, og metoden for selvforsyning er åpen. Flere definisjoner kan vises side om side.',
        claims: [],
      },
      {
        text: 'Styring kan flytte et helt lands fôr uten ny teknologi. Et styrevedtak i finske Valio i 2018 endret fôret for om lag 80 prosent av finsk melk.',
        claims: ['P-004'],
      },
    ],
    breaks: [
      {
        text: 'Importert protein og importert gjødsel gjør at et prissjokk ute treffer alle produsenter hjemme samtidig. Jordbrukets gjødselkostnad gikk fra 1 913 til 3 686 millioner kroner fra 2021 til 2023.',
        claims: ['P-010'],
      },
      {
        text: 'Fôrleddet er høyt konsentrert, både kraftfôr til husdyr og fôr til oppdrett. Få selskaper står for det meste av volumet.',
        claims: ['P-009'],
      },
    ],
    unknown: [
      {
        text: 'Presise markedsandeler i kraftfôr og oppdrettsfôr finnes ikke i åpne kilder.',
        claims: ['P-008'],
      },
      {
        text: 'Prosjektet har ingen kontrollert fosforbalanse for Norge. Import av råfosfat alene beskriver ikke avhengigheten.',
        claims: ['P-007'],
      },
    ],
    links: [
      { label: 'Verdikjede', href: '/verdikjede' },
      { label: 'Forsyningskjede', href: '/forsyningskjede' },
    ],
  },
  {
    id: 'garden',
    order: 2,
    title: 'Gården',
    tagline: 'Der kostnadssjokket lander',
    chapter: 'Hvitbok v3, kap. 2.2',
    happens: {
      text: 'Jordbruket gjør innsatsvarer, jord og arbeid om til råvarer. Når kostnadene stiger raskere enn prisene, er det her fallet i inntekt kommer.',
      claims: [],
    },
    figures: [
      {
        value: '36 627',
        label: 'jordbruksbedrifter i Norge. Arbeidsinnsatsen falt fra 120 til 75 millioner timeverk fra 2004/05 til 2023.',
        claims: ['P-016'],
      },
      {
        value: '−75 200 kr',
        label: 'per familieårsverk fra 2022 til 2023, i faste 2024-kroner. 2023 var bunnåret.',
        claims: ['P-013'],
      },
      {
        value: '71,4 → 63,7 %',
        label: 'markedsinntektens andel av bruttoinntekten, fra 2021 til 2025 (foreløpig). Jordbruket ble mer avhengig av tilskudd.',
        claims: ['P-012'],
      },
    ],
    holds: [
      {
        text: 'Staten tok mye av kostnadssjokket. Fra 2021 til 2023 steg kostnadene med 7,0 milliarder kroner, markedsinntektene med 4,1 milliarder og tilskuddene med 5,3 milliarder.',
        claims: ['P-142'],
      },
      {
        text: 'En bred base av små og mellomstore bruk over hele landet er en styrke for regional tilgang på mat.',
        claims: [],
      },
    ],
    breaks: [
      {
        text: 'Renten traff gården. Renteoppgangen var den største enkeltårsaken til bunnåret 2023, og prisindeksene fanger ikke opp rentene.',
        claims: ['P-143'],
      },
      {
        text: 'Marginene er tynne og skjevt fordelt. Den minste ammekuproduksjonen ligger på 33 prosent av sammenligningslønnen og sau på 38–74 prosent (referansebruk 2026).',
        claims: ['P-014'],
      },
      {
        text: 'Kompetanse flytter fra gården til entreprenører og innleid arbeid. Da avgjør kapasiteten i disse nettverkene i en krise, og ingen kilde har målt den.',
        claims: ['P-017'],
      },
    ],
    unknown: [
      {
        text: 'Margin per kilo etter avtalene med kjøttindustri og meieri krever aktørdata som ikke er offentlige.',
        claims: ['P-018'],
      },
      {
        text: 'Sammenhengen mellom antall bruk, bondens alder og beredskapsevne er ikke dokumentert i noen nordisk kilde.',
        claims: ['P-016'],
      },
    ],
    links: [
      { label: 'Økonomi', href: '/okonomi' },
      { label: 'Subsidier', href: '/subsidier' },
      { label: 'Produsenter', href: '/produsenter' },
    ],
  },
  {
    id: 'havet',
    order: 3,
    title: 'Havet',
    tagline: 'Mye mat, men ikke uten videre kalorier hjemme',
    chapter: 'Hvitbok v3, kap. 2.7',
    happens: {
      text: 'Villfisk og oppdrett er den andre råvarebasen i norsk mat. Produksjonen er høy, men oppdrett trenger fôr, energi og emballasje utenfra.',
      claims: ['P-057'],
    },
    figures: [
      {
        value: '89 %',
        label: 'av marint restråstoff ble utnyttet i 2024, mest til fôr og energi. Utnyttet betyr brukt til noe, ikke brukt til høy verdi.',
        claims: ['P-055'],
      },
      {
        value: 'ca. 15 %',
        label: 'av produktvolumet fra restråstoff gikk til mennesker, om lag 70 000 av 476 000 tonn.',
        claims: ['P-055'],
      },
      {
        value: 'HHI ca. 929',
        label: 'i sjøbasert havbruk. De fire største har 57 prosent av tillatt biomasse. Biomasse er ikke slaktevolum.',
        claims: ['P-053'],
      },
    ],
    holds: [
      {
        text: 'Sjømat er det minst konsentrerte leddet i norsk mat, og tallene er kontrollert mot to uavhengige datakilder.',
        claims: ['P-054'],
      },
      {
        text: 'Norge har data for marint restråstoff som få land kan vise til, og god sporbarhet fra anlegg til produkt.',
        claims: [],
      },
    ],
    breaks: [
      {
        text: 'Sjømateksport kan ikke uten videre regnes som kalorier til befolkningen i en krise. Produksjonen kan være høy og samtidig avhengig av importert fôr, energi og emballasje.',
        claims: ['P-057'],
      },
    ],
    unknown: [
      {
        text: 'For oppdrettsslam finnes ingen åpen serie som kobler beregnet, innsamlet og behandlet mengde per anlegg og år.',
        claims: ['P-059'],
      },
    ],
    links: [
      { label: 'Havbruk', href: '/havbruk' },
      { label: 'Kart', href: '/kart' },
    ],
  },
  {
    id: 'foredling',
    order: 4,
    title: 'Foredling',
    tagline: 'Få anlegg, mye volum',
    chapter: 'Hvitbok v3, kap. 2.3',
    happens: {
      text: 'Meierier, slakterier, møller og annen matindustri gjør råvarer om til mat. Her samles volumet i få anlegg, og her er konsentrasjonen i norsk mat høyest.',
      claims: ['P-019'],
    },
    figures: [
      {
        value: 'HHI ca. 6 000',
        label: 'i meieriforedling (2021). Egg har 5 500–6 800 og rødt kjøtt 4 600–4 800. Over 2 500 regnes som høy konsentrasjon. Rekkefølgen er robust, punktverdiene er usikre.',
        claims: ['P-019'],
      },
      {
        value: '76,4 %',
        label: 'er TINEs andel i meieri. Nortura har 66 prosent i rødt kjøtt. En høy andel er en struktur, ikke i seg selv et misbruk.',
        claims: ['P-020', 'P-021'],
      },
    ],
    holds: [
      {
        text: 'Bøndene eier samvirkene. Samvirkene eier ikke gårdene.',
        claims: ['P-021'],
      },
      {
        text: 'Samvirkene tar imot råvare over hele landet. Få og store anlegg betyr at kapasiteten er kjent og styrbar.',
        claims: [],
      },
    ],
    breaks: [
      {
        text: 'Få anlegg betyr få punkter som kan falle bort. Strukturen som gir effektiv drift til vanlig, samler risikoen under en forstyrrelse.',
        claims: [],
      },
      {
        text: 'Ingen kilde oppgir hvor mange fagfolk et meieri, et slakteri eller en mølle kan miste før funksjonen stopper.',
        claims: ['P-023'],
      },
    ],
    unknown: [
      {
        text: 'Utfordrernes markedsandeler i flere foredlingsledd er estimater, ikke kildebelagte tall.',
        claims: ['P-019'],
      },
    ],
    links: [
      { label: 'Eierskap', href: '/eierskap' },
      { label: 'Selskaper', href: '/selskap' },
    ],
  },
  {
    id: 'logistikk',
    order: 5,
    title: 'Grossist og logistikk',
    tagline: 'Det mest digitale leddet, og det dårligst belyste',
    chapter: 'Hvitbok v3, kap. 2.4',
    happens: {
      text: 'Sentrallagre, kjøl, frys og lastebiler flytter maten fra fabrikk til butikk og kjøkken. I Norge ligger distribusjonen inne i de tre dagligvarekjedene, uten et uavhengig grossistledd av betydning.',
      claims: ['P-025'],
    },
    figures: [
      {
        value: '46,2 / 34,5 / 19,3 %',
        label: 'er andelene til ASKO/NorgesGruppen, Coop og REMA av logistikkomsetningen i 2023. HHI er 3 697.',
        claims: ['P-025'],
      },
    ],
    holds: [
      {
        text: 'Sentraliserte nettverk gir skala, kvalitet og høy leveringspresisjon i normal drift.',
        claims: [],
      },
    ],
    breaks: [
      {
        text: 'En finsk studie fant at store logistikksentre lammes nesten straks uten strøm, og at bestilling og levering i praksis ikke kan gjøres manuelt når telenettet svikter. Studien bygger på få aktører og data fra 2016–2017.',
        claims: ['P-027'],
      },
      {
        text: 'Effektivitet og eksponering er to sider av samme struktur. De mest konsentrerte og digitale leddene er de dårligst belyste.',
        claims: ['P-026'],
      },
    ],
    unknown: [
      {
        text: 'Ingen åpen, sammenlignbar serie viser kapasitet i havn, kjøl og frys, sentrallager, nødstrøm eller omkobling. Det er et tilgangsgap, ikke et bevis på at data ikke finnes.',
        claims: ['P-029'],
      },
      {
        text: 'Ingen kilde oppgir antall sentrallagre eller andelen egen og innleid transport.',
        claims: ['P-026'],
      },
      {
        text: 'Hva skjer hvis en sentral hub faller bort i 24 timer, 72 timer eller to uker? Analysen er foreslått, men ikke gjort.',
        claims: ['P-032'],
      },
    ],
    links: [
      { label: 'Forsyningskjede', href: '/forsyningskjede' },
      { label: 'Kart', href: '/kart' },
    ],
  },
  {
    id: 'butikken',
    order: 6,
    title: 'Butikken',
    tagline: 'Tre kjeder når hele landet',
    chapter: 'Hvitbok v3, kap. 2.4 og 2.5',
    happens: {
      text: 'Dagligvarebutikken er der de fleste møter matsystemet. Tre kjeder står for nesten all omsetning.',
      claims: ['P-033'],
    },
    figures: [
      {
        value: '96,6 %',
        label: 'er de tre største kjedenes andel av omsetningen i 2024. HHI er 3 327.',
        claims: ['P-033'],
      },
      {
        value: '93,4 %',
        label: 'av 3 849 kartlagte butikker tilhører de tre største. Det er en andel av butikker, ikke av omsetning.',
        claims: ['P-034'],
      },
      {
        value: '700 av 800',
        label: 'Coop-butikker i Sverige stengte etter et dataangrep i 2021. Ingen kilde viser om manuell drift var mulig.',
        claims: ['P-028'],
      },
    ],
    holds: [
      {
        text: 'Kjedene driver et landsdekkende butikknett som også når små kommuner. Få aktører kan koordineres raskt, og logistikken er kjent for myndighetene.',
        claims: [],
      },
    ],
    breaks: [
      {
        text: 'Reservebetaling finnes i Norge, Sverige og Danmark. Men i Norge hadde mange utsalgssteder ikke tatt løsningen i bruk ved en hendelse i 2022.',
        claims: ['P-028'],
      },
    ],
    unknown: [
      {
        text: 'Har små kommuner med få butikker dårligere tilgang og høyere matutgifter for familier med lav inntekt? Prosjektet har bare sekundærkilder.',
        claims: ['P-042'],
      },
      {
        text: 'En arbeidshypotese er at nasjonal konsentrasjon og lokale distriktsmonopol er samme fenomen på to skalaer. Den er ikke testet mot data.',
        claims: ['P-038'],
      },
    ],
    links: [
      { label: 'Eierskap', href: '/eierskap' },
      { label: 'Kart', href: '/kart' },
      { label: 'Sammenligning', href: '/sammenligning' },
    ],
  },
  {
    id: 'kjokkenet',
    order: 7,
    title: 'Kjøkkenet',
    tagline: 'Mat i skapet, men ikke alltid en måte å lage den på',
    chapter: 'Hvitbok v3, kap. 2.6',
    happens: {
      text: 'Til slutt blir maten måltider: hjemme, i barnehagen, på skolen og på sykehjemmet. Her avgjøres det om mat på lager faktisk blir mat på bordet.',
      claims: [],
    },
    figures: [
      {
        value: '74 % / 58 %',
        label: 'av norske husholdninger har tørrmat eller boksmat for noen dager, og 58 prosent har et kokeapparat (DSB, data fra 2025, selvrapportert).',
        claims: ['P-049'],
      },
      {
        value: '68 %',
        label: 'av svenske kommuner som svarte, har beredskapsplan for måltidene i barnehage, skole og eldreomsorg (2024). Sverige er det eneste nordiske landet som måler dette.',
        claims: ['P-046'],
      },
    ],
    holds: [
      {
        text: 'Offentlige kjøkken er en etterspørsel det offentlige eier selv. Kompetansen i store kjøkken kan flyttes, øves og måles.',
        claims: [],
      },
      {
        text: 'Det norske rådet om egenberedskap ble utvidet til én uke i mai 2024.',
        claims: ['P-050'],
      },
    ],
    breaks: [
      {
        text: 'For de mest sårbare flytter beredskapen fra husholdningen til kommunens tjenester. Der er målingen svakest, og utenfor Sverige finnes ingen nasjonal måling.',
        claims: ['P-046'],
      },
      {
        text: 'Ingen nordiske land har et gjeldende krav om mat for et bestemt antall døgn til hjemmeboende. Norge har foreslått sju dager, med høringsfrist 3. desember 2026.',
        claims: ['P-047'],
      },
    ],
    unknown: [
      {
        text: 'Kontinuitet i institusjonsmåltider under et avbrudd er ikke dokumentert i noe nordisk land.',
        claims: ['P-052'],
      },
      {
        text: 'Hvem som er avhengige av kommunens mat, og hvor lenge de klarer seg, er ikke målt. Statistikken teller omsorgsmottakere, ikke hvem som trenger mat.',
        claims: ['P-047'],
      },
    ],
    links: [
      { label: 'Politikk', href: '/politikk' },
      { label: 'Sammenligning', href: '/sammenligning' },
    ],
  },
  {
    id: 'tilbake',
    order: 8,
    title: 'Tilbake til jorda',
    tagline: 'Sløyfen som står åpen',
    chapter: 'Hvitbok v3, kap. 2.8',
    happens: {
      text: 'Matsvinn, sidestrømmer, slam og gjødsel kan bli fôr, næring og energi. Rekkefølgen er et prinsipp: først forebygge, så mat til mennesker, så fôr, så næring tilbake til jord, og energi til slutt.',
      claims: ['P-063'],
    },
    figures: [
      {
        value: '2 931 kg',
        label: 'fosfor og 24 424 kilo struvitt rapporterte Hias i 2024. Det viser et produksjonsledd, ikke mottaker eller hvilken mineralgjødsel som ble erstattet.',
        claims: ['P-062'],
      },
    ],
    holds: [
      {
        text: 'Norge har nasjonal matsvinnrapportering med bransjeavtale og årlige tall, men ikke ett samtidig totalmål for hele kjeden.',
        claims: ['P-060'],
      },
      {
        text: 'Regulering, rapportering og gode data på marint restråstoff er et godt utgangspunkt for et måleprogram.',
        claims: [],
      },
    ],
    breaks: [
      {
        text: 'Nasjonal retur av nitrogen, fosfor og kalium fra sidestrømmer er ikke målt.',
        claims: ['P-061'],
      },
      {
        text: 'Så lenge sløyfen står åpen, importerer systemet mineralsk fosfor uten å gjenvinne sitt eget. Det er en arbeidshypotese, ikke et målt regnskap.',
        claims: ['P-065'],
      },
    ],
    unknown: [
      {
        text: 'Et næringsregnskap må følge stoffet fra sidestrøm via innsamling, behandling og godkjent produkt til jord. Ingen ledd etter «innsamlet» er dokumentert nasjonalt.',
        claims: ['P-064'],
      },
    ],
    links: [{ label: 'Sirkularitet', href: '/sirkularitet' }],
  },
]

export const matreiseBreadSteps: readonly MatreiseBreadStep[] = [
  {
    title: 'Åkeren',
    known: true,
    text: 'I 2018 lå norsk hveteproduksjon 65,7 prosent under landets eget snitt for 2015–2017. Sverige, Danmark og Finland falt 43–49 prosent samme år. Et nordisk alternativ må tåle det samme sjokket. Tallene er prosjektets egne beregninger fra Eurostat.',
    claims: ['P-081'],
  },
  {
    title: 'Lageret',
    known: true,
    text: 'Ved utgangen av 2025 lå 30 000 tonn mathvete på lager. Målet er 82 500 tonn innen 2029, omtrent tre måneders forbruk.',
    claims: ['P-077', 'P-078'],
  },
  {
    title: 'Mølla',
    known: false,
    text: 'Ordningen gjelder hvete, ikke mel. Siloplass, møllemottak og melproduksjon er ulike funksjoner. Hvor mye møllekapasitet som faktisk kan disponeres, er ikke dokumentert.',
    claims: ['P-079'],
  },
  {
    title: 'Veien',
    known: false,
    text: 'Det finnes et forslag til uttaksordning fra 2023 og vanlige transportledd. Men ingen testet reserveleveranse fra silo via mølle til bakeri er dokumentert.',
    claims: ['P-079'],
  },
  {
    title: 'Bakeriet',
    known: false,
    text: 'Prosjektet har spesifisert en referansekjede: én norsk og én svensk mølle skal levere samme melkvalitet til ett bakeri i Oslo innen 72 timer. Mengdefeltene er tomme. En ekspertgruppe skal kartlegge kapasiteten i kornkjeden innen 15. mars 2027.',
    claims: ['P-082', 'P-080'],
  },
]

export const matreiseTakeaways: readonly MatreiseTakeaway[] = [
  {
    title: 'Sjokk utenfra lander på gården',
    text: 'Bytteforholdet mellom kostnader og inntekter i jordbruket var 4–7 prosent svakere hvert år fra 2017 til 2023 enn i 2024. Bunnåret kom i 2023.',
    claims: ['P-011', 'P-013'],
  },
  {
    title: 'Lagret råvare er ikke leverbar mat',
    text: 'Korn på lager hjelper først når det kan males, kjøres og bakes. Ingen testet reserveleveranse fra silo via mølle til bakeri er dokumentert.',
    claims: ['P-079'],
  },
  {
    title: 'Det ingen teller, kan ingen styre etter',
    text: 'Prosjektet har ikke funnet åpne, sammenlignbare serier for terskler for personell, kapasitet i knutepunkter, næringsretur eller måltidsberedskap. De mest konsentrerte og digitale leddene er de dårligst belyste.',
    claims: ['P-128', 'P-026'],
  },
]
