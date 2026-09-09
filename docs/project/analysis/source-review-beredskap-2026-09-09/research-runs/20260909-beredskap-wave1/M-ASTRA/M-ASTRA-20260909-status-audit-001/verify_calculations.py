from pathlib import Path
exec((Path(__file__).parent/'verify_inputs.py').read_text().split('checks=[]')[0])
import csv,io,zipfile,datetime,math
A=json.loads((PRIV/'audit-input.json').read_text());S={s['sourceId']:s for s in A['sources']};r=[]
def add(id,inputs,outputs,limit):r.append(dict(id=id,inputs=inputs,outputs=outputs,limitation=limit))
def jp(o,p):
 for k in p.strip('/').split('/'):o=o[int(k)] if isinstance(o,list) else o[k]
 return o
bindings={s['sourceId']:s for s in json.loads((BASE/'round-004/source-bindings.json').read_text())}
cal=json.loads((BASE/'round-005/calculations.json').read_text())
for d in cal['yieldDiagnostics']:
 s=bindings[d['sourceId']];p=resolve(s['rawPath']);assert sha(p)==s['rawSha256'];j=json.loads(p.read_text());v={k:jp(j,l['jsonPointer']) for k,l in d['locators'].items()}; y=v['production_kt']/v['area_kha'];res=(v['reported_yield_t_ha']-y)*1000
 assert math.isclose(y,d['derived_yield_t_ha']) and math.isclose(res,d['residual_kg_ha'])
 add('yield-'+d['country']+'-'+d['crop_code']+'-'+str(d['year']),dict(sourcePath=str(p),sourceSha256=sha(p),locators=d['locators'],values=v),dict(derivedYield_t_ha=y,residual_kg_ha=res,warningRetained=True),'P/A identity check; no undocumented definition or revision correction.')
for n,d in enumerate(cal['designArithmetic']):
 x=d['illustrative_flour_target_t']/d['assumed_extraction_fraction'];assert math.isclose(x,d['grain_required_t'])
 add('design-mass-'+str(n+1),d,{'grainRequired_t':x},'Illustrative targets and assumed extraction; not demand, stock or observed delivery.')
fi=json.loads(resolve(S['DKFI-S004']['rawPath']).read_text());eu=json.loads(resolve(S['R4-EU-S001']['rawPath']).read_text())
# National cell coordinates decoded from JSON-stat rather than trusting prior calculation.
def cell(j,coords):
 index=0
 for dim,size in zip(j['id'],j['size']):
  m=j['dimension'][dim]['category']['index'];i=m[coords[dim]] if isinstance(m,dict) else m.index(coords[dim]);index=index*size+i
 v=j['value'];return index,v[index] if isinstance(v,list) else v[str(index)]
