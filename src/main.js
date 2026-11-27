
import * as THREE from "https://esm.sh/three@0.170.0";
import { OrbitControls } from "https://esm.sh/three@0.170.0/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("motor-canvas");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101827);

const camera = new THREE.PerspectiveCamera(
  45, container.clientWidth / container.clientHeight, 0.1, 100
);
camera.position.set(4, 3.5, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);
controls.minDistance = 3;
controls.maxDistance = 12;

scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(4, 6, 5);
light.castShadow = true;
scene.add(light);

const motor = new THREE.Group();
scene.add(motor);

const metal = new THREE.MeshStandardMaterial({
  color: 0x8795a8, metalness: 0.8, roughness: 0.25
});

const darkMetal = new THREE.MeshStandardMaterial({
  color: 0x334155, metalness: 0.8, roughness: 0.3
});

const copper = new THREE.MeshStandardMaterial({
  color: 0xd97706, metalness: 0.65, roughness: 0.25
});
const phaseA = new THREE.MeshStandardMaterial({ color: 0xef4444 });
const phaseB = new THREE.MeshStandardMaterial({ color: 0x22c55e });
const phaseC = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });

const phases = [phaseA, phaseB, phaseC];

const blue = new THREE.MeshStandardMaterial({
  color: 0x2563eb, metalness: 0.4, roughness: 0.3
});

const red = new THREE.MeshStandardMaterial({
  color: 0xdc2626, metalness: 0.4, roughness: 0.3
});

// Stator body
const stator = new THREE.Mesh(
  new THREE.CylinderGeometry(1.8, 1.8, 1.1, 64, 1, true),
  metal
);
stator.rotation.x = Math.PI / 2;
motor.add(stator);

// Front and rear stator rings
for (const z of [-0.55, 0.55]) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.13, 16, 80),
    darkMetal
  );
  ring.position.z = z;
  motor.add(ring);
}

// Stator windings
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2;

  const winding = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.65, 0.75),
    copper[ i%3]
  );

  winding.position.set(
    Math.cos(angle) * 1.48,
    Math.sin(angle) * 1.48,
    0
  );

  winding.rotation.z = angle;
  motor.add(winding);
}

// Rotor assembly
const rotor = new THREE.Group();
motor.add(rotor);

const rotorBody = new THREE.Mesh(
  new THREE.CylinderGeometry(1.05, 1.05, 0.65, 64),
  darkMetal
);
rotorBody.rotation.x = Math.PI / 2;
rotor.add(rotorBody);

// Rotor front disc
const disc = new THREE.Mesh(
  new THREE.CylinderGeometry(0.85, 0.85, 0.12, 64),
  metal
);
disc.rotation.x = Math.PI / 2;
disc.position.z = 0.36;
rotor.add(disc);

// Shaft
const shaft = new THREE.Mesh(
  new THREE.CylinderGeometry(0.16, 0.16, 1.8, 32),
  metal
);
shaft.rotation.x = Math.PI / 2;
rotor.add(shaft);

// Permanent magnets
for (let i = 0; i < 4; i++) {
  const angle = (i / 4) * Math.PI * 2;

  const magnet = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.2, 0.5),
    i % 2 === 0 ? blue : red
  );

  magnet.position.set(
    Math.cos(angle) * 0.78,
    Math.sin(angle) * 0.78,
    0.15
  );

  magnet.rotation.z = angle;
  rotor.add(magnet);
}
// Rotating Magnetic Field Arrow
const fieldArrow = new THREE.ArrowHelper(
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, 0),
  1.4,
  0xfacc15,
  0.25,
  0.15
);

motor.add(fieldArrow);

// Q Axis Arrow
const qArrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 0),
  1.1,
  0xa78bfa,
  0.2,
  0.12
);

motor.add(qArrow);
// Base
const base = new THREE.Mesh(
  new THREE.BoxGeometry(4.5, 0.25, 2.8),
  darkMetal
);
base.position.set(0, -2.1, 0);
motor.add(base);

// Ground grid
const grid = new THREE.GridHelper(10, 20, 0x475569, 0x263449);
grid.position.y = -2.25;
scene.add(grid);

// Motor controls
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
  rotor.rotation.z += speed;

  const angle = rotor.rotation.z;

  fieldArrow.setDirection(
    new THREE.Vector3(
      Math.cos(angle),
      Math.sin(angle),
      0
    )
  );

  qArrow.setDirection(
    new THREE.Vector3(
      -Math.sin(angle),
      Math.cos(angle),
      0
    )
  );
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
