import type { TenStep } from '../types'

// Ten-Step Methodology v2.1
// NCH-canonical baseline: JT presentation BCH Tallinn 2026-05-06
// (research/external/nch-methodology/jt-tg-methodology-bch-tallin-2026-05-06.md)
// Food-TG overlay: Cathrines v2.0 enrichment 2026-04
// (research/cathrine-ten-step-oppsummering.md)
export const tenSteps: TenStep[] = [
  {
    step: 1,
    theme: 'Mandat, North Star, suksesskriterium',
    output: 'TG Charter (1 side)',
    status: 'fullfort',
    methodology: 'PRINCE2/PMI project charter governance + RACI responsibility mapping',
    description: 'Etabler en tydelig en-sides charter som definerer hvorfor TG-en finnes, hva den skal oppnå, og hvordan suksess måles. I praksis: charter dekker formål, mål, scope/non-scope, KPIer og roller. Food-TG-overlay: tidleg filtrering gjennom sirkulær strategi - 10R (Wageningen), ISO 59000-serien, ESRS 1-5/Taxonomien og NCH sektor/system-dimensjonen.',
  },
  {
    step: 2,
    theme: 'Problemframing og avgrensing',
    output: 'Nordisk case for change',
    status: 'fullfort',
    methodology: 'Design Thinking / Double Diamond (Define) + Theory of Change',
    description: 'Skarp problemdefinisjon + "why Nordic, why now"-rasjonale + prioriterte transition-hypoteser. Food-TG-overlay: tydeliggjer "den nordiske faktøren" (kvar oppstaar avfall, ressurstap, ineffektivitet) + PESTEL-analyse per land.',
  },
  {
    step: 3,
    theme: 'Stakeholder og commitment mapping',
    output: 'Prioritert aktørkart med "ask"',
    status: 'fullfort',
    methodology: 'Bryson stakeholder analysis + Kotter (guiding coalition)',
    description: 'Identifiser hvilke aktører som må være med for at gruppen skal levere reell impact, og presiser hva vi ber kvar enkelt om. Bygg prioritert aktørkart med spesifikk "ask" per aktør. Oppdater iterativt. Food-TG-overlay: intervjuguide med kjerne + moduler (Food/City).',
  },
  {
    step: 4,
    theme: 'Mobilisering og kommunikasjon',
    output: 'Invitasjonsplan + commitment light',
    status: 'fullfort',
    methodology: 'Kotter (communicate-and-mobilise) + strategisk kommunikasjon (FirstHouse) + Nordic Innovation Playbooks',
    description: 'Inviter rett aktør med lavterskel-tilbud som gjør deltakelse enkel og attraktiv. "Commitment light"-pakke: typisk ett møte, en side, to kontakter, én konkret action. Flytt fra "inviter mange" til "inviter rett". Food-TG-overlay: nordisk fagøkt (60-75 min) for felles situasjonsforståelse.',
  },
  {
    step: 5,
    theme: 'Operating model for TG',
    output: 'Møterytme, sprintplan, beslutningslogg',
    status: 'fullfort',
    methodology: 'Agile/Scrum cadence + lightweight OKR + RACI + beslutningslogg',
    description: 'Definer rytme, roller og arbeidsartefakter som holder gruppen produktiv over tid: møterytme, sprintplan, beslutningslogg, dokumentstruktur og korte retros. Få, klare mål via lightweight OKR. Fasilitering som gjennomgående kapabilitet, ikkje eit eige steg. Food-TG-overlay: Gate A (veke 2) - scope + koalisjonskvalitet (Go/Iterate/Pause).',
  },
  {
    step: 6,
    theme: 'Innsikt, baseline og transition-levers',
    output: 'Innsiktsnotat, systemkart, flaskehalser',
    status: 'fullfort',
    methodology: 'Systems thinking + Results-Based Management baselines + OECD evidence practice + Strategyzer Business Model Environment + MFA/LCA + Eurostat sirkulærmonitor + ISO 59020',
    description: 'Bygg felles forståelse av nå-tilstanden og velg hvilke levers gruppen faktisk skal trekke i. As-is innsiktsnotat, systemkart og flaskehalsanalyse. Velg transition-levers på tvers av policy, procurement, standarder, finans, data og sporing, infrastruktur og kompetanse. Food-TG-overlay: Strategyzer BME-omgivelseskartlegging (Market Forces, Key Trends, Industry Forces, Macro-Economic) + fem sirkulære sloyfer (forebygge, redistribuere, sidestrommer, naeringsstoffer, emballasje/logistikk) + Eurostat sirkulærmonitor-indikatorer.',
  },
  {
    step: 7,
    theme: 'Co-design og pilotportefolje',
    output: '2-5 pilotforslag + requirements/standards track + owner map',
    status: 'pagar',
    methodology: 'Design Thinking (Develop) + Lean Startup (MVP/pilot) + portfolio thinking + Ellen MacArthur/IDEO Circular Design Guide + Cambridge CE',
    description: 'Oversett innsikt til handling ved å co-designe en fokusert pilotportefolje med tydelig eierskap. Krav: tydelig problemtrykk, målbar effekt innan 90 dagar, delbar metode, gjenbrukbar data, partnarskap på tvers. Food-TG-overlay runde 4 (apr 2026): foreløpig scope = Spor A+B med C som tverrgående adoption-/regelverks-/datagate. 10-dagers valideringssprint mot P1-aktører (Landbruksdir, Miljodir, SSB/Tolletaten, Denofa, Skretting, NMBU, Mattilsynet, Matvett, Too Good To Go) før pilotcommitment. Statusdisiplin: internt-trygt / needs-primary-check / needs-actor-validation / benchmark / hypotese. Prioriteringsfilter: Effekt, Gjennomforbarheit, Reproduserbarheit, Datatilgang, Eier.',
  },
  {
    step: 8,
    theme: 'White paper som motor',
    output: 'White paper + executive brief + anbefalte levers',
    status: 'ikke-startet',
    methodology: 'McKinsey-style structured problem-solution + Theory of Change + evidence-based policy brief',
    description: 'Bruk en siterbar white paper til å drive policy-, marked- og standard-narrativet videre. Produser citable white paper, en-sides executive brief og et sett anbefalte levers. White paper skal være motor for pilot/policy/finans - ikke bare sluttprodukt. Koble eksplisitt til procurement-, standard- og finance-tracks.',
  },
  {
    step: 9,
    theme: 'Gate-evaluering og konsolidering',
    output: 'Laeringsnotat + dokumentert beslutning',
    status: 'ikke-startet',
    methodology: 'OECD DAC criteria (relevans, effektivitet, impact) + After Action Review + Stage-gate + mini-retro + Transition Factor test',
    description: 'Stopp opp for å evaluere fremdrift, fange læring og bestemme om vi skal fortsette, justere eller stoppe (Go/Iterate/Pause). Produser læringsnotat og dokumentert beslutning på neste fase, partnere og prioriterte spor. Food-TG-overlay: Gate B (uke 8) - Transition Factor = Owner + Pilot + Adoption + Finance i ett sammenhengende roadmap. Start/Stop/Continue i hvert møte.',
  },
  {
    step: 10,
    theme: 'Implementerbar Roadmap 1-3 år',
    output: 'Roadmap med tiltak, eiere, milepaler + standardisation/adoption-plan',
    status: 'ikke-startet',
    methodology: 'Roadmapping + PRINCE2 benefits management + ISO 31000 risk management + risk/finans/KPI-integrasjon',
    description: 'Konverter arbeidet til en handlingsrettet roadmap med finansiering og en adoption-pathway på tvers av Norden. Roadmap dekker tiltak, eiere, milepaler, ressurser/finansiering, risiko, KPIer og standardiserings- og adopsjonsplan. Food-TG-overlay: Minimum Viable Transition - Ownership, Implementation, Institutional og Resourcing Outcome.',
  },
]
