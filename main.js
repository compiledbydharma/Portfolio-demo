import { initScene } from './scene.js';
import { initCamera, getCamera, getCameraTarget, navigateTo, setViewTargets, look } from './camera.js';
import { buildWorld, coreHitbox, erpHitbox } from './world.js';
import { initInteraction, updateHover, handleClick, getHoveredObject, setInteractables } from './interaction.js';
import { initAccessibility, showFallbackUI, hideFallbackUI } from './accessibility.js';
import { projectData } from './data.js';
import * as THREE from 'three';

export const state = {
    scene: null,
    renderer: null,
    labelRenderer: null,
    camera: null,
    cameraTarget: null,
    coreHitbox: null,
    erpHitbox: null,
    erpGroup: null,
    deepInfoGroup: null,
    loopRing: null,
    loopRing2: null,
    erpGlow: null,
    pulseMesh: null,
    particles: null,
    distantGroup: null,
    interactables: [],
    isTransitioning: false,
    currentView: 'core',
    erpRevealed: false,
};

function init() {
    // ── 1. SCENE ────────────────────────────────────────────────
    const { scene, renderer, labelRenderer } = initScene();
    state.scene = scene;
    state.renderer = renderer;
    state.labelRenderer = labelRenderer;

    // ── 2. CAMERA ──────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 120);
    const { cameraTarget, setViewTargets: setViews } = initCamera(camera);
    state.camera = camera;
    state.cameraTarget = cameraTarget;

    // ── 3. VIEWPOINTS ──────────────────────────────────────────
    const views = {
        core: {
            position: new THREE.Vector3(0, 1.8, 6.5),
            target: new THREE.Vector3(0, 0.6, 0),
        },
        erp: {
            position: new THREE.Vector3(12, 2.2, 4.5),
            target: new THREE.Vector3(14, 0.8, 0),
        },
    };
    setViews(views);

    // ── 4. WORLD ───────────────────────────────────────────────
    const worldObjects = buildWorld(scene);
    state.coreHitbox = worldObjects.coreHitbox;
    state.erpHitbox = worldObjects.erpHitbox;
    state.erpGroup = worldObjects.erpGroup;
    state.deepInfoGroup = worldObjects.deepInfoGroup;
    state.loopRing = worldObjects.loopRing;
    state.loopRing2 = worldObjects.loopRing2;
    state.erpGlow = worldObjects.erpGlow;
    state.pulseMesh = worldObjects.pulseMesh;
    state.particles = worldObjects.particles;
    state.distantGroup = worldObjects.distantGroup;

    // ── 5. INTERACTION ─────────────────────────────────────────
    const interactables = [worldObjects.coreHitbox, worldObjects.erpHitbox];
    state.interactables = interactables;
    setInteractables(interactables);

    // Initialize interaction with look callback
    initInteraction(state.renderer.domElement, state.camera, (dx, dy) => {
        look(dx, dy);
    });

    // ── 6. ACCESSIBILITY ──────────────────────────────────────
    initAccessibility({
        onReturn: () => navigateTo('core'),
        onContact: () => {
            navigator.clipboard?.writeText('justprayag2008@gmail.com');
            alert('Email: justprayag2008@gmail.com\nInstagram: @sirf.safar');
        },
    });

    // ── 7. EVENT LISTENERS ────────────────────────────────────
    const hideFallback = () => {
        hideFallbackUI();
        state.renderer.domElement.removeEventListener('click', hideFallback);
        state.renderer.domElement.removeEventListener('touchstart', hideFallback);
    };
    state.renderer.domElement.addEventListener('click', hideFallback);
    state.renderer.domElement.addEventListener('touchstart', hideFallback);

    // ── 8. START ANIMATION LOOP ───────────────────────────────
    animate();
    console.log('THRESHOLD — Vertical Slice ready.');
}

let clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);

    // Update camera transition
    const cameraState = window.__cameraState || {};
    if (cameraState.isTransitioning) {
        if (typeof window.__updateCamera === 'function') {
            window.__updateCamera(delta);
        }
    }

    // Update world animations
    updateWorldAnimations(delta);

    // Render
    state.renderer.render(state.scene, state.camera);
    state.labelRenderer.render(state.scene, state.camera);
}

function updateWorldAnimations(delta) {
    const time = clock.elapsedTime;

    const pulse = state.pulseMesh;
    if (pulse) {
        const intensity = 0.25 + 0.15 * Math.sin(time * 0.6);
        pulse.material.emissiveIntensity = intensity;
        pulse.scale.setScalar(1 + 0.08 * Math.sin(time * 0.6 + 0.5));
    }

    const ring1 = state.loopRing;
    const ring2 = state.loopRing2;
    if (ring1 && ring2) {
        ring1.rotation.z = time * 0.09;
        ring1.rotation.x = Math.PI / 2.8 + 0.08 * Math.sin(time * 0.3);
        ring2.rotation.z = -time * 0.075;
        ring2.rotation.x = Math.PI / 2.2 + 0.06 * Math.sin(time * 0.25 + 1);
    }

    const particles = state.particles;
    if (particles) {
        particles.rotation.y = time * 0.003;
        particles.rotation.x = 0.02 * Math.sin(time * 0.001);
    }

    const distant = state.distantGroup;
    if (distant) {
        distant.rotation.y = time * 0.0015;
    }

    const glow = state.erpGlow;
    if (glow && glow.intensity > 0.1) {
        glow.intensity = 0.5 + 0.3 * Math.sin(time * 0.8 + 0.7);
    }
}

function checkWebGL() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return false;
        return true;
    } catch (_) {
        return false;
    }
}

if (!checkWebGL()) {
    document.getElementById('webgl-fallback').classList.add('visible');
} else {
    init();
}