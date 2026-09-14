#!/usr/bin/env python3
"""Bounded public-source recovery. No database, login, source promotion or review writes.
Every request starts at a retained record URL or explicit link in its local note.
Access denials are recorded without retry or circumvention. Raw content stays private.
"""
import concurrent.futures,datetime,hashlib,html.parser,ipaddress,json,pathlib,re,socket,subprocess,sys,threading,time,urllib.request,urllib.parse,urllib.error
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[4]
PRIOR=HERE.parent
PRIVATE=pathlib.Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0862f-bd95-7660-802d-282c781c1c5f/continuation-001/library')
MAX_BYTES=40*1024*1024
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text())
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
class Text(html.parser.HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.parts=[];self.in_title=False;self.title=[]
 def handle_starttag(self,t,a):
  if t in ['script','style','noscript','svg']:self.skip+=1
  if t=='title':self.in_title=True
  if t in ['p','div','li','h1','h2','h3','tr','br']:self.parts.append('\n')
 def handle_endtag(self,t):
  if t in ['script','style','noscript','svg'] and self.skip:self.skip-=1
  if t=='title':self.in_title=False
 def handle_data(self,d):
  if not self.skip:self.parts.append(d)
  if self.in_title:self.title.append(d)
def validate(url):
 u=urllib.parse.urlparse(url)
 if u.scheme not in ['http','https'] or not u.hostname or u.username or u.password:raise ValueError('unsupported_or_credentialed_url')
 if u.port not in [None,80,443]:raise ValueError('non_public_service_port')
 if any(k in urllib.parse.parse_qs(u.query) for k in ['token','access_token','password','key','api_key']):raise ValueError('credential_parameter')
 for x in socket.getaddrinfo(u.hostname,u.port or 443,type=socket.SOCK_STREAM):
  if not ipaddress.ip_address(x[4][0]).is_global:raise ValueError('non_public_network_address')
 return url
class Redirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  validate(newurl);return super().redirect_request(req,fp,code,msg,headers,newurl)
locks={};global_lock=threading.Lock()
def retrieve(url):
 key=sha(url.encode());directory=PRIVATE/'responses'/key;record=directory/'receipt.json'
 if record.exists():return load(record)
 out={'requestedUrl':url,'requestId':key,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'maxBytes':MAX_BYTES,'human_verified':False,'semanticReadingPerformed':False,'sourceIdentityConfirmed':False}
 try:
  validate(url);host=urllib.parse.urlparse(url).hostname
  with global_lock:lock=locks.setdefault(host,threading.Lock())
  with lock:
   request=urllib.request.Request(url,headers={'User-Agent':'FoodSystemsResearch/1.0 (public source availability check)','Accept':'application/pdf,text/html,text/plain,*/*;q=0.5'})
   with urllib.request.build_opener(Redirect()).open(request,timeout=20) as response:
    out.update(httpStatus=response.status,finalUrl=response.url,contentType=response.headers.get('Content-Type',''))
    if int(response.headers.get('Content-Length','0') or 0)>MAX_BYTES:raise ValueError('size_limit')
    raw=response.read(MAX_BYTES+1)
    if len(raw)>MAX_BYTES:raise ValueError('size_limit')
   time.sleep(0.15)
  directory.mkdir(parents=True,exist_ok=True)
  ispdf=raw.startswith(b'%PDF-');rawpath=directory/('raw.pdf' if ispdf else 'raw.html' if 'html' in out['contentType'] else 'raw.bin');rawpath.write_bytes(raw)
  out.update(rawPath=str(rawpath),rawSha256=sha(raw),bytes=len(raw))
  if ispdf:
   p=subprocess.run(['pdftotext','-layout',str(rawpath),str(directory/'text.txt')],capture_output=True,timeout=35)
   info=subprocess.run(['pdfinfo',str(rawpath)],capture_output=True,text=True,timeout=15)
   m=re.search(r'^Pages:\s+(\d+)',info.stdout,re.M);out['pdfPages']=int(m[1]) if m else None
   out['pdfInfo']=dict(line.split(':',1) for line in info.stdout.splitlines() if line.startswith(('Title:','Author:','Creator:','CreationDate:','Pages:','Encrypted:')))
   out['status']='pdf_text_extracted' if p.returncode==0 else 'pdf_extraction_failed'
  elif 'html' in out['contentType'] or b'<html' in raw[:1500].lower():
   parser=Text();parser.feed(raw.decode('utf-8',errors='replace'));text='\n'.join(re.sub(r'\s+',' ',line).strip() for line in ''.join(parser.parts).splitlines() if line.strip());(directory/'text.txt').write_text(text)
   out['htmlTitle']=' '.join(parser.title).strip();out['status']='html_text_extracted'
   if re.search(r'access denied|verify (?:that )?you are human|just a moment|captcha|restaurant not found',out['htmlTitle']+'\n'+text[:600],re.I):out['status']='access_challenge_or_not_found_content'
  elif out['contentType'].startswith('text/plain'):
   (directory/'text.txt').write_text(raw.decode('utf-8',errors='replace'));out['status']='plain_text_extracted'
  else:out['status']='retrieved_unparsed_format'
  textpath=directory/'text.txt'
  if textpath.exists():
   tb=textpath.read_bytes();out.update(textPath=str(textpath),textSha256=sha(tb),wordCount=len(tb.decode(errors='replace').split()))
 except urllib.error.HTTPError as e:out.update(status='http_error_no_retry',httpStatus=e.code,errorType=type(e).__name__)
 except Exception as e:out.update(status='access_or_extraction_failed',errorType=type(e).__name__,reason=str(e)[:180])
 write(record,out);return out

def main():
 if (PRIVATE/'acquisition-ledger.json').exists():
  raise SystemExit('Frozen acquisition exists. Use format-aware overlays; do not overwrite history.')
 q=load(PRIOR/'library-repair-queue.json');original=load(pathlib.Path(q['sourceWorklistPath']));source={x['id']:x for x in original['items']}
 assert sha(pathlib.Path(q['sourceWorklistPath']).read_bytes())==q['sourceWorklistSha256']
 entries=[];requests=set()
 for row in q['items']:
  old=source[row['libraryAnalysisRecordId']];urls=[];local=[]
  for k in ['documentUrl','sourceDocUrl']:
   if row.get(k):urls.append({'url':row[k],'basis':k})
  for f in row['localFileCandidates']:
   p=ROOT/f['path'];raw=p.read_bytes();assert sha(raw)==f['sha256']
   if raw.startswith(b'%PDF-'):
    local.append({'path':f['path'],'sha256':f['sha256'],'format':'pdf','role':'local_pdf_requires_format_aware_extraction','sourceIdentityConfirmed':False})
    continue
   text=raw.decode('utf-8')
   candidates=re.findall(r'https?://[^\s<>"\]\)]+',text)
   for u in candidates:
    if u not in [x['url'] for x in urls]:urls.append({'url':u.rstrip('.,;'),'basis':f['path']})
   local.append({'path':f['path'],'sha256':f['sha256'],'wordCount':len(text.split()),'firstHeading':next((l.lstrip('# ').strip() for l in text.splitlines() if l.startswith('#')) ,None),'frontmatterTitle':next(iter(re.findall(r'^title:\s*[\"\x27]?(.*?)[\"\x27]?\s*$',text,re.M)),None),'role':'existing_internal_note_not_confirmed_original','sourceIdentityConfirmed':False})
  # At most three explicit record/note URLs per row; no inferred crawls.
  selected=urls[:3]
  for x in selected:requests.add(x['url'])
  entries.append({'libraryAnalysisRecordId':row['libraryAnalysisRecordId'],'registeredTitle':old['title'],'existingDocumentId':row['documentId'],'existingSourceDocId':row['sourceDocId'],'priority':row['priority'],'priorPreparedCandidateId':row['preparedCandidateId'],'localInspection':local,'sourceRequests':selected,'omittedExplicitLinkCount':max(0,len(urls)-len(selected)),'human_verified':False,'productionQueueChanged':False})
 PRIVATE.mkdir(parents=True,exist_ok=True)
 write(PRIVATE/'request-plan.json',{'originalQueueSha256':sha((PRIOR/'library-repair-queue.json').read_bytes()),'items':entries,'uniqueRequests':len(requests)})
 print(json.dumps({'rows':len(entries),'uniquePublicRequests':len(requests),'localFilesInspected':sum(len(e['localInspection']) for e in entries)}),flush=True)
 if '--fetch' not in sys.argv:return
 results={}
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
  fut={pool.submit(retrieve,u):u for u in sorted(requests)}
  for i,f in enumerate(concurrent.futures.as_completed(fut),1):
   results[fut[f]]=f.result()
   if i%25==0:print(json.dumps({'requestsCompleted':i,'total':len(requests)}),flush=True)
 for e in entries:
  for x in e['sourceRequests']:x['receiptPath']=str(PRIVATE/'responses'/sha(x['url'].encode())/'receipt.json');x['receiptSha256']=sha(pathlib.Path(x['receiptPath']).read_bytes());x['result']=results[x['url']]
 write(PRIVATE/'acquisition-ledger.json',{'schema':'library-acquisition-ledger/v1','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'queuePath':str(PRIOR/'library-repair-queue.json'),'queueSha256':sha((PRIOR/'library-repair-queue.json').read_bytes()),'rows':len(entries),'uniqueRequests':len(results),'items':entries,'databaseMutation':False,'sourceIdentityConfirmed':False,'fullSemanticAnalysisComplete':False})
 print('Acquisition ledger complete',flush=True)
if __name__=='__main__':main()
