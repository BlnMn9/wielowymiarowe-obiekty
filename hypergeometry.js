function projectND() {
    const projectedVertices = [];
    const isSpecial4D = (currentObject === 8 || currentObject === 9 || currentObject === 10 || currentObject === 13);

    verticesND.forEach(p => {
        let x = p.x, y = p.y, z = p.z, w = p.w, v = p.v, u = p.u, t = p.t;

        // 1. Rotacje w wyższych wymiarach
        if (currentObject === 7) {
            let cosXT = Math.cos(angleXT), sinXT = Math.sin(angleXT);
            let xTmp = x * cosXT - t * sinXT; t = x * sinXT + t * cosXT; x = xTmp;
        }
        if (currentObject === 6) {
            let cosZU = Math.cos(angleZU), sinZU = Math.sin(angleZU);
            let zTmp = z * cosZU - u * sinZU; u = z * sinZU + u * cosZU; z = zTmp;
        }
        if (currentObject === 5 || currentObject === 6 || currentObject === 7 || currentObject === 11 || currentObject === 12) {
            let cosXV = Math.cos(angleXV), sinXV = Math.sin(angleXV);
            let xTmp = x * cosXV - v * sinXV; v = x * sinXV + v * cosXV; x = xTmp;
        }

        // 2. Rotacje w przestrzeni 4D (płaszczyzny XW i YW)
        let factorXW = 1.0;
        let factorYW = (currentObject === 1) ? 0.0 : 0.6; 

        let cosXW = Math.cos(angleXW * factorXW), sinXW = Math.sin(angleXW * factorXW);
        let x1 = x * cosXW - w * sinXW; w = x * sinXW + w * cosXW; x = x1;

        let cosYW = Math.cos(angleYW * factorYW), sinYW = Math.sin(angleYW * factorYW);
        let y1 = y * cosYW - w * sinYW; w = y * sinYW + w * cosYW; y = y1;

        // 3. Kaskadowe rzutowanie perspektywiczne (ND -> ... -> 5D -> 4D -> 3D)
        const dist = 2.0;
        if (currentObject === 7) { const f7D = 1 / (dist - t); x *= f7D; y *= f7D; z *= f7D; w *= f7D; v *= f7D; u *= f7D; }
        if (currentObject === 6) { const f6D = 1 / (dist - u); x *= f6D; y *= f6D; z *= f6D; w *= f6D; v *= f6D; }
        if (currentObject === 5 || currentObject === 6 || currentObject === 7 || currentObject === 11 || currentObject === 12) { 
            const f5D = 1 / (dist - v); x *= f5D; y *= f5D; z *= f5D; w *= f5D; 
        }

        // Rzutowanie z 4D do 3D przy użyciu poprawni przeliczonego ramienia 'w'
        const distance4D = isSpecial4D ? 2.4 : dist;
        const f4D = 1 / (distance4D - w);

        // Skalowanie końcowe dla ekranu 3D (Z POPRAWKĄ DLA OBIEKTU 13 NA TELEFONACH)
        let scale = (currentObject === 1) ? 1.8 : 2.0;
        if (currentObject === 2) scale = 1.3;
        else if (currentObject === 5) scale = 1.7;
        else if (currentObject === 7) scale = 3.0;
        else if (currentObject === 6) scale = 2.6;
        else if (currentObject === 11) scale = 2.4; 
        else if (currentObject === 12) scale = 2.3; 
        else if (currentObject === 9 || currentObject === 10) scale = 2.8;
        else if (currentObject === 13) {
            scale = window.innerWidth < 600 ? 1.7 : 2.4;
        }

        projectedVertices.push(new THREE.Vector3(x * f4D * scale, y * f4D * scale, z * f4D * scale));
    });

    for(let i = 0; i < spheres.length; i++) {
        if(projectedVertices[i]) {
            spheres[i].position.copy(projectedVertices[i]);
            const worldPos = projectedVertices[i].clone().applyEuler(vertexGroup.rotation);
            let depthFactor = Math.max(0, Math.min(1, (worldPos.z + 1.4) / 2.8)); 
            spheres[i].material.color.setRGB(0.15 + depthFactor * 0.85, 0.55 + depthFactor * 0.45, 0.75 + depthFactor * 0.25);
        }
    }

    edges.forEach((edge, index) => {
        const geo = lineGeometries[index];
        if(geo && projectedVertices[edge[0]] && projectedVertices[edge[1]]) {
            const posAttr = geo.attributes.position; const colAttr = geo.attributes.color;
            const pA = projectedVertices[edge[0]]; const pB = projectedVertices[edge[1]];
            posAttr.setXYZ(0, pA.x, pA.y, pA.z); posAttr.setXYZ(1, pB.x, pB.y, pB.z); posAttr.needsUpdate = true;
            
            const wA = pA.clone().applyEuler(edgeGroup.rotation); const wB = pB.clone().applyEuler(edgeGroup.rotation);
            let depthA = Math.max(0, Math.min(1, (wA.z + 1.4) / 2.8)) * 0.5 + 0.5;
            let depthB = Math.max(0, Math.min(1, (wB.z + 1.4) / 2.8)) * 0.5 + 0.5;
            colAttr.setXYZ(0, 0.0, depthA * 1.0, depthA * 0.85); colAttr.setXYZ(1, 0.0, depthB * 1.0, depthB * 0.85);
            colAttr.needsUpdate = true;
        }
    });
}

