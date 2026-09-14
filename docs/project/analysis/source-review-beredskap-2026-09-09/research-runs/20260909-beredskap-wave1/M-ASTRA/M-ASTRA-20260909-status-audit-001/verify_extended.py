from pathlib import Path
exec((Path(__file__).parent/'verify_inputs.py').read_text().split('checks=[]')[0])
A=json.loads((PRIV/'audit-input.json').read_text()); C=json.loads((BASE/'research-plan/coverage.json').read_text());extra=[]
def check(path,expected,kind,context):
 p=resolve(path);actual=sha(p) if p.is_file() else None;z=dict(kind=kind,context=context,path=str(p),expected=expected,actual=actual,passed=actual==expected and expected is not None);extra.append(z);return z
# All referenced locator artifacts and calculation files, including alternate representations.
for s in A['sources']:
 for loc in s.get('exactLocators',[]):
  if isinstance(loc,dict) and loc.get('path') and loc.get('sha256'):check(loc['path'],loc['sha256'],'source_locator_artifact',s['packageId']+'/'+s['sourceId'])
for c in A['candidates']:
 for f in c.get('calculationFiles',[]):
  if isinstance(f,dict) and f.get('path') and f.get('sha256'):check(f['path'],f['sha256'],'calculation_file',c['candidateId'])
for p in A['packages']:
 for inp in p['handoff']['inputs']:
  if inp.get('path') and resolve(inp['path']).is_dir():
   d=resolve(inp['path']);m=d/'raw-manifest.json';j=json.loads(m.read_text());fs=j if isinstance(j,list) else j['files']
   for f in fs:check(str(d/f['path']) if not pathlib.Path(f['path']).is_absolute() else f['path'],f['sha256'],'private_manifest_file',p['packageId'])
# Resolve all exact content hashes to bytes. Raw text identity is explicit and does not require a redundant extracted copy.
path_index={}
def index(p):
 p=resolve(str(p))
 if p.is_file():path_index.setdefault(sha(p),[]).append(str(p))
for s in A['sources']:
 for k in ['rawPath','extractedTextPath']:
  if s.get(k):index(s[k])
 for loc in s.get('exactLocators',[]):
  if isinstance(loc,dict) and loc.get('path'):index(loc['path'])
for p in A['packages']:
 # bounded private worker artifact subtree only
 candidates=[s for s in p['sources'] if '/research-runs/20260909-beredskap-wave1/'+p['packageId']+'/' in (s.get('rawPath') or '')]
 if candidates:
  d=resolve(candidates[0]['rawPath']).parent.parent
  for f in d.rglob('*'):
   if f.is_file():index(f)
for f in [BASE/'round-004/source-bindings.json',BASE/'round-005/source-bindings.json']:
 j=json.loads(f.read_text());ss=j if isinstance(j,list) else j['sources']
 for s in ss:
  for k in ['rawPath','textPath']:
   if s.get(k):index(s[k])
index('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a084fe-a36c-7fb1-86c2-4387109e3c36/round-004/norway/method.txt')
resolved=[]
for c in A['candidates']:
 for n,(b,s) in enumerate(zip(c['evidencePayload']['sourceBindings'],c['masterSources'])):
  raw=path_index.get(b.get('rawSha256'),[]);txt=path_index.get(b.get('extractedTextSha256'),[]) if b.get('extractedTextSha256') else []
  resolved.append(dict(candidateId=c['candidateId'],bindingIndex=n,sourceId=b['sourceId'],sourceRecordPresent=s is not None,rawSha256=b.get('rawSha256'),rawPaths=sorted(set(raw)),extractedTextSha256=b.get('extractedTextSha256'),textPaths=sorted(set(txt)),allExpectedBytesAvailable=bool(raw) and (not b.get('extractedTextSha256') or bool(txt)),exactLocator=b['exactLocator']))
def pointer(o,p):
 for k in p.strip('/').split('/'):o=o[int(k)] if isinstance(o,list) else o[k.replace('~1','/').replace('~0','~')]
 return o
rawgaps=[]
for p in A['packages']:
 for k in ['gaps','ownedGaps','newGaps']:
  for g in p['gaps'].get(k,[]):rawgaps.append(g)
gapchecks=[]
for g in C['gaps']:
 p=resolve(g['sourcePath']);record=pointer(json.loads(p.read_text()),g['jsonPointer']);returns=[r for r in rawgaps if r.get('originalGapId')==g['id'] or r.get('gapId')==g['id']];owned=[r for r in returns if r.get('packageId')==g['primaryPackageId']]
 gapchecks.append(dict(id=g['id'],sourceHashPassed=sha(p)==g['sourceSha256'],recordHashPassed=canonical(record)==g['recordSha256'],recordEqualsFrozen=(record==g['originalRecord'] or (isinstance(record,dict) and record.get('original')==g['originalRecord'])),owner=g['primaryPackageId'],ownerReturned=bool(owned),returnedGapIds=[r['gapId'] for r in returns],ownerReturn=owned,original=g))
(PRIV/'extended-integrity.json').write_text(json.dumps(extra,ensure_ascii=False,indent=2)+'\n');(PRIV/'resolved-bindings.json').write_text(json.dumps(resolved,ensure_ascii=False,indent=2)+'\n');(PRIV/'gap-checks.json').write_text(json.dumps(gapchecks,ensure_ascii=False,indent=2)+'\n');(PRIV/'all-worker-gaps.json').write_text(json.dumps(rawgaps,ensure_ascii=False,indent=2)+'\n')
print('extra',len(extra),'failed',[x for x in extra if not x['passed']]);print('bindings',len(resolved),'unresolved',[x for x in resolved if not x['allExpectedBytesAvailable']]);print('gaps',len(gapchecks),'errors',[x['id'] for x in gapchecks if not all(x[k] for k in ['sourceHashPassed','recordHashPassed','recordEqualsFrozen','ownerReturned'])]);print('worker gaps',len(rawgaps))
ss=next(s for s in A['sources'] if s['sourceId']=='B19-S01');rev=json.loads(resolve(ss['rawPath']).read_text());print('historical reviews',len(rev['reviews']),collections.Counter(x['outcome'] for x in rev['reviews']));print('worker statuses',collections.Counter(p['handoff']['status'] for p in A['packages'] if p['packageId']!='B20'))
