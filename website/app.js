import {previewSVG,setWorld,escapeText as esc} from './previews.js';
import {STARTER_IDS,COLLECTIONS,CATEGORY_LABELS,EVIDENCE,prefixOf,filterEntries,loadSaved,persistSaved,recipeMarkdown,shortlistMarkdown} from './catalogue-core.js';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const bookmark='<svg viewBox="0 0 16 19" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M3 2.5h10v14l-5-3-5 3z"/></svg>';
let entries=[],references=[],saved=new Set(),storage=null,visibleCount=12,currentRecipe=null,referenceFilter='all',allReferences=false,toastTimer,searchTimer;
let state={q:'',family:'',quick:'all',collection:'',sort:'curated'};
const defaultState=()=>({q:'',family:'',quick:'all',collection:'',sort:'curated'});
const dialog=$('#recipe-dialog');
try{storage=window.localStorage;}catch{/* Shortlisting still works in memory. */}

async function readJSON(url){const response=await fetch(url);if(!response.ok)throw new Error(`Could not load ${url} (${response.status})`);return response.json();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800);}
function safeURL(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?esc(u.href):'#';}catch{return '#';}}
function statusHTML(e){return `<span class="status-dot ${esc(e.evidence_status)}"></span>${esc(EVIDENCE[e.evidence_status])}`;}
function cardHTML(e,index){
 const isSaved=saved.has(e.id),family=CATEGORY_LABELS[prefixOf(e.id)]||e.family;
 return `<article class="gallery-card" data-recipe-id="${e.id}"><button type="button" class="save-recipe ${isSaved?'is-saved':''}" data-save="${e.id}" aria-label="${isSaved?'Remove':'Save'} ${esc(e.name)} ${isSaved?'from':'to'} shortlist" aria-pressed="${isSaved}">${bookmark}</button><button type="button" class="preview-open" data-open="${e.id}" aria-label="Explore ${esc(e.name)}"><div class="card-preview theme-${index%5}"><span class="preview-id">${e.id}</span>${previewSVG(e.id,{decorative:true})}<span class="preview-arrow" aria-hidden="true">↗</span></div></button><div class="card-copy"><div class="card-eyebrow">${statusHTML(e)}</div><h3><button type="button" class="card-title" data-open="${e.id}">${esc(e.name)}</button></h3><p class="card-question">${esc(e.question)}</p><div class="card-footer"><span>${esc(family)}</span><span>${e.priority==='starter'?'STARTER':'SPECIALIST'}</span></div></div></article>`;
}
function updateURL({push=false,recipe=currentRecipe}={}){
 const url=new URL(window.location.href);url.search='';
 for(const key of ['q','family','collection'])if(state[key])url.searchParams.set(key,state[key]);
 if(state.quick!=='all')url.searchParams.set('view',state.quick);
 if(state.sort!=='curated')url.searchParams.set('sort',state.sort);
 if(recipe)url.searchParams.set('recipe',recipe);
 if(state.q||state.family||state.quick!=='all'||state.collection||recipe)url.hash='atlas';
 window.history[push?'pushState':'replaceState']({},'',url);
}
function readLocation(){
 const p=new URLSearchParams(window.location.search),next=defaultState();
 next.q=(p.get('q')||'').slice(0,500);
 if(Object.hasOwn(CATEGORY_LABELS,p.get('family')))next.family=p.get('family');
 if(['all','starter','direct','saved'].includes(p.get('view')))next.quick=p.get('view');
 if(Object.hasOwn(COLLECTIONS,p.get('collection')))next.collection=p.get('collection');
 if(['curated','az','id'].includes(p.get('sort')))next.sort=p.get('sort');
 state=next;return p.get('recipe');
}
function renderCategories(){
 const available=filterEntries(entries,{...state,family:''},saved),counts=new Map();
 for(const e of available){const p=prefixOf(e.id);counts.set(p,(counts.get(p)||0)+1);}
 const button=(id,name,count)=>`<button class="category-button ${state.family===id?'is-active':''}" type="button" data-family="${id}" aria-pressed="${state.family===id}"><span>${esc(name)}</span><span>${count}</span></button>`;
 $('#category-list').innerHTML=button('','All research themes',available.length)+Object.entries(CATEGORY_LABELS).map(([id,name])=>button(id,name,counts.get(id)||0)).join('');
}
function renderGallery(){
 const filtered=filterEntries(entries,state,saved),shown=filtered.slice(0,visibleCount);
 $('#gallery').innerHTML=shown.map(cardHTML).join('');
 $('#results-label').textContent=filtered.length?`Showing ${shown.length} of ${filtered.length} recipes${state.family?' · '+CATEGORY_LABELS[state.family]:''}`:'0 recipes found';
 $('#load-more').hidden=shown.length>=filtered.length;
 $('#load-more').textContent=`Explore ${Math.min(12,filtered.length-shown.length)} more formats ↓`;
 $('#empty-state').hidden=!!filtered.length;
 $('#empty-message').textContent=state.quick==='saved'&&!saved.size?'Save recipes using the bookmark on any card. Your shortlist stays in this browser.':'Try a broader search, another research theme, or reset your filters.';
 const active=state.q||state.family||state.quick!=='all'||state.collection||state.sort!=='curated';
 $('#reset-filters').hidden=!active;
 $('#active-collection').hidden=!state.collection;
 if(state.collection)$('#active-collection').textContent=`${COLLECTIONS[state.collection].title} — ${COLLECTIONS[state.collection].description}`;
 $$('.filter-tabs button').forEach(b=>{const on=b.dataset.quick===state.quick;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
 $('#sort').value=state.sort;$('#search').value=state.q;
 updateSavedControls();renderCategories();
}
function updateSavedControls(){
 $('#saved-count').textContent=saved.size;$('#export-shortlist').disabled=!saved.size;
 $$('[data-save]').forEach(b=>{const id=b.dataset.save,e=entries.find(e=>e.id===id),on=saved.has(id);if(!e)return;b.classList.toggle('is-saved',on);b.setAttribute('aria-pressed',String(on));if(b.classList.contains('save-recipe'))b.setAttribute('aria-label',`${on?'Remove':'Save'} ${e.name} ${on?'from':'to'} shortlist`);else b.innerHTML=`${on?'Saved to shortlist':'Save to shortlist'} <span aria-hidden="true">${on?'✓':'+'}</span>`;});
}
function toggleSaved(id){
 if(!entries.some(e=>e.id===id))return;
 const wasSaved=saved.has(id);wasSaved?saved.delete(id):saved.add(id);
 const persisted=persistSaved(storage,saved);
 if(state.quick==='saved')renderGallery();else updateSavedControls();
 toast(wasSaved?'Removed from your shortlist.':persisted?'Saved to your shortlist.':'Saved for this tab. Browser storage is unavailable.');
}
function changeState(patch,{push=true,scroll=false}={}){
 clearTimeout(searchTimer);state={...state,...patch};visibleCount=12;updateURL({push,recipe:null});renderGallery();
 if(scroll)$('#atlas').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function resetFilters(){changeState(defaultState());}
function referenceLink(ref){const r=references.find(r=>r.id===ref.id);if(!r)return'';return `<li><a href="${safeURL(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.authors)} (${r.year}) · ${esc(r.journal)} ↗</a><small>${esc(ref.locator)}</small></li>`;}
function openRecipe(id,{history=true}={}){
 const e=entries.find(e=>e.id===id);if(!e){toast('That recipe could not be found.');return;}
 currentRecipe=id;
 $('#recipe-content').innerHTML=`<article class="recipe-detail"><div class="detail-visual"><div class="eyebrow">RECIPE ${e.id} / ${esc(CATEGORY_LABELS[prefixOf(id)])}</div>${previewSVG(id,{label:'Synthetic illustration of '+e.name})}<blockquote>${esc(e.question)}</blockquote><div class="detail-family">${esc(e.family)}</div><p class="preview-disclaimer">Original schematic preview using synthetic values. This illustrates a visual format; it is not an analysis of study data.</p></div><div class="detail-info"><div class="card-eyebrow">${statusHTML(e)}</div><h2 id="recipe-title">${esc(e.name)}</h2><h3>What you need</h3><p>${esc(e.minimum_data)}.</p><h3>Make it clear</h3><p>${esc(e.design_tip)}.</p><div class="detail-limit"><h3>Read it carefully</h3><p>${esc(e.interpretation_limit)}.</p></div><h3>Follow the evidence</h3>${e.references.length?`<ul class="detail-references">${e.references.map(referenceLink).join('')}</ul>`:'<p>This is an additional project proposal. No inspected journal example is claimed.</p>'}<div class="detail-actions"><button type="button" class="button button-primary" data-save="${e.id}" aria-pressed="${saved.has(id)}">Save to shortlist +</button><button type="button" class="button button-outline" data-download="${e.id}">Recipe .md <span aria-hidden="true">↓</span></button><button type="button" class="text-button" id="copy-recipe-link">Copy link <span aria-hidden="true">↗</span></button></div></div></article>`;
 updateSavedControls();if(history)updateURL({push:true,recipe:id});
 if(!dialog.open){dialog.showModal();document.body.classList.add('dialog-open');}
 dialog.scrollTop=0;$('#close-dialog').focus({preventScroll:true});
}
function closeRecipe({history=true}={}){
 currentRecipe=null;if(dialog.open)dialog.close();document.body.classList.remove('dialog-open');if(history)updateURL({recipe:null});
}
function download(content,name,type='text/markdown;charset=utf-8'){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function renderReferences(){
 const selected=references.filter(r=>referenceFilter==='all'||r.id.startsWith(referenceFilter));
 const shown=allReferences?selected:selected.slice(0,6);
 $('#reference-list').innerHTML=shown.map(r=>`<article class="reference-item"><div class="reference-meta"><span>${esc(r.journal.toUpperCase())} / ${r.year}</span><span>${r.id}</span></div><h3><a href="${safeURL(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a></h3><p class="reference-author">${esc(r.authors)} · ${esc(r.scope)}</p><details><summary>Figures to explore</summary><p>${esc(r.figures)}</p><p>${esc(r.lesson)}</p><a href="${safeURL(r.access_url||r.url)}" target="_blank" rel="noopener noreferrer">Open article or manuscript ↗</a></details></article>`).join('');
 $('#more-references').hidden=selected.length<=6;$('#more-references').textContent=allReferences?'Show fewer references ↑':`Show all ${selected.length} references ↓`;
 $$('[data-references]').forEach(b=>{const on=b.dataset.references===referenceFilter;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
}
function renderDecorations(){
 const mounts={'hero-tree':'PHY02','hero-scatter':'ORD01','hero-heatmap':'COM02','collection-community':'ORD01','collection-genomes':'GEN02','collection-connections':'NET01'};
 for(const[id,recipe]of Object.entries(mounts))$('#'+id).innerHTML=previewSVG(recipe,{decorative:true});
}
function wireEvents(){
 document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest('button'):null;if(!target)return;
  if(target.hasAttribute('data-open'))openRecipe(target.dataset.open);
  else if(target.hasAttribute('data-save'))toggleSaved(target.dataset.save);
  else if(target.hasAttribute('data-family')){changeState({family:target.dataset.family});if(window.matchMedia('(max-width:700px)').matches)$('#category-details').open=false;}
  else if(target.hasAttribute('data-quick'))changeState({quick:target.dataset.quick,collection:''});
  else if(target.hasAttribute('data-collection'))changeState({...defaultState(),collection:target.dataset.collection},{scroll:true});
  else if(target.hasAttribute('data-reset'))resetFilters();
  else if(target.hasAttribute('data-download')){const e=entries.find(e=>e.id===target.dataset.download);download(recipeMarkdown(e,references),e.id+'-visualization-recipe.md');}
  else if(target.hasAttribute('data-references')){referenceFilter=target.dataset.references;allReferences=false;renderReferences();}
 });
 $('#search').addEventListener('input',e=>{const q=e.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>changeState({q},{push:false}),160);});
 $('#sort').addEventListener('change',e=>changeState({sort:e.target.value}));
 $('#reset-filters').addEventListener('click',resetFilters);
 $('#load-more').addEventListener('click',()=>{visibleCount+=12;renderGallery();});
 $('#export-shortlist').addEventListener('click',()=>{const selected=entries.filter(e=>saved.has(e.id));download(shortlistMarkdown(selected,references),'microbial-visualization-shortlist.md');toast(`Exported ${selected.length} saved recipes.`);});
 $('#close-dialog').addEventListener('click',()=>closeRecipe());
 dialog.addEventListener('cancel',e=>{e.preventDefault();closeRecipe();});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)closeRecipe();}});
 dialog.addEventListener('click',async e=>{if(e.target.closest('#copy-recipe-link')){try{await navigator.clipboard.writeText(window.location.href);toast('Recipe link copied.');}catch{toast('The shareable recipe link is in your address bar.');}}});
 $('#more-references').addEventListener('click',()=>{allReferences=!allReferences;renderReferences();});
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!dialog.open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();$('#search').focus();}});
 window.addEventListener('popstate',()=>{const id=readLocation();visibleCount=12;renderGallery();if(id)openRecipe(id,{history:false});else closeRecipe({history:false});});
 const narrow=window.matchMedia('(max-width:700px)');$('#category-details').open=!narrow.matches;narrow.addEventListener('change',e=>{$('#category-details').open=!e.matches;});
}
async function initialize(){
 renderDecorations();
 try{
  const[catalogue,refs,geography]=await Promise.all([readJSON('./data/catalogue.json'),readJSON('./data/references.json'),readJSON('./assets/world-path.json')]);
  if(!Array.isArray(catalogue.entries)||!Array.isArray(refs))throw new Error('The catalogue data has an unexpected format.');
  entries=catalogue.entries;references=refs;setWorld(geography.paths);saved=loadSaved(storage,new Set(entries.map(e=>e.id)));
  const id=readLocation();wireEvents();renderGallery();renderReferences();if(id)openRecipe(id,{history:false});
 }catch(error){
  console.error('Atlas initialization failed:',error);
  $('#results-label').textContent='The interactive catalogue could not load.';
  $('#gallery').innerHTML='<div class="load-error" role="alert"><h3>Let’s take another route.</h3><p>Refresh this page, or <a href="./downloads/visualization-catalogue.md">read the complete catalogue</a>. All recipes are also available as <a href="./data/catalogue.json">downloadable JSON</a>.</p></div>';
 }
}
export const ready=initialize();
