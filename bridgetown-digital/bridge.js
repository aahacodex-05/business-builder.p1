// 3D St. Johns-style bridge at dusk for the hero background.
import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById("bridge");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const COLORS = {
  steel: 0x2fa37a,
  deck: 0x1d1838,
  hills: 0x1b2a3a,
  trees: 0x14402f,
  mountain: 0x7a6aa8,
  snow: 0xfff1f6,
  lamp: 0xffd23f,
  beacon: 0xff4f8b
};

const TOWER_X = 60;
const TOWER_TOP = 74;
const DECK_Y = 14;
const DECK_HALF_WIDTH = 7;
const ANCHOR_X = 140;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch {
  canvas.remove(); // No WebGL: the CSS gradient behind the canvas shows instead.
}

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const sky = skyTexture();
  scene.background = sky;
  scene.environment = new THREE.PMREMGenerator(renderer).fromEquirectangular(sky).texture;
  scene.fog = new THREE.Fog(0xc2378f);

  scene.add(new THREE.HemisphereLight(0xffa3c4, 0x3a2a70, 1.6));
  const sun = new THREE.DirectionalLight(0xffb36b, 2.4);
  sun.position.set(-200, 120, -300);
  const fill = new THREE.DirectionalLight(0xff8ab0, 1.4);
  fill.position.set(150, 80, 220);
  scene.add(sun, fill);

  scene.add(water(), landscape(), bridge());

  const camera = new THREE.PerspectiveCamera(40, 1, 1, 3000);
  const target = new THREE.Vector3();
  const pointer = { x: 0, y: 0 };

  addEventListener("pointermove", e => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    const portrait = w < h;
    camera.aspect = w / h;
    camera.fov = portrait ? 60 : 40;
    // Back the camera off until the whole span fits across the screen.
    const halfFov = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    const d = Math.max(250, (portrait ? 95 : 125) / Math.tan(halfFov));
    camera.userData.distance = d;
    scene.fog.near = d + 100;
    scene.fog.far = d + 1300;
    // Aim low so the bridge sits above the headline; on wide screens, also shift it right.
    target.set(portrait ? 0 : -45, portrait ? -10 : 22, 0);
    camera.updateProjectionMatrix();
  };

  const draw = t => {
    const angle = -0.55 + Math.sin(t * 0.00008) * 0.25 + pointer.x * 0.15;
    const d = camera.userData.distance;
    camera.position.set(Math.sin(angle) * d, 26 - pointer.y * 8, Math.cos(angle) * d);
    camera.lookAt(target);
    renderer.render(scene, camera);
  };

  let visible = true;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(canvas);

  addEventListener("resize", resize);
  resize();

  if (reduceMotion) {
    draw(0);
    addEventListener("resize", () => draw(0));
  } else {
    renderer.setAnimationLoop(t => visible && draw(t));
  }
  canvas.classList.add("ready");
}

function skyTexture() {
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, "#1a0f4a");
  grad.addColorStop(0.32, "#4b1fa8");
  grad.addColorStop(0.44, "#c2378f");
  grad.addColorStop(0.5, "#ff8a3d");
  grad.addColorStop(0.53, "#2a1850");
  grad.addColorStop(1, "#0d0a1e");
  g.fillStyle = grad;
  g.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function water() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.MeshStandardMaterial({ color: 0x6a4bb8, metalness: 0.85, roughness: 0.12 })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function landscape() {
  const group = new THREE.Group();

  const hood = new THREE.Mesh(new THREE.ConeGeometry(280, 240, 48), new THREE.MeshStandardMaterial({ color: COLORS.mountain, roughness: 1 }));
  hood.position.set(250, 120, -900);
  const snow = new THREE.Mesh(new THREE.ConeGeometry(100, 86, 48), new THREE.MeshStandardMaterial({ color: COLORS.snow, roughness: 0.6 }));
  snow.position.set(250, 197, -900);
  group.add(hood, snow);

  const hillMat = new THREE.MeshStandardMaterial({ color: COLORS.hills, roughness: 1 });
  for (const [x, z, sx, sy] of [[-260, -60, 160, 50], [260, -40, 170, 46], [-60, -320, 260, 40], [300, -300, 200, 36]]) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), hillMat);
    hill.scale.set(sx, sy, 90);
    hill.position.set(x, 0, z);
    group.add(hill);
  }

  // Evergreens on both banks.
  const tree = new THREE.ConeGeometry(4, 18, 6);
  tree.translate(0, 9, 0);
  const trees = new THREE.InstancedMesh(tree, new THREE.MeshStandardMaterial({ color: COLORS.trees, roughness: 1 }), 220);
  const m = new THREE.Matrix4();
  for (let i = 0; i < trees.count; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (150 + Math.random() * 160);
    const z = -140 + Math.random() * 200;
    const s = 0.7 + Math.random() * 0.8;
    m.makeScale(s, s, s).setPosition(x, Math.max(0, 30 - Math.abs(z + 40) * 0.2), z);
    trees.setMatrixAt(i, m);
  }
  group.add(trees);
  return group;
}

