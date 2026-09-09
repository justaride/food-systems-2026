#!/usr/bin/env python3
"""Source-bound consistency checks; mismatches are findings, never source corrections."""
import argparse, hashlib, json
from pathlib import Path
HERE=Path(__file__).resolve().parent

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--write',action='store_true'); args=parser.parse_args()
    d=json.loads((HERE/'dossiers/031-001.json').read_text())
    checks=[]
    def add(claim, name, calculated, source, note):
        checks.append(dict(claimId=claim,check=name,recomputed=calculated,sourceValue=source,note=note))
    for name,rows,total in [('tonnTS',[6544,19537,1867],87310),('tonnN',[322,3871,109],11145),('tonnP',[61,556,46],1177)]:
        assert sum(rows)!=total
        add('READ031-04',name+' sum of visible Table5-1 rows',sum(rows),total,'Confirmed scope/sum mismatch; no corrected canonical total')
    assert 94783+34838+4302-1193==132730
    add('READ031-05','N mass balance',94783+34838+4302-1193,132730,'Figure2-3 closes with explicit unavailable N')
    net=(34838+4302-1193)/132730*100
    assert abs(net-32)>3
    add('READ031-05','net circular N percent',round(net,6),32,'Net definition uses available N; source32 percent not reproduced')
    add('READ031-06','mineral N reduction percent',round((97570-94783)/97570*100,6),3,'Conditional figure arithmetic, not observed effect')
    add('READ031-06','mineral P reduction percent',round((8490-7879)/8490*100,6),7,'Source P totals have further mismatches')
    add('READ031-08','Trøndelag mineral P reduction percent',round(544/1340*100,6),'over40','Region/scenario dependent')
    add('READ031-08','factor to replace baseline mineral P',round(1340/544,6),None,'Factor2.46 means growth146 percent; not total agricultural P')
    add('READ031-08','growth percent under same assumption',round((1340/544-1)*100,6),250,'Source wording/denominator unclear; no adopted capacity threshold')
    add('READ031-07','regional manure share sum',sum([9,2,67,12,8,1,1,1]),100,'One point may be rounding; preserve without normalization')
    assert abs((21.55-11.48)-10.07)<1e-9
    add('READ031-11','cattle digestate excluding reactor CH4',round(21.55-11.48,2),10.07,'Boundary check only; not full LCA')
    add('READ031-11','pig digestate excluding reactor CH4',round(30.27-18.05,2),12.23,'0.01 residual may reflect underlying rounding')
    out=dict(schema='offline-biorest-consistency-check/v1',result='passed_with_preserved_source_conflicts',assessmentSha256=d['assessmentSha256'],scriptSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),checks=checks,human_verified=False,readinessChanged=False)
    content=json.dumps(out,ensure_ascii=False,sort_keys=True,indent=2)+'\n'; target=HERE/'biorest-verification.json'
    if args.write: target.write_text(content)
    else: assert target.read_text()==content
    print(f'Passed {len(checks)} bounded checks; source conflicts retained.')

if __name__=='__main__':main()
