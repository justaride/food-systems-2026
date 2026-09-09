"""Run: BEREDSKAP_VERIFIER=/path/to/script.py python3 -m unittest discover -s <this-dir> -v.
Defaults to the adjacent verifier; no external network or DB.
"""
import copy,importlib.util,json,os,pathlib,tempfile,unittest
SCRIPT=pathlib.Path(os.environ.get('BEREDSKAP_VERIFIER',str(pathlib.Path(__file__).with_name('verify-beredskap-review.py'))))
spec=importlib.util.spec_from_file_location('verifier',SCRIPT);v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
class ReceiptIntegrityTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.p=pathlib.Path(self.tmp.name)
  raw=self.p/'raw';text=self.p/'text';raw.write_bytes(b'Original');text.write_text('One fact.')
  self.o={'observationId':'O1','claim':'One fact.','unit':'tonnes','value':1,'sourceRefs':[{'sourceId':'S1','locator':'p1'}]}
  s={'sourceId':'S1','status':'bound','rawPath':str(raw),'rawSha256':v.sha(raw.read_bytes()),'textPath':str(text),'textSha256':v.sha(text.read_bytes())}
  ph=v.sha(v.canonical(v.POLICY))
  r={'observationId':'O1','claimSha256':v.sha(self.o['claim'].encode()),'observationSha256':v.sha(v.canonical(self.o)),'runId':'run-test','policySha256':ph,'targetProfile':v.POLICY['targetProfile'],'outcome':'supported_with_limits','rationale':'Supports a bounded fact.','reviewer':'review invocation','authority':'internal_analysis_only','modelVersionAttested':False,'evidence':[{'sourceId':'S1','rawSha256':s['rawSha256'],'textSha256':s['textSha256'],'locator':'p1','readScope':'p1'}]}
  self.d={'runId':'run-test','policy':copy.deepcopy(v.POLICY),'policySha256':ph,'observations':[self.o],'sources':[s],'reviews':[r]};self.baseline()
 def baseline(self):
  p=self.p/'baseline.json';p.write_bytes(v.canonical(self.d['observations']));self.d.update(baselinePath=str(p),baselineSha256=v.sha(p.read_bytes()))
 def reject(self,fragment=None):
  result=v.verify(self.d);self.assertFalse(result['ok'],result)
  if fragment:self.assertTrue(any(fragment in x for x in result['errors']),result)
 def test_valid_receipt(self):
  r=v.verify(self.d);self.assertTrue(r['ok']);self.assertFalse(r['semanticTruthVerifiedByThisScript']);self.assertEqual(r['productionQualification'],'not_granted')
 def test_stale_claim(self):self.o['claim']='Changed';self.baseline();self.reject('stale_claim')
 def test_stale_full_observation(self):self.o['unit']='kg';self.baseline();self.reject('stale_observation')
 def test_baseline_bytes_changed(self):pathlib.Path(self.d['baselinePath']).write_text('[]');self.reject('baseline_missing_or_changed')
 def test_baseline_content_different(self):self.o['value']=2;self.d['reviews'][0]['observationSha256']=v.sha(v.canonical(self.o));self.reject('baseline_missing_or_changed')
 def test_policy_numeric_boolean_substitution(self):self.d["policy"]["semanticTruthCheck"]=0;self.reject("invalid_policy")
 def supplement(self):
  src=self.d['sources'][0]
  item={k:src[k] for k in ['rawPath','rawSha256','textPath','textSha256']}
  item.update(artifactId='S1-linked',parentSourceId='S1',locator='p1',readScope='page1',reason='Linked original attachment')
  self.d['reviews'][0]['supplementalEvidence']=[item];return item
 def test_valid_supplement(self):self.supplement();self.assertTrue(v.verify(self.d)['ok'])
 def test_stale_supplement(self):self.supplement()['rawSha256']='0'*64;self.reject('supplement_unavailable_or_changed')
 def test_unrelated_supplement(self):self.supplement()['parentSourceId']='other';self.reject('unrelated_supplement')
 def test_supplement_scope(self):self.supplement()['readScope']=' ';self.reject('missing_supplement_scope')
 def test_duplicate_supplement(self):self.supplement();self.d['reviews'][0]['supplementalEvidence']*=2;self.reject('invalid_supplement_ids')
 def test_policy_changed(self):self.d['policy']['targetProfile']='external';self.reject('invalid_policy')
 def test_policy_hash_changed(self):self.d['policySha256']='0'*64;self.reject('invalid_policy')
 def test_review_policy_changed(self):self.d['reviews'][0]['policySha256']='0'*64;self.reject('stale_run_policy_or_target')
 def test_run_changed(self):self.d['runId']='other';self.reject('stale_run_policy_or_target')
 def test_target_changed(self):self.d['reviews'][0]['targetProfile']='external';self.reject('stale_run_policy_or_target')
 def test_blank_required_fields(self):
  for key in ('reviewer','rationale'):
   with self.subTest(key=key):
    old=self.d['reviews'][0][key];self.d['reviews'][0][key]=' ';self.reject('missing_reason');self.d['reviews'][0][key]=old
 def test_blank_locator(self):self.d['reviews'][0]['evidence'][0]['locator']=' ';self.reject('missing_locator')
 def test_blank_id(self):self.o['observationId']=' ';self.d['reviews'][0]['observationId']=' ';self.baseline();self.reject('missing_or_duplicate_id')
 def test_duplicate_evidence(self):self.d['reviews'][0]['evidence']*=2;self.reject('duplicate_or_conflicting_refs')
 def test_conflicting_evidence(self):self.d['reviews'][0]['unreviewedRefs']=[{'sourceId':'S1','reason':'Unread'}];self.reject('duplicate_or_conflicting_refs')
 def test_stale_raw_file(self):pathlib.Path(self.d['sources'][0]['rawPath']).write_text('Changed');self.reject('unavailable_or_changed')
 def test_stale_evidence_hash(self):self.d['reviews'][0]['evidence'][0]['textSha256']='0'*64;self.reject('stale_evidence_hash')
 def test_missing_review(self):self.d['reviews']=[];self.reject('review_coverage')
 def test_authority_escalation(self):self.d['reviews'][0]['authority']='human_verified';self.reject('authority_escalation')
 def test_attestation_escalation(self):self.d['reviews'][0]['modelVersionAttested']=True;self.reject('unsupported_model')
 def test_missing_claim_structured_failure(self):self.o.pop('claim');self.baseline();self.reject('invalid_original_claim')
 def test_numeric_claim_structured_failure(self):self.o['claim']=123;self.baseline();self.reject('invalid_original_claim')
 def test_supported_without_evidence(self):self.d['reviews'][0]['evidence']=[];self.reject('judgment_without_evidence')
 def test_valid_unavailable_gap(self):
  self.d['sources'][0].update(status='unavailable',reason='HTTP failure');self.d['reviews'][0].update(outcome='insufficient_evidence',evidence=[],unreviewedRefs=[{'sourceId':'S1','reason':'HTTP failure'}]);self.assertTrue(v.verify(self.d)['ok'])
 def test_blank_original_source_id_rejected(self):
  self.o['sourceRefs']=[{'sourceId':' '}];self.baseline();self.d['sources']=[];self.d['reviews'][0].update(observationSha256=v.sha(v.canonical(self.o)),outcome='insufficient_evidence',evidence=[],unreviewedRefs=[{'sourceId':' ','reason':'Unknown source'}]);self.reject()
 def test_baseline_boolean_numeric_substitution_rejected(self):
  self.o['value']=True;self.d['reviews'][0]['observationSha256']=v.sha(v.canonical(self.o));self.reject('baseline_missing_or_changed')
 def test_malformed_row_structured_rejection(self):
  self.d['reviews']=[None];self.reject()
 def test_missing_original_source_id_structured_rejection(self):
  self.o['sourceRefs']=[{'locator':'p1'}];self.baseline();self.reject()
if __name__=='__main__':unittest.main(verbosity=2)
