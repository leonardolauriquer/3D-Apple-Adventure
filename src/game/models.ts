import * as THREE from 'three';

export const createApple = () => {
    const appleGroup = new THREE.Group();
    const appleBodyMat = new THREE.MeshStandardMaterial({ color: 0xcf1020, roughness: 0.5 });
    const appleBodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const appleBody = new THREE.Mesh(appleBodyGeo, appleBodyMat);
    appleBody.castShadow = true;
    appleGroup.add(appleBody);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const stemGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.5;
    appleGroup.add(stem);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide });
    const leafGeo = new THREE.PlaneGeometry(0.3, 0.2);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0.1, 0.55, 0);
    leaf.rotation.x = Math.PI / 4;
    appleGroup.add(leaf);
    return appleGroup;
}

export const createCheckpointFlag = () => {
    const flagGroup = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1;
    flagGroup.add(pole);
    const flagClothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const flagClothGeo = new THREE.PlaneGeometry(1.5, 1);
    const flagCloth = new THREE.Mesh(flagClothGeo, flagClothMat);
    flagCloth.name = 'flagCloth';
    flagCloth.position.set(0.85, 2.5, 0);
    flagGroup.add(flagCloth);
    const checkShape = new THREE.Shape();
    checkShape.moveTo(-0.4, 0); checkShape.lineTo(-0.1, -0.3); checkShape.lineTo(0.4, 0.2);
    checkShape.lineTo(0.3, 0.3); checkShape.lineTo(-0.1, -0.1); checkShape.lineTo(-0.5, 0.1);
    const checkGeo = new THREE.ShapeGeometry(checkShape);
    const checkMat = new THREE.MeshBasicMaterial({ color: 0x16a34a, side: THREE.DoubleSide });
    const checkMesh = new THREE.Mesh(checkGeo, checkMat);
    checkMesh.name = 'checkmark';
    checkMesh.position.set(0.85, 2.5, 0.01);
    checkMesh.visible = false;
    flagGroup.add(checkMesh);
    return flagGroup;
}

export const createSkull = () => {
    const skullGroup = new THREE.Group();
    const skullMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.6 });
    const craniumGeo = new THREE.SphereGeometry(0.6, 16, 16);
    craniumGeo.scale(1, 1.1, 1);
    const cranium = new THREE.Mesh(craniumGeo, skullMaterial);
    cranium.castShadow = true;
    skullGroup.add(cranium);
    const jawGeo = new THREE.BoxGeometry(0.8, 0.4, 0.7);
    const jaw = new THREE.Mesh(jawGeo, skullMaterial);
    jaw.position.y = -0.4;
    jaw.castShadow = true;
    skullGroup.add(jaw);
    const eyeSocketMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const eyeSocketGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const leftEye = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
    leftEye.position.set(-0.25, 0.1, 0.4);
    skullGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
    rightEye.position.set(0.25, 0.1, 0.4);
    skullGroup.add(rightEye);
    const teethGeo = new THREE.BoxGeometry(0.7, 0.15, 0.1);
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const teeth = new THREE.Mesh(teethGeo, teethMat);
    teeth.position.set(0, -0.25, 0.35);
    skullGroup.add(teeth);
    skullGroup.scale.set(0.8, 0.8, 0.8);
    return skullGroup;
}

export const createGhost = () => {
    const ghostGroup = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff, transparent: true, opacity: 0.8,
        emissive: 0xcccccc, emissiveIntensity: 0.5
    });
    const bodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
    bodyGeo.scale(1, 1.5, 1);
    const body = new THREE.Mesh(bodyGeo, material);
    body.castShadow = true;
    ghostGroup.add(body);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 0.2, 0.4);
    ghostGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 0.2, 0.4);
    ghostGroup.add(rightEye);
    ghostGroup.scale.set(1.2, 1.2, 1.2);
    return ghostGroup;
};

export const createHeart = () => {
    const shape = new THREE.Shape();
    const x = -0.5, y = -0.5;
    shape.moveTo(x + 0.5, y + 0.5); shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    shape.bezierCurveTo(x + 1.3, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);
    const extrudeSettings = { steps: 2, depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelOffset: 0, bevelSegments: 5 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x660000 });
    const heart = new THREE.Mesh(geometry, material);
    heart.scale.set(0.5, 0.5, 0.5);
    heart.rotation.z = Math.PI;
    return heart;
}

export const createStomper = (textureLoader: THREE.TextureLoader) => {
    const stomperGeo = new THREE.BoxGeometry(2, 2, 2);
    const stomperMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        map: textureLoader.load('https://i.imgur.com/yOHKUes.jpeg')
    });
    const stomper = new THREE.Mesh(stomperGeo, stomperMat);
    stomper.castShadow = true;
    return stomper;
}

