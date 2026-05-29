import type { FoodTgControlStatus } from './food-tg-control-layer'

export type WageningenCascadeStep = {
  rank: number
  level: string
  foodUse: string
  gate: string
}

export type WageningenRedGate = {
  title: string
  state: 'apen' | 'klar-med-forbehold'
  closureEvidence: string
}

export type WageningenClaimDelta = {
  claimId: 'CL-B-008' | 'CL-B-009' | 'CL-B-021' | 'CL-B-022' | 'CL-B-023' | 'CL-C-015'
  label: string
  effect: string
  decision: string
}

export type WageningenValidationAsk = {
  candidate: 'Alle' | 'B1' | 'B2' | 'B3' | 'A/B'
  ask: string
  evidenceRequired: string
}

export type WageningenDocumentLink = {
  label: string
  path: string
}

export type FoodTgWageningenMethod = {
  title: string
  status: FoodTgControlStatus
  decision: string
  summary: string
  boundary: string
  source: {
    id: 'SRC-B-035'
    label: string
    locatorStatus: string
    doi: string
  }
  cascade: WageningenCascadeStep[]
  redGates: WageningenRedGate[]
  claimDeltas: WageningenClaimDelta[]
  validationAsks: WageningenValidationAsk[]
  safeLanguage: string[]
  blockedLanguage: string[]
  documents: WageningenDocumentLink[]
}

