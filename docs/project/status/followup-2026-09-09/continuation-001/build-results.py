#!/usr/bin/env python3
"""Regenerate candidate-only identity results from hash-bound private evidence."""
import collections,csv,hashlib,json,pathlib,sys
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[4]
P=pathlib.Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0862f-bd95-7660-802d-282c781c1c5f/continuation-001/library')
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text())
def enc(x):return json.dumps(x,ensure_ascii=False,indent=2)+'\n'
def canonical(x):return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def tsv(name,key):return {x[key]:x for x in csv.DictReader((HERE/name).open(),delimiter='\t')}
def verify(r):
 for pk,hk in [('rawPath','rawSha256'),('textPath','textSha256'),('wireRawPath','wireRawSha256')]:
  if pk in r:assert sha(pathlib.Path(r[pk]).read_bytes())==r[hk],r[pk]
ledger=load(P/'acquisition-ledger.json');local=load(P/'local-extraction/manifest.json');decoded=load(P/'decoded-formats/manifest.json')
assert sha(pathlib.Path(ledger['queuePath']).read_bytes())==ledger['queueSha256']==local['originalQueueSha256']
assert decoded['ledgerSha256']==sha((P/'acquisition-ledger.json').read_bytes())
requests={q['url']:q['result'] for e in ledger['items'] for q in e['sourceRequests']}
for e in ledger['items']:
 for q in e['sourceRequests']:assert sha(pathlib.Path(q['receiptPath']).read_bytes())==q['receiptSha256']
for r in list(requests.values())+local['files']+decoded['items']:verify(r)
localByPath={r['path']:r for r in local['files']};decByUrl={r['requestedUrl']:r for r in decoded['items']}
obs=tsv('cover-observations.tsv','number');lobs=tsv('local-cover-observations.tsv','number');dobs=tsv('decoded-cover-observations.tsv','requestId')
profile={'schema':'library-identity-target/v1','purpose':'Candidate identity and availability only; no canonical document/source mutation','allowedClaims':['observed title and edition on physical first page','download and extraction outcome','explicit identity mismatch or scope limit'],'notEstablished':['full scientific reading','claim correctness','current operational/legal/financial status','human approval','external redistribution rights'],'human_verified':False,'readinessChanged':False}
profilesha=sha(enc(profile).encode());policysha=sha((ROOT/'AGENTS.md').read_bytes())
items=[]
for c in load(P/'cover-review/index.json')['documents']:
 o=obs[str(c['number'])];items.append({'result':c['result'],'coverPath':c['coverPath'],'observation':o,'associationStatus':'different_document_do_not_substitute' if c['number'] in {13,17,44,48,52,73} else 'compatible_limited','observationFile':'cover-observations.tsv','observationKey':str(c['number'])})
for r in decoded['items']:
 if r['status']!='gzip_pdf_decoded':continue
 key=sha(r['requestedUrl'].encode());items.append({'result':r,'coverPath':r['coverPath'],'observation':dobs[key],'associationStatus':'compatible_limited','observationFile':'decoded-cover-observations.tsv','observationKey':key})
for r in load(P/'local-extraction/new-index.json'):
 o=lobs[str(r['localNumber'])];assert r['rawSha256']==localByPath[r['path']]['rawSha256']
 items.append({'result':r,'coverPath':r['coverPath'],'observation':o,'associationStatus':o['associationStatus'],'observationFile':'local-cover-observations.tsv','observationKey':str(r['localNumber'])})
