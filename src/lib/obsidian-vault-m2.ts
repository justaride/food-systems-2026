import { join } from 'node:path'

export type M2DraftSection = {
  relPath: string
  heading: string
  body: string[]
}

type M2InsightDraftInput = {
  fileName: string
  sourcePath: string
  draft: string[]
  evidence: string[]
  approvalAsk: string
}

type M2ActorDraftInput = {
  fileName: string
  draft: string
  sourcePath: string
}

const INSIGHT_HEADING = '## M2 selvbærende utkast (krever godkjenning)'
const INSIGHT_EVIDENCE_HEADING = '## Tallgrunnlag og forbehold'
const ACTOR_HEADING = '## Posisjon i systemet (utkast, krever godkjenning)'
const APPROVAL_LINE =
  'Krever menneskelig godkjenning: Codex-utkast for intern review; claim-lock og siterbarhet må godkjennes før ekstern bruk.'
const AP1_SOURCE = 'docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md'
const AP5_SOURCE = 'docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md'
const FOCUS_SOURCE = 'content/hvitbok/03-fokusomraader.md'
const POWER_SYNTHESIS_SOURCE = 'docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md'
const OBJECTIVE_SOURCE = 'docs/project/analysis/food-tg-objektivfunksjon-VEDTAK-2026-06-18.md'

