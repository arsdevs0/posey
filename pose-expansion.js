(function(root){
'use strict';
const catalog=typeof module!=='undefined'?require('./pose-catalog.js'):root.PoseCatalog;
if(catalog.poses.length>60){if(typeof module!=='undefined')module.exports=catalog;return;}
const {poses}=catalog,copy=x=>JSON.parse(JSON.stringify(x));
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,k)=>a.map(v=>v*k),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),len=a=>Math.hypot(...a),unit=a=>mul(a,1/(len(a)||1));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const families=[
 ['Window light',0,'Window corner','standing',{hip:[.055,.92,0],shoulder:[-.018,1.43,.035],headYaw:-25}],
 ['Getting ready',3,'Bedroom','standing',{hip:[-.025,.93,0],shoulder:[.035,1.44,.01],yaw:18}],
 ['Kitchen morning',11,'Kitchen','standing',{hip:[.02,.91,-.055],shoulder:[0,1.42,.06],yaw:-12}],
 ['Balcony breeze',8,'Balcony','standing',{hip:[.065,.91,0],shoulder:[-.025,1.41,.015],yaw:24}],
 ['Hallway steps',14,'Hallway','walking',{yaw:-16}],
 ['Across the living room',17,'Living room','walking',{hip:[.06,.92,.015],shoulder:[-.02,1.42,.05],lk:[-.14,.52,-.07],la:[-.19,.1,-.22],rk:[.16,.52,.17],ra:[.20,.1,.34],yaw:22}],
 ['At the counter',26,'Kitchen','leaning',{shoulder:[.045,1.34,.22],hip:[0,.91,-.09],yaw:12}],
 ['Windowsill pause',23,'Window corner','leaning',{shoulder:[-.085,1.37,.14],hip:[.02,.91,-.02],yaw:-22}],
 ['Doorframe pause',22,'Hallway','leaning',{shoulder:[.12,1.40,.02],hip:[-.03,.91,0],yaw:25}],
 ['Sofa corner',28,'Living room','seated',{hip:[-.015,.56,0],shoulder:[-.045,1.07,.13],yaw:14}],
 ['Breakfast chair',29,'Kitchen','seated',{hip:[0,.59,0],shoulder:[.025,1.1,.07],yaw:-18}],
 ['Armchair afternoon',33,'Living room','seated',{hip:[.015,.57,0],shoulder:[-.025,1.07,-.075],yaw:28}],
 ['Seat by the window',30,'Window corner','seated',{shoulder:[.055,1.08,.10],yaw:-27}],
 ['Dressing stool',38,'Bedroom','seated',{hip:[.025,.62,0],shoulder:[-.015,1.13,.08],yaw:10}],
 ['On the rug',40,'Living room','floor',{shoulder:[-.035,.77,.09],yaw:16}],
 ['Floor cushion',42,'Living room','floor',{shoulder:[.04,.76,.04],yaw:-20}],
 ['Beside the low table',44,'Living room','floor',{shoulder:[-.045,.74,.02],yaw:24}],
 ['Bedside morning',56,'Bedroom','bed',{shoulder:[.035,1.10,.1],yaw:-14}],
 ['Cross-legged comfort',57,'Bedroom','bed',{shoulder:[-.035,1.22,.08],yaw:21}],
 ['Against the pillows',58,'Bedroom','bed',{shoulder:[-.035,1.01,-.26],yaw:-15}],
 ['Side-lying afternoon',53,'Bedroom','bed',{yaw:12}],
 ['Pillow-side pause',48,'Bedroom','bed',{yaw:-15}],
 ['At the sofa end',28,'Living room','seated',{hip:[.065,.58,.01],shoulder:[.025,1.09,.10],yaw:-21,surface:'sofa'}],
 ['Legs folded on the sofa',57,'Living room','seated',{hip:[0,.61,0],shoulder:[-.025,1.12,.09],lk:[-.35,.52,.28],la:[.1,.45,.40],rk:[.35,.53,.27],ra:[-.1,.45,.40],bed:false,seat:true,yaw:16,surface:'sofa'}],
 ['Sinking into the sofa',58,'Living room','seated',{hip:[.015,.55,.02],shoulder:[-.035,.98,-.22],bed:false,seat:true,yaw:22,surface:'sofa'}],
 ['Sideways on the sofa',30,'Living room','seated',{hip:[.035,.58,0],shoulder:[-.02,1.08,.08],lk:[.12,.46,.38],la:[.32,.12,.51],rk:[.37,.46,.33],ra:[.48,.11,.50],yaw:-32,surface:'sofa'}],
 ['One knee on the sofa',41,'Living room','seated',{hip:[0,.57,0],shoulder:[.035,1.06,.12],lk:[-.17,.91,.30],la:[-.18,.47,.51],rk:[.22,.48,.41],ra:[.24,.10,.55],bed:false,seat:true,yaw:18,surface:'sofa'}],
 ['A sofa-side recline',53,'Living room','seated',{bed:false,seat:false,reclining:true,yaw:-18,surface:'sofa'}],
 ['Resting along the sofa',49,'Living room','seated',{bed:false,seat:false,reclining:true,yaw:32,surface:'sofa'}],
 ['An evening by the television',33,'Living room','seated',{hip:[-.025,.59,0],shoulder:[.035,1.09,-.055],yaw:-9,surface:'sofa'}],
 ['Cushions around the rug',42,'Living room','floor',{hip:[-.035,.29,.02],shoulder:[.045,.80,.06],lk:[-.33,.17,.30],rk:[.34,.16,.23],yaw:31,surface:'floor'}],
 ['Tea at the dining table',29,'Kitchen','seated',{hip:[-.02,.61,0],shoulder:[-.045,1.12,.10],yaw:25,surface:'chair'}],
 ['Turned on the dining chair',30,'Kitchen','seated',{hip:[.035,.60,0],shoulder:[.075,1.11,.08],lk:[-.05,.48,.44],rk:[.27,.47,.38],yaw:-34,surface:'chair'}],
 ['The kitchen stool',38,'Kitchen','seated',{hip:[.02,.72,0],shoulder:[-.025,1.23,.06],lk:[-.18,.59,.38],la:[-.19,.20,.47],rk:[.19,.57,.41],ra:[.21,.20,.48],yaw:18,surface:'stool'}],
 ['Before breakfast',26,'Kitchen','leaning',{hip:[-.035,.93,-.08],shoulder:[.025,1.37,.22],yaw:-24,surface:'counter'}],
 ['Pausing by the coffee table',23,'Living room','leaning',{hip:[.05,.90,-.03],shoulder:[-.055,1.34,.18],yaw:26,surface:'counter'}],
 ['Lounging by the window',33,'Window corner','seated',{hip:[-.035,.58,0],shoulder:[.025,1.06,-.10],yaw:-35,surface:'window-seat'}],
 ['Between the curtains',11,'Window corner','standing',{hip:[-.06,.93,.015],shoulder:[.035,1.44,.02],yaw:-19,surface:'window'}],
 ['At the bedside corner',56,'Bedroom','bed',{hip:[.06,.60,.015],shoulder:[.02,1.12,.10],lk:[-.07,.49,.43],rk:[.24,.48,.46],yaw:28,surface:'bed'}],
 ['One knee against the duvet',41,'Bedroom','bed',{hip:[.025,.65,0],shoulder:[-.025,1.14,.13],lk:[-.16,.98,.31],la:[-.18,.53,.56],rk:[.26,.56,.37],ra:[.46,.52,.23],seat:false,bed:true,yaw:-21,surface:'bed'}],
 ['A diagonal pillow rest',53,'Bedroom','bed',{yaw:-29,headTilt:8,surface:'bed'}],
 ['Along the soft pillows',50,'Bedroom','bed',{yaw:27,surface:'bed'}],
 ['Settling on the duvet',57,'Bedroom','bed',{hip:[.035,.69,.015],shoulder:[.075,1.19,.10],lk:[-.33,.59,.32],la:[.15,.54,.41],rk:[.42,.59,.23],ra:[-.08,.53,.43],yaw:-26,surface:'bed'}],
 ['A moment by the mirror',3,'Bedroom','standing',{hip:[.065,.94,.01],shoulder:[.025,1.45,.025],yaw:-30,surface:'mirror'}],
 ['The wardrobe doorway',22,'Bedroom','leaning',{hip:[-.08,.93,0],shoulder:[.07,1.42,.02],yaw:-14,surface:'doorway'}],
 ['Turning through the hallway',18,'Hallway','walking',{hip:[-.055,.93,.02],shoulder:[.045,1.43,.05],lk:[-.18,.53,.15],la:[-.22,.10,.33],rk:[.12,.52,-.12],ra:[.19,.10,-.27],yaw:31,surface:'doorway'}],
 ['A seat on the balcony',28,'Balcony','seated',{hip:[-.03,.59,.015],shoulder:[.015,1.10,.07],lk:[-.21,.48,.43],rk:[.24,.49,.46],yaw:-29,surface:'chair'}]
];
// Wrist targets are expressed in the figure's shoulder frame: across, up, forward.
// Each gesture has its own target and elbow plane; two-bone IK preserves arm lengths.
const gestures=[
 {name:'an easy pause',l:[-.21,-.43,.10],r:[.23,-.42,.10],cue:'Shoulders loose rakho, ek breath lo aur naturally settle ho jaao.'},
 {name:'tucking a loose strand',l:[-.14,.15,.08],r:[.23,-.42,.08],cue:'Ek hand se baal ear ke peeche karo; chin ko halka side turn karo.',head:-18},
 {name:'one more sip',l:[-.075,-.15,.31],r:[.075,-.15,.31],prop:'cup',cue:'Cup ko casually paas laao, elbows relaxed rakho.',pitch:8},
 {name:'looking back at you',l:[-.24,-.42,.05],r:[.22,-.40,.06],cue:'Body ko wahi rakho, head se shoulder ke upar ek natural glance do.',head:48},
 {name:'checking a message',l:[-.075,-.23,.30],r:[.08,-.23,.30],prop:'phone',cue:'Phone par chhota message padho; shoulders ko neeche rakho.',pitch:21},
 {name:'a chapter in the quiet',l:[-.15,-.31,.31],r:[.15,-.31,.31],prop:'book',cue:'Book kholo aur page ki taraf nazar rakho.',pitch:22},
 {name:'a little stretch',l:[-.28,.38,.02],r:[.20,-.39,.09],cue:'Ek arm upar stretch karo, dusra loose rehne do.',head:12},
 {name:'listening closely',l:[-.17,-.39,.18],r:[.19,-.38,.19],cue:'Thoda sa aage lean karo, jaise kisi ki baat sun rahe ho.',tilt:8},
 {name:'adjusting the collar',l:[-.22,-.41,.08],r:[.10,-.08,.13],cue:'Collar ko softly adjust karo; movement ke beech ka moment lo.',head:-12},
 {name:'a half-finished story',l:[-.27,-.22,.33],r:[.25,-.13,.32],cue:'Ek chhoti baat bataao, haathon ko natural gestures karne do.',head:15},
 {name:'a thoughtful moment',l:[-.14,-.35,.22],r:[.03,.08,.15],cue:'Ek hand chin ke paas aane do; nazar camera se thodi side rakho.',head:-20},
 {name:'loosely folded arms',l:[.12,-.24,.20],r:[-.12,-.17,.23],cue:'Arms ko loosely fold karo, shoulders ko tight mat karo.',head:17},
 {name:'a relaxed side glance',l:[-.20,-.40,.11],r:[.24,-.35,.06],cue:'Weight halka sa ek side shift karo aur side mein dekho.',head:-33},
 {name:'a hand behind the head',l:[-.13,.13,-.12],r:[.22,-.40,.13],cue:'Ek hand head ke peeche rest karo aur elbow open rakho.',tilt:-7},
 {name:'a small hello',l:[-.23,-.40,.1],r:[.31,.10,.23],cue:'Ek chhota relaxed wave do, elbow ko softly bend rakho.',head:10},
 {name:'holding the quiet',l:[-.045,-.39,.19],r:[.045,-.39,.21],cue:'Hands ko loosely paas rakho aur nazar neeche aane do.',pitch:13},
 {name:'moving the phone aside',l:[-.22,-.40,.1],r:[.28,-.27,.20],prop:'phoneone',cue:'Phone ko ek side karte hue saamne wale ki taraf dekho.',head:24},
 {name:'a gentle turn',l:[-.20,-.39,.16],r:[.24,-.37,.19],cue:'Head aur shoulders se gentle turn do; pose ko force mat karo.',head:36},
 {name:'smoothing a sleeve',l:[.16,-.26,.16],r:[.24,-.39,.12],cue:'Dusre arm ki sleeve ko casually smooth karo.',pitch:9},
 {name:'stretching both arms',l:[-.21,.39,.035],r:[.21,.39,.035],cue:'Dono arms ko stretch karo aur body ko aaram se settle hone do.',pitch:-7}
];
function solveArm(shoulder,target,hint){
 const distance=Math.min(.505,Math.max(.075,len(sub(target,shoulder)))),direction=unit(sub(target,shoulder)),wrist=add(shoulder,mul(direction,distance));
 const upper=.265,lower=.255,along=(upper*upper-lower*lower+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 let bend=sub(sub(hint,shoulder),mul(direction,dot(sub(hint,shoulder),direction)));
 if(len(bend)<.001)bend=cross(direction,[0,0,1]);
 return {w: wrist,e:add(add(shoulder,mul(direction,along)),mul(unit(bend),height))};
}
for(let f=0;f<families.length;f++){
 const [family,seed,room,category,mods]=families[f];
 for(let g=0;g<gestures.length;g++){
  const gesture=gestures[g],p={...copy(poses[seed]),...copy(mods)};
  for(const key of ['editor','prop','sleep','pov','reach'])delete p[key];
  const reclined=p.reclining||(p.bed&&len(sub(p.shoulder,p.hip))>.4&&Math.abs(p.shoulder[1]-p.hip[1])<.26);
  let B=unit(sub(p.shoulder,p.hip)),A=unit(sub(p.across,mul(B,dot(p.across,B)))),C=unit(cross(A,B));
  // Reclines use different torso support and knee bends for each setting.
  if(family==='A sofa-side recline'){
   p.shoulder=add(p.shoulder,add(mul(A,-.045),mul(C,.075)));p.lk=add(p.lk,mul(C,.08));p.la=add(p.la,mul(C,.16));
  }else if(family==='A diagonal pillow rest'){
   p.shoulder=add(p.shoulder,add(mul(A,.055),mul(C,.02)));p.rk=add(p.rk,add(mul(B,.045),mul(C,.10)));p.ra=add(p.ra,mul(C,.16));
  }else if(family==='Along the soft pillows'){
   p.shoulder=add(p.shoulder,add(mul(A,-.035),mul(C,.055)));p.lk=add(p.lk,add(mul(A,-.04),mul(C,.11)));p.la=add(p.la,mul(C,.19));
  }
  const stance=g%5;
  // Five lower-body arrangements per family: weight shift, ankle cross, stagger,
  // open seat / folded knees, and a settled asymmetry. No random coordinate jitter.
  if(category==='standing'||category==='leaning'){
   if(stance===1){p.lk=add(p.lk,mul(A,.08));p.la=add(p.la,mul(A,.20));}
   if(stance===2){p.rk=add(p.rk,mul(C,.12));p.ra=add(p.ra,mul(C,.23));}
   if(stance===3){p.hip=add(p.hip,mul(A,.045));p.shoulder=add(p.shoulder,mul(A,-.018));}
   if(stance===4){p.lk=add(p.lk,mul(A,-.055));p.la=add(p.la,mul(A,-.085));}
  }else if(category==='walking'){
   const stride=[.06,.16,-.10,.23,-.17][stance];
   p.lk=add(p.lk,mul(C,stride*.55));p.la=add(p.la,mul(C,stride));
   p.rk=add(p.rk,mul(C,-stride*.55));p.ra=add(p.ra,mul(C,-stride));
  }else if(!reclined){
   if(stance===1){p.rk=add(p.rk,mul(A,.07));p.ra=add(p.ra,mul(A,.10));}
   if(stance===2&&category!=='floor'){p.la=add(p.rk,mul(B,.06));p.lk=add(p.lk,mul(B,.065));}
   if(stance===3){p.lk=add(p.lk,mul(C,.065));p.la=add(p.la,mul(C,.12));}
   if(stance===4){p.shoulder=add(p.shoulder,mul(C,.065));}
  }else{
   p.lk=add(p.lk,add(mul(B,[0,.05,.10,.14,.08][stance]),mul(C,[0,.09,.14,.20,.10][stance])));
   p.la=add(p.la,mul(C,[0,.13,.23,.29,.17][stance]));
   p.rk=add(p.rk,mul(C,[0,.06,.12,.08,.18][stance]));
  }
  if(g===7)p.shoulder=add(p.shoulder,mul(C,.06));
  if(g===17)p.shoulder=add(p.shoulder,mul(A,.045));
  B=unit(sub(p.shoulder,p.hip));A=unit(sub(p.across,mul(B,dot(p.across,B))));C=unit(cross(A,B));p.across=A;
  const local=q=>add(p.shoulder,add(mul(A,q[0]),add(mul(B,q[1]),mul(C,q[2]))));
  for(const [side,sign]of[['l',-1],['r',1]]){
   let q=[...gesture[side]];
   // Lap-level hands sit forward of the thighs rather than intersecting a seat.
   if(!reclined&&['seated','floor','bed'].includes(category)&&q[1]<-.34)q[2]=Math.max(q[2],.30);
   const shoulder=local([sign*.203,-.05,0]),target=local(q),hint=local([sign*.36,q[1]>.1?.16:-.25,q[1]>.1?-.02:.09]);
   const arm=solveArm(shoulder,target,hint);p[side+'w']=arm.w;p[side+'e']=arm.e;
  }
  p.headYaw=gesture.head??[-16,12,-8,19,-12][stance];p.headPitch=gesture.pitch??[3,0,6,-3,4][stance];p.headTilt=gesture.tilt??[0,4,-4,2,-2][stance];
  if(gesture.prop)p.prop=gesture.prop;
  p.id=`P${String(poses.length+1).padStart(3,'0')}`;p.name=`${family} · ${gesture.name}`;p.family=family;p.room=room;p.category=category;p.cue=gesture.cue;p.generated=true;
  p.pov=f<22&&[0,12].includes(g);p.reach=f%2?'lw':'rw';p.contact=p.pov?'outer-buttock':null;
  p.camera=p.camera||30;if(p.pov)p.cue+=' POV hand outer buttock par naturally rest kare.';
  poses.push(p);
 }
}
for(const p of poses){p.room??=p.bed?'Bedroom':p.category==='floor'||p.category==='seated'?'Living room':'Around the home';}
if(typeof module!=='undefined')module.exports=catalog;
})(typeof window!=='undefined'?window:globalThis);