function bridge() {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: COLORS.steel, metalness: 0.5, roughness: 0.45 });
  const deckMat = new THREE.MeshStandardMaterial({ color: COLORS.deck, metalness: 0.3, roughness: 0.6 });
  const lampMat = new THREE.MeshBasicMaterial({ color: COLORS.lamp });
  const beaconMat = new THREE.MeshBasicMaterial({ color: COLORS.beacon });

  const deck = new THREE.Mesh(new THREE.BoxGeometry(ANCHOR_X * 2 + 40, 2.5, DECK_HALF_WIDTH * 2), deckMat);
  deck.position.y = DECK_Y;
  group.add(deck);

  for (const x of [-TOWER_X, TOWER_X]) {
    group.add(tower(x, steel, beaconMat));
    const pier = new THREE.Mesh(new THREE.BoxGeometry(10, DECK_Y, 22), deckMat);
    pier.position.set(x, DECK_Y / 2, 0);
    group.add(pier);
  }

  // Main and side-span cables with vertical suspenders down to the deck.
  const suspender = new THREE.CylinderGeometry(0.18, 0.18, 1, 4);
  for (const z of [-DECK_HALF_WIDTH, DECK_HALF_WIDTH]) {
    const points = [];
    for (let x = -ANCHOR_X; x <= ANCHOR_X; x += 2) points.push(new THREE.Vector3(x, cableY(x), z));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 280, 0.6, 6), steel));

    for (let x = -ANCHOR_X + 6; x < ANCHOR_X; x += 6) {
      if (Math.abs(Math.abs(x) - TOWER_X) < 3) continue;
      const h = cableY(x) - DECK_Y;
      const rod = new THREE.Mesh(suspender, steel);
      rod.scale.y = h;
      rod.position.set(x, DECK_Y + h / 2, z);
      group.add(rod);
    }
  }

  // Street lamps along both edges of the deck.
  const lamp = new THREE.SphereGeometry(0.7, 8, 8);
  for (let x = -ANCHOR_X; x <= ANCHOR_X; x += 12) {
    for (const z of [-DECK_HALF_WIDTH - 1, DECK_HALF_WIDTH + 1]) {
      const bulb = new THREE.Mesh(lamp, lampMat);
      bulb.position.set(x, DECK_Y + 4, z);
      group.add(bulb);
    }
  }
  return group;
}

// Parabolic sag in the main span, straight-ish fall to the anchorages.
function cableY(x) {
  const ax = Math.abs(x);
  if (ax <= TOWER_X) return 28 + (TOWER_TOP - 6 - 28) * (ax / TOWER_X) ** 2;
  const t = (ax - TOWER_X) / (ANCHOR_X - TOWER_X);
  return TOWER_TOP - 6 - (TOWER_TOP - 6 - DECK_Y) * Math.sqrt(t);
}

// Gothic tower: a slab with two pointed-arch openings, topped by spires.
function tower(x, steel, beaconMat) {
  const w = DECK_HALF_WIDTH + 3;
  const shape = new THREE.Shape()
    .moveTo(-w, 0)
    .lineTo(w, 0)
    .lineTo(w, TOWER_TOP)
    .lineTo(-w, TOWER_TOP)
    .closePath();
  shape.holes.push(pointedArch(-w + 3, w - 3, DECK_Y + 2, DECK_Y + 30), pointedArch(-w + 4, w - 4, DECK_Y + 36, TOWER_TOP - 6));

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: false });
  geo.translate(0, 0, -2);
  geo.rotateY(Math.PI / 2);
  const slab = new THREE.Mesh(geo, steel);
  slab.position.x = x;

  const group = new THREE.Group().add(slab);
  const spire = new THREE.ConeGeometry(1.6, 12, 4);
  for (const z of [-w + 1.5, w - 1.5]) {
    const s = new THREE.Mesh(spire, steel);
    s.position.set(x, TOWER_TOP + 6, z);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), beaconMat);
    beacon.position.set(x, TOWER_TOP + 12.5, z);
    group.add(s, beacon);
  }
  return group;
}

function pointedArch(left, right, bottom, top) {
  const mid = (left + right) / 2;
  const spring = top - (right - left) * 0.9;
  return new THREE.Path()
    .moveTo(left, bottom)
    .lineTo(left, spring)
    .quadraticCurveTo(left, top - 2, mid, top)
    .quadraticCurveTo(right, top - 2, right, spring)
    .lineTo(right, bottom)
    .closePath();
}
