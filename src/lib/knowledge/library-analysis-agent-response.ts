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

// Exact worker identities only: each provider literal binds its own model
// literal so a response can never claim a foreign or invented identity.
export const LibraryAnalysisAgentModelReceiptSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("openai-codex"),
    name: z.literal("gpt-5.6-luna"),
    version: textSchema,
  }).strict(),
  z.object({
    provider: z.literal("anthropic-claude-code"),
    name: z.literal("claude-fable-5"),
    version: textSchema,
  }).strict(),
]);
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
const UNRESOLVED_GENERIC_REFERENCE = /\b(?:oppryddingen(?!\s+(?:av|i|for)\b)|arbeidet(?!\s+(?:med|for|av)\b)|metoden(?!\s+(?:for|til|med)\b)|tilnærmingen(?!\s+(?:for|til|med|fokuserer\s+på)\b)|kartleggingen(?!\s+(?:av|for|i)\b)|kartleggingene|resultatet(?!\s+(?:av|fra|for|i)\b)|resultatene(?!\s+(?:av|fra|for|i)\b)|the\s+cleanup(?!\s+(?:of|in|for)\b)|the\s+work(?!\s+(?:on|for|of)\b)|the\s+method(?!\s+(?:for|of|to|using)\b)|the\s+approach(?!\s+(?:for|to|using|focuses\s+on)\b)|the\s+mapping(?!\s+(?:of|for)\b)|the\s+results?(?!\s+(?:of|from|for|in)\b))\b/iu;
const BARE_DATA_REFERENCE = /^(?:data(?:ene)?|datagrunnlaget|the\s+data(?:\s+basis)?)(?!\s+(?:for|fra|om|i|til|basert\s+på|brukt\s+av|from|about|in|to|based\s+on|used\s+by)\b)\b/iu;
const UNRESOLVED_GENERIC_METHOD_OPENING = /^(?:(?:(?:an?|the|our|this)\s+)?(?:approach(?:es)?|methods?|methodolog(?:y|ies))(?!\s+(?:for|of|to|using|on)\b)|(?:(?:en|et|vår|denne)\s+)?(?:tilnærming(?:en|er|ene)?|metod(?:e|en|er|ene))(?!(?:\s+(?:for|til|med|av)\b|\s+fokuserer\s+på(?=\s|[.,;:]|$))))\b/iu;
const BARE_APPENDIX_REFERENCE = /^(?:i\s+dette\s+vedlegget|in\s+this\s+appendix)\b/iu;
const UNNAMED_AUTHORITY_ANALYSIS = /(?:\btilsynets\s+(?:(?:analyser|analyse)\b(?!\s+(?:av|om|for|i|fra|basert\s+på)(?:\s|$))|datagrunnlag\b)|\bthe\s+authority['’]s\s+(?:(?:analyses|analysis)\b(?!\s+(?:of|on|for|in|from|based\s+on)\b)|data\s+basis\b))/iu;
const NAMED_AUTHORITY = /\b(?:Konkurransetilsynet(?:s)?|Norwegian\s+Competition\s+Authority|Competition\s+and\s+Markets\s+Authority|CMA)\b/iu;
const BARE_SAMPLE_REFERENCE = /(?:\butvalget(?!\s+(?:av|på|med|bestående\s+av)(?:\s|$))|\bthe\s+sample(?!\s+(?:of|with|comprising)\b))/iu;
const BARE_INFORMATION_REFERENCE = /(?:\bmye\s+av\s+informasjonen(?!\s+(?:om|for|fra|i)\b)|\bmuch\s+of\s+the\s+information(?!\s+(?:about|for|from|in)\b))/iu;
const BARE_SIMILAR_ANALYSIS = /(?:\blignende\s+analyser(?!\s+(?:av|om|for|i|fra|basert\s+på)(?:\s|$))|\bsimilar\s+analyses(?!\s+(?:of|on|for|in|from|based\s+on)\b))/iu;
const BARE_ANALYSIS_REFERENCE = /(?:\banalysen(?!\s+(?:av|om|for|i|fra|basert\s+på)(?:\s|$))|\bthe\s+analysis(?!\s+(?:of|on|for|in|from|based\s+on)\b))/iu;
const EXPLICIT_LOCAL_ANALYSIS_CONTEXT = /\b(?:denne\s+analysen|this\s+analysis)\b/iu;
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
const OWNERSHIP_OR_CONTROL = /\b(?:eier|eid\s+av|kontrolleres\s+av|aksjonær|shareholder|owns?|owned\s+by|controlled\s+by)\b/iu;
const QUANTIFIED_MARKET_SHARE = /(?:\b\d+(?:[.,]\d+)?\s*(?:%|percent|prosent)[\s\S]{0,80}\b(?:markedsandel|market\s+share)\b|\b(?:markedsandel|market\s+share)\b[\s\S]{0,80}\b\d+(?:[.,]\d+)?\s*(?:%|percent|prosent))/iu;
const REPORT_TITLE_CLAIM = /\b(?:the\s+report\s+is\s+titled|rapporten\s+(?:har\s+tittelen|heter))\b/iu;
const REPORT_TITLE_CONTEXT = /\b(?:report\s+title|title\s+of\s+the\s+report|the\s+report\s+is\s+titled|rapporttittel|rapportens\s+tittel|rapporten\s+(?:har\s+tittelen|heter))\b/iu;
const ANALYTICAL_ACTION = /\b(?:har\s+(?:beregnet|kartlagt)|(?:ble|er)\s+(?:beregnet|kartlagt)|beregner|beregnet|kartlegger|kartla|estimerer|estimerte|has\s+(?:calculated|mapped|estimated)|(?:was|were)\s+(?:calculated|mapped|estimated)|calculates?|mapped|maps?|estimates?|estimated)\b/iu;
const ANALYTICAL_OUTCOME = /\b(?:avkastning|RNOA|lønnsomhet|driftsmarginer?|operating\s+margins?|returns?|profitability)\b/iu;
const ANALYTICAL_BASIS = /\b(?:basert\s+på|med\s+utgangspunkt\s+i|på\s+grunnlag\s+av|ved\s+hjelp\s+av|regnskapstall|regnskapsdata|årsrapporter?|årsregnskap|(?:årlige\s+)?resultat-\s*og\s+balanseoppstillinger|etter\s+(?:den\s+)?(?:[\p{L}\p{M}-]+)?metoden(?:\s+beskrevet)?\s+i\s+kapittel\s+\d+|based\s+on|using\s+(?:financial\s+statements?|accounts?|accounting\s+data|annual\s+reports?)|financial\s+statements?|annual\s+reports?|income\s+statements?\s+and\s+balance\s+sheets?)\b/iu;
const PILOT13_ANALYTICAL_ACTION = /\b(?:viser|finner|fant|kartlagt|shows?|finds?|found|mapped)\b/iu;
const PILOT13_ANALYTICAL_OUTCOME = /\b(?:avkastning(?:en)?|RNOA|lønnsomhet(?:en)?|lønnsomt|profitab(?:le|ility)|driftsmargin(?:en|er|ene)?|bruttomargin(?:en|er|ene)?|operating\s+margins?|gross\s+margins?|returns?)\b/iu;
const PILOT13_ANALYTICAL_TREND = /(?<![\p{L}\p{N}_])(?:økte|steg|falt|increased|rose|fell|decreased)(?![\p{L}\p{N}_])/iu;
const ANALYTICAL_DEFINITION = /\b(?:måler|måles|definerer|defineres|measures?|is\s+defined|are\s+defined)\b/iu;
const ANALYTICAL_NO_SUPPORT = /\b(?:finner(?:\s+(?:med\s+andre\s+ord|derfor))?\s+ikke\s+støtte\s+for|finds?(?:\s+(?:therefore|in\s+other\s+words))?\s+no\s+support\s+for)\b/iu;
const CURRENT_STATUS_REFERENCE = /(?<![\p{L}\p{N}_])(?:i\s+dag|today|nå|now)(?![\p{L}\p{N}_])/iu;
const CURRENT_STATUS_PREDICATE = /(?<![\p{L}\p{N}_])(?:finnes|har|er|foreligger|utvikles|utviklet|exists?|there\s+(?:is|are)|has|have|developed|being\s+developed)(?![\p{L}\p{N}_])/iu;
const INVENTORY_STATUS_MARKER = /\b(?:eksisterende|gjenværende|existing|remaining)\b/iu;
const INVENTORY_STATUS_ACTION = /\b(?:kartlegger|kartla|lister|listet|viser|viste|inneholder|inneholdt|maps?|mapped|lists?|listed|shows?|showed|contains?|contained)\b/iu;
const INVENTORY_STATUS_OBJECT = /\b(?:datafiler?|filer?|datasett(?:et)?|grenser?|artefakter?|poster|files?|datasets?|boundaries|artifacts?|records?)\b/iu;
const COMPARATIVE_RETAIL_COST = /\b(?:lavprisbutikker|supermarkeder|nærbutikker|discount\s+stores?|supermarkets?|convenience\s+stores?|grocery\s+(?:stores?|retailers?))\b[^.!?]{0,160}\b(?:lavere|høyere|lower|higher)\s+(?:kostnader?|costs?)\b[^.!?]{0,100}\b(?:enn|than)\b|\b(?:lavere|høyere|lower|higher)\s+(?:kostnader?|costs?)\b[^.!?]{0,100}\b(?:enn|than)\b[^.!?]{0,160}\b(?:lavprisbutikker|supermarkeder|nærbutikker|discount\s+stores?|supermarkets?|convenience\s+stores?|grocery\s+(?:stores?|retailers?))\b/iu;
const EMPIRICAL_GENERALIZER = /\b(?:generelt|generally|typically|often|ofte)\b/iu;
const QUANTIFIED_RESOURCE_SHARE = /\b\d+(?:[.,]\d+)?\s*(?:[-–—]\s*\d+(?:[.,]\d+)?\s*)?(?:%|prosent|percent)(?![\p{L}\p{N}_])[^.!?]{0,120}\b(?:dekker|utgjør|omfatter|covers?|accounts?\s+for)\b[^.!?]{0,100}\b(?:ressursbruken|ressursbruk|resource\s+use)\b|\b(?:dekker|utgjør|omfatter|covers?|accounts?\s+for)\b[^.!?]{0,100}\b\d+(?:[.,]\d+)?\s*(?:[-–—]\s*\d+(?:[.,]\d+)?\s*)?(?:%|prosent|percent)(?![\p{L}\p{N}_])[^.!?]{0,100}\b(?:ressursbruken|ressursbruk|resource\s+use)\b/iu;
const RESOURCE_SHARE_BASIS = /\b(?:basert\s+på|med\s+utgangspunkt\s+i|på\s+grunnlag\s+av|regnskapsdata|regnskapstall|based\s+on|using\s+(?:accounting\s+data|financial\s+statements?|accounts?))\b/iu;
const ARTIFACT_RETENTION_STATUS = /\b(?:behold(?:es|t)|retained|kept|remains?)\b[\s\S]{0,100}\b(?:PDF(?:-ene|-en)?|files?|filer?|exports?|ekspor(?:ter|t)|markdown\s+extract|markdown-ekstrakt|artefacts?|artefakter?)\b|\b(?:PDF(?:-ene|-en)?|files?|filer?|exports?|ekspor(?:ter|t)|markdown\s+extract|markdown-ekstrakt|artefacts?|artefakter?)\b[\s\S]{0,100}\b(?:behold(?:es|t)|retained|kept|remains?)\b/iu;
const NAMED_MAPPING_METHOD = /\b(?:Konkurransetilsynet(?:s)?|Norwegian\s+Competition\s+Authority|RE:Source)\s+(?:kartlegging(?:en)?|mapping)\b|\b(?:kartlegging(?:en)?|mapping)\b[^.!?]{0,80}\b(?:Konkurransetilsynet(?:s)?|Norwegian\s+Competition\s+Authority|RE:Source)\b|\b(?:metoden|method)\s+(?:for|of|til|to)\s+[^.!?]*?\b(?:kartlegging|mapping)\b/iu;
const EXPLICIT_MAPPING_OBJECT = /\b(?:[\p{L}\p{M}-]+kartlegging(?:en|er|ene)?|resource[- ]mapping(?:s)?|material[- ]flow[- ]mapping(?:s)?|mapping\s+(?:of|for)\s+[\p{L}\p{M}\p{N}-]+|kartlegging(?:en|er|ene)?\s+(?:av|for|i)\s+[\p{L}\p{M}\p{N}-]+|[\p{L}\p{M}-]+kartleggingsmetoden|[\p{L}\p{M}-]+\s+mapping\s+method)\b/iu;
const NOMINAL_QUANTIFIER_FRAGMENT = /^(?:få|et\s+lite\s+antall|many|several)\s+[\p{L}\p{M}\d][^.!?]*$/iu;
const PARTICIPIAL_SURVEY_EVIDENCE = /^(?:conducted|gathering|collected|responding|gjennomført|samlet|innsamlet|utført)\b/iu;
const DEFINITE_SURVEY_REFERENCE = /\b(?:(?:the|this(?:\s+new)?|den|denne)\s+(?:survey|questionnaire|undersøkelsen|spørreskjema(?:et)?))\b/iu;
const CONDITIONAL_PROFITABILITY_OUTCOME = /\b(?:kan|may|could|might)\b[^.!?]{0,360}(?:økt\s+lønnsomhet|increased\s+profitability)\b/iu;
const PROFITABILITY_MECHANISM = /\b(?:føre|bidra)\s+til\s+økt\s+lønnsomhet\b|\b(?:lead|contribute)\s+to\s+increased\s+profitability\b/iu;
const PLURAL_ACTOR_PRONOUN = /\b(?:de\s+har\s+hatt|they\s+have\s+had)\b/iu;
const PLURAL_ACTOR_ANTECEDENT = /\b(?:kommun(?:e|en|er|ene)|selskaper?|bedrifter|aktører|grupper|respondenter|produsenter|companies|municipalit(?:y|ies)|actors?|groups?|respondents?|producers?)\b|\b[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*){0,4}\s+(?:og|and)\s+[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*){0,4}\b/u;
const LOCAL_HERE_DEFINITION = /\b(?:defineres|beregnes|fastsettes|defined|calculated|determined)\s+(?:her|here)\b/iu;
const NAMED_LOCAL_CONTEXT = /\b(?:VTB|NOA|value\s+to\s+business|netto\s+driftsrelaterte\s+eiendeler|(?:i|in)\s+(?:dette|this)\s+[\p{L}\p{M}-]*(?:vedlegg|appendix))\b/iu;
const INTERPRETIVE_INDEX_VALUE = /\b(?:indeksverdi(?:en)?|index\s+value)\b[\s\S]{0,100}\b(?:høyere|lavere|betyr|tolkes|means?|higher|lower|interpreted)\b|\b(?:høyere|lavere|higher|lower)\b[\s\S]{0,100}\b(?:indeksverdi(?:en)?|index\s+value)\b/iu;
const NAMED_INDEX_IDENTITY = /\b(?:[A-ZÆØÅ]\s*-\s*\d{1,4}|importveid(?:e)?\s+(?:kronekursmål|kursindeks)|valutakursindeks|byggekostnadsindeks|prisindeks|kursindeks|price\s+index|exchange-rate\s+index|import-weighted\s+(?:exchange-rate\s+)?index|(?:Norges|Norway(?:'s)?|EU(?:s)?|European)\s+indeksverdi)\b/iu;
const STAFFING_ALLOCATION_CHANGE = /\b(?:(?:opprinnelig|originally)\b[\s\S]{0,100}\b(?:redusert|økt|reduced|increased)\b|(?:redusert|økt|reduced|increased)\s+(?:fra|from)\b[\s\S]{0,80}\b(?:til|to)\b)[\s\S]{0,80}\d+(?:[.,]\d+)?\s*%/iu;
const NAMED_PROJECT_SCOPE = /\b(?:[Ff]or|[Tt]il|[Ii]|[Oo]n|[Tt]o|[Ff]or\s+the)\s+(?:the\s+)?(?:[A-ZÆØÅ]{2,}[A-ZÆØÅ0-9&:+-]*|[A-ZÆØÅ][\p{L}\p{M}\p{N}&:+-]*(?:\s+[A-ZÆØÅ][\p{L}\p{M}\p{N}&:+-]*){1,8})\b/u;
const DESCRIPTIVE_NAMED_PROJECT_SCOPE = /\b(?:[Ff]or|[Tt]il|[Ii]|[Oo]n|[Tt]o)\s+(?:the\s+)?[A-ZÆØÅ][\p{L}\p{M}\p{N}&:+-]*(?:\s+[\p{L}\p{M}\p{N}&:+-]+){0,7}\s+(?:groups?|projects?|applications?|meetings?|grupp(?:e|en|er)|prosjekt(?:et|er)?|søknad(?:en|er)?|møte(?:t|r)?)\b/giu;
const SALES_AMOUNT = /\b\d+(?:[.,]\d+)?\s*(?:milliarder?|millioner?|billions?|millions?)\s+(?:euros?|EUR|kroner|NOK|dollars?|USD)\b/iu;
const PERCENT_VALUE = /\b\d+(?:[.,]\d+)?\s*(?:%(?![\p{L}\p{N}_])|prosent\b|percent\b)/iu;
const MARKET_SHARE_LABEL = /\b(?:markedsandel|market\s+share)\b/iu;
const MARKET_VALUE_DENOMINATOR = /\b(?:av|of)\s+[^.!?]{0,80}\b(?:verdi|value)\b/iu;
const INCOMPLETE_NEGATED_ANALYSIS_EVIDENCE = /\b(?:ikke\s+har\s+analysert|did\s+not\s+analy[sz]e|has\s+not\s+analy[sz]ed)\s*$/iu;
const INCOMPLETE_LIST_LEAD_IN_EVIDENCE = /:\s*$/u;
const MATERIAL_EXCLUSION = /\b(?:not\s+included|excluded|not\s+counted|inngår\s+ikke|ikke\s+inkludert|ikke\s+medregnet)\b/iu;
const ANONYMOUS_SUPPLIER_EXCLUSION = /\b(?:(?:en|ett)\s+av\s+(?:de\s+)?leverand(?:ø|o)rene|one\s+of\s+the\s+suppliers?|leverand(?:ø|o)rene|suppliers)\b[^.!?\n]{0,160}\b(?:(?:holdes|ble\s+holdt|er\s+holdt)\s+utenfor|(?:utelates|ble\s+utelatt|er\s+utelatt)|(?:ekskluderes|ble\s+ekskludert|er\s+ekskludert)|(?:(?:is|are|was|were|has\s+been|have\s+been)\s+)(?:excluded|left\s+out))\b/iu;
const FRANCHISE_SCOPE = /\b(?:franchise[- ]owned\s+stores?|franchiseeide\s+butikker|kjøpmannseide\s+butikker)\b/iu;
const POSSESSIVE_OWNERSHIP_TARGET = /\b(?:is|was)\s+(?:(?:listed|identified|reported)\s+as\s+)?(?:the\s+)?([\p{L}\p{N}.& -]{2,80}?)'s\s+(?:largest|majority|controlling)\s+(?:owner|shareholder)\b/iu;
const NORWEGIAN_POSSESSIVE_OWNERSHIP_TARGET = /\b(?:er|var)\s+([\p{Lu}][\p{L}\p{N}.& -]{1,80}?)s\s+største\s+eier\b/u;
const CONTEXT_DEPENDENT_EVIDENCE_OPENING = /^(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\b/iu;
const CONTEXT_DEPENDENT_DISCOURSE_OPENING = /^(?:i\s+stedet(?!\s+for\b)|instead(?!\s+of\b))/iu;
const DEICTIC_STUDY_REFERENCE = /\b(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\b/iu;
const UNRESOLVED_INDICATOR_REFERENCE = /\b(?:denne\s+indikatoren|this\s+indicator)\b/iu;
const MAPPED_ACTOR_SCOPE = /\b(?:(?:actors?|participants?)\b[^.;!?\n]{0,80}\b(?:the\s+)?mapping|(?:[\p{L}-]*aktør(?:er|ene)?|deltaker(?:e|ne)?)\b[^.;!?\n]{0,80}\bkartleggingen)\b/iu;
const BROAD_ALL_ACTORS = /\b(?:(?:all|every|each)\s+(?:[\p{L}-]+\s+){0,4}(?:actors?|participants?)|each\s+of\s+the\s+(?:actors?|participants?)|(?:alle|samtlige|enhver|hver)\s+(?:[\p{L}-]+\s+){0,4}(?:[\p{L}-]*aktør(?:er|ene)?|deltaker(?:e|ne)?)|(?:actors?|participants?)\s+(?:generally|in\s+general))\b/iu;
const NAMED_STUDY_IDENTITY = /\b(?:the\s+)?([A-Z][A-Z0-9&.-]{2,})\s+(?:[Ss]urvey|[Qq]uestionnaire|[Ss]tudy)\b/u;
const NAMED_NORWEGIAN_STUDY_IDENTITY = /\b([A-ZÆØÅ][A-ZÆØÅ0-9&.-]{2,})[- ](?:undersøkelsen|studien|kartleggingen)\b/u;
const TITLE_CASE_STUDY_IDENTITY = /\b(?:the\s+)?([A-Z][\p{L}\p{M}-]+(?:\s+[A-Z][\p{L}\p{M}-]+){1,5})\s+(?:survey|questionnaire|study)\b/u;
const DEICTIC_STUDY_BY_IDENTITY = /\bthis\s+(?:survey|questionnaire|study)\s+by\s+([A-Z][\p{L}\p{M}0-9&.-]+)\b/iu;
const DEICTIC_STUDY_CALLED_IDENTITY = /\b(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\s*,\s*(?:called|known\s+as|from|kalt|kjent\s+som|fra)\s+([\p{L}\p{N}][\p{L}\p{M}\p{N}&.' -]{1,100}?)(?=\s*,|\s+(?:was|is|ble|var|er)\b)/iu;
const DEICTIC_STUDY_PAREN_IDENTITY = /\b(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\s*\(\s*([\p{L}\p{N}][^)]{1,100}?)\s*\)/iu;
const DEICTIC_STUDY_DASH_IDENTITY = /\b(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\s+[—–-]\s*([^—–-]{2,100}?)\s*[—–-]/iu;
const EXPLICIT_TABULAR_FIELDS = /\b(?:id|priority|status|country|coding_target|next_action)\s*[:=]/iu;
const DELIMITED_ROW = /^(?:[^,\t]*[,\t]){1,}[^,\t]*$/u;
const MARKDOWN_DATA_ROW = /^(?:\|\s*[^|\n]+\s*\|\s*[^|\n]+(?:\s*\|\s*[^|\n]+)*\s*\|?|\s*[^|\n]+\s*\|\s*[^|\n]+(?:\s*\|\s*[^|\n]+)*\s*\||\s*[^|\n.!?]+\s*\|\s*[^|\n.!?]+(?:\s*\|\s*[^|\n.!?]+)*\s*)$/u;
const EXPLICIT_MARKDOWN_FIELDS = /\b(?:person|andel|allocation|rolle|role)\s*:/iu;
const ENGLISH_EXCLUSION_AFTER_MARKER = /\b(?:excludes?|does\s+not\s+include|did\s+not\s+include)\s+([^.;,:]{2,120})/iu;
const NORWEGIAN_EXCLUSION_AFTER_MARKER = /\b(?:utelater|utelot|ekskluderer|ekskluderte|inkluderer\s+ikke)\s+([^.;,:]{2,120})/iu;
const ENGLISH_EXCLUSION_MARKER = /\b(?:not\s+included|excluded|not\s+counted|excludes?|does\s+not\s+include|did\s+not\s+include)\b/iu;
const NORWEGIAN_EXCLUSION_MARKER = /\b(?:inngår\s+ikke|ikke\s+inkludert|ikke\s+medregnet|utelater|utelot|ekskluderer|ekskluderte|inkluderer\s+ikke)\b/iu;
const ENGLISH_EVIDENCE_CONTEXT = /\b(?:the|figures?|stores?|companies|respondents?|data)\b/iu;
const NORWEGIAN_EVIDENCE_CONTEXT = /\b(?:tallene|butikker|selskaper|respondenter|dataene)\b/iu;
const GENERIC_EXPECTATION = /^(?:forventningen\s+er|the\s+expectation\s+is)\b/iu;
const GENERIC_EXPECTATION_ANYWHERE = /\b(?:forventningen|the\s+expectation)\b/iu;
const CONTACT_STATUS = /\b(?:only\s+real\s+contacts?|(?:de\s+)?eneste\s+reell(?:e)?\s+kontakt(?:en|er|ene)?|no\s+contacts?|ingen\s+andre\s+kontakter?)\b/iu;
const PRACTICAL_SIMPLIFICATION = /\b(?:praktisk\s+forenkling|practical\s+simplification)\b/iu;
const REPORTED_CAUSAL_CONNECTOR = /\b(?:because|due\s+to|fordi|skyldes(?:\s+at)?|derfor)\b/iu;
const PERIOD_ONLY_FRAGMENT = /^\s*(?:19|20)\d{2}\s+(?:til\s+og\s+med|through|to|and)\s*(?:19|20)\d{2}\s*\.?\s*$/iu;
const FOOTNOTE_LIST_FRAGMENT = /^\s*\d{1,3}\s+[\p{L}\p{M}][\s\S]{8,240}$/u;
const PRODUCT_SUPERLATIVE = /\b(?:best[- ]selling|most\s+sold|mest\s+solgte|bestselgende)\b[\s\S]{0,100}\b(?:pizza|product|produkt|frozen)\b|\b(?:pizza|product|produkt|frozen)\b[\s\S]{0,100}\b(?:best[- ]selling|most\s+sold|mest\s+solgte|bestselgende)\b/iu;
const SUPERLATIVE_UNIVERSE = /\b(?:among|blant|Norway(?:'s)?|Norges|nationally|nasjonalt|in\s+Norway)\b/iu;
const STAFFING_CAPACITY_DECISION = /\b(?:capacity|kapasitet)\b[\s\S]{0,100}\b(?:revers(?:e|ed|eres|eres)|redusere|reduce|reduced|må\s+reverseres|must\s+be\s+reversed)\b/iu;
const NOMINAL_DESCRIPTOR_EVIDENCE = /^\s*[-*•]?\s*\*{0,2}[\p{Lu}][\p{L}\p{M}\s.'’-]{1,80}\*{0,2}\s*(?:\([^\n]{1,60}\))?\s*[—–-]\s*[^.!?\n]{3,180}$/u;
const OPERATIONAL_STATUS = /(?:\bdashboard(?:et)?\b[\s\S]{0,80}\b(?:brukes|anvendes|is\s+used)\b|\b(?:ingen|no)\b[\s\S]{0,80}\b(?:partnere?|partners?)\b[\s\S]{0,80}\b(?:kontaktet|contacted)\b)/iu;
const NAMED_SCOPE = /\bfor\s+(?!(?:prosjektet|søknaden|the\s+project|the\s+application)\b)[A-ZÆØÅ][\p{L}\p{N}-]*(?:\s+[A-ZÆØÅ][\p{L}\p{N}-]*)+/u;
const SURVEY_UNIT_CONTEXT = /\b(?:survey|questionnaire|respondents?|responses?|companies\s+indicated|could\s+you\s+rank|your\s+company)\b/iu;
const SURVEY_DEPENDENT_CLAIM = /\b(?:respondents?|respondent\s+companies|companies\s+(?:responded|identified|(?:are|were|have\s+been)\s+(?:located|based))|companies\s+in\s+the\s+source|insect\s+food\s+producers\s+seem|most\s+(?:(?:of\s+the|insect(?:\s+food)?|food)\s+)?companies|most\s+established\s+companies|newer\s+entrants|on\s+average|rank(?:ed|ing)?|total(?:\s+collective)?\s+production|forecast(?:ed)?|foreseen|projection|influential\s+drivers?|critical\s+determinants?|source\s+identifies[\s\S]{0,100}\bmain\s+geographic\s+markets?)\b/iu;
const SURVEY_PURPOSE_CLAIM = /\b(?:survey|questionnaire)\b[\s\S]{0,180}\b(?:aims?|intends?|designed|update(?:s)?\s+(?:the\s+)?data|provide\s+more\s+accurate\s+figures?|production|market\s+trends?)\b/iu;
const SURVEY_SUBJECT_CLAIM = /\b(?:survey|questionnaire)\b[\s\S]{0,120}\b(?:conducted|gathered|received|collected|responded|responses?)\b/iu;
const LOCAL_SURVEY_SCOPE = /\b(?:(?:among|from|of|sample\s+of)\s+|responses?\s+from\s+)?\d{1,4}\s+(?:(?:EU|European|Nordic|surveyed)\s+)?(?:(?:insect\s+farming|insect-food|food)\s+)?(?:companies|respondents|producers)\b/iu;
const FORECAST_CLAIM = /\b(?:forecast(?:ed)?|foreseen|projection|projected)\b/iu;
const FORECAST_BASIS = /\b(?:based\s+on|using|scenario|model(?:led|ed|ing)?|estimated?\s+from|responses?\s+from)\b/iu;
const QUANTIFIED_GENERIC_RETURN = /(?:\b(?:(?:gjennomsnittlig\s+)?avkastning|(?:average\s+)?returns?)\b[\s\S]{0,120}\b\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b|\b\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b[\s\S]{0,120}\b(?:avkastning|returns?)\b)/iu;
const RETURN_METRICS = [
  { id: "rnoa", pattern: /\b(?:RNOA|avkastning\s+på\s+netto\s+driftsrelaterte\s+eiendeler|return\s+on\s+net\s+operating\s+assets)\b/iu },
  { id: "operating_margin", pattern: /\b(?:driftsmarginer?|operating\s+margins?)\b/iu },
] as const;
const BARE_MATERIAL_EXCLUSION_SCOPE = /\b(?:inngår[\s\S]{0,40}?ikke\s+i\s+(?:de\s+)?(?:innsendte\s+)?(?:tallene|dataene)(?!\s+(?:for|fra|i|til|som|basert\s+på|brukt\s+av)\b)|(?:er\s+)?(?:ekskludert|utelatt)\s+fra\s+(?:de\s+)?(?:innsendte\s+)?(?:tallene|dataene|datasettet|utvalget)(?!\s+(?:for|fra|i|til|som|basert\s+på|brukt\s+av)\b)|(?:er\s+)?ikke\s+(?:medregnet|inkludert)\s+i\s+(?:de\s+)?(?:innsendte\s+)?(?:tallene|dataene|datasettet|utvalget)(?!\s+(?:for|fra|i|til|som|basert\s+på|brukt\s+av)\b)|(?:is|are)\s+(?:not\s+included\s+in|excluded\s+from|not\s+counted\s+in)\s+(?:the\s+)?(?:submitted\s+)?(?:figures|data|numbers|dataset|sample)(?!\s+(?:for|from|in|of|that|based\s+on|used\s+by)\b))\b/iu;
const INCOMPLETE_MATERIAL_EXCLUSION_SCOPE = /(?:\b(?:tallene|dataene|datasettet|utvalget)\s+(?:for|fra|i|til|som|basert\s+på|brukt\s+av)|\b(?:figures|data|numbers|dataset|sample)\s+(?:for|from|in|of|that|based\s+on|used\s+by))\s*[.!?]?\s*$/iu;
const SCOPED_NEGATED_CAUSAL_ANALYSIS = /\b(?:(?:ikke\s+har|har\s+ikke)\s+analysert\s+kausale\s+sammenhenger\s+mellom|(?:did\s+not\s+analy[sz]e|has\s+not\s+analy[sz]ed)\s+causal\s+(?:links|relationships?)\s+between)\b/iu;
const CAUSAL_ANALYSIS_SCOPE = /\b(?:(?:ikke\s+har|har\s+ikke)\s+analysert\s+kausale\s+sammenhenger\s+mellom|(?:did\s+not\s+analy[sz]e|has\s+not\s+analy[sz]ed)\s+causal\s+(?:links|relationships?)\s+between)\s+([^.!?]{3,300})/iu;
const PRICE_MEASURE = /\b(?:(?:produsent|forbruker|dagligvare)pris(?:ene)?|pris(?:ene)?\s+for\s+dagligvarer|prices?\s+(?:for\s+groceries|of\s+groceries)|producer\s+prices?|consumer\s+prices?)\b/iu;
const PRICE_CHANGE = /(?<![\p{L}\p{N}_])(?:økte|falt|steg|increased|decreased|rose|fell)(?![\p{L}\p{N}_])/iu;
const KNOWN_GEOGRAPHY = /\b(?:Norge|Norges|Norway|norsk(?:e)?|EU(?:27)?|Europa|Europe|europeisk(?:e)?|European|Norden|Nordic|Sverige|Sweden|Danmark|Denmark|Finland)\b/giu;
const CONTEXTUAL_GEOGRAPHY = /\b(?:[Ii]|[Pp]å|[Ii]n|[Aa]cross|[Ff]or|[Tt]hroughout|[Gg]jennom)\s+(?:the\s+)?([\p{Lu}][\p{L}\p{M}-]*(?:\s+[\p{Lu}][\p{L}\p{M}-]*){0,2})/gu;
const COORDINATED_GEOGRAPHY = /\b(?:and|og)\s+([\p{Lu}][\p{L}\p{M}-]*(?:\s+[\p{Lu}][\p{L}\p{M}-]*){0,2})/gu;
const POSSESSIVE_PRICE_GEOGRAPHY = /\b([\p{Lu}][\p{L}\p{M}-]+)['’]s\s+(?:(?:consumer|producer|grocery)\s+prices?|prices?\s+for\s+groceries)/gu;
const NON_GEOGRAPHY_CONTEXT = new Set([
  "appendix", "chapter", "figure", "figur", "kapittel", "rapport", "report",
  "section", "seksjon", "table", "tabell",
]);
const ATTRIBUTION_ACTOR_BEFORE = /([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+(?:[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*|kommune|tilsynet|authority|agency|group)){0,5})\s+(?:oppga|oppgir|opplyste|rapporterer|rapporterte|states?|reports?|said)\b/gu;
const ATTRIBUTION_ACTOR_AFTER = /\b(?:oppga|oppgir|opplyste|rapporterer|rapporterte)\s+([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+(?:[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*|kommune|tilsynet|authority|agency|group)){0,5})/gu;
const ATTRIBUTION_ACTOR_PREFIX = /\b(?:[Ii]følge|[Aa]ccording\s+to)\s+([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+(?:[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*|kommune|tilsynet|authority|agency|group)){0,5})/gu;
const ATTRIBUTION_ACTOR_RELATIVE = /([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+(?:[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*|kommune|tilsynet|authority|agency|group)){0,5})\s*,?\s+(?:which|that|som)\s+(?:oppga|oppgir|opplyste|rapporterer|rapporterte|states?|reports?|reported|said)\b/gu;
const VAGUE_COMPARISON = /\b(?:med\s+visse\s+særtrekk|with\s+certain\s+(?:features|characteristics)|sammenlignet\s+med\s+litteraturen|compared\s+with\s+the\s+literature)\b/iu;
const COMPARATIVE_PATTERN = /\b(?:(?:det\s+)?europeiske\s+mønsteret|the\s+European\s+pattern)\b/iu;
const NAMED_COMPARISON_BASIS = /\b(?:målt\s+av|ifølge|basert\s+på|measured\s+by|according\s+to|based\s+on)\s+([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*)/u;
const UNNAMED_STUDY_AUTHORITY = /\b(?:empiriske\s+studier|empirical\s+studies|litteraturen|the\s+literature)\s+(?:viser|indikerer|tyder\s+på|shows?|indicates?|suggests?)(?![\p{L}\p{N}_])/iu;
const PASSIVE_IDENTIFICATION = /\b(?:(?:ble\s+det|det\s+ble)\s+identifisert\s+at|det\s+ble\s+introdusert\s+en\s+ny\s+metode|it\s+was\s+identified\s+that|a\s+new\s+method\s+was\s+introduced)\b/iu;
const PASSIVE_EVALUATION = /\b(?:beskrives\s+som|vurderes\s+som|anses\s+som|regnes\s+som|is\s+described\s+as?|is\s+considered(?:\s+as)?|are\s+considered(?:\s+as)?|is\s+regarded\s+as?|are\s+regarded\s+as?)\b/iu;
const PASSIVE_NAMED_ACTOR = /(?<![\p{L}\p{N}_])(?:av|by)\s+[\p{Lu}][\p{L}\p{M}\p{N}.:&+-]*(?:\s+[\p{Lu}][\p{L}\p{M}\p{N}.:&+-]*){0,5}/u;
const PASSIVE_NAMED_EVALUATOR_SCOPE = /\b(?:(?:[Rr]apport(?:en|ets)?|[Rr]eport|[Aa]nalys(?:en|is)|[Aa]nalysis)\s+(?:19|20)\d{2}|(?:[Rr]apport(?:en|ets)?|[Rr]eport|[Aa]nalys(?:en|is)|[Aa]nalysis)\s+(?:i|in)\s+(?:[Vv]edlegg|[Aa]ppendix)\s+[A-ZÆØÅ0-9-]+|(?:[Rr]apport(?:en|ets)?|[Rr]eport|[Aa]nalys(?:en|is)|[Aa]nalysis)\s+[A-ZÆØÅ][\p{L}\p{M}\d.&:+-]*(?:\s+[A-ZÆØÅ][\p{L}\p{M}\d.&:+-]*){0,4}|(?:[A-ZÆØÅ][\p{L}\p{M}\d.&:+-]*\s+){1,4}(?<!this\s)(?<!This\s)(?:[Rr]apport|[Rr]eport|[Aa]nalyse|[Aa]nalys(?:e|is)|[Aa]nalysis)(?:\s+(?:19|20)\d{2})?)\b/u;
const PASSIVE_LOCAL_CLASSIFICATION = /\b(?:(?:klassifiseres|(?:ble|er|var|blir|har\s+blitt|har\s+vært)\s+klassifisert)[^.!?\n]{0,100}\bher|(?:(?:is|are|was|were)\s+(?:being\s+)?classified|(?:has|have|had)\s+been\s+classified)[^.!?\n]{0,100}\bhere)\b/iu;
const NAMED_CLASSIFICATION_CONTEXT = /\b(?:Konkurransetilsynet|Norwegian\s+Competition\s+Authority|margin(?:analyse(?:n)?|studie(?:n)?)|denne\s+analysen|this\s+analysis|vedlegg\s+[A-ZÆØÅ]|appendix\s+[A-Z])\b/iu;
const FIGURE_REFERENCE = /\b(?:Figur|Figure)\s+(\d{1,4})\b/iu;
const FIGURE_PERCENT_VALUE = /\b\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b/iu;
const FIGURE_MULTIPLE_VALUE = /(?:\b(?:\d+(?:[.,]\d+)?|en|to|tre|fire|fem|seks|syv|sju|åtte|ni|ti|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:ganger|times)\b|\b(?:twofold|threefold|fourfold|fivefold|sixfold|sevenfold|eightfold|ninefold|tenfold|twice|double|doubled|tripled|dobling|doblet|tredoblet)\b|\b\d+(?:[.,]\d+)?(?:x|-fold)\b)/iu;
const FIGURE_CHANGE = /(?:økte|steg|falt|høyere|lavere|doblet|tredoblet|increased|rose|fell|decreased|higher|lower|doubled|tripled)(?![\p{L}\p{N}_])/iu;
const FIGURE_AGGREGATED_ACTORS = /\b(?:aggregert|aggregated)\s*\(([^)]{3,200})\)/iu;
const BOUNDED_YEAR_RANGE_CAPTURE = /\b((?:19|20)\d{2})\b\s*(?:[-–—]|to|through|until|and|til(?:\s+og\s+med)?|gjennom|og)\s*\b((?:19|20)\d{2})\b/giu;
const NOT_INFLATION_ADJUSTED = /\b(?:ikke\s+(?:er\s+)?(?:inflasjonsjustert(?:e)?|justert(?:e)?\s+for\s+inflasjon)|not\s+(?:inflation[- ]adjusted|adjusted\s+for\s+inflation))\b/iu;
const FIGURE_INDEX_BASE = /\b((?:19|20)\d{2}\s*=\s*100)\b/iu;
const FIGURE_FIRST_TRANSACTION_SCOPE = /\b(?:førstegangsomsetning[\s\S]{0,80}\binnenlands|first(?:[- ]transaction|\s+sale)[\s\S]{0,80}\bdomestic)\b/iu;
const FIGURE_ELECTRICITY_SUPPORT_EXCLUSION = /\b(?:hensyntar\s+ikke\s+strømstøtte|does\s+not\s+(?:account\s+for|include)\s+electricity\s+support)\b/iu;
const IMPLICIT_MARKET_SHARE = /\b(?:står\s+for|utgjør|accounts?\s+for)\b[\s\S]{0,80}\b\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b[\s\S]{0,120}\b(?:den\s+)?(?:samlet|samlede|total)\s+(?:omsetningen?|turnover|sales)\b[\s\S]{0,100}\b(?:dagligvare(?:handelen?)?|grocery)\b/iu;
const REPORTED_DATASET_COVERAGE = /\b(?:har\s+levert\s+(?:tall|data)|(?:leverte|sendte\s+inn)\s+(?:tall|data)|(?:has\s+)?(?:supplied|provided)\s+(?:figures|data)|submitted\s+(?:figures|data)|figures\s+for\s+the\s+period)\b/iu;
const EARLY_GENERIC_EVIDENCE_REFERENCE = /^(?:metodisk|methodologically)\s+[\s\S]{0,60}\b(?:tilnærmingen|metoden|the\s+approach|the\s+method)\b/iu;
const TOTAL_BUDGET_AMOUNT = /\b(?:totalt|total)\b[\s\S]{0,40}\b\d+(?:[\s.,]\d+)*\s*(?:kr|NOK|kroner|EUR|euro|USD|dollars?)\b/iu;
const PER_GROUP_BUDGET_SCOPE = /\b(?:per|for\s+hver)\s+(?:transition\s+group|gruppe)\b|\bCities\s*\+\s*Food\b/iu;
const NOMINAL_BUDGET_FRAGMENT = /^(?:(?:totalt?|total)\s+)?(?:budsjett|budget)|^totalbudsjett/iu;
const BUDGET_SECTION_HEADING = /^(?:#{1,6}\s*)?(?:\d+(?:(?:[.):]|\s+[-–—])\s*|\s+))?(?:budsjett|budget)(?:\s+og\s+forventninger|\s+and\s+expectations)?\s*:?\s*$/iu;
const CURRENCY_AMOUNT = /(?:[$€£]\s*\d+(?:[\s.,]\d+)*\b|\b(?:kr|NOK|kroner|EUR|euro|USD|dollars?)\s*\d+(?:[\s.,]\d+)*\b|\b\d+(?:[\s.,]\d+)*\s*(?:kr|NOK|kroner|EUR|euro|USD|dollars?|[$€£]))/iu;
const AWARD_ACTION = /\b(?:bevilg(?:et|er|a|ning(?:en)?)|tildel(?:te|t|er|ing(?:en)?)|innvilg(?:et|er)|alloker(?:te|t|er|ing(?:en)?)|award(?:ed|s|ing)?|grant(?:ed|s|ing)?|allocat(?:ed|es?|ing|ion))\b/iu;
const FINANCIAL_AWARD_CONTEXT = /(?:\b\d+(?:[\s.,]\d+)*(?:\s*(?:mill\.?|million(?:er)?))?\s*(?:kr|NOK|kroner|EUR|euro|USD|dollars?)\b|\b(?:finansiering(?:en)?|funding|tilskudd(?:et)?|grant)\b)/iu;
const NOMINAL_CHALLENGE_HEADING = /^(?:utfordring(?:er)?(?:\s+(?:med|ved|for)|\s*[:–—-])|(?:en\s+stor\s+utfordring|store\s+utfordringer)\s+for|challenges?(?:\s+(?:with|for)|\s*[:–—-])|(?:(?:et|en)\s+)?(?:(?:neste|stor(?:t|e)?)\s+)?steg\s+for|next\s+step\s*:|(?:(?:a|the)\s+)?(?:(?:major|big|significant)\s+)?step\s+for)(?=\s|$)/iu;
const DECLARATIVE_COPULA_OR_VERB_TOKENS = new Set([
  "er", "var", "ble", "blir", "har", "hadde", "gjør", "gjorde", "viser", "viste", "gir", "ga",
  "is", "are", "was", "were", "became", "become", "becomes", "has", "have", "had", "show", "shows",
  "showed", "give", "gives", "gave",
  "oppstår", "oppsto", "fører", "førte", "inkluderer", "inkluderte", "innebærer", "innebar",
  "emerge", "emerges", "emerged", "involve", "involves", "involved", "enable", "enables", "enabled",
]);
const OBVIOUS_SECTIONED_FINDINGS = /(?:^|\n)#{1,6}\s+(?:Hovedfunn|Main\s+findings|Findings|Metode|Method)\b/imu;
const PLAIN_SECTIONED_FINDINGS = /(?:^|\n)(?:Hovedfunn|Main\s+findings|Findings|Metode|Method)\s*(?::|\n)/imu;
const STRUCTURED_REGISTER_FINDINGS = /"(?:keyFindings|recommendations)"\s*:\s*\[/u;
const HEADER_BOUND_INVENTORY = /^(?:id|source_id)[,\t][^\n]+\n[^\n]+/iu;
const STRUCTURED_COMPANY_SECTION = /^###\s+[A-D]\.\s+(?:Eierskap|Ownership|Finansielle\s+data|Financial\s+data|Offentlig\s+stotte|Public\s+support|IP(?:\s*[-—:]\s*[^\n]+)?)/gimu;
const NUMBERED_COMPANY_HEADING = /^##\s+\d+\.\s+[^\n]{1,100}\b(?:AS|ASA|AB|A\/S|Ltd\.?|Limited|Holdings?|Group|Company|Corp(?:oration)?)\b[^\n]{0,80}$/gmu;
const MASTER_ANALYSIS_INDEX = /^#\s+Master\s+Analyse-Indeks\b[\s\S]{0,2000}\bStatus-sammendrag\b/imu;
const MASTER_INDEX_CONCENTRATION_COMPARISON = /\bCR\d+\b[^.!?\n]{0,180}\b\d+(?:[.,]\d+)?\s*%[^.!?\n]{0,180}\b(?:opp\s+fra|up\s+from)\b[^.!?\n]{0,80}\b\d+(?:[.,]\d+)?\s*%/iu;
const MASTER_INDEX_PERCENT_CHANGE = /(?:\b\d+(?:[.,]\d+)?\s*(?:[-–—]\s*\d+(?:[.,]\d+)?)?\s*%[^.!?\n]{0,100}\b(?:reduksjon|reduction|høyere|hoyere|lavere|higher|lower)\b|\b(?:reduksjon|reduction|høyere|hoyere|lavere|higher|lower)\b[^.!?\n]{0,100}\b\d+(?:[.,]\d+)?\s*%)/iu;
const EXPLICIT_COMPARISON_BASIS = /\b(?:opp\s+fra|up\s+from|versus|vs\.?|sammenlignet\s+med|compared\s+(?:with|to)|relative\s+to|baseline|kontrollgruppe|control\s+group|enn|than)\b/iu;
const AUTHORITY_RESULT_MATERIAL = /\bKonkurransetilsynet\s+(?:finner|vurderer|konkluderer|beregner|har\s+beregnet)\b/iu;
const STUDY_FINDING_MATERIAL = /\bStudien\s+(?:finner|viser|rapporterer)\b/iu;
const SURVEY_RESULT_MATERIAL = /\b(?:(?:respondents?|companies)\s+(?:identified|indicated|responded)|respondentene\s+(?:identifiserte|indikerte|svarte)|most\s+(?:(?:insect\s+food|respondent)\s+)?companies\s+(?:are|have|produce)|on\s+average,?\s+companies\s+have|totalt\s+svarte\s+\d+[\d ,.]*(?:\s+\w+){0,3}\s+respondenter|(?:the\s+)?total\s+response\s+count\s+(?:was|is)\s+\d+|the\s+survey\s+received\s+\d+\s+responses?|total(?:\s+collective)?[^.!?\n]{0,60}\bproduction\b[^.!?\n]{0,120}\b(?:was|is)\s+\d[\d ,.]*(?=\s|[.;:]|$)|total\s+(?:forecasted\s+)?[^.!?\n]{0,60}\bproduction\b[^.!?\n]{0,120}\b(?:foreseen\s+for\s+\d{4}\s+is|in\s+\d{4}\s+is)\s+\d[\d ,.]*(?=\s|[.;:]|$)|(?:the\s+forecast|forecasted\s+production)\s+(?:is\s+)?\d[\d ,.]*[^.!?\n]{0,60}\b(?:19|20)\d{2}\b|prognosen\s+er\s+\d[\d ,.]*[^.!?\n]{0,60}\b(?:19|20)\d{2}\b)\b/iu;
const SURVEY_RESPONSE_TOTAL_MATERIAL = /\b(?:totalt\s+svarte\s+\d+[\d ,.]*(?:\s+\w+){0,3}\s+(?:respondenter|selskaper|produsenter)|(?:the\s+)?total\s+(?:number\s+of\s+respondents|response\s+count)\s+(?:was|is)\s*:?\s*\d+|the\s+response\s+total\s+(?:was|is)\s+\d+|there\s+(?:were|are)\s+\d+\s+respondents|the\s+survey\s+(?:received|gathered)\s+\d+\s+(?:survey\s+)?responses?)\b/iu;
const SURVEY_FORECAST_MATERIAL = /\b(?:forecast(?:ed)?|projected|projection|prognose(?:n)?)\b(?=[^.!?\n]{0,200}\b(?:19|20)\d{2}\b)(?=[^.!?\n]{0,200}\b\d[\d ,.]*\s*(?:tonnes?|tons?|tonn)\b)[^.!?\n]{0,200}/iu;
const SURVEY_QUALITATIVE_RESULT_MATERIAL = /\b(?:(?:most\s+)?respondents\s+(?:reported|selected|ranked|identified|indicated)|companies\s+(?:reported|selected|ranked|identified|indicated)|respondentene\s+(?:rapporterte|valgte|rangerte|identifiserte|indikerte)|flest\s+respondenter\s+(?:rapporterte|valgte|rangerte)|selskapene\s+(?:oppga|rapporterte|valgte|rangerte)|de\s+fleste\s+selskapene\s+(?:foretrakk|valgte|rapporterte))\b/iu;
const SURVEY_GENERAL_FORECAST_MATERIAL = /\b(?:forecast(?:ed)?|projected|projection|projisert|prognose(?:n)?)\b(?=[^!?\n]{0,200}\b(?:19|20)\d{2}\b)(?=[^!?\n]{0,200}(?:\b\d+(?:[.,]\d+)?(?:\s+\d{3})*\s*(?:million(?:er)?|euros?|EUR|units?|enheter)\b|\b(?:double|doubled|doble|doblet)\b))[^!?\n]{0,200}/iu;
const NUMBERED_LEARNING_SECTION = /(?:^|\n)(?:#{1,6}\s*)?(?:læring(?:spunkt)?|learning(?:\s+point)?)\s*(?:#\s*|nr\.?\s*|number\s*)?\d+\b/imu;
const NUMBERED_LEARNING_HEADING_LINE = /^(?:#{1,6}\s*)?(?:læring(?:spunkt)?|learning(?:\s+point)?)\s*(?:#\s*|nr\.?\s*|number\s*)?\d+\b[^.!?]{0,200}$/iu;
const NUMBERED_LEARNING_TOC_LINE = /^(?:#{1,6}\s*)?(?:læring(?:spunkt)?|learning(?:\s+point)?)\s*(?:#\s*|nr\.?\s*|number\s*)?\d+\b[^\n]{0,240}$/iu;
const LEARNING_SECTION_DECLARATIVE_VERB = /(?<![\p{L}\p{N}_])(?:er|var|ble|blir|har|hadde|gir|ga|gjør|gjorde|viser|viste|finner|fant|opplever|opplevde|produserer|produserte|identifiserer|identifiserte|demonstrerer|demonstrerte|inneholder|inneholdt|inkluderer|inkluderte|indikerer|indikerte|rapporterer|rapporterte|avdekker|avdekket|støtter|støttet|beskriver|beskrev|forklarer|forklarte|fremhever|fremhevet|bruker|brukte|sikrer|sikret|måler|målte|bekrefter|bekreftet|omfatter|omfattet|anvender|anvendte|kan|skal|må|is|are|was|were|became|has|have|had|gives?|gave|provides?|provided|produces?|produced|shows?|showed|finds?|found|demonstrates?|demonstrated|identifies?|identified|contains?|contained|includes?|included|indicates?|indicated|reports|reported|supports?|supported|describes?|described|explains?|explained|reveals?|revealed|highlights?|highlighted|outlines?|outlined|suggests?|suggested|summari[sz]es?|summari[sz]ed|confirms?|confirmed|covers?|covered|applies|applied|enables?|enabled|uses?|ensures?|measures?|measured|can|will|must)(?![\p{L}\p{N}_])/iu;
const LEARNING_SECTION_IMPERATIVE = /^(?:[:/—–-]\s*)?(?:(?:please|vennligst)\s+|(?:(?:can|could|will|would)\s+you|kan\s+du)\s+)?(?:describe|explain|discuss|list|select|choose|identify|rank|state|summari[sz]e|beskriv|forklar|diskuter|list|velg|identifiser|ranger|oppsummer)(?![\p{L}\p{N}_])/iu;
const LEARNING_SECTION_META_HEADING = /\b(?:this\s+is\s+)?(?:a\s+)?(?:report|document|section|slide|chapter|rapport|dokument|seksjon|lysbilde|kapittel)\s+(?:heading|title|overskrift|tittel)\b/iu;
const DEICTIC_DOCUMENT_REFERENCE = /\b(?:dette\s+dokument(?:et)?|disse\s+dokumentene|dokumentet|this\s+document)\b/iu;
const NAMED_DOCUMENT_REFERENCE = /\b(?:dette\s+dokumentet|this\s+document)\s*(?:,\s*(?:the\s+)?[^,\n]{2,120}\b(?:rapport(?:en)?|report)\b(?:\s+(?:19|20)\d{2})?\s*,|\(\s*(?:the\s+)?[^)\n]{2,120}\b(?:rapport(?:en)?|report)\b[^)\n]{0,40}\)|:\s*[^.!?\n]{2,120}\b(?:rapport(?:en)?|report)\b(?:\s+(?:19|20)\d{2})?(?=\s+(?:is|was|er|var|ble)\b)|[—–-]\s*[^—–\n]{2,120}\b(?:rapport(?:en)?|report)\b[^—–\n]{0,40}[—–-])/iu;
const NON_DECLARATIVE_METADATA_CLAIM = /^(?:metadata[- ]import|metadata\s+(?:record|entry))\b/iu;
const PRACTICAL_SUCCESS_DEPENDENCY = /\b(?:avgjorende|avgjørende|critical|essential)\b[^.!?\n]{0,120}\b(?:lykkes|succeed)\b[^.!?\n]{0,60}\b(?:i\s+praksis|in\s+practice)\b/iu;
const NAMED_PRACTICAL_SUCCESS_SCOPE = /(?:\b(?:metoden|method)\s+(?:for|til|of)\s+[^.!?\n]{3,100}?\b(?:er|is)\b|\b(?:for|i|innenfor|in|within)\s+(?:(?:[\p{Lu}][\p{L}\p{M}-]*|regional(?:e)?|kommunal(?:e)?|local|regional)\s+){0,5}(?:ressurskartlegging(?:en)?|resource\s+mapping|arbeid(?:et)?|work|leveranse(?:n)?|delivery)\b|\b(?:i\s+praksis|in\s+practice)\s+(?:med|with)\s+[^.!?\n]{2,100}\b(?:beregning(?:en)?|calculation|kartlegging(?:en)?|mapping|prosjekt(?:et)?|project)\b)/iu;
const NAMED_PROJECT_LABEL_SCOPE = /\b(?:for|i|in)\s+[A-ZÆØÅ][\p{L}\p{M}\p{N}-]*(?:\s*\+\s*[A-ZÆØÅ][\p{L}\p{M}\p{N}-]*|:[\p{L}\p{M}\p{N}-]+)\s*,/iu;
const BARE_METHOD_EVIDENCE_REFERENCE = /\b(?:metoden|the\s+method|the\s+new\s+method|(?:their|its|our)\s+method)\b/iu;
const CLAIM_METHOD_REFERENCE = /(?:\b(?:metod(?:e|en)|method)\b|(?<![\p{L}\p{N}_])[\p{L}\p{M}-]+metode(?:n)?(?![\p{L}\p{N}_]))/iu;
const SCOPED_METHOD_REFERENCE = /\b(?:metoden\s+(?:for|til|med)\b|the\s+method\s+(?:for|of|to|using|on)\b)/iu;
const NAMED_METHOD_CONTEXT = /\b(?:[\p{L}\p{M}-]{3,}metoden|[A-ZÆØÅ][\p{L}\p{M}\p{N}.&+-]+(?:s|'s)\s+metode|[A-Z][\p{L}\p{M}\p{N}.&+-]+(?:'s)\s+method|metoden\s+(?:som\s+)?beskrevet\s+i\s+kapittel\s+\d+|the\s+method\s+described\s+in\s+chapter\s+\d+)\b/iu;
const QUANTIFIED_GROSS_MARGIN_RANGE = /\b(?:bruttomargin(?:en|er|ene)?|gross\s+margin(?:s)?)\b[^.!?\n]{0,140}\b(?:ranged?\s+(?:from\s+)?|varierte?\s+(?:fra\s+)?|(?:mellom|between|from)\s+)?\d+(?:[.,]\d+)?\s*(?:og|and|to|[-–—])\s*\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b/iu;
const GROSS_MARGIN_UNIVERSE = /(?<![\p{L}\p{N}_])(?:\d+|en|ett|to|tre|fire|fem|seks|syv|sju|åtte|ni|ti|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:leverandører|suppliers?|selskaper|companies|enheter|entities)(?![\p{L}\p{N}_])/iu;
const REPORTED_DATASET_RECEIPT = /\b(?:har\s+mottatt|mottok|has\s+received|received|obtained|collected|gathered|acquired)\b(?=[^.!?\n]{0,220}\b\d+)(?=[^.!?\n]{0,220}\b(?:resultatoppstillinger|balanser|data|tall|figures?|income\s+statements?|balance\s+sheets?)\b)[^.!?\n]{0,220}/iu;
const BARE_DATASET_EXCLUSION_VARIANT = /\b(?:(?:is|are|was|were)\s+(?:absent\s+from\s+(?:the\s+)?submitted\s+data|(?:omitted|removed)\s+from\s+(?:the\s+)?(?:submitted\s+)?(?:figures|data|numbers|dataset|sample)|left\s+out\s+of\s+(?:the\s+)?(?:submitted\s+)?(?:figures|data|numbers|dataset|sample))|the\s+dataset\s+excludes?)\b/iu;
const SINGLE_YEAR_REPORTING_PERIOD = /\b(?:(?:19|20)\d{2}\s+(?:reporting\s+period|rapporteringsperiode(?:n)?)|(?:reporting\s+period|rapporteringsperiode(?:n)?)\s+(?:19|20)\d{2})\b/iu;
const CLAIM_REPORTS_A_QUESTION = /\b(?:asks?|asked|question(?:naire)?\s+(?:asks?|asked)|(?:form|survey(?:\s+form)?|questionnaire)\s+(?:asks?|asked)|ber\s+(?:respondentene\s+)?om|(?:skjemaet|undersøkelsen|spørreskjemaet)\s+(?:spør|spurte)|stiller\s+spørsmålet|spørsmålet\s+(?:ber|spør))\b/iu;
const CLAIM_ADDS_RESULT_TO_QUESTION = /(?:\band\b|\bog\b|\bwith\b|\bmed\b|[,.:;()\-—–])[\s\S]{0,160}\b(?:reports?|reported|finds?|found|shows?|showed|states?|stated|concludes?|concluded|identifies?|identified|confirms?|confirmed|establishes?|established|indicates?|indicated|rapporterer|rapporterte|finner|fant|viser|viste|oppgir|oppga|konkluderer|konkluderte|identifiserer|identifiserte|bekrefter|bekreftet|fastslår|fastslo|indikerer|indikerte|(?:is|are|was|were|er|var)\s+(?:the\s+)?(?:primary|main|most|least|hoved|viktigste)|as\s+(?:the\s+)?(?:primary|main|most|least))\b/iu;
const CLAIM_ADDS_BARE_ANSWER_TO_QUESTION = /(?:\bwith\b|\bmed\b|[—–])\s*(?!(?:options?|choices?|svaralternativer)\b)[\p{L}\p{N}]/iu;
const CLAIM_HAS_STANDALONE_ANSWER_CLAUSE = /(?:^|[.;])\s*(?:(?:the\s+answer|svaret)\s+(?:is|was|er|var)\s+[^.;]{1,80}|[^.;]{1,80}\s+(?:is|was|er|var)\s+(?:the\s+answer|svaret))\s*(?=[.;]|$)/iu;
const FORM_INSTRUCTION_AFTER_QUESTION = /^(?:(?:select|choose|rank|tick|check|mark|velg|ranger|kryss\s+av)\b|(?:options?|response\s+options|answer\s+options|svaralternativer)\s*:)/iu;
const TRAILING_QUESTION_CITATION = /^(?:\[[^\]\r\n]{1,80}\]|\([^\)\r\n]{1,80}\)|[¹²³⁴⁵⁶⁷⁸⁹⁰]+)\s*/u;
const DECLARATIVE_RESULT_AFTER_QUESTION = /\b(?:reports?|reported|finds?|found|shows?|showed|states?|stated|concludes?|concluded|confirms?|confirmed|establishes?|established|indicates?|indicated|results?|findings?|rapporterer|rapporterte|finner|fant|viser|viste|oppgir|oppga|konkluderer|konkluderte|bekrefter|bekreftet|fastslår|fastslo|indikerer|indikerte|resultater?|funn)\b|\b\d+(?:[.,]\d+)?\s*(?:%|prosent|percent)\b/iu;
const TABULAR_HEADER_WORDS = new Set([
  "action", "actor", "author", "capture", "category", "city", "coding", "company", "country",
  "current", "date",
  "description", "end", "geography", "id", "language", "link", "metric", "name",
  "method", "next", "notes", "organization", "outlet", "period", "pill", "poison", "priority",
  "publisher", "region", "risk", "sector", "source", "start", "status", "target", "theme", "title",
  "topic", "type", "unit", "url", "value", "year",
]);
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
    (BARE_ANALYSIS_REFERENCE.test(value) && !EXPLICIT_LOCAL_ANALYSIS_CONTEXT.test(value)) ||
    BARE_DOUBLE_COUNTING.test(value);
}

function hasResolvedMappingIdentity(value: string): boolean {
  return EXPLICIT_MAPPING_OBJECT.test(value) ||
    NAMED_MAPPING_METHOD.test(value);
}

function hasCompletePropositionBeforeInlineFindings(value: string): boolean {
  if (!/\b(?:Hovedfunn|Main\s+findings)\b[\s\S]{0,180}(?::|[-*•])[^.!?\n]{0,120}:\s*\d+(?:[.,]\d+)?/iu.test(value)) return false;
  const prefix = value.split(/\b(?:Hovedfunn|Main\s+findings)\b/iu)[0] ?? "";
  return prefix.split(/[.!?]+/u).some((sentence) =>
    /\b(?:19|20)\d{2}-\d{2}-\d{2}\b/iu.test(sentence) &&
    /\b(?:ble|var|er|was|were|is|completed|gjennomført)\b/iu.test(sentence) &&
    sentence.trim().length >= 12);
}

function hasGenericMappingIdentity(value: string): boolean {
  return /\b(?:lokale|regionale)\s+kartlegging(?:en|er|ene)?\b|\b(?:local|regional)\s+mappings?\b/iu.test(value);
}

function normalizedMaterialText(value: string): string {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en");
}

function canonicalLegalEntityName(value: string): string {
  return normalizedMaterialText(value)
    .replace(/\s+(?:asa|as|sa|ab|a\/s|oyj|ltd|limited|corp(?:oration)?)\.?$/iu, "")
    .trim();
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

function canonicalKnownGeographies(value: string): Set<string> {
  const canonical = new Set<string>();
  for (const match of value.matchAll(KNOWN_GEOGRAPHY)) {
    const marker = normalizedMaterialText(match[0]);
    if (/^(?:norge|norges|norway|norsk)/u.test(marker)) canonical.add("norway");
    else if (/^(?:sverige|sweden)/u.test(marker)) canonical.add("sweden");
    else if (/^(?:danmark|denmark)/u.test(marker)) canonical.add("denmark");
    else if (/^finland/u.test(marker)) canonical.add("finland");
    else if (/^(?:eu|europa|europe|europeisk|european)/u.test(marker)) canonical.add("europe");
    else if (/^(?:norden|nordic)/u.test(marker)) canonical.add("nordic");
  }
  return canonical;
}

function attributionSubjects(value: string): string[] {
  const prefixed = [...value.matchAll(ATTRIBUTION_ACTOR_PREFIX)]
    .map((match) => match[1])
    .filter((subject): subject is string => subject !== undefined)
    .map(normalizedMaterialText);
  const before = [...value.matchAll(ATTRIBUTION_ACTOR_BEFORE)]
    .map((match) => match[1])
    .filter((subject): subject is string => subject !== undefined)
    .map(normalizedMaterialText);
  const after = [...value.matchAll(ATTRIBUTION_ACTOR_AFTER)]
    .map((match) => match[1])
    .filter((subject): subject is string => subject !== undefined)
    .map(normalizedMaterialText);
  const relative = [...value.matchAll(ATTRIBUTION_ACTOR_RELATIVE)]
    .map((match) => match[1])
    .filter((subject): subject is string => subject !== undefined)
    .map(normalizedMaterialText);
  return [...new Set([...prefixed, ...before, ...after, ...relative])];
}

function namedAuthorityIdentities(value: string): Set<string> {
  const identities = new Set<string>();
  for (const match of value.matchAll(new RegExp(NAMED_AUTHORITY.source, `${NAMED_AUTHORITY.flags}g`))) {
    const normalized = normalizedMaterialText(match[0]).replace(/['’]s$/u, "");
    if (
      normalized === "konkurransetilsynet" ||
      normalized === "konkurransetilsynets" ||
      normalized === "norwegian competition authority"
    ) {
      identities.add("norwegian-competition-authority");
    } else if (normalized === "competition and markets authority" || normalized === "cma") {
      identities.add("competition-and-markets-authority");
    }
  }
  return identities;
}

function localClauses(value: string): string[] {
  return value
    .split(/(?<!\d)[.!?](?!\d)|[;\n]+/u)
    .map((clause) => clause.trim())
    .filter((clause) => clause.length > 0);
}

function financialAwardActor(value: string): string | undefined {
  const awardMatch = AWARD_ACTION.exec(value);
  if (awardMatch?.index === undefined) return undefined;
  const prefix = value.slice(0, awardMatch.index).trim()
    .replace(/\b(?:is|are|was|were|has|have|had|er|var|har|hadde|blir)\s*$/iu, "")
    .trim();
  const actorMatch = /([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*){0,7})\s*$/u.exec(prefix);
  return actorMatch?.[1] === undefined ? undefined : canonicalLegalEntityName(actorMatch[1]);
}

function financialReceiptActor(value: string): string | undefined {
  const match = /(?:^|[.!?;\n]\s*)([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*){0,7})\s+(?:received|mottok|fikk)\b/iu.exec(value);
  return match?.[1] === undefined ? undefined : canonicalLegalEntityName(match[1]);
}

function quotedProjectIdentities(value: string): Set<string> {
  return new Set([...value.matchAll(/["'‘’]([^"'‘’\n]{3,120})["'‘’]/gu)]
    .map((match) => normalizedMaterialText(match[1] ?? ""))
    .filter((identity) => identity.length > 0));
}

function explicitAwardProjectIdentities(value: string): Set<string> {
  const identities = quotedProjectIdentities(value);
  for (const match of value.matchAll(/\bfor\s+(?:the\s+)?([\p{L}\p{M}\p{N}&+,'’ -]{2,120}?)\s+project\b/giu)) {
    if (match[1] !== undefined) identities.add(normalizedMaterialText(match[1]));
  }
  for (const match of value.matchAll(/\bfor\s+project\s+([\p{L}\p{M}\p{N}&+,'’ -]{1,120}?)(?=[,.;]|$)/giu)) {
    if (match[1] !== undefined) identities.add(normalizedMaterialText(match[1]));
  }
  return identities;
}

function hasSourceVisibleFinancialAward(claimText: string, evidence: string): boolean {
  const receiptClaim = /\b(?:received|mottok|mottatt|fikk|fått)\b[\s\S]{0,100}\b\d+[\s.,]*\s*(?:mill\.?|million(?:er)?|NOK|kr)\b/iu.test(claimText);
  if (receiptClaim) {
    const actor = financialReceiptActor(claimText);
    const evidenceActor = financialAwardActor(evidence);
    const claimProjects = explicitAwardProjectIdentities(claimText);
    const evidenceProjects = explicitAwardProjectIdentities(evidence);
    if (
      actor === undefined || evidenceActor === undefined || actor !== evidenceActor ||
      !AWARD_ACTION.test(evidence) || !FINANCIAL_AWARD_CONTEXT.test(evidence) ||
      [...claimProjects].some((identity) => !evidenceProjects.has(identity))
    ) {
      return false;
    }
  }
  const claimClauses = localClauses(claimText)
    .filter((clause) => AWARD_ACTION.test(clause) && FINANCIAL_AWARD_CONTEXT.test(clause));
  if (claimClauses.length === 0) return true;
  const evidenceAwardClauses = localClauses(evidence)
    .filter((clause) => AWARD_ACTION.test(clause) && FINANCIAL_AWARD_CONTEXT.test(clause));
  return claimClauses.every((claimClause) => {
    const actor = financialAwardActor(claimClause);
    return evidenceAwardClauses.some((evidenceClause) =>
      actor === undefined || financialAwardActor(evidenceClause) === actor);
  });
}

function treasuryOwner(value: string): string | undefined {
  const match = /(?:^|[.!?;\n]\s*)[-*#\s]*\*{0,2}([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*){0,7})\*{0,2}\s+(?:held|holds|hadde|holdt|eier)\b/u.exec(value);
  if (match?.[1] !== undefined) return canonicalLegalEntityName(match[1]);
  const heading = /^\s*[-*#\s]*\*{0,2}([\p{Lu}][\p{L}\p{M}\p{N}.&+-]*(?:\s+[\p{Lu}][\p{L}\p{M}\p{N}.&+-]*){0,7})\*{0,2}\s*\r?\n[\s\S]*\b(?:treasury\s+shares?|egne\s+aksjer)\b/iu.exec(value);
  return heading?.[1] === undefined ? undefined : canonicalLegalEntityName(heading[1]);
}

function namedCompanyPopulation(value: string): Set<string> {
  const match = /\b(?:grants?|subsid(?:y|ies)|tilskudd(?:ene)?)\s+(?:for|til)\s+([^.;:\n]{3,200}?),\s*(?:(?:the\s+)?listed\s+(?:companies|entities)|(?:de\s+)?listede\s+selskapene|disse\s+selskapene)\b/iu.exec(value);
  if (match?.[1] === undefined) return new Set();
  const names = match[1]
    .split(/\s+(?:and|og)\s+|\s*,\s*/iu)
    .map((name) => name.trim())
    .filter((name) => /^[\p{Lu}][\p{L}\p{M}\p{N}.&+/' -]{1,100}$/u.test(name))
    .map(canonicalLegalEntityName)
    .filter((name) => name.length > 0);
  return names.length >= 2 ? new Set(names) : new Set();
}

function hasSameNamedCompanyPopulation(claimText: string, evidence: string): boolean {
  const claimPopulation = namedCompanyPopulation(claimText);
  const evidencePopulation = namedCompanyPopulation(evidence);
  return claimPopulation.size >= 2 && claimPopulation.size === evidencePopulation.size &&
    [...claimPopulation].every((name) => evidencePopulation.has(name));
}

function hasSharedExplicitYear(claimText: string, evidence: string): boolean {
  const claimYears = new Set(claimText.match(/\b(?:19|20)\d{2}\b/gu) ?? []);
  const evidenceYears = new Set(evidence.match(/\b(?:19|20)\d{2}\b/gu) ?? []);
  return claimYears.size > 0 && [...claimYears].some((year) => evidenceYears.has(year));
}

function contactStatusPayload(value: string): string | undefined {
  if (/\b(?:no\s+contacts?|ingen\s+andre\s+kontakter?)\b/iu.test(value)) return undefined;
  const copulaTail = /\b(?:were|was|are|is)\s+([^.!?\n]+)\s*[.!?]?\s*$/iu.exec(value)?.[1];
  if (copulaTail !== undefined) return copulaTail;
  const scopes = [...value.matchAll(DESCRIPTIVE_NAMED_PROJECT_SCOPE)];
  const lastScope = scopes.at(-1);
  if (lastScope?.index === undefined) return undefined;
  return value.slice(lastScope.index + lastScope[0].length).replace(/[.!?]+$/u, "").trim();
}

function namedContactSet(value: string): Set<string> {
  const payload = contactStatusPayload(value);
  if (payload === undefined) return new Set();
  const contacts = payload
    .replace(/^listed\s+/iu, "")
    .split(/\s+(?:and|og)\s+|\s*,\s*/iu)
    .map((contact) => contact.trim())
    .filter((contact) => /^[\p{Lu}][\p{L}\p{M}\p{N}.&+'’/-]*(?:\s+[\p{Lu}][\p{L}\p{M}\p{N}.&+'’/-]*){0,5}$/u.test(contact))
    .map(normalizedMaterialText);
  return new Set(contacts);
}

function hasExactNamedContacts(claimText: string, evidence: string): boolean {
  const claimContacts = namedContactSet(claimText);
  const evidenceContacts = namedContactSet(evidence);
  return claimContacts.size > 0 && claimContacts.size === evidenceContacts.size &&
    [...claimContacts].every((contact) => evidenceContacts.has(contact));
}

function expectationResult(value: string): string | undefined {
  const result = /\b(?:the\s+expectation\s+is|forventningen\s+er|er\s+forventningen)\s+([^.!?\n]+)\s*[.!?]?\s*$/iu.exec(value)?.[1] ??
    /\bthe\s+expectation\s+for\s+[^.!?\n]{2,160}?\s+is\s+([^.!?\n]+)\s*[.!?]?\s*$/iu.exec(value)?.[1];
  return result === undefined ? undefined : normalizedMaterialText(result)
    .replace(/^(?:a|an|en|et)\s+/u, "")
    .trim();
}

function hasExactExpectationResult(claimText: string, evidence: string): boolean {
  const claimResult = expectationResult(claimText);
  const evidenceResult = expectationResult(evidence);
  return claimResult !== undefined && claimResult === evidenceResult;
}

function hasNamedExpectationScope(value: string): boolean {
  return namedProjectScopes(value).size > 0 || NAMED_SCOPE.test(value) || /\b(?:Nordic\s+Innovation\s+Hotspot|Food\s+group|transition\s+group)\b/iu.test(value);
}

function namedProjectScopes(value: string): Set<string> {
  const matches = [
    ...value.matchAll(new RegExp(NAMED_PROJECT_SCOPE.source, `${NAMED_PROJECT_SCOPE.flags}g`)),
    ...value.matchAll(DESCRIPTIVE_NAMED_PROJECT_SCOPE),
  ];
  return new Set(matches.map((match) => normalizedMaterialText(match[0])
    .replace(/^(?:for\s+the|for|til|i|on|to)\s+(?:the\s+)?/u, "")));
}

function hasExactNamedProjectScopes(claimText: string, evidence: string): boolean {
  const claimScopes = namedProjectScopes(claimText);
  const evidenceScopes = namedProjectScopes(evidence);
  return claimScopes.size > 0 && claimScopes.size === evidenceScopes.size &&
    [...claimScopes].every((scope) => evidenceScopes.has(scope));
}

function hasNominalDescriptorLine(value: string): boolean {
  return value.split(/\r?\n/u).some((rawLine) => {
    const line = rawLine.trim().replace(/^(?:[-*•]|\d+[.)])\s+/u, "");
    if (line.length === 0 || /:\s*$/u.test(line)) return false;
    return NOMINAL_DESCRIPTOR_EVIDENCE.test(line) && !hasDeclarativeCopulaOrVerb(line);
  });
}

function normalizedLeadingEvidenceClause(value: string): string {
  const firstClause = localClauses(value)[0] ?? "";
  return firstClause
    .replace(/^(?:(?:#{1,6}|[-*•])\s*)+/u, "")
    .replace(/^(?:(?:tema|topic)\s*:\s*)/iu, "")
    .replace(/^(?:(?:prosjektstatus|project\s+status)\s*:\s*|(?:punkt|point)\s+\d+\s*[–—:-]\s*)/iu, "")
    .trim();
}

function hasDeclarativeCopulaOrVerb(value: string): boolean {
  const tokens = value.match(/[\p{L}\p{M}]+/gu) ?? [];
  return tokens.some((token) => {
    if (token.length <= 3 && token === token.toLocaleUpperCase("en")) return false;
    return DECLARATIVE_COPULA_OR_VERB_TOKENS.has(token.toLocaleLowerCase("en"));
  });
}

function quantifiedReturnSegment(value: string): string | undefined {
  return value
    .split(/[.!?;]+/u)
    .find((candidate) => QUANTIFIED_GENERIC_RETURN.test(candidate));
}

function firstSentenceMatching(value: string, pattern: RegExp): string | undefined {
  return value
    .split(/[.!?;\n]+/u)
    .find((candidate) => pattern.test(candidate));
}

function firstLocalClauseMatching(value: string, pattern: RegExp): string | undefined {
  const protectedPeriods = value
    .replace(/(?<=\d)\.(?=\d)/gu, "∯")
    .replace(/\b(?:[\p{Lu}][\p{Ll}]{0,3}|[\p{Lu}]{2,5})\.(?=\s)/gu, (match) => `${match.slice(0, -1)}∯`);
  return protectedPeriods
    .split(/\.(?=\s|$)|[!?;\n]+/u)
    .map((candidate) => candidate.replaceAll("∯", "."))
    .find((candidate) => pattern.test(candidate));
}

function hasNamedPracticalSuccessScope(value: string): boolean {
  const practicalSentence = localClauses(value)
    .find((clause) => PRACTICAL_SUCCESS_DEPENDENCY.test(clause));
  if (practicalSentence === undefined) return false;
  const projectLabel = NAMED_PROJECT_LABEL_SCOPE.exec(practicalSentence);
  if (projectLabel?.index !== undefined) {
    const projectScopedClause = practicalSentence
      .slice(projectLabel.index + projectLabel[0].length)
      .split(/,\s*(?:(?:but|men|and|og)\s+)?/iu)[0] ?? "";
    if (PRACTICAL_SUCCESS_DEPENDENCY.test(projectScopedClause)) return true;
  }
  const practicalClause = practicalSentence
    .split(/,\s*(?:(?:but|men|and|og)\s+)?/iu)
    .find((clause) => PRACTICAL_SUCCESS_DEPENDENCY.test(clause));
  return practicalClause !== undefined && NAMED_PRACTICAL_SUCCESS_SCOPE.test(practicalClause);
}

function hasLocallyDatedStatus(value: string): boolean {
  const markedStatusSentence = firstSentenceMatching(value, CURRENT_STATUS_REFERENCE);
  if (
    markedStatusSentence !== undefined &&
    CURRENT_STATUS_PREDICATE.test(markedStatusSentence)
  ) {
    return EXPLICIT_YEAR.test(markedStatusSentence);
  }
  return value
    .split(/[.!?;\n]+/u)
    .some((candidate) => CURRENT_STATUS_PREDICATE.test(candidate) && EXPLICIT_YEAR.test(candidate));
}

function isPilot13AnalyticalResult(value: string): boolean {
  const outcomeOffset = value.search(PILOT13_ANALYTICAL_OUTCOME);
  const trendOffset = value.search(PILOT13_ANALYTICAL_TREND);
  return (
    (ANALYTICAL_ACTION.test(value) || PILOT13_ANALYTICAL_ACTION.test(value)) &&
    PILOT13_ANALYTICAL_OUTCOME.test(value)
  ) || (
    outcomeOffset >= 0 &&
    trendOffset > outcomeOffset
  ) || (
    PILOT13_ANALYTICAL_OUTCOME.test(value) &&
    /\b(?:er|var|is|was|were)\s+(?:høy|høyt|høye|lav|lavt|lave|high|low)\b/iu.test(value)
  ) || (
    CONDITIONAL_PROFITABILITY_OUTCOME.test(value) &&
    !PROFITABILITY_MECHANISM.test(value)
  );
}

function hasUnresolvedPluralActorPronoun(value: string): boolean {
  const match = PLURAL_ACTOR_PRONOUN.exec(value);
  if (match?.index === undefined) return false;
  return !PLURAL_ACTOR_ANTECEDENT.test(value.slice(0, match.index));
}

function inventoryStatusSentence(value: string): string | undefined {
  return value
    .split(/[.!?;\n]+/u)
    .find((candidate) =>
      INVENTORY_STATUS_MARKER.test(candidate) &&
      INVENTORY_STATUS_ACTION.test(candidate) &&
      INVENTORY_STATUS_OBJECT.test(candidate));
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
    if (!BOUNDED_YEAR_RANGE.test(sentence) && !SINGLE_YEAR_REPORTING_PERIOD.test(sentence)) {
      return true;
    }
  }
  return false;
}

function measurementYears(value: string): string[] {
  const years = new Set<string>();
  for (const range of value.matchAll(new RegExp(BOUNDED_YEAR_RANGE.source, "giu"))) {
    for (const year of range[0].match(/\b(?:19|20)\d{2}\b/gu) ?? []) years.add(year);
  }
  for (const match of value.matchAll(/\b(?:19|20)\d{2}\b/gu)) {
    const year = match[0];
    const offset = match.index;
    const before = value.slice(Math.max(0, offset - 80), offset);
    const after = value.slice(offset + year.length, offset + year.length + 2);
    const openParenthesis = before.lastIndexOf("(");
    const closeParenthesis = before.lastIndexOf(")");
    if (openParenthesis > closeParenthesis) {
      const parenthetical = `${before.slice(openParenthesis)}${year}${after}`;
      if (/^\(\s*(?:19|20)\d{2}\s*\)/u.test(parenthetical)) years.add(year);
      continue;
    }
    if (/\b(?:published|publication|publisert|utgitt|issued)\b[^.!?\n]{0,30}(?:\bi|\bin)?\s*$/iu.test(before)) {
      continue;
    }
    if (/\b(?:i|in|during|for|as\s+of|per|fra|from|til|to|through|between|mellom)\s*$/iu.test(before)) {
      years.add(year);
    }
  }
  return [...years];
}

function hasIncompleteMasterIndexQuantitativeResult(value: string): boolean {
  const years = measurementYears(value);
  if (MASTER_INDEX_CONCENTRATION_COMPARISON.test(value)) return years.length < 2;
  if (!MASTER_INDEX_PERCENT_CHANGE.test(value)) return false;
  return years.length < 1 || !EXPLICIT_COMPARISON_BASIS.test(value);
}

function hasNominalBudgetListEvidence(value: string): boolean {
  const lines = value.split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 3 || !BUDGET_SECTION_HEADING.test(lines[0]!)) return false;
  const contentLines = lines.slice(1);
  if (contentLines.some((line) =>
    !/^(?:[-*•]|\d+[.)])\s+/u.test(line) && hasDeclarativeCopulaOrVerb(line))) {
    return false;
  }
  const amountLines = contentLines.filter((line) => CURRENCY_AMOUNT.test(line));
  return amountLines.length >= 2 && amountLines.every((line) =>
    !hasDeclarativeCopulaOrVerb(line.replace(/^(?:[-*•]|\d+[.)])\s+/u, "")));
}

function hasNominalBudgetBullets(value: string): boolean {
  const lines = value.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  return lines.length >= 2 && lines.every((line) =>
    /^(?:[-*•]|\d+[.)])\s+/u.test(line) && CURRENCY_AMOUNT.test(line) &&
    !hasDeclarativeCopulaOrVerb(line.replace(/^(?:[-*•]|\d+[.)])\s+/u, "")));
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
    !hasGenericMappingIdentity(normalizedClaim) &&
    !MAPPED_ACTOR_SCOPE.test(normalizedClaim) &&
    !EXPLICIT_SCOPED_APPROACH.test(normalizedClaim);
  const unresolvedMappingIdentity = hasGenericMappingIdentity(normalizedClaim) &&
    !hasResolvedMappingIdentity(normalizedClaim);
  const claimNamesMappingObject = hasResolvedMappingIdentity(normalizedClaim) &&
    (EXPLICIT_MAPPING_OBJECT.test(normalizedClaim) || NAMED_MAPPING_METHOD.test(normalizedClaim));
  const claimHasMappingReference = EXPLICIT_MAPPING_OBJECT.test(normalizedClaim) ||
    /\b(?:lokale?|regionale?|local|regional|resource|materialstrøms?|material[- ]flow)\b[^.!?\n]{0,60}\b(?:kartlegging(?:en|er|ene)?|mapping(?:s)?)\b/iu.test(normalizedClaim);
  const surveyScopeSensitiveClaim = SURVEY_DEPENDENT_CLAIM.test(normalizedClaim) ||
    SURVEY_PURPOSE_CLAIM.test(normalizedClaim);
  const surveySubjectClaim = surveyScopeSensitiveClaim || SURVEY_SUBJECT_CLAIM.test(normalizedClaim);
  const bareMethodEvidenceClause = firstLocalClauseMatching(
    normalizedEvidence,
    BARE_METHOD_EVIDENCE_REFERENCE,
  );
  if (NON_DECLARATIVE_METADATA_CLAIM.test(normalizedClaim)) {
    throw new Error("agent_response_non_declarative_claim");
  }
  if (
    CONTEXT_DEPENDENT_OPENING.test(normalizedClaim) ||
    (DEICTIC_DOCUMENT_REFERENCE.test(normalizedClaim) &&
      !NAMED_DOCUMENT_REFERENCE.test(normalizedClaim)) ||
    (UNANCHORED_RELATIVE_REFERENCE.test(normalizedClaim) && !EXPLICIT_YEAR.test(normalizedClaim)) ||
    AUDITED_GENERIC_SUBJECT.test(normalizedClaim) ||
    AUDITED_HERE_REFERENCE.test(normalizedClaim) ||
    unresolvedAnotherFactor ||
    unresolvedGenericReference ||
    unresolvedMappingIdentity ||
    hasUnresolvedPluralActorPronoun(normalizedClaim) ||
    BARE_DATA_REFERENCE.test(normalizedClaim) ||
    UNRESOLVED_GENERIC_METHOD_OPENING.test(normalizedClaim) ||
    unresolvedLocalReference
  ) {
    throw new Error("agent_response_context_dependent_claim");
  }
  if (
    (PRACTICAL_SUCCESS_DEPENDENCY.test(normalizedClaim) ||
      PRACTICAL_SUCCESS_DEPENDENCY.test(normalizedEvidence)) &&
    (!hasNamedPracticalSuccessScope(normalizedClaim) ||
      !hasNamedPracticalSuccessScope(normalizedEvidence))
  ) {
    throw new Error("agent_response_practical_success_scope_missing");
  }
  if (
    /\b(?:reports?|rapporterer)\b[\s\S]{0,180}\b(?:measures?|actions?|tiltak)\b/iu.test(normalizedEvidence) &&
    /\b(?:has|have|har)\b[\s\S]{0,100}\b(?:measures?|actions?|tiltak)\b/iu.test(normalizedClaim) &&
    !/\b(?:reports?|rapporterer|reported|rapportert)\b/iu.test(normalizedClaim)
  ) {
    throw new Error("agent_response_reported_measure_context_missing");
  }
  if (
    hasUnboundedPeriodReference(normalizedClaim)
  ) {
    throw new Error("agent_response_period_scope_missing");
  }
  if (
    namedStudyIdentity === undefined &&
    (DEICTIC_STUDY_REFERENCE.test(normalizedClaim) ||
      DEICTIC_STUDY_REFERENCE.test(normalizedEvidence) ||
      DEFINITE_SURVEY_REFERENCE.test(normalizedClaim) ||
      DEFINITE_SURVEY_REFERENCE.test(normalizedEvidence)) &&
    !surveyScopeSensitiveClaim
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
    (DEICTIC_DOCUMENT_REFERENCE.test(normalizedEvidence) &&
      !NAMED_DOCUMENT_REFERENCE.test(normalizedEvidence)) ||
    CONTEXT_DEPENDENT_DISCOURSE_OPENING.test(normalizedEvidence) ||
    EARLY_GENERIC_EVIDENCE_REFERENCE.test(normalizedEvidence) ||
    BARE_DATA_REFERENCE.test(normalizedEvidence) ||
    (UNRESOLVED_GENERIC_REFERENCE.exec(normalizedEvidence)?.index === 0 &&
      !hasGenericMappingIdentity(normalizedEvidence) &&
      !MAPPED_ACTOR_SCOPE.test(normalizedEvidence) &&
      !EXPLICIT_SCOPED_APPROACH.test(normalizedEvidence)) ||
    (hasGenericMappingIdentity(normalizedEvidence) &&
      !hasResolvedMappingIdentity(normalizedEvidence)) ||
    (claimNamesMappingObject && !hasResolvedMappingIdentity(normalizedEvidence)) ||
    (claimNamesMappingObject && /\b(?:metoden|method|kartlegging(?:en|er|ene)?|the\s+mapping)\b/iu.test(normalizedEvidence) &&
      !EXPLICIT_MAPPING_OBJECT.test(normalizedEvidence) && !NAMED_MAPPING_METHOD.test(normalizedEvidence)) ||
    (claimHasMappingReference && /\b(?:metoden|method|kartlegging(?:en|er|ene)?|the\s+mapping|the\s+local,?\s+more\s+practical\s+work)\b/iu.test(normalizedEvidence) &&
      !EXPLICIT_MAPPING_OBJECT.test(normalizedEvidence) && !NAMED_MAPPING_METHOD.test(normalizedEvidence)) ||
    (NOMINAL_QUANTIFIER_FRAGMENT.test(normalizedEvidence) &&
      !hasDeclarativeCopulaOrVerb(normalizedEvidence)) ||
    (CLAIM_METHOD_REFERENCE.test(normalizedClaim) &&
      bareMethodEvidenceClause !== undefined &&
      !NAMED_METHOD_CONTEXT.test(bareMethodEvidenceClause) &&
      !SCOPED_METHOD_REFERENCE.test(bareMethodEvidenceClause)) ||
    hasUnresolvedLocalReference(normalizedEvidence)
  ) {
    throw new Error("agent_response_evidence_context_dependent");
  }
  if (
    namedStudyIdentity !== undefined &&
    (CONTEXT_DEPENDENT_EVIDENCE_OPENING.test(normalizedEvidence) || surveySubjectClaim) &&
    !normalizedMaterialText(normalizedEvidence).includes(normalizedMaterialText(namedStudyIdentity))
  ) {
    throw new Error("agent_response_evidence_context_dependent");
  }
  if (
    surveySubjectClaim &&
    PARTICIPIAL_SURVEY_EVIDENCE.test(normalizedEvidence) &&
    !/\b(?:survey|questionnaire|undersøkelsen|spørreskjema)\b/iu.test(normalizedEvidence)
  ) {
    throw new Error("agent_response_evidence_context_dependent");
  }
  if (
    INCOMPLETE_NEGATED_ANALYSIS_EVIDENCE.test(normalizedEvidence) ||
    INCOMPLETE_LIST_LEAD_IN_EVIDENCE.test(normalizedEvidence)
  ) {
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
    STAFFING_CAPACITY_DECISION.test(normalizedClaim) &&
    (!EXPLICIT_YEAR.test(normalizedClaim) || !EXPLICIT_YEAR.test(normalizedEvidence) ||
      !/\b(?:Jan\s+Thomas|Einar)\b/iu.test(normalizedClaim) ||
      !/\b(?:Jan\s+Thomas|Einar)\b/iu.test(normalizedEvidence) ||
      !NAMED_PROJECT_SCOPE.test(claimText) || !NAMED_PROJECT_SCOPE.test(evidence) ||
      !hasExactNamedProjectScopes(claimText, evidence))
  ) {
    throw new Error("agent_response_staffing_scope_or_as_of_missing");
  }
  if (
    REPORTED_CAUSAL_CONNECTOR.test(normalizedClaim) &&
    !REPORTED_CAUSAL_CONNECTOR.test(normalizedEvidence)
  ) {
    throw new Error("agent_response_evidence_incomplete");
  }
  if (
    PRACTICAL_SIMPLIFICATION.test(normalizedEvidence) &&
    /\b(?:defined|definition|calculated|calculation|definer(?:es)?|beregn(?:es|et)|måler|measure)\b/iu.test(normalizedClaim) &&
    !PRACTICAL_SIMPLIFICATION.test(normalizedClaim)
  ) {
    throw new Error("agent_response_practical_simplification_missing");
  }
  if (
    /\b(?:not\s+publicly\s+searchable|ikke\s+offentlig(?:e)?\s+s(?:ø|o)kbare?)\b/iu.test(normalizedClaim) &&
    /\b(?:listed\s+companies|these\s+companies|listed\s+entities|disse\s+selskapene)\b/iu.test(normalizedClaim) &&
    (!hasSameNamedCompanyPopulation(claimText, evidence) ||
      !hasSharedExplicitYear(claimText, evidence))
  ) {
    throw new Error("agent_response_material_exclusion_scope_missing");
  }
  if (
    CONTACT_STATUS.test(normalizedClaim) &&
    (!CONTACT_STATUS.test(normalizedEvidence) || !EXPLICIT_YEAR.test(normalizedClaim) || !EXPLICIT_YEAR.test(normalizedEvidence) ||
      !hasSharedExplicitYear(claimText, evidence) || !hasExactNamedProjectScopes(claimText, evidence) ||
      !hasExactNamedContacts(claimText, evidence) ||
      (/\bonly\s+real\s+contacts?\s+listed\b/iu.test(normalizedClaim) &&
        !/\b(?:contacts?|kontakt(?:en|er|ene)?)\b[\s\S]{0,30}\b(?:is|are|was|were|er|var|listed|listet)\b/iu.test(normalizedEvidence)))
  ) {
    throw new Error("agent_response_status_scope_or_as_of_missing");
  }
  if (
    GENERIC_EXPECTATION_ANYWHERE.test(normalizedEvidence) &&
    (!hasNamedExpectationScope(claimText) || !hasNamedExpectationScope(evidence) ||
      !hasExactNamedProjectScopes(claimText, evidence) ||
      !hasExactExpectationResult(claimText, evidence))
  ) {
    throw new Error("agent_response_expectation_actor_scope_missing");
  }
  if (
    BARE_MATERIAL_EXCLUSION_SCOPE.test(normalizedClaim) ||
    BARE_DATASET_EXCLUSION_VARIANT.test(normalizedClaim) ||
    INCOMPLETE_MATERIAL_EXCLUSION_SCOPE.test(normalizedClaim) ||
    ANONYMOUS_SUPPLIER_EXCLUSION.test(normalizedClaim)
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
  if (PASSIVE_IDENTIFICATION.test(normalizedClaim) && !PASSIVE_NAMED_ACTOR.test(normalizedClaim)) {
    throw new Error("agent_response_identification_actor_missing");
  }
  if (
    PASSIVE_EVALUATION.test(normalizedClaim) &&
    !/\bdette\s+vurderes\s+som\b/iu.test(normalizedClaim) &&
    ((!PASSIVE_NAMED_ACTOR.test(normalizedClaim) && !PASSIVE_NAMED_EVALUATOR_SCOPE.test(normalizedClaim)) ||
      (!PASSIVE_NAMED_ACTOR.test(normalizedEvidence) && !PASSIVE_NAMED_EVALUATOR_SCOPE.test(normalizedEvidence)))
  ) {
    throw new Error("agent_response_identification_actor_missing");
  }
  if (
    PASSIVE_LOCAL_CLASSIFICATION.test(normalizedEvidence) &&
    (!NAMED_CLASSIFICATION_CONTEXT.test(normalizedClaim) ||
      !NAMED_CLASSIFICATION_CONTEXT.test(normalizedEvidence))
  ) {
    throw new Error("agent_response_classification_context_missing");
  }
  if (
    REPORTED_DATASET_COVERAGE.test(normalizedClaim) &&
    MATERIAL_EXCLUSION.test(normalizedEvidence) &&
    !MATERIAL_EXCLUSION.test(normalizedClaim)
  ) {
    throw new Error("agent_response_material_exclusion_missing");
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
  if (
    MASTER_ANALYSIS_INDEX.test(sourceText) &&
    (hasIncompleteMasterIndexQuantitativeResult(claimText) ||
      hasIncompleteMasterIndexQuantitativeResult(evidence))
  ) {
    throw new Error("agent_response_quantitative_measure_context_missing");
  }
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
  if (COMPARATIVE_RETAIL_COST.test(claimText) && EMPIRICAL_GENERALIZER.test(claimText)) {
    const claimPeriods = boundedYearRangeKeys(claimText);
    const evidencePeriods = boundedYearRangeKeys(evidence);
    if (
      claimPeriods.size === 0 ||
      evidencePeriods.size === 0 ||
      [...claimPeriods].some((period) => !evidencePeriods.has(period))
    ) {
      throw new Error("agent_response_comparative_cost_context_missing");
    }
  }
  if (QUANTIFIED_RESOURCE_SHARE.test(claimText)) {
    const claimPeriods = boundedYearRangeKeys(claimText);
    const evidencePeriods = boundedYearRangeKeys(evidence);
    if (
      claimPeriods.size === 0 ||
      evidencePeriods.size === 0 ||
      [...claimPeriods].some((period) => !evidencePeriods.has(period)) ||
      !RESOURCE_SHARE_BASIS.test(claimText) ||
      !RESOURCE_SHARE_BASIS.test(evidence)
    ) {
      throw new Error("agent_response_resource_share_context_missing");
    }
  }
  if (ARTIFACT_RETENTION_STATUS.test(claimText)) {
    if (!ARTIFACT_RETENTION_STATUS.test(evidence) ||
      !EXPLICIT_YEAR.test(claimText) ||
      !EXPLICIT_YEAR.test(evidence)) {
      throw new Error("agent_response_retention_as_of_missing");
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
  const claimOwnershipSentence = firstLocalClauseMatching(claimText, OWNERSHIP_OR_CONTROL);
  const evidenceOwnershipSentence = firstLocalClauseMatching(evidence, OWNERSHIP_OR_CONTROL);
  if (claimOwnershipSentence !== undefined && (
    evidenceOwnershipSentence === undefined ||
    !EXPLICIT_YEAR.test(claimOwnershipSentence) ||
    !EXPLICIT_YEAR.test(evidenceOwnershipSentence)
  )) {
    throw new Error("agent_response_ownership_as_of_missing");
  }
  const treasuryClaim = /\b(?:held|holds|hadde|holdt|eier)\b[\s\S]{0,100}\b(?:treasury\s+shares?|egne\s+aksjer)\b/iu.test(claimText);
  if (treasuryClaim && !/\b(?:treasury\s+shares?|egne\s+aksjer)\b/iu.test(evidence)) {
    throw new Error("agent_response_ownership_scope_missing");
  }
  const claimTreasuryOwner = treasuryClaim ? treasuryOwner(claimText) : undefined;
  const evidenceTreasuryOwner = treasuryClaim ? treasuryOwner(evidence) : undefined;
  if (treasuryClaim && (
    claimTreasuryOwner === undefined || evidenceTreasuryOwner === undefined ||
    claimTreasuryOwner !== evidenceTreasuryOwner
  )) {
    throw new Error("agent_response_ownership_scope_missing");
  }
  const claimDatasetReceiptSentence = firstLocalClauseMatching(claimText, REPORTED_DATASET_RECEIPT);
  const evidenceDatasetReceiptSentence = firstLocalClauseMatching(evidence, REPORTED_DATASET_RECEIPT);
  if (claimDatasetReceiptSentence !== undefined && (
    evidenceDatasetReceiptSentence === undefined ||
    !EXPLICIT_YEAR.test(claimDatasetReceiptSentence) ||
    !EXPLICIT_YEAR.test(evidenceDatasetReceiptSentence)
  )) {
    throw new Error("agent_response_reported_dataset_context_missing");
  }
  if (
    TOTAL_BUDGET_AMOUNT.test(claimText) &&
    PER_GROUP_BUDGET_SCOPE.test(sourceText) &&
    (!PER_GROUP_BUDGET_SCOPE.test(claimText) || !PER_GROUP_BUDGET_SCOPE.test(evidence))
  ) {
    throw new Error("agent_response_budget_scope_missing");
  }
  if (
    PERIOD_ONLY_FRAGMENT.test(evidence) &&
    /\b(?:resultat(?:s|ene)?|balanse(?:oppstillinger)?|balance\s+sheets?|income\s+statements?|stores?|butikker|Norgesgruppen)\b/iu.test(claimText)
  ) {
    throw new Error("agent_response_period_fragment_context_missing");
  }
  if (
    FOOTNOTE_LIST_FRAGMENT.test(evidence) &&
    /\b(?:footnote|fotnote|identif(?:ies|iser)|retail-level|units?|enheter|stores?|butikker)\b/iu.test(claimText)
  ) {
    throw new Error("agent_response_footnote_context_missing");
  }
  const quantifiedShareClaim = claimText
    .split(/[.!?]+/u)
    .find((segment) => QUANTIFIED_MARKET_SHARE.test(segment) || IMPLICIT_MARKET_SHARE.test(segment));
  const quantifiedShareEvidence = evidence
    .split(/[.!?]+/u)
    .find((segment) => QUANTIFIED_MARKET_SHARE.test(segment) || IMPLICIT_MARKET_SHARE.test(segment));
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
    (SURVEY_DEPENDENT_CLAIM.test(claimText) ||
      SURVEY_PURPOSE_CLAIM.test(claimText) ||
      SURVEY_SUBJECT_CLAIM.test(claimText)) &&
    (!LOCAL_SURVEY_SCOPE.test(claimText) ||
      !LOCAL_SURVEY_SCOPE.test(evidence) ||
      normalizedMaterialText(LOCAL_SURVEY_SCOPE.exec(claimText)?.[0] ?? "") !==
        normalizedMaterialText(LOCAL_SURVEY_SCOPE.exec(evidence)?.[0] ?? "") ||
      [...geographyMarkers(claimText)].some((geography) => !geographyMarkers(evidence).has(geography)))
  ) {
    throw new Error("agent_response_survey_scope_missing");
  }
  const namedStudyIdentity = NAMED_STUDY_IDENTITY.exec(claimText)?.[1] ??
    NAMED_NORWEGIAN_STUDY_IDENTITY.exec(claimText)?.[1] ??
    TITLE_CASE_STUDY_IDENTITY.exec(claimText)?.[1] ??
    DEICTIC_STUDY_BY_IDENTITY.exec(claimText)?.[1] ??
    DEICTIC_STUDY_CALLED_IDENTITY.exec(claimText)?.[1] ??
    DEICTIC_STUDY_PAREN_IDENTITY.exec(claimText)?.[1] ??
    DEICTIC_STUDY_DASH_IDENTITY.exec(claimText)?.[1];
  if (
    SURVEY_UNIT_CONTEXT.test(sourceText) &&
    (SURVEY_DEPENDENT_CLAIM.test(claimText) || SURVEY_PURPOSE_CLAIM.test(claimText) || SURVEY_SUBJECT_CLAIM.test(claimText)) &&
    DEFINITE_SURVEY_REFERENCE.test(claimText) &&
    namedStudyIdentity === undefined
  ) {
    throw new Error("agent_response_study_identity_missing");
  }
  if (
    namedStudyIdentity !== undefined &&
    DEFINITE_SURVEY_REFERENCE.test(evidence) &&
    !normalizedMaterialText(evidence).includes(normalizedMaterialText(namedStudyIdentity))
  ) {
    throw new Error("agent_response_evidence_context_dependent");
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
): {
  actors: string[];
  yearRanges: Set<string>;
  inflationQualified: boolean;
  indexBase: string | undefined;
  firstTransactionScoped: boolean;
  electricitySupportExcluded: boolean;
} | undefined {
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
    indexBase: FIGURE_INDEX_BASE.exec(context)?.[1],
    firstTransactionScoped: FIGURE_FIRST_TRANSACTION_SCOPE.test(context),
    electricitySupportExcluded: FIGURE_ELECTRICITY_SUPPORT_EXCLUSION.test(context),
  };
}

function assertPilot12ScopeCompleteness(
  claimText: string,
  evidence: string,
  sourceText: string,
): void {
  if (
    PRODUCT_SUPERLATIVE.test(claimText) &&
    (!EXPLICIT_YEAR.test(claimText) || !EXPLICIT_YEAR.test(evidence) ||
      !SUPERLATIVE_UNIVERSE.test(claimText) || !SUPERLATIVE_UNIVERSE.test(evidence) ||
      canonicalKnownGeographies(claimText).size === 0 ||
      [...canonicalKnownGeographies(claimText)].some((geography) => !canonicalKnownGeographies(evidence).has(geography)))
  ) {
    throw new Error("agent_response_superlative_scope_missing");
  }
  if (
    /\b(?:RNOA|avkastning)\b/iu.test(claimText) &&
    /\b(?:syv|sju|seven)\s+(?:leverandør(?:er|ene)|suppliers?)\b/iu.test(claimText) &&
    /\b(?:omsetningsvekting|weighted\s+by\s+turnover|sales[- ]weighted)\b/iu.test(claimText) &&
    !/\b2017\s*(?:[-–—]|to|til(?:\s+og\s+med)?|through)\s*2022\b/iu.test(claimText)
  ) {
    throw new Error("agent_response_figure_context_missing");
  }
  const figureNumber = FIGURE_REFERENCE.exec(claimText)?.[1];
  if (
    figureNumber !== undefined &&
    (FIGURE_PERCENT_VALUE.test(claimText) || FIGURE_MULTIPLE_VALUE.test(claimText)) &&
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
        (!NOT_INFLATION_ADJUSTED.test(claimText) || !NOT_INFLATION_ADJUSTED.test(evidence))) ||
      (context.indexBase !== undefined && (
        !normalizedMaterialText(claimText).includes(normalizedMaterialText(context.indexBase)) ||
        !normalizedMaterialText(evidence).includes(normalizedMaterialText(context.indexBase)))) ||
      (context.firstTransactionScoped && (
        !FIGURE_FIRST_TRANSACTION_SCOPE.test(claimText) ||
        !FIGURE_FIRST_TRANSACTION_SCOPE.test(evidence))) ||
      (context.electricitySupportExcluded && (
        !FIGURE_ELECTRICITY_SUPPORT_EXCLUSION.test(claimText) ||
        !FIGURE_ELECTRICITY_SUPPORT_EXCLUSION.test(evidence)))
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

function assertPilot13ScopeCompleteness(
  claimText: string,
  evidence: string,
): void {
  const claimStatusSentence = firstSentenceMatching(claimText, CURRENT_STATUS_REFERENCE);
  const evidenceStatusSentence = firstSentenceMatching(evidence, CURRENT_STATUS_REFERENCE);
  if (
    (
      (claimStatusSentence !== undefined && CURRENT_STATUS_PREDICATE.test(claimStatusSentence)) ||
      (evidenceStatusSentence !== undefined && CURRENT_STATUS_PREDICATE.test(evidenceStatusSentence))
    ) &&
    (!hasLocallyDatedStatus(claimText) || !hasLocallyDatedStatus(evidence))
  ) {
    throw new Error("agent_response_status_as_of_missing");
  }

  const claimInventoryStatus = inventoryStatusSentence(claimText);
  const evidenceInventoryStatus = inventoryStatusSentence(evidence);
  if (
    claimInventoryStatus !== undefined &&
    (
      evidenceInventoryStatus === undefined ||
      !EXPLICIT_YEAR.test(claimInventoryStatus) ||
      !EXPLICIT_YEAR.test(evidenceInventoryStatus)
    )
  ) {
    throw new Error("agent_response_status_as_of_missing");
  }

  const conditionalProfitabilityOutcome =
    CONDITIONAL_PROFITABILITY_OUTCOME.test(claimText) &&
    !PROFITABILITY_MECHANISM.test(claimText);
  const nonExemptAnalyticalResult = conditionalProfitabilityOutcome || claimText
    .split(/[.!?;\n]+/u)
    .flatMap((sentence) => sentence.split(/\b(?:og|and|while|mens|but|men)\b/iu))
    .some((clause) =>
      isPilot13AnalyticalResult(clause) &&
      !ANALYTICAL_DEFINITION.test(clause) &&
      !ANALYTICAL_NO_SUPPORT.test(clause));
  if (
    nonExemptAnalyticalResult &&
    (
      !BOUNDED_YEAR_RANGE.test(claimText) ||
      !BOUNDED_YEAR_RANGE.test(evidence) ||
      !ANALYTICAL_BASIS.test(claimText) ||
      !ANALYTICAL_BASIS.test(evidence)
    )
  ) {
    throw new Error("agent_response_analytical_measure_context_missing");
  }
  if (
    QUANTIFIED_GROSS_MARGIN_RANGE.test(claimText) &&
    (
      !BOUNDED_YEAR_RANGE.test(claimText) ||
      !BOUNDED_YEAR_RANGE.test(evidence) ||
      !ANALYTICAL_BASIS.test(claimText) ||
      !ANALYTICAL_BASIS.test(evidence) ||
      !GROSS_MARGIN_UNIVERSE.test(claimText) ||
      !GROSS_MARGIN_UNIVERSE.test(evidence)
    )
  ) {
    throw new Error("agent_response_analytical_measure_context_missing");
  }

  const claimLocalSentence = firstSentenceMatching(claimText, LOCAL_HERE_DEFINITION);
  const evidenceLocalSentence = firstSentenceMatching(evidence, LOCAL_HERE_DEFINITION);
  if (
    (claimLocalSentence !== undefined && !NAMED_LOCAL_CONTEXT.test(claimLocalSentence)) ||
    (evidenceLocalSentence !== undefined && !NAMED_LOCAL_CONTEXT.test(evidenceLocalSentence))
  ) {
    throw new Error("agent_response_local_reference_missing");
  }

  const claimIndexSentence = firstSentenceMatching(claimText, INTERPRETIVE_INDEX_VALUE);
  const evidenceIndexSentence = firstSentenceMatching(evidence, INTERPRETIVE_INDEX_VALUE);
  if (
    (claimIndexSentence !== undefined && !NAMED_INDEX_IDENTITY.test(claimIndexSentence)) ||
    (evidenceIndexSentence !== undefined && !NAMED_INDEX_IDENTITY.test(evidenceIndexSentence))
  ) {
    throw new Error("agent_response_index_identity_missing");
  }

  const claimStaffingSentence = firstSentenceMatching(claimText, STAFFING_ALLOCATION_CHANGE);
  const evidenceStaffingSentence = firstSentenceMatching(evidence, STAFFING_ALLOCATION_CHANGE);
  if (
    claimStaffingSentence !== undefined &&
    (
      !EXPLICIT_YEAR.test(claimStaffingSentence) ||
      !NAMED_PROJECT_SCOPE.test(claimStaffingSentence) ||
      evidenceStaffingSentence === undefined ||
      !EXPLICIT_YEAR.test(evidenceStaffingSentence) ||
      !NAMED_PROJECT_SCOPE.test(evidenceStaffingSentence)
    )
  ) {
    throw new Error("agent_response_staffing_scope_or_as_of_missing");
  }
  if (
    SALES_AMOUNT.test(claimText) &&
    PERCENT_VALUE.test(claimText) &&
    MARKET_SHARE_LABEL.test(evidence) &&
    MARKET_VALUE_DENOMINATOR.test(evidence) &&
    (!MARKET_SHARE_LABEL.test(claimText) || !MARKET_VALUE_DENOMINATOR.test(claimText))
  ) {
    throw new Error("agent_response_share_measure_missing");
  }
  if (hasDetachedMarketShareMeasure(claimText) || hasDetachedMarketShareMeasure(evidence)) {
    throw new Error("agent_response_share_measure_missing");
  }
}

function hasDetachedMarketShareMeasure(value: string): boolean {
  if (!MARKET_SHARE_LABEL.test(value) || !MARKET_VALUE_DENOMINATOR.test(value)) return false;
  const clauses = value.split(
    /(?<!\d)[.!?](?!\d)|;+|,\s*(?=(?:i|in)\s+(?:19|20)\d{2}\b)|\s*,?\s+\b(?:og|and)\b\s+(?=(?:i|in)\s+(?:19|20)\d{2}\b)/iu,
  );
  return clauses.some((clause) =>
    EXPLICIT_YEAR.test(clause) &&
    SALES_AMOUNT.test(clause) &&
    PERCENT_VALUE.test(clause) &&
    (!MARKET_SHARE_LABEL.test(clause) || !MARKET_VALUE_DENOMINATOR.test(clause)));
}

function assertAuthorityLanguageIsSourceVisible(claimText: string, evidence: string): void {
  const evidenceSubjects = new Set(attributionSubjects(evidence));
  if (
    attributionSubjects(claimText).some((subject) => !evidenceSubjects.has(subject))
  ) {
    throw new Error("agent_response_actor_attribution_not_source_visible");
  }
  const claimAuthorities = namedAuthorityIdentities(claimText);
  const evidenceAuthorities = namedAuthorityIdentities(evidence);
  if ([...claimAuthorities].some((authority) => !evidenceAuthorities.has(authority))) {
    throw new Error("agent_response_authority_actor_not_source_visible");
  }
  if (!hasSourceVisibleFinancialAward(claimText, evidence)) {
    throw new Error("agent_response_award_action_not_source_visible");
  }
  for (const term of AUTHORITY_TERMS) {
    if (term.test(claimText) && !term.test(evidence)) {
      throw new Error("agent_response_authority_overreach");
    }
  }
}

export function assertLibraryAnalysisClaimLocalityV114(input: {
  claimText: string;
  evidence: string;
  sourceText: string;
  unitType: string;
}): void {
  assertSelfContainedClaimText(input.claimText, input.evidence);
  assertDeclarativeEvidence(input.claimText, input.evidence);
  assertAuditedScopeCompleteness(input.claimText, input.evidence, input.sourceText);
  assertPilot12ScopeCompleteness(input.claimText, input.evidence, input.sourceText);
  assertTabularEvidenceContext(input.evidence, input.unitType, input.sourceText);
  assertPilot13ScopeCompleteness(input.claimText, input.evidence);
  assertAuthorityLanguageIsSourceVisible(input.claimText, input.evidence);
}

/** @deprecated Use the current locality gate. Retained for import compatibility. */
export const assertLibraryAnalysisClaimLocalityV113 = assertLibraryAnalysisClaimLocalityV114;
/** @deprecated Use the current locality gate. Retained for import compatibility. */
export const assertLibraryAnalysisClaimLocalityV112 = assertLibraryAnalysisClaimLocalityV114;

function assertDeclarativeEvidence(claimText: string, evidence: string): void {
  const leadingEvidenceClause = normalizedLeadingEvidenceClause(evidence);
  if (
    (
      NOMINAL_CHALLENGE_HEADING.test(leadingEvidenceClause) ||
      hasNominalBudgetListEvidence(evidence) ||
      (hasNominalBudgetBullets(evidence) && /\b(?:budget|budsjett|totalt?|total|per\s+(?:transition\s+group|gruppe))\b/iu.test(claimText)) ||
      (hasNominalDescriptorLine(evidence) &&
        (PASSIVE_EVALUATION.test(claimText) || /\b(?:was|were)\s+described\s+as\b/iu.test(claimText))) ||
      (NOMINAL_BUDGET_FRAGMENT.test(leadingEvidenceClause) &&
        /(?:\s*[:–—-]\s*|\s+per\s+)[^.!?\n]{0,160}\b\d+(?:[\s.,]\d+)*\s*(?:kr|NOK|kroner|EUR|euro|USD|dollars?)\b/iu.test(leadingEvidenceClause)) ||
      (TOTAL_BUDGET_AMOUNT.test(leadingEvidenceClause) &&
        PER_GROUP_BUDGET_SCOPE.test(leadingEvidenceClause) &&
        !AWARD_ACTION.test(claimText))
    ) &&
    !hasDeclarativeCopulaOrVerb(leadingEvidenceClause)
  ) {
    throw new Error("agent_response_non_declarative_evidence");
  }
  if (
    isInterrogativeEvidence(evidence) &&
    (
      !CLAIM_REPORTS_A_QUESTION.test(claimText) ||
      CLAIM_ADDS_RESULT_TO_QUESTION.test(claimText) ||
      CLAIM_ADDS_BARE_ANSWER_TO_QUESTION.test(claimText) ||
      CLAIM_HAS_STANDALONE_ANSWER_CLAUSE.test(claimText) ||
      claimAddsUnsupportedPunctuationAnswer(claimText, evidence)
    )
  ) {
    throw new Error("agent_response_interrogative_evidence_not_result");
  }
}

function claimAddsUnsupportedPunctuationAnswer(claimText: string, evidence: string): boolean {
  const reportMatch = CLAIM_REPORTS_A_QUESTION.exec(claimText);
  if (!reportMatch) return false;
  const suffix = claimText.slice((reportMatch.index ?? 0) + reportMatch[0].length);
  const tailMatch = /[,:(]\s*([^,;:()—–]{1,80}?)\)?[.]?\s*$/u.exec(suffix);
  if (!tailMatch?.[1]) return false;
  const evidenceTokens = new Set(
    evidence.toLocaleLowerCase("en").match(/[\p{L}\p{N}]+/gu) ?? [],
  );
  const tailTokens = tailMatch[1].toLocaleLowerCase("en").match(/[\p{L}\p{N}]+/gu) ?? [];
  return tailTokens.some((token) => !evidenceTokens.has(token));
}

function isInterrogativeEvidence(evidence: string): boolean {
  const questionMark = evidence.lastIndexOf("?");
  if (questionMark < 0) return false;
  let trailing = evidence.slice(questionMark + 1).trim();
  let prior = "";
  while (trailing !== prior) {
    prior = trailing;
    trailing = trailing.replace(TRAILING_QUESTION_CITATION, "").trim();
  }
  return trailing.length === 0 ||
    FORM_INSTRUCTION_AFTER_QUESTION.test(trailing) ||
    !DECLARATIVE_RESULT_AFTER_QUESTION.test(trailing);
}

function parseDelimitedDataLine(line: string): { cells: string[]; delimiter: "," | "\t" } | null {
  if (!DELIMITED_ROW.test(line)) return null;
  const delimiter = line.includes("\t") ? "\t" : ",";
  const cells = line.split(delimiter).map((cell) => cell.trim());
  if (
    delimiter === "," &&
    /^(?:A|An|The|This|That|En|Et|Den|Det|Dette)\b/iu.test(line.trim()) &&
    /[.!?]\s*$/u.test(line) &&
    cells.every((cell) => !hasDelimitedDataLiteral(cell))
  ) {
    return null;
  }
  return cells.length >= 2 && cells.every((cell) => cell.length > 0)
    ? { cells, delimiter }
    : null;
}

function hasDelimitedDataLiteral(value: string): boolean {
  return /(?:https?:\/\/|\b(?:19|20)\d{2}\b|(?:^|\s)[+-]?\d+(?:[.,]\d+)?(?:\s|$)|[%€$£]|\b(?:NOK|EUR|USD|P[0-9]+)\b)/iu.test(value);
}

function looksLikeDelimitedHeader(line: string, nextLine: string | undefined): boolean {
  const parsed = parseDelimitedDataLine(line);
  if (!parsed || parsed.cells.some(hasDelimitedDataLiteral)) return false;
  const next = nextLine === undefined ? null : parseDelimitedDataLine(nextLine);
  if (
    next === null ||
    next.delimiter !== parsed.delimiter ||
    next.cells.length !== parsed.cells.length
  ) {
    return false;
  }
  const allNamedHeaderFields = parsed.cells.every((cell) => {
    const words = cell.toLocaleLowerCase("en").split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    return words.length > 0 && words.every((word) => TABULAR_HEADER_WORDS.has(word));
  });
  return allNamedHeaderFields;
}

function assertTabularEvidenceContext(
  evidence: string,
  unitType: string,
  sourceText: string,
): void {
  const trimmedEvidence = evidence.trim();
  const isSingleLogicalLine = !trimmedEvidence.includes("\n") && !trimmedEvidence.includes("\r");
  const sourceLines = sourceText.trim().split(/\r?\n/u).filter((line) => line.trim().length > 0);
  const evidenceLines = trimmedEvidence.split(/\r?\n/u);
  const sourceHeaders = sourceLines.filter((line, index) =>
    looksLikeDelimitedHeader(line, sourceLines[index + 1]));
  const evidenceHasDelimitedRow = evidenceLines.some((line) => parseDelimitedDataLine(line) !== null);
  const evidenceIncludesSourceHeader = sourceHeaders.some((header) => evidenceLines.includes(header));
  if (
    (
      unitType === "sheet_range" &&
      evidenceHasDelimitedRow &&
      !evidenceIncludesSourceHeader &&
      !EXPLICIT_TABULAR_FIELDS.test(evidence)
    ) || (
      MARKDOWN_DATA_ROW.test(trimmedEvidence) &&
      isSingleLogicalLine &&
      !EXPLICIT_MARKDOWN_FIELDS.test(evidence)
    )
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
  for (const coverage of response.unitCoverage) {
    const unit = ownedUnit(input.job, coverage.contentUnitId);
    if (
      coverage.status === "no_material_claim" &&
      hasObviousMaterialClaim(unit.text, unit.descriptor.unitType)
    ) {
      throw new Error("agent_response_material_claim_omission");
    }
    if (
      coverage.status === "blocked" &&
      hasClearlyExtractableBlockedMaterial(unit.text)
    ) {
      throw new Error("agent_response_blocked_material_claim");
    }
  }
  const coverageByUnit = new Map(response.unitCoverage.map((coverage) => [coverage.contentUnitId, coverage]));
  const claims = response.claims.map((claim) => {
    const claimId = deterministicLibraryAnalysisAgentClaimId(input.job.job, claim);
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
    try {
      assertLibraryAnalysisClaimLocalityV114({
        claimText: claim.text,
        evidence: claim.evidence,
        sourceText: unit.text,
        unitType: unit.descriptor.unitType,
      });
      assertNumericTokens(claim.text, claim.evidence);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${message}:${claimId}`);
    }
    return {
      ...claim,
      claimId,
    };
  });
  return LibraryAnalysisAcceptedSegmentSchema.parse({
    ...response,
    segmentOrdinal: input.job.job.segmentOrdinal,
    claims,
  });
}

function hasObviousMaterialClaim(text: string, unitType: string): boolean {
  const nonemptyLines = text.split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const learningTableOfContents = nonemptyLines.length >= 3 &&
    /^(?:table\s+of\s+contents|contents|innhold)\s*:?\s*$/iu.test(nonemptyLines[0]!) &&
    /^(?:appendix|vedlegg)\s*:?\s*$/iu.test(nonemptyLines.at(-1)!) &&
    nonemptyLines.slice(1, -1).every((line) => NUMBERED_LEARNING_TOC_LINE.test(line));
  if (learningTableOfContents) return false;
  const structuralPromptOnly = nonemptyLines.length > 0 && nonemptyLines.every((line) =>
    /^(?:#{1,6}\s*)?(?:table\s+of\s+contents|contents|innhold|main\s+findings|hovedfunn|findings|appendix|vedlegg|method|metode)\s*:?\s*$/iu.test(line) ||
    isNumberedLearningHeadingLine(line) ||
    /\?\s*$/u.test(line) ||
    /^(?:(?:alternativ|option|choice)\s+[A-Z0-9]|(?:svar|answer)\s*:\s*[A-Z0-9]|(?:options?|choices?|svaralternativer)\s*:\s*.+|(?:select|choose|velg)\s+(?:one|ett|én)|\d+[.)]\s*(?:introduction|methodology|metode|appendix|vedlegg))\s*[.]?\s*$/iu.test(line));
  if (structuralPromptOnly) return false;
  return OBVIOUS_SECTIONED_FINDINGS.test(text) ||
    hasCompletePropositionBeforeInlineFindings(text) ||
    /\b(?:Hovedfunn|Main\s+findings)\b[\s\S]{0,240}:\s*[-*•]?\s*[^.!?\n]{1,160}:\s*\d+(?:[.,]\d*)?\s*$/iu.test(text) ||
    hasNumberedLearningSectionMaterial(text) ||
    PLAIN_SECTIONED_FINDINGS.test(text) ||
    STRUCTURED_REGISTER_FINDINGS.test(text) ||
    HEADER_BOUND_INVENTORY.test(text) ||
    hasStructuredCompanyAnalysisMaterial(text) ||
    (unitType === "sheet_range" && hasHeaderlessCsvContinuationMaterial(text)) ||
    MASTER_ANALYSIS_INDEX.test(text) ||
    AUTHORITY_RESULT_MATERIAL.test(text) ||
    (TOTAL_BUDGET_AMOUNT.test(text) && PER_GROUP_BUDGET_SCOPE.test(text)) ||
    STUDY_FINDING_MATERIAL.test(text) ||
    SURVEY_RESULT_MATERIAL.test(text) ||
    SURVEY_RESPONSE_TOTAL_MATERIAL.test(text) ||
    SURVEY_FORECAST_MATERIAL.test(text) ||
    SURVEY_QUALITATIVE_RESULT_MATERIAL.test(text) ||
    SURVEY_GENERAL_FORECAST_MATERIAL.test(text);
}

function hasClearlyExtractableBlockedMaterial(text: string): boolean {
  const boundedAuthorityAnalysis = NAMED_AUTHORITY.test(text) &&
    BOUNDED_YEAR_RANGE.test(text) &&
    (ANALYTICAL_BASIS.test(text) || PILOT13_ANALYTICAL_OUTCOME.test(text)) &&
    /\bKonkurransetilsynet\s+(?:(?:har|hadde)\s+)?(?:beregnet|estimert|hentet|kartlagt|finner|vurderer|konkluderer|avgrenser)\b/iu.test(text);
  return hasCompletePropositionBeforeInlineFindings(text) ||
    STUDY_FINDING_MATERIAL.test(text) ||
    AUTHORITY_RESULT_MATERIAL.test(text) ||
    boundedAuthorityAnalysis ||
    hasStructuredCompanyAnalysisMaterial(text);
}

function hasStructuredCompanyAnalysisMaterial(text: string): boolean {
  const sectionCount = [...text.matchAll(STRUCTURED_COMPANY_SECTION)].length;
  const companyCount = [...text.matchAll(NUMBERED_COMPANY_HEADING)].length;
  const tableRows = text.split(/\r?\n/u).filter((line) =>
    /^\|[^|\n]{1,100}\|[^|\n]{1,160}\|\s*$/u.test(line.trim()) &&
    !/^\|\s*[-:]+\s*\|/u.test(line.trim()));
  return sectionCount >= 3 && companyCount >= 1 && tableRows.length >= 2 &&
    /\b\d+(?:[.,]\d+)?\s*(?:%|NOK|kr|EUR|USD|mrd\.?|mill\.?|tonn|tonnes?)\b/iu.test(text);
}

function hasHeaderlessCsvContinuationMaterial(text: string): boolean {
  const lines = text.split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) return false;
  const delimiterWidths = lines.map((line) => (line.match(/,/gu) ?? []).length);
  return delimiterWidths[0]! >= 8 &&
    delimiterWidths.every((width) => width === delimiterWidths[0]) &&
    lines.every((line) =>
      /^[a-z0-9][a-z0-9-]{5,},/u.test(line) &&
      /,(?:P[1-9]|WATCH),/u.test(line) &&
      /(?:https?:\/\/|,(?:19|20)\d{2},)/u.test(line));
}

function isNumberedLearningHeadingLine(line: string): boolean {
  if (!NUMBERED_LEARNING_HEADING_LINE.test(line)) return false;
  const match = NUMBERED_LEARNING_SECTION.exec(line);
  if (match === null) return false;
  const tail = line.slice(match.index + match[0].length).trim();
  return tail.length === 0 ||
    LEARNING_SECTION_IMPERATIVE.test(tail) ||
    LEARNING_SECTION_META_HEADING.test(tail) ||
    !LEARNING_SECTION_DECLARATIVE_VERB.test(tail);
}

function hasNumberedLearningSectionMaterial(text: string): boolean {
  const match = NUMBERED_LEARNING_SECTION.exec(text);
  if (match === null) return false;
  const tail = text.slice(match.index + match[0].length, match.index + match[0].length + 6000);
  return tail.split(/(?<=[.!?])(?:\s+|$)|\r?\n/u).some((part) => {
    const sentence = part.trim();
    return sentence.length >= 20 &&
      !/\?\s*$/u.test(sentence) &&
      !LEARNING_SECTION_IMPERATIVE.test(sentence) &&
      !LEARNING_SECTION_META_HEADING.test(sentence) &&
      LEARNING_SECTION_DECLARATIVE_VERB.test(sentence);
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
  const suffix = /^\s*(?:(mill\.?|million(?:er)?)\s+)?(kr|nok|usd|eur|gbp)\b/iu.exec(after);
  if (suffix?.[2] === undefined) return null;
  const currency = normalizeCurrencyMarker(suffix[2]);
  return suffix[1] === undefined ? currency : `${currency}:million`;
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