assert len(items)==140 and len({i['result']['rawSha256']for i in items})==140
candidates=[];pages=[];byraw={}
for n,item in enumerate(items,1):
 r=item['result'];verify(r);o=item['observation'];rawsha=r['rawSha256'];image=pathlib.Path(item['coverPath']);assert image.is_file()
 texts=pathlib.Path(r['textPath']).read_text().split('\f')
 if not texts[-1].strip():texts.pop()
 assert len(texts)==r['pdfPages'],(n,len(texts),r['pdfPages'])
 pages.extend({'rawSha256':rawsha,'physicalPage':i,'pageTextSha256':sha(t.encode()),'wordCount':len(t.split())}for i,t in enumerate(texts,1))
 sourceurls=[];associations={};paths=[]
 for e in ledger['items']:
  bases=[]
  for q in e['sourceRequests']:
   effective=decByUrl.get(q['url'],q['result'])
   if effective.get('rawSha256')==rawsha:sourceurls.append(q['url']);bases.append({'kind':'request','value':q['url'],'basis':q['basis'],'associationRole':'unvalidated_binary_embedded_link' if q['basis'] in localByPath and localByPath[q['basis']]['format']=='pdf' else 'explicit_record_or_text_note_link'})
  for f in e['localInspection']:
   if localByPath[f['path']]['rawSha256']==rawsha:paths.append(f['path']);bases.append({'kind':'local_file','value':f['path']})
  if bases:associations[e['libraryAnalysisRecordId']]={'id':e['libraryAnalysisRecordId'],'title':e['registeredTitle'],'bases':bases}
 internal=item['associationStatus']=='internal_context_only'
 c={'schema':'library-identity-candidate/v1','candidateId':f'LIB-20260909-CONT001-{n:03d}','observedTitle':o['observedTitle'],'observedYear':int(o['observedYear'])if o['observedYear'] else None,'associationNote':o['associationNote'],'associationStatus':item['associationStatus'],'sourceRequests':sorted(set(sourceurls)),'localPaths':sorted(set(paths)),'rawPath':r['rawPath'],'rawSha256':rawsha,'textPath':r['textPath'],'textSha256':r['textSha256'],'physicalPages':r['pdfPages'],'textWordCount':r['wordCount'],'visualInspection':{'physicalPages':[1],'coverPath':str(image),'coverSha256':sha(image.read_bytes()),'readScope':'Physical first-page identity only; unresolved title pages are explicitly flagged','human_verified':False,'observationPath':str((HERE/item['observationFile']).relative_to(ROOT)),'observationFileSha256':sha((HERE/item['observationFile']).read_bytes()),'observationKey':item['observationKey']},'recordAssociations':list(associations.values()),'policyPath':'AGENTS.md','policySha256':policysha,'targetProfilePath':str((HERE/'target-profile.json').relative_to(ROOT)),'targetProfileSha256':profilesha,'fullSemanticAnalysisComplete':False,'sourceIdentityApplied':False,'human_verified':False,'published':False,'readinessChanged':False,'rights':{'retrieval':'existing internal file only'if internal else 'public unauthenticated URL or pre-existing local file; see provenance','redistributionAuthorized':False,'rawStorage':'private archive or pre-existing local source; no new Git raw copy','internalOnly':internal}}
 for k in ['wireRawPath','wireRawSha256']:
  if k in r:c[k]=r[k]
 c['candidateSha256']=canonical(c);candidates.append(c);byraw[rawsha]=c
assert all(r['rawSha256']in byraw for r in local['files']if r['format']=='pdf')
wrong={c['candidateId']for c in candidates if c['associationStatus'].startswith('different_')};pending={c['candidateId']for c in candidates if c['associationStatus']=='identity_unresolved'};internal={c['candidateId']for c in candidates if c['associationStatus']=='internal_context_only'}
actions={'pdf_identity_candidate_available':'Kontroller eksakt postbinding og gjennomfør kildeavgrenset faglig lesing. Ingen automatisk import.','internal_context_candidate_only':'Behold internt; vurder dokumentets rolle. Arbeidsnotat og e-post er ingen godkjenning.','pdf_title_identity_unresolved':'Kontroller tittelside eller autoritativ katalog mot den eksakte filen.','different_document_or_edition_only':'Finn originalen for riktig verk og år. Ikke erstatt med annet dokument eller annen årgang.','html_available_identity_unresolved':'Identifiser konkret side og versjon før faglig bruk.','no_explicit_original_available':'Identifiser originalen fra notat/tittel eller innhent fil fra eier.','structured_search_not_unique_document':'Skaff entydig original; registerets søketreff identifiserer ikke automatisk riktig kilde.','access_failed_or_denied':'Innhent tilgjengelig autorisert original, eller dokumenter historisk/utilgjengelig kilde.'}
rows=[];excluded=[]
for e in ledger['items']:
 refs=[];localrefs=[]
 for q in e['sourceRequests']:
  r=decByUrl.get(q['url'],q['result']);metadata=q['basis']in localByPath and localByPath[q['basis']]['format']=='pdf'
  if metadata:
   excluded.append({'libraryAnalysisRecordId':e['libraryAnalysisRecordId'],'url':q['url'],'basis':q['basis'],'reason':'URL found by decoding binary PDF bytes is not a verified subject-source link; local PDF processed directly.'});continue
  refs.append({'url':q['url'],'basis':q['basis'],'receiptPath':q['receiptPath'],'receiptSha256':q['receiptSha256'],'historicalStatus':q['result']['status'],'effectiveStatus':r['status'],'candidateId':byraw.get(r.get('rawSha256'),{}).get('candidateId'),'htmlTitle':r.get('htmlTitle'),'rawSha256':r.get('rawSha256'),'wordCount':r.get('wordCount')})
 for old in e['localInspection']:
  r=localByPath[old['path']];localrefs.append({k:r[k]for k in ['path','rawSha256','format','status','wordCount','role','sourceUrlsExtracted']if k in r});localrefs[-1]['candidateId']=byraw.get(r['rawSha256'],{}).get('candidateId')
 ids=sorted({r['candidateId']for r in refs+localrefs if r['candidateId']});usable=sorted(set(ids)-wrong-pending-internal)
 if usable:status='pdf_identity_candidate_available'
 elif set(ids)&internal:status='internal_context_candidate_only'
 elif set(ids)&pending:status='pdf_title_identity_unresolved'
 elif ids:status='different_document_or_edition_only'
 elif any(r['effectiveStatus']=='html_text_extracted'for r in refs):status='html_available_identity_unresolved'
 elif not refs:status='no_explicit_original_available'
 elif any(r['effectiveStatus']=='business_registry_search_not_unique_document'for r in refs):status='structured_search_not_unique_document'
 else:status='access_failed_or_denied'
 rows.append({'libraryAnalysisRecordId':e['libraryAnalysisRecordId'],'registeredTitle':e['registeredTitle'],'priority':e['priority'],'existingDocumentId':e['existingDocumentId'],'existingSourceDocId':e['existingSourceDocId'],'localInspection':localrefs,'requests':refs,'candidateIds':ids,'usableCandidateIds':usable,'status':status,'nextAction':actions[status],'human_verified':False,'productionQueueChanged':False})
