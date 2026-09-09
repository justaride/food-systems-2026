#!/usr/bin/env python3
"""Decode already acquired gzip PDFs and classify structured/namespace responses."""
import gzip,hashlib,io,json,pathlib,re,subprocess
HERE=pathlib.Path(__file__).resolve().parent
P=pathlib.Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0862f-bd95-7660-802d-282c781c1c5f/continuation-001/library')
x=json.loads((P/'acquisition-ledger.json').read_text());requests={q['url']:q['result'] for e in x['items'] for q in e['sourceRequests']};results=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
for url,r in requests.items():
 if r['status']!='retrieved_unparsed_format':continue
 raw=pathlib.Path(r['rawPath']).read_bytes();assert sha(raw)==r['rawSha256'];d=P/'decoded-formats'/r['requestId'];d.mkdir(parents=True,exist_ok=True)
 out={'requestedUrl':url,'previousReceiptPath':str(pathlib.Path(r['rawPath']).parent/'receipt.json'),'wireRawPath':r['rawPath'],'wireRawSha256':r['rawSha256'],'sourceIdentityApplied':False,'human_verified':False}
 if raw.startswith(b'\x1f\x8b'):
  decoded=gzip.GzipFile(fileobj=io.BytesIO(raw)).read(40*1024*1024+1);assert len(decoded)<=40*1024*1024 and decoded.startswith(b'%PDF-')
  pdf=d/'decoded.pdf';pdf.write_bytes(decoded);text=d/'text.txt';subprocess.run(['pdftotext','-layout',str(pdf),str(text)],check=True,capture_output=True,timeout=30)
  info=subprocess.check_output(['pdfinfo',str(pdf)],text=True);n=int(re.search(r'^Pages:\s+(\d+)',info,re.M)[1]);subprocess.run(['pdftoppm','-f','1','-l','1','-singlefile','-scale-to','1200','-png',str(pdf),str(d/'cover')],check=True,capture_output=True,timeout=30)
  out.update(status='gzip_pdf_decoded',rawPath=str(pdf),rawSha256=sha(decoded),textPath=str(text),textSha256=sha(text.read_bytes()),pdfPages=n,coverPath=str(d/'cover.png'),wordCount=len(text.read_text().split()))
 elif 'application/json' in r['contentType']:
  j=json.loads(raw);entities=j.get('_embedded',{}).get('enheter',[])
  out.update(status='business_registry_search_not_unique_document',entityCount=len(entities),matchSelectionPerformed=False,reason='A registry search response does not identify the intended restaurant or recover its Michelin profile.')
 elif 'text/turtle' in r['contentType']:out.update(status='technical_namespace_not_subject_source',reason='W3C RDF vocabulary URL from binary PDF metadata; not a food-systems original document.')
 else:raise ValueError('Unknown format')
 (d/'receipt.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');results.append(out)
(P/'decoded-formats/manifest.json').write_text(json.dumps({'schema':'library-decoded-formats/v1','ledgerSha256':sha((P/'acquisition-ledger.json').read_bytes()),'items':results},ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{k:r[k] for k in ['status','requestedUrl','pdfPages','coverPath','entityCount'] if k in r} for r in results],ensure_ascii=False,indent=2))
