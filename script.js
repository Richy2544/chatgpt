import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { GLTFLoader } from './libs/GLTFLoader.js';

// Debug: Messaggi iniziali
console.log('Script avviato');

// Configura la scena, la camera e il renderer
const container = document.getElementById('container');
console.log('Container trovato:', container);
if (!container) {
    console.error('Errore: elemento container non trovato nel DOM.');
    throw new Error('Elemento container non trovato nel DOM.');
}

const scene = new THREE.Scene();
console.log('Scena creata:', scene);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
console.log('Camera configurata:', camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);
console.log('Renderer configurato e aggiunto al DOM');

// Aggiungi controlli per ruotare e zoomare
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
console.log('Controlli Orbit aggiunti:', controls);

// Aggiungi una luce
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
console.log('Luce direzionale aggiunta:', light);

// Carica il modello della scacchiera
const loader = new GLTFLoader();
loader.load('assets/scacchiera.glb', (gltf) => {
    console.log('Modello caricato:', gltf);
    const scacchiera = gltf.scene;
    scene.add(scacchiera);

    // Configura posizione e scala
    scacchiera.position.set(0, 0, 0);
    scacchiera.scale.set(1, 1, 1);

    // Rendi i pezzi interattivi
    scacchiera.traverse((child) => {
        if (child.isMesh) {
            child.userData.draggable = true;
            console.log('Pezzo interattivo trovato:', child);
        }
    });
}, undefined, (error) => {
    console.error('Errore nel caricamento del modello:', error);
});

// Configura trascinamento dei pezzi
let selectedPiece = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.draggable) {
            selectedPiece = obj;
            console.log('Pezzo selezionato:', selectedPiece);
        }
    }
}

function onMouseMove(event) {
    if (selectedPiece) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            selectedPiece.position.copy(intersects[0].point);
            console.log('Pezzo spostato:', selectedPiece.position);
        }
    }
}

function onMouseUp() {
    if (selectedPiece) {
        console.log('Pezzo rilasciato:', selectedPiece);
        selectedPiece = null;
    }
}

window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);

// Animazione
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

camera.position.z = 10;
animate();
