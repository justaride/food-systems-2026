#!/usr/bin/env python3
"""Run artifact/authority checks and named project verifiers; no DB or release writes."""
import hashlib,json,pathlib,re,subprocess,sys
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[4]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
commands=[
 [sys.executable,str(HERE/'build-results.py')],
 [sys.executable,str(HERE/'refresh-estate.py')],
 [sys.executable,str(HERE.parent/'verify-followup.py')],
 [sys.executable,str(HERE.parent/'build-status.py')],
 ['/Users/gabrielfreeman/Documents/Food Systems 2026/node_modules/.bin/tsx','scripts/verify-estate-backup-receipt.ts','--receipt=config/production-backup-receipts/food-systems-pgvector-db-2026-09-09-013028.json','--asset-key=coolify:l0s8o8oo00c8gossw0gksswk','--database-uuid=l0s8o8oo00c8gossw0gksswk','--max-age-hours=36']]
for args in commands:
 r=subprocess.run(args,cwd=ROOT,text=True,capture_output=True,timeout=90)
 assert r.returncode==0,(args,r.stdout,r.stderr)
for p in HERE.glob('*.json'):json.loads(p.read_text())
candidates=json.loads((HERE/'document-candidates.json').read_text())['candidates']
for c in candidates:
 body={k:v for k,v in c.items()if k!='candidateSha256'}
 assert hashlib.sha256(json.dumps(body,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()==c['candidateSha256']
 assert all(c[k]is False for k in ['human_verified','sourceIdentityApplied','readinessChanged','published','fullSemanticAnalysisComplete'])
for p in HERE.glob('*.md'):
 for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if link=='verification.json' and '--write'in sys.argv:continue
  if not link.startswith(('https:','http:','#')):assert (p.parent/link).exists(),link
for p in HERE.iterdir():
 assert p.suffix not in ['.pdf','.html','.txt','.png'],p
 if p.is_file():assert not re.search(r'(?:postgres(?:ql)?://[^\s]+:[^\s]+@|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|ghp_[A-Za-z0-9]{30,})',p.read_text()),p
report={'schema':'library-continuation-verification/v1','checks':{'namedVerifiers':5,'candidateHashAndAuthorityChecks':len(candidates),'jsonSyntax':'passed','localMarkdownLinks':'passed','noNewRawDocuments':'passed','credentialPatternCheck':'passed'},'inputs':[{'path':str(p.relative_to(ROOT)),'sha256':sha(p)}for p in [HERE/'status.json',HERE/'document-candidates.json',HERE/'queue.json',HERE/'page-index.json',HERE/'estate-evidence.json']],'scope':'Local artifact and retained backup-evidence verification only. No CI, deployment, new restore, offsite network readback, authenticated UI or human approval.'}
content=json.dumps(report,ensure_ascii=False,indent=2)+'\n';p=HERE/'verification.json'
if '--write'in sys.argv:p.write_text(content)
else:assert p.read_text()==content,'Verification receipt drift'
print(json.dumps(report['checks']))
