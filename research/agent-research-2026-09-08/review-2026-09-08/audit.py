"""Read-only structural audit of A1-A6; writes only into this review directory."""
from pathlib import Path
import json,re,hashlib,collections
HERE=Path(__file__).resolve().parent
ROOT=HERE.parent/'resultater'
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def norm_q(track,q):return f'{track}-{q}' if re.fullmatch(r'Q[1-5]',str(q)) else q
out={'scope':'Structural checks; not factual verification','tracks':{},'issues':[],'archiveChecks':[],'inputHashes':{},'sourceUrlDuplicates':[]}
ids=set(); sources=[]; observed=[]
for f in ROOT.rglob('*'):
 if f.is_file():out['inputHashes'][str(f.relative_to(ROOT))]=digest(f)
for i in range(1,6):
 t=f'A{i}';d=json.loads((ROOT/t/'data.json').read_text());src={s['sourceId']:s for s in d['sources']};log=(ROOT/t/'sokelogg.md').read_text();questions=collections.defaultdict(lambda:{'observations':[],'gaps':[]})
 for group,key in [('sources','sourceId'),('observations','observationId'),('gaps','gapId')]:
  seen=set()
  for row in d[group]:
   rid=row[key]; ids.add(rid if rid.startswith(t+'-') else t+'-'+rid)
   if rid in seen:out['issues'].append({'type':'duplicate_id','id':rid,'track':t})
   seen.add(rid)
 for s in d['sources']:
  sources.append((t,s));sid=s['sourceId'];archive=s.get('archivePath');sha=s.get('sha256')
  for u in s.get('underlyingSourceIds',[]):
   if u not in src:out['issues'].append({'type':'orphan_underlying_source','id':sid,'target':u})
  if archive:
   f=Path(archive);status='missing_file' if not f.exists() else ('missing_hash' if not sha else ('match' if digest(f)==sha else 'hash_mismatch'))
   out['archiveChecks'].append({'id':sid,'path':archive,'status':status})
  elif sha:out['issues'].append({'type':'hash_without_path','id':sid})
 for o in d['observations']:
  observed.append((t,o));q=norm_q(t,o['questionId']);questions[q]['observations'].append(o['observationId'])
  if not o.get('assessment'):out['issues'].append({'type':'missing_assessment','id':o['observationId']})
  if not o.get('sourceRefs'):out['issues'].append({'type':'no_source_refs','id':o['observationId']})
  for r in o.get('sourceRefs',[]):
   if r['sourceId'] not in src:out['issues'].append({'type':'orphan_source','id':o['observationId'],'target':r['sourceId']})
   if not r.get('locator'):out['issues'].append({'type':'missing_locator','id':o['observationId']})
 for g in d['gaps']:
  questions[norm_q(t,g['questionId'])]['gaps'].append(g['gapId'])
  for ref in g.get('searchLogRefs',[]):
   if ref not in log:out['issues'].append({'type':'orphan_search_log','id':g['gapId'],'target':ref})
 for n in range(1,6):
  if f'{t}-Q{n}' not in questions:out['issues'].append({'type':'missing_question','id':f'{t}-Q{n}'})
 out['tracks'][t]={'counts':{k:len(d[k]) for k in ['sources','observations','gaps','calculations']},'templateOnly':d.get('templateOnly'),'questions':dict(questions),'readStatusCounts':dict(collections.Counter(s.get('readStatus') for s in d['sources'])),'archivedSources':sum(bool(s.get('archivePath')) for s in d['sources'])}
byurl=collections.defaultdict(list)
for t,s in sources:byurl[s['url']].append(s['sourceId'] if s['sourceId'].startswith(t+'-') else t+'-'+s['sourceId'])
out['sourceUrlDuplicates']=[{'url':u,'ids':v} for u,v in byurl.items() if len(v)>1]
out['totals']={k:sum(x['counts'][k] for x in out['tracks'].values()) for k in ['sources','observations','gaps','calculations']}
out['questionSlotsCovered']=sum(len(t['questions']) for t in out['tracks'].values())
out['noHumanVerifiedFlags']=not any(re.search(r'"(?:verificationStatus|status)"\s*:\s*"human_verified"|"human_verified"\s*:\s*true',f.read_text()) for f in ROOT.rglob('*.json'))
out['archiveSummary']=dict(collections.Counter(x['status'] for x in out['archiveChecks']))
out['sourcesWithoutArchive']=len(sources)-len(out['archiveChecks'])
# Explicit A6 references must resolve through the documented source-ID alias.
for f in (ROOT/'A6').glob('*.md'):
 for match in re.finditer(r'A[1-5]-[SOG]\d{3}',f.read_text()):
  rid=match.group()
  if rid not in ids:out['issues'].append({'type':'orphan_A6_reference','file':f.name,'id':rid})
# Quantitative fields are profile information, not automatic defects.
out['valueTypes']=dict(collections.Counter(type(o.get('value')).__name__ for _,o in observed))
out['nullObservationPeriod']=[o['observationId'] for _,o in observed if not o.get('observationPeriod')]
out['nullValueRows']=[o['observationId'] for _,o in observed if o.get('value') is None]
(HERE/'structural-audit.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:out[k] for k in ['totals','questionSlotsCovered','noHumanVerifiedFlags','archiveSummary','sourcesWithoutArchive','issues']},ensure_ascii=False,indent=2))

# Independently reproduce all A3-O020 cells from the captured FAOSTAT bulk file.
import csv,io,zipfile
ad=json.loads((ROOT/'A3/data.json').read_text())
s=next(s for s in ad['sources'] if s['sourceId']=='A3-S009')
o=next(o for o in ad['observations'] if o['observationId']=='A3-O020')
lookup={}
with zipfile.ZipFile(s['archivePath']) as z:
 assert z.testzip() is None
 name=next(n for n in z.namelist() if n.endswith('(Normalized).csv'))
 for row in csv.DictReader(io.TextIOWrapper(z.open(name),encoding='utf-8-sig')):
  if row['Item Code']=='210091' and row['Area'] in {'Norway','Sweden','Finland','Denmark','Iceland'}:
   lookup[(row['Year'],row['Area'],row['Element'])]=row
cells=[]
for period,countries in o['value'].items():
 for country,values in countries.items():
  for field,element in [('value','Value'),('lower','Confidence interval: Lower bound'),('upper','Confidence interval: Upper bound')]:
   r=lookup[(period,country,element)];actual=float(r['Value'])
   cells.append({'period':period,'country':country,'field':field,'reported':values[field],'sourceValue':actual,'matches':actual==values[field],'flag':r['Flag']})
captures=json.loads((HERE/'primary-captures.json').read_text())
fresh=next(x for x in captures if x['id']=='fao')
fao={'observationId':'A3-O020','sourceId':'A3-S009','itemCode':'210091','grain':'country x overlapping three-year period x estimate/bound','reportedCells':len(cells),'matchingCells':sum(x['matches'] for x in cells),'freshPrimaryCaptureMatchesA3Archive':fresh.get('sha256')==digest(s['archivePath']),'cells':cells,'interpretation':'All cells are transcriptions of FAO estimates/bounds; no causal claim, no independent-year trend test, no cross-instrument ranking.'}
(HERE/'fao-reproduction.json').write_text(json.dumps(fao,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in fao.items() if k!='cells'},ensure_ascii=False))
