(function(root){
'use strict';
const cache=new Map(),pending=new Map(),queue=[];let active=0,bytes=0;
const budget=32*1024*1024;
function key(p,j,guides,thumb){return `${p.id}:${j}:${guides?1:0}:${thumb?1:0}`;}
function trim(){let attempts=cache.size;while(bytes>budget&&cache.size>30&&attempts--){const [id,item]=cache.entries().next().value;cache.delete(id);if(document.querySelector(`img[src="${item.url}"]`)){cache.set(id,item);continue;}bytes-=item.blob.size;URL.revokeObjectURL(item.url);}}
function run(){while(active<3&&queue.length){active++;const task=queue.shift();task().finally(()=>{active--;run();});}}
function request(p,j,guides,thumb=false){
 const id=key(p,j,guides,thumb);if(cache.has(id)){const item=cache.get(id);cache.delete(id);cache.set(id,item);return Promise.resolve(item);}if(pending.has(id))return pending.get(id);
 const promise=new Promise((resolve,reject)=>queue.push(async()=>{
  let source;
  try{
   const svg=root.PoseArt.render(p,root.PoseCatalog.views[j],{guides:thumb?false:guides});
   source=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
   const sourceImage=new Image();sourceImage.src=source;await sourceImage.decode();
   const canvas=document.createElement('canvas');canvas.width=thumb?240:1200;canvas.height=thumb?320:1600;
   const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(sourceImage,0,0,canvas.width,canvas.height);
   const blob=await new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(Error('PNG conversion failed')),'image/png'));
   canvas.width=canvas.height=1;
   const item={blob,url:URL.createObjectURL(blob)};cache.set(id,item);bytes+=blob.size;trim();resolve(item);
  }catch(error){reject(error);}finally{if(source)URL.revokeObjectURL(source);pending.delete(id);}
 }));
 pending.set(id,promise);run();return promise;
}
root.PoseRaster={request};
})(window);
