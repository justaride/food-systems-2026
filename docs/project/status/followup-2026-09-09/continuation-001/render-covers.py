#!/usr/bin/env python3
"""Private first-page contact sheets for document-identity inspection only."""
import pathlib,json,hashlib,subprocess,concurrent.futures
from PIL import Image,ImageOps,ImageDraw
P=pathlib.Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0862f-bd95-7660-802d-282c781c1c5f/continuation-001/library')
ledger=json.loads((P/'acquisition-ledger.json').read_text());by={}
for row in ledger['items']:
 for request in row['sourceRequests']:
  result=request['result']
  if result['status']=='pdf_text_extracted':
   item=by.setdefault(result['rawSha256'],{'result':result,'records':[]});item['records'].append({'id':row['libraryAnalysisRecordId'],'title':row['registeredTitle']})
items=sorted(by.values(),key=lambda x:x['result']['requestedUrl']);out=P/'cover-review';out.mkdir(exist_ok=True)
def render(arg):
 i,item=arg;path=out/f'cover-{i:03d}'
 subprocess.run(['pdftoppm','-f','1','-l','1','-singlefile','-scale-to','1100','-png',item['result']['rawPath'],str(path)],check=True,capture_output=True,timeout=30)
 item.update(number=i,coverPath=str(path)+'.png');return item
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:items=list(ex.map(render,enumerate(items,1)))
for batch in range(0,len(items),6):
 sheet=Image.new('RGB',(1600,3300),'#dddddd');d=ImageDraw.Draw(sheet)
 for offset,item in enumerate(items[batch:batch+6]):
  x=(offset%2)*800;y=(offset//2)*1100
  im=Image.open(item['coverPath']).convert('RGB');im.thumbnail((780,1040));sheet.paste(im,(x+(800-im.width)//2,y+50));d.text((x+12,y+12),str(item['number'])+' | '+item['result']['rawSha256'][:12],fill='black')
 path=out/f'sheet-{batch//6+1:02d}.png';sheet.save(path)
(out/'index.json').write_text(json.dumps({'identityOnly':True,'fullSemanticReading':False,'documents':items},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'uniquePdfs':len(items),'contactSheets':(len(items)+5)//6,'index':str(out/'index.json')}))
