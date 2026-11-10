/* Still: original procedural geometry. No photographs, pose assets or model files. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!window.THREE) { $('loading').textContent = 'The 3D library could not load. Connect to the internet and reload this page.'; return; }
  const T = window.THREE, D = Math.PI / 180;
  let rigSaved=null;
  try { rigSaved=JSON.parse(localStorage.getItem('still-rig-v2')); } catch {}
  const bodyShape={bust:56,hips:56};
  for(const key of ['bust','hips'])if(Number.isFinite(rigSaved?.bodyShape?.[key]))bodyShape[key]=T.MathUtils.clamp(rigSaved.bodyShape[key],28,80);
  const V = p => new T.Vector3(...p);
  const palette = { floor:0xe6e0d4, wall:0xeae5da, skin:0xe7dccc, joint:0xccbdaa, shirt:0xb77c61, pants:0xd4cabb, shoe:0xf0e9da, green:0x466e64, wood:0x9a7452, lightwood:0xb99a75, sofa:0xb8bb9e, paper:0xf7f0de, dark:0x303b35 };
  const mats = {};
  function material(color, roughness=.8) { const key=`${color}:${roughness}`; return mats[key] ||= new T.MeshStandardMaterial({color,roughness}); }
  const sphere = new T.SphereGeometry(1,24,18);
  const cube = new T.BoxGeometry(1,1,1);
  const geometries = new Map();
  function cylinder(a,b,len=1) { const k=`${a},${b},${len}`; if(!geometries.has(k)) geometries.set(k,new T.CylinderGeometry(a,b,len,18)); return geometries.get(k); }
  function addMesh(parent,geo,mat,pos=[0,0,0]) { const m = new T.Mesh(geo,typeof mat==='number'?material(mat):mat); m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m; }
  function ball(g,p,s,c) { const m=addMesh(g,sphere,c,p);m.scale.set(...s);return m; }
  function box(g,p,s,c,r=0) { const m=addMesh(g,cube,c,p);m.scale.set(...s);m.rotation.y=r;return m; }
  function limb(g,a,b,ra,rb,c) { const av=V(a),bv=V(b),d=bv.clone().sub(av),m=addMesh(g,cylinder(rb,ra),c);m.position.copy(av.add(bv).multiplyScalar(.5));m.scale.y=d.length();m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());ball(g,a,[ra,ra,ra],c);ball(g,b,[rb,rb,rb],c);return m; }
  function line(g,points,color,width=1,opacity=1) { const geo=new T.BufferGeometry().setFromPoints(points.map(p=>Array.isArray(p)?V(p):p));const l=new T.Line(geo,new T.LineBasicMaterial({color,transparent:opacity<1,opacity,linewidth:width}));g.add(l);return l; }
  function arc(g,points,color,r=.004) { const curve=new T.CatmullRomCurve3(points.map(V));return addMesh(g,new T.TubeGeometry(curve,24,r,6,false),color); }
  function torso(g,hip,shoulder,color,female=false) {
    const positions=[],indices=[],rings=13,sides=32;
    const bs=bodyShape.bust/56,hs=bodyShape.hips/56;
    const widths=female?[.215*hs,.234*hs,.207*hs,.175,.163,.17,.19*bs,.226*bs,.236*bs,.24,.231,.182,.094]:[.165,.188,.176,.153,.139,.148,.166,.19,.205,.224,.221,.177,.094];
    const depths=female?[.148*hs,.158*hs,.145*hs,.117,.108,.113,.130*bs,.153*bs,.143*bs,.115,.095,.076,.066]:[.10,.113,.112,.095,.086,.091,.105,.111,.113,.097,.088,.076,.066];
    for(let j=0;j<rings;j++){const t=j/(rings-1),p=V(hip).lerp(V(shoulder),t);for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2;positions.push(p.x+Math.cos(a)*widths[j],p.y,p.z+Math.sin(a)*depths[j]);}}
    for(let j=0;j<rings-1;j++)for(let i=0;i<sides;i++){const a=j*sides+i,b=j*sides+(i+1)%sides,c=(j+1)*sides+i,d=(j+1)*sides+(i+1)%sides;indices.push(a,c,b,b,c,d);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const m=addMesh(g,geo,material(color));m.material.side=T.DoubleSide;
    if(female){const c=V(hip).lerp(V(shoulder),.68);for(const sign of [-1,1])ball(g,[c.x+sign*.106*bs,c.y,c.z+.107*bs],[.123*bs,.118*bs,.111*bs],color);}
    // Collar and subtle front seam keep the torso legible at thumbnail size.
    arc(g,[[shoulder[0]-.066,shoulder[1]-.015,shoulder[2]+.047],[shoulder[0],shoulder[1]-.055,shoulder[2]+.074],[shoulder[0]+.066,shoulder[1]-.015,shoulder[2]+.047]],color===palette.shirt?0x8f5c48:0x486358,.007);
  }
  function hand(g,wrist,elbow,color,closed=false,rotation=[0,0,0]) {
    const group=new T.Group();group.position.copy(V(wrist));const dir=V(wrist).sub(V(elbow)).normalize();group.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir);g.add(group);
    ball(group,[0,.025,0],[.037,.049,.022],color);
    const curl=typeof closed==='number'?closed:closed?1:0;
    for(let i=0;i<4;i++){const x=(i-1.5)*.017,l=.026-Math.abs(i-1.5)*.003,a=curl*1.4,b=curl*2.5,k=[x,.055+l*Math.cos(a),l*Math.sin(a)],tip=[x,k[1]+.024*Math.cos(b),k[2]+.024*Math.sin(b)];limb(group,[x,.05,0],k,.009,.0075,color);limb(group,k,tip,.0075,.0065,color);}
    limb(group,[-.026,.025,.006],[-.05,.055,.013],.012,.009,color);group.rotateX(rotation[0]*D);group.rotateY(rotation[1]*D);group.rotateZ(rotation[2]*D);return group;
  }
  function person(p,photographer=false) {
    const g=new T.Group(),skin=palette.skin,shirt=photographer?0x6b8277:palette.shirt,pants=photographer?0x535c57:palette.pants;
    const hip=p.hip,sh=p.shoulder;
    const hs=photographer?1:bodyShape.hips/56;
    ball(g,[hip[0],hip[1]+.015,hip[2]],photographer?[.18,.135,.118]:[.237*hs,.15,.162*hs],pants);
    torso(g,[hip[0],hip[1]+.055,hip[2]],sh,shirt,!photographer);
    const neck=[sh[0],sh[1]+.055,sh[2]];
    limb(g,sh,neck,.063,.05,skin);
    const head=new T.Group();head.position.set(sh[0],sh[1]+.205,sh[2]);head.rotation.set((p.headPitch||0)*D,(p.headYaw||0)*D,(p.headTilt||0)*D);g.add(head);
    ball(head,[0,0,0],[.098,.14,.102],skin);ball(head,[0,-.063,.038],[.074,.071,.072],skin);
    // Unfeatured artist mannequin, with fine face construction lines.
    arc(head,[[0,.126,.027],[0,.084,.085],[0,0,.103],[0,-.082,.08],[0,-.123,.044]],0xb5a897,.0018);
    arc(head,[[-.093,.017,.033],[-.068,.015,.077],[0,.014,.103],[.068,.015,.077],[.093,.017,.033]],0xb5a897,.0018);
    ball(head,[-.099,-.012,0],[.013,.031,.019],skin);ball(head,[.099,-.012,0],[.013,.031,.019],skin);
    for(const side of ['l','r']){
      const sign=side==='l'?-1:1,shoulder=p[side+'s']||[sh[0]+sign*.20,sh[1]-.05,sh[2]],elbow=p[side+'e'],wrist=p[side+'w'];
      limb(g,shoulder,elbow,.071,.047,shirt);
      ball(g,elbow,[.048,.048,.048],skin);
      limb(g,elbow,wrist,.046,.029,skin);hand(g,wrist,elbow,skin,p[side+'curl']??p.grip,p[side+'handRot']||[0,0,0]);
      const thigh=p[side+'h']||[hip[0]+sign*(photographer?.098:.135*hs),hip[1]-.025,hip[2]],knee=p[side+'k'],ankle=p[side+'a'];
      limb(g,thigh,knee,photographer?.091:.117*hs,.070,pants);limb(g,knee,ankle,.067,.040,pants);
      const foot=ball(g,[ankle[0],ankle[1]-.025,ankle[2]+.07],[.067,.056,.14],palette.shoe);const fr=p[side+'footRot']||[0,p[side+'foot']||0,0];foot.rotation.set(fr[0]*D,fr[1]*D,fr[2]*D);
    }
    return g;
  }
  function cup(g,pos,rot=[0,0,0]) {
    const c=new T.Group();c.name='cup';g.add(c);c.position.set(...pos);c.rotation.set(...rot);
    const m=addMesh(c,new T.CylinderGeometry(.047,.038,.095,24),palette.paper);m.position.y=.012;
    addMesh(c,new T.CylinderGeometry(.040,.040,.004,24),0x6f5139,[0,.061,0]);
    const handle=addMesh(c,new T.TorusGeometry(.032,.009,8,18),palette.paper,[.053,.018,0]);return c;
  }
  function book(g,pos,open=true) {
    const b=new T.Group();b.name='book';g.add(b);b.position.set(...pos);
    const l=box(b,[-.085,0,0],[.168,.012,.225],palette.paper);const r=box(b,[.085,0,0],[.168,.012,.225],0xece3ce);l.rotation.z=-.10;r.rotation.z=.10;
    box(b,[0,-.016,0],[.353,.018,.24],0x6d7660);
    for(let i=0;i<7;i++){box(b,[-.086,.019,-.078+i*.023],[.123,.001,.002],0xb3ae9c);box(b,[.086,.019,-.078+i*.023],[.123,.001,.002],0xb3ae9c);}return b;
  }
  function chair(g,x=0,z=0){box(g,[x,.425,z],[.51,.09,.49],palette.lightwood);box(g,[x,.77,z-.23],[.49,.62,.05],palette.lightwood);for(const dx of [-.20,.20])for(const dz of [-.18,.18])limb(g,[x+dx,.40,z+dz],[x+dx*1.2,.035,z+dz*1.2],.022,.019,palette.wood);}
  function sofa(g){box(g,[0,.23,-.12],[1.8,.34,.83],0xa0a589);box(g,[0,.52,-.43],[1.8,.53,.18],palette.sofa);for(const x of [-.60,0,.60]){const cushion=ball(g,[x,.42,-.06],[.32,.1,.37],0xc2c3a9);}
    for(const x of [-.91,.91])box(g,[x,.42,-.10],[.15,.55,.85],palette.sofa);
    for(const x of [-.70,.70])for(const z of [-.4,.14])box(g,[x,.065,z],[.075,.13,.075],palette.wood);
    const pillow=ball(g,[.61,.69,-.31],[.23,.24,.085],0xd6ccb6);pillow.rotation.z=-.15;
  }
  function plant(g,x,z,scale=1){const p=new T.Group();g.add(p);p.position.set(x,0,z);p.scale.setScalar(scale);addMesh(p,new T.CylinderGeometry(.145,.11,.27,24),0xbba389,[0,.135,0]);addMesh(p,new T.CylinderGeometry(.135,.135,.008,24),0x73634b,[0,.274,0]);for(let i=0;i<8;i++){const a=i*2.4,h=.55+(i%3)*.15,tip=[Math.sin(a)*.23,h,Math.cos(a)*.23];limb(p,[0,.26,0],tip,.006,.003,0x667558);const leaf=ball(p,tip,[.074,.18,.025],i%2?0x7f8965:0x939873);leaf.rotation.set(.4,a,.5*Math.sin(a));}return p;}
  function rug(g,x,z,w,h){const m=addMesh(g,new T.CylinderGeometry(1,1,.014,64),0xd7c7ad,[x,.012,z]);m.scale.set(w/2,1,h/2);for(let i=0;i<8;i++){const a=i*.009+.05;const ring=addMesh(g,new T.TorusGeometry(1-a,.0013,3,80),0xc4b392,[x,.021,z]);ring.rotation.x=Math.PI/2;ring.scale.set(w/2,h/2,1);}return m;}
  function room(){
    const scene=new T.Scene();scene.background=new T.Color(0xe9e5dc);const world=new T.Group();scene.add(world);
    const floor=addMesh(world,new T.PlaneGeometry(8,7),palette.floor,[0,-.01,0]);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
    // Single-sided walls make a naturally cut-away dollhouse when seen from outside.
    const back=addMesh(world,new T.PlaneGeometry(6.8,2.8),palette.wall,[0,1.4,-2.6]);back.castShadow=false;
    const side=addMesh(world,new T.PlaneGeometry(6,2.8),0xe5e0d6,[-3.4,1.4,.4]);side.rotation.y=Math.PI/2;side.castShadow=false;
    for(let x=-3.25;x<=3.5;x+=.48)line(world,[[x,.001,-2.59],[x,.001,3.5]],0xc4bdaa,1,.30);
    box(world,[0,.06,-2.57],[6.8,.11,.045],0xf3ecde);
    // Window and sheer side panels on the back wall.
    box(world,[-1.78,1.65,-2.575],[1.63,1.72,.018],0xd3ddcf);
    for(const x of [-2.63,-1.78,-.93])box(world,[x,1.65,-2.535],[.04,1.83,.065],0xf8f0df);
    for(const y of [.75,1.66,2.55])box(world,[-1.78,y,-2.535],[1.74,.045,.065],0xf8f0df);
    box(world,[-1.78,.73,-2.48],[1.86,.07,.18],0xf4edde);
    for(const x of [-2.88,-.68]){for(let n=0;n<6;n++)ball(world,[x+(n-2.5)*.045,1.4,-2.48],[.037,1.14,.065],0xece5d7);}
    box(world,[1.2,1.87,-2.53],[.63,.8,.025],palette.wood);box(world,[1.2,1.87,-2.505],[.56,.73,.014],0xded8c9);ball(world,[1.20,1.91,-2.49],[.18,.25,.005],0xa5ac95);
    plant(world,2.20,-1.9,1.15);
    scene.add(new T.HemisphereLight(0xfff7e9,0xaca594,2.3));
    const sun=new T.DirectionalLight(0xfff4d9,3.0);sun.position.set(-3,5,2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=4;sun.shadow.camera.bottom=-4;sun.shadow.normalBias=.03;sun.shadow.bias=-.00015;sun.shadow.radius=4;scene.add(sun);
    const fill=new T.DirectionalLight(0xebf0e8,.9);fill.position.set(4,3,-1);scene.add(fill);
    // Soft contact pools complement the renderer's shadow map.
    return {scene,world};
  }
  const presets=[
    {name:'Window-side pause',short:'Window pause',tag:'STANDING',cue:'Cup haath mein rakho, weight ek pair par. Window ki taraf dekho.',tip:'Catch the pause between sips. Leave a little room in the direction of the gaze.',angle:32,distance:3.25,height:1.50,lens:48,target:1.02,facing:-22,subjectX:0,subjectZ:0,
      pose:{hip:[.045,.91,0],shoulder:[-.035,1.43,-.02],le:[-.31,1.12,.02],lw:[-.20,1.32,.23],re:[.29,1.15,.06],rw:[.055,1.29,.25],lk:[-.10,.52,-.01],la:[-.13,.10,-.045],rk:[.20,.50,.10],ra:[.22,.10,.14],headYaw:-30,headTilt:6,grip:true},
      props(g){cup(g,[-.07,1.33,.27]);box(g,[.79,.40,-.08],[.5,.055,.5],palette.lightwood);for(const x of [.6,.98])for(const z of [-.27,.10])box(g,[x,.20,z],[.025,.4,.025],palette.wood);addMesh(g,new T.CylinderGeometry(.065,.07,.18,20),0xe7d4b8,[.80,.51,-.09]);}, rug:[-.1,.1,2.25,1.8]},
    {name:'Sofa-side conversation',short:'Sofa conversation',tag:'SEATED',cue:'Sofa ke edge par baitho, thoda aage lean karo. Kisi se baat karte raho.',tip:'Come down to their eye level. Photograph the listening moment, just before they reply.',angle:-28,distance:2.85,height:1.05,lens:48,target:.84,facing:8,subjectX:0,subjectZ:0,
      pose:{hip:[-.20,.58,.02],shoulder:[-.14,1.05,.16],le:[-.48,.79,.22],lw:[-.39,.70,.47],re:[.21,.91,.02],rw:[.42,1.02,.08],lk:[-.35,.47,.48],la:[-.40,.10,.62],rk:[.06,.47,.43],ra:[.12,.10,.55],headYaw:14,headTilt:-8},props(g){sofa(g);},rug:[0,.40,2.8,2.2]},
    {name:'Walk & glance back',short:'Walk & glance',tag:'IN MOTION',cue:'Dheere se aage chalo. Kandhe ke upar se ek baar peeche dekho.',tip:'Let the step happen naturally. Keep extra space ahead of the movement; shoot between steps.',angle:28,distance:3.65,height:1.30,lens:48,target:1.0,facing:45,subjectX:0,subjectZ:0,
      pose:{hip:[0,.92,0],shoulder:[-.015,1.44,.03],le:[-.28,1.12,-.16],lw:[-.22,.90,-.30],re:[.27,1.17,.17],rw:[.21,.97,.32],lk:[-.13,.52,.24],la:[-.16,.10,.42],rk:[.12,.53,-.23],ra:[.15,.14,-.42],headYaw:-72,headTilt:-3,rfoot:12},props(g){box(g,[-1.0,.45,-1.0],[.45,.055,.8],palette.lightwood);for(const z of [-1.3,-.7])for(const x of [-1.16,-.84])box(g,[x,.225,z],[.035,.45,.035],palette.wood);plant(g,-1,-1,.68);},rug:[0,0,1.85,3.0]},
    {name:'Slow morning tea',short:'Morning tea',tag:'AT THE TABLE',cue:'Cup ko dono haathon se pakdo. Table par elbows relax rakho, nazar neeche.',tip:'Use a slightly higher camera, just off the shoulder line. Include the table to tell the story.',angle:42,distance:3.10,height:1.50,lens:50,target:.93,facing:-10,subjectX:0,subjectZ:0,
      pose:{hip:[0,.55,-.08],shoulder:[0,1.08,.10],le:[-.26,.88,.36],lw:[-.095,1.01,.43],re:[.28,.88,.37],rw:[.095,1.01,.44],lk:[-.14,.46,.38],la:[-.14,.1,.40],rk:[.15,.46,.35],ra:[.17,.1,.33],headPitch:18,headYaw:-8,grip:true},props(g){chair(g,0,-.16);addMesh(g,new T.CylinderGeometry(.56,.56,.065,48),palette.lightwood,[0,.76,.75]);limb(g,[0,.73,.75],[0,.08,.75],.075,.095,palette.wood);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;limb(g,[0,.10,.75],[Math.sin(a)*.39,.045,.75+Math.cos(a)*.39],.035,.025,palette.wood);}cup(g,[0,1.045,.45]);const b=book(g,[-.25,.808,.94]);b.scale.setScalar(.68);},rug:[0,.3,2.4,2.4]},
    {name:'Lost in a good book',short:'Floor reading',tag:'ON THE FLOOR',cue:'Rug par pair fold karke baitho. Book kholo aur sach mein padhna shuru karo.',tip:'Get low and stay quiet. Keep the hands and book in frame, with a little breathing room above.',angle:25,distance:2.6,height:.80,lens:46,target:.58,facing:-15,subjectX:0,subjectZ:0,
      pose:{hip:[0,.23,0],shoulder:[0,.72,.06],le:[-.27,.51,.16],lw:[-.19,.34,.35],re:[.28,.51,.18],rw:[.20,.34,.36],lk:[-.38,.15,.28],la:[.12,.09,.38],rk:[.38,.15,.25],ra:[-.14,.10,.40],headPitch:25,headYaw:5,lfoot:-70,rfoot:70},props(g){const cushion=ball(g,[0,.078,0],[.40,.085,.34],0x9ca486);book(g,[0,.32,.34]);box(g,[.65,.04,-.02],[.25,.07,.32],0xb77c61);box(g,[.66,.09,-.02],[.24,.03,.30],palette.paper);cup(g,[.63,.07,.37]);},rug:[0,.1,2.6,2.2]}
  ];
  const originalPoses=presets.map(p=>structuredClone(p.pose));
  if(Array.isArray(rigSaved?.poses)&&rigSaved.poses.length===5)rigSaved.poses.forEach((saved,i)=>{if(!saved)return;for(const [k,v]of Object.entries(saved)){if(Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<200))presets[i].pose[k]=v;else if(typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=200)presets[i].pose[k]=v;}});
  const scenes=presets.map(p=>{const s=room(),subject=new T.Group(),support=new T.Group(),figure=person(p.pose);s.scene.add(subject);subject.add(support,figure);p.props(support);rug(s.world,...p.rug);const helpers=new T.Group();s.scene.add(helpers);return {...s,subject,support,figure,helpers};});
  let renderer,shotRenderer;
  try {
    renderer=new T.WebGLRenderer({canvas:$('stage'),antialias:true,alpha:false,preserveDrawingBuffer:true});
    shotRenderer=new T.WebGLRenderer({canvas:$('shot'),antialias:true,alpha:false,preserveDrawingBuffer:true});
  }catch(e){$('loading').textContent='This preview needs WebGL. Open it in a browser with hardware acceleration enabled.';return;}
  for(const r of [renderer,shotRenderer]){r.setPixelRatio(Math.min(devicePixelRatio,2));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;}
  const overview=new T.PerspectiveCamera(39,1,.05,60);overview.layers.enable(1);
  const photo=new T.PerspectiveCamera(45,.8,.05,50);
  let current=0,state={...presets[0]},yaw=.69,pitch=.55,radius=7.7,mode='3d',drag=null,pending=false;
  const values=['angle','distance','height','lens','subjectX','subjectZ','facing','target'];
  function markHelper(object){object.traverse(o=>o.layers.set(1));return object;}
  const photoPosition=new T.Vector3(),aim=new T.Vector3();
  let photographer=null,frustum=null;
  function disposeObject(obj){obj.traverse(o=>{if(o.geometry&&!['SphereGeometry','BoxGeometry','CylinderGeometry'].includes(o.geometry.type))o.geometry.dispose();if(o.isLine)o.material.dispose();});obj.removeFromParent();}
  function cameraVisual(){
    const h=state.height,shy=Math.min(1.44,Math.max(.46,h-.19)),hipy=Math.max(.28,shy-.49),kny=Math.max(.18,hipy*.50);
    const p={hip:[0,hipy,-.32],shoulder:[0,shy,-.19],le:[-.28,shy-.18,.005],lw:[-.14,h-.04,-.045],re:[.28,shy-.18,.015],rw:[.14,h-.04,-.025],lk:[-.20,kny,.025],la:[-.22,.10,-.19],rk:[.20,kny,.005],ra:[.22,.10,-.17],headPitch:h<1.1?8:0,grip:true};
    const g=person(p,true);
    box(g,[0,h,-.072],[.25,.145,.105],0x303b35);box(g,[.075,h+.035,-.075],[.075,.16,.13],0x27352f);box(g,[0,h+.09,-.055],[.10,.044,.07],0x303b35);
    const lens=addMesh(g,new T.CylinderGeometry(.054,.060,.105,24),0x242f2a,[0,h,.002]);lens.rotation.x=Math.PI/2;
    const glass=addMesh(g,new T.CylinderGeometry(.044,.044,.004,24),material(0x4e7471,.16),[0,h,.056]);glass.rotation.x=Math.PI/2;
    const ring=addMesh(g,new T.TorusGeometry(.065,.006,6,30),0x77958b,[0,.024,0]);ring.rotation.x=Math.PI/2;ring.scale.setScalar(3.8);
    return markHelper(g);
  }
  function updateScene(rebuildPhotographer=false){
    const s=scenes[current];s.subject.position.set(state.subjectX,0,state.subjectZ);s.subject.rotation.y=state.facing*D;
    const a=state.angle*D;photoPosition.set(state.subjectX+Math.sin(a)*state.distance,state.height,state.subjectZ+Math.cos(a)*state.distance);aim.set(state.subjectX,state.target,state.subjectZ);
    photo.position.copy(photoPosition);photo.fov=2*Math.atan(45/(2*state.lens))/D;photo.aspect=.8;photo.lookAt(aim);photo.updateProjectionMatrix();photo.updateMatrixWorld();
    if(rebuildPhotographer||!photographer){if(photographer)disposeObject(photographer);photographer=cameraVisual();s.helpers.add(photographer);}
    photographer.position.set(photoPosition.x,0,photoPosition.z);photographer.rotation.y=Math.atan2(aim.x-photoPosition.x,aim.z-photoPosition.z);
    if(frustum)disposeObject(frustum);frustum=new T.Group();s.helpers.add(frustum);
    const to=aim.clone().sub(photoPosition).normalize(),right=new T.Vector3().setFromMatrixColumn(photo.matrixWorld,0),up=new T.Vector3().setFromMatrixColumn(photo.matrixWorld,1),dist=photoPosition.distanceTo(aim)*.72;
    const hh=Math.tan(photo.fov*D/2)*dist,hw=hh*.8,c=photoPosition.clone().addScaledVector(to,dist),corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>c.clone().addScaledVector(right,x*hw).addScaledVector(up,y*hh));
    for(const corner of corners)line(frustum,[photoPosition,corner],0x466e64,1,.35);
    line(frustum,[...corners,corners[0]],0x466e64,1,.30);
    const groundline=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(aim.x,.026,aim.z),new T.Vector3(photoPosition.x,.026,photoPosition.z)]),new T.LineDashedMaterial({color:0x466e64,dashSize:.065,gapSize:.06,transparent:true,opacity:.45}));groundline.computeLineDistances();frustum.add(groundline);
    const subring=addMesh(frustum,new T.TorusGeometry(.31,.008,6,64),0xb87558,[state.subjectX,.025,state.subjectZ]);subring.rotation.x=Math.PI/2;markHelper(frustum);
    updateUI();schedule();
  }
  function updateUI(){
    for(const key of values){$(key).value=state[key];$(key+'-value').value=key==='angle'||key==='facing'?`${Math.round(state[key])}°`:key==='lens'?`${state[key]} mm`:`${Number(state[key]).toFixed(2)} m`;}
    const label=state.height>.0&&state.height>presets[current].pose.shoulder[1]+.3?'HIGH ANGLE':state.height<presets[current].pose.shoulder[1]-.25?'LOW ANGLE':'EYE LEVEL';$('shot-caption').textContent=`${state.lens} MM · ${label}`;
    const map=p=>[90+p.x*18,79+p.z*18],sp=map(aim),cp=map(photoPosition);$('plan-subject').setAttribute('cx',sp[0]);$('plan-subject').setAttribute('cy',sp[1]);$('plan-camera').setAttribute('cx',cp[0]);$('plan-camera').setAttribute('cy',cp[1]);
    const toward=Math.atan2(sp[1]-cp[1],sp[0]-cp[0]),spread=Math.atan(18/state.lens),length=state.distance*18;
    const left=[cp[0]+Math.cos(toward-spread)*length,cp[1]+Math.sin(toward-spread)*length],right=[cp[0]+Math.cos(toward+spread)*length,cp[1]+Math.sin(toward+spread)*length];$('plan-cone').setAttribute('d',`M${cp} L${left} L${right} Z`);
    $('plan-direction').setAttribute('d',`M${sp} l${Math.sin(state.facing*D)*17},${Math.cos(state.facing*D)*17}`);
    $('shot').setAttribute('aria-label',`${presets[current].name}: ${state.lens} mm lens, camera ${state.distance.toFixed(2)} metres away, ${state.height.toFixed(2)} metres high, ${state.angle} degrees from the front.`);
  }
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;draw();});}
  function draw(){
    const wrap=$('stage-wrap'),w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;
    if(renderer.domElement.width!==Math.round(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);
    overview.aspect=w/h;overview.updateProjectionMatrix();const focus=new T.Vector3(.1,.65,.4);
    if(mode==='top'){overview.position.set(.1,9,.41);overview.up.set(0,0,-1);}else{overview.position.set(focus.x+Math.sin(yaw)*Math.cos(pitch)*radius,focus.y+Math.sin(pitch)*radius,focus.z+Math.cos(yaw)*Math.cos(pitch)*radius);overview.up.set(0,1,0);}
    overview.lookAt(focus);overview.updateMatrixWorld();renderer.render(scenes[current].scene,overview);
    const sw=$('shot').clientWidth,sh=$('shot').clientHeight;if(sw&&sh){if(shotRenderer.domElement.width!==Math.round(sw*shotRenderer.getPixelRatio())||shotRenderer.domElement.height!==Math.round(sh*shotRenderer.getPixelRatio()))shotRenderer.setSize(sw,sh,false);shotRenderer.render(scenes[current].scene,photo);}
    placeLabel('subject-label',new T.Vector3(state.subjectX,presets[current].pose.shoulder[1]+.49,state.subjectZ),w,h);
    placeLabel('camera-label',new T.Vector3(photoPosition.x,state.height+.40,photoPosition.z),w,h);
    $('loading').hidden=true;renderRig();
  }
  function placeLabel(id,p,w,h){p.project(overview);const el=$(id),x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;el.style.display=p.z>1||x<0||x>w||y<0||y>h?'none':'flex';el.style.transform=`translate(${Math.max(5,Math.min(w-el.offsetWidth-5,x-el.offsetWidth/2))}px,${Math.max(8,y)}px)`;}
  function select(index,restore=true){
    if(photographer){disposeObject(photographer);photographer=null;}if(frustum){disposeObject(frustum);frustum=null;}
    current=index;if(restore)state=Object.fromEntries(values.map(k=>[k,presets[index][k]]));
    const p=presets[index];$('scene-title').textContent=p.name;$('scene-cue').textContent=p.cue;$('photo-tip').textContent=p.tip;$('scene-number').textContent=`0${index+1} / 05`;$('scene-tag').textContent=p.tag;
    document.querySelectorAll('.pose-card').forEach((el,i)=>el.setAttribute('aria-pressed',i===index?'true':'false'));
    updateScene(true);if($('body-part').options.length){ensureRig();syncRigControls();}store();
  }
  function store(){try{localStorage.setItem('still-candid-v1',JSON.stringify({current,state}));}catch{}}
  presets.forEach((p,i)=>{const button=document.createElement('button');button.className='pose-card';button.setAttribute('aria-label',`Scene ${i+1}: ${p.name}`);button.setAttribute('aria-pressed',i===0?'true':'false');button.innerHTML=`<div class="thumb"><img id="thumb-${i}" alt="${p.name} pose preview"></div><div class="pose-card-text"><span class="pose-num">0${i+1}</span><strong>${p.short}</strong><span class="pose-check">✓</span></div>`;button.addEventListener('click',()=>select(i));$('pose-list').append(button);});
  function makeThumbnails(){
    const thumbRenderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});thumbRenderer.setSize(460,240);thumbRenderer.shadowMap.enabled=true;thumbRenderer.shadowMap.type=T.PCFSoftShadowMap;thumbRenderer.outputColorSpace=T.SRGBColorSpace;thumbRenderer.toneMapping=T.ACESFilmicToneMapping;thumbRenderer.toneMappingExposure=1.05;
    const cam=new T.PerspectiveCamera(36,460/240,.05,30);
    scenes.forEach((s,i)=>{const p=presets[i];s.subject.rotation.y=p.facing*D;const targetY=i===4?.43:i===1||i===3?.75:1.0;cam.position.set(2.4,2.1,4.1);cam.lookAt(0,targetY,0);thumbRenderer.render(s.scene,cam);$('thumb-'+i).src=thumbRenderer.domElement.toDataURL('image/png');});
    thumbRenderer.dispose();thumbRenderer.forceContextLoss();
  }
  for(const key of values)$(key).addEventListener('input',()=>{state[key]=Number($(key).value);updateScene(key==='height');store();});
  $('reset').addEventListener('click',()=>{yaw=.69;pitch=.55;radius=7.7;presets[current].pose=structuredClone(originalPoses[current]);rebuildFigure();select(current);saveRig();toast('Pose and camera restored');});
  for(const [id,m] of [['orbit-view','3d'],['top-view','top']])$(id).addEventListener('click',()=>{mode=m;$('orbit-view').setAttribute('aria-pressed',m==='3d');$('top-view').setAttribute('aria-pressed',m==='top');schedule();});
  $('grid-toggle').addEventListener('change',()=>{$('thirds').hidden=!$('grid-toggle').checked;});
  $('stage').addEventListener('pointerdown',e=>{if(mode==='top')return;drag={x:e.clientX,y:e.clientY,yaw,pitch};$('stage').setPointerCapture(e.pointerId);});
  $('stage').addEventListener('pointermove',e=>{if(!drag)return;yaw=drag.yaw-(e.clientX-drag.x)*.007;pitch=T.MathUtils.clamp(drag.pitch+(e.clientY-drag.y)*.006,.18,1.38);schedule();});
  $('stage').addEventListener('pointerup',()=>drag=null);$('stage').addEventListener('pointercancel',()=>drag=null);
  $('stage').addEventListener('wheel',e=>{e.preventDefault();radius=T.MathUtils.clamp(radius+e.deltaY*.004,4.6,11);schedule();},{passive:false});
  let planDrag=null;
  $('plan').addEventListener('pointerdown',e=>{if(!['plan-camera','plan-subject'].includes(e.target.id))return;planDrag=e.target.id;$('plan').setPointerCapture(e.pointerId);e.preventDefault();});
  $('plan').addEventListener('pointermove',e=>{if(!planDrag)return;const rect=$('plan').getBoundingClientRect(),x=((e.clientX-rect.left)*180/rect.width-90)/18,z=((e.clientY-rect.top)*168/rect.height-79)/18;
    if(planDrag==='plan-subject'){state.subjectX=Math.round(T.MathUtils.clamp(x,-.8,.8)*20)/20;state.subjectZ=Math.round(T.MathUtils.clamp(z,-.8,.8)*20)/20;}else{const dx=x-state.subjectX,dz=z-state.subjectZ;state.angle=Math.round(T.MathUtils.clamp(Math.atan2(dx,dz)/D,-160,160));state.distance=Math.round(T.MathUtils.clamp(Math.hypot(dx,dz),1.5,4.8)*20)/20;}updateScene();});
  $('plan').addEventListener('pointerup',()=>{planDrag=null;store();});$('plan').addEventListener('pointercancel',()=>planDrag=null);
  let toastTimer;function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2500);}
  $('save').addEventListener('click',()=>{const w=$('shot').clientWidth,h=$('shot').clientHeight,ratio=shotRenderer.getPixelRatio();shotRenderer.setPixelRatio(1);shotRenderer.setSize(1200,1500,false);shotRenderer.render(scenes[current].scene,photo);const a=document.createElement('a');a.download=`still-${String(current+1).padStart(2,'0')}-${presets[current].short.toLowerCase().replaceAll(' ','-')}.png`;a.href=shotRenderer.domElement.toDataURL('image/png');a.click();shotRenderer.setPixelRatio(ratio);shotRenderer.setSize(w,h,false);schedule();toast('Frame saved · 1200 × 1500');});
  const rigParts=[['hip','Pelvis / whole body','P'],['shoulder','Chest / spine','S'],['head','Head','H'],['ls','Left shoulder','L'],['le','Left elbow','L'],['lw','Left wrist','L'],['lhand','Left hand','L'],['rs','Right shoulder','R'],['re','Right elbow','R'],['rw','Right wrist','R'],['rhand','Right hand','R'],['lh','Left hip','L'],['lk','Left knee','L'],['la','Left ankle','L'],['lfoot','Left foot','L'],['rh','Right hip','R'],['rk','Right knee','R'],['ra','Right ankle','R'],['rfoot','Right foot','R']];
  const rotationKeys=new Set(['head','lhand','rhand','lfoot','rfoot']);
  const movementKeys=['hip','shoulder','ls','le','lw','rs','re','rw','lh','lk','la','rh','rk','ra'];
  let selectedJoint='rw',jointDrag=null;
  const rigButtons={};
  function ensureRig(){const p=presets[current].pose;for(const [side,sign]of[['l',-1],['r',1]]){p[side+'s']||=[p.shoulder[0]+sign*.20,p.shoulder[1]-.05,p.shoulder[2]];p[side+'h']||=[p.hip[0]+sign*.135*bodyShape.hips/56,p.hip[1]-.025,p.hip[2]];p[side+'handRot']||=[0,0,0];p[side+'footRot']||=[0,p[side+'foot']||0,0];p[side+'curl']??=p.grip?.8:.15;}}
  function saveRig(){try{localStorage.setItem('still-rig-v2',JSON.stringify({bodyShape,poses:presets.map(p=>p.pose)}));}catch{}}
  function jointPosition(key){const p=presets[current].pose;if(key==='head')return [p.shoulder[0],p.shoulder[1]+.22,p.shoulder[2]];if(key.endsWith('hand')){const s=key[0],v=V(p[s+'w']),d=v.clone().sub(V(p[s+'e'])).normalize();return v.addScaledVector(d,.095).toArray();}if(key.endsWith('foot')){const a=p[key[0]+'a'];return[a[0],a[1]-.025,a[2]+.15];}return p[key];}
  function rotation(key){const p=presets[current].pose;return key==='head'?[p.headPitch||0,p.headYaw||0,p.headTilt||0]:p[key+'Rot'];}
  function setRotation(key,v){const p=presets[current].pose;if(key==='head'){p.headPitch=v[0];p.headYaw=v[1];p.headTilt=v[2];}else p[key+'Rot']=v;}
  function rebuildFigure(){const s=scenes[current];disposeObject(s.figure);s.figure=person(presets[current].pose);s.subject.add(s.figure);const p=presets[current].pose;if(current===0||current===3){const c=s.support.getObjectByName('cup');if(c)c.position.copy(V(p.lw).add(V(p.rw)).multiplyScalar(.5).add(new T.Vector3(0,.04,.035)));}if(current===4){const b=s.support.getObjectByName('book');if(b)b.position.copy(V(p.lw).add(V(p.rw)).multiplyScalar(.5).add(new T.Vector3(0,-.035,.015)));}schedule();}
  function translate(keys,delta){const p=presets[current].pose;for(const key of keys)if(p[key])p[key]=V(p[key]).add(delta).toArray();}
  function solveIK(rootKey,middleKey,endKey,target){const p=presets[current].pose,a=V(p[rootKey]),b=V(p[middleKey]),c=V(p[endKey]),l1=a.distanceTo(b),l2=b.distanceTo(c);let delta=target.clone().sub(a),d=delta.length();if(d<.001)return;const dir=delta.normalize();d=T.MathUtils.clamp(d,Math.abs(l1-l2)+.002,l1+l2-.002);let pole=b.clone().sub(a);pole.addScaledVector(dir,-pole.dot(dir));if(pole.lengthSq()<.00001){pole=new T.Vector3(0,0,1);pole.addScaledVector(dir,-pole.dot(dir));if(pole.lengthSq()<.00001)pole.set(1,0,0);}pole.normalize();const along=(l1*l1-l2*l2+d*d)/(2*d),offset=Math.sqrt(Math.max(0,l1*l1-along*along));p[middleKey]=a.clone().addScaledVector(dir,along).addScaledVector(pole,offset).toArray();p[endKey]=a.clone().addScaledVector(dir,d).toArray();}
  function moveJoint(key,value){ensureRig();const p=presets[current].pose,target=V(value);target.y=Math.max(.065,target.y);const before=V(p[key]),delta=target.clone().sub(before),side=key[0];
    if(key==='hip')translate(movementKeys,delta);
    else if(key==='shoulder')translate(['shoulder','ls','le','lw','rs','re','rw'],delta);
    else if(key.endsWith('w'))solveIK(side+'s',side+'e',key,target);
    else if(key.endsWith('a'))solveIK(side+'h',side+'k',key,target);
    else if(key.endsWith('e')||key.endsWith('k')){const parent=side+(key.endsWith('e')?'s':'h'),child=side+(key.endsWith('e')?'w':'a'),a=V(p[parent]),length=before.distanceTo(a),direction=target.clone().sub(a);if(direction.lengthSq()<.00001)return;const actual=a.add(direction.setLength(length));translate([key,child],actual.sub(before));}
    else if(key.endsWith('s'))translate([key,side+'e',side+'w'],delta);
    else if(key.endsWith('h'))translate([key,side+'k',side+'a'],delta);
    rebuildFigure();syncRigControls();
  }
  function syncRigControls(){ensureRig();$('body-part').value=selectedJoint;const rotating=rotationKeys.has(selectedJoint),v=rotating?rotation(selectedJoint):jointPosition(selectedJoint),labels=rotating?['Tilt / pitch','Turn / yaw','Roll']:['Left / right','Up / down','Near / far'];for(let i=0;i<3;i++){const key=['jointX','jointY','jointZ'][i],input=$(key);input.min=rotating?-160:i===1?.065:-2;input.max=rotating?160:i===1?2.6:2;input.step=rotating?1:.01;input.value=v[i];$(key+'-label').textContent=labels[i];$(key+'-value').value=rotating?`${Math.round(v[i])}°`:`${v[i].toFixed(2)} m`;}
    for(const [id,key]of[['left-curl','lcurl'],['right-curl','rcurl']]){$(id).value=presets[current].pose[key]*100;$(id+'-value').value=`${Math.round(presets[current].pose[key]*100)}%`;}
    $('rig-status').textContent=rigParts.find(p=>p[0]===selectedJoint)[1]+(rotating?' · Drag to rotate, or use the controls below.':' · Drag to move; Near / far changes depth.');
  }
  function renderRig(){if(!$('rig-toggle').checked){$('rig-layer').hidden=true;return;}$('rig-layer').hidden=false;ensureRig();const w=$('shot').clientWidth,h=$('shot').clientHeight,s=scenes[current];s.subject.updateMatrixWorld(true);for(const [key,label]of rigParts){const local=jointPosition(key),world=s.subject.localToWorld(V(local)),point=world.project(photo),x=(point.x*.5+.5)*w,y=(-point.y*.5+.5)*h,b=rigButtons[key];b.hidden=point.z>1||point.z< -1||x<0||x>w||y<0||y>h;b.style.left=`${x}px`;b.style.top=`${y}px`;b.classList.toggle('active',key===selectedJoint);b.setAttribute('aria-pressed',key===selectedJoint);}}
  function selectJoint(key){selectedJoint=key;syncRigControls();schedule();}
  for(const [key,label,letter]of rigParts){const option=document.createElement('option');option.value=key;option.textContent=label;$('body-part').append(option);const b=document.createElement('button');b.className='rig-dot'+(rotationKeys.has(key)?' rotation':'');b.type='button';b.setAttribute('aria-label',`${label} — drag to ${rotationKeys.has(key)?'rotate':'move'}`);b.innerHTML=`${letter}<span>${label}</span>`;b.dataset.joint=key;$('rig-layer').append(b);rigButtons[key]=b;
    b.addEventListener('click',()=>selectJoint(key));b.addEventListener('pointerdown',e=>{e.preventDefault();selectJoint(key);const s=scenes[current];s.subject.updateMatrixWorld(true);const world=s.subject.localToWorld(V(jointPosition(key))),normal=photo.getWorldDirection(new T.Vector3()),plane=new T.Plane().setFromNormalAndCoplanarPoint(normal,world);jointDrag={key,startX:e.clientX,startY:e.clientY,plane,rotation:rotationKeys.has(key)?rotation(key).slice():null};b.setPointerCapture(e.pointerId);});
    b.addEventListener('pointermove',e=>{if(!jointDrag||jointDrag.key!==key)return;if(jointDrag.rotation){const r=jointDrag.rotation.slice();r[1]=T.MathUtils.clamp(r[1]+(e.clientX-jointDrag.startX)*.65,-160,160);r[0]=T.MathUtils.clamp(r[0]+(e.clientY-jointDrag.startY)*.65,-160,160);setRotation(key,r);rebuildFigure();syncRigControls();}else{const rect=$('shot').getBoundingClientRect(),ndc=new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),ray=new T.Raycaster();ray.setFromCamera(ndc,photo);const hit=new T.Vector3();if(ray.ray.intersectPlane(jointDrag.plane,hit))moveJoint(key,scenes[current].subject.worldToLocal(hit).toArray());}});
    b.addEventListener('pointerup',()=>{jointDrag=null;saveRig();});b.addEventListener('pointercancel',()=>{jointDrag=null;saveRig();});
    b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();selectJoint(key);const axis=['ArrowLeft','ArrowRight'].includes(e.key)?0:1,sign=['ArrowLeft','ArrowDown'].includes(e.key)?-1:1;if(rotationKeys.has(key)){const r=rotation(key).slice();r[axis]+=sign*3;setRotation(key,r);rebuildFigure();syncRigControls();}else{const p=jointPosition(key).slice();p[axis]+=sign*.025;moveJoint(key,p);}saveRig();});
  }
  $('body-part').addEventListener('change',()=>selectJoint($('body-part').value));
  $('rig-toggle').addEventListener('change',schedule);
  for(const [axis,id]of['jointX','jointY','jointZ'].map((id,i)=>[i,id]))$(id).addEventListener('input',()=>{if(rotationKeys.has(selectedJoint)){const r=rotation(selectedJoint).slice();r[axis]=Number($(id).value);setRotation(selectedJoint,r);rebuildFigure();syncRigControls();}else{const p=jointPosition(selectedJoint).slice();p[axis]=Number($(id).value);moveJoint(selectedJoint,p);}saveRig();});
  for(const key of ['bust','hips']){$(key).value=bodyShape[key];$(key+'-value').value=bodyShape[key];$(key).addEventListener('input',()=>{bodyShape[key]=Number($(key).value);$(key+'-value').value=bodyShape[key];scenes.forEach((s,i)=>{disposeObject(s.figure);s.figure=person(presets[i].pose);s.subject.add(s.figure);});saveRig();schedule();});}
  for(const [id,key]of[['left-curl','lcurl'],['right-curl','rcurl']])$(id).addEventListener('input',()=>{presets[current].pose[key]=Number($(id).value)/100;$(id+'-value').value=`${$(id).value}%`;rebuildFigure();saveRig();});
  $('reset-pose').addEventListener('click',()=>{presets[current].pose=structuredClone(originalPoses[current]);ensureRig();rebuildFigure();syncRigControls();saveRig();toast('Original pose restored');});
  new ResizeObserver(schedule).observe($('stage-wrap'));new ResizeObserver(schedule).observe($('shot'));
  makeThumbnails();
  try{const saved=JSON.parse(localStorage.getItem('still-candid-v1'));if(saved&&Number.isInteger(saved.current)&&saved.current>=0&&saved.current<5&&values.every(k=>Number.isFinite(saved.state?.[k]))){current=saved.current;state=saved.state;for(const key of values)state[key]=T.MathUtils.clamp(state[key],Number($(key).min),Number($(key).max));select(current,false);}else select(0);}catch{select(0);}
  const requestedPose=new URLSearchParams(location.search).get('pose');if(requestedPose!==null&&/^\d$/.test(requestedPose)&&Number(requestedPose)<5)select(Number(requestedPose));
  ensureRig();syncRigControls();
})();
