import pathlib,json,hashlib,collections,subprocess
ROOT=pathlib.Path('/Users/gabrielfreeman/.codex/worktrees/fs-status-0909/Food Systems 2026')
BASE=ROOT/'docs/project/analysis/source-review-beredskap-2026-09-09';RUN=BASE/'research-runs/20260909-beredskap-wave1'
OUT=RUN/'M-ASTRA/M-ASTRA-20260909-status-audit-001'
PRIV=pathlib.Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0862f-bd95-7660-802d-282c781c1c5f/status-restlist/astra-master-001')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def canonical(o):return hashlib.sha256(json.dumps(o,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def resolve(s,folder=ROOT):
 p=pathlib.Path(s)
 if p.is_absolute():
  old='/Users/gabrielfreeman/.codex/worktrees/a4f5/Food Systems 2026/'
  if str(p).startswith(old):return ROOT/str(p)[len(old):]
  return p
 if (ROOT/p).exists():return ROOT/p
 return folder/p
checks=[]
def ck(path,expected,kind,owner):
 p=resolve(path,owner if isinstance(owner,pathlib.Path) else ROOT);actual=sha(p) if p.is_file() else None
 z={'kind':kind,'path':str(p),'expected':expected,'actual':actual,'passed':actual==expected and expected is not None};checks.append(z);return z
intake=json.loads((RUN/'M-ASTRA/master-intake.json').read_text())
ck(str(RUN/'M-ASTRA/master-intake.json'),'c396993b0e0ef148c533731e615579986b08452eb0142e54aece753a66af0383','intake',ROOT)
for x in intake['planFiles']:ck(x['path'],x['sha256'],'plan',ROOT)
im=json.loads((BASE/'research-plan/input-manifest.json').read_text())
for x in im['inputs']:ck(x['path'],x['sha256'],'plan_input',ROOT)
for p,h in im['historicalFiles'].items():ck(p,h,'historical_input',ROOT)
allcs=[]; allss=[]; packages=[]
for ret in intake['workerReturns']:
 hp=resolve(ret['handoffPath']);d=hp.parent;h=json.loads(hp.read_text());ck(str(hp),ret['handoffSha256'],'handoff',ROOT)
 for x in ret['fileManifest']:ck(x['path'],x['sha256'],'delivery',d)
 for x in h['inputs']:
  if isinstance(x,dict) and x.get('path') and x.get('sha256'):ck(x['path'],x['sha256'],'worker_input',d)
 ss=json.loads((d/'sources.json').read_text());ss=ss['sources'] if isinstance(ss,dict) else ss
 obs=json.loads((d/'observations.json').read_text())['observations'];sources={s['sourceId']:s for s in ss}
 for s in ss:
  s=dict(s);s['packageId']=ret['packageId'];s['masterChecks']=[]
  for pkey,hkey in [('rawPath','rawSha256'),('extractedTextPath','extractedTextSha256')]:
   if s.get(pkey):s['masterChecks'].append(ck(s[pkey],s.get(hkey),'source_'+pkey,d))
  allss.append(s)
 for c in obs:
  c=dict(c);c['masterCandidateHashValid']=canonical({k:v for k,v in c.items() if k!='candidateSha256'})==c['candidateSha256']
  # Hash before adding audit attributes
  original=next(x for x in obs if x['candidateId']==c['candidateId']);c['masterCandidateHashValid']=canonical({k:v for k,v in original.items() if k!='candidateSha256'})==c['candidateSha256']
  c['masterEvidenceHashValid']=canonical(c['evidencePayload'])==c['evidenceSha256'];c['masterPolicyCheck']=ck(c['policyPath'],c['policySha256'],'policy',d);c['masterTargetCheck']=ck(c['targetProfilePath'],c['targetProfileSha256'],'target',d)
  c['masterSources']=[sources.get(b['sourceId']) for b in c['evidencePayload']['sourceBindings']];allcs.append(c)
 packages.append({'packageId':ret['packageId'],'folder':str(d),'handoff':h,'sources':ss,'observations':obs,'gaps':json.loads((d/'gaps.json').read_text())})
(PRIV/'integrity.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
(PRIV/'audit-input.json').write_text(json.dumps({'candidates':allcs,'sources':allss,'packages':packages},ensure_ascii=False,indent=2)+'\n')
print('checks',len(checks),'failures',sum(not x['passed'] for x in checks),'candidates',len(allcs),'source records',len(allss));print('FAILURES',json.dumps([x for x in checks if not x['passed']],ensure_ascii=False)[:20000]);print('candidatehash bad',[c['candidateId'] for c in allcs if not c['masterCandidateHashValid'] or not c['masterEvidenceHashValid']]);print('missing bindings',[(c['candidateId'],[b['sourceId'] for b,s in zip(c['evidencePayload']['sourceBindings'],c['masterSources']) if s is None]) for c in allcs if None in c['masterSources']])
