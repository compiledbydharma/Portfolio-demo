import * as THREE from 'three';

let cameraObj = null;
let target = new THREE.Vector3(0, 0.6, 0);
let views = {};
let isTransitioning = false;
let progress = 0;
let startPos = new THREE.Vector3();
let startTarget = new THREE.Vector3();
let endPos = new THREE.Vector3();
let endTarget = new THREE.Vector3();
let currentView = 'core';
let transitionDuration = 1.0;
let prefersReducedMotion = false;

// ── Look state ──────────────────────────────────────────────────
let yaw = 0;          // radians, horizontal
let pitch = 0;        // radians, vertical
const pitchMin = -0.8; // ~ -45°
const pitchMax = 0.8;  // ~ +45°
const lookDistance = 10; // distance from camera to look-at point

// Detect reduced motion
if (window.matchMedia) {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initCamera(camera) {
    cameraObj = camera;
    cameraObj.position.set(0, 1.8, 6.5);
    // Initial direction: from position to target (0, 0.6, 0)
    const dir = new THREE.Vector3(0, 0.6, 0).sub(cameraObj.position).normalize();
    // Compute initial yaw/pitch from dir
    yaw = Math.atan2(dir.x, dir.z);
    pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    updateLookTarget();

    window.__camera = cameraObj;
    return { camera: cameraObj, cameraTarget: target, setViewTargets: setViewTargets };
}

function updateLookTarget() {
    const dir = new THREE.Vector3(0, 0, -1);
    // Apply yaw (rotate around Y)
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    dir.applyQuaternion(yawQuat);
    // Apply pitch (rotate around local X)
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    dir.applyQuaternion(pitchQuat);
    dir.normalize().multiplyScalar(lookDistance);
    target.copy(cameraObj.position).add(dir);
}

export function look(deltaX, deltaY) {
    if (isTransitioning) return;
    // Sensitivity
    const sensitivity = 0.005;
    yaw -= deltaX * sensitivity;
    pitch -= deltaY * sensitivity;
    pitch = Math.max(pitchMin, Math.min(pitchMax, pitch));
    updateLookTarget();
}

export function setViewTargets(viewData) {
    views = viewData;
}

export function navigateTo(viewName) {
    if (isTransitioning) return;
    if (!views[viewName]) return;

    const view = views[viewName];
    if (viewName === currentView && viewName === 'erp') {
        // Toggle deep info – we'll handle via a global callback
        if (typeof window.__toggleDeepInfo === 'function') {
            window.__toggleDeepInfo();
        }
        return;
    }

    // Store current look direction before transition? We'll keep it.
    startPos.copy(cameraObj.position);
    startTarget.copy(target);
    endPos.copy(view.position);
    endTarget.copy(view.target);

    isTransitioning = true;
    progress = 0;
    currentView = viewName;
    transitionDuration = prefersReducedMotion ? 0.3 : 1.0;

    if (typeof window.__onViewChange === 'function') {
        window.__onViewChange(viewName);
    }
}

export function updateCamera(delta) {
    if (!isTransitioning) return;

    progress += delta / transitionDuration;
    if (progress >= 1) {
        progress = 1;
        isTransitioning = false;
        // After transition, align yaw/pitch to the new target direction
        const dir = target.clone().sub(cameraObj.position).normalize();
        yaw = Math.atan2(dir.x, dir.z);
        pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    }
    const t = easeInOutCubic(progress);

    cameraObj.position.lerpVectors(startPos, endPos, t);
    target.lerpVectors(startTarget, endTarget, t);
    cameraObj.lookAt(target);

    // Store state for main loop
    window.__cameraState = { isTransitioning, currentView };
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── Expose ──────────────────────────────────────────────────────
window.__updateCamera = updateCamera;
window.__cameraState = { isTransitioning: false, currentView: 'core' };

export function getCamera() { return cameraObj; }
export function getCameraTarget() { return target; }
export function isCameraTransitioning() { return isTransitioning; }