counts=dict(collections.Counter(r['status']for r in rows));formats=dict(collections.Counter(r['format']for r in local['files']))
summary={'schema':'library-continuation-status/v1','basis':'Same 392-row production snapshot as prior follow-up; not a new live census','rows':len(rows),'localFileFormats':formats,'historicalUniqueRequests':len(requests),'historicalRequestOutcomes':dict(collections.Counter(r['status']for r in requests.values())),'excludedBinaryDerivedReferences':len(excluded),'excludedUniqueBinaryDerivedUrls':len({r['url']for r in excluded}),'rdfNamespaceReferences':sum(r['url']=='http://www.w3.org/1999/02/22-rdf-syntax-ns#' for r in excluded),'decodedGzipPdfs':3,'rowOutcomes':counts,'uniquePdfRawFiles':len(candidates),'visuallyInspectedFirstPages':len(candidates),'physicalPageBindings':len(pages),'pdfAssociatedRows':sum(bool(r['candidateIds'])for r in rows),'differentDocumentOrEditionCandidates':sorted(wrong),'titleUnresolvedCandidates':sorted(pending),'internalOnlyCandidates':sorted(internal),'fullSemanticAnalysisComplete':False,'databaseChanged':False,'humanReviewRecorded':False,'productionQueueChanged':False,'published':False,'modelAttestationChanged':False,'inputs':[{'path':str(p),'sha256':sha(p.read_bytes())}for p in [pathlib.Path(ledger['queuePath']),P/'acquisition-ledger.json',P/'local-extraction/manifest.json',P/'local-extraction/new-index.json',P/'decoded-formats/manifest.json',P/'cover-review/index.json']]}
assert len(rows)==392 and len({r['libraryAnalysisRecordId']for r in rows})==392 and sum(counts.values())==392
outputs={'target-profile.json':enc(profile),'document-candidates.json':enc({'schema':'library-identity-candidate-bundle/v1','candidates':candidates}),'page-index.json':enc({'schema':'library-page-index/v1','method':'pdftotext -layout; split at formfeed; physical page count checked against pdfinfo; not semantic reading','pages':pages}),'queue.json':enc({'schema':'library-continuation-queue/v1','items':rows}),'excluded-metadata-links.json':enc({'schema':'library-acquisition-correction/v1','historicalLedgerPreserved':True,'items':excluded}),'status.json':enc(summary)}
lines=['# Bibliotek og gjenstående arbeid — fortsettelse 001','',f"Alle **392 poster** i det bevarte produksjonsuttrekket er gjennomgått videre. **{len(candidates)} ulike PDF-filer** er tekstuttrukket, bundet til **{len(pages)} fysiske sider** og kontrollert visuelt på førstesiden. **{summary['pdfAssociatedRows']} poster har en PDF-assosiasjon**, hvorav **{counts.get('pdf_identity_candidate_available',0)} har minst én dokumentkandidat med avgrenset, forenlig identitet**. Dette er klargjøring for faglig lesing; ingen produksjonspost er godkjent eller endret.",'','De 187 lokale filene er 97 PDF-er, 86 Markdown-notater og fire tekstfiler. Den første innhentingen forsøkte 271 nettadresser. Tre gzip-komprimerte årsrapporter er dekodet med både overføringshash og PDF-hash bevart. 176 referanser til 59 adresser var funnet ved feilaktig teksttolking av binære PDF-er. Disse er holdt utenfor de gjeldende postkoblingene; selve PDF-ene er behandlet direkte. Blant referansene er 61 treff på én teknisk RDF-adresse. De øvrige kan være innbakte lenker, men er ikke bekreftet som originalkilder til posten. Dette er en rettelse av innhentingen, ikke et funn av 176 feil i databasen. Den opprinnelige innhentingsloggen er bevart som historikk.','','| Gjeldende lokal disposisjon | Poster | Neste handling |','|---|---:|---|']
for k,v in sorted(counts.items()):lines.append(f'| {k} | {v} | {actions[k]} |')
lines+=['','Disposisjonene summerer til 392 og er ingen ferdigprosent. Alle 392 produksjonsposter er uendret.','','## Feil dokument eller årgang','','| Kandidat | Observert dokument | Registrert kobling |','|---|---|---|']
for c in candidates:
 if c['candidateId']in wrong:lines.append('| '+c['candidateId']+' | '+c['observedTitle'].replace('|','\\|')+' | '+'; '.join(x['title']for x in c['recordAssociations']).replace('|','\\|')+' |')