// --- INICJALIZACJA SILNIKA I SCENY ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

scene.fog = null;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ffcc, 2.0, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

let vertexGroup = new THREE.Group();
let edgeGroup = new THREE.Group();
scene.add(vertexGroup);
scene.add(edgeGroup);

vertexGroup.rotation.set(0.38, 0.62, 0);
edgeGroup.rotation.set(0.38, 0.62, 0);

// --- ZMIENNE STRUKTURALNE ---
let verticesND = []; 
let edges = [];
let spheres = [];
let lineGeometries = [];

let angleXW = 0, angleYW = 0, angleXV = 0, angleZU = 0, angleXT = 0; 
let currentObject = 1; 

let sphereGeo = new THREE.SphereGeometry(0.04, 8, 8);

const sphereMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.2,
    metalness: 0.8
});

const lineMat = new THREE.LineBasicMaterial({ 
    vertexColors: true,
    transparent: true, 
    opacity: 0.85 
});

// --- FUNKCJE CZYSZCZENIA I BUDOWANIA ---
function clearGeometry(size) {
    while(vertexGroup.children.length > 0){ vertexGroup.remove(vertexGroup.children[0]); }
    while(edgeGroup.children.length > 0){ edgeGroup.remove(edgeGroup.children[0]); }
    verticesND = []; edges = []; spheres = []; lineGeometries = [];
    sphereGeo = new THREE.SphereGeometry(size, 8, 8);
    
    if (currentObject === 1) {
        vertexGroup.rotation.set(0.38, 0.62, 0);
        edgeGroup.rotation.set(0.38, 0.62, 0);
    } else {
        vertexGroup.rotation.set(0.5, 0.5, 0);
        edgeGroup.rotation.set(0.5, 0.5, 0);
    }
}

function buildThreeObjects() {
    verticesND.forEach(() => {
        const mesh = new THREE.Mesh(sphereGeo, sphereMat.clone());
        vertexGroup.add(mesh);
        spheres.push(mesh);
    });
    edges.forEach(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(6); 
        const colors = new Float32Array(6);    
        
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const line = new THREE.Line(geo, lineMat);
        edgeGroup.add(line);
        lineGeometries.push(geo);
    });
}

// --- GENERATORY GEOMETRII (1 - 13) ---

function loadTesseract() {
    clearGeometry(0.04);
    for (let x of [-1, 1]) {
        for (let y of [-1, 1]) {
            for (let z of [-1, 1]) {
                for (let w of [-1, 1]) {
                    verticesND.push({x: x * 0.8, y: y * 0.8, z: z * 0.8, w: w * 0.8, v: 0, u: 0, t: 0});
                }
            }
        }
    }
    for (let i = 0; i < verticesND.length; i++) {
        for (let j = i + 1; j < verticesND.length; j++) {
            let diff = 0;
            if (verticesND[i].x !== verticesND[j].x) diff++;
            if (verticesND[i].y !== verticesND[j].y) diff++;
            if (verticesND[i].z !== verticesND[j].z) diff++;
            if (verticesND[i].w !== verticesND[j].w) diff++;
            if (diff === 1) edges.push([i, j]);
        }
    }
    buildThreeObjects();
}

