import * as THREE from 'three';

// 1. Scene & PS1 Fog Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);
scene.fog = new THREE.FogExp2(0x050508, 0.12);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.4, 6);

// Low-resolution renderer for retro pixel jitter effect
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2, false);
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
document.body.appendChild(renderer.domElement);

// 2. Retro Lighting & Flashlight
const ambientLight = new THREE.AmbientLight(0x111122, 0.4);
scene.add(ambientLight);

const flashlight = new THREE.SpotLight(0xffffee, 3.5, 18, Math.PI / 4, 0.5, 1);
camera.add(flashlight);
flashlight.position.set(0, 0, 0);
flashlight.target.position.set(0, 0, -10);
camera.add(flashlight.target);
scene.add(camera);

// 3. Build Low-Poly Hallway Environment
const wallMat = new THREE.MeshLambertMaterial({ color: 0x222228, flatShading: true });
const floorMat = new THREE.MeshLambertMaterial({ color: 0x151518, flatShading: true });

const floorGeo = new THREE.PlaneGeometry(20, 40, 8, 16);
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ceiling = new THREE.Mesh(floorGeo, wallMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 3.5;
scene.add(ceiling);

const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 3.5, 40), wallMat);
leftWall.position.set(-6, 1.75, 0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(new THREE.BoxGeometry(1, 3.5, 40), wallMat);
rightWall.position.set(6, 1.75, 0);
scene.add(rightWall);

// 4. Wall Monster Setup
const monsterGroup = new THREE.Group();
const monsterMat = new THREE.MeshLambertMaterial({ color: 0x1a0505, flatShading: true });

const mHead = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.8), monsterMat);
mHead.position.set(0, 1.8, 0);
monsterGroup.add(mHead);

const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mEye1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), eyeMat);
mEye1.position.set(0.2, 1.9, -0.4);
monsterGroup.add(mEye1);
const mEye2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), eyeMat);
mEye2.position.set(-0.2, 1.9, -0.4);
monsterGroup.add(mEye2);

monsterGroup.position.set(5.5, 0, -8);
scene.add(monsterGroup);

let monsterTriggered = false;

// 5. Controls
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });

let pitch = 0, yaw = 0, isLocked = false;
document.body.addEventListener('click', () => { document.body.requestPointerLock(); });
document.addEventListener('pointerlockchange', () => { isLocked = (document.pointerLockElement === document.body); });
document.addEventListener('mousemove', (e) => {
    if (!isLocked) return;
    yaw -= e.movementX * 0.003;
    pitch -= e.movementY * 0.003;
    pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
});

// 6. Game Loop
const clock = new THREE.Clock();
const uiElement = document.getElementById('ui');
const overlayElement = document.getElementById('overlay');

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const speed = 5.0 * delta;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const sideDir = new THREE.Vector3(-dir.z, 0, dir.x);

    if (keys['w']) camera.position.addScaledVector(dir, speed);
    if (keys['s']) camera.position.addScaledVector(dir, -speed);
    if (keys['a']) camera.position.addScaledVector(sideDir, speed);
    if (keys['d']) camera.position.addScaledVector(sideDir, -speed);

    camera.position.x = Math.max(-5, Math.min(5, camera.position.x));
    camera.position.z = Math.max(-18, Math.min(18, camera.position.z));

    if (!monsterTriggered && camera.position.z < -2) {
        monsterTriggered = true;
        uiElement.style.color = '#ff0000';
        uiElement.innerHTML = 'IT IS BREAKING THROUGH THE WALL!';
    }

    if (monsterTriggered) {
        monsterGroup.position.x = THREE.MathUtils.lerp(monsterGroup.position.x, camera.position.x, 0.03);
        monsterGroup.position.z = THREE.MathUtils.lerp(monsterGroup.position.z, camera.position.z, 0.02);
        monsterGroup.lookAt(camera.position.x, monsterGroup.position.y, camera.position.z);

        if (monsterGroup.position.distanceTo(camera.position) < 1.5) {
            overlayElement.style.background = 'rgba(255, 0, 0, 0.85)';
            setTimeout(() => { overlayElement.style.background = 'rgba(255, 0, 0, 0)'; }, 300);
            
            camera.position.set(0, 1.4, 6);
            monsterGroup.position.set(5.5, 0, -8);
            monsterTriggered = false;
            uiElement.style.color = '#ff3333';
            uiElement.innerHTML = 'RUN AWAY FROM THE DARKNESS';
        }
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2, false);
});
