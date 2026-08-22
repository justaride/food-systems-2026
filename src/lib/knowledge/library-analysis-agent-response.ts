import { z } from "zod";

import {
  CANDIDATE_ASSERTION_TYPES,
  canonicalCandidateJson,
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
  type CandidateJsonValue,
} from "./candidate-analysis-contract";
import type {
  LibraryAnalysisAgentQueueJob,
  LibraryAnalysisAgentQueueSource,
  LibraryAnalysisVerifiedJob,
} from "./library-analysis-agent-queue";

const HASH = /^[a-f0-9]{64}$/u;
const hashSchema = z.string().regex(HASH);
const idSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/u);
const textSchema = z.string().min(1);

export const LIBRARY_ANALYSIS_AGENT_SEGMENT_RESPONSE_SCHEMA =
  "library-analysis-agent-segment-response/v1" as const;

export const LibraryAnalysisAgentModelReceiptSchema = z.object({
  provider: z.literal("openai-codex"),
  name: z.literal("gpt-5.6-luna"),
  version: textSchema,
}).strict();
export type LibraryAnalysisAgentModelReceipt = z.infer<
  typeof LibraryAnalysisAgentModelReceiptSchema
>;

const coverageStatusSchema = z.enum([
  "claims_extracted",
  "no_material_claim",
  "blocked",
]);
const blockedReasonCodeSchema = z.enum([
  "unreadable_content",
  "ambiguous_content",
  "unsupported_content",
  "insufficient_context",
]);

export const LibraryAnalysisAgentCoverageSchema = z.object({
  contentUnitId: idSchema,
  status: coverageStatusSchema,
  reason: textSchema.optional(),
  reasonCode: blockedReasonCodeSchema.optional(),
}).strict();
export type LibraryAnalysisAgentCoverage = z.infer<typeof LibraryAnalysisAgentCoverageSchema>;
const coverageSchema = LibraryAnalysisAgentCoverageSchema;

const responseClaimSchema = z.object({
  localOrdinal: z.number().int().nonnegative(),
  assertionType: z.enum(CANDIDATE_ASSERTION_TYPES),
  contentUnitId: idSchema,
  text: textSchema,
  evidence: textSchema,
  locator: textSchema,
  confidence: z.number().min(0).max(1).nullable(),
}).strict();

const responseCoreSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_SEGMENT_RESPONSE_SCHEMA),
  queueHash: hashSchema,
  jobId: idSchema,
  jobHash: hashSchema,
  attempt: z.number().int().positive(),
  inputHash: hashSchema,
  model: LibraryAnalysisAgentModelReceiptSchema,
  unitCoverage: z.array(coverageSchema),
  claims: z.array(responseClaimSchema),
}).strict();