const INSIGHT_DRAFTS: M2InsightDraftInput[] = [
  {
    fileName: 'I27 Styreoverlappet peker på smale broer.md',
    sourcePath: AP1_SOURCE,
    draft: [
      'AP-1-kjøringen dekker 555 styreverv fordelt på 487 personer i 98 av 275 selskaper med styredata. Innenfor dette dekningsbildet peker 32 interlockere ut, og 11 tverrsektorielle broer binder sammen minst to verdikjedesteg.',
      'Det viktigste signalet er ikke personintensjon, men hvor sårbar og konsentrert informasjonsflyten kan bli når smale broer forbinder logistikk, foredling og retail. De tydeligste sektorparene i AP-1 er logistikk-retail med 7 broer, foredling-retail med 6 og logistikk-foredling med 2.',
      'Bruksspråk: strukturell posisjon og kontrollflate. Ikke bruk dette som påstand om samordning, ulovlighet eller faktisk påvirkning uten ny claim-lock.',
    ],
    evidence: [
      '555 styreverv, 487 personer og styredata for 98 av 275 selskaper.',
      '32 interlockere totalt, hvorav 11 tverrsektorielle broer.',
      'Forbehold: AP-1 viser strukturell posisjon i styregrafen, ikke intensjon, samordning eller ulovlighet.',
    ],
    approvalAsk:
      'Godkjenn om AP-1-tallene kan brukes som selvbærende forklaring i I27, eller om teksten skal kortes ned til ren metodeforklaring.',
  },
  {
    fileName: 'I31 Krysseie må leses som kontrollbaner.md',
    sourcePath: AP5_SOURCE,
    draft: [
      'AP-5 beskriver 275 selskaper med 160 eierkanter, hvor 153 er kontrollkanter. Eierskapsgrafen dekker 183 av 275 selskaper, tilsvarende 67 % av universet, identifiserer 57 kontrollører og 27 ultimate kontrollører, og markerer 19 tverrsektorielle kontrollører.',
      'Krysseierskapet blir mest nyttig når det leses sammen med AP-1: begge kartlagene peker på de samme sektorparene, med logistikk-retail på 7/7, foredling-retail på 6/6 og logistikk-foredling på 2/6 i AP-1/AP-5-sammenstillingen.',
      'NorgesGruppen er største flerleddsaktør i AP-5 med 39 selskaper på tvers av 4 verdikjedesteg. Bruksspråk: kontrollbaner, eierstruktur og mulig portvokterposisjon. Ikke les kontroll som operasjonell styring uten selskapsspesifikk dokumentasjon.',
    ],
    evidence: [
      '183 av 275 selskaper ligger i eierskapsgrafen, oppgitt som 67 % dekning.',
      '19 tverrsektorielle kontrollører er markert i AP-5.',
      'NorgesGruppen kontrollerer 39 selskaper på tvers av 4 verdikjedesteg i AP-5.',
      'Forbehold: kontrollkanter er selskapsstruktur, ikke bevis for operasjonell styring.',
    ],
    approvalAsk:
      'Godkjenn om AP-5-sammenstillingen kan stå som forklaring i I31, eller om den skal parkeres til manuell datareview.',
  },
  {
    fileName: 'I34 Fem fokusområder gjør kartet handlingsrettet.md',
    sourcePath: FOCUS_SOURCE,
    draft: [
      'Fokuskapittelet prioriterer fem arbeidsfelt: Importert fôr og alternative proteiner, Matsvinnsmåling fra volum til kvalitet, Strukturell konkurranseterskel, biogass etter dansk 20-årig feed-in-modell og skifte i økologinarrativ.',
      'De tre første scorer 11/12 i prioriteringsmatrisen, mens biogass og økologinarrativ scorer 10/12. Dermed fungerer fokuslisten som en portefølje: noen spor er klare for tallfestet makt-/systemkart, andre må holdes som politikkutforming eller narrativtesting.',
      'Bruksspråk: intern prioritering og hypotesekø. Ikke presenter score som ekstern sannhet uten å vise metode og usikkerhet.',
    ],
    evidence: [
      'Importert fôr, Matsvinn og Strukturell konkurranse er alle prioritert til 11/12.',
      'Biogass og økologinarrativ er prioritert til 10/12.',
      'Forbehold: score er intern prioritering, ikke ekstern validering av effekt.',
    ],
    approvalAsk: 'Godkjenn om I34 skal bruke 11/12- og 10/12-score direkte, eller om score skal flyttes til metode-/notatfelt.',
  },
  {
    fileName: 'I36 Næringsgjenvinning er et prioritert gap.md',
    sourcePath: FOCUS_SOURCE,
    draft: [
      'Fokuskapittelet peker på næringsgjenvinning som et konkret kunnskapsgap: norsk akvakultur slipper ut omtrent 66 000 tonn nitrogen og 14 000 tonn fosfor per år, mens bare omtrent to prosent av ekskret materiale samles som slam.',
      'Samtidig er dokumenterte gjenvinningsvolumer små eller ufullstendige: RecoLab rapporterte under 1,5 tonn gjenvunnet produkt i 2024, og norsk biorest i 2022 var omtrent 218 000 tonn avvannet og 370 000 tonn flytende, hvor 84 prosent ble spredt på jordbruksareal uten at næringsinnholdet er tallfestet i samme kildebilde.',
      'Bruksspråk: prioritert datagap og mulig systemtap. Ikke bruk tallene som full nasjonal materialbalanse før primærkildene er låst.',
    ],
    evidence: [
      'Akvakultursporet oppgir omtrent 66 000 tonn nitrogen og 14 000 tonn fosfor per år.',
      'Bare omtrent to prosent av ekskret materiale samles som slam.',
      'Bioresttallene inkluderer omtrent 218 000 tonn avvannet materiale i 2022.',
      'Forbehold: dette er et prioritert datagap, ikke en komplett nasjonal materialbalanse.',
    ],
    approvalAsk: 'Godkjenn om næringsgjenvinning skal beholdes som prioritert gap i I36, eller om tallene skal deles opp i egne gap-noter.',
  },
  {
    fileName: 'I37 Maktkartet må leses gjennom fire linser.md',
    sourcePath: POWER_SYNTHESIS_SOURCE,
    draft: [
      'Maktkartsyntesen sier at kartet må leses gjennom fire linser: AP-3 subsidier, AP-1 styreoverlapp, AP-2 eierskap/HHI og AP-5 selskapskontroll. Linsene svarer på ulike spørsmål og har ulik dekning.',
      'Dekningsbildet er selve poenget: AP-3 viser fordelingskonsentrasjon med Gini rundt 0,52, AP-1 dekker 98 av 275 selskaper, AP-2 har eierdata for 66 av 275, og AP-5 har eierskapsgraf for 183 av 275.',
      'Bruksspråk: fire analysebriller med eksplisitte hull. Ikke la ett lag bære en totalpåstand om matsystemmakt alene.',
    ],
    evidence: [
      'AP-3, AP-1, AP-2 og AP-5 beskriver ulike kartlag og må ikke slås sammen til én totalpåstand.',
      'AP-5 dekker 183 av 275 selskaper i eierskapsgrafen.',
      'Forbehold: hvert AP-lag har egen metode, dekning og usikkerhet.',
    ],
    approvalAsk: 'Godkjenn om I37 skal fungere som leseguide for maktkartet, eller om hver AP-linse skal ha egen beslutningsport.',
  },
  {
    fileName: 'I38 Objective-function skiller beslutning fra publisering.md',
    sourcePath: OBJECTIVE_SOURCE,
    draft: [
      'Objective-function-vedtaket setter Sett II som intern styringsretning: Resiliens/forsyningssikkerhet er primærfunksjon, Sirkularitet/ressurseffektivitet er sekundærfunksjon, og Bondeøkonomi/distrikt er åpnet som blind spot.',
      'Det gjør I38 til en beslutningsnote mer enn en publiseringspåstand. Teksten bør vise hvordan retningen styrer kartarbeid og prioritering, samtidig som helse og true-cost holdes til fase 2.',
      'Bruksspråk: intern beslutningslogikk. Ikke skriv det som ekstern konklusjon om hva matsystemet objektivt bør optimalisere for.',
    ],
    evidence: [
      'Sett II er valgt som intern styringsretning.',
      'Resiliens/forsyningssikkerhet er primærfunksjon.',
      'Sirkularitet/ressurseffektivitet er sekundærfunksjon.',
      'Bondeøkonomi/distrikt er åpnet som blind spot.',
      'Forbehold: dette er intern beslutningslogikk, ikke ekstern normativ konklusjon.',
    ],
    approvalAsk: 'Godkjenn om I38 kan bære Set II som styringsramme i vaulten, eller om det skal lenkes kun som intern beslutningskilde.',
  },
]

