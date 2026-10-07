// Hero: a street at night. Street lights switch on one after another,
// a cherry-picker crew finishes the last one, and scrolling drives the camera down the road.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

type Lamp = {
  x: number; z: number; headX: number; head: THREE.Mesh; cone: THREE.Mesh; halo: THREE.Sprite;
  start: number; level: number; special: boolean; light?: THREE.PointLight;
};

export type HeroHandle = { setProgress(p: number): void; destroy(): void; lit: Promise<void> };

const MAX_LAMPS = 24;
const LAMP_COLOR = new THREE.Color('#ffd49a');
const BEACON_COLOR = new THREE.Color('#ff7a1a');
const POLE_H = 9;
const SPACING = 17;

export function initHero(canvas: HTMLCanvasElement, reduced: boolean, onStart?: () => void): HeroHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false });
  } catch {
    return null;
  }
  const small = window.matchMedia('(max-width: 760px)').matches;
  const dprCap = small ? 1.25 : 1.75;
  let dpr = Math.min(window.devicePixelRatio || 1, dprCap);
  const dprFloor = small ? 0.75 : 1;
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 900);

  // ---------- Sky ----------
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(600, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `
        varying vec3 vDir; uniform float uTime;
        float hash(vec3 p){ p = fract(p*0.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
        void main(){
          float h = clamp(vDir.y, -0.2, 1.0);
          vec3 zenith = vec3(0.0, 0.0, 0.0);
          vec3 horizon = vec3(0.022, 0.032, 0.06);
          vec3 col = mix(horizon, zenith, smoothstep(0.0, 0.45, h));
          // faint warm glow far down the road, like a town beyond the hills
          float toward = max(dot(normalize(vec3(0.15, 0.0, -1.0)), normalize(vec3(vDir.x, 0.0, vDir.z))), 0.0);
          col += vec3(0.12, 0.05, 0.015) * pow(toward, 40.0) * smoothstep(0.2, 0.0, h);
          // sparse stars
          vec3 cell = floor(vDir * 720.0);
          float s = hash(cell);
          float tw = 0.6 + 0.4 * sin(uTime * 1.3 + s * 40.0);
          col += vec3(0.75, 0.8, 1.0) * step(0.9982, s) * smoothstep(0.1, 0.45, h) * tw * 0.55;
          gl_FragColor = vec4(col, 1.0);
        }`,
    })
  );
  scene.add(sky);

  // ---------- Mountains (two silhouette layers) ----------
  function ridge(z: number, color: string, seed: number, amp: number, base: number) {
    const shape = new THREE.Shape();
    const W = 1400; const pts = 220;
    shape.moveTo(-W / 2, -20);
    for (let i = 0; i <= pts; i++) {
      const x = -W / 2 + (W * i) / pts;
      const k = i * (90 / pts);
      const n = Math.sin(k * 0.37 + seed) * 0.5 + Math.sin(k * 0.11 + seed * 2.1) * 0.8 + Math.sin(k * 0.9 + seed * 3.3) * 0.18 + Math.sin(k * 2.3 + seed) * 0.05;
      shape.lineTo(x, base + amp * (0.55 + 0.45 * n));
    }
    shape.lineTo(W / 2, -20);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color, fog: false }));
    m.position.set(0, 0, z);
    scene.add(m);
  }
  ridge(-520, '#06080d', 1.7, 70, 10);
  ridge(-430, '#020304', 4.2, 46, 0);

  // ---------- Lamps data ----------
  const lamps: Lamp[] = [];
  const perSide = small ? 9 : 12;
  const lampUniform = Array.from({ length: MAX_LAMPS }, () => new THREE.Vector4(0, 0, 0, 0));
  const beaconUniform = new THREE.Vector4(0, 0, 0, 0);

  // ---------- Ground (procedural road + light pools) ----------
  const groundMat = new THREE.ShaderMaterial({
    uniforms: {
      uLamps: { value: lampUniform },
      uLampColor: { value: LAMP_COLOR.clone() },
      uBeacon: { value: beaconUniform },
      uBeaconColor: { value: BEACON_COLOR.clone() },
      uCam: { value: new THREE.Vector3() },
    },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      #define N ${MAX_LAMPS}
      varying vec3 vW;
      uniform vec4 uLamps[N]; uniform vec3 uLampColor; uniform vec4 uBeacon; uniform vec3 uBeaconColor; uniform vec3 uCam;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      void main(){
        vec2 p = vW.xz; float ax = abs(p.x);
        float grain = noise(p*6.0)*0.5 + noise(p*23.0)*0.35 + hash(p*80.0)*0.15;
        float alb;
        if (ax < 4.6) {
          alb = 0.05 + grain*0.035;
          // centre dashes and edge lines
          float dash = step(ax, 0.07) * step(mod(p.y, 9.0), 4.5);
          float edge = step(4.12, ax) * step(ax, 4.24);
          alb = mix(alb, 0.42, max(dash, edge) * (0.75 + 0.25*grain));
        } else if (ax < 4.85) {
          alb = 0.2 + grain*0.05;           // kerb
        } else if (ax < 7.6) {
          vec2 t = fract(vec2(p.x*1.6, p.y*1.6));
          float joint = step(t.x, 0.04) + step(t.y, 0.04);
          alb = (0.1 + grain*0.04) * (1.0 - 0.35*clamp(joint,0.,1.)); // pavement tiles
        } else {
          alb = 0.025 + grain*0.03;          // verge
        }
        vec3 light = vec3(0.012, 0.016, 0.026); // moonlight ambient
        for (int i = 0; i < N; i++) {
          vec4 L = uLamps[i];
          if (L.z <= 0.001) continue;
          float d = distance(p, L.xy);
          float pool = exp(-d*d/(2.0*3.0*3.0))*2.6 + 0.16/(1.0 + d*d*0.06);
          light += uLampColor * L.z * pool * 3.0;
        }
        float db = distance(p, uBeacon.xy);
        light += uBeaconColor * uBeacon.z * (1.2/(1.0 + db*db*0.35));
        vec3 col = alb * light;
        float dist = distance(vW, uCam);
        float fog = 1.0 - exp(-pow(dist*0.0105, 2.0));
        col = mix(col, vec3(0.0), fog);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 700, 1, 1), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -320;
  scene.add(ground);

  // ---------- Shared materials / geometry ----------
  scene.fog = new THREE.FogExp2(0x000000, 0.0105);
  scene.add(new THREE.HemisphereLight(0x1b2436, 0x000000, 0.9));
  const moon = new THREE.DirectionalLight(0x8fa6c8, 0.5);
  moon.position.set(-30, 40, -60);
  scene.add(moon);

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a3d42, metalness: 0.55, roughness: 0.45 });
  const poleGeo = new THREE.CylinderGeometry(0.075, 0.13, POLE_H, 10);
  const baseGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.6, 10);
  const headGeo = new THREE.BoxGeometry(0.95, 0.12, 0.34);
  const lensGeo = new THREE.PlaneGeometry(0.82, 0.24);

  const coneMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uLevel: { value: 0 }, uColor: { value: LAMP_COLOR.clone() }, uCam: { value: new THREE.Vector3() } },
    vertexShader: `
      varying float vY; varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        vY = (position.y + ${((POLE_H - 0.4) / 2).toFixed(2)}) / ${(POLE_H - 0.4).toFixed(2)};
        vec4 w = modelMatrix * vec4(position,1.);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `
      varying float vY; varying vec3 vN; varying vec3 vV; varying vec3 vW;
      uniform float uLevel; uniform vec3 uColor;
      void main(){
        float facing = pow(abs(dot(normalize(vN), normalize(vV))), 2.2);
        float fall = pow(clamp(vY, 0.0, 1.0), 1.7);
        float d = distance(vW, cameraPosition);
        float fog = exp(-pow(d*0.011, 2.0));
        float a = uLevel * facing * fall * 0.27 * fog;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
  const coneGeo = new THREE.ConeGeometry(3.3, POLE_H - 0.4, 40, 1, true);

  const haloTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,230,190,1)'); grd.addColorStop(0.18, 'rgba(255,200,130,0.45)');
    grd.addColorStop(0.5, 'rgba(255,160,80,0.08)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();

  function addPole(side: 1 | -1, z: number, special: boolean, index: number) {
    const x = side * 5.6;
    const headX = side * 2.4;
    const g = new THREE.Group();
    const pole = new THREE.Mesh(poleGeo, poleMat); pole.position.set(x, POLE_H / 2, z); g.add(pole);
    const base = new THREE.Mesh(baseGeo, poleMat); base.position.set(x, 0.3, z); g.add(base);
    // curved arm made of a tube
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(x, POLE_H - 0.6, z),
      new THREE.Vector3(x, POLE_H + 0.15, z),
      new THREE.Vector3(x - side * 1.2, POLE_H + 0.25, z),
      new THREE.Vector3(headX + side * 0.45, POLE_H + 0.05, z),
    );
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.055, 6, false), poleMat));
    const housing = new THREE.Mesh(headGeo, poleMat); housing.position.set(headX, POLE_H, z); g.add(housing);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, toneMapped: false });
    const head = new THREE.Mesh(lensGeo, headMat);
    head.rotation.x = Math.PI / 2; head.position.set(headX, POLE_H - 0.065, z); g.add(head);
    const cone = new THREE.Mesh(coneGeo, coneMat.clone());
    cone.position.set(headX, (POLE_H - 0.4) / 2, z); g.add(cone);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, color: 0xffffff }));
    halo.scale.set(3.2, 3.2, 1); halo.position.set(headX, POLE_H - 0.2, z); g.add(halo);
    scene.add(g);
    const lamp: Lamp = { x, z, headX, head, cone, halo, start: 0, level: 0, special };
    if (index < 3 || special) {
      const pl = new THREE.PointLight(LAMP_COLOR, 0, 22, 1.6);
      pl.position.set(headX, POLE_H - 0.5, z); scene.add(pl); lamp.light = pl;
    }
    lamps.push(lamp);
  }

  const SPECIAL_INDEX = 2; // right-hand pole the crew is working on
  for (let i = 0; i < perSide; i++) {
    addPole(1, -4 - i * SPACING, i === SPECIAL_INDEX, i);
    addPole(-1, -12.5 - i * SPACING, false, i);
  }

  // ---------- Cherry picker truck under the special pole ----------
  const special = lamps.find((l) => l.special)!;
  const truck = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: 0.55, metalness: 0.1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0b1018, roughness: 0.15, metalness: 0.6 });
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); truck.add(b); return b;
  };
  box(2.2, 1.9, 1.9, bodyMat, 0, 1.55, 3.1);       // cab
  box(2.05, 0.7, 1.0, glassMat, 0, 1.95, 4.06);    // windscreen
  box(2.3, 0.35, 6.2, darkMat, 0, 0.62, 0.6);      // chassis
  box(2.3, 0.75, 4.2, bodyMat, 0, 1.1, -0.4);      // bed
  const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.32, 16);
  for (const [wx, wz] of [[-1.05, 2.9], [1.05, 2.9], [-1.05, -1.4], [1.05, -1.4]]) {
    const w = new THREE.Mesh(wheelGeo, darkMat); w.rotation.z = Math.PI / 2; w.position.set(wx, 0.48, wz); truck.add(w);
  }
  // boom: turret -> lower arm -> upper arm -> basket
  const turretPos = new THREE.Vector3(0, 1.7, -1.6);
  const TRUCK_X = 2.15;
  const basketPos = new THREE.Vector3(special.headX + 0.95 - TRUCK_X, POLE_H - 1.95, 0.6);
  box(0.9, 0.6, 0.9, bodyMat, turretPos.x, turretPos.y, turretPos.z);
  const elbow = new THREE.Vector3(-0.2, 5.6, -0.2);
  const arm = (a: THREE.Vector3, b: THREE.Vector3, t: number) => {
    const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.BoxGeometry(t, len, t), bodyMat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    truck.add(m);
  };
  arm(turretPos, elbow, 0.32);
  arm(elbow, basketPos, 0.24);
  box(1.25, 0.95, 0.95, bodyMat, basketPos.x, basketPos.y + 0.2, basketPos.z);
  // worker in the basket
  const worker = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.65, 4, 8), darkMat);
  worker.position.set(basketPos.x - 0.1, basketPos.y + 0.95, basketPos.z); truck.add(worker);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffb21f, roughness: 0.4 }));
  helmet.position.set(basketPos.x - 0.1, basketPos.y + 1.55, basketPos.z); truck.add(helmet);
  // amber beacon on the cab roof
  const beaconMat = new THREE.MeshBasicMaterial({ color: BEACON_COLOR.clone(), toneMapped: false });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.2, 12), beaconMat);
  beacon.position.set(0, 2.62, 3.1); truck.add(beacon);
  const beaconLight = new THREE.PointLight(BEACON_COLOR, 0, 14, 1.8);
  beaconLight.position.set(0, 3.0, 3.1); truck.add(beaconLight);
  truck.position.set(TRUCK_X, 0, special.z + 0.4);
  scene.add(truck);

  // ---------- Dust drifting in the light ----------
  const dustCount = small ? 160 : 320;
  const dustPos = new Float32Array(dustCount * 3);
  const dustSeed = new Float32Array(dustCount);
  const nearLamps = lamps.filter((l) => l.z > -60);
  for (let i = 0; i < dustCount; i++) {
    const l = nearLamps[i % nearLamps.length];
    const r = Math.random() * 2.6, a = Math.random() * Math.PI * 2;
    dustPos[i * 3] = l.headX + Math.cos(a) * r;
    dustPos[i * 3 + 1] = 0.5 + Math.random() * (POLE_H - 1.5);
    dustPos[i * 3 + 2] = l.z + Math.sin(a) * r;
    dustSeed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('seed', new THREE.BufferAttribute(dustSeed, 1));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uLevel: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float seed; uniform float uTime; uniform float uPx; varying float vA;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*0.3 + seed*30.0)*0.25;
        p.y += sin(uTime*0.2 + seed*12.0)*0.35;
        p.z += cos(uTime*0.25 + seed*20.0)*0.25;
        vec4 mv = modelViewMatrix * vec4(p,1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.4 + seed*1.6) * uPx * (18.0 / -mv.z);
        vA = (0.35 + 0.65*seed) * smoothstep(60.0, 8.0, -mv.z);
      }`,
    fragmentShader: `
      uniform float uLevel; varying float vA;
      void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d)*vA*uLevel*0.55;
        gl_FragColor = vec4(vec3(1.0,0.86,0.66)*a, a); }`,
  });
  scene.add(new THREE.Points(dustGeo, dustMat));

  // ---------- Switch-on schedule ----------
  const order = lamps.filter((l) => !l.special).sort((a, b) => b.z - a.z);
  const T0 = 0.9; const STEP = 0.13;
  order.forEach((l, i) => { l.start = T0 + i * STEP; });
  special.start = T0 + order.length * STEP + 0.7;
  const allLitAt = special.start + 0.9;

  function flicker(t: number, big: boolean): number {
    if (t < 0) return 0;
    const seq = big
      ? [[0.05, 1], [0.1, 0], [0.22, 0], [0.27, 0.8], [0.33, 0.05], [0.5, 0.05], [0.56, 1], [0.6, 0.4]]
      : [[0.05, 1], [0.09, 0.1], [0.16, 0.85], [0.21, 0.3]];
    for (const [until, v] of seq) if (t < until) return v;
    const end = seq[seq.length - 1][0];
    return Math.min(1, 0.6 + (t - end) * 2.2);
  }

  // ---------- Post-processing ----------
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: small ? 0 : 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.75, 0.5, 0.62);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- Camera, input ----------
  let progress = 0; let smoothProgress = 0;
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const onMove = (e: PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reduced) window.addEventListener('pointermove', onMove, { passive: true });

  const target = new THREE.Vector3();
  function placeCamera(t: number) {
    const portrait = camera.aspect < 0.9;
    camera.fov = portrait ? 62 : 42;
    camera.updateProjectionMatrix();
    const p = smoothProgress;
    const breathe = reduced ? 0 : Math.sin(t * 0.35) * 0.06;
    camera.position.set((portrait ? 0.2 : 1.2) + mouse.sx * 0.7, 1.55 + p * 1.6 + breathe - mouse.sy * 0.2, 8 - p * 36);
    target.set((portrait ? 0.6 : -7.5) + mouse.sx * 1.8, 2.3 + p * 1.4 - mouse.sy * 0.9, camera.position.z - 45);
    camera.lookAt(target);
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w * (small ? 0.5 : 0.75), h * (small ? 0.5 : 0.75));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let resolveLit!: () => void;
  const lit = new Promise<void>((r) => (resolveLit = r));
  let litFired = false;

  // ---------- Frame ----------
  const debugT = Number(new URLSearchParams(location.search).get('heroT') ?? NaN); // dev only: freeze the timeline
  let t0 = -1; // the timeline starts after the first frame (shader compile) has rendered
  let visible = true; let raf = 0; let stopped = false;

  let fCount = 0, fTime = 0, fLast = 0, tuned = 0;
  function adapt() {
    const now = performance.now();
    if (fLast && t0 > 0) { fTime += Math.min(now - fLast, 100); fCount++; }
    fLast = now;
    if (fCount < 40) return;
    const avg = fTime / fCount; fCount = 0; fTime = 0;
    if (avg > 22 && dpr > dprFloor && tuned < 4) {
      dpr = Math.max(dprFloor, dpr - 0.25); tuned++;
      renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr); resize();
    }
  }

  function frame() {
    if (!reduced) adapt();
    const t = !Number.isNaN(debugT) ? debugT : reduced ? allLitAt + 1 : t0 < 0 ? 0 : (performance.now() - t0) / 1000;
    mouse.sx += (mouse.x - mouse.sx) * 0.04;
    mouse.sy += (mouse.y - mouse.sy) * 0.04;
    smoothProgress += (progress - smoothProgress) * (reduced ? 1 : 0.08);

    lamps.forEach((l, i) => {
      const lv = flicker(t - l.start, l.special);
      l.level = lv;
      const u = lampUniform[i]; u.set(l.headX, l.z, lv, 0);
      (l.head.material as THREE.MeshBasicMaterial).color.copy(LAMP_COLOR).multiplyScalar(0.12 + lv * 5.5);
      ((l.cone.material as THREE.ShaderMaterial).uniforms.uLevel.value = lv);
      (l.halo.material as THREE.SpriteMaterial).opacity = lv * 0.9;
      if (l.light) l.light.intensity = lv * 26;
    });
    // beacon: rotating flash, fades a little once the street is lit
    const beat = reduced ? 0.6 : Math.pow(Math.max(0, Math.sin(t * 5.2)), 6);
    beaconMat.color.copy(BEACON_COLOR).multiplyScalar(0.25 + beat * 6);
    beaconLight.intensity = beat * 9;
    beaconUniform.set(truck.position.x, truck.position.z + 3.1, beat, 0);

    const avg = lamps.reduce((s, l) => s + l.level, 0) / lamps.length;
    dustMat.uniforms.uLevel.value = avg;
    dustMat.uniforms.uTime.value = t;
    (sky.material as THREE.ShaderMaterial).uniforms.uTime.value = t;

    placeCamera(t);
    groundMat.uniforms.uCam.value.copy(camera.position);
    composer.render();
    if (t0 < 0) { t0 = performance.now(); onStart?.(); }

    if (!litFired && t >= allLitAt) { litFired = true; resolveLit(); }
    if (!reduced && visible && !stopped) raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([e]) => {
    const was = visible; visible = e.isIntersecting;
    if (visible && !was && !reduced && !stopped) { fLast = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
  });
  io.observe(canvas);

  if (reduced) {
    frame();
    ro.disconnect();
    new ResizeObserver(() => { resize(); frame(); }).observe(canvas);
  } else {
    try { renderer.compile(scene, camera); } catch {}
    raf = requestAnimationFrame(frame);
  }

  return {
    lit,
    setProgress(p: number) {
      progress = Math.max(0, Math.min(1, p));
      if (reduced) frame();
    },
    destroy() {
      stopped = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove); renderer.dispose();
    },
  };
}
