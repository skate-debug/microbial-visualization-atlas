// Original, deterministic schematic previews. All plotted values are synthetic.
// Geographic outlines are the separately credited Natural Earth data.
const C=['#537b62','#91a481','#c99a73','#6e939b','#b8c6aa','#d4b999'];
const ink='#70806a',line='#bcc9b3';
let world=[];
export function setWorld(paths){world=Array.isArray(paths)?paths:[];}
export const escapeText=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rng(s){let n=Array.from(s).reduce((a,c)=>((a*31+c.charCodeAt(0))>>>0),17);return()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};}
const rect=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const dot=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const path=(d,stroke=ink,width=1,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const txt=(x,y,t,size=8,anchor='start',fill=ink)=>`<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-family="DM Sans,Arial,sans-serif">${escapeText(t)}</text>`;
const axis=(xLabel='',yLabel='')=>path('M44 37V195H368',line,.9)+[75,115,155].map(y=>path(`M44 ${y}H368`,'#cad5c0',.5,'opacity=".45"')).join('')+txt(206,218,xLabel,8,'middle')+`<text x="20" y="122" font-size="8" text-anchor="middle" fill="${ink}" transform="rotate(-90 20 122)" font-family="DM Sans,Arial,sans-serif">${escapeText(yLabel)}</text>`;
const poly=(points,color=C[0],width=2,extra='')=>path(points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(''),color,width,extra);
const pt=(r,a,cx=200,cy=120)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)];
const arc=(r,a,b,cx=200,cy=120)=>{const p=pt(r,a,cx,cy),q=pt(r,b,cx,cy);return`M${p}A${r} ${r} 0 ${b-a>Math.PI?1:0} 1 ${q}`;};
const lerp=(a,b,t)=>Math.round(a+(b-a)*t);
const shade=t=>`rgb(${lerp(233,61,t)},${lerp(239,102,t)},${lerp(222,77,t)})`;
const signed=t=>t<.5?`rgb(${lerp(109,242,t*2)},${lerp(144,239,t*2)},${lerp(154,228,t*2)})`:`rgb(${lerp(242,189,(t-.5)*2)},${lerp(239,137,(t-.5)*2)},${lerp(228,103,(t-.5)*2)})`;
function scatter(r,mode='ordination'){
 let s=axis(mode==='prediction'?'Observed':mode==='volcano'?'log fold change':mode==='quality'?'Completeness':'Axis 1',mode==='prediction'?'Predicted':mode==='volcano'?'−log₁₀(q)':mode==='quality'?'Contamination':'Axis 2');
 if(mode==='prediction')s+=path('M50 190 355 45',C[2],1,'stroke-dasharray="4 4"');
 if(mode==='quadrant')s+=path('M205 37V195M44 116H368',C[2],1,'stroke-dasharray="4 4"');
 for(let i=0;i<84;i++){let g=i%3,x,y;
  if(mode==='prediction'){x=55+r()*295;y=192-(x-55)*.48+(r()-.5)*35;}
  else if(mode==='volcano'){x=70+r()*270;y=183-Math.abs(x-205)*.72-r()*46;g=Math.abs(x-205)>67?(x<205?0:2):4;}
  else if(mode==='quality'){x=73+Math.pow(r(),.3)*280;y=190-Math.pow(r(),3)*145;}
  else if(mode==='quadrant'){x=55+r()*298;y=45+r()*140;g=x>205?(y>116?2:3):(y>116?1:0);}
  else{x=[110,216,300][g]+(r()+r()+r()-1.5)*48;y=[135,83,145][g]+(r()+r()+r()-1.5)*40;}
  s+=dot(x,y,2+r()*1.2,C[g],`opacity=".72"`);
 }
 return s;
}
function heatmap(r,mode='abundance'){
 const rows=8,cols=15,x0=67,y0=48,w=17,h=17;let s='';
 for(let j=0;j<cols;j++)s+=rect(x0+j*w,y0-8,w-2,4,C[Math.floor(j/5)]);
 for(let i=0;i<rows;i++){
  s+=txt(x0-9,y0+i*h+10,`F${i+1}`,6,'end');
  for(let j=0;j<cols;j++){
   let v=(r()*.4+((i<4)===(j<8)?.6:.05));
   let color=mode==='binary'?(v>.55?C[Math.floor(i/3)]: '#e3e8dc'):mode==='missing'?(r()>.8?'#c7ab79':'#dce4d5'):mode==='correlation'?signed((Math.cos((i-j)*.7)+1)*.5):mode==='confusion'?shade(i===j%8?.8+r()*.15:r()*.2):shade(Math.min(v,1));
   s+=rect(x0+j*w,y0+i*h,w-1.7,h-1.7,color);
  }
 }
 s+=txt(192,210,mode==='correlation'?'Environmental variables':'Samples',8,'middle');
 s+=path('M39 57H46V107H54M46 80H60M39 125H46V175H54M46 150H60',line,1);
 if(mode==='omics')s+=rect(195,41,4,151,'#f5f6ef');
 return s;
}
function radialTree(r,plain=false){
 let s='';const n=32,start=-2.7,step=5.6/n,levels=[16,34,58,81];
 for(let level=0;level<4;level++){
  const group=2**(3-level);
  for(let i=0;i<n;i+=group){
   const a=start+(i+group/2)*step,pr=level?levels[level-1]:0,rad=levels[level];
   if(level){const parentA=start+(Math.floor(i/(group*2))*group*2+group)*step;const p=pt(pr,parentA),q=pt(pr,a);s+=path(arc(pr,Math.min(parentA,a),Math.max(parentA,a)),C[Math.floor(i/11)%3],.8);s+=path(`M${q}L${pt(rad,a)}`,C[Math.floor(i/11)%3],.9);}
   else s+=path(`M200 120L${pt(rad,a)}`,C[Math.floor(i/11)%3],1);
  }
 }
 for(let i=0;i<n;i++){const a=start+(i+.5)*step;s+=dot(...pt(83,a),1.8,C[Math.floor(i/11)%3]);if(!plain){s+=path(arc(94,a-step*.35,a+step*.35),shade(r()*.8),6);s+=path(arc(104,a-step*.35,a+step*.35),C[Math.floor(r()*5)],5);}}
 return s+txt(200,229,plain?'Evolutionary relationships':'Phylogeny × habitat × function',7,'middle');
}
function treeMatrix(r,mode='tree'){
 let s='';for(let i=0;i<8;i++){
 const y=44+i*21,group=Math.floor(i/2),p=70+group*16;
 s+=path(`M45 119H62M62 ${54+group*42}H${p+28}V${y}H198`,C[Math.floor(i/3)],1.4);
 s+=path(`M62 54V180`,line,1)+dot(198,y,2,C[Math.floor(i/3)]);
 if(mode!=='plain')for(let j=0;j<7;j++)s+=rect(217+j*18,y-6,14,12,shade(r()));
 }
 if(mode==='tangle')s+=`<g transform="translate(390 0) scale(-.7 1)">${treeMatrix(r,'plain')}</g>`;
 return s;
}
function distribution(r,mode='rain'){
 let s=axis('Habitat','Diversity');
 for(let g=0;g<4;g++){
  const x=92+g*75,values=Array.from({length:26},()=>Math.max(43,Math.min(184,88+g*16+(r()+r()-1)*66))).sort((a,b)=>a-b);
  const density=y=>values.reduce((a,v)=>a+Math.exp(-.5*((y-v)/12)**2),0)/values.length*57;
  const points=[];for(let y=35;y<=193;y+=3)points.push([x-density(y),y]);
  if(mode!=='box'){
   const tail=mode==='violin'?points.slice().reverse().map(([xx,y])=>[2*x-xx,y]):[[x,193],[x,35]];
   s+=`<path d="${points.concat(tail).map(([xx,y],i)=>`${i?'L':'M'}${xx},${y}`).join('')}Z" fill="${C[g]}" opacity=".35"/>`;
  }
  const lo=values[6],hi=values[19],mid=values[13],bx=mode==='rain'?x+8:x;
  s+=path(`M${bx} ${values[1]}V${values[24]}`,C[g],1)+rect(bx-5,lo,10,hi-lo,C[g],'opacity=".35"')+path(`M${bx-5} ${mid}H${bx+5}`,C[g],1.8);
  for(const y of values)s+=dot(mode==='rain'?x+18+r()*15:x+(r()-.5)*15,y,1.6,C[g],'opacity=".7"');
  s+=txt(x,207,['Soil','Water','Sediment','Biofilm'][g],7,'middle');
 }
 return s;
}
function lines(r,mode='time'){
 let s=axis(mode==='depth'?'Abundance':mode==='rarefaction'?'Sampling effort':mode==='rank'?'Rank':mode==='hill'?'Diversity order q':'Time',mode==='depth'?'Depth':mode==='ecdf'?'Cumulative fraction':'Response');
 for(let g=0;g<3;g++){
  let points=[];
  for(let i=0;i<35;i++){const x=46+i*9.2,t=i/34;let y;
   if(mode==='rarefaction')y=190-(110+g*17)*(1-Math.exp(-t*(3+g)));
   else if(mode==='rank')y=52+g*12+110*(1-Math.exp(-t*4));
   else if(mode==='hill')y=48+g*15+92*t/(t+.25);
   else if(mode==='ecdf')y=191-145*Math.pow(t,.7+g*.55);
   else if(mode==='recovery')y=105-g*14+(t>.35?60*Math.exp(-(t-.35)*(3+g)):0)+(r()-.5)*5;
   else y=124+Math.sin(t*6.28+g*1.4)*30+Math.cos(t*13+g)*13+(r()-.5)*10;
   points.push(mode==='depth'?[160+Math.sin(t*5+g)*70+g*15,40+t*150]:[x,y]);
  }
  s+=poly(points,C[g],1.8);
  if(mode==='ecdf'||mode==='time'||mode==='recovery')for(let i=0;i<points.length;i+=3)s+=dot(...points[i],2,C[g]);
 }
 if(mode==='recovery')s+=path('M156 40V195',C[2],1,'stroke-dasharray="3 4"');
 return s;
}
function bars(r,mode='stack'){
 let s=axis('Samples','Relative abundance');const colors=C.slice(0,5);
 for(let j=0;j<18;j++){const vals=colors.map(()=>r()+.1),total=vals.reduce((a,b)=>a+b),x=54+j*17;let y=193;
  if(mode==='hist'){const h=130*Math.exp(-Math.pow((j-8)/5,2))+(r()*14);s+=rect(x,193-h,13,h,C[0],'opacity=".75"');continue;}
  for(let i=0;i<vals.length;i++){const h=vals[i]/total*145;y-=h;s+=rect(x,y,12,h-.7,colors[i]);}
 }
 return s;
}
function ridge(r){let s='';for(let g=0;g<6;g++){let p=[[50,65+g*23]];for(let i=0;i<70;i++){let x=50+i*4.2,peak=170+g*15,y=65+g*23-33*Math.exp(-Math.pow((x-peak)/55,2))-14*Math.exp(-Math.pow((x-95)/24,2));p.push([x,y]);}p.push([340,65+g*23]);s+=`<path d="${p.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join('')}Z" fill="${C[g%5]}" stroke="#f4f5ed" stroke-width="1.2" opacity=".85"/>`;}return s+txt(200,220,'Measurement',8,'middle');}
function dotMatrix(r){let s='';for(let i=0;i<7;i++){s+=txt(68,53+i*23,`Taxon ${i+1}`,7,'end');for(let j=0;j<10;j++)s+=dot(90+j*26,50+i*23,1.5+r()*7,shade(.25+r()*.75),'opacity=".85"');}return s+txt(210,220,'Abundance × prevalence',8,'middle');}
function ternary(r){const a=[200,35],b=[77,195],c=[323,195];let s=path(`M${a}L${b}L${c}Z`,line,1.2);for(let i=1;i<5;i++){let t=i/5;s+=path(`M${77+123*t} ${195-160*t}H${323-123*t}`,line,.6);}for(let i=0;i<65;i++){let u=r(),v=r(),w=r(),sum=u+v+w;u/=sum;v/=sum;w/=sum;s+=dot(a[0]*u+b[0]*v+c[0]*w,a[1]*u+b[1]*v+c[1]*w,2.4,C[i%3],'opacity=".7"');}return s+txt(200,22,'A',8,'middle')+txt(66,211,'B',8,'middle')+txt(334,211,'C',8,'middle');}
function treemap(r){let s='';const cells=[[45,40,145,100,0],[45,145,90,55,1],[140,145,50,55,4],[195,40,70,70,2],[270,40,85,70,5],[195,115,160,85,3]];for(const[x,y,w,h,c]of cells){s+=rect(x,y,w,h,C[c],'opacity=".6"');for(let i=1;i<4;i++)s+=path(`M${x+i*w/4} ${y+4}V${y+h-4}`,'#f8f9f5',1);}return s;}
function upset(){const bits=[[1,0,0],[0,1,0],[0,0,1],[1,1,0],[1,0,1],[0,1,1],[1,1,1]],sizes=[33,27,19,24,16,11,21];let s='';for(let j=0;j<7;j++){const x=140+j*29;s+=rect(x-7,121-sizes[j]*2,14,sizes[j]*2,C[0]);const active=bits[j].map((b,i)=>b?148+i*19:null).filter(x=>x!==null);if(active.length>1)s+=path(`M${x} ${active[0]}V${active.at(-1)}`,C[0],1.5);for(let i=0;i<3;i++)s+=dot(x,148+i*19,4,bits[j][i]?C[0]:'#d7dfd0');}for(let i=0;i<3;i++){const total=sizes.reduce((n,v,j)=>n+v*bits[j][i],0);s+=rect(120-total*.65,143+i*19,total*.65,9,C[i])+txt(42,151+i*19,['A','B','C'][i],7,'middle');}return s+txt(235,219,'Set intersections',8,'middle');}
function venn(){return dot(165,100,59,C[0],'opacity=".3"')+dot(235,100,59,C[2],'opacity=".35"')+dot(200,154,59,C[3],'opacity=".35"')+txt(147,83,'A',11)+txt(249,83,'B',11)+txt(198,184,'C',11)+txt(199,123,'Shared',8,'middle');}
function sankey(){const flows=[[24,9,7],[6,20,4],[10,8,32]],left=[40,30,50],right=[40,37,43],posL=[],posR=[];let y=38;for(const h of left){posL.push(y);y+=h*1.05+14;}y=38;for(const h of right){posR.push(y);y+=h*1.05+14;}let s='',lo=[0,0,0],ro=[0,0,0];for(let i=0;i<3;i++)for(let j=0;j<3;j++){let h=flows[i][j]*1.05,y1=posL[i]+lo[i],y2=posR[j]+ro[j];s+=`<path d="M77 ${y1}C170 ${y1} 220 ${y2} 320 ${y2}V${y2+h}C220 ${y2+h} 170 ${y1+h} 77 ${y1+h}Z" fill="${C[i]}" opacity=".32"/>`;lo[i]+=h;ro[j]+=h;}for(let i=0;i<3;i++)s+=rect(68,posL[i],9,left[i]*1.05,C[i])+rect(320,posR[i],9,right[i]*1.05,C[i]);return s;}
function forest(r,paired=false){let s=path('M217 35V204',line,1,'stroke-dasharray="3 3"');for(let i=0;i<7;i++){let x=145+r()*150,y=45+i*24,w=20+r()*35;s+=txt(83,y+3,`Feature ${i+1}`,7,'end')+path(`M${x-w} ${y}H${x+w}`,C[i%3],1.4)+dot(x,y,3,C[i%3]);if(paired)s+=dot(x-w,y,3,'#c3b38e')+path(`M${x-w} ${y}L${x} ${y}`,C[2],1.5);}return s+txt(225,225,paired?'Paired change':'Effect estimate & interval',8,'middle');}
function network(r,bipartite=false){let nodes=[],s='';if(bipartite){for(let g=0;g<2;g++)for(let i=0;i<7;i++)nodes.push({x:110+g*180,y:43+i*25,g});}else{for(let g=0;g<3;g++)for(let i=0;i<9;i++){const a=i/9*Math.PI*2;nodes.push({x:[110,270,210][g]+Math.cos(a)*(24+r()*20),y:[85,82,170][g]+Math.sin(a)*(18+r()*20),g});}}
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];if(bipartite?(a.g!==b.g&&r()>.78):(r()>(a.g===b.g?.55:.98)))s+=path(`M${a.x} ${a.y}L${b.x} ${b.y}`,C[a.g],.65,'opacity=".35"');}
 for(const n of nodes)s+=dot(n.x,n.y,3+r()*4,C[n.g],'stroke="#f8f9f5" stroke-width="1"');return s;
}
function chord(r){let s='';for(let g=0;g<6;g++)s+=path(arc(85,g*Math.PI/3+.04,(g+1)*Math.PI/3-.04),C[g],8);for(let i=0;i<22;i++){const a=r()*Math.PI*2,b=r()*Math.PI*2,p=pt(80,a),q=pt(80,b);s+=path(`M${p}Q200 120 ${q}`,C[Math.floor(a/Math.PI*3)],1+r()*3,'opacity=".35"');}return s;}
function genome(r,mode='synteny'){let s='';for(let row=0;row<3;row++){let y=65+row*53;s+=path(`M42 ${y}H355`,line,1);for(let j=0;j<9;j++){let x=48+j*33,w=20+r()*9,c=C[(j+Math.floor(row/2))%6];s+=`<path d="M${x} ${y-7}H${x+w-6}L${x+w} ${y}L${x+w-6} ${y+7}H${x}Z" fill="${c}"/>`;if(mode==='synteny'&&row<2)s+=`<path d="M${x} ${y+9}L${x+5} ${y+44}H${x+w+5}L${x+w} ${y+9}Z" fill="${c}" opacity=".13"/>`;}}return s+txt(200,222,'Genomic position',8,'middle');}
function coverage(r,allele=false){let s=axis('Genomic position',allele?'Allele frequency':'Read identity');if(allele){for(let i=0;i<65;i++){let x=55+i*4.6,y=187-r()**2*135;s+=path(`M${x} 193V${y}`,C[0],.6,'opacity=".4"')+dot(x,y,1.9,C[i%3]);}}else{for(let i=0;i<400;i++){let x=51+r()*306,y=40+r()**.22*72;if(r()>.86)y+=55;s+=rect(x,y,1.8,1.3,C[Math.floor(r()*3)],'opacity=".6"');}}return s;}
function logo(){let s='';for(let i=0;i<11;i++){const vals=[.28,.45,.19,.62,.5,.77,.32,.55,.43,.63,.29],h=vals[i]*100,x=56+i*28;s+=txt(x,194,['A','C','G','T'][i%4],h,'middle',C[i%3])+txt(x,194-h*.75,['G','T','A','C'][i%4],(100-h)*.85,'middle',C[(i+1)%3]);}return s+path('M42 198H370',line,.8);}
function cycle(){let s='';const labels=['N₂','NH₄⁺','NO₂⁻','NO₃⁻','N₂O'];for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5,b=a+2*Math.PI/5,p=pt(70,a),q=pt(70,b);s+=path(arc(70,a+.26,b-.28),C[i],2);const end=pt(70,b-.28),t=b-.28;s+=`<path d="M${end}l${-7*Math.cos(t)+3*Math.sin(t)} ${-7*Math.sin(t)-3*Math.cos(t)}l${-5*Math.sin(t)} ${5*Math.cos(t)}Z" fill="${C[i]}"/>`;s+=dot(...p,18,'#f8f9f1','stroke="#c5d2bd" stroke-width="1"')+txt(p[0],p[1]+3,labels[i],10,'middle');}return s+txt(200,120,'N',28,'middle','#8ba07d')+txt(200,137,'cycle',8,'middle');}
function cells(r,mode='cells'){let s='';for(let i=0;i<48;i++){let x=55+r()*290,y=40+r()*155,color=C[i%3],a=r()*160;if(mode==='activity')color=shade(r());s+=`<rect x="${x}" y="${y}" width="${7+r()*10}" height="${5+r()*4}" rx="4" transform="rotate(${a} ${x} ${y})" fill="${color}" opacity=".7" stroke="#f7f9ef" stroke-width=".7"/>`;}s+=path('M310 207H350',ink,2)+txt(330,221,'Schematic',7,'middle');return s;}
function surface(r,mode='surface'){let s='';const w=13,h=10;for(let i=0;i<15;i++)for(let j=0;j<23;j++){const v=mode==='kymograph'?Math.exp(-Math.pow((j-i*.8-3)/2.4,2)):Math.min(1,.85*Math.exp(-((j-12)**2/55+(i-7)**2/20))+.25*Math.sin(i*.4+j*.2)**2);s+=rect(50+j*w,42+i*h,w+.1,h+.1,shade(v));}return s+txt(198,218,mode==='kymograph'?'Time':mode==='depth'?'Transect distance':'Environmental gradient',8,'middle');}
function curve(r,mode='response'){let s=axis(mode==='roc'?'False-positive rate':mode==='calibration'?'Predicted probability':'Environmental gradient',mode==='roc'?'True-positive rate':mode==='calibration'?'Observed frequency':'Response');if(['roc','calibration'].includes(mode))s+=path('M45 193 365 39',line,1,'stroke-dasharray="4 4"');for(let g=0;g<(mode==='roc'?3:1);g++){let pts=[];for(let i=0;i<50;i++){let t=i/49,y=mode==='roc'?191-146*(1-(1-t)**(3+g)):mode==='calibration'?191-146*t+Math.sin(t*6)*9:mode==='neutral'?191-146*(1-Math.exp(-t*4)):174-Math.exp(-Math.pow((t-.55)/.38,2))*113;pts.push([46+t*316,y]);}if(!['roc','calibration'].includes(mode)){s+=poly(pts,C[0],20,'opacity=".08"');for(let i=0;i<44;i++){let p=pts[Math.floor(r()*49)];s+=dot(p[0],p[1]+(r()-.5)*50,2.3,C[0],'opacity=".45"');}}s+=poly(pts,C[g],2);}return s;}
function arrows(r){let s='';const nodes=[[80,65,'Environment'],[285,65,'Community'],[80,172,'Function'],[285,172,'Process']];for(const[a,b]of[[0,1],[0,2],[1,3],[2,3],[0,3]]){const p=nodes[a],q=nodes[b];s+=path(`M${p[0]} ${p[1]}L${q[0]} ${q[1]}`,C[a%3],1.3,'opacity=".6"');}for(let i=0;i<nodes.length;i++){let[x,y,l]=nodes[i];s+=rect(x-42,y-15,84,30,['#dce7d4','#e7dfcc','#d6e3df','#e0e7d7'][i],'rx="3"')+txt(x,y+3,l,8,'middle');}return s;}
function map(r,facets=false){let s=world.map(d=>`<path d="${escapeText(d)}" fill="#d8e1cd" stroke="#f6f8ef" stroke-width=".4"/>`).join('');const samples=[[-120,45],[-72,5],[-64,-30],[-2,50],[23,10],[28,-25],[83,34],[115,14],[139,-26],[158,42],[-155,-15],[45,55]];for(let i=0;i<samples.length;i++){const[lon,lat]=samples[i];s+=dot((lon+180)/360*360+20,(90-lat)/180*174+30,2.2+r()*1.4,C[i%3],'stroke="#fff" stroke-width=".6"');}return s+txt(200,223,'Illustrative sampling locations',7,'middle');}
function sunburst(){let s='';for(let ring=0;ring<3;ring++){let n=4*2**ring;for(let i=0;i<n;i++)s+=path(arc(35+ring*24,i*2*Math.PI/n+.025,(i+1)*2*Math.PI/n-.025),C[Math.floor(i/(2**ring))],19,'opacity=".7"');}return s;}
function beeswarm(r){let s=path('M220 37V202',line,1);for(let i=0;i<6;i++){let y=51+i*26;s+=txt(75,y+3,`Feature ${i+1}`,7,'end');for(let j=0;j<35;j++){let v=r(),x=220+(v-.5)*(225-i*25);s+=dot(x,y+(r()-.5)*12,2,signed(v),'opacity=".7"');}}return s+txt(220,222,'Contribution to prediction',8,'middle');}
function procrustes(r){let s=axis('Axis 1','Axis 2');for(let i=0;i<30;i++){let x=60+r()*280,y=50+r()*125,xx=x+(r()-.5)*30,yy=y+(r()-.5)*25;s+=path(`M${x} ${y}L${xx} ${yy}`,C[0],.7,'opacity=".5"')+dot(x,y,2.5,C[0])+dot(xx,yy,2.5,C[2],'fill-opacity=".5"');}return s;}
function trajectory(r){let s=axis('Axis 1','Axis 2');for(let g=0;g<3;g++){let pts=Array.from({length:11},(_,i)=>[65+i*25+Math.sin(i*.5)*12,150-g*23+Math.cos(i*.55+g)*30]);s+=poly(pts,C[g],1.3);for(let i=0;i<pts.length;i++)s+=dot(...pts[i],2+i*.23,C[g],'stroke="#f8f9f5" stroke-width=".7"');}return s;}
function gridVolume(r){let s='';for(let z=0;z<3;z++){const y=105-z*23;s+=`<path d="M70 ${y} 230 ${y-50} 340 ${y+14} 178 ${y+64}Z" fill="${C[z]}" opacity=".12" stroke="${C[z]}" stroke-width="1"/>`;for(let i=0;i<18;i++){const u=r(),v=r(),x=70+u*160+v*108,yy=y-u*50+v*64;s+=dot(x,yy,2.5,C[z],'opacity=".65"');}}return s;}
const TYPES={
 GEO01:'map',GEO02:'map',GEO03:'map',GEO04:'map',GEO05:'depth',GEO06:'section',GEO07:'workflow',GEO08:'workflow',
 DIV01:'box',DIV02:'violin',DIV03:'rain',DIV04:'ridge',DIV05:'ecdf',DIV06:'hist',DIV07:'rank',DIV08:'rarefaction',DIV09:'hill',
 COM01:'stack',COM02:'heatmap',COM03:'dots',COM04:'binary',COM05:'ternary',COM06:'treemap',COM07:'sunburst',COM08:'upset',COM09:'venn',COM10:'sankey',
 ORD01:'scatter',ORD02:'biplot',ORD03:'biplot',ORD04:'trajectory',ORD05:'procrustes',ORD06:'response',ORD07:'joint',
 EFF01:'forest',EFF02:'volcano',EFF03:'scatter',EFF04:'paired',EFF05:'response',EFF06:'time',EFF07:'correlation',EFF08:'linked',
 TIM01:'time',TIM02:'heatmap',TIM03:'area',TIM04:'section',TIM05:'lag',TIM06:'surface',TIM07:'recovery',
 PHY01:'recttree',PHY02:'tree',PHY03:'recttree',PHY04:'plainTree',PHY05:'tangle',PHY06:'tree',
 GEN01:'tracks',GEN02:'synteny',GEN03:'sunburst',GEN04:'binary',GEN05:'correlation',GEN06:'tracks',GEN07:'coverage',GEN08:'allele',GEN09:'logo',
 VIR01:'bipartite',VIR02:'binary',VIR03:'network',VIR04:'amg',VIR05:'synteny',VIR06:'stack',
 NET01:'network',NET02:'correlation',NET03:'chord',NET04:'network',NET05:'networks',NET06:'rank',
 FUN01:'heatmap',FUN02:'dots',FUN03:'network',FUN04:'cycle',FUN05:'sankey',FUN06:'workflow',FUN07:'scatter',FUN08:'bipartite',
 MUL01:'omics',MUL02:'correlation',MUL03:'forest',MUL04:'dots',MUL05:'bipartite',
 IMG01:'cells',IMG02:'cells',IMG03:'response',IMG04:'correlation',IMG05:'volume',IMG06:'activity',IMG07:'scatter',IMG08:'kymograph',
 ML01:'prediction',ML02:'roc',ML03:'confusion',ML04:'calibration',ML05:'residual',ML06:'forest',ML07:'beeswarm',ML08:'forest',
 ECO01:'venn',ECO02:'neutral',ECO03:'quadrant',ECO04:'stack',ECO05:'workflow',ECO06:'surface',
 QC01:'missing',QC02:'quality',QC03:'forest',QC04:'hist',QC05:'prediction'
};
export function previewType(id){return TYPES[id];}
export function previewSVG(id,{label='',decorative=false}={}){
 const r=rng(id),type=TYPES[id]||'scatter';let s='';
 if(['map'].includes(type))s=map(r);
 else if(['heatmap','binary','correlation','missing','confusion','omics'].includes(type))s=heatmap(r,type);
 else if(['tree','plainTree'].includes(type))s=radialTree(r,type==='plainTree');
 else if(['recttree','tangle'].includes(type))s=treeMatrix(r,type);
 else if(['rain','box','violin'].includes(type))s=distribution(r,type);
 else if(['time','depth','rarefaction','rank','hill','ecdf','recovery'].includes(type))s=lines(r,type);
 else if(['stack','hist'].includes(type))s=bars(r,type);
 else if(['scatter','volcano','prediction','quality','quadrant','residual','biplot','joint'].includes(type)){
  s=scatter(r,['biplot','joint','residual'].includes(type)?'ordination':type);
  if(type==='biplot')s+=path('M205 120 299 56M205 120 300 165M205 120 135 63',C[2],1.5)+txt(303,55,'pH',8)+txt(303,168,'Temp.',8);
  if(type==='joint')s+=`<g transform="translate(110 4) scale(.6 .16)">${distribution(r,'box')}</g>`;
 }else if(type==='ridge')s=ridge(r);
 else if(type==='dots')s=dotMatrix(r);
 else if(type==='ternary')s=ternary(r);
 else if(type==='treemap')s=treemap(r);
 else if(type==='sunburst')s=sunburst();
 else if(type==='upset')s=upset();
 else if(type==='venn')s=venn();
 else if(type==='sankey')s=sankey();
 else if(type==='forest'||type==='paired')s=forest(r,type==='paired');
 else if(type==='network'||type==='bipartite')s=network(r,type==='bipartite');
 else if(type==='networks')s=`<g transform="translate(0 18) scale(.52 .8)">${network(r)}</g><g transform="translate(190 18) scale(.52 .8)">${network(r)}</g>`;
 else if(type==='chord')s=chord(r);
 else if(type==='tracks'||type==='synteny')s=genome(r,type);
 else if(type==='coverage'||type==='allele')s=coverage(r,type==='allele');
 else if(type==='logo')s=logo();
 else if(type==='cycle')s=cycle();
 else if(type==='cells'||type==='activity')s=cells(r,type);
 else if(['surface','section','kymograph'].includes(type))s=surface(r,type==='section'?'depth':type);
 else if(['response','roc','calibration','neutral'].includes(type))s=curve(r,type);
 else if(type==='workflow')s=arrows(r);
 else if(type==='beeswarm')s=beeswarm(r);
 else if(type==='procrustes')s=procrustes(r);
 else if(type==='trajectory')s=trajectory(r);
 else if(type==='volume')s=gridVolume(r);
 else if(type==='linked')s=`<g transform="translate(100 20) scale(.7 .85)">${heatmap(r,'correlation')}</g>`+path('M45 110Q90 40 155 66M45 110Q110 70 155 115M45 110Q95 185 155 180',C[0],2)+dot(45,110,5,C[0]);
 else if(type==='amg')s=`<g transform="translate(-15 0) scale(.62 .8)">${treeMatrix(r)}</g><g transform="translate(180 10) scale(.55 .8)">${genome(r,'synteny')}</g>`;
 else if(type==='lag'){s=axis('Lag','Association');for(let i=0;i<25;i++){let x=53+i*12,y=120+Math.sin(i*.25)*55;s+=path(`M${x} 120V${y}`,C[0],1.4)+dot(x,y,2,C[0]);}}
 else if(type==='area'){let s0=0;for(let g=0;g<4;g++){let up=[],down=[];for(let i=0;i<40;i++){let x=45+i*8,base=190-g*35+Math.sin(i*.16+g)*12;up.push([x,base-29]);down.unshift([x,base]);}s+=`<path d="${up.concat(down).map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join('')}Z" fill="${C[g]}" opacity=".65"/>`;}}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" ${decorative?'aria-hidden="true"':`role="img" aria-label="${escapeText(label||'Synthetic illustration of '+id)}"`}><g>${s}</g></svg>`;
}
