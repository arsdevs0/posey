(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const standing={hip:[.025,.92,0],shoulder:[-.015,1.43,.02],le:[-.28,1.13,.02],lw:[-.23,.91,.05],re:[.28,1.13,.02],rw:[.24,.91,.06],lk:[-.13,.52,0],la:[-.14,.10,0],rk:[.15,.51,.08],ra:[.18,.1,.12],across:[1,0,0],headYaw:0,headPitch:0,headTilt:0};
const seated={...standing,hip:[0,.56,0],shoulder:[0,1.08,.09],le:[-.3,.80,.18],lw:[-.22,.63,.40],re:[.3,.80,.18],rw:[.22,.63,.40],lk:[-.19,.47,.47],la:[-.22,.1,.56],rk:[.2,.47,.47],ra:[.23,.1,.56],seat:true};
const floor={...seated,hip:[0,.26,0],shoulder:[0,.77,.07],le:[-.3,.54,.17],lw:[-.22,.35,.31],re:[.3,.54,.17],rw:[.22,.35,.31],lk:[-.40,.17,.28],la:[.12,.10,.39],rk:[.40,.17,.28],ra:[-.12,.10,.39],seat:false};
const poses=[];
function add(name,category,mods,cue,options={}){const base=category==='seated'?seated:category==='floor'?floor:standing;poses.push({...clone(base),...clone(mods),id:`P${String(poses.length+1).padStart(3,'0')}`,name,category,cue,camera:options.camera||30,level:options.level||'Eye level',...options});}
// Fourteen distinct standing gestures.
add('Window-side tea','standing',{le:[-.31,1.14,.04],lw:[-.12,1.28,.28],re:[.3,1.13,.09],rw:[.10,1.27,.29],headYaw:-28,headTilt:6},'Cup pakdo, weight ek pair par aur window ki taraf dekho.',{prop:'cup',editor:0});
add('Tuck the loose strand','standing',{le:[-.35,1.19,.06],lw:[-.12,1.58,.07],headYaw:20,headTilt:-8},'Baalo ko ear ke peeche karo; movement ke beech pause mat karo.');
add('A quiet over-shoulder look','standing',{shoulder:[.035,1.43,-.03],headYaw:-58,headTilt:3,re:[.31,1.13,-.13],rw:[.13,.97,-.17]},'Body ko halka turn karo, phir shoulder ke upar se dekho.',{yaw:28});
add('Hands loosely clasped','standing',{le:[-.27,1.10,.09],lw:[-.06,.98,.21],re:[.26,1.11,.09],rw:[.06,.99,.23],headPitch:8},'Haath waist ke paas loosely jodo. Shoulders neeche rakho.');
add('The morning stretch','standing',{le:[-.30,1.70,0],lw:[-.13,1.99,.015],re:[.3,1.70,0],rw:[.13,1.99,.015],headPitch:-10},'Dono haath upar stretch karo aur body ko relax hone do.');
add('Checking a message','standing',{le:[-.28,1.16,.08],lw:[-.09,1.22,.31],re:[.28,1.16,.08],rw:[.10,1.22,.30],headPitch:20},'Phone par ek message padho; camera ki taraf mat dekho.',{prop:'phone'});
add('Bag on the shoulder','standing',{re:[.32,1.20,.03],rw:[.18,1.43,.11],headYaw:-18,hip:[.06,.92,0]},'Bag ki strap ko adjust karo aur dusri taraf dekho.',{prop:'bag'});
add('Half-hidden smile','standing',{re:[.27,1.25,.10],rw:[.025,1.53,.20],headTilt:-10,headPitch:4},'Haste hue ek haath naturally mouth ke paas laao.');
add('Listening on a call','standing',{re:[.35,1.22,.02],rw:[.11,1.58,.055],headYaw:-12,headTilt:7},'Phone ear ke paas rakho aur sunte hue weight shift karo.',{prop:'earphone'});
add('Easy folded arms','standing',{le:[-.28,1.17,.09],lw:[.14,1.23,.23],re:[.28,1.13,.10],rw:[-.15,1.18,.25],headYaw:16},'Arms ko gently fold karo; elbows aur shoulders tight mat karo.');
add('Fixing a sleeve','standing',{le:[-.25,1.12,.17],lw:[.13,1.09,.27],re:[.30,1.15,.13],rw:[.29,1.0,.30],headPitch:18},'Sleeve ko ek baar fold karo aur haathon ki taraf dekho.');
add('Reaching for the curtain','standing',{le:[-.43,1.47,.04],lw:[-.59,1.72,.08],headYaw:-35,re:[.25,1.12,.08],rw:[.15,.95,.17]},'Ek haath se curtain ki taraf reach karo, chin halka turn karo.');
add('Book against the chest','standing',{le:[-.31,1.13,.06],lw:[.02,1.17,.24],re:[.29,1.12,.09],rw:[-.04,1.34,.26],headYaw:27},'Book ko loosely hold karo aur kisi ki baat suno.',{prop:'closedbook'});
add('Letting the shoulders drop','standing',{hip:[-.05,.91,0],shoulder:[.02,1.41,.01],le:[-.28,1.1,0],lw:[-.28,.86,.03],re:[.3,1.13,0],rw:[.31,.91,.02],headTilt:9},'Ek slow breath lo, shoulders drop karo aur side mein dekho.');
// Eight walking and turning moments.
const stride={lk:[-.14,.53,.24],la:[-.17,.10,.44],rk:[.14,.54,-.20],ra:[.15,.13,-.38],le:[-.28,1.12,-.15],lw:[-.23,.93,-.29],re:[.28,1.15,.17],rw:[.23,.96,.32]};
add('Walk & glance back','walking',{...stride,headYaw:-55,headTilt:4},'Dheere chalo aur ek baar kandhe ke upar se dekho.',{yaw:28,editor:2});
add('A small wave','walking',{...stride,re:[.38,1.38,.12],rw:[.38,1.67,.15],headYaw:15},'Chalte hue kisi pehchaan wale ko chhota sa wave do.');
add('Walking with a book','walking',{...stride,le:[-.25,1.15,.13],lw:[-.1,1.10,.27],re:[.27,1.15,.12],rw:[.1,1.1,.27],headYaw:-18},'Book dono haathon mein rakho aur ek slow step lo.',{prop:'closedbook'});
add('Look down between steps','walking',{...stride,headPitch:20,headYaw:7},'Apne agle step ki taraf dekho; chin ko force mat karo.');
add('Turn at the doorway','walking',{...stride,hip:[.055,.92,0],shoulder:[-.02,1.42,.03],headYaw:46,re:[.31,1.17,-.10],rw:[.35,.95,-.11]},'Doorway se guzarte hue body ko ek gentle turn do.',{yaw:-22});
add('Hair caught in motion','walking',{...stride,le:[-.33,1.2,.03],lw:[-.12,1.56,.02],headYaw:25,headTilt:-7},'Ek haath baalon mein le jaao aur walking pace slow rakho.');
add('Phone in one hand','walking',{...stride,re:[.30,1.2,.13],rw:[.18,1.31,.29],headPitch:15},'Phone par nazar daalte hue ek relaxed step lo.',{prop:'phoneone'});
add('Pause after the last step','walking',{...stride,lk:[-.13,.51,.16],la:[-.15,.1,.26],rk:[.15,.52,-.09],ra:[.18,.1,-.17],headYaw:-22,le:[-.25,1.14,0],lw:[-.2,.95,.08]},'Chalna roko, par pose hold mat karo. Last step ka pause lo.');
// Six leaning poses.
add('Shoulder against the wall','leaning',{hip:[.13,.9,0],shoulder:[-.10,1.41,.01],headTilt:10,le:[-.3,1.12,-.02],lw:[-.26,.91,.02]},'Ek shoulder support par rakho aur hips ko relaxed chhodo.',{support:'wall'});
add('One hand on the ledge','leaning',{shoulder:[-.08,1.38,.14],le:[-.39,1.10,.26],lw:[-.44,.94,.36],headYaw:-22},'Ek haath ledge par tikaao aur thoda sa forward lean karo.',{support:'ledge'});
add('Resting in the doorway','leaning',{le:[-.47,1.48,.01],lw:[-.54,1.78,.02],hip:[.07,.91,0],shoulder:[-.04,1.42,0],headYaw:18},'Forearm doorframe par rakho; camera se thoda side dekho.',{support:'wall'});
add('Crossed ankles, easy lean','leaning',{hip:[.1,.91,0],shoulder:[-.07,1.41,-.03],lk:[-.02,.50,.08],la:[.12,.1,.13],rk:[.12,.52,-.02],ra:[-.04,.1,-.03],headYaw:-25},'Ankles lightly cross karo aur weight support par chhodo.',{support:'wall'});
add('A thought over the counter','leaning',{hip:[0,.91,-.12],shoulder:[0,1.32,.26],le:[-.3,1.03,.38],lw:[-.1,1.12,.52],re:[.3,1.03,.38],rw:[.1,1.12,.52],headPitch:8},'Forearms counter par rest karo; baat sunte hue neeche dekho.',{support:'ledge'});
add('Looking out, looking back','leaning',{shoulder:[.06,1.39,.07],re:[.37,1.14,.09],rw:[.45,.98,.20],headYaw:-49,headTilt:4},'Ek haath support par rakho aur sirf head ko peeche turn karo.',{support:'ledge'});
// Twelve seated moments, six with a photographer's reaching hand.
add('Sofa-side conversation','seated',{shoulder:[-.02,1.07,.16],re:[.3,.91,.09],rw:[.36,1.07,.16],headYaw:13},'Baith kar thoda aage lean karo aur naturally baat karte raho.',{editor:1});
add('One more sip','seated',{le:[-.3,.88,.28],lw:[-.1,1.1,.30],re:[.3,.88,.28],rw:[.1,1.1,.30],headPitch:12},'Cup ko face ke paas laao. Elbows ko relax rakho.',{prop:'cup',editor:3});
add('Ankle over the knee','seated',{lk:[-.19,.47,.43],la:[.21,.53,.46],rk:[.20,.46,.43],ra:[.2,.1,.57],lw:[-.11,.68,.35],rw:[.15,.67,.36],headYaw:-20},'Ek ankle opposite knee par rakho; haath loosely lap mein.');
add('Chin in the palm','seated',{shoulder:[.05,1.01,.23],re:[.27,.74,.38],rw:[.075,1.16,.20],headTilt:-9},'Elbow thigh par tikaao aur chin ko palm mein rest karne do.');
add('Reading on the chair','seated',{le:[-.3,.83,.22],lw:[-.16,.75,.41],re:[.3,.83,.22],rw:[.16,.75,.41],headPitch:24},'Book kholo aur ek paragraph sach mein padho.',{prop:'book'});
add('The relaxed lean-back','seated',{shoulder:[0,1.01,-.13],le:[-.34,.76,-.12],lw:[-.38,.49,-.06],re:[.34,.76,-.12],rw:[.38,.49,-.06],headPitch:-8},'Haath seat ke paas tikaao aur upper body ko halka peeche chhodo.');
add('Offer your hand','seated',{re:[.29,.86,.25],rw:[.23,.83,.60],headYaw:13},'Ek palm saamne kholo, jaise kisi ko apne paas bula rahe ho.',{pov:true,reach:'rw'});
add('Come sit beside me','seated',{le:[-.34,.77,.09],lw:[-.56,.54,.20],headYaw:-28,headTilt:5},'Side mein jagah banaao aur haath se us jagah ki taraf ishara karo.',{pov:true,reach:'lw'});
add('A mid-story gesture','seated',{le:[-.37,.94,.25],lw:[-.36,1.03,.46],re:[.34,.91,.23],rw:[.39,1.01,.43],headTilt:7},'Koi chhoti story bataao aur gestures ko natural rehne do.',{pov:true,reach:'rw'});
add('Lean closer to listen','seated',{shoulder:[0,1.00,.30],le:[-.3,.75,.32],lw:[-.19,.62,.54],re:[.31,.76,.33],rw:[.20,.62,.54],headTilt:-6},'Sirf upper body se thoda lean karo, jaise baat dhyan se sun rahe ho.',{pov:true,reach:'rw'});
add('Turn toward a friend','seated',{headYaw:44,re:[.36,.83,.03],rw:[.45,.70,.16],le:[-.26,.80,.18],lw:[-.10,.66,.35]},'Seat par hi reh kar head aur shoulders ko dost ki taraf turn karo.',{pov:true,reach:'rw',yaw:-18});
add('Sharing the little moment','seated',{le:[-.3,.83,.27],lw:[-.12,.91,.47],re:[.32,.85,.28],rw:[.13,.93,.48],headPitch:8},'Haathon ko saamne laao, jaise kisi ko kuch dikha rahe ho.',{pov:true,reach:'rw'});
// Eight floor poses, three POV.
add('A quiet chapter','floor',{lw:[-.19,.38,.36],rw:[.19,.38,.36],headPitch:24},'Pair fold karke baitho, book kholo aur page par dekho.',{prop:'book',editor:4});
add('Hugging one knee','floor',{lk:[-.18,.56,.37],la:[-.18,.1,.59],le:[-.34,.59,.23],lw:[-.1,.58,.41],re:[.29,.58,.24],rw:[-.04,.54,.45],headTilt:7},'Ek knee ko paas laao aur uske around haath loosely rakho.');
add('Side-folded legs','floor',{lk:[-.26,.16,.31],la:[.15,.09,.34],rk:[.32,.15,.20],ra:[.51,.08,.06],shoulder:[-.06,.75,.05],headYaw:25},'Dono legs ek side fold karo aur shoulders ko open rakho.');
add('Sketching on the floor','floor',{shoulder:[0,.66,.27],le:[-.28,.40,.27],lw:[-.15,.23,.46],re:[.28,.40,.27],rw:[.15,.22,.49],headPitch:30},'Notebook ko paas rakho aur kuch casually sketch karo.',{prop:'book'});
add('Sitting with legs out','floor',{lk:[-.14,.17,.47],la:[-.15,.09,.86],rk:[.17,.18,.45],ra:[.2,.09,.84],le:[-.32,.52,-.05],lw:[-.39,.15,-.07],re:[.33,.53,-.05],rw:[.4,.15,-.07],headYaw:-18},'Legs saamne extend karo aur haath peeche support par rakho.');
add('Reaching across the rug','floor',{shoulder:[.04,.72,.13],re:[.32,.55,.27],rw:[.37,.40,.56],headYaw:20},'Ek haath saamne badhao aur body ko uske saath halka lean karne do.',{pov:true,reach:'rw'});
add('Sit here with me','floor',{le:[-.34,.51,.1],lw:[-.54,.18,.20],headYaw:-22,headTilt:6},'Apne paas ki jagah par palm rakho aur saamne dekho.',{pov:true,reach:'lw'});
add('A hand between chapters','floor',{lw:[-.15,.37,.30],re:[.32,.57,.23],rw:[.29,.54,.55],headPitch:4},'Book se nazar uthao aur ek haath casually aage karo.',{pov:true,reach:'rw',prop:'book'});
// Bed poses: rotate articulated anatomy into a reclining coordinate frame.
function rotate(v,roll){const [x,y,z]=v,a=roll*Math.PI/180;const X=x*Math.cos(a)+z*Math.sin(a),Z=-x*Math.sin(a)+z*Math.cos(a);return[X,Z,-y];}
function bedPose(name,mods,cue,opts={}){const p={...clone(standing),...clone(mods)},origin=[0,.92,0],roll=opts.roll||0;for(const k of ['hip','shoulder','le','lw','re','rw','lk','la','rk','ra']){const q=rotate(p[k].map((n,i)=>n-origin[i]),roll);p[k]=[q[0],q[1]+.60,q[2]];}p.across=rotate([1,0,0],roll);add(name,'bed',p,cue,{bed:true,level:'Above / gentle angle',elevation:48,...opts});}
bedPose('Resting on the pillow',{le:[-.30,1.14,.03],lw:[-.24,.96,.10],re:[.30,1.14,.03],rw:[.23,.96,.12],headYaw:10},'Pillow par head rest karo, arms ko body ke paas loose rakho.',{sleep:true});
bedPose('Side-lying, knees relaxed',{lk:[-.13,.58,.20],la:[-.12,.24,.47],rk:[.14,.59,.24],ra:[.15,.24,.49],le:[-.26,1.45,.10],lw:[-.10,1.64,.05],re:[.30,1.19,.23],rw:[.03,1.33,.35],headTilt:5},'Side par let kar knees softly bend karo; ek hand pillow ke paas.',{roll:72,sleep:true});
bedPose('One arm above the pillow',{le:[-.31,1.68,.03],lw:[-.11,1.86,.03],re:[.30,1.13,.07],rw:[.18,.96,.14],headYaw:-18},'Ek arm head ke upar relax rakho aur chin ko halka side karo.',{sleep:true});
bedPose('A slow waking stretch',{le:[-.36,1.69,.08],lw:[-.24,1.94,.06],re:[.35,1.65,.07],rw:[.25,1.91,.06],headPitch:-8},'Uthte waqt dono arms ko stretch karo, phir dheere relax karo.',{pov:true,reach:'rw'});
bedPose('Reaching from the pillow',{re:[.29,1.18,.27],rw:[.20,1.36,.58],headYaw:10,le:[-.29,1.26,.07],lw:[-.16,1.45,.08]},'Head pillow par hi rakho aur ek haath saamne badhao.',{pov:true,reach:'rw'});
bedPose('Side-lying conversation',{le:[-.27,1.45,.05],lw:[-.11,1.63,.06],re:[.28,1.20,.24],rw:[.12,1.26,.55],headYaw:-15,lk:[-.14,.6,.17],la:[-.15,.21,.38],rk:[.14,.58,.22],ra:[.17,.20,.44]},'Side par relaxed raho aur saamne wale se baat karo.',{roll:62,pov:true,reach:'rw'});
bedPose('Palm turned toward you',{re:[.29,1.20,.23],rw:[.25,1.33,.60],headYaw:15,lk:[-.14,.59,.22],la:[-.13,.1,.38]},'Ek palm camera ki taraf kholo; elbow ko locked mat rakho.',{pov:true,reach:'rw'});
bedPose('A book before getting up',{le:[-.28,1.2,.24],lw:[-.14,1.36,.44],re:[.28,1.2,.24],rw:[.14,1.36,.44],headPitch:14},'Book face ke saamne comfortable distance par hold karo.',{pov:true,reach:'rw',prop:'book'});
add('Sitting on the bed edge','bed',{...clone(seated),hip:[0,.59,0],shoulder:[0,1.11,.10],re:[.31,.89,.28],rw:[.27,.86,.59],headYaw:12,seat:false},'Bed ke edge par baitho aur ek haath aage do.',{bed:true,pov:true,reach:'rw',level:'Seated eye level'});
add('Cross-legged on the bed','bed',{...clone(floor),hip:[0,.72,0],shoulder:[0,1.23,.08],le:[-.30,1.0,.18],lw:[-.20,.84,.33],re:[.32,1.02,.23],rw:[.29,1.0,.53],lk:[-.4,.62,.28],la:[.12,.56,.39],rk:[.4,.62,.28],ra:[-.12,.56,.39],headYaw:15,seat:false},'Bed par legs fold karo aur shoulders ko relaxed rakho.',{bed:true,pov:true,reach:'rw',level:'Seated eye level'});
add('Leaning into the pillows','bed',{...clone(seated),hip:[0,.59,0],shoulder:[0,.99,-.30],le:[-.32,.78,-.04],lw:[-.32,.64,.2],re:[.32,.84,.05],rw:[.28,.86,.38],lk:[-.16,.53,.46],la:[-.17,.48,.84],rk:[.18,.54,.43],ra:[.20,.48,.81],headYaw:12,seat:false},'Pillows par lean karo aur ek hand naturally saamne rakho.',{bed:true,pov:true,reach:'rw',level:'Slightly above',elevation:18});
add('A quiet bedside hello','bed',{...clone(seated),hip:[.04,.6,0],shoulder:[-.02,1.1,.12],le:[-.33,.83,.15],lw:[-.44,.63,.21],re:[.31,.97,.23],rw:[.36,1.22,.36],headTilt:-7,headYaw:20,seat:false},'Bed edge par baith kar ek chhota wave do, bilkul casually.',{bed:true,pov:true,reach:'rw',level:'Seated eye level'});
const views=[{key:'front',name:'Front',yaw:0,elevation:4},{key:'three-quarter',name:'¾ view',yaw:34,elevation:7},{key:'side',name:'Side',yaw:72,elevation:7},{key:'above',name:'Above',yaw:22,elevation:31},{key:'below',name:'Below',yaw:14,elevation:-12}];
const api={poses,views};if(typeof module!=='undefined')module.exports=api;else root.PoseCatalog=api;
})(typeof window!=='undefined'?window:globalThis);