# print('FI dimension', {k:fi['dimension'][k]['category']['index'] for k in fi['id']});print('EU dimension',{k:eu['dimension'][k]['category']['index'] for k in eu['id']})
fiCells={crop:cell(fi,{'A':'2018','MK':'SSS','INFO':'SATOKGM','TUOTT':'TUOTT_YHT','LJ':code}) for crop,code in [('wheat','VEHN'),('barley','OHRA')]}
euCells={crop:cell(eu,{'freq':'A','crops':code,'strucpro':'HPRD_HUMD_EU_THS_T','geo':'FI','time':'2018'}) for crop,code in [('wheat','C1100'),('barley','C1300')]}
assert fiCells['wheat'][1]==494.7 and fiCells['barley'][1]==1336.1 and euCells['wheat'][1]==501.6 and euCells['barley'][1]==1353.19
add('FI2018-original-cells',{'nationalSourceId':'DKFI-S004','eurostatSourceId':'R4-EU-S001'},{'national':fiCells,'eurostat':euCells},'Exact dimension coordinates and flattened indices rerun.')
add('FI2018-common-factor',{'nationalWheat_kt':494.7,'euWheat_kt':501.6,'nationalBarley_kt':1336.1,'euBarley_kt':1353.19,'roundingEnvelope_kt':0.05},{'wheatResidual_kt':501.6-494.7,'barleyResidual_kt':1353.19-1336.1,'wheatRatio':501.6/494.7,'barleyRatio':1353.19/1336.1,'wheatInterval':[(501.6-.05)/(494.7+.05),(501.6+.05)/(494.7-.05)],'barleyInterval':[(1353.19-.05)/(1336.1+.05),(1353.19+.05)/(1336.1-.05)],'overlap':False},'Only disproves a single common multiplicative bridge under this rounding envelope; not the true moisture/revision explanation.')
add('SE2015-wheat-total-PA',{'production_t':[2984800,315600],'area_ha':[394450,63100],'sourceId':'B08-S01','locator':'Table 1b Sweden 2015 winter/spring wheat'}, {'yield_t_ha':(2984800+315600)/(394450+63100),'weighting':'area-weighted component yields / total production divided by total area'},'Not production-weighted; published rounded components cannot explain official aggregate yield rounding.')
add('NO-contract-sum',{'contractTranches_t':[30000,30000,22500]}, {'sum_t':sum([30000,30000,22500])},'Contract total is not current stock and cannot be added to 30000 t stored at year-end 2025.')
add('NORSOK-control-increase',{'noStruvite_kgDM_daa':240,'struvite_kgDM_daa':410,'reportedIncreasePercent':130,'sourceId':'R3-NPK-S004','physicalPages':[20,27]}, {'relativeIncreasePercent':(410-240)/240*100,'disagreementPercentagePoints':130-(410-240)/240*100},'Diagnostic arithmetic does not resolve the original experimental discrepancy or estimate C3 effect.')
add('HIAS-2025-P',{'product_kg':29850,'reportedP_massFraction':.12,'plantInfluentP_kg':52026}, {'productP_kg':29850*.12,'shareInfluentP_percent':29850*.12/52026*100},'Annual product flow, not available inventory or uptake; no double count of sludge and recovered P.')
add('HIAS-declaration-basis',{'P_g_kgDM':134,'DM_percent':97.7}, {'P_asProduct_percent':134/1000*.977*100},'13.0918% derived under stated dry-matter basis differs from annual report 12%; different product/version/basis must remain separate.')
add('Hylte-weekday',{'date':'2025-04-16','reportedWeekday':'Tuesday'}, {'calendarWeekday':datetime.date(2025,4,16).strftime('%A')},'Does not select an alternative exercise date.')
ex=[373324124,83690686,9653850,89469788]
add('Holdbart-2024',{'sourceId':'B18-S06','physicalPages':[2,16,27],'expenseComponents_NOK':ex,'displayedExpenseSubtotal_NOK':556138449,'revenue_NOK':579112420,'netFinance_NOK':3336822}, {'expenseSum_NOK':sum(ex),'resultFromComponents_NOK':579112420-sum(ex),'resultFromSubtotal_NOK':579112420-556138449,'resultBeforeTaxViaComponents_NOK':579112420-sum(ex)+3336822},'Both source-present results retained; no precision choice or accounting write.')
s=S['B14-S002'];z=zipfile.ZipFile(resolve(s['rawPath']));name=next(n for n in z.namelist() if '(Normalized).csv' in n);rows=[x for x in csv.DictReader(io.TextIOWrapper(z.open(name),encoding='utf-8-sig')) if x['Area'] in ['Denmark','Finland','Iceland','Norway','Sweden'] and x['Item Code'] in ['210090','210091']]
(PRIV/'faostat-master-rows.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n');add('FAOSTAT-direct-zip',{'path':s['rawPath'],'sha256':sha(resolve(s['rawPath'])),'member':name,'countries':['Denmark','Finland','Iceland','Norway','Sweden'],'itemCodes':['210090','210091']},{'rowCounts':dict(collections.Counter(x['Item Code'] for x in rows)),'yearLabels':sorted(set(x['Year'] for x in rows)),'flags':sorted(set(x['Flag'] for x in rows)),'elements':sorted(set(x['Element'] for x in rows))},'Three-year estimates and their bounds not annual prevalence or sample N.')
s=S['B14-S005'];j=json.loads(resolve(s['rawPath']).read_text());old=json.loads((BASE/'round-003/documentation/statfin-cell-check.json').read_text());cells=[]
for c in old['cells']:
 v=j['value'][c['flatIndex']] if isinstance(j['value'],list) else j['value'][str(c['flatIndex'])];assert v==c['value']==c['previousValue'];cells.append({**c,'masterValue':v,'masterMatches':True})
add('StatFin-15-cells',{'path':s['rawPath'],'sha256':sha(resolve(s['rawPath'])),'dimensions':j['dimension'],'comparisonPath':str(BASE/'round-003/documentation/statfin-cell-check.json')},{'count':len(cells),'cells':cells},'SS/31/32 x 2021–2025 financial difficulty percentages; not food delivery or uncertainty estimates.')
ss=S['B19-S01'];rev=json.loads(resolve(ss['rawPath']).read_text());print('review keys',list(rev));print('FAO counts',r[-2]['outputs'])
print('reviewfirst',str(rev)[:600])
(PRIV/'master-calculations.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print('calculations',len(r))
