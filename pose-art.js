(function(root){
'use strict';
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),len=a=>Math.hypot(...a),unit=a=>mul(a,1/(len(a)||1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],lerp=(a,b,t)=>add(mul(a,1-t),mul(b,t)),D=Math.PI/180;
const esc=s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const n=x=>Number(x.toFixed(2)),xy=p=>p.slice(0,2).map(n).join(',');
function smooth(points,closed=false){if(points.length<2)return'';let out=`M${xy(points[0])}`;for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];out+=` C${xy(add(b,mul(sub(c,a),1/6)))} ${xy(sub(c,mul(sub(d,b),1/6)))} ${xy(c)}`;}return out+(closed?'Z':'');}
function render(p,v,options={}){
 const yaw=((v.yaw||0)+(p.yaw||0))*D,elevation=Math.max(-14,Math.min(78,(p.elevation||0)+(v.elevation||0)))*D,cs=Math.cos(yaw),sn=Math.sin(yaw),ce=Math.cos(elevation),se=Math.sin(elevation);
 const camera=[-sn*ce,se,cs*ce],right=[cs,0,sn],up=[sn*se,ce,-cs*se];
 const raw=q=>[dot(q,right),-dot(q,up),dot(q,camera)];
 const B=unit(sub(p.shoulder,p.hip)),a0=p.across||[1,0,0],A=unit(sub(a0,mul(B,dot(a0,B)))),C=unit(cross(A,B));
 const headC=add(p.shoulder,mul(B,.205));
 const bounds=[...['hip','shoulder','le','lw','re','rw'].map(k=>p[k]),headC,add(headC,mul(B,.16)),sub(headC,mul(A,.13)),add(headC,mul(A,.13))];
 for(const sign of[-1,1]){const h=add(p.hip,mul(A,sign*.14)),k=p[sign<0?'lk':'rk'];bounds.push(lerp(h,k,.65),add(h,mul(A,sign*.14)));}
 for(const s of['l','r'])bounds.push(add(p[s+'w'],mul(unit(sub(p[s+'w'],p[s+'e'])),.10)));
 const r=bounds.map(raw),minX=Math.min(...r.map(q=>q[0]))-.075,maxX=Math.max(...r.map(q=>q[0]))+.075,minY=Math.min(...r.map(q=>q[1]))-.04,maxY=Math.max(...r.map(q=>q[1]))+.025;
 const scale=Math.min(492/(maxX-minX),630/(maxY-minY)),center=[(minX+maxX)/2,(minY+maxY)/2];
 const project=q=>{const x=raw(q);return[310+(x[0]-center[0])*scale,400+(x[1]-center[1])*scale,x[2]];};
 const parts=[],push=(depth,s)=>parts.push({depth,s});
 function path3(points,{color='#8b8e8c',width=.8,depth=null,dash='',fill='none',closed=false}={}){const q=points.map(project);push(depth??q.reduce((n,p)=>n+p[2],0)/q.length,`<path d="${smooth(q,closed)}" fill="${fill}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''} stroke-linecap="round" stroke-linejoin="round"/>`);}
 function ellipsoid(center,radii,axes=[A,B,C],opts={}){
   const q=project(center),vectors=axes.map((a,i)=>{const z=raw(mul(a,radii[i]));return[z[0]*scale,z[1]*scale];});let xx=0,yy=0,zz=0;vectors.forEach(([x,y])=>{xx+=x*x;yy+=y*y;zz+=x*y;});const t=xx+yy,delta=Math.sqrt((xx-yy)**2+4*zz*zz),rx=Math.sqrt(Math.max(.01,(t+delta)/2)),ry=Math.sqrt(Math.max(.01,(t-delta)/2)),angle=.5*Math.atan2(2*zz,xx-yy)/D;
   push(q[2]+(opts.depth||0),`<ellipse filter="url(#contact)" cx="${n(q[0])}" cy="${n(q[1])}" rx="${n(rx)}" ry="${n(ry)}" transform="rotate(${n(angle)} ${n(q[0])} ${n(q[1])})" fill="${opts.fill||'url(#body)'}" stroke="${opts.stroke||'#6e7475'}" stroke-width="${opts.width??1.2}"/>`);
 }
 function limb(a,b,ra,rb,opts={}){
   const x=project(a),y=project(b),d=sub(y,x),l=Math.hypot(d[0],d[1])||1,u=[-d[1]/l,d[0]/l],r1=ra*scale,r2=rb*scale,bulge=(r1+r2)*.08;
   const L=[x[0]+u[0]*r1,x[1]+u[1]*r1],R=[x[0]-u[0]*r1,x[1]-u[1]*r1],BL=[y[0]+u[0]*r2,y[1]+u[1]*r2],BR=[y[0]-u[0]*r2,y[1]-u[1]*r2];
   const dl=[d[0]/l,d[1]/l],left=add(lerp(L,BL,.50),mul(u,bulge)),right=add(lerp(R,BR,.50),mul(u,-bulge));
   const shape=`M${xy(L)} Q${xy(left)} ${xy(BL)} Q${xy(add(y,mul(dl,r2*.8)))} ${xy(BR)} Q${xy(right)} ${xy(R)} Q${xy(sub(x,mul(dl,r1*.8)))} ${xy(L)}Z`;
   push((x[2]+y[2])/2+(opts.depth||0),`<path filter="url(#contact)" d="${shape}" fill="${opts.fill||'url(#body)'}" stroke="#74797a" stroke-width="${opts.width||1.2}" stroke-linejoin="round"/>`);
 }
 function joint(c,radius){ellipsoid(c,[radius,radius,radius],[A,B,C],{fill:'url(#joint)',width:.9,depth:.002});}
 function hand(w,e,side){
   const d=unit(sub(w,e));let lateral=sub(A,mul(d,dot(A,d)));if(len(lateral)<.1)lateral=cross(d,C);lateral=unit(lateral);const normal=unit(cross(lateral,d)),c=add(w,mul(d,.035));ellipsoid(c,[.037,.052,.021],[lateral,d,normal],{width:.9,depth:.01});
   const curl=p.prop? .55:p.name.includes('wave')?.05:.23;
   for(let i=0;i<4;i++){const x=(i-1.5)*.018,length=[.041,.050,.047,.038][i],start=add(add(w,mul(d,.069)),mul(lateral,x)),bend=add(start,add(mul(d,length*.57),mul(normal,curl*.025))),tip=add(bend,add(mul(d,length*.43*(1-curl)),mul(normal,curl*.017)));limb(start,bend,.008,.0068,{width:.65,depth:.014});limb(bend,tip,.0068,.0054,{width:.6,depth:.016});}
   const thumb=add(c,mul(lateral,side<0?-.032:.032)),tip=add(thumb,add(mul(lateral,side<0?-.025:.025),mul(d,.037)));limb(thumb,tip,.012,.007,{width:.8,depth:.019});
 }
 // Legs and feet remain correctly articulated below the portrait crop.
 for(const [s,sign]of[['l',-1],['r',1]]){
   const h=add(add(p.hip,mul(A,sign*.138)),mul(B,-.025)),k=p[s+'k'],ankle=p[s+'a'];limb(h,k,.112,.065);joint(k,.048);limb(k,ankle,.062,.033);joint(ankle,.027);
   const toe=add(add(ankle,mul(C,.12)),mul(B,-.033));ellipsoid(toe,[.058,.04,.12],[A,B,C],{width:1});
 }
 // Hip volume and a shaped torso, with silhouette support calculated for each view.
 ellipsoid(add(p.hip,mul(B,.012)),[.227,.139,.152]);
 const widths=[.211,.207,.180,.158,.157,.173,.209,.229,.239,.23,.165,.081],depths=[.143,.146,.128,.105,.107,.130,.155,.177,.168,.130,.085,.061],left=[],rightEdge=[];
 let silhouette=unit(cross(B,camera));if(len(silhouette)<.5)silhouette=A;
 for(let i=0;i<widths.length;i++){const t=i/(widths.length-1),center3=lerp(add(p.hip,mul(B,.045)),p.shoulder,t),wa=widths[i],dc=depths[i],aa=dot(silhouette,A),cc=dot(silhouette,C),den=Math.hypot(wa*aa,dc*cc)||1,offset=add(mul(A,wa*wa*aa/den),mul(C,dc*dc*cc/den));left.push(project(sub(center3,offset)));rightEdge.push(project(add(center3,offset)));}
 push((raw(p.hip)[2]+raw(p.shoulder)[2])/2,`<path d="${smooth(left)} L${xy(rightEdge.at(-1))} ${smooth(rightEdge.slice().reverse()).replace(/^M[^C]+/,'')}Z" fill="url(#torso)" stroke="#6f7576" stroke-width="1.4" stroke-linejoin="round"/>`);
 const chest=lerp(p.hip,p.shoulder,.69);
 for(const sign of[-1,1]){const c=add(add(chest,mul(A,sign*.106)),mul(C,.124));ellipsoid(c,[.113,.105,.10],[A,B,C],{stroke:'#a0a5a4',width:.7,depth:.003});}
 const centerLine=[.13,.39,.58,.91].map(t=>add(lerp(p.hip,p.shoulder,t),mul(C,t>.5?.174:.12)));path3(centerLine,{color:'#9ca2a0',width:.7,depth:Math.max(...centerLine.map(q=>raw(q)[2]))+.002});
 const belt=[-1,-.5,0,.5,1].map(t=>add(add(p.hip,mul(A,t*.194)),add(mul(B,.027-.034*(1-t*t)),mul(C,.135*Math.sqrt(1-t*t)))));path3(belt,{color:'#969d9a',width:.8});
 // Shoulder sockets, tapered upper arms, forearms and articulated fingers.
 for(const [s,sign]of[['l',-1],['r',1]]){const shoulder=add(add(p.shoulder,mul(A,sign*.203)),mul(B,-.050));limb(shoulder,p[s+'e'],.075,.041);joint(shoulder,.061);joint(p[s+'e'],.033);limb(p[s+'e'],p[s+'w'],.041,.025);joint(p[s+'w'],.021);hand(p[s+'w'],p[s+'e'],sign);}
 const neckEnd=add(p.shoulder,mul(B,.083));limb(p.shoulder,neckEnd,.052,.043);const pitch=(p.headPitch||0)*D,hy=(p.headYaw||0)*D,roll=(p.headTilt||0)*D;
 let headRight=add(mul(A,Math.cos(hy)),mul(C,-Math.sin(hy))),headFront=add(mul(C,Math.cos(hy)),mul(A,Math.sin(hy))),headUp=add(mul(B,Math.cos(pitch)),mul(headFront,Math.sin(pitch)));headFront=add(mul(headFront,Math.cos(pitch)),mul(B,-Math.sin(pitch)));headRight=add(mul(headRight,Math.cos(roll)),mul(headUp,-Math.sin(roll)));headUp=unit(cross(headFront,headRight));
 ellipsoid(headC,[.096,.139,.101],[headRight,headUp,headFront],{fill:'url(#head)',width:1.3});
 if(dot(headFront,camera)>-.12){const meridian=[-.92,-.55,0,.55,.95].map(t=>add(headC,add(mul(headUp,t*.138),mul(headFront,.103*Math.sqrt(1-t*t))))),equator=[-.96,-.5,0,.5,.96].map(t=>add(headC,add(mul(headRight,t*.098),add(mul(headUp,.016),mul(headFront,.102*Math.sqrt(1-t*t))))));path3(meridian,{width:.75,color:'#8d9693',depth:raw(headC)[2]+.13});path3(equator,{width:.75,color:'#8d9693',depth:raw(headC)[2]+.135});}
 function plane(c,w,h,axis1=A,axis2=C,fill='#f7f7f3',stroke='#b6bcb9'){const pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>add(c,add(mul(axis1,w*x/2),mul(axis2,h*y/2))));const q=pts.map(project);return `<path d="M${q.map(xy).join('L')}Z" fill="${fill}" stroke="${stroke}" stroke-width="1.1" stroke-linejoin="round"/>`;}
 function cushion(c,w,h,axis1=[1,0,0],axis2=[0,0,1],fill='url(#linen)',round=.10){
  const q=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>project(add(c,add(mul(axis1,w*x/2),mul(axis2,h*y/2)))));
  let d='';for(let i=0;i<4;i++){const before=lerp(q[i],q[(i+3)%4],round),after=lerp(q[i],q[(i+1)%4],round);d+=`${i?'L':'M'}${xy(before)} Q${xy(q[i])} ${xy(after)}`;}
  return `<path d="${d}Z" fill="${fill}" stroke="#b9c1b9" stroke-width="1" filter="url(#contact)"/>`;
 }
 let support='';
 const seatY=p.hip[1]-.145,x=p.hip[0],z=p.hip[2],upright=Math.abs(B[1])>.65;
 if(p.surface==='bed'||p.bed){
  support=cushion([x,seatY-.05,z+.12],1.24,2.2,[1,0,0],[0,0,1],'#dfe3da',.035);
  support+=cushion([x,seatY,z+.10],1.24,2.2,[1,0,0],[0,0,1],'url(#linen)',.035);
  support+=upright?cushion([x,seatY+.18,z-.25],.67,.46,[1,0,0],[0,.75,-.66],'#f8f7f0',.2):cushion([headC[0],seatY+.028,headC[2]],.56,.36,[1,0,0],[0,0,1],'#faf9f4',.22);
  const fold=[[-.59,.62],[0,.60],[.59,.64]].map(([dx,dz])=>project([x+dx,seatY+.007,z+dz]));support+=`<path d="${smooth(fold)}" fill="none" stroke="#d4d9cf" stroke-width="2"/>`;
 }else if(['sofa','armchair'].includes(p.surface)){
  const reclining=p.reclining||!upright,w=p.surface==='armchair'?.70:1.16,depth=reclining?1.85:.65;
  if(reclining){support=cushion([x-.42,seatY+.22,z+.1],depth,.43,[0,0,1],[0,1,0]);}
  else support=cushion([x,seatY+.24,z-.24],w,.47,[1,0,0],[0,1,0]);
  support+=cushion([x,seatY-.07,z+.12],reclining?.89:w,depth,[1,0,0],[0,0,1],'#cdd5ce',.065);
  support+=cushion([x,seatY,z+.12],reclining?.89:w,depth,[1,0,0],[0,0,1],'url(#linen)',.11);
  if(!reclining)for(const sign of[-1,1])support+=cushion([x+sign*(w/2-.04),seatY+.09,z+.06],.15,.65,[1,0,0],[0,0,1],'#e5e8df',.18);
  else support+=cushion([headC[0],seatY+.025,headC[2]],.45,.32,[1,0,0],[0,0,1],'#f7f5ed',.22);
 }else if(p.seat){
  if(p.surface!=='stool')support=cushion([x,seatY+.22,z-.19],.56,.45,[1,0,0],[0,1,0],'#e9e7df',.09);
  support+=cushion([x,seatY,z+.12],.59,.61,[1,0,0],[0,0,1],'url(#linen)',.10);
 }else if(p.surface==='floor'){
  support=cushion([x,p.hip[1]-.16,z+.08],1.26,1.14,[1,0,0],[0,0,1],'#f0f0e9',.15);
  if(p.family?.includes('cushion')||p.family?.includes('Cushion'))support+=cushion([x,p.hip[1]-.125,z],.56,.47,[1,0,0],[0,0,1],'#e3e6dc',.25);
 }
 if(['window','window-seat'].includes(p.surface))support=plane([x-.24,p.hip[1]+.49,z-.34],.78,1.1,[1,0,0],[0,1,0],'#f5f6f1','#d4dad2')+plane([x-.24,p.hip[1]+.49,z-.335],.018,1.1,[1,0,0],[0,1,0],'#d9dfd6','#d9dfd6')+support;
 if(p.surface==='counter')support=plane([x,p.hip[1]+.09,z-.23],1.23,.44,[1,0,0],[0,1,0],'#e8ebe2','#c4cfc1')+cushion([x,p.hip[1]+.32,z-.19],1.28,.47,[1,0,0],[0,0,1],'#f4f4ed',.025)+support;
 let prop='';const mid=mul(add(p.lw,p.rw),.5);
 if(p.prop==='book'||p.prop==='closedbook'){
   const center3=add(mid,mul(C,.047));prop=plane(center3,.32,.23,A,p.prop==='closedbook'?B:C,'#f1f2ed','#8b9790');if(p.prop==='book'){const a=project(add(center3,mul(C,-.115))),b=project(add(center3,mul(C,.115)));prop+=`<path d="M${xy(a)}L${xy(b)}" stroke="#89988e" stroke-width="1.1"/>`;}
 }else if(['phone','phoneone','earphone'].includes(p.prop)){
   const c=p.prop==='phone'?mid:p.rw;prop=plane(add(c,mul(C,.027)),.066,.128,A,B,'#e9ede8','#88958d');
 }else if(p.prop==='cup'){
   const q=project(add(mid,add(mul(B,.036),mul(C,.04)))),w=scale*.071,h=scale*.092;prop=`<path d="M${n(q[0]-w/2)},${n(q[1]-h/2)} Q${n(q[0])},${n(q[1]-h*.7)} ${n(q[0]+w/2)},${n(q[1]-h/2)} L${n(q[0]+w*.39)},${n(q[1]+h*.48)} Q${n(q[0])},${n(q[1]+h*.64)} ${n(q[0]-w*.39)},${n(q[1]+h*.48)}Z M${n(q[0]+w/2)},${n(q[1]-h*.3)} C${n(q[0]+w*1.3)},${n(q[1]-h*.3)} ${n(q[0]+w*1.25)},${n(q[1]+h*.5)} ${n(q[0]+w*.42)},${n(q[1]+h*.3)}" fill="#f6f7f1" stroke="#85928a" stroke-width="1.2"/>`;
 }else if(p.prop==='bag'){const bag=add(p.hip,mul(A,.34));prop=plane(bag,.25,.33,A,B,'#edf0e9','#8a978d');const q=[add(p.shoulder,mul(A,.2)),add(bag,mul(B,.2))].map(project);prop+=`<path d="M${q.map(xy).join('L')}" fill="none" stroke="#8f9d91" stroke-width="4"/>`;}
 parts.sort((a,b)=>a.depth-b.depth);
 const target=project(lerp(p.hip,p.shoulder,.61)),head=project(headC),hip=project(p.hip),cameraIcon=[48,678];
 const guides=options.guides!==false?`<g fill="none" stroke="#b08a66" stroke-width="1.3"><path d="M65,678 L${n(head[0]-35)},${n(head[1])} M65,678 L${n(hip[0]-28)},${n(hip[1])}" stroke-dasharray="6 6" opacity=".53"/><path d="M65,678 L${n(target[0]-30)},${n(target[1])}" opacity=".8"/><g transform="translate(48 678) rotate(-32)"><rect x="-18" y="-13" width="30" height="26" rx="4" fill="#eee5d8"/><path d="M12,-7l14,-8v30l-14,-8Z" fill="#e4d5bf"/><path d="M-10,-13v-6h14v6"/><circle cx="-2" cy="0" r="5"/></g><text x="24" y="719" stroke="none" fill="#9c7d5c" font-family="Arial,sans-serif" font-size="11">CAMERA · ${p.camera}°</text><text x="24" y="736" stroke="none" fill="#a5a89f" font-family="Arial,sans-serif" font-size="9">${esc(p.level)}</text></g>`:'';
 let foreground='';
 if(p.pov){
   // Contact follows the visible outer buttock, in the figure's local frame.
   // Using the pelvis axes keeps the anchor on the body when it reclines or turns.
   const side=dot(A,camera)>.025?1:dot(A,camera)<-.025?-1:(p.reach==='lw'?-1:1);
   const contact=add(p.hip,add(mul(A,side*.204),add(mul(B,-.060),mul(C,-.060))));
   const target=project(contact),pelvis=project(p.hip),screenSide=target[0]<pelvis[0]?-1:1;
   const entry=screenSide<0?[-85,820]:[685,820],mirror=screenSide,handScale=Math.max(.56,Math.min(.86,scale*.00165));
   const angle=Math.atan2(target[1]-entry[1],target[0]-entry[0])/D+90,rot=angle*D;
   // The palm rests on the surface; fingers lie across the outer contour.
   const palm=[0,-35*handScale],palmWorld=[palm[0]*Math.cos(rot)-palm[1]*Math.sin(rot),palm[0]*Math.sin(rot)+palm[1]*Math.cos(rot)];
   const wrist=[target[0]-palmWorld[0],target[1]-palmWorld[1]],armLength=Math.max(180,Math.hypot(entry[0]-wrist[0],entry[1]-wrist[1])/handScale+100);
   let fingers='';for(let i=0;i<4;i++){const x=[-23,-8,8,22][i],l=[42,58,52,38][i];fingers+=`<path d="M${x-7},-48 C${x-8},${-66-l*.3} ${x-6},${-61-l} ${x},${-64-l} C${x+10},${-65-l} ${x+9},${-64-l*.3} ${x+8},-48" fill="url(#hand)" stroke="#8c9792" stroke-width="1.35"/><path d="M${x-4},${-62-l*.35}h9" stroke="#b6bfb7" stroke-width=".8"/>`;}
   foreground=`<g filter="url(#contact)" transform="translate(${wrist}) rotate(${n(angle)}) scale(${handScale*mirror} ${handScale})"><path d="M-60,${n(armLength)} Q-31,${n(armLength*.40)} -22,5 L22,5 Q34,${n(armLength*.4)} 68,${n(armLength)}Z" fill="url(#hand)" stroke="#8e9892" stroke-width="1.5"/>${fingers}<path d="M-22,6 Q-31,-8 -33,-35 Q-34,-57 -21,-63 Q0,-71 24,-58 Q37,-46 31,-27 Q28,-9 22,6Z" fill="url(#hand)" stroke="#8c9792" stroke-width="1.4"/><path d="M-28,-9 Q-48,-21 -57,-40 Q-63,-54 -54,-58 Q-44,-60 -37,-47 L-19,-28" fill="url(#hand)" stroke="#8c9792" stroke-width="1.4"/><path d="M-15,1 Q0,5 16,1 M-17,-50 Q-12,-43 -10,-30 M-2,-54 Q3,-46 4,-31 M13,-51 Q18,-44 17,-31" fill="none" stroke="#b1bab3" stroke-width="1"/></g>`;
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="linen" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#f9f9f3"/><stop offset=".5" stop-color="#e9ede3"/><stop offset="1" stop-color="#d3dccf"/></linearGradient><filter id="contact" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="1.2" dy="1.5" stdDeviation="1.1" flood-color="#737d80" flood-opacity=".18"/></filter><linearGradient id="body" x1="0" y1="0" x2="1" y2=".65"><stop stop-color="#ffffff"/><stop offset=".23" stop-color="#f0f2f0"/><stop offset=".66" stop-color="#cbd1d1"/><stop offset="1" stop-color="#9da8aa"/></linearGradient><linearGradient id="torso" x1="0" x2="1"><stop stop-color="#f9faf8"/><stop offset=".30" stop-color="#e9edeb"/><stop offset=".70" stop-color="#c4cccb"/><stop offset="1" stop-color="#98a5a4"/></linearGradient><radialGradient id="head" cx=".31" cy=".25" r=".88"><stop stop-color="#ffffff"/><stop offset=".48" stop-color="#e2e7e4"/><stop offset="1" stop-color="#a6b1ad"/></radialGradient><radialGradient id="joint" cx=".35" cy=".25" r=".85"><stop stop-color="#ffffff"/><stop offset=".5" stop-color="#e4e9e4"/><stop offset="1" stop-color="#b1beb4"/></radialGradient><linearGradient id="hand" x1="0" x2="1"><stop stop-color="#f9fcf7"/><stop offset=".35" stop-color="#e1e9df"/><stop offset="1" stop-color="#a4b4a4"/></linearGradient><clipPath id="crop"><rect width="600" height="770"/></clipPath></defs><rect width="600" height="800" fill="#fff"/><g clip-path="url(#crop)">${support}${parts.map(p=>p.s).join('')}${prop}${guides}${foreground}</g><rect y="770" width="600" height="30" fill="#fff"/><text x="23" y="30" font-family="Arial,sans-serif" font-size="11" fill="#7e8987" letter-spacing="1.4">${p.id}</text><text x="576" y="30" text-anchor="end" font-family="Arial,sans-serif" font-size="10" fill="#9aa39f" letter-spacing="1">${esc(v.name.toUpperCase())}${p.pov?' · POV':''}</text><text x="300" y="783" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#6f8377" letter-spacing="1">${esc((p.areaLabel||p.room||'HOMELY CANDID').toUpperCase())}</text><text x="300" y="795" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" fill="#9da99f" letter-spacing="1">HEAD TO THIGHS · ${p.pov?'OUTER BUTTOCK CONTACT':'CANDID REFERENCE'}</text></svg>`;
}
const api={render};if(typeof module!=='undefined')module.exports=api;else root.PoseArt=api;
})(typeof window!=='undefined'?window:globalThis);
