import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export function initScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.018);

    const container = document.getElementById('canvas-container');

    // ── WebGLRenderer ──────────────────────────────────────────
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = false;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
    } catch (error) {
        // WebGL creation failed → throw to trigger fallback
        throw new Error('WebGLRenderer failed: ' + error.message);
    }

    container.appendChild(renderer.domElement);

    // ── CSS2DRenderer ──────────────────────────────────────────
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRenderer.domElement.style.userSelect = 'none';
    container.appendChild(labelRenderer.domElement);

    // ── Resize ─────────────────────────────────────────────────
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        labelRenderer.setSize(w, h);
        const camera = window.__camera;
        if (camera) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
    });

    return { scene, renderer, labelRenderer };
}
