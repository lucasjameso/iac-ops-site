/* ============================================================
   IAC — 3D Workflow Engine Hero  v7.0 (n8n-STYLE FINAL)
   Three.js r128

   A real n8n-style automation workflow rendered in dramatic 3D.
   Clean rounded-rect node cards with icons + labels, bezier
   connection wires, cascading green execution highlights.

   WORKFLOW:
     Trigger → Validate → CRM → Database → Notify

   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;
  var THREE = window.THREE;

  var REDUCE = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE = window.innerWidth < 700;

  /* ================================================================
     RENDERER
     ================================================================ */
  var W = canvas.offsetWidth || 900;
  var H = canvas.offsetHeight || 600;
  var DPR = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2);

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: true, alpha: false
  });
  renderer.setPixelRatio(DPR);
  renderer.setSize(W, H);
  renderer.setClearColor(0x0f1117, 1);

  /* ================================================================
     SCENE & CAMERA
     ================================================================ */
  var scene = new THREE.Scene();

  // Camera: slightly elevated, looking at the workflow with subtle perspective
  var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
  camera.position.set(0.4, 3.0, 14.0);
  camera.lookAt(0.4, 0.5, 0);

  /* ================================================================
     LIGHTING
     ================================================================ */
  scene.add(new THREE.AmbientLight(0x2a2e3a, 5.0));

  var keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(4, 10, 8);
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0x4466aa, 0.6);
  fillLight.position.set(-6, 3, -4);
  scene.add(fillLight);

  var rimLight = new THREE.DirectionalLight(0x6644aa, 0.3);
  rimLight.position.set(0, -2, 8);
  scene.add(rimLight);

  /* ================================================================
     DOT GRID (n8n canvas style)
     ================================================================ */
  (function () {
    var GRID = MOBILE ? 30 : 50;
    var SPACING = 0.9;
    var positions = [], colors = [];
    for (var gx = -GRID/2; gx <= GRID/2; gx++) {
      for (var gz = -GRID/2; gz <= GRID/2; gz++) {
        positions.push(gx * SPACING, -0.01, gz * SPACING);
        var dist = Math.sqrt(gx*gx + gz*gz) / (GRID * 0.45);
        var alpha = Math.max(0, 0.6 - dist * 0.5);
        colors.push(alpha * 0.45, alpha * 0.50, alpha * 0.65);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    var mat = new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 1.0,
      depthWrite: false, sizeAttenuation: true
    });
    scene.add(new THREE.Points(geo, mat));
  })();

  /* ================================================================
     WORKFLOW GROUP — tilted for perspective
     ================================================================ */
  var workflowGroup = new THREE.Group();
  workflowGroup.rotation.x = -0.22;
  workflowGroup.rotation.y = 0.03;
  workflowGroup.scale.set(0.95, 0.95, 0.95);
  workflowGroup.position.set(0.2, 0.3, 0);
  scene.add(workflowGroup);

  /* ================================================================
     NODE CARD BUILDER
     ================================================================ */
  function makeRoundedRectShape(w, h, r) {
    var s = new THREE.Shape();
    var x = -w/2, y = -h/2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function createNodeCard(config) {
    var group = new THREE.Group();
    var cardW = 1.35;
    var cardH = 1.15;
    var cardD = 0.10;
    var cornerR = 0.22;

    /* Card body */
    var shape = makeRoundedRectShape(cardW, cardH, cornerR);
    var cardGeo = new THREE.ExtrudeGeometry(shape, { depth: cardD, bevelEnabled: false });
    var cardMat = new THREE.MeshStandardMaterial({
      color: 0x1c2030,
      metalness: 0.05,
      roughness: 0.8,
      transparent: true,
      opacity: 0.96
    });
    group.add(new THREE.Mesh(cardGeo, cardMat));

    /* Border */
    var borderShape = makeRoundedRectShape(cardW, cardH, cornerR);
    var borderPoints = borderShape.getPoints(60);
    var borderGeo = new THREE.BufferGeometry().setFromPoints(
      borderPoints.map(function(p) { return new THREE.Vector3(p.x, p.y, cardD + 0.001); })
    );
    var borderMat = new THREE.LineBasicMaterial({ color: 0x3a4050, transparent: true, opacity: 0.85 });
    group.add(new THREE.Line(borderGeo, borderMat));

    /* Execution highlight border */
    var hlBorderMat = new THREE.LineBasicMaterial({ color: 0x4ecb71, transparent: true, opacity: 0.0 });
    group.add(new THREE.Line(borderGeo.clone(), hlBorderMat));

    /* Execution glow plane behind card */
    var glowShape = makeRoundedRectShape(cardW + 0.4, cardH + 0.4, cornerR + 0.12);
    var glowGeo = new THREE.ShapeGeometry(glowShape);
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0x4ecb71, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    var glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.z = -0.02;
    group.add(glowMesh);

    /* Icon background circle */
    var iconBgGeo = new THREE.CircleGeometry(0.38, 32);
    var iconBgMat = new THREE.MeshBasicMaterial({
      color: config.iconBg || 0x2a2e38, transparent: true, opacity: 0.92
    });
    var iconBg = new THREE.Mesh(iconBgGeo, iconBgMat);
    iconBg.position.set(0, 0.28, cardD + 0.005);
    group.add(iconBg);

    /* Icon text */
    var ic = document.createElement('canvas');
    ic.width = 64; ic.height = 64;
    var ictx = ic.getContext('2d');
    ictx.clearRect(0, 0, 64, 64);
    ictx.font = '34px sans-serif';
    ictx.textAlign = 'center';
    ictx.textBaseline = 'middle';
    ictx.fillStyle = config.iconColor || '#ffffff';
    ictx.fillText(config.icon, 32, 34);
    var iconTex = new THREE.CanvasTexture(ic);
    var iconGeo = new THREE.PlaneGeometry(0.56, 0.56);
    var iconMat = new THREE.MeshBasicMaterial({ map: iconTex, transparent: true, depthWrite: false });
    var iconMesh = new THREE.Mesh(iconGeo, iconMat);
    iconMesh.position.set(0, 0.28, cardD + 0.01);
    group.add(iconMesh);

    /* Label */
    var lc = document.createElement('canvas');
    lc.width = 256; lc.height = 56;
    var lctx = lc.getContext('2d');
    lctx.clearRect(0, 0, 256, 56);
    lctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'top';
    lctx.fillStyle = '#e4e6ec';
    lctx.fillText(config.label, 128, 4);
    if (config.sub) {
      lctx.font = '12px system-ui, sans-serif';
      lctx.fillStyle = '#6a6e7a';
      lctx.fillText(config.sub, 128, 28);
    }
    var labelTex = new THREE.CanvasTexture(lc);
    var labelGeo = new THREE.PlaneGeometry(cardW - 0.2, 0.44);
    var labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false });
    var labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, -0.42, cardD + 0.005);
    group.add(labelMesh);

    /* Input port */
    if (config.hasInput) {
      var inGeo = new THREE.CircleGeometry(0.09, 16);
      var inMat = new THREE.MeshBasicMaterial({ color: 0x5a5e6a });
      var inPort = new THREE.Mesh(inGeo, inMat);
      inPort.position.set(-cardW/2, 0, cardD + 0.005);
      group.add(inPort);
      // Port ring
      var inRingGeo = new THREE.RingGeometry(0.09, 0.12, 16);
      var inRingMat = new THREE.MeshBasicMaterial({ color: 0x3a3e4a, side: THREE.DoubleSide });
      var inRing = new THREE.Mesh(inRingGeo, inRingMat);
      inRing.position.set(-cardW/2, 0, cardD + 0.006);
      group.add(inRing);
    }

    /* Output port */
    if (config.hasOutput) {
      var outGeo = new THREE.CircleGeometry(0.09, 16);
      var outMat = new THREE.MeshBasicMaterial({ color: 0x5a5e6a });
      var outPort = new THREE.Mesh(outGeo, outMat);
      outPort.position.set(cardW/2, 0, cardD + 0.005);
      group.add(outPort);
      var outRingGeo = new THREE.RingGeometry(0.09, 0.12, 16);
      var outRingMat = new THREE.MeshBasicMaterial({ color: 0x3a3e4a, side: THREE.DoubleSide });
      var outRing = new THREE.Mesh(outRingGeo, outRingMat);
      outRing.position.set(cardW/2, 0, cardD + 0.006);
      group.add(outRing);
    }

    /* Trigger bolt */
    if (config.isTrigger) {
      var bc = document.createElement('canvas');
      bc.width = 32; bc.height = 32;
      var bctx = bc.getContext('2d');
      bctx.clearRect(0, 0, 32, 32);
      bctx.font = '20px sans-serif';
      bctx.textAlign = 'center';
      bctx.textBaseline = 'middle';
      bctx.fillStyle = '#e0623c';
      bctx.fillText('⚡', 16, 16);
      var boltTex = new THREE.CanvasTexture(bc);
      var boltGeo = new THREE.PlaneGeometry(0.30, 0.30);
      var boltMat = new THREE.MeshBasicMaterial({ map: boltTex, transparent: true, depthWrite: false });
      var bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(-cardW/2 - 0.26, 0.60, cardD + 0.005);
      group.add(bolt);
    }

    group.userData = {
      cardMat: cardMat,
      borderMat: borderMat,
      hlBorderMat: hlBorderMat,
      glowMat: glowMat,
      config: config,
      executing: 0,
      cardW: cardW,
      cardH: cardH
    };

    return group;
  }

  /* ================================================================
     WORKFLOW NODES — tighter spacing for better composition
     ================================================================ */
  var NODES = [
    { id:'trigger',  x:-3.2, y:0, label:'New Job',          sub:'webhook trigger',  icon:'📋', iconBg:0x1a3a2a, iconColor:'#4ecb71', isTrigger:true,  hasInput:false, hasOutput:true },
    { id:'validate', x:-1.6, y:0, label:'Validate & Route', sub:'transform data',   icon:'⚙',  iconBg:0x2a2040, iconColor:'#a78bfa', isTrigger:false, hasInput:true,  hasOutput:true },
    { id:'crm',      x: 0.0, y:0, label:'Update CRM',      sub:'HTTP request',     icon:'🌐', iconBg:0x1a2a3a, iconColor:'#60a5fa', isTrigger:false, hasInput:true,  hasOutput:true },
    { id:'database', x: 1.6, y:0, label:'Log to DB',        sub:'postgres write',   icon:'🗄',  iconBg:0x1a3030, iconColor:'#34d399', isTrigger:false, hasInput:true,  hasOutput:true },
    { id:'notify',   x: 3.2, y:0, label:'Notify Team',      sub:'slack message',    icon:'🔔', iconBg:0x3a2a1a, iconColor:'#fbbf24', isTrigger:false, hasInput:true,  hasOutput:false }
  ];

  var nodeMeshes = {};
  NODES.forEach(function (n) {
    var card = createNodeCard(n);
    card.position.set(n.x, n.y, 0);
    card.scale.set(0.001, 0.001, 0.001);
    workflowGroup.add(card);
    nodeMeshes[n.id] = card;
  });

  /* ================================================================
     BEZIER CONNECTIONS
     ================================================================ */
  var CONNECTIONS = [
    { from:'trigger',  to:'validate' },
    { from:'validate', to:'crm' },
    { from:'crm',      to:'database' },
    { from:'database', to:'notify' }
  ];

  var connObjects = [];

  CONNECTIONS.forEach(function (conn) {
    var fromN = NODES.find(function(n){ return n.id === conn.from; });
    var toN   = NODES.find(function(n){ return n.id === conn.to; });
    if (!fromN || !toN) return;

    var fromMesh = nodeMeshes[conn.from];
    var toMesh   = nodeMeshes[conn.to];
    var fw = fromMesh.userData.cardW;
    var tw = toMesh.userData.cardW;

    var sx = fromN.x + fw/2;
    var ex = toN.x - tw/2;
    var controlOffset = (ex - sx) * 0.4;

    var curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(sx, 0, 0.05),
      new THREE.Vector3(sx + controlOffset, 0, 0.05),
      new THREE.Vector3(ex - controlOffset, 0, 0.05),
      new THREE.Vector3(ex, 0, 0.05)
    );

    var pts = curve.getPoints(50);
    var wireGeo = new THREE.BufferGeometry().setFromPoints(pts);

    /* Base wire */
    var wireMat = new THREE.LineBasicMaterial({ color: 0x4a5060, transparent: true, opacity: 0.0 });
    workflowGroup.add(new THREE.Line(wireGeo, wireMat));

    /* Execution wire */
    var hlMat = new THREE.LineBasicMaterial({ color: 0x4ecb71, transparent: true, opacity: 0.0 });
    workflowGroup.add(new THREE.Line(wireGeo.clone(), hlMat));

    /* Arrow triangle */
    var arrowGeo = new THREE.ConeGeometry(0.07, 0.20, 6);
    var arrowMat = new THREE.MeshBasicMaterial({ color: 0x4a5060, transparent: true, opacity: 0.0 });
    var arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.set(ex - 0.12, 0, 0.05);
    workflowGroup.add(arrow);

    connObjects.push({
      conn: conn, curve: curve,
      wireMat: wireMat, hlMat: hlMat, arrowMat: arrowMat,
      lit: 0, appear: 0
    });
  });

  var WIRE_APPEAR_BASE = 1500;
  connObjects.forEach(function (co, idx) {
    co.appear = WIRE_APPEAR_BASE + idx * 180;
  });

  /* ================================================================
     EXECUTION PULSE PARTICLES
     ================================================================ */
  var MAX_P = 60;
  var pPos = new Float32Array(MAX_P * 3);
  var pCol = new Float32Array(MAX_P * 3);
  var pSiz = new Float32Array(MAX_P);
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  pGeo.setAttribute('size', new THREE.BufferAttribute(pSiz, 1));
  var pMat = new THREE.PointsMaterial({
    size: 0.24, vertexColors: true, transparent: true, opacity: 1.0,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  workflowGroup.add(new THREE.Points(pGeo, pMat));

  /* ================================================================
     ANIMATION STATE
     ================================================================ */
  var NODE_APPEAR = { trigger:300, validate:520, crm:740, database:960, notify:1180 };
  var EXEC_CYCLE = 5500;
  var EXEC_START = 2600;
  var nextExec = EXEC_START;

  var execPulses = [];

  function startExec(elapsed) {
    execPulses = [];
    CONNECTIONS.forEach(function (conn, idx) {
      execPulses.push({ idx: idx, t: 0, start: elapsed + idx * 380, active: false, done: false });
    });
    // Light trigger immediately
    nodeMeshes['trigger'].userData.executing = 1.0;
  }

  /* ================================================================
     CAMERA
     ================================================================ */
  var mX = 0, mY = 0, tmX = 0, tmY = 0;
  if (!REDUCE) {
    document.addEventListener('mousemove', function (e) {
      tmX = (e.clientX / window.innerWidth - 0.5) * 2;
      tmY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  /* ================================================================
     HELPERS
     ================================================================ */
  function easeOut3(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  /* ================================================================
     RESIZE
     ================================================================ */
  window.addEventListener('resize', function () {
    W = canvas.offsetWidth || 900;
    H = canvas.offsetHeight || 600;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  });

  /* ================================================================
     MAIN LOOP
     ================================================================ */
  var startTime = null, lastTime = 0, animId = null;

  function frame(now) {
    animId = requestAnimationFrame(frame);
    if (startTime === null) { startTime = now; lastTime = now; }
    var elapsed = now - startTime;
    var dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    /* Node scale-in + float */
    NODES.forEach(function (n) {
      var mesh = nodeMeshes[n.id];
      var t = clamp01((elapsed - NODE_APPEAR[n.id]) / 480);
      var s = easeOut3(t);
      mesh.scale.set(s, s, s);
      mesh.position.y = n.y + Math.sin(elapsed * 0.0007 + n.x * 0.4) * 0.035;
    });

    /* Wire appear */
    connObjects.forEach(function (co) {
      var t = clamp01((elapsed - co.appear) / 450);
      co.wireMat.opacity = easeOut3(t) * 0.9;
      co.arrowMat.opacity = easeOut3(t) * 0.9;
    });

    /* Execution cycle */
    if (elapsed >= nextExec) {
      startExec(elapsed);
      nextExec = elapsed + EXEC_CYCLE;
      if (!window.__iacOnline) window.__iacOnline = true;
    }

    /* Update execution pulses */
    var pIdx = 0;
    execPulses.forEach(function (ep) {
      if (ep.done) return;
      if (!ep.active && elapsed >= ep.start) ep.active = true;
      if (!ep.active) return;

      var progress = clamp01((elapsed - ep.start) / 750);
      ep.t = easeInOut(progress);

      if (progress >= 1) {
        ep.done = true;
        var destId = CONNECTIONS[ep.idx].to;
        nodeMeshes[destId].userData.executing = 1.0;
        connObjects[ep.idx].lit = 1.0;
        return;
      }

      connObjects[ep.idx].lit = Math.max(connObjects[ep.idx].lit, 0.9);

      // Pulse particle
      if (pIdx < MAX_P - 4) {
        var pt = connObjects[ep.idx].curve.getPoint(ep.t);
        pPos[pIdx*3] = pt.x; pPos[pIdx*3+1] = pt.y; pPos[pIdx*3+2] = pt.z;
        pCol[pIdx*3] = 0.30; pCol[pIdx*3+1] = 0.80; pCol[pIdx*3+2] = 0.44;
        pSiz[pIdx] = 0.30;
        pIdx++;
        for (var tr = 1; tr <= 3 && pIdx < MAX_P; tr++) {
          var trT = Math.max(0, ep.t - tr * 0.07);
          var trPt = connObjects[ep.idx].curve.getPoint(trT);
          var fade = 1 - tr / 4;
          pPos[pIdx*3] = trPt.x; pPos[pIdx*3+1] = trPt.y; pPos[pIdx*3+2] = trPt.z;
          pCol[pIdx*3] = 0.18*fade; pCol[pIdx*3+1] = 0.55*fade; pCol[pIdx*3+2] = 0.28*fade;
          pSiz[pIdx] = 0.18 * fade;
          pIdx++;
        }
      }
    });

    // Clear completed cycle
    if (execPulses.length > 0 && execPulses.every(function(ep){ return ep.done; })) {
      execPulses = [];
    }

    for (var zi = pIdx; zi < MAX_P; zi++) {
      pPos[zi*3] = 0; pPos[zi*3+1] = -999; pPos[zi*3+2] = 0;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
    pGeo.attributes.size.needsUpdate = true;

    /* Node execution glow */
    NODES.forEach(function (n) {
      var mesh = nodeMeshes[n.id];
      mesh.userData.executing = Math.max(0, mesh.userData.executing - dt * 0.55);
      var ex = mesh.userData.executing;
      mesh.userData.hlBorderMat.opacity = ex * 1.0;
      mesh.userData.glowMat.opacity = ex * 0.35;
      if (mesh.userData.cardMat.emissive) {
        mesh.userData.cardMat.emissiveIntensity = ex * 0.12;
        mesh.userData.cardMat.emissive.setRGB(0.2, 0.8, 0.4);
      }
    });

    /* Wire glow decay */
    connObjects.forEach(function (co) {
      co.hlMat.opacity = co.lit * 0.80;
      co.lit = Math.max(0, co.lit - dt * 0.9);
    });

    /* Camera drift + parallax */
    mX += (tmX - mX) * 0.025;
    mY += (tmY - mY) * 0.025;
    var gt = elapsed * 0.00006;
    camera.position.x = 0.4 + Math.sin(gt) * 0.5 + mX * 1.0;
    camera.position.y = 3.0 + Math.cos(gt * 0.7) * 0.15 - mY * 0.5;
    camera.position.z = 14.0 + Math.sin(gt * 0.5) * 0.25;
    camera.lookAt(0.4, 0.5, 0);

    renderer.render(scene, camera);
  }

  /* ================================================================
     STATIC FALLBACK
     ================================================================ */
  function renderStatic() {
    NODES.forEach(function (n) {
      var mesh = nodeMeshes[n.id];
      mesh.scale.set(1, 1, 1);
      mesh.userData.executing = (n.id === 'database' || n.id === 'notify') ? 0.7 : 0.2;
      mesh.userData.hlBorderMat.opacity = mesh.userData.executing * 0.9;
      mesh.userData.glowMat.opacity = mesh.userData.executing * 0.18;
    });
    connObjects.forEach(function (co) {
      co.wireMat.opacity = 0.75;
      co.arrowMat.opacity = 0.75;
      co.hlMat.opacity = 0.45;
    });
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
    if (document.hidden && animId) { cancelAnimationFrame(animId); animId = null; }
    else if (!document.hidden && !REDUCE && !animId) {
      lastTime = performance.now();
      animId = requestAnimationFrame(frame);
    }
  });

})();