function loadPentachor() {
    clearGeometry(0.05);
    const r = 0.9; 
    verticesND = [
        { x: r*1,  y: r*1,  z: r*1,  w: -0.45*r, v: 0, u: 0, t: 0 },
        { x: r*1,  y: -r*1, z: -r*1, w: -0.45*r, v: 0, u: 0, t: 0 },
        { x: -r*1, y: r*1,  z: -r*1, w: -0.45*r, v: 0, u: 0, t: 0 },
        { x: -r*1, y: -r*1, z: r*1,  w: -0.45*r, v: 0, u: 0, t: 0 },
        { x: 0,    y: 0,    z: 0,    w: 1.8*r,   v: 0, u: 0, t: 0 }
    ];
    for (let i = 0; i < verticesND.length; i++) {
        for (let j = i + 1; j < verticesND.length; j++) { edges.push([i, j]); }
    }
    buildThreeObjects();
}

function load24Cell() {
    clearGeometry(0.035);
    const baseVertices = [
        [1,0,0,0], [-1,0,0,0], [0,1,0,0], [0,-1,0,0],
        [0,0,1,0], [0,0,-1,0], [0,0,0,1], [0,0,0,-1]
    ];
    for (let x of [-0.5, 0.5]) {
        for (let y of [-0.5, 0.5]) {
            for (let z of [-0.5, 0.5]) {
                for (let w of [-0.5, 0.5]) { baseVertices.push([x, y, z, w]); }
            }
        }
    }
    baseVertices.forEach(v => {
        verticesND.push({ x: v[0] * 1.3, y: v[1] * 1.3, z: v[2] * 1.3, w: v[3] * 1.3, v: 0, u: 0, t: 0 });
    });
    for (let i = 0; i < verticesND.length; i++) {
        for (let j = i + 1; j < verticesND.length; j++) {
            let dx = baseVertices[i][0] - baseVertices[j][0];
            let dy = baseVertices[i][1] - baseVertices[j][1];
            let dz = baseVertices[i][2] - baseVertices[j][2];
            let dw = baseVertices[i][3] - baseVertices[j][3];
            if (Math.abs((dx*dx + dy*dy + dz*dz + dw*dw) - 1.0) < 0.01) { edges.push([i, j]); }
        }
    }
    buildThreeObjects();
}

function load16Cell() {
    clearGeometry(0.045);
    verticesND = [
        {x: 1.2, y: 0, z: 0, w: 0, v: 0, u: 0, t: 0}, {x: -1.2, y: 0, z: 0, w: 0, v: 0, u: 0, t: 0},
        {x: 0, y: 1.2, z: 0, w: 0, v: 0, u: 0, t: 0}, {x: 0, y: -1.2, z: 0, w: 0, v: 0, u: 0, t: 0},
        {x: 0, y: 0, z: 1.2, w: 0, v: 0, u: 0, t: 0}, {x: 0, y: 0, z: -1.2, w: 0, v: 0, u: 0, t: 0},
        {x: 0, y: 0, z: 0, w: 1.2, v: 0, u: 0, t: 0}, {x: 0, y: 0, z: 0, w: -1.2, v: 0, u: 0, t: 0}
    ];
    for (let i = 0; i < verticesND.length; i++) {
        for (let j = i + 1; j < verticesND.length; j++) {
            if ((i===0 && j===1) || (i===2 && j===3) || (i===4 && j===5) || (i===6 && j===7)) continue;
            edges.push([i, j]);
        }
    }
    buildThreeObjects();
}