const ACTOR_DRAFTS: M2ActorDraftInput[] = [
  {
    fileName: 'NorgesGruppen ASA.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: NorgesGruppen er den tydeligste flerleddsaktøren i AP-5-materialet, med kontroll over 39 selskaper på tvers av 4 verdikjedesteg. I M2 bør noten beskrive konsernet som et strukturelt knutepunkt for retail, distribusjon og relaterte service-/datafunksjoner, uten å gjøre kontroll til bevis for faktisk samordning.',
  },
  {
    fileName: 'ASKO Norge AS.md',
    sourcePath: AP1_SOURCE,
    draft:
      'Posisjonstekst: ASKO Norge bør leses som NorgesGruppens logistikk- og distribusjonsanker i kartet. Noten bør forklare rollen som bro mellom innkjøp, grossistflyt og butikkledd, og merke at AP-1/AP-5-signalene handler om posisjon i strukturen, ikke dokumentert beslutningsatferd.',
  },
  {
    fileName: 'ASKO Midt-Norge AS.md',
    sourcePath: AP1_SOURCE,
    draft:
      'Posisjonstekst: ASKO Midt-Norge er en regional distribusjonsnode i samme grossistlag som ASKO Norge. I M2 bør den forklares som en geografisk forlengelse av logistikkflaten, nyttig for å se hvor nasjonale konsernstrukturer møter regionale forsyningslinjer.',
  },
  {
    fileName: 'BAMA Gruppen AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: BAMA Gruppen ligger i skjæringspunktet mellom frukt/grønt, import, distribusjon og retailnær kobling. M2-teksten bør gjøre den til en nøkkelaktør for ferskvareflyt og portvokterspørsmål, men holde påstandene innenfor eier-/strukturkartet.',
  },
  {
    fileName: 'Coop Norge SA.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Coop Norge er et medlems- og samvirkebasert retailanker som AP-5 leser på tvers av flere verdikjedesteg. Noten bør vektlegge den alternative eierformen sammenlignet med aksjeselskapskonsern, samtidig som strukturell kontroll og operasjonell praksis holdes adskilt.',
  },
  {
    fileName: 'Felleskjøpet Agri SA.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Felleskjøpet Agri er et samvirkebasert innstrømsanker for landbruk, med rolle i innsatsfaktorer, korn/fôr og produsentnære tjenester. I M2 bør noten bruke selskapet som bro mellom bondeøkonomi, importert fôr og sirkularitets-/robusthetsspørsmål.',
  },
  {
    fileName: 'Nortura SA.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Nortura er et samvirkebasert foredlingsanker for kjøtt og egg og bør beskrives som en nøkkelnode mellom produsentledd, industriell foredling og markedstilgang. Teksten må skille samvirkestruktur fra påstander om markedsatferd.',
  },
  {
    fileName: 'TINE SA.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: TINE er et samvirkebasert meierianker og en sentral foredlingsnode i kartet. I M2 bør noten forklare hvordan meieristrukturen berører både produsentøkonomi, industriell kapasitet og konkurransespørsmål, uten å overføre AP-5-konklusjoner til udokumenterte driftspåstander.',
  },
  {
    fileName: 'Orkla ASA.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Orkla bør leses som et bredt foredlings- og merkevareanker i kartet. M2-teksten bør plassere selskapet i bearbeidings-/produktlaget og bruke det som kontrast til samvirke- og retailintegrerte strukturer.',
  },
  {
    fileName: 'Mowi ASA.md',
    sourcePath: FOCUS_SOURCE,
    draft:
      'Posisjonstekst: Mowi er et globalt havbruksanker i kartet og relevant for sporene om fôr, næringsstofftap og robusthet. M2-teksten bør koble selskapet til akvakulturens materialstrømmer og ikke gjøre selskapsspesifikke miljøpåstander uten separat kildebelegg.',
  },
  {
    fileName: 'Lerøy Seafood Group ASA.md',
    sourcePath: FOCUS_SOURCE,
    draft:
      'Posisjonstekst: Lerøy Seafood Group er en sentral sjømataktør som bør brukes til å lese havbruk og sjømatforedling som egne systemlag. I M2 bør teksten kobles til fôr-/næringsgjenvinningssporet og skilles fra generelle retail- eller landbrukspåstander.',
  },
  {
    fileName: 'Austevoll Seafood ASA.md',
    sourcePath: FOCUS_SOURCE,
    draft:
      'Posisjonstekst: Austevoll Seafood er en sjømat- og havbruksrelatert eiernode som er relevant for å forstå hvordan marine verdikjeder kobles til kontroll- og ressursflyt. M2-teksten bør holde den som strukturell aktør, ikke som ferdig case om sirkularitet.',
  },
  {
    fileName: 'SalMar ASA.md',
    sourcePath: FOCUS_SOURCE,
    draft:
      'Posisjonstekst: SalMar er et havbruksanker som gjør akvakultursporet konkret i maktkartet. M2-teksten bør plassere selskapet i produksjons-/ressurslaget og peke på behov for primærkilder før tall om slam, utslipp eller fôr knyttes direkte til selskapet.',
  },
  {
    fileName: 'REMA 1000 Norge AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: REMA 1000 Norge er retailflaten i Reitan-systemet og bør beskrives som butikkleddets synlige kontaktpunkt. I M2 bør noten skille kjededrift fra konsernkontroll, og bruke relasjonen til distribusjon og convenience som strukturspørsmål.',
  },
  {
    fileName: 'REMA Distribusjon Norge AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: REMA Distribusjon Norge er distribusjonslaget som gjør Reitan-systemets retailposisjon logistisk konkret. Noten bør forklare hvorfor logistikk-retail er et viktig sektorpar i AP-1/AP-5, uten å hevde samordning utover dokumentert selskapsstruktur.',
  },
  {
    fileName: 'Reitan AS (912609987).md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Reitan AS bør leses som eier-/kontrollnode bak flere Reitan-flater. I M2 bør teksten gjøre rollen som ultimate eller overordnet kontrollpunkt eksplisitt der kildegrunnlaget støtter det, og la detaljert operasjonell beskrivelse ligge i undernotene.',
  },
  {
    fileName: 'Reitan Retail AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Reitan Retail er konsernflaten som binder retail- og convenienceaktivitetene sammen i kartet. M2-teksten bør plassere selskapet som mellomledd mellom eiernode og operasjonelle kjeder.',
  },
  {
    fileName: 'Reitan Convenience AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Reitan Convenience gjør kiosker, servicehandel og hurtigmatnære flater synlige som eget distribusjons-/retailspor. I M2 bør noten brukes til å nyansere dagligvarekartet utover supermarkedskjedene.',
  },
  {
    fileName: 'Kiwi Norge AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Kiwi Norge er en profilert butikkjede innen NorgesGruppen-systemet. M2-teksten bør gjøre den til et eksempel på hvordan retailflaten materialiserer konsernets bredere kontroll- og logistikkstruktur.',
  },
  {
    fileName: 'MENY AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: MENY er en annen retailflate i NorgesGruppen-systemet og bør brukes til å vise segmentbredden i butikkporteføljen. Teksten bør ikke blande kjedeprofil med konsernkonklusjoner uten egen dokumentasjon.',
  },
  {
    fileName: 'Kjopmannshuset Norge AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Kjøpmannshuset Norge bør forklares som et kjede-/butikkorganiserende lag i NorgesGruppen-strukturen. M2-teksten bør plassere selskapet mellom konsern, profiler og lokale butikkflater.',
  },
  {
    fileName: 'NorgesGruppen Detalj AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: NorgesGruppen Detalj bør beskrives som en detaljhandelsnode i konsernstrukturen. Den er nyttig for å skille butikkrettede funksjoner fra grossist-, data- og servicefunksjoner i samme eierunivers.',
  },
  {
    fileName: 'NorgesGruppen Servicehandel AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: NorgesGruppen Servicehandel gjør servicehandel til et eget spor ved siden av klassisk dagligvare. M2-teksten bør vise hvordan denne flaten utvider retailbegrepet i maktkartet.',
  },
  {
    fileName: 'NorgesGruppen Data AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: NorgesGruppen Data bør forklares som intern system-/datafunksjon i konsernkartet. M2-teksten bør merke den som støtteinfrastruktur, ikke som selvstendig belegg for datamakt uten videre kildegrunnlag.',
  },
  {
    fileName: 'NorgesGruppen Regnskap AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: NorgesGruppen Regnskap bør beskrives som støttefunksjon som viser hvordan konsernkartet også rommer administrative kontrollflater. Den bør ikke gis samme maktrolle som butikk-, grossist- eller eierledd.',
  },
  {
    fileName: 'Bakehuset AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Bakehuset viser hvordan foredlings-/produksjonsledd kan ligge tett på retailstrukturen. I M2 bør noten brukes som eksempel på kobling mellom produktkategori, industriell produksjon og konserntilknytning.',
  },
  {
    fileName: 'Unil AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Unil er relevant som innkjøps-/produkt- og merkevareflate i NorgesGruppen-systemet. M2-teksten bør bruke selskapet til å vise hvordan produktstyring og retail kan kobles i samme konsernstruktur.',
  },
  {
    fileName: 'Joh. Johannson Kaffe AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Joh. Johannson Kaffe er en kategorispesifikk foredlings-/varestrømsnode i NorgesGruppen-universet. I M2 bør noten brukes til å vise at konsernkartet ikke bare handler om butikker, men også enkelte produktkategorier.',
  },
  {
    fileName: 'Deli de Luca Norge AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Deli de Luca Norge er en convenience-/serveringsnær retailflate. M2-teksten bør plassere den i randsonen mellom dagligvare, servicehandel og måltidsmarked.',
  },
  {
    fileName: 'Storcash Norge AS.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Storcash Norge er relevant som cash-and-carry-/grossistflate. I M2 bør noten forklare hvordan profesjonelle innkjøpskanaler supplerer butikkrettet retail i kartet.',
  },
  {
    fileName: 'Dagrofa A-S.md',
    sourcePath: AP5_SOURCE,
    draft:
      'Posisjonstekst: Dagrofa A-S er en dansk aktør som gjør Norden-laget synlig i selskapskartet. M2-teksten bør merke at den norske maktanalysen ikke uten videre kan overføres til dansk struktur uten egne kilder.',
  },
]

