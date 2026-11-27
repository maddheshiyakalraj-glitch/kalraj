import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101827);

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.1, 100
);
camera.position.set(4, 4, 5);

const container = document.getElementById("motor-canvas");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth || 800, 500);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 8, 5);
scene.add(light);

const motor = new THREE.Group();
scene.add(motor);

// Stator
const metal = new THREE.MeshStandardMaterial({
  color: 0x94a3b8, metalness: 0.7, roughness: 0.3
});

const stator = new THREE.Mesh(
  new THREE.TorusGeometry(1.8, 0.18, 16, 100), metal
);
stator.rotation.x = Math.PI / 2;
motor.add(stator);

// Copper windings
const copper = new THREE.MeshStandardMaterial({ color: 0xd97706 });

for (let i = 0; i < 12; i++) {
  const angle = i * Math.PI / 6;
  const winding = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.6, 0.22), copper
  );
  winding.position.set(
    Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5
  );
  winding.rotation.y = -angle;
  motor.add(winding);
}

// Rotor
const rotor = new THREE.Group();
motor.add(rotor);

const rotorBody = new THREE.Mesh(
  new THREE.CylinderGeometry(1.05, 1.05, 0.5, 64),
  new THREE.MeshStandardMaterial({
    color: 0x64748b, metalness: 0.8, roughness: 0.3
  })
);
rotor.add(rotorBody);

// Shaft
const shaft = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.15, 1.5, 32),
  metal
);
rotor.add(shaft);

// Permanent magnets
const blue = new THREE.MeshStandardMaterial({ color: 0x2563eb });
const red = new THREE.MeshStandardMaterial({ color: 0xdc2626 });

for (let i = 0; i < 4; i++) {
  const angle = i * Math.PI / 2;
  const magnet = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.15, 0.25),
    i % 2 === 0 ? blue : red
  );
  magnet.position.set(
    Math.cos(angle) * 0.8, 0.32, Math.sin(angle) * 0.8
  );
  magnet.rotation.y = -angle;
  rotor.add(magnet);
}

const grid = new THREE.GridHelper(10, 10);
grid.position.y = -1.2;
scene.add(grid);

let running = false;
let speed = 0.05;

document.getElementById("start-btn").onclick = () => {
  running = true;
  document.getElementById("status").textContent = "Running";
};

document.getElementById("stop-btn").onclick = () => {
  running = false;
  document.getElementById("status").textContent = "Stopped";
};

document.getElementById("speed").oninput = (event) => {
  speed = Number(event.target.value) * 0.01;
  document.getElementById("speed-value").textContent = event.target.value;
};

function animate() {
  requestAnimationFrame(animate);

  if (running) {
    rotor.rotation.y += speed;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

