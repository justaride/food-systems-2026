from pathlib import Path
import json,hashlib,collections
D=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((D/'master-review.json').read_text());c=json.loads((D/'coverage.json').read_text());v=json.loads((D/'verification.json').read_text());h=json.loads((D/'handoff.json').read_text())
ids=[x['candidateId'] for x in m['candidateVerdicts']]
assert len(ids)==len(set(ids))==127
assert set(ids)==set(c['candidateIds'])
assert len(c['gapDispositions'])==len({x['gapId'] for x in c['gapDispositions']})==92
assert len(c['purposeDispositions'])==5 and len(c['chapterDispositions'])==15
assert all(not x['human_verified'] for x in m['candidateVerdicts'])
assert all(not x['semanticGapClosed'] for x in c['gapDispositions'])
assert all(x['verdict'] in ['supported_with_limits','needs_revision','contradicted','insufficient_evidence'] for x in m['candidateVerdicts'])
assert dict(collections.Counter(x['verdict'] for x in m['candidateVerdicts']))==m['verdictCounts']
assert all(len(x['sourceBindings'])>0 and x['reasoning'] for x in m['candidateVerdicts'])
assert sum(len(x['sourceBindings']) for x in m['candidateVerdicts'])==337
assert not m['modelRequirementVerified'] and m['attestedModel'] is None
assert m['reviewComplete'] and m['intakeComplete'] and not m['readinessChanged']
assert v['all337ExpectedBindingBytesAvailable'] and v['all92GapSourceAndRecordHashesVerified']
for f in h['fileManifest']:
 assert sha(D/f['path'])==f['sha256'], f['path']
assert 'handoff.json' not in [x['path'] for x in h['fileManifest']]
print(json.dumps({'passed':True,'candidateCount':len(ids),'gapCount':92,'purposeCount':5,'chapterCount':15,'verdictCounts':m['verdictCounts'],'modelRequirementVerified':False,'readinessChanged':False}))