export function buildM2DraftSections(): M2DraftSection[] {
  return [
    ...INSIGHT_DRAFTS.flatMap((draft) => [
      {
        relPath: join('10 Innsiktskart', 'Innsikter', draft.fileName),
        heading: INSIGHT_HEADING,
        body: [
          APPROVAL_LINE,
          '',
          ...draft.draft,
          '',
          `Kilde: \`${draft.sourcePath}\``,
          `Review-ask: ${draft.approvalAsk}`,
        ],
      },
      {
        relPath: join('10 Innsiktskart', 'Innsikter', draft.fileName),
        heading: INSIGHT_EVIDENCE_HEADING,
        body: [APPROVAL_LINE, '', ...draft.evidence.map((line) => `- ${line}`), '', `Kilde: \`${draft.sourcePath}\``],
      },
    ]),
    ...ACTOR_DRAFTS.map((draft) => ({
      relPath: join('11 Maktkart', 'Selskaper', draft.fileName),
      heading: ACTOR_HEADING,
      body: [
        APPROVAL_LINE,
        '',
        draft.draft,
        '',
        `Kilde: \`${draft.sourcePath}\``,
        'Review-ask: Godkjenn, juster eller dropp posisjonsteksten før den brukes som kuratert selskapsbeskrivelse.',
      ],
    })),
  ]
}