function load5DSimplex() {
    clearGeometry(0.05);
    const r = 1.1;
    verticesND = [
        { x: r,  y: 0,  z: 0,  w: 0,  v: -0.3*r, u: 0, t: 0 },
        { x: 0,  y: r,  z: 0,  w: 0,  v: -0.3*r, u: 0, t: 0 },
        { x: 0,  y: 0,  z: r,  w: 0,  v: -0.3*r, u: 0, t: 0 },
        { x: 0,  y: 0,  z: 0,  w: r,  v: -0.3*r, u: 0, t: 0 },
        { x: 0,  y: 0,  z: 0,  w: 0,  v: 1.2*r,  u: 0, t: 0 },
        { x: -0.4*r, y: -0.4*r, z: -0.4*r, w: -0.4*r, v: -0.3*r, u: 0, t: 0 }
    ];
    for (let i = 0; i < verticesND.length; i++) {
        for (let j = i + 1; j < verticesND.length; j++) { edges.push([i, j]); }
    }
    buildThreeObjects();
}

function loadHekterakt() {
    clearGeometry(0.025);
    for (let x of [-1, 1]) {
        for (let y of [-1, 1]) {
            for (let z of [-1, 1]) {
                for (let w of [-1, 1]) {
                    for (let v of [-1, 1]) {
                        for (let u of [-1, 1]) {
                            verticesND.push({ x: x * 0.65, y: y * 0.65, z: z * 0.65, w: w * 0.65, v: v * 0.65, u: u * 0.65, t: 0 });
                        }
                    }
                }
            }
        }
    }
    for (let i = 0; i < verticesND.length; i++) {
        for (let j = i + 1; j < verticesND.length; j++) {
            let diff = 0;
            if (verticesND[i].x !== verticesND[j].x) diff++;
            if (verticesND[i].y !== verticesND[j].y) diff++;
            if (verticesND[i].z !== verticesND[j].z) diff++;
            if (verticesND[i].w !== verticesND[j].w) diff++;
            if (verticesND[i].v !== verticesND[j].v) diff++;
            if (verticesND[i].u !== verticesND[j].u) diff++;
            if (diff === 1) edges.push([i, j]);
        }
    }
    buildThreeObjects();
}

function loadHepterakt() {
    clearGeometry(0.015); 
    for (let x of [-1, 1]) {
        for (let y of [-1, 1]) {
            for (let z of [-1, 1]) {
                for (let w of [-1, 1]) {
                    for (let v of [-1, 1]) {
                        for (let u of [-1, 1]) {
                            for (let t of [-1, 1]) {
                                verticesND.push({ x: x * 0.6, y: y * 0.6, z: z * 0.6, w: w * 0.6, v: v * 0.6, u: u * 0.6, t: t * 0.6 });
                            }
                        }
                    }
                }
            }
        }
    }
    for (let i = 0; i < verticesND.length; i++) {
        for (let j = i + 1; j < verticesND.length; j++) {
            let diff = 0;
            if (verticesND[i].x !== verticesND[j].x) diff++;
            if (verticesND[i].y !== verticesND[j].y) diff++;
            if (verticesND[i].z !== verticesND[j].z) diff++;
            if (verticesND[i].w !== verticesND[j].w) diff++;
            if (verticesND[i].v !== verticesND[j].v) diff++;
            if (verticesND[i].u !== verticesND[j].u) diff++;
            if (verticesND[i].t !== verticesND[j].t) diff++;
            if (diff === 1) edges.push([i, j]);
        }
    }
    buildThreeObjects();
}

function loadHyperPyramid() {
    clearGeometry(0.04);
    const phi = (1 + Math.sqrt(5)) / 2; const r = 0.7; const baseW = -0.4;
    for (let x of [-1, 1]) {
        for (let y of [-1, 1]) {
            for (let z of [-1, 1]) { verticesND.push({ x: x*r, y: y*r, z: z*r, w: baseW, v: 0, u: 0, t: 0 }); }
        }
    }
    const p = phi * r; const ip = (1/phi) * r;
    const pairs = [
        [0, ip, p], [0, -ip, p], [0, ip, -p], [0, -ip, -p],
        [ip, p, 0], [-ip, p, 0], [ip, -p, 0], [-ip, -p, 0],
        [p, 0, ip], [-p, 0, ip], [p, 0, -ip], [-p, 0, -ip]
    ];
    pairs.forEach(coord => { verticesND.push({ x: coord[0], y: coord[1], z: coord[2], w: baseW, v: 0, u: 0, t: 0 }); });

    const targetDistSq = Math.pow(2 * r / phi, 2);
    for (let i = 0; i < 20; i++) {
        for (let j = i + 1; j < 20; j++) {
            let dx = verticesND[i].x - verticesND[j].x; let dy = verticesND[i].y - verticesND[j].y; let dz = verticesND[i].z - verticesND[j].z;
            if (Math.abs((dx*dx + dy*dy + dz*dz) - targetDistSq) < 0.05) { edges.push([i, j]); }
        }
    }
    const apexIndex = verticesND.length;
    verticesND.push({ x: 0, y: 0, z: 0, w: 1.2, v: 0, u: 0, t: 0 });
    for (let i = 0; i < 20; i++) { edges.push([i, apexIndex]); }
    buildThreeObjects();
}

