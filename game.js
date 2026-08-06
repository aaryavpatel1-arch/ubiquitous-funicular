import * as THREE from 'three';

// 1. Scene & PS1 Atmosphere Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010103);
scene.fog = new THREE.FogExp2(0x010103, 0.16);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.4, 12);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2, false);
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
document.body.appendChild(renderer.domElement);

// 2. Lighting & Flashlight
const ambientLight = new THREE.AmbientLight(0x040408, 0.15);
scene.add(ambientLight);

const flashlight = new THREE.SpotLight(0xfffaed, 4.0, 16, Math.PI / 4, 0.5, 1);
camera.add(flashlight);
flashlight.position.set(0, 0, 0);
flashlight.target.position.set(0, 0, -10);
camera.add(flashlight.target);
scene.add(camera);

// 3. Build House Interior & Rooms
const wallMat = new THREE.MeshLambertMaterial({ color: 0x14141a, flatShading: true });
const floorMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0e, flatShading: true });

const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), wallMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 4;
scene.add(ceiling);

// Interior Walls
const walls = [
    new THREE.Mesh(new THREE.BoxGeometry(1, 4, 10), wallMat),
    new THREE.Mesh(new THREE.BoxGeometry(10, 4, 1), wallMat)
];
walls[0].position.set(-4, 2, -2);
walls[1].position.set(3, 2, -4);
walls.forEach(w => scene.add(w));

// 3 Collectible Keys
const keysArray = [];
const keyGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const keyMat = new THREE.MeshLambertMaterial({ color: 0xffcc00 });

const keyPositions = [
    new THREE.Vector3(-10, 1, -10),
    new THREE.Vector3(10, 1, -10),
    new THREE.Vector3(0, 1, 10)
];

keyPositions.forEach(pos => {
    const k = new THREE.Mesh(keyGeo, keyMat);
    k.position.copy(pos);
    scene.add(k);
    keysArray.push(k);
});

let keysCollected = 0;
const totalKeys = 3;
let gameEnded = false;

// 4. Jesse (The Monster)
const monsterGroup = new THREE.Group();
const monsterMat = new THREE.MeshLambertMaterial({ color: 0x020204, flatShading: true });
const mTorso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.5), monsterMat);
mTorso.position.set(0, 1.2, 0);
monsterGroup.add(mTorso);

const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mEye1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), eyeMat);
mEye1.position.set(0.15, 2.1, -0.25);
monsterGroup.add(mEye1);
const mEye2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), eyeMat);
mEye2.position.set(-0.15, 2.1, -0.25);
monsterGroup.add(mEye2);

monsterGroup.position.set(10, 0, 10);
scene.add(monsterGroup);

// 5. Controls
const inputKeys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in inputKeys) inputKeys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in inputKeys) inputKeys[e.key.toLowerCase()] = false; });

let pitch = 0, yaw = 0, isLocked = false;
document.body.addEventListener('click', () => { document.body.requestPointerLock(); });
document.addEventListener('pointerlockchange', () => { isLocked = (document.pointerLockElement === document.body); });
document.addEventListener('mousemove', (e) => {
    if (!isLocked || gameEnded) return;
    yaw -= e.movementX * 0.003;
    pitch -= e.movementY * 0.003;
    pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
});

// 6. Game Loop & Jumpscare / Bad Ending Logic
const clock = new THREE.Clock();
const uiElement = document.getElementById('ui');
const overlayElement = document.getElementById('overlay');

function triggerJumpscare(color = 'rgba(255, 0, 0, 0.85)', duration = 300) {
    overlayElement.style.background = color;
    setTimeout(() => {
        if (!gameEnded) overlayElement.style.background = 'rgba(255, 0, 0, 0)';
    }, duration);
}

function animate() {
    requestAnimationFrame(animate);
    if (gameEnded) return;

    const delta = clock.getDelta();
    const speed = 4.5 * delta;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const sideDir = new THREE.Vector3(-dir.z, 0, dir.x);

    if (inputKeys['w']) camera.position.addScaledVector(dir, speed);
    if (inputKeys['s']) camera.position.addScaledVector(dir, -speed);
    if (inputKeys['a']) camera.position.addScaledVector(sideDir, speed);
    if (inputKeys['d']) camera.position.addScaledVector(sideDir, -speed);

    // House room borders
    camera.position.x = Math.max(-13, Math.min(13, camera.position.x));
    camera.position.z = Math.max(-13, Math.min(13, camera.position.z));

    // Key Collection Logic
    keysArray.forEach((key) => {
        if (key.visible) {
            key.rotation.y += 0.04;
            if (camera.position.distanceTo(key.position) < 1.5) {
                key.visible = false;
                keysCollected++;
                triggerJumpscare('rgba(255, 0, 0, 0.6)', 200);
                uiElement.style.color = '#00ff66';
                uiElement.innerHTML = `KEYS FOUND: ${keysCollected} / ${totalKeys}`;
            }
        }
    });

    // Bad Ending Cliffhanger Trigger at Exit Door
    if (keysCollected >= totalKeys) {
        uiElement.style.color = '#00ffff';
        uiElement.innerHTML = 'FRONT DOOR UNLOCKED... OPEN IT TO ESCAPE!';

        // Reaching the front door boundary
        if (camera.position.z > 11 && Math.abs(camera.position.x) < 2.5) {
            gameEnded = true;
            triggerJumpscare('rgba(0, 0, 0, 1)', 5000); // Absolute blackout
            uiElement.style.color = '#ff0000';
            uiElement.innerHTML = 'YOU OPENED THE DOOR... BUT JESSE WAS WAITING OUTSIDE. BAD ENDING.';
            
            setTimeout(() => {
                uiElement.innerHTML = 'TO BE CONTINUED...';
            }, 3000);
            return;
        }
    }

    // Monster AI Pursuit
    const monsterSpeed = 1.9 * delta;
    monsterGroup.position.lerp(new THREE.Vector3(camera.position.x, 0, camera.position.z), monsterSpeed * 0.35);
    monsterGroup.lookAt(camera.position.x, monsterGroup.position.y, camera.position.z);

    // Catch Check
    if (monsterGroup.position.distanceTo(camera.position) < 1.3) {
        triggerJumpscare('rgba(255, 0, 0, 0.9)', 400);
        camera.position.set(0, 1.4, 12);
        monsterGroup.position.set(10, 0, 10);
        uiElement.style.color = '#ff3333';
        uiElement.innerHTML = 'JESSE CAUGHT YOU! FIND ALL KEYS!';
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2, false);
});
