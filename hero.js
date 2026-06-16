/* IAC hero — operational engine coming online.
   Vanilla canvas. Build sweep -> ignition surge -> LIVE -> luminous data flow.
   60fps, parallax depth, reduced-motion static fallback. */
(function () {
  'use strict';

  var canvas = document.getElementById('graph');
  var stage  = document.getElementById('stage');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var force = /[?&]motion=1/.test(location.search);
  var seekM = location.search.match(/[?&]seek=(\d+)/);
  var seekOffset = seekM ? parseInt(seekM[1],10) : 0;
  var reduce = !force && window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // palette (dark panel)
  var CORAL = '#E0623C', CORAL_HOT = '#FF7A4D', CORAL_DEEP = '#C75B3F';
  var WIRE = 'rgba(255,255,255,0.13)';
  var GRID = 'rgba(255,255,255,0.045)';
  var GRID_HOT = 'rgba(224,98,60,0.12)';
  var NODE_FILL = 'rgba(255,255,255,0.02)';
  var NODE_STROKE = 'rgba(255,255,255,0.32)';
  var LABEL = 'rgba(255,255,255,0.68)';
  var LABEL_DIM = 'rgba(255,255,255,0.34)';
  var MONO = function (s, w) { return (w || 500) + ' ' + s + "px 'DM Mono', ui-monospace, monospace"; };

  /* ---- model ---- */
  var NODES = [
    { id:'intake',   nx:0.135, ny:0.50, label:'INTAKE',          sub:'TRIGGER', kind:'trigger', appear:700  },
    { id:'automate', nx:0.45,  ny:0.20, label:'AUTOMATE',        sub:'TASK',    kind:'proc',    appear:980  },
    { id:'integrate',nx:0.45,  ny:0.50, label:'INTEGRATE',       sub:'SYNC',    kind:'proc',    appear:1120 },
    { id:'operate',  nx:0.45,  ny:0.80, label:'OPERATE',         sub:'METRICS', kind:'proc',    appear:1260 },
    { id:'source',   nx:0.83,  ny:0.50, label:'SOURCE OF TRUTH', sub:'DATABASE',kind:'db',      appear:1480 }
  ];
  var N = {}; NODES.forEach(function (n) { N[n.id] = n; });
  var EDGES = [
    { from:'intake', to:'automate'  }, { from:'intake', to:'integrate' }, { from:'intake', to:'operate' },
    { from:'automate', to:'source' }, { from:'integrate', to:'source' }, { from:'operate', to:'source' }
  ];
  var ROUTES = [['intake','automate','source'],['intake','integrate','source'],['intake','operate','source']];

  var W=0,H=0,dpr=1,pad=0,nodeW=120,nodeH=46;

  function layout() {
    var r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W*dpr); canvas.height = Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    nodeW = Math.max(82, Math.min(140, W*0.15));
    nodeH = Math.max(38, Math.min(58, nodeW*0.42));
    pad   = Math.max(40, W*0.07);
    NODES.forEach(function (n) {
      n.cx = pad + n.nx*(W - pad*2);
      n.cy = pad*0.7 + n.ny*(H - pad*1.5);
      n.w  = n.kind==='db' ? nodeW*1.12 : nodeW;
      n.h  = n.kind==='db' ? nodeH*1.18 : nodeH;
      n.left=n.cx-n.w/2; n.right=n.cx+n.w/2; n.top=n.cy-n.h/2; n.bot=n.cy+n.h/2;
    });
    EDGES.forEach(buildEdge);
  }

  function buildEdge(e) {
    var a=N[e.from], b=N[e.to];
    var x0=a.right, y0=a.cy, x1=b.left, y1=b.cy, mx=(x0+x1)/2;
    var pts=[[x0,y0],[mx,y0],[mx,y1],[x1,y1]], len=0, segs=[];
    for (var i=0;i<pts.length-1;i++){
      var dx=pts[i+1][0]-pts[i][0], dy=pts[i+1][1]-pts[i][1], l=Math.hypot(dx,dy);
      segs.push({x:pts[i][0],y:pts[i][1],dx:dx,dy:dy,l:l,acc:len}); len+=l;
    }
    e.pts=pts; e.segs=segs; e.len=len; e.lit=0; e.appear=Math.max(a.appear,b.appear)+200;
  }
  function findEdge(f,t){ for(var i=0;i<EDGES.length;i++) if(EDGES[i].from===f&&EDGES[i].to===t) return EDGES[i]; return null; }
  function pointAt(e,d){ d=Math.max(0,Math.min(e.len,d));
    for(var i=0;i<e.segs.length;i++){ var s=e.segs[i];
      if(d<=s.acc+s.l||i===e.segs.length-1){ var t=s.l?(d-s.acc)/s.l:0; return [s.x+s.dx*t,s.y+s.dy*t]; } }
    return [e.pts[0][0],e.pts[0][1]]; }

  /* ---- pulses (data) ---- */
  var pulses=[];
  function spawn(route, big){ pulses.push({route:route,seg:0,d:0,big:!!big,dead:false}); }

  /* ---- state / timeline ---- */
  var t0=null, prev=0, started=false, running=false;
  var SPEED=235;
  var igniteQueue=[1600,1740,1880], iq=0;
  var nextSpawn=3100, spawnGap=900, routeIdx=0, surgeAt=9000;
  var online=false, onlineAt=0, events=0, eventsShown=0;

  function easeOut(x){ return 1-Math.pow(1-x,3); }
  function clamp01(x){ return x<0?0:x>1?1:x; }

  /* ---- helpers ---- */
  function crisp(v){ return Math.round(v)+0.5; }
  function glow(color, blur){ ctx.shadowColor=color; ctx.shadowBlur=blur; }
  function noGlow(){ ctx.shadowBlur=0; ctx.shadowColor='transparent'; }

  /* ---- grid ---- */
  function drawGrid(t){
    var step=Math.max(28, Math.min(40, W*0.045));
    var a=reduce?1:clamp01((t-150)/700);
    ctx.lineWidth=1;
    ctx.strokeStyle='rgba(255,255,255,'+(0.05*a).toFixed(3)+')';
    ctx.beginPath();
    for(var x=pad; x<W-pad*0.4; x+=step){ ctx.moveTo(crisp(x),pad*0.4); ctx.lineTo(crisp(x),H-pad*0.4); }
    for(var y=pad*0.4; y<H-pad*0.4; y+=step){ ctx.moveTo(pad,crisp(y)); ctx.lineTo(W-pad*0.4,crisp(y)); }
    ctx.stroke();
  }

  /* ---- construction sweep ---- */
  function sweepX(t){
    var dur=1300, p=clamp01((t-300)/dur);
    return pad + easeOut(p)*(W-pad*1.2);
  }
  function drawSweep(t){
    if(reduce||t>1750) return;
    var sx=sweepX(t), a=clamp01((t-300)/200)*clamp01((1750-t)/250);
    if(a<=0) return;
    ctx.save();
    glow(CORAL,16);
    ctx.strokeStyle='rgba(224,98,60,'+(0.85*a).toFixed(3)+')';
    ctx.lineWidth=1.5; ctx.beginPath();
    ctx.moveTo(crisp(sx),pad*0.5); ctx.lineTo(crisp(sx),H-pad*0.5); ctx.stroke();
    noGlow();
    // faint trail
    ctx.fillStyle='rgba(224,98,60,'+(0.05*a).toFixed(3)+')';
    ctx.fillRect(pad, pad*0.5, sx-pad, H-pad);
    ctx.restore();
  }

  /* ---- edges ---- */
  function edgeBuild(e,t){ return reduce?1:clamp01((t-e.appear)/420); }
  function drawEdge(e,t){
    var rev=easeOut(edgeBuild(e,t)); if(rev<=0) return;
    var drawLen=e.len*rev;
    // base wire
    ctx.strokeStyle=WIRE; ctx.lineWidth=1;
    strokePolyline(e,drawLen);
    // lit overlay (data afterglow)
    if(e.lit>0.01){
      ctx.save(); glow(CORAL,8);
      ctx.strokeStyle='rgba(224,98,60,'+(0.85*e.lit).toFixed(3)+')';
      ctx.lineWidth=1.6; strokePolyline(e,drawLen); ctx.restore();
    }
  }
  function strokePolyline(e,drawLen){
    ctx.beginPath(); var moved=false, acc=0;
    for(var i=0;i<e.segs.length;i++){ var s=e.segs[i]; var remain=drawLen-acc; if(remain<=0) break;
      var frac=Math.min(1,remain/(s.l||1)); var ex=s.x+s.dx*frac, ey=s.y+s.dy*frac;
      if(!moved){ ctx.moveTo(crisp(s.x),crisp(s.y)); moved=true; }
      ctx.lineTo(crisp(ex),crisp(ey)); acc+=s.l; }
    ctx.stroke();
  }

  /* ---- nodes ---- */
  function nodeAppear(n,t){ return reduce?1:clamp01((t-n.appear)/320); }
  function nodePulse(n,t){ if(!n.pulseAt) return 0; var k=(t-n.pulseAt)/600; return (k<0||k>1)?0:(1-k); }

  function drawNode(n,t){
    var rv=nodeAppear(n,t); if(rv<=0) return;
    var e=easeOut(rv), sc=0.9+0.1*e, pulse=nodePulse(n,t);
    var live=(n.id==='source'&&online);
    var hot=Math.max(pulse, live?0.5:0, n.kind==='trigger'?0.25:0);
    ctx.save();
    ctx.globalAlpha=e;
    ctx.translate(n.cx,n.cy); ctx.scale(sc,sc); ctx.translate(-n.cx,-n.cy);
    var x=n.left,y=n.top,w=n.w,h=n.h;

    // fill
    ctx.fillStyle=NODE_FILL; ctx.fillRect(x,y,w,h);
    if(hot>0){ ctx.fillStyle='rgba(224,98,60,'+(0.18*hot).toFixed(3)+')'; ctx.fillRect(x,y,w,h); }

    // border (glow when hot)
    if(hot>0.05){ ctx.save(); glow(CORAL, 10*hot); ctx.strokeStyle=live?CORAL:('rgba(224,98,60,'+(0.5+0.5*hot).toFixed(3)+')');
      ctx.lineWidth=live?1.6:1.3; ctx.strokeRect(crisp(x),crisp(y),Math.round(w),Math.round(h)); ctx.restore(); }
    else { ctx.strokeStyle=NODE_STROKE; ctx.lineWidth=1; ctx.strokeRect(crisp(x),crisp(y),Math.round(w),Math.round(h)); }

    // header rule
    ctx.strokeStyle=hot>0.05?('rgba(224,98,60,'+(0.4+0.6*hot).toFixed(3)+')'):'rgba(255,255,255,0.16)';
    ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,crisp(y+h*0.5)); ctx.lineTo(x+w,crisp(y+h*0.5)); ctx.stroke();

    // port chip
    ctx.fillStyle=hot>0.05?CORAL:'rgba(255,255,255,0.5)';
    if(hot>0.05){ ctx.save(); glow(CORAL,8); ctx.fillRect(x+9,y+h*0.5-9.5,7,7); ctx.restore(); }
    else ctx.fillRect(x+9,y+h*0.5-9.5,7,7);

    // db stacked lines
    if(n.kind==='db'){
      ctx.strokeStyle=live?'rgba(224,98,60,0.5)':'rgba(255,255,255,0.18)';
      ctx.beginPath(); ctx.moveTo(x,crisp(y+h*0.78)); ctx.lineTo(x+w,crisp(y+h*0.78)); ctx.stroke();
    }

    // labels
    ctx.textBaseline='middle'; ctx.textAlign='left';
    var lx=x+24;
    ctx.font=MONO(n.kind==='db'?12:11,600);
    var lab=n.label, maxw=w-(lx-x)-10;
    if(ctx.measureText(lab).width>maxw){ ctx.font=MONO(10,600); }
    ctx.fillStyle=live?CORAL:LABEL;
    ctx.fillText(lab, lx, y+h*0.27);
    ctx.font=MONO(8,400); ctx.fillStyle=live?'rgba(224,98,60,0.8)':LABEL_DIM;
    ctx.fillText(live?'● ONLINE':n.sub, lx, y+h*0.74);

    ctx.restore();

    // source bloom ring(s)
    if(n.id==='source'&&n.ringAt){
      var rk=(t-n.ringAt)/750;
      if(rk>=0&&rk<=1){ var rs=8+rk*40; ctx.save(); ctx.globalAlpha=(1-rk)*0.6; glow(CORAL,12);
        ctx.strokeStyle=CORAL; ctx.lineWidth=1.5;
        ctx.strokeRect(n.cx-n.w/2-rs,n.cy-n.h/2-rs,n.w+rs*2,n.h+rs*2); ctx.restore(); }
    }
  }

  /* ---- pulses ---- */
  function drawPulse(p,t){
    var e=findEdge(p.route[p.seg],p.route[p.seg+1]); if(!e){ p.dead=true; return; }
    var head=pointAt(e,p.d), sz=p.big?5:3.5;
    // trail
    for(var i=5;i>=1;i--){ var tp=pointAt(e,p.d-i*8); var a=(0.12*(6-i)/6)*(p.big?1.4:1);
      ctx.fillStyle='rgba(224,98,60,'+a.toFixed(3)+')'; ctx.fillRect(tp[0]-sz*0.6,tp[1]-sz*0.6,sz*1.2,sz*1.2); }
    ctx.save(); glow(CORAL_HOT,p.big?20:13);
    ctx.fillStyle=CORAL_HOT; ctx.fillRect(head[0]-sz,head[1]-sz,sz*2,sz*2);
    ctx.fillStyle='#fff'; ctx.fillRect(head[0]-sz*0.4,head[1]-sz*0.4,sz*0.8,sz*0.8);
    ctx.restore();
  }
  function updatePulses(t,dt){
    for(var i=0;i<pulses.length;i++){ var p=pulses[i];
      var e=findEdge(p.route[p.seg],p.route[p.seg+1]); if(!e){ p.dead=true; continue; }
      e.lit=1; // light current wire
      p.d+=SPEED*dt*(p.big?1.05:1);
      if(p.d>=e.len){ var arrived=p.route[p.seg+1]; N[arrived].pulseAt=t;
        if(arrived==='source'){ N.source.ringAt=t; events++; 
          if(!online){ online=true; onlineAt=t;
            // system-wide ignition surge the instant it goes live
            NODES.forEach(function(nn){ nn.pulseAt=t; });
            EDGES.forEach(function(ee){ ee.lit=1; });
          }
          p.dead=true; }
        else { p.seg+=1; p.d=0; } }
    }
    pulses=pulses.filter(function(p){return !p.dead;});
    // decay wire glow
    for(var k=0;k<EDGES.length;k++){ EDGES[k].lit*=Math.pow(0.0001,dt); }
  }

  /* ---- HUD ---- */
  function drawHUD(t){
    var hx=pad, hy=pad*0.5, ls=Math.max(9,Math.min(11,W*0.011));
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    // title
    ctx.font=MONO(ls-1,500); ctx.fillStyle=LABEL_DIM;
    ctx.fillText('IAC · WORKFLOW ENGINE', hx, hy);
    // status pill
    var booting=!online;
    var dotX=hx, dotY=hy+20;
    var pulse=online?(0.5+0.5*Math.sin(t/300)):(0.5+0.5*Math.sin(t/180));
    ctx.save(); glow(CORAL, online?(6+6*pulse):0);
    ctx.fillStyle=booting?'rgba(255,255,255,0.5)':CORAL;
    ctx.fillRect(dotX, dotY-8, 8,8); ctx.restore();
    ctx.font=MONO(ls,600); ctx.fillStyle=online?CORAL:LABEL;
    ctx.fillText(online?'LIVE':'BOOTING…', dotX+15, dotY);
    // throughput counter (after live)
    if(online){
      eventsShown += (events-eventsShown)*0.12;
      var num = events*73 + Math.floor((onlineAt? (t-onlineAt):0)/420);
      var s=('000000'+num).slice(-6);
      ctx.font=MONO(ls-1,400); ctx.fillStyle=LABEL_DIM;
      ctx.fillText('EVENTS PROCESSED', hx, dotY+22);
      ctx.font=MONO(ls+3,500); ctx.fillStyle=LABEL;
      ctx.fillText(s, hx, dotY+42);
    }
  }

  /* ---- parallax ---- */
  var px=0,py=0,tx=0,ty=0;
  if(!reduce && window.matchMedia('(hover:hover)').matches){
    stage.addEventListener('pointermove',function(ev){
      var r=canvas.getBoundingClientRect();
      tx=((ev.clientX-r.left)/r.width-0.5)*22; ty=((ev.clientY-r.top)/r.height-0.5)*16;
    });
    stage.addEventListener('pointerleave',function(){ tx=0; ty=0; });
  }

  /* ---- loop ---- */
  function frame(now){
    running=true;
    if(t0===null){ t0=now-seekOffset; prev=now; }
    if(document.hidden && !force){ prev=now; requestAnimationFrame(frame); return; }
    var t=now-t0, dt=Math.min(0.05,(now-prev)/1000); prev=now;

    while(iq<igniteQueue.length && t>=igniteQueue[iq]){ spawn(ROUTES[iq%3], true); iq++; }
    if(iq>=igniteQueue.length){
      if(t>=nextSpawn){ spawn(ROUTES[routeIdx%3], false); routeIdx++; nextSpawn=t+spawnGap+(routeIdx%2?-140:140); }
      if(t>=surgeAt){ spawn(ROUTES[0],true); spawn(ROUTES[1],true); spawn(ROUTES[2],true); surgeAt=t+8500; }
    }
    updatePulses(t,dt);
    px+=(tx-px)*0.06; py+=(ty-py)*0.06;

    ctx.clearRect(0,0,W,H);
    // grid (shallow parallax)
    ctx.save(); ctx.translate(px*0.35,py*0.35); ctx.globalAlpha=Math.min(1,t/450); drawGrid(t); ctx.restore();
    // content (full parallax)
    ctx.save(); ctx.translate(px,py); ctx.globalAlpha=Math.min(1,t/450);
    drawSweep(t);
    EDGES.forEach(function(e){ drawEdge(e,t); });
    pulses.forEach(function(p){ drawPulse(p,t); });
    NODES.forEach(function(n){ drawNode(n,t); });
    noGlow();
    ctx.restore();
    // HUD (fixed)
    ctx.globalAlpha=Math.min(1,Math.max(0,(t-400)/600));
    drawHUD(t); noGlow(); ctx.globalAlpha=1;

    requestAnimationFrame(frame);
  }

  /* ---- static (reduced motion) ---- */
  function renderStatic(){
    online=true; events=128; eventsShown=128; onlineAt=0; layout();
    ctx.clearRect(0,0,W,H); var t=99999;
    drawGrid(t);
    EDGES.forEach(function(e){ e.lit=0.5; drawEdge(e,t); });
    [['intake','automate',0.45],['intake','integrate',0.6],['operate','source',0.4],['integrate','source',0.7]]
      .forEach(function(pr){ var e=findEdge(pr[0],pr[1]); if(!e) return; var pt=pointAt(e,e.len*pr[2]);
        ctx.save(); glow(CORAL_HOT,12); ctx.fillStyle=CORAL_HOT; ctx.fillRect(pt[0]-4,pt[1]-4,8,8); ctx.restore(); });
    NODES.forEach(function(n){ drawNode(n,t); });
    noGlow(); drawHUD(1000);
  }

  /* ---- boot ---- */
  // Single-flight rAF: ensures exactly one loop runs even if start()/resize
  // both request a frame. Without this, each resize spawns a parallel rAF
  // chain, compounding into speed-up and jank.
  function kick(){ if(running) return; running=true; requestAnimationFrame(frame); }

  function start(){ if(started) return; started=true; layout();
    if(reduce){ renderStatic(); return; }
    kick(); }

  var ro=new ResizeObserver(function(){ if(reduce){ renderStatic(); } else { layout(); kick(); } });
  ro.observe(canvas);

  function ready(){ stage.classList.add('is-ready'); }
  requestAnimationFrame(function(){ requestAnimationFrame(ready); });
  setTimeout(ready,120);

  start();
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ if(reduce) renderStatic(); else layout(); });
  }
})();