export const createLaser = () => {
    const laserGroup = new THREE.Group();
    const emitterGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const emitterMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    laserGroup.add(emitter);
    const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
    const beamMat = new THREE.MeshStandardMaterial({
        color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2, transparent: true, opacity: 0.7
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.name = "laserBeam";
    beam.rotation.x = Math.PI / 2;
    beam.position.z = 5;
    laserGroup.add(beam);
    return laserGroup;
}

export const createSpikeBlock = () => {
    const group = new THREE.Group();
    const coreGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.3 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);
    const spikeGeo = new THREE.ConeGeometry(0.3, 0.6, 8);
    const spikeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    const directions = [
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
    ];
    directions.forEach(dir => {
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        spike.position.copy(dir).multiplyScalar(0.75);
        spike.lookAt(dir.clone().multiplyScalar(2));
        group.add(spike);
    });
    return group;
}

export const createRamBot = () => {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x71717a }); // zinc-500
    const bodyGeo = new THREE.CylinderGeometry(0.6, 0.8, 1.5, 8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    const headGeo = new THREE.BoxGeometry(1, 1, 1.2);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xef4444 }); // red-500
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.z = 0.8;
    group.add(head);
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x27272a }); // zinc-800
    const leftWheel = new THREE.Mesh(wheelGeo, wheelMat);
    leftWheel.rotation.z = Math.PI / 2;
    leftWheel.position.set(-0.7, -0.4, 0);
    group.add(leftWheel);
    const rightWheel = leftWheel.clone();
    rightWheel.position.x = 0.7;
    group.add(rightWheel);
    const lightGeo = new THREE.SphereGeometry(0.15);
    const lightMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 2 }); // green-400
    const statusLight = new THREE.Mesh(lightGeo, lightMat);
    statusLight.name = 'statusLight';
    statusLight.position.set(0, 0.6, -0.5);
    group.add(statusLight);
    group.scale.set(0.9, 0.9, 0.9);
    return group;
}

export const createSentinelEye = () => {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x52525b }); // stone-600
    const bodyGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 1 }); // amber-400
    const eyeGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.z = 0.6;
    group.add(eye);
    const coneGeo = new THREE.ConeGeometry(5, 15, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const viewCone = new THREE.Mesh(coneGeo, coneMat);
    viewCone.name = "viewCone";
    viewCone.position.z = 7.5;
    viewCone.rotation.x = Math.PI / 2;
    group.add(viewCone);
    const finGeo = new THREE.BoxGeometry(0.2, 0.8, 1.2);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46 }); // zinc-700
    const fin1 = new THREE.Mesh(finGeo, finMat);
    fin1.position.set(0.8, 0, 0);
    fin1.rotation.y = Math.PI / 6;
    group.add(fin1);
    const fin2 = fin1.clone();
    fin2.position.x = -0.8;
    fin2.rotation.y = -Math.PI / 6;
    group.add(fin2);
    const fin3 = new THREE.Mesh(finGeo, finMat);
    fin3.rotation.z = Math.PI / 2;
    fin3.position.set(0, 0.8, 0);
    fin3.rotation.x = -Math.PI / 6;
    group.add(fin3);
    const fin4 = fin3.clone();
    fin4.position.y = -0.8;
    fin4.rotation.x = Math.PI / 6;
    group.add(fin4);
    return group;
}

export const createProjectile = () => {
    const projGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const projMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 2 });
    return new THREE.Mesh(projGeo, projMat);
}

export const createBoss = () => {
    const group = new THREE.Group();

    // Main skull body
    const skullMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 });
    const craniumGeo = new THREE.SphereGeometry(2.5, 32, 32);
    craniumGeo.scale(1, 1.2, 1);
    const cranium = new THREE.Mesh(craniumGeo, skullMaterial);
    cranium.castShadow = true;
    group.add(cranium);

    // Large central eye
    const eyeMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 2
    });
    const eyeGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.name = 'bossEye';
    eye.position.z = 2;
    group.add(eye);

    // Crown
    const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.4 });
    const crownBaseGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.5, 16);
    const crownBase = new THREE.Mesh(crownBaseGeo, crownMat);
    crownBase.position.y = 2.5;
    group.add(crownBase);

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const spikeGeo = new THREE.ConeGeometry(0.3, 1, 8);
        const spike = new THREE.Mesh(spikeGeo, crownMat);
        spike.position.set(Math.cos(angle) * 2.7, 3.2, Math.sin(angle) * 2.7);
        group.add(spike);
    }
    
    group.scale.set(1.5, 1.5, 1.5);
    return group;
}