function loadKleinBottle() {
    clearGeometry(0.025);
    const stepsU = 36; 
    const stepsV = 36; 

    for (let i = 0; i < stepsU; i++) {
        let u = (i / stepsU) * Math.PI; 
        for (let j = 0; j < stepsV; j++) {
            let v = (j / stepsV) * Math.PI * 2; 

            let x, y, z, w;

            if (u < Math.PI / 2) {
                x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
                z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
            } else {
                x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
                z = -8 * Math.sin(u);
            }

            y = 2 * (1 - Math.cos(u) / 2) * Math.sin(v);
            w = Math.sin(2 * u) * Math.cos(v) * 1.5;

            const scaleFactor = 0.18; 
            
            verticesND.push({ 
                x: x * scaleFactor, 
                y: y * scaleFactor, 
                z: (z + 3.5) * scaleFactor, 
                w: w * scaleFactor, 
                v: 0, u: 0, t: 0 
            });
        }
    }

    for (let i = 0; i < stepsU; i++) {
        for (let j = 0; j < stepsV; j++) {
            let current = i * stepsV + j;
            let nextV = i * stepsV + ((j + 1) % stepsV);
            edges.push([current, nextV]);
            
            let nextU = ((i + 1) % stepsU) * stepsV + j;
            edges.push([current, nextU]);
        }
    }
    buildThreeObjects();
}

function loadSpherinder() {
    clearGeometry(0.025);
    const stepsSphere = 30; const stepsLength = 4;  
    for (let wIdx = 0; wIdx < stepsLength; wIdx++) {
        let w = -0.8 + (wIdx / (stepsLength - 1)) * 1.6;
        for (let i = 0; i < stepsSphere; i++) {
            let angle = (i / stepsSphere) * Math.PI * 2;
            let x = Math.cos(angle) * 0.8; let y = Math.sin(angle) * 0.8;
            let z = (wIdx % 2 === 0 ? 0.4 : -0.4) * Math.cos(angle * 2);
            verticesND.push({ x: x, y: y, z: z, w: w, v: 0, u: 0, t: 0 });
        }
    }
    for (let wIdx = 0; wIdx < stepsLength; wIdx++) {
        for (let i = 0; i < stepsSphere; i++) {
            let current = wIdx * stepsSphere + i;
            edges.push([current, wIdx * stepsSphere + ((i + 1) % stepsSphere)]);
            if (wIdx < stepsLength - 1) { edges.push([current, (wIdx + 1) * stepsSphere + i]); }
        }
    }
    buildThreeObjects();
}

function load5DCrossPolytope() {
    clearGeometry(0.045);
    const r = 1.2; 
    verticesND = [
        { x:  r, y:  0, z:  0, w:  0, v:  0, u: 0, t: 0 },
        { x: -r, y:  0, z:  0, w:  0, v:  0, u: 0, t: 0 },
        { x:  0, y:  r, z:  0, w:  0, v:  0, u: 0, t: 0 },
        { x:  0, y: -r, z:  0, w:  0, v:  0, u: 0, t: 0 },
        { x:  0, y:  0, z:  r, w:  0, v:  0, u: 0, t: 0 },
        { x:  0, y: -0, z: -r, w:  0, v:  0, u: 0, t: 0 },
        { x:  0, y:  0, z:  0, w:  r, v:  0, u: 0, t: 0 },
        { x:  0, y:  0, z:  0, w: -r, v:  0, u: 0, t: 0 },
        { x:  0, y:  0, z:  0, w:  0, v:  r, u: 0, t: 0 },
        { x:  0, y:  0, z:  0, w:  0, v: -r, u: 0, t: 0 }
    ];
    for (let i = 0; i < verticesND.length; i++) {
        for (let j = i + 1; j < verticesND.length; j++) {
            if (i === 0 && j === 1) continue;
            if (i === 2 && j === 3) continue;
            if (i === 4 && j === 5) continue;
            if (i === 6 && j === 7) continue;
            if (i === 8 && j === 9) continue;
            edges.push([i, j]);
        }
    }
    buildThreeObjects();
}

