#!/usr/bin/env python3
"""Bounded source arithmetic for chapter 5; no corrected canonical data."""
import argparse, hashlib, json
from pathlib import Path
R=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--write',action='store_true');a=p.parse_args()
d=json.loads((R/'dossiers/129-003.json').read_text()); checks=[]
for label,values,reported in [('farms2000',[2223,3943,6244,4050,3412,1542],21379),('area2000',[60688,246831,701201,663278,890532,800914],3336445),('area2022',[8407,79946,303208,331296,583017,1530292],2836167)]:
 s=sum(values);assert s!=reported
 checks.append(dict(claimId='READ129-26',check=label,displayedRows=values,calculatedSum=s,sourceTotal=reported,disposition='Preserve conflict; obtain underlying SSB table'))
v=(1654/4050-1)*100;assert round(v,1)!=-33.2
checks.append(dict(claimId='READ129-26',check='farms 200–299 dekar',calculatedPercent=round(v,4),sourcePercent=-33.2,disposition='Preserve conflict'))
checks.append(dict(claimId='READ129-30',check='paid share of granted money',calculatedPercent=round(452/758*100,4),sourceApproxPercent=60,disposition='Money, not completed projects'))
for cost,price,years,approx in [(5000,2,10,320),(5000,4,10,160),(1000,2,10,65),(1000,4,10,32)]:
 factor=sum(1/1.05**t for t in range(1,years+1));v=cost/(price*factor)
 assert abs(v-approx)<5
 checks.append(dict(claimId='READ129-33',netCostNOKperDecare=cost,netPriceNOKperKg=price,years=years,interest=.05,calculatedAnnualKgPerDecare=round(v,4),sourceApproxKgPerDecare=approx,disposition='Conditional level annual cash flow; no measured yield effect'))
out=dict(schema='offline-korn-drenering-check/v1',assessmentSha256=d['assessmentSha256'],scriptSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),checks=checks,human_verified=False,readinessChanged=False,result='passed_with_preserved_source_conflicts')
s=json.dumps(out,ensure_ascii=False,sort_keys=True,indent=2)+'\n';path=R/'korn-drenering-verification.json'
if a.write:path.write_text(s)
else:assert path.read_text()==s
print(f'Passed {len(checks)} bounded checks; source conflicts retained.')