lines+=['','Noen feiltreff stammer fra tilleggskilder, ikke nødvendigvis fra en kanonisk binding. De riktige originalene for campusmatsvinn, pandemireview, Uppsala og Dagligvaretilsynets 2021-rapport ble funnet lokalt. En CV erstatter ikke en forskningsrapport; en Nature Food-artikkel erstatter ikke Konkurransetilsynets src-73. Rapportene fra den finske matmarkedsombudsmannen og Dagligvaretilsynets samarbeidsundersøkelse har andre årganger enn registrert og holdes separat.','','Øvrige presiseringer ligger ved hver kandidat: rapportår kan avvike fra filnavn, halvårsregnskap er en egen periode, språkversjoner og sammendrag er ikke uavhengige studier. Ulsaker-filen starter med en takkeside; tittelidentiteten er derfor fortsatt uavklart. Fire interne dokumenter/e-postutskrifter er holdt som intern kontekst. Ingen mandat-, finansierings- eller delingsgodkjenning er utledet fra dem.','','## Leveranser','',f'- [Dokumentkandidater](document-candidates.json): {len(candidates)} identitetsobservasjoner med fil-, tekst-, bilde-, observasjons-, policy- og målprofilhash.','- [Gjeldende arbeidskø](queue.json): alle 392 ID-er med kildetilgang, kandidater og neste handling.','- [Fysisk sideindeks](page-index.json): sidehash og ordmengde; ingen fulltekst kopiert til Git.','- [Nettobservasjoner](cover-observations.tsv), [lokale observasjoner](local-cover-observations.tsv) og [dekodede årsrapporter](decoded-cover-observations.tsv).','- [Verifikasjon](verification.json): fem navngitte kontroller og 140 kandidat-/myndighetskontroller.', '- [Rettede metadatakoblinger](excluded-metadata-links.json) og [maskinlesbar status](status.json).','','## Backup','','Ny Estate-kvittering binder den krypterte filen fra 9. september kl. 01.30 UTC. Manifestet registrerer restore 01.30.24 UTC og backup/offsite 01.30.28 UTC. Lokale krypterte bytes er SHA-kontrollert, og prosjektets 36-timerskontroll består. Dette er bevis fra Estate-jobben, ikke en ny restore kjørt her eller en ny nettverkskontroll av offsitekopiene. [Eksakt bevis](estate-evidence.json).','','## Faktiske restanser','','1. Full faglig lesing og presise påstand-/kildebindinger; de 140 førstesidene og sidehashene er ikke en full analyse.','2. Manglende originaler, HTML-identiteter, feil årganger og én uavklart PDF-tittel må følges etter køens konkrete handling.','3. De tidligere 11 dataeierpakkene og fire kildepakkene venter fortsatt på spesifisert nytt materiale. Se [inntaksbehov](../KILDE-OG-DATAEIERBEHOV.md). Ingen henvendelser er sendt.','4. Menneskelig review, mandat, kapasitet/finansiering, pilot, delingsnivå og driftsansvar/RPO/RTO gjenstår hos riktig eier. Se [beslutningsbehov](../BESLUTNINGER.md).','','Ingen empiriske C1–C5-gap eller modellattestasjonsporter er lukket. Ingen databaseimport, migrasjon, deploy, publisering eller ny innlogget UI-kontroll er utført.','','## Reproduksjon','','Kjør `build-results.py` for hash- og regenereringskontroll; `--write` regenererer snapshottene. Private kildearkiver og de opprinnelige lokale filene må være tilgjengelige. `inspect-local.py` lager den formatkorrekte private uttrekksoverlegningen. `refresh-estate.py` kontrollerer den eksakte backupkilden. Den frosne innhentingsloggen kan ikke overskrives av `acquire-library.py`.']
outputs['README.md']='\n'.join(lines)+'\n'
for name,content in outputs.items():
 p=HERE/name
 if '--write'in sys.argv:p.write_text(content)
 else:assert p.read_text()==content,'Generated drift: '+name
print(enc(summary))
