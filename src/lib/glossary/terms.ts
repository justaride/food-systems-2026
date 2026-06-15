export type GlossaryCategory = 'statistikk' | 'prosjekt' | 'status'

export type GlossaryTerm = {
  term: string
  definition: string
  reading?: string
  category: GlossaryCategory
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // statistikk — moved verbatim from InsightGlossary
  { term: 'HHI', category: 'statistikk', definition: 'Herfindahl-Hirschman Index — sum av kvadrerte markedsandeler. Viser konsentrasjon i markedet.', reading: '< 1500 lavt · 1500–2500 moderat · > 2500 høyt konsentrert' },
  { term: 'Gini', category: 'statistikk', definition: 'Gini-koeffisient — mål på ulikhet i fordeling. Her brukt på butikktilgang per innbygger.', reading: '0 = perfekt likhet · 1 = maksimal ulikhet' },
  { term: 'CR3', category: 'statistikk', definition: 'Concentration Ratio 3 — samlet markedsandel for de tre største aktørene.', reading: '> 70% indikerer oligopol' },
  { term: 'Zipf', category: 'statistikk', definition: 'Zipfs lov — empirisk fordeling der antall ≈ konstant / rang. Brukes til å sjekke om butikknettverket følger naturlig urban-fordeling.', reading: 'R² nær 1 og helling ≈ −1 = følger Zipf' },
  { term: 'Lorenz-kurve', category: 'statistikk', definition: 'Visuell fremstilling av ulikhet. Diagonalen = perfekt likhet; jo lengre kurven bøyer ut, jo større ulikhet.' },
  // prosjekt — 6 from the forside Nøkkelbegreper + 3 new
  { term: 'Food TG', category: 'prosjekt', definition: 'Food Transition Group, prosjektets arbeidsgruppe.' },
  { term: 'Ten Step', category: 'prosjekt', definition: 'Ti-stegs metodikk for å drive transisjonsgruppen.' },
  { term: 'Evidence Pack', category: 'prosjekt', definition: 'Standardsettet av leveransedokumenter.' },
  { term: 'Spor A/B/C', category: 'prosjekt', definition: 'De tre scope-sporene: fôr/import, sidestrømmer, governance.' },
  { term: 'Claim-koder', category: 'prosjekt', definition: 'CL = claim, EV = evidence, SRC = kilde, med spor og nummer.' },
  { term: 'Forskningsrunder', category: 'prosjekt', definition: 'Avgrensede runder med kunnskapsinnhenting.' },
  { term: 'SourceDoc', category: 'prosjekt', definition: 'Kilde-lag i databasen med proveniens; et bibliotek-dokument kan finnes uten et eget SourceDoc-lag.' },
  { term: 'Backlog', category: 'prosjekt', definition: 'Kilder identifisert i en forskningsrunde, men ikke ennå registrert eller nedlastet.' },
  { term: 'Exa', category: 'prosjekt', definition: 'Søke-API brukt til å hente kilder automatisk.' },
  // status — badge codes
  { term: 'Stance', category: 'status', definition: 'Aktørens holdning til prosjektet (teamets vurdering, ikke aktørens egen uttalelse).', reading: 'champion = forkjemper · supportive = støttende · neutral = nøytral · skeptical = skeptisk · opposed = motstander' },
  { term: 'Prioritet (P1–P3)', category: 'status', definition: 'Intern prioritering av aktør for oppfølging.', reading: 'P1 = viktigst · P3 = lavest' },
  { term: 'Researchstatus', category: 'status', definition: 'Hvor sikkert et tall er.', reading: 'Primærsnapshot = bekreftet fra primærkilde på ett tidspunkt · Proxy/modell = indirekte indikator · Trenger primærsjekk = må verifiseres mot primærkilde' },
  { term: 'Innsiktstype', category: 'status', definition: 'Kilde-/dokumenttype bak en innsikt.', reading: 'Notat · Transkripsjon · Arbeidsdok · Strategi · Duplikat = overlapper en annen oppføring' },
]
