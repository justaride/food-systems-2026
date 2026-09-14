#!/usr/bin/env python3
"""Format-aware local evidence overlay; never interpret PDF bytes as note URLs."""
import collections,concurrent.futures,hashlib,json,pathlib,re,subprocess
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[4]
P=pathlib.Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0862f-bd95-7660-802d-282c781c1c5f/continuation-001/library')
sha=lambda b:hashlib.sha256(b).hexdigest()
q=json.loads((HERE.parent/'library-repair-queue.json').read_text())
files={f['path']:f for row in q['items'] for f in row['localFileCandidates']}
def inspect(f):
 p=ROOT/f['path'];raw=p.read_bytes();assert sha(raw)==f['sha256']
 r={'path':f['path'],'rawPath':str(p),'rawSha256':f['sha256'],'sourceIdentityConfirmed':False,'human_verified':False}
 if raw.startswith(b'%PDF-'):
  d=P/'local-extraction'/r['rawSha256'];d.mkdir(parents=True,exist_ok=True);t=d/'text.txt'
  subprocess.run(['pdftotext','-layout',str(p),str(t)],check=True,capture_output=True,timeout=60)
  info=subprocess.check_output(['pdfinfo',str(p)],text=True);pages=int(re.search(r'^Pages:\s+(\d+)',info,re.M)[1])
  subprocess.run(['pdftoppm','-f','1','-l','1','-singlefile','-scale-to','1100','-png',str(p),str(d/'cover')],check=True,capture_output=True,timeout=60)
  r.update(format='pdf',status='local_pdf_extracted_identity_pending',textPath=str(t),textSha256=sha(t.read_bytes()),wordCount=len(t.read_text().split()),pdfPages=pages,coverPath=str(d/'cover.png'),sourceUrlsExtracted=False,distribution='internal_source_restricted' if not f['path'].startswith('research/') else 'rights_not_established')
 else:
  text=raw.decode('utf-8');r.update(format=p.suffix.lstrip('.'),status='local_text_note_inspected',wordCount=len(text.split()),firstHeading=next((l.lstrip('# ').strip() for l in text.splitlines() if l.startswith('#')),None),sourceUrlsExtracted=True,role='note_not_confirmed_original')
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:results=list(ex.map(inspect,files.values()))
out={'schema':'library-local-format-overlay/v1','originalQueueSha256':sha((HERE.parent/'library-repair-queue.json').read_bytes()),'supersedes':'Binary-decoded localInspection fields in frozen acquisition ledger; raw ledger retained as history','files':results}
(P/'local-extraction/manifest.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
known={i['result']['rawSha256'] for i in json.loads((P/'cover-review/index.json').read_text())['documents']}
known.update(i['rawSha256'] for i in json.loads((P/'decoded-formats/manifest.json').read_text())['items'] if 'rawSha256'in i)
new=[dict(r) for r in results if r['format']=='pdf' and r['rawSha256']not in known]
for i,r in enumerate(new,1):r['localNumber']=i
(P/'local-extraction/new-index.json').write_text(json.dumps(new,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'uniqueLocalFiles':len(results),'formats':dict(collections.Counter(r['format'] for r in results))}))
