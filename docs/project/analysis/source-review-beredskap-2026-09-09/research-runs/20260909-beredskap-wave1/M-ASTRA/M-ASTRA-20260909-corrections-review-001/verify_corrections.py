from pathlib import Path
D=Path(__file__).resolve().parent
exec((D/'verify_inputs.py').read_text().split('checks=[]')[0])
import copy,math
N=json.loads((PRIV/'audit-input.json').read_text());OLD=RUN/'M-ASTRA/M-ASTRA-20260909-status-audit-001';oldm=json.loads((OLD/'master-review.json').read_text());oldcs={}
ints=[RUN/'M-ASTRA/master-intake.json',RUN/'M-ASTRA/master-intake-corrections-001.json',RUN/'M-ASTRA/master-intake-corrections-002.json'];chain=[]
for prev,curr in zip(ints,ints[1:]):
 j=json.loads(curr.read_text());assert resolve(j['previousIntakePath'])==prev and j['previousIntakeSha256']==sha(prev);chain.append(dict(path=str(curr),sha256=sha(curr),previousPath=str(prev),previousSha256=sha(prev),passed=True))
for w in json.loads(ints[0].read_text())['workerReturns']:
 for c in json.loads((resolve(w['handoffPath']).parent/'observations.json').read_text())['observations']:oldcs[c['candidateId']]=c
changes=[]
for c in N['candidates']:
 clean={k:v for k,v in c.items() if not k.startswith('master')};old=oldcs[c['candidateId']];fields=[k for k in sorted(set(old)|set(clean)) if old.get(k)!=clean.get(k)];same=old['candidateSha256']==c['candidateSha256'];assert same==(not fields)
 changes.append(dict(candidateId=c['candidateId'],packageId=c['packageId'],oldCandidateSha256=old['candidateSha256'],newCandidateSha256=c['candidateSha256'],oldEvidenceSha256=old['evidenceSha256'],newEvidenceSha256=c['evidenceSha256'],changedFields=fields,reviewMode='reuse_exact_previous_bindings' if same else 'new_verdict_after_delta_review'))
assert sum(bool(x['changedFields']) for x in changes)==47
# Current intake inventory agrees exactly with actual candidates, not just file manifests.
cur=json.loads(ints[-1].read_text());iv={x['candidateId']:x for x in cur['candidateInventory']}
for c in N['candidates']:
 for k in ['runId','candidateSha256','evidenceSha256']:assert c[k]==iv[c['candidateId']][k]
packages={p['packageId']:p for p in N['packages']};dep=[]
for owner in ['B09','B20']:
 for d in packages[owner]['handoff']['dependencies']:
  p=resolve(d['handoffPath']);h=json.loads(p.read_text());assert sha(p)==d['handoffSha256'];assert packages[h['packageId']]['handoff']['runId']==h['runId'];dep.append(dict(owner=owner,packageId=h['packageId'],path=str(p),sha256=sha(p),runId=h['runId'],passed=True))
assert len(dep)==21
mfile=Path(packages['B20']['folder'])/'dependency-handoffs-B01-B19.json';m=json.loads(mfile.read_text());assert len(m['packages'])==19
for d in m['packages']:
 p=resolve(d['handoffPath']);h=json.loads(p.read_text());assert sha(p)==d['handoffSha256'];assert d['runId']==h['runId']==packages[d['packageId']]['handoff']['runId'];assert d['status']==h['status']
checks=[]
def ck(name,**kw):checks.append(dict(id=name,passed=True,**kw))
b04=next(c for c in N['candidates'] if c['candidateId']=='B04-C04');s=next(s for s in packages['B04']['sources'] if s['sourceId']=='B04-S007');lines=resolve(s['extractedTextPath']).read_text().splitlines()
for b,exp in zip(b04['evidencePayload']['sourceBindings'],[(512,545),(1403,1412)]):
 l=b['exactLocator'];assert (l['start'],l['end'])==exp;seg='\n'.join(lines[l['start']-1:l['end']])+'\n';assert hashlib.sha256(seg.encode()).hexdigest()==b['locatorEvidenceSha256'];ck('B04-corrected-range',sourcePath=s['extractedTextPath'],locator=l,passageHash=b['locatorEvidenceSha256'])
