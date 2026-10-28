export const STARTER_IDS=['PHY02','COM02','ORD01','DIV03','GEO01','NET03','GEN02','FUN04','COM03','EFF01','COM08','TIM01'];
export const COLLECTIONS={
 starter:{title:'Your first twelve views',description:'A focused starting set, from community patterns to genomic and ecological context.',ids:STARTER_IDS},
 communities:{title:'Community & place',description:'Eight complementary views of diversity, composition, geography and environmental gradients.',ids:['GEO01','DIV03','ORD01','COM02','COM03','ORD06','EFF05','EFF01']},
 genomes:{title:'Genomic stories',description:'Eight ways to connect evolutionary relationships, genomic organization and functional potential.',ids:['PHY02','PHY03','GEN02','GEN04','GEN06','GEN07','VIR04','QC02']},
 connections:{title:'Connected systems',description:'Eight views of ecological associations, metabolic processes, space and time.',ids:['NET01','VIR01','FUN04','FUN06','MUL01','TIM01','IMG02','COM08']}
};
export const CATEGORY_LABELS={GEO:'Study design & geography',DIV:'Diversity & distributions',COM:'Composition & membership',ORD:'Ordination & gradients',EFF:'Effects & associations',TIM:'Time & disturbance',PHY:'Phylogeny & evolution',GEN:'Comparative genomics',VIR:'Viromes & hosts',NET:'Ecological networks',FUN:'Function & biogeochemistry',MUL:'Multi-omics',IMG:'Spatial ecology & imaging',ML:'Prediction & models',ECO:'Ecological assembly',QC:'Quality & robustness'};
export const EVIDENCE={direct:'Verified example',adaptation:'Adapted from research',proposal:'Project possibility'};
export const STORAGE_KEY='microbial-atlas-shortlist-v1';
export const prefixOf=id=>id.replace(/\d+$/,'');
const normalize=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[–—−-]/g,' ');
const synonyms={VIR:'virus viral virome viruses phage hosts',PHY:'phylogenetic phylogeny tree trees',TIM:'temporal time series succession longitudinal',GEO:'geography geographic spatial location map',DIV:'alpha diversity distribution distributions',COM:'community composition abundance membership',GEN:'gene genome genomic genomes metagenome',NET:'association interaction network networks',FUN:'functional function metabolism metabolic biogeochemical pathway pathways',MUL:'multiomics multi omics',IMG:'microscopy image imaging spatial cell cells',ML:'machine learning model prediction classifier',ECO:'ecology ecological assembly',QC:'quality control uncertainty robustness',ORD:'ordination beta diversity pcoa nmds',EFF:'effects differential abundance statistics'};
export function filterEntries(entries,state={},saved=new Set()){
 const words=normalize(state.q||'').trim().split(/\s+/).filter(Boolean);
 const collection=Object.hasOwn(COLLECTIONS,state.collection)?COLLECTIONS[state.collection]:undefined;
 let filtered=entries.filter(e=>{
  const prefix=prefixOf(e.id);
  if(state.family&&prefix!==state.family)return false;
  if(state.quick==='starter'&&!STARTER_IDS.includes(e.id))return false;
  if(state.quick==='direct'&&e.evidence_status!=='direct')return false;
  if(state.quick==='saved'&&!saved.has(e.id))return false;
  if(collection&&!collection.ids.includes(e.id))return false;
  const haystack=normalize([e.id,e.name,e.family,e.question,e.minimum_data,e.design_tip,e.interpretation_limit,synonyms[prefix]||''].join(' '));
  return words.every(w=>haystack.includes(w));
 });
 const curated=collection?.ids||STARTER_IDS;
 return filtered.slice().sort((a,b)=>{
  if(state.sort==='az')return a.name.localeCompare(b.name);
  if(state.sort==='id')return a.id.localeCompare(b.id);
  const ai=curated.indexOf(a.id),bi=curated.indexOf(b.id);
  return (ai<0?1000:ai)-(bi<0?1000:bi)||entries.indexOf(a)-entries.indexOf(b);
 });
}
export function loadSaved(storage,validIds){
 try{const ids=JSON.parse(storage?.getItem(STORAGE_KEY)||'[]');return new Set(Array.isArray(ids)?ids.filter(id=>typeof id==='string'&&validIds.has(id)):[]);}catch{return new Set();}
}
export function persistSaved(storage,saved){try{if(!storage)return false;storage.setItem(STORAGE_KEY,JSON.stringify([...saved]));return true;}catch{return false;}}
export function recipeMarkdown(entry,references){
 const refs=new Map(references.map(r=>[r.id,r]));
 const sources=entry.references.map(x=>{const r=refs.get(x.id);return r?`- [${r.authors} (${r.year}), ${r.journal}](${r.url}) — ${x.locator}`:'';}).filter(Boolean);
 return `# ${entry.name}\n\nCatalogue ID: ${entry.id}\nFamily: ${entry.family}\nEvidence: ${EVIDENCE[entry.evidence_status]}\n\n## Scientific question\n\n${entry.question}\n\n## Minimum data\n\n${entry.minimum_data}.\n\n## Design guidance\n\n${entry.design_tip}.\n\n## Interpretation limit\n\n${entry.interpretation_limit}.\n\n## References\n\n${sources.length?sources.join('\n'):'Additional project proposal; no inspected journal example is claimed.'}\n\n---\n\nFrom the [Microbial Visualization Atlas](https://skate-debug.github.io/microbial-visualization-atlas/?recipe=${entry.id}). Website previews are synthetic illustrations, not study data.\n`;
}
export function shortlistMarkdown(entries,references){return '# My microbial visualization shortlist\n\n'+entries.map(e=>recipeMarkdown(e,references).replace(/^# /,'## ')).join('\n\n');}
