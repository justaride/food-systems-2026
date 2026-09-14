#!/usr/bin/env python3
"""Capture and verify the named newer Estate evidence; never run a restore."""
import csv,datetime,hashlib,json,pathlib,sys
HERE=pathlib.Path(__file__).resolve().parent;ROOT=HERE.parents[4]
MANIFEST=pathlib.Path('/Users/gabrielfreeman/Documents/GabiBFree-DashBoard-db-backups/MANIFEST-COOLIFY-v1.tsv')
REF='coolify-food-systems-pgvector-db-20260909-013007-3d6720.dump.age'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
rows=list(csv.DictReader(MANIFEST.open(),delimiter='\t'));idx,row=next((i+2,x) for i,x in enumerate(rows) if x['encryptedFile']==REF)
artifact=MANIFEST.parent/REF;assert sha(artifact)==row['encryptedSha256'];assert row['sourceDatabase']=='l0s8o8oo00c8gossw0gksswk';assert row['icloudStatus']==row['s3Status']=='verified'
receipt={'schemaVersion':1,'authority':'gabibfree-estate-data-asset-proofs','assetKey':'coolify:'+row['sourceDatabase'],'databaseUuid':row['sourceDatabase'],'source':{'repository':'justaride/gabibfree-dashboard','commit':row['sourceCommit'],'manifest':MANIFEST.name,'manifestLine':idx},'artifact':{'ref':REF,'sha256':row['encryptedSha256'],'bytes':artifact.stat().st_size,'icloudStatus':row['icloudStatus'],'s3Status':row['s3Status']},'proofs':[{'kind':kind,'artifactRef':REF,'artifactSha256':row['encryptedSha256'],'provenAt':row['restoreVerifiedAt'] if kind=='restore' else row['createdAt']} for kind in ['backup','offsite','restore']],'capturedAt':'2026-09-09T13:41:41Z'}
evidence={'schema':'estate-followup-evidence/v1','manifestPath':str(MANIFEST),'manifestRowNumber':idx,'manifestRowSha256':hashlib.sha256(MANIFEST.read_text().splitlines()[idx-1].encode()).hexdigest(),'encryptedArtifactPath':str(artifact),'encryptedArtifactSha256':sha(artifact),'receiptPath':'config/production-backup-receipts/food-systems-pgvector-db-2026-09-09-013028.json','encryptedBytesVerified':True,'newRestoreExecutedByThisTask':False,'restoreEvidenceOwner':'Estate scheduled job','offsiteNetworkReadbackPerformed':False,'workflowConfigurationChanged':False,'limitations':['Verified statements and encrypted local bytes; no new restore or offsite network readback in this task.','RPO/RTO, retention and accountable operations owner remain human decisions.']}
for p,x in [(ROOT/evidence['receiptPath'],receipt),(HERE/'estate-evidence.json',evidence)]:
 data=json.dumps(x,ensure_ascii=False,indent=2)+'\n'
 if '--write' in sys.argv:
  p.write_text(data)
 else:assert p.read_text()==data
print('Estate 9 September encrypted bytes and backup/offsite/restore evidence verified')
