#!/usr/bin/env python3
"""Generate the final dated status from exact completed review and local receipts."""
import hashlib,json,pathlib,sys
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[3]
RUN=ROOT/'docs/project/analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/M-ASTRA'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_text())
original=RUN/'M-ASTRA-20260909-status-audit-001';current=RUN/'M-ASTRA-20260909-corrections-review-001'
m=load(current/'master-review.json')
assert m['reviewComplete'] is True and m['modelRequirementVerified'] is False
status={'schema':'food-systems-followup-status/v1','asOf':'2026-09-09','scope':'Local candidate research and repair preparation; current operations separately evidenced','branch':'codex/status-restlist-2026-09-09','completed':['Preserved 147 original research files byte-identically','Completed original 127-candidate master review','Appended corrections and dependency versions for seven packages','Completed separate correction review with exact reuse','Prepared four library document candidates and a 256-page index','Reconciled all 392 library queue rows','Prepared unsent source/owner requests for twenty packages','Refreshed runtime and database status evidence'],
'researchReview':{'reviewComplete':True,'originalVerdicts':load(original/'master-review.json')['verdictCounts'],'currentCandidateCount':127,'newVerdicts':47,'identicalVerdictReuse':80,'currentVerdicts':{'supported_with_limits':127},'historicalGapReferences':92,'independentSemanticGapCount':None,'semanticGapClosed':False,'purposes':5,'chapters':15,'modelRequirementVerified':False,'modelConfiguration':'gpt-6-astra configured in delegation; separate backend attestation unavailable','originalHandoffPath':str((original/'handoff.json').relative_to(ROOT)),'originalHandoffSha256':sha(original/'handoff.json'),'currentHandoffPath':str((current/'handoff.json').relative_to(ROOT)),'currentHandoffSha256':sha(current/'handoff.json'),'currentIntakePath':str((RUN/'master-intake-corrections-002.json').relative_to(ROOT)),'currentIntakeSha256':sha(RUN/'master-intake-corrections-002.json')},
'workerStatusMix':load(HERE/'source-owner-queue.json')['workerStatusMix'],
'library':{'queueRows':392,'localFileCandidateRows':187,'newDocumentCandidates':4,'withoutNewDocumentCandidate':388,'physicalPageBindings':256,'productionQueueChanged':False,'fullSemanticAnalysisComplete':False},
'open':['Precise owner/source returns listed in KILDE-OG-DATAEIERBEHOV.md','Full library repair and authorized document/source binding','Model-version attestation and human review','Mandate, owner, capacity/funding, pilot and sharing decisions','RPO/RTO, retention and next restore exercise'],
'operationsEvidencePath':str((HERE/'operational-evidence.json').relative_to(ROOT)),'operationsEvidenceSha256':sha(HERE/'operational-evidence.json'),
'authority':{'humanReviewRecorded':False,'canonicalDataChanged':False,'readinessChanged':False,'published':False,'contactsSent':False,'databaseMutation':False,'newDeployment':False,'newAuthenticatedUiCheck':False,'newRestoreTest':False}}

continuation=HERE/'continuation-001/status.json'
if continuation.is_file():
 c=load(continuation)
 status['libraryFirstPass']=status['library']
 status['library']={'queueRows':c['rows'],'localFileFormats':c['localFileFormats'],'uniquePdfRawFiles':c['uniquePdfRawFiles'],'visuallyInspectedFirstPages':c['visuallyInspectedFirstPages'],'physicalPageBindings':c['physicalPageBindings'],'rowOutcomes':c['rowOutcomes'],'productionQueueChanged':False,'fullSemanticAnalysisComplete':False,'continuationPath':str(continuation.relative_to(ROOT)),'continuationSha256':sha(continuation)}
 status['completed'] += ['Extracted and first-page inspected 140 distinct PDF files; retained document and edition mismatches','Corrected binary PDF URL extraction and decoded three gzip annual reports','Verified newer 9 September Estate backup receipt against encrypted local bytes']
 status['backupContinuationPath']=str((HERE/'continuation-001/estate-evidence.json').relative_to(ROOT))
 status['backupContinuationSha256']=sha(HERE/'continuation-001/estate-evidence.json')

content=json.dumps(status,ensure_ascii=False,indent=2)+'\n';p=HERE/'status.json'
if '--write' in sys.argv:p.write_text(content)
else:assert p.read_text()==content,'Stale generated status'
print('Final dated status and both completed master handoff bindings verified')
