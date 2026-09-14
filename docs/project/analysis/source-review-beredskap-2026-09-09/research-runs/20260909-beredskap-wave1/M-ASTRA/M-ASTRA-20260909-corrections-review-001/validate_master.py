from pathlib import Path
import hashlib,json,collections
D=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((D/'master-review.json').read_text());c=json.loads((D/'coverage.json').read_text());v=json.loads((D/'verification.json').read_text());h=json.loads((D/'handoff.json').read_text())
assert len(m['candidateVerdicts'])==len({x['candidateId'] for x in m['candidateVerdicts']})==127
modes=collections.Counter(x['reviewMode'] for x in m['candidateVerdicts']);assert modes['new_verdict_after_delta_review']==47 and modes['reuse_exact_previous_bindings']==80
assert all(x['verdict']=='supported_with_limits' and x['human_verified'] is False for x in m['candidateVerdicts'])
assert len(c['gapDispositions'])==92 and all(not x['semanticGapClosed'] for x in c['gapDispositions'])
assert len(c['purposeDispositions'])==5 and len(c['chapterDispositions'])==15
assert v['baseChecksPassed'] and v['additionalChecksPassed'] and v['allExpectedBindingBytesAvailable'] and v['allSourceBindingsRegistered'] and v['all92GapSourceRecordAndOwnerChecksPassed']
assert m['reviewComplete'] and not m['modelRequirementVerified'] and not m['readinessChanged']
for f in h['fileManifest']:assert sha(D/f['path'])==f['sha256'],f['path']
print(json.dumps({'passed':True,'effectiveCandidates':127,'newVerdicts':47,'exactReused':80,'gapReferences':92,'purposes':5,'chapters':15,'modelRequirementVerified':False,'readinessChanged':False}))
