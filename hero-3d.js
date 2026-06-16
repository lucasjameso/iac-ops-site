/* ============================================================
   IAC — 3D Workflow Engine Hero  v5.0 (PRODUCTION)
   Three.js r128

   SHOWSTOPPER: "The Operational Engine Powers On"
   Five volumetric glass-metal nodes with canvas-texture labels
   assemble in 3D space, connected by glowing spline tubes.
   Coral data-pulses travel the network. Slow cinematic camera
   glide. Mouse parallax. Additive bloom glow.

   TIMELINE (ms from first frame):
     0    – ambient dust, grid, scene fades in
     400  – INTAKE node scales in
     620  – AUTOMATE node scales in
     820  – INTEGRATE node scales in
     1020 – OPERATE node scales in
     1240 – SOURCE node scales in
     1440 – edges draw in (staggered, 150ms apart)
     1800 – first data pulses launch
     ~2800– SOURCE goes ONLINE, coral surge
     9000 – periodic surge repeats

   MOBILE: reduced geometry, 1.5x DPR max.
   REDUCED MOTION: single static frame, no RAF.
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;
  var THREE = window.THREE;

  var FORCE  = /[?&]motion=1/.test(location.search);
  var REDUCE = !FORCE && window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE = window.innerWidth < 700;

  /* ================================================================
     RENDERER
     ================================================================ */
  var W   = canvas.offsetWidth  || 900;
  var H   = canvas.offsetHeight || 600;
  var DPR = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2);

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: !MOBILE,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(DPR);
  renderer.setSize(W, H);
  renderer.setClearColor(0x0a0a0a, 1);

  /* ================================================================
     SCENE & CAMERA
     ================================================================ */
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0a, MOBILE ? 0.036 : 0.022);

  var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
  camera.position.set(0, 0.8, 16);
  camera.lookAt(0, 0, 0);

  /* ================================================================
     LIGHTING
     ================================================================ */
  scene.add(new THREE.AmbientLight(0x1a1520, 4.5));

  var keyLight = new THREE.DirectionalLight(0xfff5ee, 2.0);
  keyLight.position.set(8, 14, 12);
  scene.add(keyLight);

  var rimLight = new THREE.DirectionalLight(0x3a5080, 0.9);
  rimLight.position.set(-12, -3, 4);
  scene.add(rimLight);

  var coralPt = new THREE.PointLight(0xe0623c, 9.0, 32);
  coralPt.position.set(0, 0, 7);
  scene.add(coralPt);

  var coldPt = new THREE.PointLight(0x2a3a5a, 4.5, 26);
  coldPt.position.set(-8, 6, -4);
  scene.add(coldPt);

  var warmFill = new THREE.PointLight(0xff8844, 3.0, 22);
  warmFill.position.set(9, -2, 5);
  scene.add(warmFill);

  /* ================================================================
     GRID FLOOR
     ================================================================ */
  (function () {
    var SIZE = 30, DIVS = 30;
    var step = SIZE / DIVS;
    var verts = [];
    for (var i = 0; i <= DIVS; i++) {
      var v = -SIZE / 2 + i * step;
      verts.push(-SIZE/2, -5.5, v,  SIZE/2, -5.5, v);
      verts.push(v, -5.5, -SIZE/2,  v, -5.5,  SIZE/2);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    var mat = new THREE.LineBasicMaterial({ color: 0x1e1e1e, transparent: true, opacity: 0.85 });
    scene.add(new THREE.LineSegments(geo, mat));
  })();

  /* ================================================================
     NODE LABEL TEXTURES
     Creates a canvas texture for each node with label + sub text
     ================================================================ */
  function makeNodeTexture(label, sub, isDb) {
    var cw = isDb ? 256 : 220, ch = 80;
    var c  = document.createElement('canvas');
    c.width = cw; c.height = ch;
    var ctx = c.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, cw, ch);

    // Label text
    ctx.font = 'bold 13px "DM Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.textBaseline = 'top';
    ctx.fillText(label, 28, 12);

    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 42); ctx.lineTo(cw, 42);
    ctx.stroke();

    // Sub text
    ctx.font = '10px "DM Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.fillText(sub, 28, 50);

    var tex = new THREE.CanvasTexture(c);
    return tex;
  }

  /* ================================================================
     NODE DEFINITIONS
     ================================================================ */
  var NODE_DEFS = [
    { id:'intake',    p:[-5.8,  0.0,  0.0], label:'INTAKE',          sub:'TRIGGER',  kind:'trigger' },
    { id:'automate',  p:[-0.3,  2.5,  0.7], label:'AUTOMATE',        sub:'TASK',     kind:'proc'    },
    { id:'integrate', p:[-0.3,  0.0, -0.7], label:'INTEGRATE',       sub:'SYNC',     kind:'proc'    },
    { id:'operate',   p:[-0.3, -2.5,  0.7], label:'OPERATE',         sub:'METRICS',  kind:'proc'    },
    { id:'source',    p:[ 5.8,  0.0,  0.0], label:'SOURCE OF TRUTH', sub:'DATABASE', kind:'db'      }
  ];

  var APPEAR_TIMES = { intake:400, automate:620, integrate:820, operate:1020, source:1240 };

  var nodeMap   = {};
  var nodeGroup = new THREE.Group();
  scene.add(nodeGroup);

  NODE_DEFS.forEach(function (def) {
    var isDb = def.kind === 'db';
    var nw   = isDb ? 2.3  : 1.75;
    var nh   = isDb ? 0.95 : 0.76;
    var nd   = 0.24;

    var group = new THREE.Group();

    /* ---- Main shell ---- */
    var shellGeo = new THREE.BoxGeometry(nw, nh, nd);
    var shellMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e24,
      metalness: 0.75,
      roughness: 0.22,
      transparent: true,
      opacity: 0.95
    });
    group.add(new THREE.Mesh(shellGeo, shellMat));

    /* ---- Edge wireframe ---- */
    var edgesGeo = new THREE.EdgesGeometry(shellGeo);
    var edgesMat = new THREE.LineBasicMaterial({ color: 0x4a4a58, transparent: true, opacity: 0.75 });
    group.add(new THREE.LineSegments(edgesGeo, edgesMat));

    /* ---- Coral top accent bar ---- */
    var accentGeo = new THREE.BoxGeometry(nw + 0.02, 0.055, nd + 0.02);
    var accentMat = new THREE.MeshBasicMaterial({ color: 0xe0623c });
    var accent    = new THREE.Mesh(accentGeo, accentMat);
    accent.position.y = nh / 2 + 0.027;
    group.add(accent);

    /* ---- Label texture plane ---- */
    var labelTex = makeNodeTexture(def.label, def.sub, isDb);
    var labelGeo = new THREE.PlaneGeometry(nw - 0.06, nh - 0.06);
    var labelMat = new THREE.MeshBasicMaterial({
      map: labelTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    var labelPlane = new THREE.Mesh(labelGeo, labelMat);
    labelPlane.position.z = nd / 2 + 0.002;
    group.add(labelPlane);

    /* ---- Front face inner glow (additive) ---- */
    var faceGeo = new THREE.PlaneGeometry(nw - 0.08, nh - 0.08);
    var faceMat = new THREE.MeshBasicMaterial({
      color: 0xe0623c,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = nd / 2 + 0.003;
    group.add(face);

    /* ---- Pip dot ---- */
    var pipGeo = new THREE.SphereGeometry(0.065, 8, 8);
    var pipMat = new THREE.MeshBasicMaterial({ color: 0xe0623c });
    var pip    = new THREE.Mesh(pipGeo, pipMat);
    pip.position.set(-nw / 2 + 0.22, 0.07, nd / 2 + 0.08);
    group.add(pip);

    /* ---- Halo ring (additive) ---- */
    var haloGeo = new THREE.RingGeometry(0.62, 0.72, 40);
    var haloMat = new THREE.MeshBasicMaterial({
      color: 0xe0623c,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    var halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.z = nd / 2 + 0.04;
    group.add(halo);

    /* ---- Outer glow volume (additive, large) ---- */
    var glowGeo = new THREE.BoxGeometry(nw + 0.65, nh + 0.65, nd + 0.65);
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0xe0623c,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    group.position.set(def.p[0], def.p[1], def.p[2]);
    group.scale.set(0.001, 0.001, 0.001);

    group.userData = {
      def:       def,
      shellMat:  shellMat,
      accentMat: accentMat,
      labelMat:  labelMat,
      faceMat:   faceMat,
      haloMat:   haloMat,
      glowMat:   glowMat,
      pulse:     0,
      online:    false,
      basePos:   new THREE.Vector3(def.p[0], def.p[1], def.p[2])
    };

    nodeGroup.add(group);
    nodeMap[def.id] = group;
  });

  /* ================================================================
     EDGES — TubeGeometry splines
     ================================================================ */
  var EDGE_DEFS = [
    { from:'intake',    to:'automate'   },
    { from:'intake',    to:'integrate'  },
    { from:'intake',    to:'operate'    },
    { from:'automate',  to:'source'     },
    { from:'integrate', to:'source'     },
    { from:'operate',   to:'source'     }
  ];

  var OFFSETS = [
    { y:  1.28, z:  0.98 },
    { y:  0.00, z: -0.98 },
    { y: -1.28, z:  0.98 },
    { y:  1.28, z:  0.98 },
    { y:  0.00, z: -0.98 },
    { y: -1.28, z:  0.98 }
  ];

  var EDGE_APPEAR_BASE = 1440;
  var EDGE_APPEAR_STEP = 150;

  var edgeGroup = new THREE.Group();
  scene.add(edgeGroup);

  var edgeObjects = [];

  EDGE_DEFS.forEach(function (def, idx) {
    var from = nodeMap[def.from];
    var to   = nodeMap[def.to];
    if (!from || !to) return;

    var p0  = from.userData.basePos.clone();
    var p1  = to.userData.basePos.clone();
    var off = OFFSETS[idx] || { y: 0, z: 0 };
    var mid = p0.clone().lerp(p1, 0.5);
    mid.y += off.y;
    mid.z += off.z;

    var curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
    var segs  = MOBILE ? 28 : 56;

    /* Base wire tube */
    var tubeGeo = new THREE.TubeGeometry(curve, segs, 0.024, 6, false);
    var tubeMat = new THREE.MeshBasicMaterial({ color: 0x2e2e38, transparent: true, opacity: 0.0 });
    edgeGroup.add(new THREE.Mesh(tubeGeo, tubeMat));

    /* Glow tube (additive) */
    var glowGeo = new THREE.TubeGeometry(curve, segs, 0.050, 6, false);
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0xe0623c, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    edgeGroup.add(new THREE.Mesh(glowGeo, glowMat));

    /* Bright core (additive, thinner) */
    var coreGeo = new THREE.TubeGeometry(curve, segs, 0.014, 4, false);
    var coreMat = new THREE.MeshBasicMaterial({
      color: 0xff9966, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    edgeGroup.add(new THREE.Mesh(coreGeo, coreMat));

    edgeObjects.push({
      def: def, curve: curve,
      tubeMat: tubeMat, glowMat: glowMat, coreMat: coreMat,
      lit: 0, appear: EDGE_APPEAR_BASE + idx * EDGE_APPEAR_STEP
    });
  });

  /* ================================================================
     PULSE PARTICLES
     ================================================================ */
  var MAX_P = MOBILE ? 70 : 160;
  var pPos  = new Float32Array(MAX_P * 3);
  var pCol  = new Float32Array(MAX_P * 3);
  var pSiz  = new Float32Array(MAX_P);

  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute('size',     new THREE.BufferAttribute(pSiz, 1));

  var pMat = new THREE.PointsMaterial({
    size: 0.18, vertexColors: true, transparent: true, opacity: 1.0,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  scene.add(new THREE.Points(pGeo, pMat));

  /* ================================================================
     AMBIENT DUST
     ================================================================ */
  var DUST_N = MOBILE ? 120 : 280;
  var dPos   = new Float32Array(DUST_N * 3);
  var dCol   = new Float32Array(DUST_N * 3);
  var dVel   = [];

  for (var di = 0; di < DUST_N; di++) {
    dPos[di*3]   = (Math.random() - 0.5) * 26;
    dPos[di*3+1] = (Math.random() - 0.5) * 16;
    dPos[di*3+2] = (Math.random() - 0.5) * 14 - 2;
    var br = Math.random() * 0.42;
    dCol[di*3]   = br * 0.9;
    dCol[di*3+1] = br * 0.4;
    dCol[di*3+2] = br * 0.25;
    dVel.push({
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.003,
      z: (Math.random() - 0.5) * 0.002
    });
  }
  var dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('color',    new THREE.BufferAttribute(dCol, 3));
  var dMat = new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  scene.add(new THREE.Points(dGeo, dMat));

  /* ================================================================
     PULSE STATE
     ================================================================ */
  var ROUTES = [
    ['intake','automate','source'],
    ['intake','integrate','source'],
    ['intake','operate','source']
  ];

  var pulses    = [];
  var routeIdx  = 0;
  var nextPulse = 1800;
  var nextSurge = 9000;
  var online    = false;
  var onlineAt  = 0;
  var events    = 0;

  function spawnPulse(route, big) {
    pulses.push({ route: route, seg: 0, t: 0, big: !!big, dead: false });
  }

  function getEdge(from, to) {
    for (var i = 0; i < edgeObjects.length; i++) {
      if (edgeObjects[i].def.from === from && edgeObjects[i].def.to === to)
        return edgeObjects[i];
    }
    return null;
  }

  /* ================================================================
     CAMERA
     ================================================================ */
  var camBase = new THREE.Vector3(0, 0.8, 16);
  var mX = 0, mY = 0, tmX = 0, tmY = 0;

  if (!REDUCE) {
    document.addEventListener('mousemove', function (e) {
      tmX = (e.clientX / window.innerWidth  - 0.5) * 2;
      tmY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    document.addEventListener('mouseleave', function () { tmX = 0; tmY = 0; });
  }

  /* ================================================================
     HELPERS
     ================================================================ */
  function easeOut3(x) { return 1 - Math.pow(1 - x, 3); }
  function clamp01(x)  { return x < 0 ? 0 : x > 1 ? 1 : x; }

  /* ================================================================
     RESIZE
     ================================================================ */
  function onResize() {
    W = canvas.offsetWidth  || 900;
    H = canvas.offsetHeight || 600;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  /* ================================================================
     MAIN LOOP
     ================================================================ */
  var startTime = null;
  var lastTime  = 0;
  var animId    = null;

  function frame(now) {
    animId = requestAnimationFrame(frame);

    if (startTime === null) { startTime = now; lastTime = now; }
    var elapsed = now - startTime;
    var dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    /* ---- Node scale-in + float ---- */
    NODE_DEFS.forEach(function (def) {
      var mesh = nodeMap[def.id];
      if (!mesh) return;
      var t = clamp01((elapsed - APPEAR_TIMES[def.id]) / 420);
      var s = easeOut3(t);
      mesh.scale.set(s, s, s);
      mesh.position.y = def.p[1] + Math.sin(elapsed * 0.00090 + def.p[0] * 0.65) * 0.09;
      mesh.rotation.y = Math.sin(elapsed * 0.00055 + def.p[0] * 0.4) * 0.048;
    });

    /* ---- Edge draw-in ---- */
    edgeObjects.forEach(function (eo) {
      var t = clamp01((elapsed - eo.appear) / 620);
      var e = easeOut3(t);
      eo.tubeMat.opacity = e * 0.50;
      eo.glowMat.opacity = eo.lit * 0.74;
      eo.coreMat.opacity = eo.lit * 0.90;
      eo.lit *= Math.pow(0.0001, dt);
    });

    /* ---- Spawn pulses ---- */
    if (elapsed >= nextPulse) {
      spawnPulse(ROUTES[routeIdx % 3], false);
      routeIdx++;
      nextPulse = elapsed + 920 + (routeIdx % 2 ? -130 : 130);
    }
    if (elapsed >= nextSurge) {
      ROUTES.forEach(function (r) { spawnPulse(r, true); });
      nextSurge = elapsed + 9000;
    }

    /* ---- Update pulses ---- */
    var SPEED = 0.54;
    pulses.forEach(function (p) {
      if (p.dead) return;
      p.t += SPEED * dt * (p.big ? 1.12 : 1.0);
      if (p.t >= 1) {
        var arrived = p.route[p.seg + 1];
        var arrivedMesh = nodeMap[arrived];
        if (arrivedMesh) arrivedMesh.userData.pulse = 1.0;
        var eo = getEdge(p.route[p.seg], p.route[p.seg + 1]);
        if (eo) eo.lit = 1.0;
        if (arrived === 'source') {
          events++;
          if (!online) {
            online = true; onlineAt = elapsed;
            window.__iacOnline = true;
            NODE_DEFS.forEach(function (d) {
              if (nodeMap[d.id]) nodeMap[d.id].userData.pulse = 1.0;
            });
            edgeObjects.forEach(function (eo) { eo.lit = 1.0; });
          }
          p.dead = true;
        } else { p.seg++; p.t = 0; }
      }
    });
    pulses = pulses.filter(function (p) { return !p.dead; });

    /* ---- Node glow ---- */
    NODE_DEFS.forEach(function (def) {
      var mesh = nodeMap[def.id];
      if (!mesh) return;
      mesh.userData.pulse = Math.max(0, mesh.userData.pulse - dt * 1.3);
      var pulse  = mesh.userData.pulse;
      var isLive = mesh.userData.online || (def.id === 'source' && online);
      var hot    = Math.max(pulse, isLive ? 0.65 : 0, def.id === 'intake' ? 0.22 : 0);

      mesh.userData.faceMat.opacity  = hot * 0.16;
      mesh.userData.haloMat.opacity  = hot * 0.46;
      mesh.userData.glowMat.opacity  = hot * 0.07;
      mesh.userData.labelMat.opacity = 0.70 + hot * 0.28;
      mesh.userData.accentMat.color.setRGB(
        0.88 + hot * 0.12,
        0.38 + hot * 0.22,
        0.24 + hot * 0.06
      );
      mesh.userData.shellMat.opacity = 0.78 + hot * 0.16;
    });

    /* ---- Coral point light breathe ---- */
    coralPt.intensity = 9.0 + Math.sin(elapsed * 0.0019) * 1.8 +
      (online ? Math.sin(elapsed * 0.0055) * 2.8 : 0);

    /* ---- Camera glide + parallax ---- */
    mX += (tmX - mX) * 0.042;
    mY += (tmY - mY) * 0.042;

    var gt = elapsed * 0.000092;
    camera.position.x = camBase.x + Math.sin(gt) * 1.6 + mX * 2.4;
    camera.position.y = camBase.y + Math.cos(gt * 0.60) * 0.65 - mY * 1.5;
    camera.position.z = camBase.z + Math.sin(gt * 0.34) * 1.1;
    camera.lookAt(0, 0, 0);

    /* ---- Dust drift ---- */
    for (var di = 0; di < DUST_N; di++) {
      dPos[di*3]   += dVel[di].x;
      dPos[di*3+1] += dVel[di].y;
      dPos[di*3+2] += dVel[di].z;
      if (dPos[di*3]   >  13) dPos[di*3]   = -13;
      if (dPos[di*3]   < -13) dPos[di*3]   =  13;
      if (dPos[di*3+1] >   8) dPos[di*3+1] =  -8;
      if (dPos[di*3+1] <  -8) dPos[di*3+1] =   8;
    }
    dGeo.attributes.position.needsUpdate = true;

    /* ---- Pulse particles ---- */
    var pIdx = 0;
    pulses.forEach(function (p) {
      if (p.dead || pIdx >= MAX_P - 7) return;
      var eo = getEdge(p.route[p.seg], p.route[p.seg + 1]);
      if (!eo) return;
      var pt = eo.curve.getPoint(p.t);
      pPos[pIdx*3] = pt.x; pPos[pIdx*3+1] = pt.y; pPos[pIdx*3+2] = pt.z;
      pCol[pIdx*3] = p.big ? 1.0 : 0.92;
      pCol[pIdx*3+1] = p.big ? 0.54 : 0.42;
      pCol[pIdx*3+2] = p.big ? 0.30 : 0.22;
      pSiz[pIdx] = p.big ? 0.26 : 0.18;
      pIdx++;
      for (var tr = 1; tr <= 5 && pIdx < MAX_P; tr++) {
        var trT  = Math.max(0, p.t - tr * 0.040);
        var trPt = eo.curve.getPoint(trT);
        var fa   = (1 - tr / 6) * 0.52;
        pPos[pIdx*3] = trPt.x; pPos[pIdx*3+1] = trPt.y; pPos[pIdx*3+2] = trPt.z;
        pCol[pIdx*3] = fa * 0.92; pCol[pIdx*3+1] = fa * 0.42; pCol[pIdx*3+2] = fa * 0.22;
        pSiz[pIdx] = (p.big ? 0.20 : 0.12) * (1 - tr / 6);
        pIdx++;
      }
    });
    for (var zi = pIdx; zi < MAX_P; zi++) {
      pPos[zi*3] = 0; pPos[zi*3+1] = -999; pPos[zi*3+2] = 0;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate    = true;
    pGeo.attributes.size.needsUpdate     = true;

    renderer.render(scene, camera);
  }

  /* ================================================================
     STATIC FALLBACK (reduced motion)
     ================================================================ */
  function renderStatic() {
    NODE_DEFS.forEach(function (def) {
      var mesh = nodeMap[def.id];
      if (!mesh) return;
      mesh.scale.set(1, 1, 1);
      var hot = 0;
      if (def.id === 'source') {
        mesh.userData.online = true;
        hot = 0.85;
      } else if (def.id === 'intake') {
        hot = 0.3;
      }
      mesh.userData.faceMat.opacity  = hot * 0.14;
      mesh.userData.haloMat.opacity  = hot * 0.42;
      mesh.userData.glowMat.opacity  = hot * 0.06;
      mesh.userData.labelMat.opacity = 0.70 + hot * 0.28;
      if (hot > 0) {
        mesh.userData.accentMat.color.setRGB(
          0.88 + hot * 0.12, 0.38 + hot * 0.22, 0.24 + hot * 0.06
        );
      }
    });
    edgeObjects.forEach(function (eo) {
      eo.tubeMat.opacity = 0.46;
      eo.glowMat.opacity = 0.32;
      eo.coreMat.opacity = 0.42;
    });
    online = true;
    window.__iacOnline = true;
    renderer.render(scene, camera);
  }

  /* ================================================================
     BOOT
     ================================================================ */
  if (REDUCE) {
    renderStatic();
  } else {
    animId = requestAnimationFrame(frame);
  }

  var stage = document.getElementById('stage');
  setTimeout(function () {
    if (stage) stage.classList.add('is-ready');
  }, REDUCE ? 0 : 60);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && animId) {
      cancelAnimationFrame(animId); animId = null;
    } else if (!document.hidden && !REDUCE && !animId) {
      lastTime = performance.now();
      animId = requestAnimationFrame(frame);
    }
  });

})();