export const foodTgWageningenMethod: FoodTgWageningenMethod = {
  title: 'Wageningen som metodegrunnlag',
  status: 'klar-med-forbehold',
  decision: 'Adopt internt, adapt for nordisk bruk, hold eksternt med caveat',
  summary:
    'Wageningen/Elbersen 2022 og Moerman-kaskaden brukes som Food TGs interne pre-screen for sidestrømmer, matsvinnkvalitet, nutrient-loop benchmarks og substrat-gatet insektprotein.',
  boundary:
    'Dette er ikke ekstern validering, ikke pilotbevis og ikke KPI-effekt. Metoden styrer hvilke porter som må lukkes før claims, deck, rapport eller whitepaper får sterkere språk.',
  source: {
    id: 'SRC-B-035',
    label: 'Elbersen et al. 2022, Wageningen Food & Biobased Research Report 2247',
    locatorStatus: 'source-candidate-present; eksakte side-, tabell- og figurlocatorer er fortsatt porter',
    doi: 'https://doi.org/10.18174/563389',
  },
  cascade: [
    {
      rank: 1,
      level: 'Forebygging',
      foodUse: 'Unngå overskudd, overproduksjon og kvalitetstap før avfall oppstår.',
      gate: 'Baseline, kategori, tidsvindu og kontrafaktisk.',
    },
    {
      rank: 2,
      level: 'Menneskemat',
      foodUse: 'Hold spiselig mat i human konsum eller redistribusjon.',
      gate: 'Spiselighet, kvalitet, mottaker, tidsvindu og mattrygghet.',
    },
    {
      rank: 3,
      level: 'Ingrediens og upcycling',
      foodUse: 'Løft rene sidestrømmer til ny mat- eller ingrediensverdi.',
      gate: 'Råvareeier, hygiene, stabilisering, lovlig sluttbruk og kjøper.',
    },
    {
      rank: 4,
      level: 'Fôr',
      foodUse: 'Bruk trygg biomasse som dyre- eller fiskefôr når human mat ikke er realistisk.',
      gate: 'Substratgate, ABP/TSE, fôrregler, modenhet og kjøperkrav.',
    },
    {
      rank: 5,
      level: 'Industriell bioressurs',
      foodUse: 'Bruk biologiske strømmer i materialer, fermentering, kjemi eller annen industriell verdi.',
      gate: 'Produktstatus, marked, teknologi, systemgrense og off-taker.',
    },
    {
      rank: 6,
      level: 'Næringsstoff og jord',
      foodUse: 'Bruk N/P/K, kompost, biorest eller struvitt når høyere bruk ikke er realistisk.',
      gate: 'N/P/K, kontaminanter, produktstatus, regelverk og marked.',
    },
    {
      rank: 7,
      level: 'Energi',
      foodUse: 'Biogass eller forbrenning der høyere verdi er umulig eller udokumentert.',
      gate: 'Forklar hvorfor mat, fôr, ingrediens, industri eller næringsstoff ikke er mulig.',
    },
    {
      rank: 8,
      level: 'Lekkasje og deponi',
      foodUse: 'Tap av verdi uten dokumentert ressursbruk.',
      gate: 'Behandles som gap, ikke som sirkulær suksess.',
    },
  ],
  redGates: [
    {
      title: 'Kildelocator',
      state: 'apen',
      closureEvidence: 'Side, tabell eller figur for SRC-B-035 og Food claim-ID.',
    },
    {
      title: 'Mattrygghet',
      state: 'apen',
      closureEvidence: 'Mattilsynet, fagekspert eller kildebasert risikovurdering.',
    },
    {
      title: 'Lovlig sluttbruk',
      state: 'apen',
      closureEvidence: 'Regelverkskilde, dato og avklart sluttprodukt.',
    },
    {
      title: 'LCA og systemgrense',
      state: 'apen',
      closureEvidence: 'Funksjonell enhet, substitusjon, geografi og avgrensning.',
    },
    {
      title: 'Off-taker',
      state: 'apen',
      closureEvidence: 'Navngitt kjøper, bruker eller eksplisitt no-off-taker-status.',
    },
    {
      title: 'Logistikk og stabilisering',
      state: 'apen',
      closureEvidence: 'Lagring, holdbarhet, transport og prosesseier.',
    },
    {
      title: 'Dataeier',
      state: 'apen',
      closureEvidence: 'Navngitt dataeier, frekvens og oppdateringsvei.',
    },
    {
      title: 'Claim-lock',
      state: 'klar-med-forbehold',
      closureEvidence: 'Claim-ID og status: intern, caveated external eller hold tilbake.',
    },
  ],
  claimDeltas: [
    {
      claimId: 'CL-B-008',
      label: 'Kaskade og høyverdig bruk',
      effect: 'Styrkes, men rangering må være fraksjons- og systemgrensespesifikk.',
      decision: 'Behold klar-med-forbehold og legg komponent-/systemgrensecaveat til bruken.',
    },
    {
      claimId: 'CL-B-009',
      label: 'Designkrav for sidestrømmer',
      effect: 'Styrker rød-port-logikken for råvarekvalitet, hygiene, sluttbruk og off-taker.',
      decision: 'Bruk som designgate og krev WUR-score før kandidat løftes.',
    },
    {
      claimId: 'CL-B-021',
      label: 'Første prosess-sidestrømspilot',
      effect: 'Holder okara, bryggerimask og marint restråstoff som kandidater eller benchmarks.',
      decision: 'Behold krever-bekreftelse; ingen pilotstatus uten råvareeier, lovlig bruk og kjøper.',
    },
    {
      claimId: 'CL-B-022',
      label: 'Matsvinnkvalitet',
      effect: 'Løfter kvalitet, tidsvindu og destinasjon som operative valideringsspørsmål.',
      decision: 'Krev baseline, kategori, tidsvindu, destinasjon og kontrafaktisk.',
    },
    {
      claimId: 'CL-B-023',
      label: 'Nutrient loops',
      effect: 'Styrker benchmarkrollen, men gjør tung infrastruktur til sekundærspor.',
      decision: 'Ikke promoter uten produktstatus, marked, massebalanse, regelverk og systemgrenser.',
    },
    {
      claimId: 'CL-C-015',
      label: 'KPI og datastandard',
      effect: 'Styrker krav til definisjon, år, geografi, enhet, kilde, dataeier og frekvens.',
      decision: 'WUR-score er intern prioritering, ikke KPI-effekt eller måloppnåelse.',
    },
  ],
  validationAsks: [
    {
      candidate: 'Alle',
      ask: 'Er SRC-B-035 riktig Wageningen-anker for metode, tabell og scorecard?',
      evidenceRequired: 'Side, tabell eller figur og tilknyttede claim-IDer.',
    },
    {
      candidate: 'B1',
      ask: 'Hva er volum, fukt, nåværende destinasjon, stabiliseringsbehov og mat-/fôrstatus for okara eller BSG?',
      evidenceRequired: 'Aktørdata eller kildebasert notat.',
    },
    {
      candidate: 'B1',
      ask: 'Hvem kan kjøpe eller bruke en mat-/ingrediensoutput, og med hvilke kvalitetskrav?',
      evidenceRequired: 'Navngitt off-taker eller eksplisitt no-off-taker.',
    },
    {
      candidate: 'B2',
      ask: 'Hvor faller spiselig verdi etter kategori, tidsvindu og destinasjon?',
      evidenceRequired: 'Baseline, kategori, tidsvindu, destinasjon og kontrafaktisk.',
    },
    {
      candidate: 'B2',
      ask: 'Hvilken rutine eller datasignal flytter maten før restfraksjon?',
      evidenceRequired: 'Målbar rutineendring og dataeier.',
    },
    {
      candidate: 'B3',
      ask: 'Hva er produktstatus, N/P/K-balanse, kontaminantgate og marked?',
      evidenceRequired: 'Produktdeklarasjon, massebalanse og lovlig status.',
    },
    {
      candidate: 'A/B',
      ask: 'Hvilke substrater er grønne, gule eller røde under dagens regelverk?',
      evidenceRequired: 'Juridisk kilde, dato og substratliste.',
    },
    {
      candidate: 'A/B',
      ask: 'Hvilken kvalitet, kost, LCA og regulatorisk dokumentasjon kreves før kjøp?',
      evidenceRequired: 'Kjøperkrav eller avvisningsgrunn.',
    },
  ],
  safeLanguage: [
    'Wageningen/Elbersen 2022 brukes som internt scorings- og gatespråk.',
    'Metoden hjelper Food TG å se hvilke valideringsspørsmål som må lukkes.',
    'Ekstern metodebruk må ha locator, claim-ID, caveat og åpen nordisk valideringsgate.',
  ],
  blockedLanguage: [
    'Wageningen validerer Food TG-metoden.',
    'WUR-score dokumenterer klimaeffekt.',
    'Score betyr effekt.',
    'Moerman-kaskaden gir én endelig rangering for alle strømmer.',
    'Ghana, Costa Rica eller Nederland beviser nordisk overførbarhet.',
  ],
  documents: [
    {
      label: 'Metodeoverføring',
      path: 'docs/project/mandates/food-tg-wageningen-moerman-method-transfer-2026-05-26.md',
    },
    {
      label: 'Kritisk gate-analyse',
      path: 'docs/project/mandates/wageningen-critical-gate-analysis-2026-05-26.md',
    },
    {
      label: 'Source locator ledger',
      path: 'docs/project/mandates/wageningen-source-locator-ledger-2026-05-26.md',
    },
    {
      label: 'Scorecard-template',
      path: 'docs/project/mandates/wageningen-scorecard-template-2026-05-26.md',
    },
    {
      label: 'Valideringsspørsmål',
      path: 'docs/project/mandates/wageningen-validation-sprint-ask-pack-2026-05-26.md',
    },
    {
      label: 'Claim-lock delta',
      path: 'docs/project/mandates/wageningen-claim-lock-delta-2026-05-26.md',
    },
  ],
}
