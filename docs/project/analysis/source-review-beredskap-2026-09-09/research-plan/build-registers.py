#!/usr/bin/env python3
"""Rebuild the frozen planning registers. Default: check; --write regenerates.
Run against the unchanged research baseline. This is not an execution-status updater.
"""
from pathlib import Path
import json,hashlib,argparse,subprocess
parser=argparse.ArgumentParser()
parser.add_argument('--write',action='store_true')
args=parser.parse_args()
R=Path(subprocess.check_output(['git','rev-parse','--show-toplevel'],text=True).strip());B=Path('docs/project/analysis/source-review-beredskap-2026-09-09');D=R/B/'research-plan'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dh(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def put(n,x):
 if args.write:(D/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
 elif not (D/n).exists() or json.loads((D/n).read_text())!=x:raise SystemExit('Stale register: '+n)

P=[]
def wp(i,title,scope,questions,channels,stop,inputs,case,purposes,wave=1,deps=None,collab=None):
 P.append({'id':f'B{i:02d}','title':title,'scope':scope,'questions':questions,'sourceChannels':channels,'stopRule':stop,'inputs':[str(B/x) if x.startswith('round-') else x for x in inputs],'candidateIds':case,'purposeIds':purposes,'wave':wave,'dependsOn':deps or [],'coordinationWith':collab or [],'status':'not_started','workerModel':'user_configured_default; no forced override','sizeRule':'Én avgrenset sesjon leverer evidens eller et presist stopp. Ved kontekstgrense leveres handover; videre arbeid får ny uforanderlig run-ID. Ingen ubegrenset søkeperiode er autorisert.'})
wp(1,'Regal bulk 160105: gjeldende kvalitetskrav','Kun norsk bulk-SKU 160105; sekkvaren er kontrollreferanse.',
['Finnes en ny, datert gjeldende spesifikasjon med revisjon og gyldighetsperiode?','Hva er min/maks og metode for protein/fuktbasis, falltall, glutenfunksjon, aske og granulometri?','Hva gjelder allergener, krysskontakt, mattrygghet og bulkholdbarhet?'],
['R6-S01/R6-S09 og lenkene de faktisk viser','Ny spesifikasjonsversjon fra Cerealia; ved behov usendt dataeierinntak R6-G02'],
'Runde 006 har allerede lest live side og katalog. Uten ny navngitt spesifikasjon: registrer dokumentbehov; ikke gjenta katalogsøk eller bruk næringsprotein som grense.',
['round-006/README.md','round-006/q1-comparison.json','round-006/source-bindings.json','round-006/intake-template.json'],['C1'],['P2','P3'],collab=['B03','B04'])
wp(2,'Manitoba bulk 160585: gjeldende kvalitetskrav','Kun svensk bulk-SKU 160585, skilt fra 142052 og andre Nord Mills-produkter.',
['Finnes datert revisjon og full spesifikasjon for 160585?','Er målemetoder og fuktbasis sammenlignbare med Q1 og Regal?','Gjelder katalogens 12 måneders holdbarhet faktisk bulk, og under hvilke lagringsvilkår?'],
['R6-S02/R6-S10 og dokumenterte produktlenker','Cerealia Sverige spesifikasjon/COA; ubesvart inntak R6-G03'],
'Ingen funksjonell likeverdighet fra produktnavn, ingredienser eller næringsdeklarasjon. Manglende bulkspesifikasjon blir et dataeierstopp.',
['round-006/q1-comparison.json','round-006/source-bindings.json','round-006/intake-template.json'],['C1'],['P2','P3'],collab=['B03','B05'])
wp(3,'Furuset: dagens produksjon, behov og bulkmottak','Én mottaker på Søren Bulls vei 27 etter Mat i Farta-ombyggingen.',
['Hva produseres fortsatt på stedet, og bruker dette faktisk Q1-mel?','Hvor er siloer og innblåsingspunkt etter den beskrevne flyttingen, og hva viser som-bygget-dokumentasjon?','Hvilke resept-/batchbehov, akseptregler, lager, karantener og tidsfrister kan dokumenteres?'],
['PBE-sakene R6-S12–17; bare konkret nytt vedlegg som treffer dagens mottak','Furuset produksjon/teknisk/kvalitet gjennom usendt R6-inntak'],
'Historisk silo, søknad, søkers ferdigmelding og ferdigattest har forskjellige roller. Ingen flytting av caset til Økern, sekk eller ferdig bakst. Manglende driftsdata blir ukjent.',
['round-006/NESTE-SESJON.md','round-006/observations.json','round-006/intake-template.json','round-005/case.json','round-005/MAALEPROTOKOLL.md'],['C1'],['P1','P2','P3'],collab=['B01','B02','B06'])
wp(4,'Norsk kornkjede: fysisk lager, uttaksrett og foredling','Norsk reserve-/møllekjede; Bjølsen-caset og eksplisitt avgrensning mot nasjonale aggregater.',
['Hva er datert fysisk beholdning, matklasse, lokasjon, eier, uttaksrett og bindende annen allokering?','Hva er faktisk råvareinntak, godkjent mel/time, oppstart, utmaling/tap, pakking og tilgjengelig kapasitet?','Hva kan knyttes til én mottaker og del-frist; hva mangler utover kontrakter/2029-mål?'],
['A1 frosne kilder; ny konkret Landbruksdirektoratet-/ekspertgruppeleveranse','Operatørens parti-, allokerings- og driftsdokumentasjon, usendt behovsark'],
'Ingen omregning av plan/kontraktsvolum til lager ved t0. Ingen normalproduksjon som disponibel krisekapasitet. Produksjonsmålinger er utenfor mandat.',
['research/agent-research-2026-09-08/resultater/A1/data.json','round-005/MAALEPROTOKOLL.md','round-005/data-gaps.json','round-006/status-delta.json'],['C1'],['P1','P2'],collab=['B01','B06','B09'])
wp(5,'Svensk forsyningsalternativ: Malmö og disponibel allokering','Malmö til samme Furuset-case; ikke Sveriges totale årsoverskudd.',
['Hvilke kvalitetsbundne korn-/melpartier, eierskap, lager og frigivelsesvilkår finnes?','Hva binder kapasitet til svenske kunder eller andre land ved samme sjokk?','Hva er faktisk foredling/lasting og earliest dokumentert parti-tidslinje?'],
['R5-S03/R5-S16 og frosne produktkilder; ny offentlig operatør-/forvalterdokumentasjon','Datert lager-, COA- og allokeringsbok fra dataeier ved senere separat autorisasjon'],
'Ingen slutning fra konserntilhørighet til tilgang eller fra nasjonal avling til allokering. Ubekreftet rett og mengde står ukjent.',
['round-005/case.json','round-005/MAALEPROTOKOLL.md','round-006/source-bindings.json'],['C1','C5'],['P2','P3'],collab=['B02','B06','B17'])
wp(6,'Felles avhengigheter: energi, vann, transport og lossing','Samme 72-timersscenario for NO/SE og Furuset; én delt ressursliste.',
['Hvilke kritiske effekt-, vann-, drivstoff-, telekom- og bemanningsbehov har hver node?','Hvilke tank-/koblings-, luft-, hygiene-, tilkomst- og grensekrav gjelder den konkrete ruten?','Hvilke laste-/kjøre-/grense-/lossetider og delte ressurser er demonstrert, og hvilke er bare normale vilkår?'],
['R5-protokoll/R6-inntak; konkrete tekniske drifts-/mottaksdokumenter','Offisielle rute-/grenseopplysninger bare for deres faktiske gyldighetsområde'],
'Vegåpning og generelle tolltider er ikke kriseledetid. Ingen målt reservefunksjon fra anleggsnavn. B03 eier mottakets faktiske konfigurasjon; B06 grensesnitt og felles avhengigheter.',
['round-005/MAALEPROTOKOLL.md','round-006/intake-template.json','round-003/climate/findings.json'],['C1','C5'],['P1','P2','P3'],collab=['B03','B04','B05','B17'])
wp(7,'Finland: eksakt korn-, fukt- og revisjonsbro','2018-restene for hvete/bygg og tilhørende finske metode-/avlingsvarsler.',
['Finnes datert 2018-overføring/revisjonslogg mellom Luke og Eurostat?','Hva er standardfukt per vare og kvantitativ bro mellom tørt/ferskt korn og C1100/C1300/G9100?','Hva forklarer de finske avlingsvarslene 2016/2020 uten å overskrive rapporterte celler?'],
['Eksakt stopp i round-005/DEFINISJONER.md; ny navngitt Luke/Eurostat-overføringsfil eller metodevedlegg'],
'Betinget oppdrag: uten konkret ny bro/versjon leveres waiting_source med eksakt dokumentkrav. Ingen brede søk; én felles fuktfaktor alene er allerede utilstrekkelig i den utførte kontrollen.',
['round-005/DEFINISJONER.md','round-005/calculations.json','round-004/dk-fi/findings.json'],['C1','C5'],['P1','P3'])
wp(8,'Norge, Sverige og Danmark: avlingsvarsler og definisjoner','De resterende seks avlingsvarslene, manglende DK-hvete 2015 og historiske vare-/arealgrenser.',
['Hva er Norges daterte oversendelsesversjon og beregningsregel for de fire NO-varslene?','Hva er Sveriges uavrundede komponentarealer/vekter for 2015?','Hva forklarer Danmarks 2015-byggareal og manglende rapportert hveteavling; er dyrket/høstet areal og varegrenser avstemt?'],
['SSB04610/04607/04609, SCB SkordarL2, HST77 og Eurostat; kun nye konkrete versjons-/metodevedlegg'],
'Behold rapportert avling og P/A som forskjellige størrelser. Ingen utfylling av ukjent rapportert avling med beregnet verdi. Ingen gjenkjøring av avsluttede søk uten nytt dokument.',
['round-005/DEFINISJONER.md','round-004/norway/findings.json','round-004/dk-fi/findings.json','round-004/analysis.json'],['C1'],['P1','P2'])
wp(9,'Klimasamtidighet, mathvetekvalitet og importavhengighet','Fra frosset nasjonalt 2015–2020-panel til eksplisitt kompatibel region×år×vare-tabell, bare hvor underlaget tillater det.',
['Hvilke regionale grenser og kvalitets-/fukt-/arealdefinisjoner er faktisk sammenlignbare?','Finnes teller/nevner bak norskandelene og en skilt serie for matklasse, behov og eksportabel mengde?','Kreves eksakt replikasjon av Beillouin/Tootoonchi, og finnes kode/snapshot/figurgruppe før slik påstand?'],
['Runde 003 climate og runde 004 method/norway/dk-fi; eksisterende beregninger først','Ny spesifikk primærtabell/arkivert kode eller kompatibelt Figur S1-bilde hvis nødvendig'],
'Et harmonisert delpanel er ikke replikasjon eller nordisk totaldekning. Ikke anta uavhengige landrisikoer; ikke beregn eksportbar mat fra brutto avling. Åpne restceller kan sperre en sammenligning, ikke tvinge tall.',
['round-004/method/findings.json','round-004/norway/findings.json','round-005/DEFINISJONER.md','round-003/climate/findings.json'],['C1','C5'],['P1','P2','P3'],2,['B07','B08'],['B04'])
wp(10,'Aass og sidestrøm til fôr: funksjonell substitusjon','Én sidestrøm, avgrenset mottakertype og faktisk rasjon; C2.',
['Hvilke våtmasse-/tetthets-/tørrstoff-/nærings-/hygienedata og sesongvariasjon er Aass-spesifikke?','Hva erstattes faktisk i rasjonen og hva skjer ved bortfall, med lagring, tap og transport?','Kan rapportert årsvolum og nettsidens avrundede tall avstemmes uten å blande perioder?'],
['A2 data og runde 003 feed-access; allerede åpne fulltekster','Lovlig levert fulltekst eller konkret nytt erratum; ubesvart batch-/rasjonsinntak til dataeier'],
'Fullteksttilgangssøk er avsluttet; ikke gjenta DOI/OA-redirectløkken. Generelle bryggeristudier og liter alene gir ingen Aass-spesifikk soja-/protein-/beredskapseffekt. Ingen prøvetaking eller fôringsforsøk.',
['research/agent-research-2026-09-08/resultater/A2/data.json','round-003/feed-access/findings.json','round-003/candidate-tests.json'],['C2'],['P1','P2','P3','P4'])
wp(11,'Gjenvunnet fosfor: kvalitet, anvendelse og tilleggseffekt','C3; én produktstrøm, mottakerjord/vekst og sesong; N/P/K holdes skilt.',
['Hvordan avklares den dokumenterte dose-/prosentkonflikten med erratum eller rådata?','Hva er disponibelt parti, produktkvalitet, anvendt plantetilgjengelig P og faktisk erstattet mineralvare?','Hvordan avstemmes slam, struvitt, tap, kjemikalier, energi og nasjonal/nordisk baseline uten dobbelttelling?'],
['round-003/nutrients/findings.json med eksakte kilder/forsøk','Konkret erratum, batchsertifikat, gjødslingsjournal og før/etter massebalanse; gjeldende offisiell regelkilde når rettslig bruk vurderes'],
'Ingen nasjonal NPK-total eller likestilling av produkt-P og planteopptak. Ingen effekt uten samme jord/vekst/sesong. Lever usendt dataeier-/måleskjema når partier/journal mangler.',
['round-003/nutrients/findings.json','round-003/nutrients/verification.json','round-003/gap-intake.json'],['C3'],['P1','P2','P3','P4'])
wp(12,'Institusjonsmåltider: kontinuitet, ernæring og spiselig svinn','C4; navngitt kjøkken, gjentatte måltider og samme avbrudd.',
['Kan Hyltes datomotsigelse og faktisk tids-/måltidslogg avklares i primærprotokoll?','Hva er spist egnet mat, spesialkost, spiselig svinn, arbeid, kostnad, vann og brensel over flere måltider?','Hva er et konkret nordisk metodetillegg utover kjøkkenets nasjonale baseline?'],
['round-003/meals/findings.json og MEAL-T001; eksisterende veiledning brukes til målefelter','Ny konkret kommunal øvelses-/måltidsprotokoll eller eksisterende kjøkkenlogg'],
'Én økt er ikke flerdøgnskapasitet. Mindre avfall kan skyldes mindre servering. Ingen ny bred øvelsesnyhetsrunde eller gjennomføring av fysisk test.',
['round-003/meals/findings.json','round-003/gap-intake.json','round-003/candidate-tests.json'],['C4'],['P1','P2','P3','P4'])
wp(13,'Norsk økonomisk mattilgang: SIFO og matutdeling','SIFO item-/bølgeforløp, undergrupper og Fafo-mottakerutvalg; behold instrumentene separat.',
['Finnes komplette items, delutvalgs-N, vekter/frafall og usikkerhet for de konkrete figurene?','Hva er populasjon, svarandel og seleksjon i matutdelingsdata?','Hvilke nasjonale slutninger er tillatt, og hvilke krever mikrodata eller brostudie?'],
['A3 frosne rapporter og runde 003 dokumentasjonsrettelser','Publisert teknisk vedlegg/tabell; usendt metodeforespørsel hvis ikke offentlig'],
'Ingen nasjonal prevalens fra utdelingsutvalg; ingen SIFO/FIES-konvertering. Ingen mikrodatatilgang eller videreformidling uten grunnlag.',
['research/agent-research-2026-09-08/resultater/A3/data.json','round-003/documentation/findings.json','round-002/review-register.json'],[],['P1','P2'],collab=['B14','B18'])
wp(14,'Nordisk mattilgang: FIES, FAOSTAT, Sverige og Finland','Egne indikatorprofiler med land, instrument, periode, analyseenhet og nevner.',
['Hva finnes av offisielle enkeltår/treårsgjennomsnitt, usikkerhet, faktisk N og utvalgsmetode?','Finnes finske ISSP-replikasjonsdata/nyere flerleddet måling og svenske objektive kjøpsdata?','Hva kan sammenlignes med SIFO, og hvor må en valideringsbro forbli ukjent?'],
['A3 allerede innhentet FAOSTAT-pakke og instrumentmetadata; StatFin15-kontroll først','Ny konkret FAO/FIES-, finsk eller svensk originaltabell og metodevedlegg'],
'Ikke utled enkeltår fra treårsgjennomsnitt eller en nordisk rangering fra ulike instrumenter. Behold småceller, usikkerhet, rettigheter og manglende bro.',
['research/agent-research-2026-09-08/resultater/A3/data.json','round-003/documentation/statfin-cell-check.json','round-003/documentation/provenance-addendum.json'],[],['P1','P2','P3'],collab=['B13'])
wp(15,'Island: vedtak, lagerordning og implementering','A4 institusjonell og datert status; ikke katalog over generelle strategier.',
['Finnes konkret etterfølgende vedtak/gjennomføring etter Alþingi-sak 57?','Hvilke varevise lagre er fysisk dokumentert med dato/eier/rullering, og hva er bare scenario?','Hva er gjeldende uttaks-/finansieringsgrunnlag for reserveordningen?'],
['A4 originaler og korrigert Island-kontroll','Ny datert Alþingi-/departements-/forvalterleveranse som treffer implementering'],
'Scenario, forslag, finansiering, kontrakt og fysisk lager er ulike trinn. Ingen beholdning eller drift fra politisk plan.',
['research/agent-research-2026-09-08/resultater/A4/data.json','research/agent-research-2026-09-08/review-2026-09-08/island-check.md'],['C5'],['P1','P2','P3'],collab=['B16','B17'])
wp(16,'Island: foredlingsaktører og leverbar matkjede','Aktøridentitet/tillatelse/aktuell drift og én kjede fra korn til mat ved importavbrudd.',
['Hva dokumenterer faktisk 2026-status for Þorvaldseyri/Eyrarbúið og eventuelt Korngrís?','Hvilke matgodkjenninger og kapasitetsdefinisjoner gjelder mølle, tørking, valsing, pakking og lager?','Kan 2021-tallet omkring 1 % knyttes til kompatibel teller/nevner, og hva mangler i leveransekjeden?'],
['A4 originaler; konkrete MAST-/kommunale virksomhetsposter og daterte operatørdokumenter'],
'Virksomhetsliste er ikke disponibel kapasitet. Aktør-/produktidentitet, mat/fôr og faktisk drift må skilles. Ingen nasjonal kapasitet fra ett gårdsanlegg.',
['research/agent-research-2026-09-08/resultater/A4/data.json','round-002/review-register.json'],['C5'],['P1','P2','P3'],collab=['B15'])
wp(17,'Nordisk bistand: avtale, aktivering og prioritering','C5; matspesifikke rettigheter og gjennomføring av navngitte avtaler/deklarasjoner.',
['Finnes gjeldende matprotokoll, forlengelse/komitéspor for Norge–Finland og Åland-original med rett dokumentidentitet?','Hva er faktisk mandat, finansiering, eier og fremdrift for 2027-studien og videre avtale?','Hvordan prioriteres samtidige sivile/militære/allierte behov, og finnes dokumentkjede til faktisk matleveranse?'],
['A5, round-002/NORDISK-BEREDSKAP-RETTELSE.md og runde 003 dokumentasjonsrettelser','Nye konkrete originale avtaler, komitévedtak, bevilgning, aktiverings-/leveringsprotokoll; åpnede offisielle kilder for gjeldende rett'],
'Ikke gjeninnfør feil historisk dokumentidentitet. Ikke-bindende erklæring gir ingen matvolumrett. Faktisk kapasitet kommer fra B05/B06/B16; denne pakken eier rett/aktivering/prioritet.',
['research/agent-research-2026-09-08/resultater/A5/data.json','round-002/NORDISK-BEREDSKAP-RETTELSE.md','round-003/documentation/provenance-addendum.json'],['C5'],['P1','P2','P3'],collab=['B05','B06','B15'])
wp(18,'Marked, kjøperrelasjoner og kostnader som relevant bakgrunn','Kapitlene 4–5: bare strukturer som påvirker en navngitt kjede eller økonomisk mattilgang.',
['Hvilke dokumenterte kjøper-/eierrelasjoner, år, enheter og nevnere finnes for relevant kjede?','Hvilke kostnader/priser kan skilles fra fysisk kapasitet og fra kausale marginpåstander?','Hvilke dubletter/valuta-/konsernomfang og usikkerheter må beholdes før summering?'],
['Kapittelvurderinger 4–5; FS-02/04/09 kun som historiske researchbehov','Eksakte offisielle regnskap/registre/kontraktopplysninger; ingen gjetting av kjøperandel'],
'Ingen app- eller regnskapsendring. Ikke ta eksisterende intern feilstatus som fersk sannhet. Navngitte dataeier-/redaksjonelle valg holdes åpne; Holdbart-presisjonsvalg foretas ikke av agenten.',
['round-003/chapter-purpose-status.json','round-003/operational-restlist.json','research/whitepaper/food-systems-2026-synthesis-v2.md'],[],['P1','P2','P5'],collab=['B04','B13'])
wp(19,'Proveniens, kildeidentitet, rettigheter og forskningsdekning','Tverrgående read-only kildekontroll for planens materiale; ikke ny behandling av hele biblioteket.',
['Er hver videreført påstand bundet til riktig dokumentidentitet, versjon, lest del og rettighet?','Hvilke tidligere rettelser er allerede løst, og hvilke nye bindinger/synthetic-source-restanser krever egne kandidater?','Hvilken modellidentitet og leserekkevidde er verktøyattestert, rapportert eller ukjent?'],
['Runde 002 review-register og runde 003 provenance-addendum/REVIEW-QUEUE','Nye oppdragspakkers manifest/kilder; read-only kontroll av relevante originaler'],
'Historisk 1770/399 er ikke fersk bibliotekpopulasjon. Ingen massenedlasting, DB-import, kandidatwriter-kjøring eller behandling av attestasjon som human review. Rettede identiteter beholdes som spor.',
['round-003/documentation/provenance-addendum.json','round-003/REVIEW-QUEUE.md','round-003/operational-restlist.json','round-006/input-manifest.json'],[],['P4','P5'])
wp(20,'Sammenstilling av C1–C5 og betingede anbefalinger','Sammenstill levert evidens før Astra-review; ingen selvstendig ny kildejakt.',
['Har nasjonal, nordisk og kombinert arm samme mottaker, funksjon, kvalitet, sjokk og tidsfrist?','Hva er faktisk effekt, betinget regneeksempel eller fortsatt ukjent i hvert C-case?','Hvilke kapittelendringer og fem betingede anbefalinger følger av evidensen, med motargumenter og kostnader?'],
['Frosne returer B01–B19 med egne kilde-/beregningsbindinger','Kapittel-/formålskryssgangen i coverage.json'],
'Alle forgjengerpakker må ha levert artefakt, også ved dokumentert stopp. Manglende input gir ukjent effekt. Ingen flertallsavgjørelse mellom agenter, automatisk gaplukking eller omskriving av kanonisk manus.',
['round-003/candidate-tests.json','round-003/chapter-purpose-status.json','round-005/MAALEPROTOKOLL.md','round-006/target-profile.json'],['C1','C2','C3','C4','C5'],['P1','P2','P3','P4','P5'],3,[f'B{i:02d}' for i in range(1,20)])
# Every inherited gap record gets exactly one primary work-package owner; semantic overlap is retained.
gaps=[]
def addfile(path,key,adapter=lambda x:x):
 data=json.loads((R/path).read_text())
 for i,raw in enumerate(data[key]):
  g=adapter(raw);gid=g.get('gapId',g.get('id'));text=g.get('missingVariable',g.get('variable',g.get('missing',g.get('question',g.get('title','')))))
  gaps.append({'id':gid,'question':text,'sourcePath':str(path),'jsonPointer':f'/{key}/{i}','sourceSha256':sha(R/path),'recordSha256':dh(raw),'sourceStatus':g.get('status',g.get('state','inherited_open_gap')),'originalRecord':g,'semanticGapClosed':False})
for a in range(1,6):addfile(Path(f'research/agent-research-2026-09-08/resultater/A{a}/data.json'),'gaps')
addfile(B/'round-002/gap-intake.json','additionalPurposeGaps')
addfile(B/'round-003/gap-intake.json','gaps',lambda x:x['original'])
addfile(B/'round-004/status-delta.json','newScopedGaps')
addfile(B/'round-004/method/findings.json','gaps')
addfile(B/'round-004/norway/findings.json','definitionGaps')
addfile(B/'round-004/dk-fi/findings.json','openGaps')
addfile(B/'round-005/data-gaps.json','gaps')
addfile(B/'round-006/data-gaps.json','gaps')
owner={}
def assign(w,*ids):
 for id in ids:
  assert id not in owner,id;owner[id]=w
assign('B04',*[f'A1-G{i:03d}' for i in [1,2,3,4,5,7,9,10]],'R5-G03','R5-G06')
assign('B03','A1-G006','R5-G01','R5-G02','R5-G05','R5-G09','R6-G01','R6-G04','R6-G05','R6-G07')
assign('B01','R6-G02');assign('B02','R6-G03');assign('B05','R5-G04','R6-G08')
assign('B06','CLIM-G02','R5-G07','R5-G08','R6-G06','R6-G09','A5-G004')
assign('B07','R4-G001','DKFI-G001','DKFI-G003')
assign('B08','R4-G002','R4-G003','METH-G03','R4-NO-G001','R4-NO-G004','DKFI-G002')
assign('B09','A1-G008','NEW-CLIMATE-01','CLIM-G01','R4-G005','METH-G01','METH-G02','METH-G04','R4-NO-G002','R4-NO-G003')
assign('B10',*[f'A2-G{i:03d}' for i in range(1,7)])
assign('B11','NEW-NPK-01',*[f'R3-NPK-G{i:03d}' for i in range(1,7)])
assign('B12','NEW-MEAL-01',*[f'MEAL-G{i:03d}' for i in range(1,5)])
assign('B13',*[f'A3-G{i:03d}' for i in [1,2,6,7]])
assign('B14',*[f'A3-G{i:03d}' for i in [3,4,5,8,9,10,11]])
assign('B15','A4-G001','A4-G002');assign('B16',*[f'A4-G{i:03d}' for i in range(3,8)])
assign('B17',*[f'A5-G{i:03d}' for i in [1,2,3,5,6,7]])
assign('B20','CLIM-G03','R4-G004','R5-G10')
assert len(gaps)==92 and len({g['id'] for g in gaps})==92
assert set(owner)=={g['id'] for g in gaps},set(g['id'] for g in gaps)-set(owner)
for g in gaps:g['primaryPackageId']=owner[g['id']]
for w in P:w['ownedGapIds']=[g['id'] for g in gaps if g['primaryPackageId']==w['id']]
chapters=json.loads((R/B/'round-003/chapter-purpose-status.json').read_text())['chapters']
cm={1:['B20'],2:['B20','B09'],3:['B19','B20'],4:['B18'],5:['B18','B13','B14'],6:['B09','B14','B15','B16','B17'],7:['B01','B02','B03','B04','B05','B06','B09','B15','B16','B17'],8:['B10','B11','B12'],9:['B10','B11'],10:['B20'],11:['B19','B20'],12:['B20'],13:['B19','B20'],14:['B19'],15:[]}
chaptermap=[{'chapter':c['chapter'],'title':c['title'],'ownerPackages':cm[c['chapter']],'disposition':'human_decision_only' if c['chapter']==15 else 'candidate_editorial_addendum','sourcePath':str(B/'round-003/chapter-purpose-status.json'),'jsonPointer':f'/chapters/{i}','previousAction':c['round003Action'],'canonicalChangeAuthorized':False} for i,c in enumerate(chapters)]
fs=json.loads((R/B/'round-003/operational-restlist.json').read_text())['items']
fmap={'FS-01':['B19'],'FS-02':['B18'],'FS-03':['B19'],'FS-04':['B18'],'FS-09':['B18'],'FS-10':['B20'],'FS-11':['B19'],'FS-15':['B20'],'FS-18':['B09','B10','B11','B12','B15','B16','B17'],'FS-19':['B19'],'FS-20':['B19'],'FS-21':['B19'],'FS-28':['B19']}
fsmap=[{'id':f['id'],'title':f['title'],'historicalState':f['state'],'stateReverified':False,'researchPackages':fmap.get(f['id'],[]),'disposition':'research_component_only; implementation_and_authority_separate' if f['id'] in fmap else 'outside_research_program; preserve_in_operational_or_owner_queue','sourcePath':str(B/'round-003/operational-restlist.json'),'jsonPointer':f'/items/{i}'} for i,f in enumerate(fs)]
put('work-packages.json',{'schema':'beredskap-dispatch-plan/v1','asOf':'2026-09-09','researchBaselineCommit':'4026a90d62edf129d4323f7f0971ace716b03983','scope':'All registered beredskap research gaps through round006, C1-C5, P1-P5 and 15 chapter dispositions; not whole-platform redevelopment','executionRequestedInThisPlan':False,'packages':P,'master':{'id':'M-ASTRA','model':'gpt-6-astra','modelRequiredByUser':True,'status':'not_started','dependsOn':[w['id'] for w in P],'prompt':'MASTER-ASTRA.md','authority':'internal_AI_validation_only; never human_review'}})
put('coverage.json',{'schema':'beredskap-plan-coverage/v1','gapCountMeaning':'92 unique record IDs across generations, including parents and refinements; NOT 92 independent unknowns and not a completion percentage','gaps':gaps,'chapters':chaptermap,'operationalBoundary':fsmap,'purposes':json.loads((R/B/'round-003/chapter-purpose-status.json').read_text())['purposes'],'purposeMeaning':'Question wording retained; historical status is prior evidence, not fresh verification.'})
inputs={str(B/'round-006/NESTE-SESJON.md'),str(B/'round-005/DEFINISJONER.md'),'AGENTS.md'}
for w in P:inputs.update(w['inputs'])
inputs.update(g['sourcePath'] for g in gaps)
# Freeze all history in the analysis package and original A1-A6 input package, not only referenced fields.
frozen={}
baseline='4026a90d62edf129d4323f7f0971ace716b03983'
tracked=subprocess.check_output(['git','ls-tree','-r','--name-only',baseline,'--',str(B),'research/agent-research-2026-09-08'],text=True).splitlines()
for path in tracked:
 p=R/path
 frozen[path]=sha(p)
put('input-manifest.json',{'schema':'beredskap-plan-inputs/v1','baselineCommit':'4026a90d62edf129d4323f7f0971ace716b03983','inputs':[{'path':p,'sha256':sha(R/p)} for p in sorted(inputs)],'historicalFiles':frozen,'priorPrivateBaselines':[json.loads((R/B/'round-006/input-manifest.json').read_text())['baselines'][i] for i in range(3)],'rights':'Planning and local internal artifacts only; source access not inherited from a title or citation.'})
print({'packages':len(P),'gapRecordIds':len(gaps),'chapters':len(chaptermap),'FSBoundaryRows':len(fsmap),'historicalFiles':len(frozen)})