const CONTEXT_DEPENDENT_OPENING = /^(?:derfor|dermed|følgelig|således|therefore|thus|hence|consequently)\b/iu;
const BOUNDED_YEAR_RANGE = /\b(?:19|20)\d{2}\b\s*(?:[-–—]|to|through|until|and|til(?:\s+og\s+med)?|gjennom|og)\s*\b(?:19|20)\d{2}\b/iu;
const EXPLICIT_SCOPED_APPROACH = /\b(?:tilnærmingen\s+fokuserer\s+på|the\s+approach\s+focuses\s+on)(?=\s|[.,;:]|$)/iu;
const UNANCHORED_RELATIVE_REFERENCE = /\b(?:i\s+økende\s+grad|de\s+siste\s+to\s+tiårene|foreløpig|currently)\b/iu;
const AUDITED_GENERIC_SUBJECT = /^(?:(?:oppgaven|studien)\s+(?:dokumenterer|finner|viser)|(?:the\s+(?:study|assignment))\s+(?:documents?|finds?|shows?))\b/iu;
const AUDITED_HERE_REFERENCE = /^(?:driftsinntekter\s+her\s+økte|revenue\s+here\s+increased)\b/iu;
const ANOTHER_FACTOR = /\b(?:en\s+annen\s+faktor|another\s+factor)\b/iu;
const PRIOR_FACTOR = /\b(?:faktor|factor)\b/iu;
const UNRESOLVED_GENERIC_REFERENCE = /\b(?:arbeidet(?!\s+(?:med|for|av)\b)|metoden(?!\s+(?:for|til|med)\b)|tilnærmingen(?!\s+(?:for|til|med|fokuserer\s+på)\b)|kartleggingen(?!\s+(?:av|for|i)\b)|kartleggingene|resultatet(?!\s+(?:av|fra|for|i)\b)|resultatene(?!\s+(?:av|fra|for|i)\b)|the\s+work(?!\s+(?:on|for|of)\b)|the\s+method(?!\s+(?:for|of|to|using)\b)|the\s+approach(?!\s+(?:for|to|using|focuses\s+on)\b)|the\s+mapping(?!\s+(?:of|for)\b)|the\s+results?(?!\s+(?:of|from|for|in)\b))\b/iu;
const UNRESOLVED_GENERIC_METHOD_OPENING = /^(?:(?:(?:an?|the|our|this)\s+)?(?:approach(?:es)?|methods?|methodolog(?:y|ies))(?!\s+(?:for|of|to|using|on)\b)|(?:(?:en|et|vår|denne)\s+)?(?:tilnærming(?:en|er|ene)?|metod(?:e|en|er|ene))(?!(?:\s+(?:for|til|med|av)\b|\s+fokuserer\s+på(?=\s|[.,;:]|$))))\b/iu;
const BARE_APPENDIX_REFERENCE = /^(?:i\s+dette\s+vedlegget|in\s+this\s+appendix)\b/iu;
const UNNAMED_AUTHORITY_ANALYSIS = /(?:\btilsynets\s+(?:(?:analyser|analyse)\b(?!\s+(?:av|om|for|i|fra|basert\s+på)(?:\s|$))|datagrunnlag\b)|\bthe\s+authority['’]s\s+(?:(?:analyses|analysis)\b(?!\s+(?:of|on|for|in|from|based\s+on)\b)|data\s+basis\b))/iu;
const NAMED_AUTHORITY = /\b(?:Konkurransetilsynet(?:s)?|Norwegian\s+Competition\s+Authority|Competition\s+and\s+Markets\s+Authority|CMA)\b/iu;
const BARE_SAMPLE_REFERENCE = /(?:\butvalget(?!\s+(?:av|på|med|bestående\s+av)(?:\s|$))|\bthe\s+sample(?!\s+(?:of|with|comprising)\b))/iu;
const BARE_INFORMATION_REFERENCE = /(?:\bmye\s+av\s+informasjonen(?!\s+(?:om|for|fra|i)\b)|\bmuch\s+of\s+the\s+information(?!\s+(?:about|for|from|in)\b))/iu;
const BARE_SIMILAR_ANALYSIS = /(?:\blignende\s+analyser(?!\s+(?:av|om|for|i|fra|basert\s+på)(?:\s|$))|\bsimilar\s+analyses(?!\s+(?:of|on|for|in|from|based\s+on)\b))/iu;
const BARE_ANALYSIS_REFERENCE = /(?:\banalysen(?!\s+(?:av|om|for|i|fra|basert\s+på)(?:\s|$))|\bthe\s+analysis(?!\s+(?:of|on|for|in|from|based\s+on)\b))/iu;
const BARE_DOUBLE_COUNTING = /\b(?:dobbelttelling|dobbeltelling|double[- ]counting)(?!\s+(?:av|of)(?:\s|$))/iu;
const UNRESOLVED_RESULT_EVIDENCE = /\b(?:resultatet(?!\s+(?:av|fra|for|i)\b)|the\s+result(?!\s+(?:of|from|for|in)\b))\b/iu;
const UNRESOLVED_PLURAL_RESULT_EVIDENCE_OPENING = /^(?:resultatene(?!\s+(?:av|fra|for|i)\b)|the\s+results(?!\s+(?:of|from|for|in)\b))\b/iu;
const EXPLICIT_YEAR = /\b(?:19|20)\d{2}\b/u;
const MATERIAL_SCOPE_QUALIFIERS = [
  /\bi\s+denne\s+sammenhengen\b/iu,
  /\bin\s+this\s+context\b/iu,
] as const;
const REPORTED_MEASURE = /(?:\b(?:rapporterer|reports?|reporting)\b[\s\S]{0,180}\b(?:tiltak|measures?|actions?)\b|\breported\b(?=[\s\S]{0,80}\d)[\s\S]{0,180}\b(?:measures?|actions?)\b)/iu;
const REPORTING_BASIS = /\b(?:kvalitativ\s+innholdsanalyse|content\s+analysis|b[\u00e6a]rekraftsrapporter|sustainability\s+reports?|based\s+on|basert\s+på)\b/iu;
const OWNERSHIP_OR_CONTROL = /\b(?:eier|eid\s+av|kontrolleres\s+av|owns?|owned\s+by|controlled\s+by)\b/iu;
const QUANTIFIED_MARKET_SHARE = /(?:\b\d+(?:[.,]\d+)?\s*(?:%|percent|prosent)[\s\S]{0,80}\b(?:markedsandel|market\s+share)\b|\b(?:markedsandel|market\s+share)\b[\s\S]{0,80}\b\d+(?:[.,]\d+)?\s*(?:%|percent|prosent))/iu;
const REPORT_TITLE_CLAIM = /\b(?:the\s+report\s+is\s+titled|rapporten\s+(?:har\s+tittelen|heter))\b/iu;
const REPORT_TITLE_CONTEXT = /\b(?:report\s+title|title\s+of\s+the\s+report|the\s+report\s+is\s+titled|rapporttittel|rapportens\s+tittel|rapporten\s+(?:har\s+tittelen|heter))\b/iu;
const ANALYTICAL_ACTION = /\b(?:har\s+(?:beregnet|kartlagt)|(?:ble|er)\s+(?:beregnet|kartlagt)|beregner|beregnet|kartlegger|kartla|estimerer|estimerte|has\s+(?:calculated|mapped|estimated)|(?:was|were)\s+(?:calculated|mapped|estimated)|calculates?|mapped|maps?|estimates?|estimated)\b/iu;
const ANALYTICAL_OUTCOME = /\b(?:avkastning|RNOA|lønnsomhet|driftsmarginer?|operating\s+margins?|returns?|profitability)\b/iu;
const ANALYTICAL_BASIS = /\b(?:basert\s+på|med\s+utgangspunkt\s+i|på\s+grunnlag\s+av|ved\s+hjelp\s+av|regnskapstall|regnskapsdata|årsrapporter?|årsregnskap|based\s+on|using\s+(?:financial\s+statements?|accounts?|accounting\s+data|annual\s+reports?)|financial\s+statements?|annual\s+reports?)\b/iu;
const INCOMPLETE_NEGATED_ANALYSIS_EVIDENCE = /\b(?:ikke\s+har\s+analysert|did\s+not\s+analy[sz]e|has\s+not\s+analy[sz]ed)\s*$/iu;
const MATERIAL_EXCLUSION = /\b(?:not\s+included|excluded|not\s+counted|inngår\s+ikke|ikke\s+inkludert|ikke\s+medregnet)\b/iu;
const FRANCHISE_SCOPE = /\b(?:franchise[- ]owned\s+stores?|franchiseeide\s+butikker|kjøpmannseide\s+butikker)\b/iu;
const POSSESSIVE_OWNERSHIP_TARGET = /\b(?:is|was)\s+(?:(?:listed|identified|reported)\s+as\s+)?(?:the\s+)?([\p{L}\p{N}.& -]{2,80}?)'s\s+(?:largest|majority|controlling)\s+(?:owner|shareholder)\b/iu;
const NORWEGIAN_POSSESSIVE_OWNERSHIP_TARGET = /\b(?:er|var)\s+([\p{Lu}][\p{L}\p{N}.& -]{1,80}?)s\s+største\s+eier\b/u;
const CONTEXT_DEPENDENT_EVIDENCE_OPENING = /^(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\b/iu;
const DEICTIC_STUDY_REFERENCE = /\b(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\b/iu;
const UNRESOLVED_INDICATOR_REFERENCE = /\b(?:denne\s+indikatoren|this\s+indicator)\b/iu;
const MAPPED_ACTOR_SCOPE = /\b(?:(?:actors?|participants?)\b[^.;!?\n]{0,80}\b(?:the\s+)?mapping|(?:[\p{L}-]*aktør(?:er|ene)?|deltaker(?:e|ne)?)\b[^.;!?\n]{0,80}\bkartleggingen)\b/iu;
const BROAD_ALL_ACTORS = /\b(?:(?:all|every|each)\s+(?:[\p{L}-]+\s+){0,4}(?:actors?|participants?)|each\s+of\s+the\s+(?:actors?|participants?)|(?:alle|samtlige|enhver|hver)\s+(?:[\p{L}-]+\s+){0,4}(?:[\p{L}-]*aktør(?:er|ene)?|deltaker(?:e|ne)?)|(?:actors?|participants?)\s+(?:generally|in\s+general))\b/iu;
const NAMED_STUDY_IDENTITY = /\b(?:the\s+)?([A-Z][A-Z0-9&.-]{2,})\s+(?:survey|questionnaire|study)\b/u;
const NAMED_NORWEGIAN_STUDY_IDENTITY = /\b([A-ZÆØÅ][A-ZÆØÅ0-9&.-]{2,})[- ](?:undersøkelsen|studien|kartleggingen)\b/u;
const TITLE_CASE_STUDY_IDENTITY = /\b(?:the\s+)?([A-Z][\p{L}\p{M}-]+(?:\s+[A-Z][\p{L}\p{M}-]+){1,5})\s+(?:survey|questionnaire|study)\b/u;
const DEICTIC_STUDY_BY_IDENTITY = /\bthis\s+(?:survey|questionnaire|study)\s+by\s+([A-Z][\p{L}\p{M}0-9&.-]+)\b/iu;
const DEICTIC_STUDY_CALLED_IDENTITY = /\b(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\s*,\s*(?:called|known\s+as|from|kalt|kjent\s+som|fra)\s+([\p{L}\p{N}][\p{L}\p{M}\p{N}&.' -]{1,100}?)(?=\s*,|\s+(?:was|is|ble|var|er)\b)/iu;
const DEICTIC_STUDY_PAREN_IDENTITY = /\b(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\s*\(\s*([\p{L}\p{N}][^)]{1,100}?)\s*\)/iu;
const DEICTIC_STUDY_DASH_IDENTITY = /\b(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\s+[—–-]\s*([^—–-]{2,100}?)\s*[—–-]/iu;
const EXPLICIT_TABULAR_FIELDS = /\b(?:id|priority|status|country|coding_target|next_action)\s*[:=]/iu;
const DELIMITED_ROW = /^(?:[^,\t]*[,\t]){1,}[^,\t]*$/u;
const ENGLISH_EXCLUSION_AFTER_MARKER = /\b(?:excludes?|does\s+not\s+include|did\s+not\s+include)\s+([^.;,:]{2,120})/iu;
const NORWEGIAN_EXCLUSION_AFTER_MARKER = /\b(?:utelater|utelot|ekskluderer|ekskluderte|inkluderer\s+ikke)\s+([^.;,:]{2,120})/iu;
const ENGLISH_EXCLUSION_MARKER = /\b(?:not\s+included|excluded|not\s+counted|excludes?|does\s+not\s+include|did\s+not\s+include)\b/iu;
const NORWEGIAN_EXCLUSION_MARKER = /\b(?:inngår\s+ikke|ikke\s+inkludert|ikke\s+medregnet|utelater|utelot|ekskluderer|ekskluderte|inkluderer\s+ikke)\b/iu;
const ENGLISH_EVIDENCE_CONTEXT = /\b(?:the|figures?|stores?|companies|respondents?|data)\b/iu;
const NORWEGIAN_EVIDENCE_CONTEXT = /\b(?:tallene|butikker|selskaper|respondenter|dataene)\b/iu;
const GENERIC_EXPECTATION = /^(?:forventningen\s+er|the\s+expectation\s+is)\b/iu;
const OPERATIONAL_STATUS = /(?:\bdashboard(?:et)?\b[\s\S]{0,80}\b(?:brukes|anvendes|is\s+used)\b|\b(?:ingen|no)\b[\s\S]{0,80}\b(?:partnere?|partners?)\b[\s\S]{0,80}\b(?:kontaktet|contacted)\b)/iu;
const NAMED_SCOPE = /\bfor\s+(?!(?:prosjektet|søknaden|the\s+project|the\s+application)\b)[A-ZÆØÅ][\p{L}\p{N}-]*(?:\s+[A-ZÆØÅ][\p{L}\p{N}-]*)+/u;
const SURVEY_UNIT_CONTEXT = /\b(?:survey|questionnaire|respondents?|responses?|companies\s+indicated|could\s+you\s+rank|your\s+company)\b/iu;
const SURVEY_DEPENDENT_CLAIM = /\b(?:respondents?|respondent\s+companies|companies\s+responded|most\s+(?:(?:of\s+the|insect(?:\s+food)?|food)\s+)?companies|most\s+established\s+companies|newer\s+entrants|on\s+average|rank(?:ed|ing)?|total(?:\s+collective)?\s+production|forecast(?:ed)?|foreseen|projection)\b/iu;
const LOCAL_SURVEY_SCOPE = /\b(?:(?:among|from|of|sample\s+of)\s+|responses?\s+from\s+)?\d{1,4}\s+(?:(?:EU|European|Nordic|surveyed)\s+)?(?:(?:insect\s+farming|insect-food|food)\s+)?(?:companies|respondents|producers)\b/iu;
const FORECAST_CLAIM = /\b(?:forecast(?:ed)?|foreseen|projection|projected)\b/iu;
const FORECAST_BASIS = /\b(?:based\s+on|using|scenario|model(?:led|ed|ing)?|estimated?\s+from|responses?\s+from)\b/iu;
const QUANTIFIED_GENERIC_RETURN = /(?:\b(?:(?:gjennomsnittlig\s+)?avkastning|(?:average\s+)?returns?)\b[\s\S]{0,120}\b\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b|\b\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b[\s\S]{0,120}\b(?:avkastning|returns?)\b)/iu;
const RETURN_METRICS = [
  { id: "rnoa", pattern: /\b(?:RNOA|avkastning\s+på\s+netto\s+driftsrelaterte\s+eiendeler|return\s+on\s+net\s+operating\s+assets)\b/iu },
  { id: "operating_margin", pattern: /\b(?:driftsmarginer?|operating\s+margins?)\b/iu },
] as const;
const BARE_MATERIAL_EXCLUSION_SCOPE = /\b(?:inngår[\s\S]{0,40}?ikke\s+i\s+(?:tallene|dataene)(?!\s+(?:for|fra|i|til|som|basert\s+på|brukt\s+av)\b)|(?:er\s+)?(?:ekskludert|utelatt)\s+fra\s+(?:tallene|dataene|datasettet|utvalget)(?!\s+(?:for|fra|i|til|som|basert\s+på|brukt\s+av)\b)|(?:er\s+)?ikke\s+(?:medregnet|inkludert)\s+i\s+(?:tallene|dataene|datasettet|utvalget)(?!\s+(?:for|fra|i|til|som|basert\s+på|brukt\s+av)\b)|(?:is|are)\s+(?:not\s+included\s+in|excluded\s+from|not\s+counted\s+in)\s+(?:the\s+)?(?:figures|data|numbers|dataset|sample)(?!\s+(?:for|from|in|of|that|based\s+on|used\s+by)\b))\b/iu;
const INCOMPLETE_MATERIAL_EXCLUSION_SCOPE = /(?:\b(?:tallene|dataene|datasettet|utvalget)\s+(?:for|fra|i|til|som|basert\s+på|brukt\s+av)|\b(?:figures|data|numbers|dataset|sample)\s+(?:for|from|in|of|that|based\s+on|used\s+by))\s*[.!?]?\s*$/iu;
const SCOPED_NEGATED_CAUSAL_ANALYSIS = /\b(?:(?:ikke\s+har|har\s+ikke)\s+analysert\s+kausale\s+sammenhenger\s+mellom|(?:did\s+not\s+analy[sz]e|has\s+not\s+analy[sz]ed)\s+causal\s+(?:links|relationships?)\s+between)\b/iu;
const CAUSAL_ANALYSIS_SCOPE = /\b(?:(?:ikke\s+har|har\s+ikke)\s+analysert\s+kausale\s+sammenhenger\s+mellom|(?:did\s+not\s+analy[sz]e|has\s+not\s+analy[sz]ed)\s+causal\s+(?:links|relationships?)\s+between)\s+([^.!?]{3,300})/iu;
const PRICE_MEASURE = /\b(?:(?:produsent|forbruker|dagligvare)pris(?:ene)?|pris(?:ene)?\s+for\s+dagligvarer|prices?\s+(?:for\s+groceries|of\s+groceries)|producer\s+prices?|consumer\s+prices?)\b/iu;
const PRICE_CHANGE = /(?<![\p{L}\p{N}_])(?:økte|falt|steg|increased|decreased|rose|fell)(?![\p{L}\p{N}_])/iu;
const KNOWN_GEOGRAPHY = /\b(?:Norge|Norway|norsk(?:e)?|EU(?:27)?|Europa|Europe|europeisk(?:e)?|European|Norden|Nordic|Sverige|Sweden|Danmark|Denmark|Finland)\b/giu;
const CONTEXTUAL_GEOGRAPHY = /\b(?:[Ii]|[Pp]å|[Ii]n|[Aa]cross|[Ff]or|[Tt]hroughout|[Gg]jennom)\s+(?:the\s+)?([\p{Lu}][\p{L}\p{M}-]*(?:\s+[\p{Lu}][\p{L}\p{M}-]*){0,2})/gu;
const COORDINATED_GEOGRAPHY = /\b(?:and|og)\s+([\p{Lu}][\p{L}\p{M}-]*(?:\s+[\p{Lu}][\p{L}\p{M}-]*){0,2})/gu;
const POSSESSIVE_PRICE_GEOGRAPHY = /\b([\p{Lu}][\p{L}\p{M}-]+)['’]s\s+(?:(?:consumer|producer|grocery)\s+prices?|prices?\s+for\s+groceries)/gu;
const NON_GEOGRAPHY_CONTEXT = new Set([
  "appendix", "chapter", "figure", "figur", "kapittel", "rapport", "report",
  "section", "seksjon", "table", "tabell",
]);
const ACTOR_ATTRIBUTION = /\b(?:oppga|opplyste|rapporterte|stated|reported|said)\b/iu;
const ATTRIBUTION_ACTOR_BEFORE = /([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+(?:[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*|kommune|tilsynet|authority|agency|group)){0,5})\s+(?:oppga|opplyste|rapporterte|stated|reported|said)\b/gu;
const ATTRIBUTION_ACTOR_AFTER = /\b(?:oppga|opplyste|rapporterte|stated|reported|said)\s+([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+(?:[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*|kommune|tilsynet|authority|agency|group)){0,5})/gu;
const VAGUE_COMPARISON = /\b(?:med\s+visse\s+særtrekk|with\s+certain\s+(?:features|characteristics)|sammenlignet\s+med\s+litteraturen|compared\s+with\s+the\s+literature)\b/iu;
const COMPARATIVE_PATTERN = /\b(?:(?:det\s+)?europeiske\s+mønsteret|the\s+European\s+pattern)\b/iu;
const NAMED_COMPARISON_BASIS = /\b(?:målt\s+av|ifølge|basert\s+på|measured\s+by|according\s+to|based\s+on)\s+([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*)/u;
const UNNAMED_STUDY_AUTHORITY = /\b(?:empiriske\s+studier|empirical\s+studies|litteraturen|the\s+literature)\s+(?:viser|indikerer|tyder\s+på|shows?|indicates?|suggests?)(?![\p{L}\p{N}_])/iu;
const PASSIVE_IDENTIFICATION = /\b(?:(?:ble\s+det|det\s+ble)\s+identifisert\s+at|it\s+was\s+identified\s+that)\b/iu;
const FIGURE_REFERENCE = /\b(?:Figur|Figure)\s+(\d{1,4})\b/iu;
const FIGURE_PERCENT_VALUE = /\b\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b/iu;
const FIGURE_CHANGE = /(?:økte|steg|falt|increased|rose|fell|decreased)(?![\p{L}\p{N}_])/iu;
const FIGURE_AGGREGATED_ACTORS = /\b(?:aggregert|aggregated)\s*\(([^)]{3,200})\)/iu;
const BOUNDED_YEAR_RANGE_CAPTURE = /\b((?:19|20)\d{2})\b\s*(?:[-–—]|to|through|until|and|til(?:\s+og\s+med)?|gjennom|og)\s*\b((?:19|20)\d{2})\b/giu;
const NOT_INFLATION_ADJUSTED = /\b(?:ikke\s+(?:er\s+)?(?:inflasjonsjustert(?:e)?|justert(?:e)?\s+for\s+inflasjon)|not\s+(?:inflation[- ]adjusted|adjusted\s+for\s+inflation))\b/iu;
const RETURN_SUPERLATIVE = /\b(?:avkastning(?:en)?|RNOA|lønnsomhet(?:en)?|returns?|profitability)\b[\s\S]{0,160}\b(?:høyest(?:e)?|mest\s+lønnsomm(?:e|t)|highest|most\s+profitable)\b|\b(?:høyest(?:e)?|mest\s+lønnsomm(?:e|t)|highest|most\s+profitable)\b[\s\S]{0,160}\b(?:avkastning(?:en)?|RNOA|lønnsomhet(?:en)?|returns?|profitability)\b/iu;
const RETURN_COMPARISON_UNIVERSE = /\b(?:(?:for|blant|among)\s+(?:(?:de|the)\s+)?(?:tre|3|samtlige|alle|all)\s+(?:enheter|entities|units|selskaper|companies)|(?:de|the)\s+(?:tre|3)\s+(?:enhetene|entities|units)|samtlige\s+(?:enheter|selskaper)|all\s+(?:entities|units|companies))\b/iu;
const RETAIL_MARGIN_MEASURE = /\b(?:driftsmargin(?:en|er|ene)?|operating\s+margin(?:s)?)\b/iu;
const RETAIL_SEGMENT = /\b(?:detaljist(?:leddet|enheter)?|retail(?:\s+segment|\s+entities)?)\b/iu;
const MARGIN_TREND_CHANGE = /\b(?:falt|økte|steg|decreased|increased|rose)\b/iu;
const RETAIL_MARGIN_UNIVERSE = /\b(?:samtlige\s+(?:enheter\s+på\s+detaljistleddet|detaljistenheter)|alle\s+(?:enheter\s+på\s+detaljistleddet|detaljistenheter)|all\s+(?:(?:retail\s+)?(?:entities|units)|(?:entities|units)\s+(?:in|on)\s+the\s+retail\s+segment)|Konkurransetilsynets\s+marginutvalg|the\s+authority['’]s\s+margin\s+sample|(?:NorgesGruppen|Rema|Coop)(?:s)?\s+driftsmargin)\b/iu;
const BARE_DEICTIC_VALUE_OPENING = /^(?:(?:i|in)\s+(?:19|20)\d{2}\s+)?(?:(?:økte|steg|falt)\s+(?:dette|denne|disse)|(?:this|these|it)\s+(?:increased|rose|fell|decreased))\b/iu;
const SOURCE_REPORTED_RESULT_ATTRIBUTION = /\b([A-ZÆØÅ][\p{L}\p{M}-]+(?:\s+[A-ZÆØÅ][\p{L}\p{M}-]+){0,3})\s+(understreker|påpeker|fremhever|emphasizes|notes|highlights)\b/u;
const GENERIC_EVENT_OPENING = /^(?:Hovedbudskapet\s+var|The\s+main\s+message\s+was|Webinaret\b|The\s+webinar\b)/iu;
const WEBINAR_CONTEXT = /\b(?:webinar(?:et)?|webbinarium)\b/iu;
const NAMED_WEBINAR_IDENTITY = /\b(?:RE:Source[- ]webinar(?:et)?|webinar(?:et)?\s+om\s+[\p{L}\p{M}][^.!?]{2,120}|webinar\s+(?:on|about)\s+[\p{L}\p{M}][^.!?]{2,120})\b/iu;
const AUTHORITY_TERMS = [
  /\bpublication[- ]ready\b/iu,
  /\bready for publication\b/iu,
  /\bexternal(?:ly)? ready\b/iu,
  /\b(?:rights|publication)[ -](?:approved|cleared)\b/iu,
  /\b(?:externally valid(?:ated)?|external validity)\b/iu,
  /\bpubliseringsklar\b/iu,
  /\bklar for publisering\b/iu,
  /\beksternt klar\b/iu,
  /\b(?:rettighets|publiserings)godkjent\b/iu,
] as const;

function hasUnresolvedLocalReference(value: string): boolean {
  return BARE_APPENDIX_REFERENCE.test(value) ||
    (UNNAMED_AUTHORITY_ANALYSIS.test(value) && !NAMED_AUTHORITY.test(value)) ||
    BARE_SAMPLE_REFERENCE.test(value) ||
    BARE_INFORMATION_REFERENCE.test(value) ||
    BARE_SIMILAR_ANALYSIS.test(value) ||
    BARE_ANALYSIS_REFERENCE.test(value) ||
    BARE_DOUBLE_COUNTING.test(value);
}

function normalizedMaterialText(value: string): string {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en");
}

function geographyMarkers(value: string): Set<string> {
  const markers = new Set<string>();
  for (const match of value.matchAll(KNOWN_GEOGRAPHY)) {
    markers.add(normalizedMaterialText(match[0]));
  }
  for (const match of value.matchAll(CONTEXTUAL_GEOGRAPHY)) {
    if (match[1] !== undefined) {
      const marker = normalizedMaterialText(match[1]);
      if (!NON_GEOGRAPHY_CONTEXT.has(marker.split(" ")[0]!)) {
        markers.add(marker);
      }
    }
  }
  for (const match of value.matchAll(COORDINATED_GEOGRAPHY)) {
    if (match[1] !== undefined) {
      markers.add(normalizedMaterialText(match[1]));
    }
  }
  for (const match of value.matchAll(POSSESSIVE_PRICE_GEOGRAPHY)) {
    if (match[1] !== undefined) {
      markers.add(normalizedMaterialText(match[1]));
    }
  }
  return markers;
}

function attributionSubjects(value: string): string[] {
  const before = [...value.matchAll(ATTRIBUTION_ACTOR_BEFORE)]
    .map((match) => match[1])
    .filter((subject): subject is string => subject !== undefined)
    .map(normalizedMaterialText);
  if (before.length > 0) return before;
  return [...value.matchAll(ATTRIBUTION_ACTOR_AFTER)]
    .map((match) => match[1])
    .filter((subject): subject is string => subject !== undefined)
    .map(normalizedMaterialText);
}

function quantifiedReturnSegment(value: string): string | undefined {
  return value
    .split(/[.!?;]+/u)
    .find((candidate) => QUANTIFIED_GENERIC_RETURN.test(candidate));
}

function returnMetricIds(value: string): Set<string> {
  return new Set(RETURN_METRICS
    .filter(({ pattern }) => pattern.test(value))
    .map(({ id }) => id));
}

function comparisonBasis(value: string): string | undefined {
  const basis = NAMED_COMPARISON_BASIS.exec(value)?.[1];
  return basis === undefined ? undefined : normalizedMaterialText(basis);
}

function priceDirectionsByGeography(value: string): Map<string, "increase" | "decrease"> {
  const allGeographies = geographyMarkers(value);
  const chunks = value.split(/\b(?:and|og|while|mens|but|men)\b/iu);
  const rows = chunks.map((chunk) => ({
    geographies: [...allGeographies].filter((geography) =>
      normalizedMaterialText(chunk).includes(geography)),
    direction: /(?<![\p{L}\p{N}_])(?:økte|steg|increased|rose)(?![\p{L}\p{N}_])/iu.test(chunk)
      ? "increase" as const
      : /(?<![\p{L}\p{N}_])(?:falt|decreased|fell)(?![\p{L}\p{N}_])/iu.test(chunk)
        ? "decrease" as const
        : undefined,
  }));
  const directions = new Map<string, "increase" | "decrease">();
  for (const [index, row] of rows.entries()) {
    const direction = row.direction ??
      rows.slice(0, index).reverse().find((candidate) => candidate.direction !== undefined)?.direction ??
      rows.slice(index + 1).find((candidate) => candidate.direction !== undefined)?.direction;
    if (direction !== undefined) {
      for (const geography of row.geographies) directions.set(geography, direction);
    }
  }
  return directions;
}

function reportingBasisIds(value: string): Set<string> {
  const ids = new Set<string>();
  if (/\b(?:kvalitativ\s+innholdsanalyse|content\s+analysis)\b/iu.test(value)) ids.add("content_analysis");
  if (/\b(?:b[\u00e6a]rekraftsrapporter|sustainability\s+reports?)\b/iu.test(value)) ids.add("sustainability_reports");
  if (/\b(?:regnskapstall|regnskapsdata|årsregnskap|financial\s+statements?|accounts?|accounting\s+data)\b/iu.test(value)) ids.add("financial_data");
  return ids;
}

function hasUnboundedPeriodReference(value: string): boolean {
  for (const match of value.matchAll(/\b(?:period|perioden|periode)\b/giu)) {
    const offset = match.index;
    const before = value.slice(0, offset);
    const after = value.slice(offset);
    const sentenceStart = Math.max(
      before.lastIndexOf("."),
      before.lastIndexOf("!"),
      before.lastIndexOf("?"),
      before.lastIndexOf(";"),
      before.lastIndexOf("\n"),
    ) + 1;
    const sentenceEndOffset = [".", "!", "?", ";", "\n"]
      .map((boundary) => after.indexOf(boundary))
      .filter((candidate) => candidate >= 0)
      .reduce((minimum, candidate) => Math.min(minimum, candidate), after.length);
    const sentence = value.slice(sentenceStart, offset + sentenceEndOffset);
    if (!BOUNDED_YEAR_RANGE.test(sentence)) {
      return true;
    }
  }
  return false;
}

function hasResolvedIndicatorReference(value: string): boolean {
  return /(?:indikatoren\s+(?:for|om|kalt|heter)|indicator\s+(?:for|of|called|named)|[\p{L}\p{M}-]+\s+indicator\b)[\s\S]{0,240}(?:denne\s+indikatoren|this\s+indicator)/iu.test(value) ||
    /(?:denne\s+indikatoren|this\s+indicator)\s*,?\s*(?:kalt|heter|forkortet|called|named|known\s+as|abbreviated)\s+[\p{L}\p{N}][\p{L}\p{M}\p{N}&.' -]{1,100}/iu.test(value) ||
    /(?:denne\s+indikatoren|this\s+indicator)\s*(?:\(\s*[^)]{2,100}\s*\)|[—–-]\s*[^—–-]{2,100}\s*[—–-])/iu.test(value);
}

function assertSelfContainedClaimText(claimText: string, evidence: string): void {
  const normalizedClaim = claimText.trim();
  const normalizedEvidence = evidence.trim();
  const namedStudyIdentity = NAMED_STUDY_IDENTITY.exec(normalizedClaim)?.[1] ??
    NAMED_NORWEGIAN_STUDY_IDENTITY.exec(normalizedClaim)?.[1] ??
    TITLE_CASE_STUDY_IDENTITY.exec(normalizedClaim)?.[1] ??
    DEICTIC_STUDY_BY_IDENTITY.exec(normalizedClaim)?.[1] ??
    DEICTIC_STUDY_CALLED_IDENTITY.exec(normalizedClaim)?.[1] ??
    DEICTIC_STUDY_PAREN_IDENTITY.exec(normalizedClaim)?.[1] ??
    DEICTIC_STUDY_DASH_IDENTITY.exec(normalizedClaim)?.[1];
  const anotherFactor = ANOTHER_FACTOR.exec(normalizedClaim);
  const unresolvedAnotherFactor = anotherFactor !== null &&
    !PRIOR_FACTOR.test(normalizedClaim.slice(0, anotherFactor.index));
  const unresolvedLocalReference = hasUnresolvedLocalReference(normalizedClaim);
  const unresolvedGenericReference = UNRESOLVED_GENERIC_REFERENCE.test(normalizedClaim) &&
    !MAPPED_ACTOR_SCOPE.test(normalizedClaim) &&
    !EXPLICIT_SCOPED_APPROACH.test(normalizedClaim);
  if (
    CONTEXT_DEPENDENT_OPENING.test(normalizedClaim) ||
    (UNANCHORED_RELATIVE_REFERENCE.test(normalizedClaim) && !EXPLICIT_YEAR.test(normalizedClaim)) ||
    AUDITED_GENERIC_SUBJECT.test(normalizedClaim) ||
    AUDITED_HERE_REFERENCE.test(normalizedClaim) ||
    unresolvedAnotherFactor ||
    unresolvedGenericReference ||
    UNRESOLVED_GENERIC_METHOD_OPENING.test(normalizedClaim) ||
    unresolvedLocalReference
  ) {
    throw new Error("agent_response_context_dependent_claim");
  }
  if (
    hasUnboundedPeriodReference(normalizedClaim)
  ) {
    throw new Error("agent_response_period_scope_missing");
  }
  if (
    namedStudyIdentity === undefined &&
    (DEICTIC_STUDY_REFERENCE.test(normalizedClaim) ||
      DEICTIC_STUDY_REFERENCE.test(normalizedEvidence))
  ) {
    throw new Error("agent_response_study_identity_missing");
  }
  if (
    (UNRESOLVED_INDICATOR_REFERENCE.test(normalizedClaim) &&
      !hasResolvedIndicatorReference(normalizedClaim)) ||
    (UNRESOLVED_INDICATOR_REFERENCE.test(normalizedEvidence) &&
      !hasResolvedIndicatorReference(normalizedEvidence))
  ) {
    throw new Error("agent_response_indicator_context_missing");
  }
  if (
    MAPPED_ACTOR_SCOPE.test(normalizedEvidence) &&
    (!MAPPED_ACTOR_SCOPE.test(normalizedClaim) || BROAD_ALL_ACTORS.test(normalizedClaim))
  ) {
    throw new Error("agent_response_mapped_actor_scope_missing");
  }
  if (
    hasUnboundedPeriodReference(normalizedEvidence)
  ) {
    throw new Error("agent_response_period_scope_missing");
  }
  if (
    UNRESOLVED_RESULT_EVIDENCE.test(normalizedEvidence) ||
    UNRESOLVED_PLURAL_RESULT_EVIDENCE_OPENING.test(normalizedEvidence) ||
    hasUnresolvedLocalReference(normalizedEvidence)
  ) {
    throw new Error("agent_response_evidence_context_dependent");
  }
  if (
    CONTEXT_DEPENDENT_EVIDENCE_OPENING.test(normalizedEvidence) &&
    namedStudyIdentity !== undefined &&
    !normalizedEvidence.includes(namedStudyIdentity)
  ) {
    throw new Error("agent_response_evidence_context_dependent");
  }
  if (INCOMPLETE_NEGATED_ANALYSIS_EVIDENCE.test(normalizedEvidence)) {
    throw new Error("agent_response_evidence_incomplete");
  }
  if (
    SCOPED_NEGATED_CAUSAL_ANALYSIS.test(normalizedClaim) &&
    !SCOPED_NEGATED_CAUSAL_ANALYSIS.test(normalizedEvidence)
  ) {
    throw new Error("agent_response_evidence_incomplete");
  }
  const causalScope = CAUSAL_ANALYSIS_SCOPE.exec(normalizedClaim)?.[1];
  if (SCOPED_NEGATED_CAUSAL_ANALYSIS.test(normalizedClaim) && causalScope === undefined) {
    throw new Error("agent_response_evidence_incomplete");
  }
  if (
    causalScope !== undefined &&
    !normalizedMaterialText(normalizedEvidence).includes(normalizedMaterialText(causalScope))
  ) {
    throw new Error("agent_response_evidence_incomplete");
  }
  if (
    BARE_MATERIAL_EXCLUSION_SCOPE.test(normalizedClaim) ||
    INCOMPLETE_MATERIAL_EXCLUSION_SCOPE.test(normalizedClaim)
  ) {
    throw new Error("agent_response_material_exclusion_scope_missing");
  }
  if (UNNAMED_STUDY_AUTHORITY.test(normalizedClaim)) {
    throw new Error("agent_response_unnamed_study_authority");
  }
  if (VAGUE_COMPARISON.test(normalizedClaim)) {
    throw new Error("agent_response_comparison_context_missing");
  }
  if (COMPARATIVE_PATTERN.test(normalizedClaim) && (
    !EXPLICIT_YEAR.test(normalizedClaim) ||
    !EXPLICIT_YEAR.test(normalizedEvidence) ||
    !NAMED_COMPARISON_BASIS.test(normalizedClaim) ||
    !NAMED_COMPARISON_BASIS.test(normalizedEvidence) ||
    comparisonBasis(normalizedClaim) !== comparisonBasis(normalizedEvidence)
  )) {
    throw new Error("agent_response_comparison_context_missing");
  }
  if (PASSIVE_IDENTIFICATION.test(normalizedClaim)) {
    throw new Error("agent_response_identification_actor_missing");
  }
  if (
    MATERIAL_EXCLUSION.test(normalizedClaim) &&
    FRANCHISE_SCOPE.test(normalizedClaim) &&
    (!MATERIAL_EXCLUSION.test(normalizedEvidence) || !FRANCHISE_SCOPE.test(normalizedEvidence))
  ) {
    throw new Error("agent_response_material_exclusion_missing");
  }
  const englishExcludedObject = ENGLISH_EXCLUSION_AFTER_MARKER.exec(normalizedClaim)?.[1]?.trim();
  const norwegianExcludedObject = NORWEGIAN_EXCLUSION_AFTER_MARKER.exec(normalizedClaim)?.[1]?.trim();
  if (
    englishExcludedObject !== undefined &&
    ENGLISH_EVIDENCE_CONTEXT.test(normalizedEvidence) &&
    (!ENGLISH_EXCLUSION_MARKER.test(normalizedEvidence) ||
      !normalizedEvidence.toLocaleLowerCase("en").includes(englishExcludedObject.toLocaleLowerCase("en")))
  ) {
    throw new Error("agent_response_material_exclusion_missing");
  }
  if (
    norwegianExcludedObject !== undefined &&
    NORWEGIAN_EVIDENCE_CONTEXT.test(normalizedEvidence) &&
    (!NORWEGIAN_EXCLUSION_MARKER.test(normalizedEvidence) ||
      !normalizedEvidence.toLocaleLowerCase("no").includes(norwegianExcludedObject.toLocaleLowerCase("no")))
  ) {
    throw new Error("agent_response_material_exclusion_missing");
  }
  for (const qualifier of MATERIAL_SCOPE_QUALIFIERS) {
    if (qualifier.test(evidence) && !qualifier.test(normalizedClaim)) {
      throw new Error("agent_response_scope_qualifier_mismatch");
    }
  }
}

function assertAuditedScopeCompleteness(
  claimText: string,
  evidence: string,
  sourceText: string,
): void {
  if (QUANTIFIED_GENERIC_RETURN.test(claimText)) {
    const claimSegment = quantifiedReturnSegment(claimText);
    const evidenceSegment = quantifiedReturnSegment(evidence);
    const claimMetrics = returnMetricIds(claimSegment ?? "");
    const evidenceMetrics = returnMetricIds(evidenceSegment ?? "");
    if (
      claimSegment === undefined ||
      evidenceSegment === undefined ||
      claimMetrics.size === 0 ||
      [...claimMetrics].some((metric) => !evidenceMetrics.has(metric))
    ) {
      throw new Error("agent_response_analytical_measure_context_missing");
    }
  }
  if (PRICE_MEASURE.test(claimText) && PRICE_CHANGE.test(claimText)) {
    const claimGeographies = geographyMarkers(claimText);
    const evidenceGeographies = geographyMarkers(evidence);
    if (
      claimGeographies.size === 0 ||
      [...claimGeographies].some((geography) => !evidenceGeographies.has(geography))
    ) {
      throw new Error("agent_response_price_geography_missing");
    }
    const claimDirections = priceDirectionsByGeography(claimText);
    const evidenceDirections = priceDirectionsByGeography(evidence);
    if ([...claimDirections].some(([geography, direction]) =>
      evidenceDirections.get(geography) !== direction)) {
      throw new Error("agent_response_price_geography_missing");
    }
  }
  if (REPORTED_MEASURE.test(claimText) && (
    !EXPLICIT_YEAR.test(claimText) ||
    !EXPLICIT_YEAR.test(evidence) ||
    !REPORTING_BASIS.test(claimText) ||
    !REPORTING_BASIS.test(evidence)
  )) {
    throw new Error("agent_response_reported_measure_context_missing");
  }
  if (REPORTED_MEASURE.test(claimText)) {
    const claimBases = reportingBasisIds(claimText);
    const evidenceBases = reportingBasisIds(evidence);
    if ([...claimBases].some((basis) => !evidenceBases.has(basis))) {
      throw new Error("agent_response_reported_measure_context_missing");
    }
  }
  if (OWNERSHIP_OR_CONTROL.test(claimText) && (
    !EXPLICIT_YEAR.test(claimText) || !EXPLICIT_YEAR.test(evidence)
  )) {
    throw new Error("agent_response_ownership_as_of_missing");
  }
  const quantifiedShareClaim = claimText
    .split(/[.!?]+/u)
    .find((segment) => QUANTIFIED_MARKET_SHARE.test(segment));
  const quantifiedShareEvidence = evidence
    .split(/[.!?]+/u)
    .find((segment) => QUANTIFIED_MARKET_SHARE.test(segment));
  if (quantifiedShareClaim !== undefined && (
    quantifiedShareEvidence === undefined ||
    !EXPLICIT_YEAR.test(quantifiedShareClaim) ||
    !EXPLICIT_YEAR.test(quantifiedShareEvidence)
  )) {
    throw new Error("agent_response_share_as_of_missing");
  }
  if (REPORT_TITLE_CLAIM.test(claimText) && !REPORT_TITLE_CONTEXT.test(evidence)) {
    throw new Error("agent_response_title_context_missing");
  }
  const possessiveOwnershipTarget = POSSESSIVE_OWNERSHIP_TARGET.exec(claimText)?.[1]?.trim();
  const norwegianPossessiveOwnershipTarget = NORWEGIAN_POSSESSIVE_OWNERSHIP_TARGET
    .exec(claimText)?.[1]?.trim();
  const ownershipTarget = possessiveOwnershipTarget ?? norwegianPossessiveOwnershipTarget;
  if (
    ownershipTarget !== undefined &&
    !evidence.toLocaleLowerCase("en").includes(ownershipTarget.toLocaleLowerCase("en"))
  ) {
    throw new Error("agent_response_ownership_scope_missing");
  }
  const analyticalClaimSegment = claimText
    .split(/[.!?]+/u)
    .find((segment) => ANALYTICAL_ACTION.test(segment) && ANALYTICAL_OUTCOME.test(segment));
  const analyticalEvidenceSegment = evidence
    .split(/[.!?]+/u)
    .find((segment) => ANALYTICAL_ACTION.test(segment) && ANALYTICAL_OUTCOME.test(segment));
  if (analyticalClaimSegment !== undefined && (
    analyticalEvidenceSegment === undefined ||
    !EXPLICIT_YEAR.test(analyticalClaimSegment) ||
    !EXPLICIT_YEAR.test(analyticalEvidenceSegment) ||
    !ANALYTICAL_BASIS.test(analyticalClaimSegment) ||
    !ANALYTICAL_BASIS.test(analyticalEvidenceSegment)
  )) {
    throw new Error("agent_response_analytical_measure_context_missing");
  }
  if (GENERIC_EXPECTATION.test(claimText)) {
    throw new Error("agent_response_expectation_actor_scope_missing");
  }
  if (OPERATIONAL_STATUS.test(claimText) && (
    !EXPLICIT_YEAR.test(claimText) ||
    !EXPLICIT_YEAR.test(evidence) ||
    !NAMED_SCOPE.test(claimText) ||
    !NAMED_SCOPE.test(evidence)
  )) {
    throw new Error("agent_response_status_scope_or_as_of_missing");
  }
  if (
    SURVEY_UNIT_CONTEXT.test(sourceText) &&
    SURVEY_DEPENDENT_CLAIM.test(claimText) &&
    (!LOCAL_SURVEY_SCOPE.test(claimText) ||
      !LOCAL_SURVEY_SCOPE.test(evidence) ||
      normalizedMaterialText(LOCAL_SURVEY_SCOPE.exec(claimText)?.[0] ?? "") !==
        normalizedMaterialText(LOCAL_SURVEY_SCOPE.exec(evidence)?.[0] ?? ""))
  ) {
    throw new Error("agent_response_survey_scope_missing");
  }
  if (
    SURVEY_UNIT_CONTEXT.test(sourceText) &&
    FORECAST_CLAIM.test(claimText) &&
    !FORECAST_BASIS.test(evidence)
  ) {
    throw new Error("agent_response_forecast_basis_missing");
  }
}

function sourceAttributionBeforeEvidence(
  sourceText: string,
  evidence: string,
): { actor: string; verb: string } | undefined {
  const evidenceMatch = SOURCE_REPORTED_RESULT_ATTRIBUTION.exec(evidence);
  if (evidenceMatch?.[1] !== undefined && evidenceMatch[2] !== undefined) {
    return { actor: evidenceMatch[1], verb: evidenceMatch[2] };
  }
  const evidenceOffset = sourceText.indexOf(evidence);
  if (evidenceOffset <= 0) return undefined;
  const prefix = sourceText.slice(0, evidenceOffset);
  const sentenceStart = Math.max(
    prefix.lastIndexOf("."),
    prefix.lastIndexOf("!"),
    prefix.lastIndexOf("?"),
    prefix.lastIndexOf(";"),
  ) + 1;
  const matches = [...prefix.slice(sentenceStart).matchAll(new RegExp(
    SOURCE_REPORTED_RESULT_ATTRIBUTION.source,
    `${SOURCE_REPORTED_RESULT_ATTRIBUTION.flags}g`,
  ))];
  const match = matches[matches.length - 1];
  if (match?.[1] === undefined || match[2] === undefined) return undefined;
  return { actor: match[1], verb: match[2] };
}

function boundedYearRangeKeys(value: string): Set<string> {
  return new Set([...value.matchAll(BOUNDED_YEAR_RANGE_CAPTURE)]
    .map((match) => `${match[1]}:${match[2]}`));
}

function figureContextBeforeEvidence(
  sourceText: string,
  evidence: string,
  figureNumber: string,
): { actors: string[]; yearRanges: Set<string>; inflationQualified: boolean } | undefined {
  const sourceFigure = [...sourceText.matchAll(/\b(?:Figur|Figure)\s+(\d{1,4})\b/giu)]
    .find((match) => match[1] === figureNumber);
  if (sourceFigure?.index === undefined) return undefined;
  const evidenceOffset = sourceText.indexOf(evidence);
  const contextEnd = evidenceOffset > sourceFigure.index
    ? evidenceOffset
    : evidenceOffset === sourceFigure.index
      ? evidenceOffset + evidence.length
      : sourceText.length;
  const context = sourceText.slice(sourceFigure.index, contextEnd);
  const actorGroup = FIGURE_AGGREGATED_ACTORS.exec(context)?.[1];
  const actors = actorGroup === undefined ? [] : actorGroup
    .split(/\s*(?:,|\bog\b|\band\b)\s*/iu)
    .map((actor) => actor.trim())
    .filter((actor) => actor.length > 1);
  return {
    actors,
    yearRanges: boundedYearRangeKeys(context),
    inflationQualified: NOT_INFLATION_ADJUSTED.test(context),
  };
}

function assertPilot12ScopeCompleteness(
  claimText: string,
  evidence: string,
  sourceText: string,
): void {
  const figureNumber = FIGURE_REFERENCE.exec(claimText)?.[1];
  if (
    figureNumber !== undefined &&
    FIGURE_PERCENT_VALUE.test(claimText) &&
    FIGURE_CHANGE.test(claimText)
  ) {
    const context = figureContextBeforeEvidence(sourceText, evidence, figureNumber);
    const claimRanges = boundedYearRangeKeys(claimText);
    const evidenceRanges = boundedYearRangeKeys(evidence);
    if (context !== undefined && (
      context.actors.some((actor) =>
        !normalizedMaterialText(claimText).includes(normalizedMaterialText(actor)) ||
        !normalizedMaterialText(evidence).includes(normalizedMaterialText(actor))) ||
      [...context.yearRanges].some((range) => !claimRanges.has(range) || !evidenceRanges.has(range)) ||
      (context.inflationQualified &&
        (!NOT_INFLATION_ADJUSTED.test(claimText) || !NOT_INFLATION_ADJUSTED.test(evidence)))
    )) {
      throw new Error("agent_response_figure_context_missing");
    }
  }
  if (RETURN_SUPERLATIVE.test(claimText) && EXPLICIT_YEAR.test(claimText) && (
    !BOUNDED_YEAR_RANGE.test(claimText) ||
    !BOUNDED_YEAR_RANGE.test(evidence) ||
    !RETURN_COMPARISON_UNIVERSE.test(claimText) ||
    !RETURN_COMPARISON_UNIVERSE.test(evidence)
  )) {
    throw new Error("agent_response_superlative_scope_missing");
  }
  if (
    RETAIL_MARGIN_MEASURE.test(claimText) &&
    RETAIL_SEGMENT.test(claimText) &&
    MARGIN_TREND_CHANGE.test(claimText) &&
    RETAIL_MARGIN_UNIVERSE.test(sourceText) &&
    (!RETAIL_MARGIN_UNIVERSE.test(claimText) || !RETAIL_MARGIN_UNIVERSE.test(evidence))
  ) {
    throw new Error("agent_response_analytical_universe_missing");
  }
  if (BARE_DEICTIC_VALUE_OPENING.test(evidence)) {
    throw new Error("agent_response_deictic_value_context_missing");
  }
  const attribution = sourceAttributionBeforeEvidence(sourceText, evidence);
  if (attribution !== undefined && (
    !normalizedMaterialText(claimText).includes(normalizedMaterialText(attribution.actor)) ||
    !normalizedMaterialText(claimText).includes(normalizedMaterialText(attribution.verb)) ||
    !normalizedMaterialText(evidence).includes(normalizedMaterialText(attribution.actor)) ||
    !normalizedMaterialText(evidence).includes(normalizedMaterialText(attribution.verb))
  )) {
    throw new Error("agent_response_reported_result_attribution_missing");
  }
  if (
    WEBINAR_CONTEXT.test(sourceText) &&
    (GENERIC_EVENT_OPENING.test(claimText) || GENERIC_EVENT_OPENING.test(evidence)) &&
    (!NAMED_WEBINAR_IDENTITY.test(claimText) || !NAMED_WEBINAR_IDENTITY.test(evidence))
  ) {
    throw new Error("agent_response_event_identity_missing");
  }
}

function assertAuthorityLanguageIsSourceVisible(claimText: string, evidence: string): void {
  if (ACTOR_ATTRIBUTION.test(claimText) && !ACTOR_ATTRIBUTION.test(evidence)) {
    throw new Error("agent_response_actor_attribution_not_source_visible");
  }
  const evidenceSubjects = new Set(attributionSubjects(evidence));
  if (
    attributionSubjects(claimText).some((subject) => !evidenceSubjects.has(subject))
  ) {
    throw new Error("agent_response_actor_attribution_not_source_visible");
  }
  for (const term of AUTHORITY_TERMS) {
    if (term.test(claimText) && !term.test(evidence)) {
      throw new Error("agent_response_authority_overreach");
    }
  }
}

export function assertLibraryAnalysisClaimLocalityV111(input: {
  claimText: string;
  evidence: string;
  sourceText: string;
  unitType: string;
}): void {
  assertSelfContainedClaimText(input.claimText, input.evidence);
  assertAuditedScopeCompleteness(input.claimText, input.evidence, input.sourceText);
  assertPilot12ScopeCompleteness(input.claimText, input.evidence, input.sourceText);
  assertTabularEvidenceContext(input.evidence, input.unitType);
  assertAuthorityLanguageIsSourceVisible(input.claimText, input.evidence);
}

function assertTabularEvidenceContext(evidence: string, unitType: string): void {
  if (
    unitType === "sheet_range" &&
    DELIMITED_ROW.test(evidence) &&
    !evidence.includes("\n") &&
    !EXPLICIT_TABULAR_FIELDS.test(evidence)
  ) {
    throw new Error("agent_response_tabular_context_missing");
  }
}

export const LibraryAnalysisAgentSegmentResponseSchema = responseCoreSchema
  .extend({ responseHash: hashSchema })
  .superRefine((response, context) => {
    const coverageIds = response.unitCoverage.map(({ contentUnitId }) => contentUnitId);
    if (new Set(coverageIds).size !== coverageIds.length) {
      context.addIssue({ code: "custom", message: "duplicate_unit_coverage" });
    }
    const localOrdinals = response.claims.map(({ localOrdinal }) => localOrdinal);
    if (new Set(localOrdinals).size !== localOrdinals.length) {
      context.addIssue({ code: "custom", message: "duplicate_claim_local_ordinal" });
    }
    for (const coverage of response.unitCoverage) {
      if (coverage.status === "blocked" && coverage.reasonCode === undefined) {
        context.addIssue({ code: "custom", message: "blocked_reason_code_required" });
      }
      if (coverage.status !== "blocked" && (coverage.reason !== undefined || coverage.reasonCode !== undefined)) {
        context.addIssue({ code: "custom", message: "coverage_reason_not_allowed" });
      }
    }
    const claimUnitIds = new Set(response.claims.map(({ contentUnitId }) => contentUnitId));
    for (const coverage of response.unitCoverage) {
      if (coverage.status === "claims_extracted" && !claimUnitIds.has(coverage.contentUnitId)) {
        context.addIssue({ code: "custom", message: "claims_extracted_requires_claim" });
      }
    }
  });
export type LibraryAnalysisAgentSegmentResponse = z.infer<
  typeof LibraryAnalysisAgentSegmentResponseSchema
>;

export const LibraryAnalysisAcceptedClaimSchema = responseClaimSchema.extend({
  claimId: idSchema,
});
export type LibraryAnalysisAcceptedClaim = z.infer<typeof LibraryAnalysisAcceptedClaimSchema>;

export const LibraryAnalysisAcceptedSegmentSchema = responseCoreSchema
  .extend({
    segmentOrdinal: z.number().int().nonnegative().optional(),
    claims: z.array(LibraryAnalysisAcceptedClaimSchema),
    responseHash: hashSchema,
  });
export type LibraryAnalysisAcceptedSegment = z.infer<
  typeof LibraryAnalysisAcceptedSegmentSchema
>;

export const LIBRARY_ANALYSIS_AGENT_SOURCE_RESULT_SCHEMA =
  "library-analysis-source-result/v1" as const;

const terminalStateSchema = z.enum(["accepted", "partial", "failed", "quarantined"]);
export type LibraryAnalysisAgentTerminalState = z.infer<typeof terminalStateSchema>;

export function deriveLibraryAnalysisAgentTerminalState(
  segment: Pick<LibraryAnalysisTerminalSegment, "terminalState" | "status" | "unitCoverage">,
  fallback: "accepted" | "failed" = "accepted",
): LibraryAnalysisAgentTerminalState {
  if (segment.terminalState !== undefined && segment.status !== undefined && segment.terminalState !== segment.status) {
    throw new Error("source_merge_terminal_state_conflict");
  }
  return segment.terminalState ?? segment.status ?? (
    segment.unitCoverage.some((row) => row.status === "blocked") ? "partial" : fallback
  );
}

const attemptReceiptSchema = z.object({
  attempt: z.number().int().positive(),
  inputHash: hashSchema,
  responseHash: hashSchema,
  status: terminalStateSchema.optional(),
  terminalReason: textSchema.optional(),
  model: LibraryAnalysisAgentModelReceiptSchema,
}).strict();
export type LibraryAnalysisAgentAttemptReceipt = z.infer<typeof attemptReceiptSchema>;

const terminalSegmentExtensionSchema = z.object({
  terminalState: terminalStateSchema.optional(),
  status: terminalStateSchema.optional(),
  terminalReason: textSchema.optional(),
  attempts: z.array(attemptReceiptSchema).min(1).optional(),
}).strict();

/** Task 3 accepted segments are successful terminal segments by default. */
export const LibraryAnalysisTerminalSegmentSchema =
  LibraryAnalysisAcceptedSegmentSchema.and(terminalSegmentExtensionSchema);
export type LibraryAnalysisTerminalSegment = z.infer<
  typeof LibraryAnalysisTerminalSegmentSchema
>;

export const LibraryAnalysisSourceSegmentReceiptSchema = z.object({
  jobId: idSchema,
  segmentOrdinal: z.number().int().nonnegative(),
  jobHash: hashSchema,
  terminalState: terminalStateSchema,
  attempts: z.array(attemptReceiptSchema).min(1),
  model: LibraryAnalysisAgentModelReceiptSchema,
  attempt: z.number().int().positive(),
  inputHash: hashSchema,
  responseHash: hashSchema,
  terminalReason: textSchema.optional(),
}).strict();
export type LibraryAnalysisSourceSegmentReceipt = z.infer<
  typeof LibraryAnalysisSourceSegmentReceiptSchema
>;

export const LibraryAnalysisSourceResultSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_SOURCE_RESULT_SCHEMA),
  queueHash: hashSchema,
  sourceEnvelopeHash: hashSchema,
  unitCoverage: z.array(LibraryAnalysisAgentCoverageSchema),
  claims: z.array(LibraryAnalysisAcceptedClaimSchema),
  segments: z.array(LibraryAnalysisSourceSegmentReceiptSchema),
  analysisState: z.enum(["complete", "partial", "failed", "quarantined"]),
  sourceResultHash: hashSchema,
}).strict();
export type LibraryAnalysisSourceResult = z.infer<typeof LibraryAnalysisSourceResultSchema>;

export function verifyLibraryAnalysisSourceResult(raw: unknown): LibraryAnalysisSourceResult {
  const parsed = LibraryAnalysisSourceResultSchema.parse(raw);
  const { sourceResultHash: _hash, ...core } = parsed;
  if (parsed.sourceResultHash !== candidateAnalysisSha256(
    "library-analysis-source-result",
    core as unknown as CandidateJsonValue,
  )) {
    throw new Error("source_result_hash_mismatch");
  }
  return parsed;
}

const queueJobSchema = z.object({
  jobId: idSchema,
  sourceKind: idSchema,
  sourceKey: textSchema,
  segmentOrdinal: z.number().int().nonnegative(),
  unitIds: z.array(idSchema).min(1),
  unitOrdinalStart: z.number().int().nonnegative(),
  unitOrdinalEnd: z.number().int().nonnegative(),
  codePoints: z.number().int().positive(),
  bytes: z.number().int().positive(),
  inputEnvelopeHash: hashSchema,
}).strict();

const attemptUnitSchema = z.object({
  id: idSchema,
  sourceKind: idSchema,
  sourceKey: idSchema,
  populationSourceKey: textSchema,
  sourceVersionHash: hashSchema,
  unitType: z.string().min(1),
  ordinal: z.number().int().nonnegative(),
  locator: textSchema,
  locatorHash: hashSchema,
  contentHash: hashSchema,
  hashAlgorithm: z.literal("sha256"),
  identityConfidence: z.string().min(1),
  chunkPolicyHash: hashSchema,
  portablePath: textSchema,
  sizeBytes: z.number().int().positive(),
  codePoints: z.number().int().positive(),
  text: textSchema,
}).strict();

const fileBindingSchema = z.object({
  id: idSchema,
  version: textSchema,
  path: textSchema,
  hash: hashSchema,
}).strict();

export const LibraryAnalysisAgentAttemptInputSchema = z.object({
  schema: z.literal("library-analysis-agent-job-input/v1"),
  queueId: idSchema,
  queueHash: hashSchema,
  jobId: idSchema,
  attempt: z.number().int().positive(),
  expectedModel: LibraryAnalysisAgentModelReceiptSchema,
  job: queueJobSchema,
  executionPolicy: z.record(z.string(), z.unknown()),
  workflow: fileBindingSchema,
  analysisPrompt: fileBindingSchema,
  validationWorkflow: fileBindingSchema,
  validationPrompt: fileBindingSchema,
  units: z.array(attemptUnitSchema).min(1),
  inputHash: hashSchema,
}).strict();
export type LibraryAnalysisAgentAttemptInput = z.infer<
  typeof LibraryAnalysisAgentAttemptInputSchema
>;

export type LibraryAnalysisAgentSegmentResponseValidationInput = {
  queueHash: string;
  attempt: number;
  inputHash: string;
  expectedModel: LibraryAnalysisAgentModelReceipt;
  job: LibraryAnalysisVerifiedJob;
  response: unknown;
};

export function libraryAnalysisAgentSegmentResponseHash(response: unknown): string {
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("agent_response_shape_invalid");
  }
  const { responseHash: _responseHash, ...core } = response as Record<string, unknown>;
  return candidateAnalysisSha256(
    "library-analysis-agent-segment-response",
    core as CandidateJsonValue,
  );
}

export function validateLibraryAnalysisAgentSegmentResponse(
  input: LibraryAnalysisAgentSegmentResponseValidationInput,
): LibraryAnalysisAcceptedSegment {
  const expectedModel = LibraryAnalysisAgentModelReceiptSchema.parse(input.expectedModel);
  if (!HASH.test(input.queueHash)) throw new Error("agent_response_queue_hash_invalid");
  if (!Number.isInteger(input.attempt) || input.attempt < 1) throw new Error("agent_response_attempt_invalid");
  if (!HASH.test(input.inputHash)) throw new Error("agent_response_input_hash_invalid");
  const response = LibraryAnalysisAgentSegmentResponseSchema.parse(input.response);
  if (response.responseHash !== libraryAnalysisAgentSegmentResponseHash(response)) {
    throw new Error("agent_response_response_hash_mismatch");
  }
  if (
    response.queueHash !== input.queueHash ||
    response.jobId !== input.job.job.jobId ||
    response.jobHash !== input.job.job.inputEnvelopeHash ||
    response.attempt !== input.attempt ||
    response.inputHash !== input.inputHash
  ) {
    throw new Error("agent_response_job_binding_mismatch");
  }
  if (
    response.model.provider !== expectedModel.provider ||
    response.model.name !== expectedModel.name ||
    response.model.version !== expectedModel.version
  ) {
    throw new Error("agent_response_model_receipt_mismatch");
  }
  assertExactCoverage(input.job, response.unitCoverage);
  const coverageByUnit = new Map(response.unitCoverage.map((coverage) => [coverage.contentUnitId, coverage]));
  const claims = response.claims.map((claim) => {
    const unit = ownedUnit(input.job, claim.contentUnitId);
    const coverage = coverageByUnit.get(claim.contentUnitId);
    if (coverage?.status !== "claims_extracted") {
      throw new Error("agent_response_claim_coverage_mismatch");
    }
    if (claim.locator !== unit.descriptor.locator) {
      throw new Error("agent_response_locator_ownership_mismatch");
    }
    if (!unit.text.includes(claim.evidence)) {
      throw new Error("agent_response_evidence_not_contained");
    }
    assertLibraryAnalysisClaimLocalityV111({
      claimText: claim.text,
      evidence: claim.evidence,
      sourceText: unit.text,
      unitType: unit.descriptor.unitType,
    });
    assertNumericTokens(claim.text, claim.evidence);
    return {
      ...claim,
      claimId: deterministicLibraryAnalysisAgentClaimId(input.job.job, claim),
    };
  });
  return LibraryAnalysisAcceptedSegmentSchema.parse({
    ...response,
    segmentOrdinal: input.job.job.segmentOrdinal,
    claims,
  });
}

export function mergeLibraryAnalysisSourceSegments(input: {
  queueHash: string;
  source: LibraryAnalysisAgentQueueSource;
  segments: readonly LibraryAnalysisTerminalSegment[];
  expectedJobs?: readonly LibraryAnalysisAgentQueueJob[];
  jobs?: readonly LibraryAnalysisAgentQueueJob[];
}): LibraryAnalysisSourceResult {
  if (!HASH.test(input.queueHash)) throw new Error("source_merge_queue_hash_invalid");
  if (!HASH.test(input.source.sourceEnvelopeHash)) throw new Error("source_merge_source_hash_invalid");
  const sourceUnitIds = input.source.unitIds;
  const sourceCore = {
    sourceKind: input.source.sourceKind,
    sourceKey: input.source.sourceKey,
    sourceVersionHash: input.source.sourceVersionHash,
    unitIds: input.source.unitIds,
    unitCount: input.source.unitCount,
    codePoints: input.source.codePoints,
    bytes: input.source.bytes,
  };
  if (input.source.sourceEnvelopeHash !== candidateAnalysisSha256("library-analysis-agent-source", sourceCore)) {
    throw new Error("source_merge_source_hash_mismatch");
  }
  if (
    sourceUnitIds.length !== input.source.unitCount ||
    new Set(sourceUnitIds).size !== sourceUnitIds.length ||
    input.segments.length === 0
  ) {
    throw new Error("source_merge_coverage_mismatch");
  }
  const expectedJobs = [...(input.expectedJobs ?? input.jobs ?? [])];
  if (expectedJobs.length === 0 || new Set(expectedJobs.map((job) => job.jobId)).size !== expectedJobs.length) {
    throw new Error("source_merge_job_set_mismatch");
  }
  const expectedById = new Map(expectedJobs.map((job) => [job.jobId, job]));
  const expectedUnitIds = new Set(expectedJobs.flatMap((job) => job.unitIds));
  if (
    expectedUnitIds.size !== sourceUnitIds.length ||
    sourceUnitIds.some((id) => !expectedUnitIds.has(id)) ||
    expectedJobs.some((job) =>
      job.sourceKind !== input.source.sourceKind ||
      job.sourceKey !== input.source.sourceKey ||
      job.unitIds.some((id) => !sourceUnitIds.includes(id)))
  ) {
    throw new Error("source_merge_job_set_mismatch");
  }

  const segments = input.segments.map((raw) => LibraryAnalysisTerminalSegmentSchema.parse(raw));
  if (
    segments.length !== expectedJobs.length ||
    new Set(segments.map((segment) => segment.jobId)).size !== segments.length
  ) {
    throw new Error("source_merge_job_set_mismatch");
  }
  const covered = new Set<string>();
  const coverageRows: LibraryAnalysisAgentCoverage[] = [];
  for (const segment of segments) {
    const expectedJob = expectedById.get(segment.jobId);
    if (
      expectedJob === undefined ||
      segment.segmentOrdinal !== expectedJob.segmentOrdinal ||
      segment.jobHash !== expectedJob.inputEnvelopeHash
    ) {
      throw new Error("source_merge_job_set_mismatch");
    }
    if (segment.queueHash !== input.queueHash) throw new Error("source_merge_queue_hash_mismatch");
    const coverageIds = segment.unitCoverage.map((coverage) => coverage.contentUnitId);
    if (
      coverageIds.length !== expectedJob.unitIds.length ||
      coverageIds.some((id, index) => id !== expectedJob.unitIds[index])
    ) {
      throw new Error("source_merge_job_unit_coverage_mismatch");
    }
    assertUniqueAttemptReceipts(segment);
    for (const coverage of segment.unitCoverage) {
      if (!sourceUnitIds.includes(coverage.contentUnitId) || covered.has(coverage.contentUnitId)) {
        throw new Error("source_merge_coverage_mismatch");
      }
      covered.add(coverage.contentUnitId);
      coverageRows.push(coverage);
    }
    for (const claim of segment.claims) {
      const coverage = segment.unitCoverage.find((row) => row.contentUnitId === claim.contentUnitId);
      if (coverage?.status !== "claims_extracted") {
        throw new Error("source_merge_claim_coverage_mismatch");
      }
    }
    for (const coverage of segment.unitCoverage) {
      if (
        coverage.status === "claims_extracted" &&
        !segment.claims.some((claim) => claim.contentUnitId === coverage.contentUnitId)
      ) {
        throw new Error("source_merge_claim_coverage_mismatch");
      }
    }
  }
  if (covered.size !== sourceUnitIds.length || sourceUnitIds.some((id) => !covered.has(id))) {
    throw new Error("source_merge_coverage_mismatch");
  }

  const sortedSegments = [...segments].sort(compareSegments);
  const sortedCoverage = sourceUnitIds.map((id) => {
    const row = coverageRows.find((candidate) => candidate.contentUnitId === id);
    if (row === undefined) throw new Error("source_merge_coverage_mismatch");
    return row;
  });
  const claims = deduplicateAcceptedClaims(sortedSegments.flatMap((segment) => segment.claims));
  const segmentReceipts = sortedSegments.map(segmentReceipt);
  const analysisState = deriveSourceAnalysisState(sortedSegments);
  const core = {
    schema: LIBRARY_ANALYSIS_AGENT_SOURCE_RESULT_SCHEMA,
    queueHash: input.queueHash,
    sourceEnvelopeHash: input.source.sourceEnvelopeHash,
    unitCoverage: sortedCoverage,
    claims,
    segments: segmentReceipts,
    analysisState,
  } satisfies Omit<LibraryAnalysisSourceResult, "sourceResultHash">;
  return LibraryAnalysisSourceResultSchema.parse({
    ...core,
    sourceResultHash: candidateAnalysisSha256(
      "library-analysis-source-result",
      core as unknown as CandidateJsonValue,
    ),
  });
}

function compareSegments(
  left: LibraryAnalysisTerminalSegment,
  right: LibraryAnalysisTerminalSegment,
): number {
  return (left.segmentOrdinal ?? Number.MAX_SAFE_INTEGER) -
    (right.segmentOrdinal ?? Number.MAX_SAFE_INTEGER) ||
    compareCandidateJsonKeysUtf8(left.jobId, right.jobId);
}

function segmentReceipt(
  segment: LibraryAnalysisTerminalSegment,
): LibraryAnalysisSourceSegmentReceipt {
  const defaultAttempt: LibraryAnalysisAgentAttemptReceipt = {
    attempt: segment.attempt,
    inputHash: segment.inputHash,
    responseHash: segment.responseHash,
    model: segment.model,
  };
  const terminalState = deriveLibraryAnalysisAgentTerminalState(segment);
  defaultAttempt.status = terminalState;
  if (segment.terminalReason !== undefined) defaultAttempt.terminalReason = segment.terminalReason;
  const attempts = segment.attempts ?? [defaultAttempt];
  const normalizedAttempts = [...attempts]
    .map((attempt) => attempt.terminalReason === undefined && attempt.status === undefined
      ? {
        attempt: attempt.attempt,
        inputHash: attempt.inputHash,
        responseHash: attempt.responseHash,
        model: attempt.model,
      }
      : {
        ...attempt,
        ...(attempt.status === undefined ? {} : { status: attempt.status }),
        ...(attempt.terminalReason === undefined ? {} : { terminalReason: attempt.terminalReason }),
      })
    .sort((left, right) => left.attempt - right.attempt);
  return LibraryAnalysisSourceSegmentReceiptSchema.parse({
    jobId: segment.jobId,
    segmentOrdinal: segment.segmentOrdinal ?? 0,
    jobHash: segment.jobHash,
    terminalState,
    attempts: normalizedAttempts,
    model: segment.model,
    attempt: segment.attempt,
    inputHash: segment.inputHash,
    responseHash: segment.responseHash,
    ...(segment.terminalReason === undefined ? {} : { terminalReason: segment.terminalReason }),
  });
}

function assertUniqueAttemptReceipts(segment: LibraryAnalysisTerminalSegment): void {
  const attempts = segment.attempts ?? [{
    attempt: segment.attempt,
    inputHash: segment.inputHash,
    responseHash: segment.responseHash,
    model: segment.model,
  }];
  if (new Set(attempts.map((receipt) => receipt.attempt)).size !== attempts.length) {
    throw new Error("source_merge_attempt_duplicate");
  }
}

function deriveSourceAnalysisState(
  segments: readonly LibraryAnalysisTerminalSegment[],
): LibraryAnalysisSourceResult["analysisState"] {
  const states = segments.map((segment) => deriveLibraryAnalysisAgentTerminalState(segment));
  if (states.includes("quarantined")) return "quarantined";
  if (states.includes("failed")) return "failed";
  if (states.includes("partial")) return "partial";
  return "complete";
}

function deduplicateAcceptedClaims(
  claims: readonly LibraryAnalysisAcceptedClaim[],
): LibraryAnalysisAcceptedClaim[] {
  const sorted = [...claims].sort((left, right) => {
    const leftTuple = claimTuple(left);
    const rightTuple = claimTuple(right);
    return compareCandidateJsonKeysUtf8(leftTuple, rightTuple) ||
      compareCandidateJsonKeysUtf8(left.claimId, right.claimId);
  });
  const seen = new Set<string>();
  const result: LibraryAnalysisAcceptedClaim[] = [];
  for (const claim of sorted) {
    const tuple = claimTuple(claim);
    if (seen.has(tuple)) continue;
    seen.add(tuple);
    result.push(claim);
  }
  return result;
}

function claimTuple(claim: LibraryAnalysisAcceptedClaim): string {
  const { claimId: _claimId, ...tuple } = claim;
  return canonicalCandidateJson(tuple as unknown as CandidateJsonValue);
}

export function deterministicLibraryAnalysisAgentClaimId(
  job: LibraryAnalysisAgentQueueJob,
  claim: { contentUnitId: string; localOrdinal: number },
): string {
  const digest = candidateAnalysisSha256("library-analysis-agent-claim", {
    jobId: job.jobId,
    jobHash: job.inputEnvelopeHash,
    sourceKind: job.sourceKind,
    sourceKey: job.sourceKey,
    contentUnitId: claim.contentUnitId,
    localOrdinal: claim.localOrdinal,
  });
  return `claim:library-agent:${digest}`;
}

export const deterministicClaimId = deterministicLibraryAnalysisAgentClaimId;

function assertExactCoverage(
  job: LibraryAnalysisVerifiedJob,
  coverage: readonly z.infer<typeof coverageSchema>[],
): void {
  const expected = job.units.map(({ descriptor }) => descriptor.id);
  const actual = coverage.map(({ contentUnitId }) => contentUnitId);
  if (
    actual.length !== expected.length ||
    new Set(actual).size !== actual.length ||
    expected.some((id) => !actual.includes(id))
  ) {
    throw new Error("agent_response_unit_coverage_mismatch");
  }
}

function ownedUnit(
  job: LibraryAnalysisVerifiedJob,
  contentUnitId: string,
): LibraryAnalysisVerifiedJob["units"][number] {
  const unit = job.units.find(({ descriptor }) => descriptor.id === contentUnitId);
  if (unit === undefined) throw new Error("agent_response_content_unit_ownership_mismatch");
  return unit;
}

type NumericToken = {
  value: string;
  sign: "negative" | "positive" | "unsigned";
  marker: string;
};

function assertNumericTokens(claimText: string, evidence: string): void {
  const claimed = numericTokens(claimText);
  const available = numericTokens(evidence);
  const remaining = [...available];
  for (const token of claimed) {
    const index = remaining.findIndex((candidate) =>
      candidate.value === token.value &&
      candidate.sign === token.sign &&
      candidate.marker === token.marker);
    if (index < 0) throw new Error("agent_response_numeric_token_mismatch");
    remaining.splice(index, 1);
  }
}

function numericTokens(text: string): NumericToken[] {
  const tokens: NumericToken[] = [];
  const pattern = /[+\-−]?(?:\d{1,3}(?:[\s,]\d{3})+|\d+)(?:[.,]\d+)?/gu;
  for (const match of text.matchAll(pattern)) {
    const raw = match[0]!;
    const start = match.index ?? 0;
    const before = text.slice(Math.max(0, start - 8), start);
    const after = text.slice(start + raw.length, Math.min(text.length, start + raw.length + 12));
    const sign = raw.startsWith("-") || raw.startsWith("−")
      ? "negative"
      : raw.startsWith("+") ? "positive" : "unsigned";
    const marker = /^(?:\s*)(?:%|percent(?:age)?|prosent)\b/iu.test(after) ||
      /^(?:%)/u.test(after)
      ? "percent"
      : currencyMarker(before, after) ?? "none";
    tokens.push({ value: normalizeNumber(raw), sign, marker });
  }
  return tokens;
}

function currencyMarker(before: string, after: string): string | null {
  const prefix = /(?:[$€£]|kr|nok|usd|eur|gbp)\s*$/iu.exec(before)?.[0];
  if (prefix !== undefined) return normalizeCurrencyMarker(prefix);
  const suffix = /^\s*(?:kr|nok|usd|eur|gbp)\b/iu.exec(after)?.[0];
  return suffix === undefined ? null : normalizeCurrencyMarker(suffix);
}

function normalizeCurrencyMarker(raw: string): string {
  const normalized = raw.trim().toUpperCase();
  if (normalized === "€") return "currency:EUR";
  if (normalized === "$") return "currency:USD";
  if (normalized === "£") return "currency:GBP";
  if (normalized === "KR") return "currency:KR";
  return `currency:${normalized}`;
}

function normalizeNumber(raw: string): string {
  const unsigned = raw.replace(/^[+\-−]/u, "").replaceAll(" ", "");
  if (unsigned.includes(",") && unsigned.includes(".")) {
    return unsigned.replaceAll(",", "");
  }
  if (unsigned.includes(",")) {
    const [whole, fraction] = unsigned.split(",");
    return fraction !== undefined && fraction.length === 3
      ? `${whole}${fraction}`
      : `${whole}.${fraction ?? ""}`;
  }
  return unsigned;
}

export function canonicalLibraryAnalysisAgentSegmentResponse(
  response: LibraryAnalysisAgentSegmentResponse,
): string {
  return canonicalCandidateJson(response as unknown as CandidateJsonValue);
}
