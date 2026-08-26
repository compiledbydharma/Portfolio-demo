import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { projectData } from './data.js';

// ── Module-scoped variables to be exported ──────────────────────
let coreHitbox, erpHitbox;

export function buildWorld(scene) {
    const coreGroup = new THREE.Group();
    const erpGroup = new THREE.Group();
    const deepInfoGroup = new THREE.Group();
    let erpGlow, loopRing, loopRing2, pulseMesh, particles, distantGroup;

    // ── Lighting ──────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x111118, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    keyLight.position.set(8, 12, 6);
    keyLight.lookAt(0, 0, 0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.5);
    rimLight.position.set(-6, 2, 10);
    scene.add(rimLight);

    const coreGlow = new THREE.PointLight(0xffeedd, 0.6, 12);
    coreGlow.position.set(0, 1.2, 0);
    scene.add(coreGlow);

    // ── NOTHINGNESS particles ─────────────────────────────────────
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        pos[i*3] = (Math.random() - 0.5) * 90;
        pos[i*3+1] = (Math.random() - 0.5) * 50 + 2;
        pos[i*3+2] = (Math.random() - 0.5) * 90 - 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0x887a6a,
        size: 0.15,
        transparent: true,
        opacity: 0.15,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Distant structures ────────────────────────────────────────
    distantGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
        const geo = new THREE.BoxGeometry(
            0.3 + Math.random()*0.8,
            0.5 + Math.random()*1.5,
            0.3 + Math.random()*0.8
        );
        const mat = new THREE.MeshStandardMaterial({
            color: 0x1a1816,
            roughness: 0.9,
            metalness: 0.1,
            transparent: true,
            opacity: 0.08 + Math.random()*0.06,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random()-0.5)*80,
            (Math.random()-0.5)*20 + 1,
            (Math.random()-0.5)*80 - 40
        );
        mesh.rotation.set(Math.random()*0.5, Math.random()*0.5, Math.random()*0.2);
        distantGroup.add(mesh);
    }
    scene.add(distantGroup);

    // ── THE CORE ──────────────────────────────────────────────────
    const platformGeo = new THREE.CylinderGeometry(2.2, 2.6, 0.4, 64);
    const platformMat = new THREE.MeshStandardMaterial({
        color: 0x22201c,
        roughness: 0.85,
        metalness: 0.05,
        emissive: 0x0a0908,
        emissiveIntensity: 0.1,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.2;
    coreGroup.add(platform);

    const ringGeo = new THREE.TorusGeometry(2.0, 0.04, 24, 64);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0x5a4a3a,
        emissive: 0x3a2a1a,
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.3,
        roughness: 0.6,
        metalness: 0.1,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.15;
    coreGroup.add(ring);

    // Pulse
    const pulseGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const pulseMat = new THREE.MeshStandardMaterial({
        color: 0xccbbaa,
        emissive: 0x887a6a,
        emissiveIntensity: 0.3,
        roughness: 0.4,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
    });
    pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.position.set(0, 0.25, 1.6);
    coreGroup.add(pulseMesh);

    // Core text (CSS2D)
    function createText(text, className = '', fontSize = '18px', color = '#e8e6e0') {
        const div = document.createElement('div');
        div.textContent = text;
        div.style.color = color;
        div.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
        div.style.fontSize = fontSize;
        div.style.fontWeight = '300';
        div.style.letterSpacing = '0.04em';
        div.style.textShadow = '0 0 30px rgba(0,0,0,0.8)';
        div.style.background = 'rgba(0,0,0,0.2)';
        div.style.padding = '6px 14px';
        div.style.borderRadius = '4px';
        div.style.backdropFilter = 'blur(4px)';
        return new CSS2DObject(div);
    }
    const mainText = createText('I make things.', 'core-text-main', '26px', '#f0ede8');
    mainText.position.set(0, 0.6, 0);
    coreGroup.add(mainText);
    const subText = createText('Prayag — building & writing since 2020', 'core-text-sub', '13px', 'rgba(200,195,185,0.55)');
    subText.position.set(0, 0.15, 0);
    coreGroup.add(subText);

    // Beacon (invisible cylinder for click target)
    const beaconGeo = new THREE.CylinderGeometry(0.02, 0.02, 12, 4);
    const beaconMat = new THREE.MeshBasicMaterial({
        color: 0x887a6a,
        transparent: true,
        opacity: 0.04,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 6;
    coreGroup.add(beacon);

    scene.add(coreGroup);

    // ── SCHOOL ERP ────────────────────────────────────────────────
    erpGroup.position.set(14, 0, 0);

    // Main hub
    const hubGeo = new THREE.BoxGeometry(1.8, 1.4, 1.4);
    const hubMat = new THREE.MeshStandardMaterial({
        color: 0x2a2824,
        roughness: 0.75,
        metalness: 0.2,
        emissive: 0x0a0908,
        emissiveIntensity: 0.1,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(0, 0.7, 0);
    erpGroup.add(hub);

    // Components
    const compPositions = [
        { x: -1.8, z: -0.6, w: 0.6, h: 0.5, d: 0.6 },
        { x: 1.8, z: -0.6, w: 0.6, h: 0.5, d: 0.6 },
        { x: -1.2, z: 1.6, w: 0.5, h: 0.4, d: 0.5 },
        { x: 1.2, z: 1.6, w: 0.5, h: 0.4, d: 0.5 },
        { x: 0, z: -1.8, w: 0.7, h: 0.6, d: 0.7 },
    ];
    const compMat = new THREE.MeshStandardMaterial({
        color: 0x3a3530,
        roughness: 0.7,
        metalness: 0.15,
        emissive: 0x0a0806,
        emissiveIntensity: 0.05,
    });
    compPositions.forEach(p => {
        const geo = new THREE.BoxGeometry(p.w, p.h, p.d);
        const mesh = new THREE.Mesh(geo, compMat);
        mesh.position.set(p.x, 0.4 + p.h/2, p.z);
        erpGroup.add(mesh);
    });

    // Scheduling rings
    const ringGeo2 = new THREE.TorusGeometry(1.0, 0.06, 12, 48);
    const ringMat2 = new THREE.MeshStandardMaterial({
        color: 0x5a4a3a,
        roughness: 0.5,
        metalness: 0.3,
        emissive: 0x3a2a1a,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.6,
    });
    loopRing = new THREE.Mesh(ringGeo2, ringMat2);
    loopRing.position.set(0, 1.5, 0);
    loopRing.rotation.x = Math.PI / 2.8;
    loopRing.rotation.z = 0.3;
    erpGroup.add(loopRing);

    const ringGeo3 = new THREE.TorusGeometry(1.3, 0.04, 10, 48);
    const ringMat3 = new THREE.MeshStandardMaterial({
        color: 0x4a3a2a,
        roughness: 0.6,
        metalness: 0.2,
        emissive: 0x2a1a0a,
        emissiveIntensity: 0.05,
        transparent: true,
        opacity: 0.3,
    });
    loopRing2 = new THREE.Mesh(ringGeo3, ringMat3);
    loopRing2.position.set(0, 1.5, 0);
    loopRing2.rotation.x = Math.PI / 2.2;
    loopRing2.rotation.z = -0.2;
    erpGroup.add(loopRing2);

    // Attendance panel
    const panelGeo = new THREE.BoxGeometry(1.4, 0.7, 0.08);
    const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1a1816,
        roughness: 0.3,
        metalness: 0.4,
        emissive: 0x0a0806,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.85,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 1.1, 0.76);
    erpGroup.add(panel);

    const panelTextDiv = document.createElement('div');
    panelTextDiv.textContent = 'ATTENDANCE: 11 SECONDS';
    panelTextDiv.style.color = 'rgba(200,195,185,0.7)';
    panelTextDiv.style.fontFamily = "'Inter', monospace";
    panelTextDiv.style.fontSize = '11px';
    panelTextDiv.style.fontWeight = '300';
    panelTextDiv.style.letterSpacing = '0.15em';
    panelTextDiv.style.background = 'rgba(0,0,0,0.5)';
    panelTextDiv.style.padding = '4px 10px';
    panelTextDiv.style.borderRadius = '2px';
    panelTextDiv.style.border = '1px solid rgba(200,195,185,0.08)';
    panelTextDiv.style.textShadow = '0 0 12px rgba(0,0,0,0.9)';
    const panelText = new CSS2DObject(panelTextDiv);
    panelText.position.set(0, 1.12, 0.82);
    erpGroup.add(panelText);

    // Third time plate
    const plateGeo = new THREE.BoxGeometry(0.8, 0.25, 0.04);
    const plateMat = new THREE.MeshStandardMaterial({
        color: 0x2a2218,
        roughness: 0.7,
        metalness: 0.3,
        emissive: 0x1a120a,
        emissiveIntensity: 0.05,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(-1.1, 0.25, 0.76);
    erpGroup.add(plate);

    const plateTextDiv = document.createElement('div');
    plateTextDiv.textContent = 'THIRD TIME.';
    plateTextDiv.style.color = 'rgba(200,180,160,0.25)';
    plateTextDiv.style.fontFamily = "'Inter', monospace";
    plateTextDiv.style.fontSize = '9px';
    plateTextDiv.style.fontWeight = '300';
    plateTextDiv.style.letterSpacing = '0.1em';
    plateTextDiv.style.background = 'rgba(0,0,0,0.2)';
    plateTextDiv.style.padding = '2px 8px';
    plateTextDiv.style.borderRadius = '2px';
    const plateText = new CSS2DObject(plateTextDiv);
    plateText.position.set(-1.1, 0.27, 0.82);
    erpGroup.add(plateText);

    // Conflict dot
    const conflictGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const conflictMat = new THREE.MeshStandardMaterial({
        color: 0x553a3a,
        emissive: 0x441a1a,
        emissiveIntensity: 0.2,
        roughness: 0.6,
        metalness: 0.1,
    });
    const conflictDot = new THREE.Mesh(conflictGeo, conflictMat);
    conflictDot.position.set(0.6, 0.6, 0.76);
    erpGroup.add(conflictDot);

    // Supports
    for (let i = -1; i <= 1; i += 2) {
        const supportGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.6, 6);
        const supportMat = new THREE.MeshStandardMaterial({
            color: 0x1a1816,
            roughness: 0.8,
            metalness: 0.1,
        });
        const support = new THREE.Mesh(supportGeo, supportMat);
        support.position.set(i * 0.6, -0.2, 0.6);
        erpGroup.add(support);
    }

    // Connection lines
    const lineMat = new THREE.MeshStandardMaterial({
        color: 0x3a322a,
        roughness: 0.7,
        metalness: 0.2,
        transparent: true,
        opacity: 0.3,
    });
    const connections = [
        { from: [-0.8, 0.6, 0.4], to: [0.8, 0.6, 0.4] },
        { from: [-0.4, 1.0, -0.6], to: [0.4, 1.0, -0.6] },
        { from: [0, 0.4, 0.8], to: [0, 0.4, -0.6] },
    ];
    connections.forEach(c => {
        const dx = c.to[0] - c.from[0];
        const dy = c.to[1] - c.from[1];
        const dz = c.to[2] - c.from[2];
        const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const mid = [(c.from[0]+c.to[0])/2, (c.from[1]+c.to[1])/2, (c.from[2]+c.to[2])/2];
        const lineGeo = new THREE.CylinderGeometry(0.02, 0.02, len, 4);
        const lineMesh = new THREE.Mesh(lineGeo, lineMat);
        lineMesh.position.set(mid[0], mid[1], mid[2]);
        lineMesh.lookAt(new THREE.Vector3(c.to[0], c.to[1], c.to[2]));
        lineMesh.rotateX(Math.PI / 2);
        erpGroup.add(lineMesh);
    });

    scene.add(erpGroup);

    // ERP glow
    erpGlow = new THREE.PointLight(0xffaa55, 0, 4);
    erpGlow.position.copy(erpGroup.position);
    erpGlow.position.y += 1.2;
    scene.add(erpGlow);

    // Deep info panel (hidden)
    deepInfoGroup.position.copy(erpGroup.position);
    deepInfoGroup.position.y += 1.8;
    deepInfoGroup.position.z += 1.2;
    deepInfoGroup.visible = false;

    const infoBg = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 1.8),
        new THREE.MeshBasicMaterial({
            color: 0x0a0908,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
        })
    );
    deepInfoGroup.add(infoBg);

    const infoTextDiv = document.createElement('div');
    infoTextDiv.innerHTML = `
        <div style="color:rgba(200,195,185,0.7);font-size:11px;font-weight:300;letter-spacing:0.05em;line-height:1.8;font-family:'Inter',monospace;text-align:left;padding:16px 20px;">
            <span style="color:rgba(200,195,185,0.3);font-size:9px;">LOGIC FLOW</span><br>
            Teacher availability<br>
            → subject load<br>
            → conflict check<br>
            → suggested slot<br>
            → loop if conflict<br><br>
            <span style="color:rgba(200,180,160,0.3);font-size:9px;">— THIRD TIME —</span>
        </div>
    `;
    infoTextDiv.style.background = 'rgba(0,0,0,0.3)';
    infoTextDiv.style.borderRadius = '4px';
    infoTextDiv.style.border = '1px solid rgba(200,195,185,0.06)';
    const infoTextObj = new CSS2DObject(infoTextDiv);
    infoTextObj.position.set(0, 0, 0.01);
    deepInfoGroup.add(infoTextObj);
    scene.add(deepInfoGroup);

    // ── Environmental path ──────────────────────────────────────
    const pathMat = new THREE.MeshStandardMaterial({
        color: 0x1a1816,
        roughness: 0.9,
        metalness: 0.05,
        transparent: true,
        opacity: 0.15,
    });
    for (let i = 0; i < 8; i++) {
        const t = (i + 1) / 9;
        const x = t * 14;
        const z = (Math.random() - 0.5) * 0.6;
        const size = 0.3 + Math.random() * 0.3;
        const stone = new THREE.Mesh(
            new THREE.BoxGeometry(size, 0.06, size * 0.6 + 0.2),
            pathMat
        );
        stone.position.set(x, -0.03, z);
        stone.rotation.y = (Math.random() - 0.5) * 0.4;
        scene.add(stone);
    }

    // ── Hitboxes (invisible) ──────────────────────────────────────
    coreHitbox = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 })
    );
    coreHitbox.position.set(0, 0.4, 0);
    coreHitbox.userData = { type: 'core' };
    scene.add(coreHitbox);

    erpHitbox = new THREE.Mesh(
        new THREE.BoxGeometry(4, 2.5, 2.5),
        new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 })
    );
    erpHitbox.position.copy(erpGroup.position);
    erpHitbox.position.y += 1.0;
    erpHitbox.userData = { type: 'erp' };
    scene.add(erpHitbox);

    return {
        coreHitbox,
        erpHitbox,
        erpGroup,
        deepInfoGroup,
        loopRing,
        loopRing2,
        erpGlow,
        pulseMesh,
        particles,
        distantGroup,
    };
}

// ── Named exports for direct use ────────────────────────────────
export { coreHitbox, erpHitbox };