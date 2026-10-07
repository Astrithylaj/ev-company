// Services: a miniature city at night, powered by the breaker panel.
// Each breaker switches on one part of the city. Modelling adapted from the Codex prototype (energy-scene.ts).
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type CityHandle = { select(id: string): void; destroy(): void };

type ZoneId = 'ndricim' | 'instalime' | 'solare' | 'smart' | 'mirembajtje' | 'platforme' | 'materiale';
type Zone = { level: number; target: number; onAt: number; focus: THREE.Vector3; yaw: number };
type Glow = { zones: ZoneId[]; apply(level: number, t: number): void };

const WARM = 0xffd49a;
const AMBER = 0xf7a021;
const OFF = 0.03; // how much of a zone stays visible when it is switched off

export function initCity(host: HTMLElement, reduced: boolean, initial: string): CityHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const small = window.matchMedia('(max-width: 760px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // a faint studio environment so metal, glass and paint get real reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.22;
  pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(11.8, 10.7, 13.8);
  camera.lookAt(0, 0.2, 0);
  const world = new THREE.Group();
  world.rotation.y = -0.15;
  scene.add(world);

  // night lighting
  scene.add(new THREE.HemisphereLight(0x51607a, 0x0a0806, 1.0));
  const moon = new THREE.DirectionalLight(0xa9bddc, 2.1);
  moon.position.set(-7, 11, 5);
  moon.castShadow = true;
  moon.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  moon.shadow.camera.left = -7; moon.shadow.camera.right = 7; moon.shadow.camera.top = 7; moon.shadow.camera.bottom = -7;
  moon.shadow.camera.near = 1; moon.shadow.camera.far = 30;
  moon.shadow.bias = -0.0006; moon.shadow.normalBias = 0.02; moon.shadow.radius = 4;
  scene.add(moon);
  const rim = new THREE.DirectionalLight(0x6f86a8, 0.9);
  rim.position.set(6, 5, -6);
  scene.add(rim);

  const M = {
    base: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.6, metalness: 0.5 }),
    pavement: new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.85 }),
    road: new THREE.MeshStandardMaterial({ color: 0x0d0f12, roughness: 0.8 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0x6a7077, roughness: 0.82, metalness: 0.05 }),
    plaster: new THREE.MeshStandardMaterial({ color: 0x8a8378, roughness: 0.9, metalness: 0 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1d2228, roughness: 0.5, metalness: 0.4 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x343a42, roughness: 0.78, metalness: 0.15 }),
    tiles: new THREE.MeshStandardMaterial({ color: 0x4a2c24, roughness: 0.85, metalness: 0.05 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 1 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8c949b, roughness: 0.35, metalness: 0.8 }),
    white: new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: 0.55, metalness: 0.1 }),
    tire: new THREE.MeshStandardMaterial({ color: 0x070809, roughness: 1 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x0f1a24, roughness: 0.2, metalness: 0.85 }),
    tree: new THREE.MeshStandardMaterial({ color: 0x2b4033, roughness: 1, flatShading: true }),
    tree2: new THREE.MeshStandardMaterial({ color: 0x223529, roughness: 1, flatShading: true }),
  };

  // ---------- zones ----------
  const zones = {} as Record<ZoneId, Zone>;
  const defZone = (id: ZoneId, focus: [number, number, number], yaw: number) => {
    zones[id] = { level: OFF, target: OFF, onAt: -10, focus: new THREE.Vector3(...focus), yaw };
  };
  defZone('ndricim', [0, 0.14, 0.1], -0.15);
  defZone('instalime', [-1.8, 0.14, -2], -0.08);
  defZone('solare', [2.6, 0.23, 2.22], -0.3);
  defZone('smart', [1.05, 0.16, -2.35], -0.12);
  defZone('mirembajtje', [4.4, 0.14, -1.2], -0.28);
  defZone('platforme', [-2.45, 0.16, 2.25], -0.02);
  defZone('materiale', [-4.0, 0.14, 1.9], 0.04);

  const glows: Glow[] = [];
  /** Emissive material that brightens with its zone(s). */
  function luminous(zs: ZoneId[], color: number, strength: number, base = 0x14181d) {
    const m = new THREE.MeshStandardMaterial({ color: base, emissive: color, emissiveIntensity: 0, roughness: 0.4 });
    glows.push({ zones: zs, apply: (l) => { m.emissiveIntensity = strength * l; } });
    return m;
  }
  function addLight(parent: THREE.Object3D, zs: ZoneId[], pos: [number, number, number], intensity: number, dist: number, color = WARM) {
    const l = new THREE.PointLight(color, 0, dist, 2);
    l.position.set(...pos);
    parent.add(l);
    glows.push({ zones: zs, apply: (lv) => { l.intensity = intensity * Math.max(0, lv - OFF) / (1 - OFF); } });
    return l;
  }
  const poolTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,214,154,1)'); grd.addColorStop(0.45, 'rgba(255,190,110,0.35)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  function pool(parent: THREE.Object3D, zs: ZoneId[], x: number, z: number, r: number, strength = 0.55, y = 0.06) {
    const m = new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), m);
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x, y, z); parent.add(mesh);
    glows.push({ zones: zs, apply: (l) => { m.opacity = strength * Math.max(0, l - OFF) / (1 - OFF); } });
  }

  // ---------- helpers ----------
  const box = (p: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const min = Math.min(w, h, d);
    // soft bevels catch the light like real edges; thin parts stay sharp
    const geo = min > 0.06 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(0.035, min * 0.18)) : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); p.add(mesh); return mesh;
  };
  const rod = (p: THREE.Object3D, a: number[], b: number[], r: number, m: THREE.Material) => {
    const s = new THREE.Vector3(...a), e = new THREE.Vector3(...b), v = e.clone().sub(s);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, v.length(), 8), m);
    mesh.position.copy(s.clone().add(e).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
    p.add(mesh); return mesh;
  };
  const wire = (p: THREE.Object3D, pts: number[][], m: THREE.Material, r = 0.02) => { for (let i = 1; i < pts.length; i++) rod(p, pts[i - 1], pts[i], r, m); };
  const edges = (mesh: THREE.Mesh, color = 0x5d6772, opacity = 0.35, draw = false) => {
    const lm = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    if (draw) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(...(['width', 'height', 'depth'] as const).map((k) => (mesh.geometry as any).parameters[k]) as [number, number, number])), lm));
    return lm;
  };
  // procedural textures: asphalt grain and paving joints
  const canvasTex = (draw: (g: CanvasRenderingContext2D, n: number) => void, n = 512, repeat = 1) => {
    const c = document.createElement('canvas'); c.width = c.height = n;
    draw(c.getContext('2d')!, n);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 4;
    return t;
  };
  const grain = (g: CanvasRenderingContext2D, n: number, base: number, spread: number) => {
    const img = g.createImageData(n, n);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = base + (Math.random() - 0.5) * spread;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  };

  const assemblies: { group: THREE.Group; delay: number }[] = [];
  const assembly = (x: number, z: number, delay: number) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); assemblies.push({ group: g, delay }); return g;
  };

  // ---------- ground ----------
  M.road.map = canvasTex((g, n) => grain(g, n, 120, 70), 256, 6);
  M.road.color.set(0x16181c);
  M.pavement.map = canvasTex((g, n) => {
    grain(g, n, 150, 40);
    g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 3;
    for (let i = 0; i <= n; i += n / 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, n); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(n, i); g.stroke(); }
  }, 512, 5);
  M.pavement.color.set(0x3a3f46);
  box(world, 10.5, 0.38, 7.6, 0, -0.25, 0, M.base);
  box(world, 10.25, 0.055, 7.35, 0, -0.025, 0, M.pavement);
  box(world, 10.3, 0.03, 1.45, 0, 0.018, 0.15, M.road);
  for (let i = 0; i < 6; i++) box(world, 0.5, 0.012, 0.11, -2.85, 0.04, -0.42 + i * 0.23, M.concrete); // zebra crossing
  for (let i = -4.6; i < 5; i += 0.95) box(world, 0.42, 0.015, 0.035, i, 0.043, 0.15, M.metal);
  for (const z of [-0.64, 0.94]) box(world, 10.15, 0.06, 0.09, 0, 0.06, z, M.concrete);

  // underground circuits: maintenance lights these up, with a current running through them
  const circuitMat = new THREE.MeshStandardMaterial({ color: 0x1a1612, emissive: AMBER, emissiveIntensity: 0, roughness: 0.4 });
  let circuitLevel = OFF;
  glows.push({ zones: ['mirembajtje'], apply: (l, t) => {
    circuitLevel = l;
    const pulse = 0.75 + 0.25 * Math.sin(t * 6);
    circuitMat.emissiveIntensity = (0.04 + 1.7 * l) * (l > 0.5 ? pulse : 1);
  } });
  wire(world, [[-5.13, -0.21, 3.8], [5.13, -0.21, 3.8], [5.25, -0.21, 3.65], [5.25, -0.21, -3.5]], circuitMat, 0.022);
  wire(world, [[-4, 0.085, -3.2], [-4, 0.085, -1.05], [3.5, 0.085, -1.05], [3.5, 0.085, -3.1]], circuitMat, 0.023);
  wire(world, [[-3.3, 0.085, 2.7], [-0.1, 0.085, 2.7], [-0.1, 0.085, 1.4], [4.5, 0.085, 1.4]], circuitMat, 0.021);
  wire(world, [[4.5, 0.085, 1.4], [4.5, 0.085, -1.05], [3.5, 0.085, -1.05]], circuitMat, 0.021);

  // distribution cabinet (maintenance)
  const cab = assembly(4.4, -1.35, 420);
  box(cab, 0.55, 0.06, 0.4, 0, 0.1, 0, M.concrete);
  edges(box(cab, 0.5, 0.8, 0.32, 0, 0.53, 0, M.white), 0x8b8f96, 0.4);
  box(cab, 0.42, 0.68, 0.02, 0, 0.53, 0.17, M.metal);
  box(cab, 0.12, 0.05, 0.02, 0.1, 0.78, 0.185, luminous(['mirembajtje'], AMBER, 3.2));
  box(cab, 0.05, 0.05, 0.02, -0.1, 0.78, 0.185, luminous(['mirembajtje'], 0x7cff9a, 2.2));
  addLight(cab, ['mirembajtje'], [0, 0.9, 0.6], 1.6, 2.2, AMBER);
  pool(cab, ['mirembajtje'], 0, 0.3, 0.9, 0.35);

  // ---------- office building (installations) ----------
  const officeWins = [luminous(['instalime'], WARM, 1.05), luminous(['instalime'], 0xffe6c4, 0.75), luminous(['instalime'], 0xffc27a, 1.25)];
  const officeWin = officeWins[0];
  const office = assembly(-1.8, -2.05, 80);
  box(office, 2.1, 0.14, 1.9, 0, 0.14, 0, M.dark);
  edges(box(office, 1.85, 2.85, 1.65, 0, 1.58, 0, M.dark));
  box(office, 1.97, 0.12, 1.77, 0, 3.07, 0, M.metal);
  for (let floor = 0; floor < 5; floor++) {
    const y = 0.5 + floor * 0.47;
    box(office, 1.9, 0.07, 1.69, 0, y - 0.18, 0, M.concrete);
    for (let col = 0; col < 4; col++) {
      const k = (floor * 7 + col * 3) % 7;
      const mat = k === 0 || k === 4 ? M.glass : officeWins[k % 3];
      box(office, 0.29, 0.27, 0.02, -0.64 + col * 0.43, y, 0.836, mat);
      box(office, 0.02, 0.27, 0.26, 0.936, y, -0.58 + col * 0.39, mat);
    }
  }
  for (let col = 0; col < 5; col++) box(office, 0.035, 2.66, 0.05, -0.89 + col * 0.445, 1.64, 0.86, M.metal);
  box(office, 0.6, 0.28, 0.6, -0.35, 3.27, -0.28, M.roof);
  box(office, 0.45, 0.18, 0.35, 0.4, 3.22, 0.3, M.roof);
  rod(office, [0.45, 3.12, -0.5], [0.45, 3.8, -0.5], 0.024, M.metal);
  edges(box(office, 0.85, 1.3, 1.3, -1.45, 0.72, 0, M.concrete));
  for (let i = 0; i < 3; i++) box(office, 0.18, 0.54, 0.02, -1.71 + i * 0.26, 0.84, 0.661, officeWin);
  addLight(office, ['instalime'], [0.2, 1.4, 1.5], 1.6, 4);
  pool(office, ['instalime'], 0, 1.35, 1.3, 0.4, 0.2);

  // ---------- houses ----------
  function house(x: number, z: number, delay: number, win: THREE.Material) {
    const g = assembly(x, z, delay);
    box(g, 1.85, 0.12, 1.75, 0, 0.13, 0, M.pavement);
    box(g, 1.45, 1.05, 1.3, 0, 0.73, 0, M.plaster);
    const gable = new THREE.Shape(); gable.moveTo(-0.82, 0); gable.lineTo(0, 0.55); gable.lineTo(0.82, 0); gable.lineTo(-0.82, 0);
    const roofGeo = new THREE.ExtrudeGeometry(gable, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
    roofGeo.translate(0, 0, -0.75); roofGeo.rotateY(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, M.tiles); roof.position.set(0, 1.25, 0); g.add(roof);
    box(g, 0.3, 0.62, 0.04, -0.36, 0.62, 0.67, M.dark);
    box(g, 0.42, 0.36, 0.045, 0.3, 0.87, 0.671, win);
    box(g, 0.025, 0.36, 0.055, 0.3, 0.87, 0.68, M.metal);
    box(g, 0.05, 0.36, 0.4, 0.742, 0.85, 0, win);
    box(g, 0.2, 0.42, 0.2, -0.4, 1.65, -0.3, M.concrete); // chimney
    return g;
  }
  const smartWin = luminous(['smart', 'instalime'], WARM, 1.3);
  const home = house(1.05, -2.35, 140, smartWin);
  house(3.3, -2.3, 200, luminous(['instalime'], WARM, 1.3));
  addLight(home, ['smart'], [0.2, 0.9, 1.2], 2.4, 3);
  // Smart Home: signal arcs over the house pulse outwards
  const arcs: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.MeshStandardMaterial({ color: 0x14181d, emissive: AMBER, emissiveIntensity: 0, roughness: 0.4, transparent: true });
    arcs.push(m);
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.22 + i * 0.16, 0.017, 6, 28, Math.PI * 0.85), m);
    arc.position.set(0, 2.2 + i * 0.055, 0.1); arc.rotation.z = 0.24; home.add(arc);
  }
  glows.push({ zones: ['smart'], apply: (l, t) => {
    arcs.forEach((m, i) => {
      const wave = l > 0.5 ? 0.35 + 0.65 * Math.max(0, Math.sin(t * 3.2 - i * 0.9)) : 1;
      m.emissiveIntensity = 2.6 * l * wave;
    });
  } });

  // ---------- solar field ----------
  const solar = assembly(2.6, 2.22, 260);
  box(solar, 3.5, 0.1, 1.9, 0, 0.13, 0, M.dark);
  const solarPanel = new THREE.MeshStandardMaterial({ color: 0x0f2c42, emissive: 0x2d6ea3, emissiveIntensity: 0, roughness: 0.2, metalness: 0.85 });
  const solarEdges: THREE.LineBasicMaterial[] = [];
  for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
    const p = new THREE.Group(); p.position.set(-1.13 + col * 1.12, 0.55, -0.47 + row * 0.94); p.rotation.x = -0.28; solar.add(p);
    solarEdges.push(edges(box(p, 1.02, 0.065, 0.8, 0, 0, 0, solarPanel), 0x6f8ea3, 0.6, true));
    for (let n = 1; n < 4; n++) box(p, 0.008, 0.007, 0.79, -0.51 + n * 0.255, 0.037, 0, M.metal);
    for (let n = 1; n < 3; n++) box(p, 1.01, 0.007, 0.008, 0, 0.037, -0.4 + n * 0.267, M.metal);
    rod(solar, [-1.13 + col * 1.12, 0.15, -0.47 + row * 0.94], [-1.13 + col * 1.12, 0.55, -0.47 + row * 0.94], 0.035, M.metal);
  }
  box(solar, 0.3, 0.5, 0.45, 1.95, 0.38, 0, M.concrete);
  box(solar, 0.04, 0.12, 0.15, 2.106, 0.45, 0.04, luminous(['solare'], AMBER, 3));
  const offEdge = new THREE.Color(0x6f8ea3), onEdge = new THREE.Color(AMBER);
  glows.push({ zones: ['solare'], apply: (l, t) => {
    solarPanel.emissiveIntensity = 0.9 * l;
    const k = Math.max(0, l - OFF) / (1 - OFF);
    const shimmer = k > 0.5 ? 0.85 + 0.15 * Math.sin(t * 2.4) : 1;
    solarEdges.forEach((m) => { m.color.copy(offEdge).lerp(onEdge, k * shimmer); m.opacity = 0.6 + 0.4 * k; });
  } });
  pool(solar, ['solare'], 0, 0, 2.2, 0.28, 0.2);

  // ---------- street lights ----------
  const lighting = assembly(0, 0, 320);
  const lampMat = luminous(['ndricim'], WARM, 4.5);
  for (const x of [-4.25, -1.35, 1.55, 4.2]) {
    box(lighting, 0.22, 0.12, 0.22, x, 0.12, -0.67, M.concrete);
    rod(lighting, [x, 0.15, -0.67], [x, 2.12, -0.67], 0.035, M.metal);
    rod(lighting, [x, 2.12, -0.67], [x, 2.23, -0.16], 0.029, M.metal);
    box(lighting, 0.24, 0.055, 0.49, x, 2.22, -0.04, M.metal);
    box(lighting, 0.2, 0.017, 0.43, x, 2.185, -0.04, lampMat);
    pool(lighting, ['ndricim'], x, 0.05, 0.95, 0.7);
    addLight(lighting, ['ndricim'], [x, 1.7, -0.05], 2.2, 3.2);
  }

  // ---------- cherry picker truck (same white truck as the hero) ----------
  const truck = assembly(-2.45, 2.25, 380);
  box(truck, 1.8, 0.26, 0.82, 0, 0.37, 0, M.white);
  box(truck, 0.6, 0.54, 0.85, -0.66, 0.72, 0, M.white);
  box(truck, 0.025, 0.27, 0.66, -0.975, 0.84, 0, M.glass);
  box(truck, 0.39, 0.26, 0.025, -0.69, 0.86, 0.44, M.glass);
  for (const x of [-0.62, 0.63]) for (const z of [-0.47, 0.47]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 14), M.tire); wheel.rotation.x = Math.PI / 2; wheel.position.set(x, 0.24, z); truck.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 12), M.metal); hub.rotation.x = Math.PI / 2; hub.position.copy(wheel.position); truck.add(hub);
  }
  box(truck, 0.45, 0.23, 0.5, 0.35, 0.64, 0, M.dark);
  // boom pivots at the turret; folded when off, raised when the breaker is on
  const boom = new THREE.Group(); boom.position.set(0.35, 0.72, 0); truck.add(boom);
  const lower = new THREE.Group(); boom.add(lower);
  rod(lower, [0, 0, 0], [0.15, 0.85, 0], 0.07, M.white);
  const upper = new THREE.Group(); upper.position.set(0.15, 0.85, 0); lower.add(upper);
  rod(upper, [0, 0, 0], [-0.82, 0.65, 0], 0.065, M.white);
  const basket = new THREE.Group(); basket.position.set(-0.82, 0.65, 0); upper.add(basket);
  box(basket, 0.6, 0.08, 0.55, -0.06, -0.08, 0, M.metal);
  for (const z of [-0.25, 0.25]) wire(basket, [[-0.34, -0.08, z], [-0.34, 0.32, z], [0.22, 0.32, z], [0.22, -0.08, z]], M.metal, 0.018);
  for (const x of [-0.34, 0.22]) rod(basket, [x, 0.32, -0.25], [x, 0.32, 0.25], 0.018, M.metal);
  const worker = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.2, 4, 8), M.dark); worker.position.set(-0.05, 0.15, 0); basket.add(worker);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffb21f, roughness: 0.4 }));
  helmet.position.set(-0.05, 0.36, 0); basket.add(helmet);
  const basketLamp = luminous(['platforme'], WARM, 3);
  box(basket, 0.12, 0.04, 0.12, 0.1, 0.34, 0, basketLamp);
  // amber beacon on the cab
  const beaconMat = new THREE.MeshStandardMaterial({ color: 0x2a1708, emissive: 0xff7a1a, emissiveIntensity: 0 });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.09, 12), beaconMat); beacon.position.set(-0.66, 1.04, 0); truck.add(beacon);
  const beaconLight = new THREE.PointLight(0xff7a1a, 0, 3, 2); beaconLight.position.set(-0.66, 1.3, 0); truck.add(beaconLight);
  box(truck, 0.035, 0.1, 0.16, -0.989, 0.58, -0.22, luminous(['platforme'], WARM, 2.5));
  box(truck, 0.035, 0.1, 0.16, -0.989, 0.58, 0.22, luminous(['platforme'], WARM, 2.5));
  let boomK = 0;
  glows.push({ zones: ['platforme'], apply: (l, t) => {
    const k = Math.max(0, l - OFF) / (1 - OFF);
    const flash = k > 0.3 ? Math.pow(Math.max(0, Math.sin(t * 5.2)), 6) : 0;
    beaconMat.emissiveIntensity = 0.3 + flash * 6 * k;
    beaconLight.intensity = flash * 2.5 * k;
    boomK = k;
  } });
  pool(truck, ['platforme'], 0, 0, 1.3, 0.3, 0.08);

  // ---------- materials yard: cable drums and crates ----------
  const yard = assembly(-4.0, 1.9, 440);
  const drumMat = luminous(['materiale'], AMBER, 0.7, 0x3a2a12);
  for (const [x, z] of [[-0.25, 0.48], [0.4, 0.48]]) {
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.28, 18), drumMat);
    drum.rotation.x = Math.PI / 2; drum.position.set(x, 0.39, z); yard.add(drum);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12), M.dark);
    core.rotation.x = Math.PI / 2; core.position.set(x, 0.39, z); yard.add(core);
  }
  edges(box(yard, 0.55, 0.4, 0.55, -0.05, 0.3, -0.35, M.roof), 0x8b8f96, 0.4);
  edges(box(yard, 0.42, 0.3, 0.42, 0.5, 0.25, -0.4, M.roof), 0x8b8f96, 0.4);
  edges(box(yard, 0.38, 0.26, 0.38, 0.0, 0.63, -0.35, M.concrete), 0x8b8f96, 0.4);
  addLight(yard, ['materiale'], [0.1, 1.4, 0.2], 2.6, 3);
  pool(yard, ['materiale'], 0.1, 0.05, 1.1, 0.55, 0.12);

  // trees
  for (const [x, z] of [[-4.3, -2.5], [4.45, -3.0], [4.5, 3.0], [-0.2, -3.2]]) {
    rod(world, [x, 0.08, z], [x, 0.6, z], 0.05, M.trunk);
    for (const [dx, dy, dz, r, m] of [[0, 0.78, 0, 0.32, M.tree], [0.14, 0.95, 0.06, 0.24, M.tree2], [-0.12, 0.9, -0.08, 0.22, M.tree], [0.02, 1.1, -0.02, 0.18, M.tree2]] as const) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), m); c.position.set(x + dx, dy, z + dz); world.add(c);
    }
  }

  // focus ring under the active zone
  const ringMat = new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.85, toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.011, 6, 96), ringMat);
  ring.rotation.x = -Math.PI / 2; world.add(ring);

  // ---------- post ----------
  // shadows: everything solid casts and receives; glowing bits, pools and lines don't
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.Material & { emissiveIntensity?: number };
    const isGlow = (mat as THREE.MeshBasicMaterial).isMeshBasicMaterial || mat.transparent;
    m.castShadow = !isGlow; m.receiveShadow = !isGlow;
  });
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  composer.addPass(new RenderPass(scene, camera));
  let ao: GTAOPass | null = null;
  if (!small) {
    ao = new GTAOPass(scene, camera, 1, 1);
    ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.2, thickness: 1, scale: 1.1, samples: 12 });
    ao.blendIntensity = 0.85;
    composer.addPass(ao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.4, 0.72);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---------- state ----------
  let active: ZoneId = (initial in zones ? initial : 'ndricim') as ZoneId;
  const startAll = initial === 'all';
  const focus = new THREE.Vector3().copy(zones[active].focus);
  ring.position.copy(focus);
  let yawTarget = zones[active].yaw, tiltTarget = 0, vx = 0, vy = 0;
  let mouseYaw = 0;
  let ringFade = 1;
  let started = -1; // assemblies rise in the first time the city is seen
  let now = 0;

  function flicker(t: number): number {
    if (t < 0) return OFF;
    const seq: [number, number][] = [[0.05, 1], [0.09, 0.15], [0.16, 0.85], [0.21, 0.35]];
    for (const [until, v] of seq) if (t < until) return v;
    return Math.min(1, 0.7 + (t - 0.21) * 2);
  }

  let allOn = false;
  let lastSel = initial;
  function select(id: string, instant = false) {
    lastSel = id;
    if (id === 'all') {
      // main switch: every part of town comes on, one after another
      allOn = true;
      const delay = started < 0 ? 1.3 : 0.15;
      (Object.keys(zones) as ZoneId[]).forEach((z, i) => {
        const zone = zones[z];
        const wasOn = zone.target === 1 && zone.level > 0.5;
        zone.target = 1;
        if (!wasOn) zone.onAt = instant || reduced ? -10 : now + delay + i * 0.12;
      });
      yawTarget = -0.15;
      if (reduced) render(); else wake();
      return;
    }
    if (!(id in zones)) return;
    allOn = false;
    active = id as ZoneId;
    (Object.keys(zones) as ZoneId[]).forEach((z) => {
      const zone = zones[z];
      const keep = z === active && zone.target === 1 && zone.level > 0.5;
      zone.target = z === active ? 1 : OFF;
      if (z === active && !keep) zone.onAt = instant || reduced ? -10 : now + (started < 0 ? 1.3 : 0.12);
    });
    yawTarget = zones[active].yaw;
    if (reduced) render();
    else wake();
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w * 0.8, h * 0.8);
    ao?.setSize(w, h);
    camera.aspect = w / h;
    // keep the whole board in frame on narrow screens
    camera.fov = camera.aspect < 1.1 ? 33 : 25.5;
    camera.updateProjectionMatrix();
    render();
  }

  function update(dt: number) {
    now += dt;
    const age = started < 0 ? 0 : now - started;
    for (const { group, delay } of assemblies) {
      const p = reduced ? 1 : Math.min(1, Math.max(0, (age * 1000 - delay) / 900));
      const e = 1 - Math.pow(1 - p, 3);
      group.position.y = -(1 - e) * 0.8;
      group.scale.setScalar(0.93 + 0.07 * e);
    }
    (Object.keys(zones) as ZoneId[]).forEach((z) => {
      const zone = zones[z];
      if (zone.target === 1) zone.level = reduced ? 1 : flicker(now - zone.onAt);
      else zone.level += (OFF - zone.level) * Math.min(1, dt * 10);
    });
    for (const g of glows) {
      const lv = Math.max(...g.zones.map((z) => zones[z].level));
      g.apply(lv, now);
    }
    // boom raises with the cherry-picker breaker (basket stays level)
    const fold = (1 - boomK);
    lower.rotation.z = -0.9 * fold;
    upper.rotation.z = 0.9 * fold * 0.6;
    basket.rotation.z = -(lower.rotation.z + upper.rotation.z);
    // ring glides to the active zone
    focus.lerp(zones[active].focus, reduced ? 1 : Math.min(1, dt * 7));
    ring.position.copy(focus);
    ringFade += ((allOn ? 0 : 1) - ringFade) * (reduced ? 1 : Math.min(1, dt * 8));
    ringMat.opacity = ringFade * (0.55 + 0.3 * (reduced ? 1 : 0.5 + 0.5 * Math.sin(now * 2.2)));
    // spring the world rotation toward the active zone + pointer
    const ty = yawTarget + mouseYaw;
    if (reduced) { world.rotation.y = ty; world.rotation.x = 0; }
    else {
      vy += (60 * (ty - world.rotation.y) - 14 * vy) * dt; world.rotation.y += vy * dt;
      vx += (60 * (tiltTarget - world.rotation.x) - 14 * vx) * dt; world.rotation.x += vx * dt;
    }
  }

  function render() { update(0); composer.render(); }

  // ---------- loop (only while visible) ----------
  let raf = 0, last = 0, visible = false, stopped = false;
  function frame(time: number) {
    raf = 0;
    if (stopped || !visible) return;
    const dt = Math.min(0.1, (time - (last || time)) / 1000); last = time;
    update(dt);
    composer.render();
    raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && visible && !stopped && !reduced) { last = 0; raf = requestAnimationFrame(frame); } }

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && started < 0) { started = now; select(lastSel in zones || lastSel === 'all' ? lastSel : active); }
    if (visible) { if (reduced) render(); else wake(); }
  }, { threshold: 0.15 });
  io.observe(host);

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onMove = (e: PointerEvent) => {
    if (reduced || !fine) return;
    const r = host.getBoundingClientRect();
    mouseYaw = ((e.clientX - r.left) / r.width - 0.5) * 0.22;
    tiltTarget = ((e.clientY - r.top) / r.height - 0.5) * 0.07;
  };
  const onLeave = () => { mouseYaw = 0; tiltTarget = 0; };
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  host.dataset.ready = 'true';

  return {
    select: (id: string) => select(id),
    destroy() {
      stopped = true; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
      renderer.dispose();
    },
  };
}
