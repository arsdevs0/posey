(() => {
'use strict';
const $=id=>document.getElementById(id),{poses,views,areas}=window.PoseCatalog,states=poses.map(()=>0),imageBlobs=new WeakMap(),blobCache=new Map();
const pageSize=24;
const featured=[543,864,683,784,922,604,565,843,983,743,243,663,903,807,727,886,341,281,474,942,969,500,825,641].map(id=>id-1);
const displayOrder=[...featured,...poses.map((_,i)=>i).filter(i=>!featured.includes(i))];
let guides=true,selected=0,activeFilter='all',activeArea='all',page=0,dragging=false;
const groups={all:()=>true,standing:p=>['standing','walking','leaning'].includes(p.category),seated:p=>['seated','floor'].includes(p.category),bed:p=>p.bed||p.reclining,pov:p=>p.pov};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=p=>p.reclining?'Reclining':p.category==='bed'?'Bed / reclining':p.category==='floor'?'Floor sitting':p.category[0].toUpperCase()+p.category.slice(1);
const iconPaths={home:'M3 10 12 3l9 7M5 9v12h14V9M9 21v-7h6v7',living:'M4 13V7h16v6M2 12h4v6h12v-6h4v9H2zM6 13h12',bedroom:'M3 21V3h18v18M3 9h18M10 3v6M3 15h18M10 15v6',kitchen:'M3 9h18v12H3zM3 15h18M9 9v12M13 4v5m0-5h5v3M5 5h3',bed:'M3 20V7m18 13V11H3M3 17h18M6 7h5v4H6zM12 8h8v3',sofa:'M5 12V7q0-3 3-3h8q3 0 3 3v5M2 11h4v7h12v-7h4v9H2zM7 12h10M5 20v2m14-2v2',floor:'M3 7h18v12H3zM6 7v12M18 7v12M1 9h2m-2 4h2m-2 4h2m18-8h2m-2 4h2m-2 4h2',window:'M4 3h16v18H4zM12 3v18M4 12h16M1 2h22',door:'M5 22V2h14v20M9 22V5l8-2v19M13 12h1'};
function areaIcon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[name]||iconPaths.home}"/></svg>`;}
function areaInfo(p){return `<div class="pose-area"><span class="area-kicker">AREA</span><strong>${escape(p.room)}</strong><span class="placement">${escape(p.placement)}</span></div>`;}
function syncAreas(){document.querySelectorAll('[data-area]').forEach(button=>{const active=button.dataset.area===activeArea;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);});$('area-selection').textContent=areas.find(a=>a.id===activeArea).label;}
const asset=(p,j,thumb=false)=>p.generated?'#':`assets/${thumb?'thumb':guides?'guided':'clean'}/${p.id.toLowerCase()}-${views[j].key}${p.pov?'-hip':''}.png`;
const filename=(p,j)=>`${p.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${views[j].key}${guides?'-camera-guide':''}.png`;
const placeholder='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="320"%3E%3Crect width="240" height="320" fill="%23f4f5f2"/%3E%3Ctext x="120" y="164" text-anchor="middle" font-family="Arial" font-size="10" fill="%23949f99"%3EDrawing pose…%3C/text%3E%3C/svg%3E';
function image(p,j,{thumb=false,eager=false}={}){
 const id=poses.indexOf(p),alt=`${p.name} — ${p.areaLabel}, ${views[j].name}, head to thighs${p.pov?', outer buttock contact':''}`;
 return `<img src='${p.generated?placeholder:asset(p,j,thumb)}' width="600" height="800" loading="${eager?'eager':'lazy'}" decoding="async" draggable="${!thumb&&!p.generated}" alt="${thumb?'':escape(alt)}" data-image-pose="${id}" data-image-view="${j}" data-thumb="${thumb?1:0}" ${p.generated?`data-generate="1" data-guides="${guides?1:0}" aria-busy="true"`:''}>`;
}
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);paint(entry.target);}}, {rootMargin:'220px'});
async function paint(img){
 if(!img.isConnected)return;
 const p=poses[Number(img.dataset.imagePose)],j=Number(img.dataset.imageView),thumb=img.dataset.thumb==='1',guide=img.dataset.guides==='1';
 try{const item=await PoseRaster.request(p,j,guide,thumb);if(!img.isConnected)return;img.src=item.url;img.draggable=!thumb;img.setAttribute('aria-busy','false');img.dataset.ready='1';imageBlobs.set(img,item.blob);if(!thumb){const anchor=img.closest('[data-open]');if(anchor)anchor.href=item.url;}}
 catch{if(img.isConnected){img.alt='Image could not load. Choose the angle again to retry.';img.setAttribute('aria-busy','false');}}
}
function loadImages(scope){scope.querySelectorAll('img[data-generate]').forEach(img=>observer.observe(img));}
function angles(i,detail=false){return views.map((v,j)=>`<button type="button" data-pose="${i}" data-view="${j}" class="${states[i]===j?'active':''}" aria-pressed="${states[i]===j}" aria-label="${escape(v.name)} angle: ${escape(poses[i].name)}">${detail?'':`<span class="angle-thumb" aria-hidden="true">${image(poses[i],j,{thumb:true})}</span>`}<span>${v.name}</span></button>`).join('');}
function matched(p){const category=$('category').value,query=$('search').value.trim().toLowerCase();return groups[activeFilter](p)&&(category==='all'||p.category===category)&&(activeArea==='all'||p.areaIds.includes(activeArea))&&(!query||`${p.name} ${p.id} ${p.category} ${p.areaLabel} ${p.cue} ${p.pov?'pov hand buttock hip contact':''}`.toLowerCase().includes(query));}
function filtered(){return displayOrder.filter(i=>matched(poses[i]));}
function render(){
 observer.disconnect();const matches=filtered();page=Math.max(0,Math.min(page,Math.ceil(matches.length/pageSize)-1));
 $('gallery').innerHTML=matches.slice(page*pageSize,(page+1)*pageSize).map((i,at)=>{const p=poses[i];return `<article class="pose" data-areas="${p.areaIds.join(' ')}"><a class="art-button" href="${asset(p,states[i])}" data-open="${i}" aria-label="Enlarge ${escape(p.name)}">${image(p,states[i],{eager:at<4})}${p.pov?'<span class="pov-badge">POV · outer buttock</span>':''}</a>${areaInfo(p)}<div class="pose-meta"><span class="pose-id">${p.id}</span><h2>${escape(p.name)}</h2></div><div class="pose-subline"><span class="tag">${title(p)}</span><span class="framing-label">Head → thighs</span></div><div class="angles">${angles(i)}</div><div class="camera-note"><span>${p.camera}° · ${escape(p.level)}</span><a class="download-png" href="${asset(p,states[i])}" download="${filename(p,states[i])}" data-download="${i}" aria-label="Download PNG of ${escape(p.name)}">PNG ↓</a></div><p class="cue">${escape(p.cue)}</p></article>`;}).join('');
 $('result-count').textContent=`${matches.length} ${matches.length===1?'pose':'poses'} · ${matches.length*5} views`;$('no-results').hidden=matches.length!==0;
 $('page-info').textContent=matches.length?`${page*pageSize+1}–${Math.min(matches.length,(page+1)*pageSize)} of ${matches.length} poses · Page ${page+1} / ${Math.ceil(matches.length/pageSize)}`:'0 poses';
 $('page-previous').disabled=page===0;$('page-next').disabled=(page+1)*pageSize>=matches.length;$('pagination').hidden=matches.length===0;
 loadImages($('gallery'));if($('detail').open)loadImages($('detail'));
}
function detail(){const p=poses[selected],j=states[selected];$('detail-title').textContent=`${p.id} · ${p.name}`;$('detail-area').innerHTML=areaInfo(p);$('detail-art').innerHTML=image(p,j,{eager:true});$('detail-angles').innerHTML=angles(selected,true);$('detail-cue').textContent=p.cue;$('download-detail').href=asset(p,j);$('download-detail').download=filename(p,j);$('download-detail').dataset.download=selected;$('detail-framing').textContent=`${views[j].name} · Head to thighs${p.pov?' · Outer buttock contact':''} · 1200 × 1600 PNG`;$('edit-pose').hidden=!Number.isInteger(p.editor);if(Number.isInteger(p.editor))$('edit-pose').href=`studio.html?pose=${p.editor}`;loadImages($('detail'));}
function syncFilters(){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===activeFilter);b.setAttribute('aria-pressed',b.dataset.filter===activeFilter);});}
document.querySelectorAll('[data-filter]').forEach(b=>{const count=poses.filter(groups[b.dataset.filter]).length;b.querySelector('small').textContent=b.dataset.filter==='all'?`${count} poses · ${count*5} views`:`${count} poses`;});
for(const area of areas){const count=poses.filter(p=>area.id==='all'||p.areaIds.includes(area.id)).length;const html=`<button type="button" data-area="${area.id}" aria-label="Area: ${area.label}" aria-pressed="${area.id==='all'}" class="area-choice${area.id==='all'?' active':''}">${areaIcon(area.icon)}<span><strong>${area.label}</strong><small>${count} poses</small></span></button>`;$(area.secondary?'area-more':'area-grid').insertAdjacentHTML('beforeend',html);}
async function download(link,i){const p=poses[i];if(!p.generated)return;link.setAttribute('aria-busy','true');const old=link.textContent;link.textContent='Preparing PNG…';try{const item=await PoseRaster.request(p,states[i],guides);const a=document.createElement('a');a.href=item.url;a.download=filename(p,states[i]);a.click();}catch{link.textContent='Retry PNG ↓';}finally{link.removeAttribute('aria-busy');if(link.textContent==='Preparing PNG…')link.textContent=old;}}
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-open]'),view=e.target.closest('[data-view]'),filter=e.target.closest('[data-filter]'),area=e.target.closest('[data-area]'),save=e.target.closest('[data-download]');
 if(save&&poses[Number(save.dataset.download)].generated){e.preventDefault();download(save,Number(save.dataset.download));return;}
 if(open){e.preventDefault();if(dragging)return;selected=Number(open.dataset.open);detail();$('detail').showModal();}
 if(view){states[Number(view.dataset.pose)]=Number(view.dataset.view);if($('detail').open)detail();else render();}
 if(filter){activeFilter=filter.dataset.filter;$('category').value='all';page=0;syncFilters();render();}
 if(area){activeArea=area.dataset.area;page=0;syncAreas();render();}
});
async function prepareDrag(img){if(!img||img.dataset.thumb==='1'||imageBlobs.has(img)||blobCache.has(img.src)||img.dataset.generate)return;const url=img.src;blobCache.set(url,null);try{const response=await fetch(url);if(!response.ok)throw Error();const blob=await response.blob();if(blobCache.size>20)blobCache.delete(blobCache.keys().next().value);blobCache.set(url,blob);}catch{blobCache.delete(url);}}
for(const event of ['pointerover','pointerdown'])document.addEventListener(event,e=>prepareDrag(e.target.closest('img[data-image-pose]')));
document.addEventListener('dragstart',e=>{const img=e.target.closest('img[data-image-pose]');if(!img||img.dataset.thumb==='1'||!e.dataTransfer)return;if(img.dataset.generate&&!img.dataset.ready){e.preventDefault();return;}dragging=true;const p=poses[Number(img.dataset.imagePose)],j=Number(img.dataset.imageView),name=filename(p,j),url=img.currentSrc||img.src;e.dataTransfer.effectAllowed='copy';e.dataTransfer.setData('DownloadURL',`image/png:${name}:${url}`);e.dataTransfer.setData('text/uri-list',url);e.dataTransfer.setData('text/plain',url);e.dataTransfer.setData('text/html',`<img src="${url}" alt="${escape(p.name)}">`);const blob=imageBlobs.get(img)||blobCache.get(img.src);if(blob)try{e.dataTransfer.items.add(new File([blob],name,{type:'image/png'}));}catch{} });
document.addEventListener('dragend',()=>setTimeout(()=>dragging=false,120));
$('guides').addEventListener('change',()=>{guides=$('guides').checked;render();if($('detail').open)detail();});
$('close').addEventListener('click',()=>$('detail').close());
$('detail').addEventListener('close',render);
$('search').addEventListener('input',()=>{page=0;render();});
$('category').addEventListener('change',()=>{page=0;activeFilter='all';syncFilters();render();});
$('reset-filters').addEventListener('click',()=>{activeFilter=activeArea='all';page=0;$('category').value='all';$('search').value='';syncAreas();syncFilters();render();});
$('global-angles').addEventListener('click',e=>{const b=e.target.closest('[data-angle]');if(!b)return;document.querySelectorAll('[data-angle]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',el===b);});states.fill(Math.max(0,Number(b.dataset.angle)));render();});
function step(delta){const visible=filtered(),at=visible.indexOf(selected);selected=visible[(at+delta+visible.length)%visible.length]??selected;detail();}
$('previous').addEventListener('click',()=>step(-1));$('next').addEventListener('click',()=>step(1));
$('detail').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'&&!e.target.closest('button'))step(-1);if(e.key==='ArrowRight'&&!e.target.closest('button'))step(1);});
for(const [id,delta]of[['page-previous',-1],['page-next',1]])$(id).addEventListener('click',()=>{page+=delta;render();$('gallery').scrollIntoView({block:'start',behavior:'instant'});});
render();
})();
