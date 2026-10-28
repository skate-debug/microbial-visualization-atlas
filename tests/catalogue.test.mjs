import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {filterEntries,STARTER_IDS,COLLECTIONS,loadSaved,persistSaved,recipeMarkdown,STORAGE_KEY} from '../website/catalogue-core.js';
import {previewSVG,previewType,setWorld} from '../website/previews.js';

const root=new URL('../',import.meta.url);
const read=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const {entries}=await read('data/catalogue.json');
const references=await read('data/references.json');
const {paths}=await read('website/assets/world-path.json');
setWorld(paths);

assert.equal(filterEntries(entries,{}).length,116);
assert.deepEqual(filterEntries(entries,{quick:'starter'}).map(e=>e.id),STARTER_IDS);
assert.equal(filterEntries(entries,{quick:'direct'}).length,43);
assert.equal(filterEntries(entries,{family:'VIR'}).length,6);
assert.equal(filterEntries(entries,{q:'this-does-not-exist-458'}).length,0);
assert(filterEntries(entries,{q:'viral hosts'}).some(e=>e.id==='VIR01'));
assert(filterEntries(entries,{q:'AMG'}).some(e=>e.id==='VIR04'));
assert(filterEntries(entries,{q:'heatmap'}).length>5);
assert.equal(filterEntries(entries,{family:'VIR',quick:'direct'}).length,2);
for(const name of Object.keys(COLLECTIONS))assert.deepEqual(filterEntries(entries,{collection:name}).map(e=>e.id),COLLECTIONS[name].ids);
const sorted=filterEntries(entries,{sort:'az'}).map(e=>e.name);
assert.deepEqual(sorted,sorted.slice().sort((a,b)=>a.localeCompare(b)));
const saved=new Set(['PHY02','COM02']);
assert.equal(filterEntries(entries,{quick:'saved'},saved).length,2);
const valid=new Set(entries.map(e=>e.id));
const storage={data:new Map(),getItem(k){return this.data.get(k)},setItem(k,v){this.data.set(k,v)}};
assert(persistSaved(storage,saved));
assert.deepEqual([...loadSaved(storage,valid)],[...saved]);
storage.setItem(STORAGE_KEY,'not JSON');assert.equal(loadSaved(storage,valid).size,0);
storage.setItem(STORAGE_KEY,'["PHY02","unknown",13]');assert.deepEqual([...loadSaved(storage,valid)],['PHY02']);
assert(!persistSaved({setItem(){throw new Error('denied')}},saved));
const markdown=recipeMarkdown(entries.find(e=>e.id==='PHY02'),references);
assert(markdown.includes('https://www.nature.com/articles/s41587-020-0718-6'));
assert(markdown.includes('Interpretation limit'));
for(const e of entries){
 assert(previewType(e.id),`Missing preview mapping for ${e.id}`);
 const svg=previewSVG(e.id,{label:e.name});
 assert(svg.startsWith('<svg'));
 assert(!/NaN|undefined|Infinity/.test(svg),`Non-finite SVG coordinate for ${e.id}`);
 assert.equal(svg,previewSVG(e.id,{label:e.name}),`Non-deterministic preview ${e.id}`);
}
console.log('Catalogue interaction logic, saved-state recovery, exports and all 116 deterministic previews passed.');