b08=next(c for c in N['candidates'] if c['candidateId']=='B08-C02');v=b08['value'];assert 'Aggregate P/A' in b08['claim'] and 'Production-weighted' not in b08['claim'];areas=[394450,63100];prod=[2984800,315600];weights=[x/sum(areas) for x in areas];computed=sum(prod)/sum(areas);assert math.isclose(computed,v['PA_t_ha']);assert math.isclose(weights[0],v['weight_hostvete']) and math.isclose(weights[1],v['weight_varvete']);ck('B08-PA-wording-and-weights',area_ha=areas,production_t=prod,PA_t_ha=computed,weights=weights,areaWeightedPublishedRoundedYields_t_ha=weights[0]*7.57+weights[1]*5,limitation='Exact component P/A yields are area-weighted; weighting rounded published component yields differs. Official reported 7.22 remains separate.')
for sid in ['R4-NO-S003','METH-S09','DKFI-S002']:
 ss=next(s for s in packages['B08']['sources'] if s['sourceId']==sid);assert sha(resolve(ss['rawPath']))==ss['rawSha256'] and sha(resolve(ss['extractedTextPath']))==ss['extractedTextSha256'];ck('B08-added-source',sourceId=sid,rawPath=ss['rawPath'],rawSha256=ss['rawSha256'],textPath=ss['extractedTextPath'],textSha256=ss['extractedTextSha256'])
s=next(s for s in packages['B13']['sources'] if s['sourceId']=='B13-S001-TABLE21');raw=resolve(s['rawPath']);out=subprocess.check_output(['pdftotext','-f','13','-l','13','-layout',str(raw),'-']);assert hashlib.sha256(out).hexdigest()==s['extractedTextSha256'];assert out==resolve(s['extractedTextPath']).read_bytes();ck('B13-new-page-extract',sourcePath=str(raw),physicalPage=13,printedPage=11,extractPath=s['extractedTextPath'],extractSha256=s['extractedTextSha256'],visualEvidencePath=str(OLD),note='Original master visually inspected the exact same PDF page 13; new extract read in correction review and regenerated byte-identically.')
for b in ['B14','B20']:
 for x in packages[b]['handoff']['inputs']:assert resolve(x['path'],Path(packages[b]['folder'])).is_file()
 ck(b+'-all-input-paths-are-files')
b20=next(c for c in N['candidates'] if c['candidateId']=='B20-C12');cov=json.loads((BASE/'research-plan/coverage.json').read_text());resolved=[]
for b in b20['evidencePayload']['sourceBindings']:
 if b['sourceId']=='B20-S06':
  l=b['exactLocator'];ix=int(l['path'].split('/')[-1]);g=cov['gaps'][ix];assert g['id']==l['label'];resolved.append({'path':l['path'],'id':g['id'],'semanticGapClosed':g['semanticGapClosed']})
assert {r['id'] for r in resolved}=={'CLIM-G03','R4-G004','R5-G10'};ck('B20-array-pointers',resolved=resolved)
gap=next(g for g in packages['B19']['gaps']['gaps'] if g['gapId'].endswith('-G03'));assert gap['originalGapId'] is None and 'FS-03' not in gap['overlapWithGapIds'];assert gap['referenceCorrection']['previousOriginalGapId']=='FS-03';assert not gap['semanticGapClosed'];ck('B19-gap-reference',gapId=gap['gapId'],currentOriginalGapId=None,historicalOriginalGapId='FS-03',overlapWithGapIds=gap['overlapWithGapIds'],limitation='Nested runId names the historical gap origin; current container/correctionProvenance and referenceCorrection bind the correction. No new model attestation exists.')
# Previous master remains frozen, including every delivered file.
h=json.loads((OLD/'handoff.json').read_text());assert sha(OLD/'handoff.json')=='f3a30484f270c50687b1b78fd69ad8b2c6deedb6cfc7015204f452b01d9d4833'
for f in h['fileManifest']:assert sha(OLD/f['path'])==f['sha256']
res=dict(intakeChain=chain,originalMasterHandoffSha256=sha(OLD/'handoff.json'),changedCandidateCount=47,reusedCandidateCount=80,changes=changes,dependencyChecks=dep,dependencyRegisterPath=str(mfile),dependencyRegisterSha256=sha(mfile),checks=checks,oldMasterUnchanged=True,sourceVersionNote='Except the new SIFO page-13 extract and rebound internal dependency/return documents, primary-source bytes are unchanged and the original master passage reading applies to those exact versions.')
(PRIV/'correction-audit.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n');print('PASS',len(checks),'specific correction checks',len(dep),'dependencies',47,'changed',80,'identical')
