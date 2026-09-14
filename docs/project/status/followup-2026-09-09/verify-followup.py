#!/usr/bin/env python3
"""Read-only mechanical integrity checks for the selected follow-up intake."""
import hashlib,json,pathlib,re,subprocess,sys
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[3]
RUN=ROOT/'docs/project/analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1'
PRIVATE=pathlib.Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0862f-bd95-7660-802d-282c781c1c5f/status-restlist')
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text())
def canonical(x):return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def resolve(p,parent):
 p=pathlib.Path(p)
 if p.is_absolute():return p
 if (ROOT/p).is_file():return ROOT/p
 return parent/p
counts={}
preservation=load(PRIVATE/'preservation-manifest.json')
for row in preservation['files']:
 paths=[ROOT/row['path'],pathlib.Path(preservation['source'])/row['path'],PRIVATE/'preserved-research'/row['path'].split('/research-runs/',1)[1]]
 for p in paths:
  assert sha(p.read_bytes())==row['sha256'],('historical bytes changed',str(p))
counts['immutableOriginalFilesInThreeLocations']=len(preservation['files'])
for args in [('build-corrections.py',),('build-corrections.py','--round2'),('build-followup.py',),('library-recovery.py',)]:
 subprocess.run([sys.executable,str(HERE/args[0]),*args[1:]],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
counts['reproducerChecks']=4
intake=load(RUN/'M-ASTRA/master-intake-corrections-002.json')
previous=RUN/'M-ASTRA/master-intake-corrections-001.json'
assert sha(previous.read_bytes())==intake['previousIntakeSha256']
assert sha((RUN/'M-ASTRA/master-intake.json').read_bytes())==load(previous)['previousIntakeSha256']
seen={};files=0;deps=0
for w in intake['workerReturns']:
 hp=ROOT/w['handoffPath'];assert sha(hp.read_bytes())==w['handoffSha256'];h=load(hp)
 for f in w['fileManifest']:
  p=resolve(f['path'],hp.parent);assert sha(p.read_bytes())==f['sha256'],str(p);files+=1
 for d in h['dependencies']:
  assert sha(resolve(d['handoffPath'],hp.parent).read_bytes())==d['handoffSha256'];deps+=1
 for c in load(hp.parent/'observations.json')['observations']:
  assert c['candidateId'] not in seen
  assert canonical(c['evidencePayload'])==c['evidenceSha256']
  assert canonical({k:v for k,v in c.items() if k!='candidateSha256'})==c['candidateSha256']
  for pkey,hkey in [('policyPath','policySha256'),('targetProfilePath','targetProfileSha256')]:
   p=resolve(c[pkey],hp.parent);assert sha(p.read_bytes())==c[hkey]
  assert c['human_verified'] is False
  seen[c['candidateId']]=c
for c in intake['candidateInventory']:
 for k in ['packageId','runId','candidateSha256','evidenceSha256']:assert seen[c['candidateId']][k]==c[k]
assert len(seen)==127
counts.update(selectedReturns=20,selectedReturnFiles=files,dependencyHandoffs=deps,candidateEvidencePolicyTargetBindings=127)
for f in HERE.glob('*.md'):
 for target in re.findall(r'\]\(([^)]+)\)',f.read_text()):
  if not target.startswith(('https:','http:','#')):assert (f.parent/target.split('#')[0]).exists(),(str(f),target)
counts['localMarkdownLinks']='passed'
counts['scope']='Mechanical integrity only; not scientific approval, human review, CI, deployment or restore verification'
if '--receipt' in sys.argv:(HERE/'verification.json').write_text(json.dumps(counts,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(counts,ensure_ascii=False))
