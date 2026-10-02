import * as THREE from "three";
import { APP_TAGLINE, APP_TITLE } from "./appInfo";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root");
}

app.innerHTML = `
  <main class="game-shell" aria-label="${APP_TITLE}">
    <div class="arena" data-testid="arena"></div>
    <header class="hud" aria-label="Track status">
      <div class="brand">${APP_TITLE}</div>
      <div class="hud-panel">
        <span>Score <strong data-testid="score">0</strong></span>
        <span>Combo <strong data-testid="combo">0</strong></span>
      </div>
    </header>
    <section class="center-panel">
      <div class="start-card">
        <h1>${APP_TITLE}</h1>
        <p>${APP_TAGLINE}</p>
        <button class="primary-button" data-testid="start-button" type="button">Start Track</button>
      </div>
    </section>
  </main>
`;

const maybeArena = app.querySelector<HTMLDivElement>("[data-testid='arena']");

if (!maybeArena) {
  throw new Error("Missing arena");
}

const arena: HTMLDivElement = maybeArena;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060c);

const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
camera.position.set(0, 1.2, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
arena.appendChild(renderer.domElement);

const grid = new THREE.GridHelper(8, 8, 0x46f7ff, 0x1a2d44);
grid.rotation.x = Math.PI / 2;
grid.position.z = -2;
scene.add(grid);

const saberGeometry = new THREE.CylinderGeometry(0.035, 0.035, 2.2, 16);
const saberMaterial = new THREE.MeshBasicMaterial({ color: 0x46f7ff });
const saber = new THREE.Mesh(saberGeometry, saberMaterial);
saber.rotation.z = -0.65;
saber.position.set(-0.7, -0.5, 0);
scene.add(saber);

const blockGeometry = new THREE.BoxGeometry(0.75, 0.75, 0.28);
const blockMaterial = new THREE.MeshBasicMaterial({ color: 0xff3bc8 });
const block = new THREE.Mesh(blockGeometry, blockMaterial);
block.position.set(0.85, 0.35, -1.2);
scene.add(block);

function resize() {
  const width = arena.clientWidth || window.innerWidth;
  const height = arena.clientHeight || window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  block.rotation.x += 0.008;
  block.rotation.y += 0.011;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
animate();
