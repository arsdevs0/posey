(function(root){
'use strict';
const catalog=typeof module!=='undefined'?require('./pose-expansion.js'):root.PoseCatalog;
const areas=[
 {id:'all',label:'All Areas',icon:'home',description:'Every homely moment'},
 {id:'living',label:'Living Room',icon:'living',description:'Slow afternoons & conversations'},
 {id:'bedroom',label:'Bedroom',icon:'bedroom',description:'Quiet mornings & getting ready'},
 {id:'kitchen',label:'Kitchen',icon:'kitchen',description:'Coffee, breakfast & everyday pauses'},
 {id:'bed',label:'On Bed',icon:'bed',description:'Sitting, resting & reclining'},
 {id:'sofa',label:'On Sofa',icon:'sofa',description:'Lounge, lean back & get comfortable'},
 {id:'floor',label:'On Floor',icon:'floor',description:'Rugs, cushions & low tables',secondary:true},
 {id:'window',label:'By Window',icon:'window',description:'Curtains, light & window seats',secondary:true},
 {id:'balcony',label:'Balcony',icon:'window',description:'A little fresh air',secondary:true},
 {id:'hallway',label:'Hallway',icon:'door',description:'Walks & doorway pauses',secondary:true}
];
const surfaceLabels={bed:'On Bed',sofa:'On Sofa',floor:'On Floor',chair:'On Chair',armchair:'On Armchair',stool:'On Stool',counter:'At Counter',window:'By Window','window-seat':'On Window Seat',mirror:'By Mirror',doorway:'In Doorway',room:'In Room'};
const familySurfaces={'Window light':'window','Getting ready':'mirror','Kitchen morning':'counter','Balcony breeze':'room','Hallway steps':'doorway','Across the living room':'room','At the counter':'counter','Windowsill pause':'window','Doorframe pause':'doorway','Sofa corner':'sofa','Breakfast chair':'chair','Armchair afternoon':'armchair','Seat by the window':'window-seat','Dressing stool':'stool','On the rug':'floor','Floor cushion':'floor','Beside the low table':'floor','Bedside morning':'bed','Cross-legged comfort':'bed','Against the pillows':'bed','Side-lying afternoon':'bed','Pillow-side pause':'bed'};
for(const p of catalog.poses){
 const number=Number(p.id.slice(1));
 if(number<=60){
  p.room=p.bed?'Bedroom':[2,5,11].includes(number)?'Bedroom':[7,15,19,20,25].includes(number)?'Hallway':[27,30].includes(number)?'Kitchen':'Living Room';
  p.surface=p.bed?'bed':p.category==='floor'?'floor':[29,34,36,37,38,39,40].includes(number)?'sofa':p.seat?'chair':[1,12,24,28].includes(number)?'window':number===27?'counter':[19,25].includes(number)?'doorway':number===2?'mirror':'room';
 }else{p.surface=p.surface||familySurfaces[p.family]||(p.bed?'bed':p.category==='floor'?'floor':p.seat?'chair':'room');}
 const byWindow=p.room==='Window corner'||['window','window-seat'].includes(p.surface);
 if(p.room==='Window corner'||p.room==='Living room'||p.room==='Around the home')p.room='Living Room';
 const roomId=({'Living Room':'living',Bedroom:'bedroom',Kitchen:'kitchen',Balcony:'balcony',Hallway:'hallway'})[p.room]||'living';
 p.areaIds=[roomId];if(['bed','sofa','floor'].includes(p.surface))p.areaIds.push(p.surface);if(byWindow)p.areaIds.push('window');
 p.placement=surfaceLabels[p.surface]||'In Room';p.areaLabel=`${p.room} · ${p.placement}`;
 // All visible PNGs now use the same current illustration and location caption.
 p.generated=true;
}
catalog.areas=areas;
if(typeof module!=='undefined')module.exports=catalog;
})(typeof window!=='undefined'?window:globalThis);
