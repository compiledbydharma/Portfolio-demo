import * as THREE from 'three';

let raycaster, pointer, camera;
let hoveredObject = null;
let interactables = [];
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let lastMoveX = 0, lastMoveY = 0;
let interactionCooldown = 0;
let domElement = null;
let hasMoved = false;
const DRAG_THRESHOLD = 6; // pixels

// Callbacks
let onNavigate = null;
let onLook = null;

export function initInteraction(domElem, cam, lookCallback) {
    domElement = domElem;
    camera = cam;
    onLook = lookCallback;
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    const isTouch = 'ontouchstart' in window;

    // ── Pointer events ──────────────────────────────────────────
    if (isTouch) {
        domElement.addEventListener('touchstart', onPointerDown, { passive: true });
        domElement.addEventListener('touchmove', onPointerMove, { passive: false });
        domElement.addEventListener('touchend', onPointerUp, { passive: true });
        domElement.addEventListener('touchcancel', onPointerCancel, { passive: true });
        // Prevent page scroll while touching canvas
        domElement.style.touchAction = 'none';
    } else {
        domElement.addEventListener('mousedown', onPointerDown);
        domElement.addEventListener('mousemove', onPointerMove);
        domElement.addEventListener('mouseup', onPointerUp);
        domElement.addEventListener('mouseleave', () => {
            if (hoveredObject) {
                resetAffordance(hoveredObject);
                hoveredObject = null;
                domElement.style.cursor = 'default';
            }
        });
        domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Keyboard ESC → return
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && onNavigate) {
            onNavigate('core');
        }
    });
}

function getPointerClient(event) {
    if (event.touches && event.touches.length > 0) {
        return { clientX: event.touches[0].clientX, clientY: event.touches[0].clientY };
    }
    if (event.changedTouches && event.changedTouches.length > 0) {
        return { clientX: event.changedTouches[0].clientX, clientY: event.changedTouches[0].clientY };
    }
    return { clientX: event.clientX, clientY: event.clientY };
}

function onPointerDown(e) {
    const pt = getPointerClient(e);
    dragStartX = pt.clientX;
    dragStartY = pt.clientY;
    lastMoveX = pt.clientX;
    lastMoveY = pt.clientY;
    isDragging = false;
    hasMoved = false;
    // For mouse: we need to track button state
    if (e.type === 'mousedown' && e.button !== 0) return;
}

function onPointerMove(e) {
    e.preventDefault?.();
    const pt = getPointerClient(e);
    const clientX = pt.clientX;
    const clientY = pt.clientY;

    // Update pointer for raycaster (hover)
    const rect = domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Check if dragging (pointer down)
    if (e.buttons === 1 || (e.touches && e.touches.length > 0)) {
        const dx = clientX - lastMoveX;
        const dy = clientY - lastMoveY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 1) {
            hasMoved = true;
            isDragging = true;
            // Look
            if (onLook) {
                onLook(-dx, -dy); // invert Y for natural feel
            }
        }
        lastMoveX = clientX;
        lastMoveY = clientY;
    }

    // Update hover (only if not dragging)
    if (!isDragging) {
        updateHover();
    } else {
        // Clear hover during drag
        if (hoveredObject) {
            resetAffordance(hoveredObject);
            hoveredObject = null;
            domElement.style.cursor = 'default';
        }
    }
}

function onPointerUp(e) {
    const pt = getPointerClient(e);
    const clientX = pt.clientX;
    const clientY = pt.clientY;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    // If movement was small → tap/click
    if (dist < DRAG_THRESHOLD && !hasMoved) {
        handleClick();
    }

    isDragging = false;
    hasMoved = false;
    // Reset cursor
    domElement.style.cursor = 'default';
}

function onPointerCancel(e) {
    isDragging = false;
    hasMoved = false;
    domElement.style.cursor = 'default';
}

function resetAffordance(obj) {
    if (obj.userData.type === 'erp') {
        if (typeof window.__resetErpAffordance === 'function') {
            window.__resetErpAffordance();
        }
    }
}

export function updateHover() {
    if (!camera) return;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactables);

    let found = null;
    if (intersects.length > 0) {
        found = intersects[0].object;
    }

    if (found !== hoveredObject) {
        if (hoveredObject) {
            resetAffordance(hoveredObject);
        }
        hoveredObject = found;
        if (hoveredObject) {
            if (hoveredObject.userData.type === 'erp') {
                if (typeof window.__triggerErpAffordance === 'function') {
                    window.__triggerErpAffordance(true);
                }
            }
            domElement.style.cursor = 'pointer';
        } else {
            domElement.style.cursor = 'default';
        }
    }
}

export function handleClick() {
    if (interactionCooldown > 0) return;
    if (!camera) return;

    // Use the stored pointer position from last move
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactables);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.type === 'core') {
            if (onNavigate) onNavigate('core');
        } else if (obj.userData.type === 'erp') {
            if (onNavigate) onNavigate('erp');
        }
    }
    interactionCooldown = 0.3;
}

export function setInteractables(list) {
    interactables = list;
}

export function setNavigateCallback(cb) {
    onNavigate = cb;
}

export function updateInteractionCooldown(delta) {
    if (interactionCooldown > 0) interactionCooldown -= delta;
}

export function getHoveredObject() { return hoveredObject; }