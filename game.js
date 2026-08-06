import * as THREE from 'three';

// 1. Scene & Atmosphere Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010103);
scene.fog = new THREE.FogExp2(0x010103, 0.15);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.4, 20);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth / 2, window.innerHeight / 2, false);
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
document.body.appendChild(renderer.domElement);

// 2. Lighting & Flashlight
const ambientLight = new THREE.AmbientLight(0x030306, 0.1);
scene.add(ambientLight);

const flashlight = new THREE.SpotLight(0xfffaed, 4.0, 18, Math.PI / 4, 0.5, 1);
camera.add(flashlight);
flashlight.position.set(0, 0, 0);
flashlight.target.position.set(0, 0, -10);
camera.add(flashlight.target);
scene.add(camera);

// 3. Game Chapters & Environment Setup
let currentChapter = 1; // Chapter 1: Forest, Chapter 2: House, Chapter 3: Basement, Chapter 4: Final Run
const uiElement = document.getElementById('ui');
const overlayElement = document.getElementById('overlay');

// Environment Group containers so we can swap chapters easily
const chapterGroup = new THREE.Group();
scene.add(chapterGroup);

function loadChapter(chapterNum) {
    chapterGroup.clear();
    currentChapter = chapterNum;
    
    if (chapterNum === 1) {
        // CHAPTER 1: THE FOREST
        uiElement.style.color = '#ff3333';
        uiElement.innerHTML = 'CHAPTER 1: FIND THE CABIN IN THE WOODS';
        camera.position.set(0, 1.4, 25);
        
        // Forest ground
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshLambertMaterial({ color: 0x060b06 }));
        floor.rotation.x = -Math.PI / 2;
        chapterGroup.add(floor);

        // Cabin destination marker
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), new THREE.MeshLambertMaterial({ color: 0x15151b }));
        cabin.position.set(0, 2, -25);
        chapterGroup.add(cabin);
        
    } else if (chapterNum === 2) {
        // CHAPTER 2: THE HOUSE Labyrinth
        uiElement.style.color = '#ffaa00';
        uiElement.innerHTML = 'CHAPTER 2: FIND 3 KEYS TO UNLOCK THE BASEMENT';
        camera.position.set(0, 1.4, 10);

        // House Floor & Walls
        const houseFloor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshLambertMaterial({ color: 0x0a0a0e }));
        houseFloor.rotation.x = -Math.PI / 2;
        chapterGroup.add(houseFloor);

        const wallMat = new THREE.MeshLambertMaterial({ color: 0x14141a });
        const w1 = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 12), wallMat);
        w1.position.set(-4, 2, 0);
        const w2 = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 1), wallMat);
        w2.position.set(2, 2, -5);
        chapterGroup.add(w1);
        chapterGroup.add(w2);

        // Spawn Keys
        const keyGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const keyMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const k1 = new THREE.Mesh(keyGeo, keyMat); k1.position.set(-10, 1, -10); k1.name = 'key';
        const k2 = new THREE.Mesh(keyGeo, keyMat); k2.position.set(10, 1, -10); k2.name = 'key';
        const k3 = new THREE.Mesh(keyGeo, keyMat); k3.position.set(0, 1, 10); k3.name = 'key';
        chapterGroup.add(k1); chapterGroup.add(k2); chapterGroup.add(k3);

    } else if (chapterNum === 3) {
        // CHAPTER 3: THE BASEMENT MAZE
        uiElement.style.color = '#ff0000';
        uiElement.innerHTML = 'CHAPTER 3: NAVIGATE THE DARK BASEMENT';
        camera.position.set(0, 1.4, 10);

        const baseFloor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshLambertMaterial({ color: 0x020203 }));
        baseFloor.rotation.x = -Math.PI / 2;
        chapterGroup.add(baseFloor);

        // Exit door for chapter 3
        const exitDoor = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.5), new THREE.MeshLambertMaterial({ color: 0x331111 }));
        exitDoor.position.set(0, 1.5, -18);
        exitDoor.name = 'exitDoor';
        chapterGroup.add(exitDoor);

    } else if (chapterNum === 4) {
        // CHAPTER 4: THE FINAL SPRINT / CLIFFHANGER
        uiElement.style.color = '#ff0000';
        uiElement.innerHTML = 'CHAPTER 4: RUN TO THE CAR!';
        camera.position.set(0, 1.4, 15);

        const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), new THREE.MeshLambertMaterial({ color: 0x0d0d12 }));
        road.rotation.x = -Math.PI / 2;
        chapterGroup.add(road);
    }
}

// 4. Jesse (The Stalking Monster)
const monsterGroup = new THREE.Group();
const monsterMat = new THREE.MeshLambertMaterial({ color: 0x020204 });
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

monsterGroup.position.set(0, 0, 30);
scene.add(monsterGroup);

// Track game inventory variables
let keysFound = 0;
let gameEnded = false;

// Initialize Chapter 1
loadChapter(1);

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

// Jumpscare helper
function triggerJumpscare() {
    overlayElement.style.background = 'rgba(255, 0, 0, 0.85)';
    setTimeout(() => { if (!gameEnded) overlayElement.style.background = 'rgba(0, 0, 0, 0)'; }, 350);
}

// 6. Main Game Loop & Chapter Progression Logic
const clock = new THREE.Clock();

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

    // CHAPTER PROGRESSION CHECKERS
    if (currentChapter === 1) {
        // Reach cabin at Z: -25
        if (camera.position.z < -22) {
            loadChapter(2);
        }
    } 
    else if (currentChapter === 2) {
        // Collect keys in chapter 2
        chapterGroup.children.forEach((child) => {
            if (child.name === 'key' && child.visible) {
                child.rotation.y += 0.04;
                if (camera.position.distanceTo(child.position) < 1.5) {
                    child.visible = false;
                    keysFound++;
                    triggerJumpscare();
                    uiElement.innerHTML = `KEYS FOUND: ${keysFound} / 3`;
                    if (keysFound >= 3) {
                        loadChapter(3);
                    }
                }
            }
        });
    } 
    else if (currentChapter === 3) {
        // Navigate basement to reach exit door at Z: -18
        if (camera.position.z < -16) {
            loadChapter(4);
        }
    } 
    else if (currentChapter === 4) {
        // Final chase run to Z: -25 for bad ending cliffhanger
        if (camera.position.z < -22) {
            gameEnded = true;
            overlayElement.style.background = 'rgba(0, 0, 0, 1)';
            uiElement.style.color = '#ff0000';
            uiElement.innerHTML = 'YOU REACHED THE CAR... BUT THE DOORS ARE LOCKED FROM INSIDE. BAD ENDING.';
            setTimeout(() => { uiElement.innerHTML = 'TO BE CONTINUED...'; }, 3000);
            return;
        }
    }

    // Monster AI Pursuit across all chapters
    const monsterSpeed = 2.0 * delta;
    monsterGroup.position.lerp(new THREE.Vector3(camera.position.x, 0, camera.position.z), monsterSpeed * 0.3);
    monsterGroup.lookAt(camera.position.x, monsterGroup.position.y, camera.position.z);

    // Catch Check
    if (monsterGroup.position.distanceTo(camera.position) < 1.3) {
        triggerJumpscare();
        // Reset current chapter on death
        loadChapter(currentChapter);
        uiElement.style.color = '#ff3333';
        uiElement.innerHTML = 'JESSE CAUGHT YOU! TRY AGAIN.';
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2, false);
});