function load5DHypercube() {
    clearGeometry(0.035);
    for (let i = 0; i < 32; i++) {
        let x = (i & 1)  ? 0.65 : -0.65;
        let y = (i & 2)  ? 0.65 : -0.65;
        let z = (i & 4)  ? 0.65 : -0.65;
        let w = (i & 8)  ? 0.65 : -0.65;
        let v = (i & 16) ? 0.65 : -0.65;
        verticesND.push({ x: x, y: y, z: z, w: w, v: v, u: 0, t: 0 });
    }
    for (let i = 0; i < 32; i++) {
        for (let j = i + 1; j < 32; j++) {
            let diff = 0;
            if (verticesND[i].x !== verticesND[j].x) diff++;
            if (verticesND[i].y !== verticesND[j].y) diff++; 
            if (verticesND[i].z !== verticesND[j].z) diff++;
            if (verticesND[i].w !== verticesND[j].w) diff++;
            if (verticesND[i].v !== verticesND[j].v) diff++;
            if (diff === 1) edges.push([i, j]);
        }
    }
    buildThreeObjects();
}

function loadDuocylinder() {
    clearGeometry(0.028); 
    const stepsU = 20; 
    const stepsV = 20; 
    const r1 = 0.8;    
    const r2 = 0.8;

    for (let i = 0; i < stepsU; i++) {
        let u = (i / stepsU) * Math.PI * 2;
        for (let j = 0; j < stepsV; j++) {
            let v = (j / stepsV) * Math.PI * 2;
            
            let x = r1 * Math.cos(u);
            let y = r1 * Math.sin(u);
            let z = r2 * Math.cos(v);
            let w = r2 * Math.sin(v);

            verticesND.push({ x: x, y: y, z: z, w: w, v: 0, u: 0, t: 0 });
        }
    }

    for (let i = 0; i < stepsU; i++) {
        for (let j = 0; j < stepsV; j++) {
            let current = i * stepsV + j;
            
            let nextU = ((i + 1) % stepsU) * stepsV + j;
            edges.push([current, nextU]);
            
            let nextV = i * stepsV + ((j + 1) % stepsV);
            edges.push([current, nextV]);
        }
    }
    buildThreeObjects();
}

// --- GLOBALNA PĘTLA ANIMACJI ---
function animate() {
    requestAnimationFrame(animate);
    const speed = 0.012; 
    angleXW += speed; angleYW += speed; angleXV += speed * 0.4; angleZU += speed * 0.3; angleXT += speed * 0.2; 
    projectND();

    if (currentObject === 1) {
        vertexGroup.rotation.set(0.38, 0.62, 0); edgeGroup.rotation.set(0.38, 0.62, 0);
    } else {
        vertexGroup.rotation.y += 0.0012; edgeGroup.rotation.y += 0.0012;
    }
    renderer.render(scene, camera);
}

// --- KONTROLA PRZEŁĄCZANIA OBIEKTÓW ---
function switchObject() {
    currentObject++;
    if (currentObject > 13) currentObject = 1;

    switch(currentObject) {
        case 1: loadTesseract(); break;
        case 2: loadPentachor(); break;
        case 3: load24Cell(); break;
        case 4: load16Cell(); break;
        case 5: load5DSimplex(); break;       
        case 6: loadHekterakt(); break;
        case 7: loadHepterakt(); break;
        case 8: loadHyperPyramid(); break;
        case 9: loadKleinBottle(); break;
        case 10: loadSpherinder(); break;
        case 11: load5DCrossPolytope(); break; 
        case 12: load5DHypercube(); break;     
        case 13: loadDuocylinder(); break; 
    }
    return currentObject;
}

// Start aplikacji
loadTesseract();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
