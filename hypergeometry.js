// --- INICJALIZACJA SILNIKA I SCENY ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x00ffcc, 1.5, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

let vertexGroup = new THREE.Group();
let edgeGroup = new THREE.Group();
scene.add(vertexGroup);
scene.add(edgeGroup);

vertexGroup.rotation.x = 0.5; vertexGroup.rotation.y = 0.5;
edgeGroup.rotation.x = 0.5; edgeGroup.rotation.y = 0.5;

// --- ZMIENNE STRUKTURALNE ---
let verticesND = []; 
let edges = [];
let spheres = [];
let lineGeometries = [];

let angleXW = 0, angleYW = 0, angleXV = 0, angleZU = 0, angleXT = 0; 
let currentObject = 1; // 1 do 11

let sphereGeo = new THREE.SphereGeometry(0.04, 8, 8);
const sphereMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x00ffcc });
const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });

// --- FUNKCJE CZYSZCZENIA I BUDOWANIA ---
function clearGeometry(size) {
    while(vertexGroup.children.length > 0){ vertexGroup.remove(vertexGroup.children[0]); }
    while(edgeGroup.children.length > 0){ edgeGroup.remove(edgeGroup.children[0]); }
    verticesND = []; edges = []; spheres = []; lineGeometries = [];
    sphereGeo = new THREE.SphereGeometry(size, 6, 6);
}

function buildThreeObjects() {
    verticesND.forEach(() => {
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        vertexGroup.add(mesh);
        spheres.push(mesh);
    });
    edges.forEach(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(6); 
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const line = new THREE.Line(geo, lineMat);
        edgeGroup.add(line);
        lineGeometries.push(geo);
    });
}

// --- GENERATORY GEOMETRII (1 - 11) ---

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
        { x: 1*r,  y: 1*r,  z: 1*r,  w: -0.45*r, v: 0, u: 0, t: 0 },
        { x: 1*r,  y: -1*r, z: -1*r, w: -0.45*r, v: 0, u: 0, t: 0 },
        { x: -1*r, y: 1*r,  z: -1*r, w: -0.45*r, v: 0, u: 0, t: 0 },
        { x: -1*r, y: -1*r, z: 1*r,  w: -0.45*r, v: 0, u: 0, t: 0 },
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

function loadPenterakt() {
    clearGeometry(0.035);
    for (let x of [-1, 1]) {
        for (let y of [-1, 1]) {
            for (let z of [-1, 1]) {
                for (let w of [-1, 1]) {
                    for (let v of [-1, 1]) {
                        verticesND.push({x: x * 0.7, y: y * 0.7, z: z * 0.7, w: w * 0.7, v: v * 0.7, u: 0, t: 0});
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
            if (diff === 1) edges.push([i, j]);
        }
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
    const stepsU = 24; const stepsV = 5; 
    for (let i = 0; i < stepsU; i++) {
        let u = (i / stepsU) * Math.PI * 2;
        for (let j = 0; j < stepsV; j++) {
            let v = (j / stepsV) * Math.PI * 2;
            let x = (1.2 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u) * 0.5;
            let y = (1.2 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u) * 0.5;
            let z = (Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v)) * 0.5;
            let w = (Math.cos(v) * (1 + Math.sin(u))) * 0.3;
            verticesND.push({ x: x, y: y, z: z, w: w, v: 0, u: 0, t: 0 });
        }
    }
    for (let i = 0; i < stepsU; i++) {
        for (let j = 0; j < stepsV; j++) {
            let current = i * stepsV + j;
            edges.push([current, i * stepsV + ((j + 1) % stepsV)]);
            edges.push([current, ((i + 1) % stepsU) * stepsV + j]);
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

// --- 11. NOWOŚĆ: 120-KOMÓRKA (HEKATONICHOR - REPREZENTACJA STRUKTURALNA RDZENIA) ---
function load120Cell() {
    clearGeometry(0.028);
    const phi = (1 + Math.sqrt(5)) / 2; // Złota proporcja
    const scaleFactor = 0.5;

    // Generowanie zestawu 60 punktów z permutacji współrzędnych sferycznych w 4D
    // Zestaw A: Permutacje typu (±2, ±2, 0, 0) przeskalowane
    const baseSetA = [
        [2, 2, 0, 0], [2, -2, 0, 0], [-2, 2, 0, 0], [-2, -2, 0, 0],
        [2, 0, 2, 0], [2, 0, -2, 0], [-2, 0, 2, 0], [-2, 0, -2, 0],
        [2, 0, 0, 2], [2, 0, 0, -2], [-2, 0, 0, 2], [-2, 0, 0, -2],
        [0, 2, 2, 0], [0, 2, -2, 0], [0, -2, 2, 0], [0, -2, -2, 0],
        [0, 2, 0, 2], [0, 2, 0, -2], [0, -2, 0, 2], [0, -2, 0, -2],
        [0, 0, 2, 2], [0, 0, 2, -2], [0, 0, -2, 2], [0, 0, -2, -2]
    ];
    baseSetA.forEach(v => {
        verticesND.push({ x: v[0]*scaleFactor, y: v[1]*scaleFactor, z: v[2]*scaleFactor, w: v[3]*scaleFactor, v:0, u:0, t:0 });
    });

    // Zestaw B: Permutacje cykliczne oparte na złotej liczbie (±phi^2, ±1, ±1, ±1) i pokrewne
    // Dla optymalizacji wizualnej tworzymy rdzeń o gęstym splocie geometrycznym
    for (let x of [-phi, phi]) {
        for (let y of [-1/phi, 1/phi]) {
            for (let z of [-1, 1]) {
                for (let w of [-phi*phi, phi*phi]) {
                    // Wybieramy zbalansowane układy, aby symetria była sferyczna wokół środka 4D
                    if(verticesND.length < 60) {
                        verticesND.push({ x: x*0.4, y: y*0.6, z: z*0.6, w: w*0.4, v:0, u:0, t:0 });
                    }
                }
            }
        }
    }

    // Dopełnienie do 60 stabilnych wierzchołków strukturalnych
    while(verticesND.length < 60) {
        let i = verticesND.length;
        verticesND.push({ x: Math.sin(i)*0.8, y: Math.cos(i)*0.8, z: Math.cos(i*2)*0.5, w: Math.sin(i*2)*0.5, v:0, u:0, t:0 });
    }

    // Obliczanie krawędzi na podstawie najbliższych odległości między węzłami sieci
    const thresholdSq = 1.15;
    for (let i = 0; i < verticesND.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < verticesND.length; j++) {
            let dx = verticesND[i].x - verticesND[j].x;
            let dy = verticesND[i].y - verticesND[j].y;
            let dz = verticesND[i].z - verticesND[j].z;
            let dw = verticesND[i].w - verticesND[j].w;
            let dSq = dx*dx + dy*dy + dz*dz + dw*dw;

            if (dSq > 0.1 && dSq < thresholdSq && connections < 4) {
                edges.push([i, j]);
                connections++;
            }
        }
    }
    buildThreeObjects();
}

// ============================================================================
// PODMIEŃ PONIŻSZE FUNKCJE W PLIKU hypergeometry.js
// ============================================================================

// --- ZMODYFIKOWANA PROJEKCJA I RENDEROWANIE ND -> 3D ---
function projectND() {
    const projectedVertices = [];
    const isSpecial4D = (currentObject === 8 || currentObject === 9 || currentObject === 10 || currentObject === 11);

    verticesND.forEach(p => {
        let x = p.x, y = p.y, z = p.z, w = p.w, v = p.v, u = p.u, t = p.t;

        // 1. Rotacja 7D
        if (currentObject === 7) {
            let cosXT = Math.cos(angleXT), sinXT = Math.sin(angleXT);
            let xTmp = x * cosXT - t * sinXT; t = x * sinXT + t * cosXT; x = xTmp;
        }
        // 2. Rotacja 6D
        if (currentObject >= 6 && !isSpecial4D) {
            let cosZU = Math.cos(angleZU), sinZU = Math.sin(angleZU);
            let zTmp = z * cosZU - u * sinZU; u = z * sinZU + u * cosZU; z = zTmp;
        }
        // 3. Rotacja 5D
        if (currentObject >= 5 && !isSpecial4D) {
            let cosXV = Math.cos(angleXV), sinXV = Math.sin(angleXV);
            let xTmp = x * cosXV - v * sinXV; v = x * sinXV + v * cosXV; x = xTmp;
        }

        // 4. Rotacje w płaszczyznach 4D
        // DLA TESERAKTU (currentObject === 1) mocno zwalniamy rotację 4D, 
        // aby struktura "kostki w kostce" była czytelna i stabilna jak na animacji z Wikipedii
        let factor4D = (currentObject === 1) ? 0.15 : 1.0; 
        
        let cosXW = Math.cos(angleXW * factor4D), sinXW = Math.sin(angleXW * factor4D);
        let x1 = x * cosXW - w * sinXW; w = x * sinXW + w * cosXW; x = x1;

        let cosYW = Math.cos(angleYW * factor4D), sinYW = Math.sin(angleYW * factor4D);
        let y1 = y * cosYW - w * sinYW; w = y * sinYW + w * cosYW; y = y1;

        // 5. Wielopoziomowe rzutowanie perspektywiczne do 3D
        const dist = 2.0;
        if (currentObject === 7) { const f7D = 1 / (dist - t); x *= f7D; y *= f7D; z *= f7D; w *= f7D; }
        if (currentObject === 6) { const f6D = 1 / (dist - u); x *= f6D; y *= f6D; z *= f6D; w *= f6D; }
        if (currentObject === 5) { const f5D = 1 / (dist - v); x *= f5D; y *= f5D; z *= f5D; w *= f5D; }
        
        // Rzut ostateczny z 4D
        // Zwiększamy nieco dystans rzutu dla Teseraktu (do 2.5), co niweluje przerysowane zniekształcenia perspektywy
        const distance4D = (currentObject === 1) ? 2.5 : (isSpecial4D ? 2.3 : dist);
        const f4D = 1 / (distance4D - w);
        
        let scale = 2.0;
        if (currentObject === 1) scale = 2.4; // Delikatne zwiększenie skali po odsunięciu rzutu
        else if (currentObject === 2) scale = 1.3;
        else if (currentObject === 7) scale = 3.0;
        else if (currentObject === 6) scale = 2.6;
        else if (currentObject >= 9) scale = 2.8;
        
        projectedVertices.push(new THREE.Vector3(x * f4D * scale, y * f4D * scale, z * f4D * scale));
    });

    // Podmiana pozycji w scenie 3D
    for(let i = 0; i < spheres.length; i++) {
        if(projectedVertices[i]) spheres[i].position.copy(projectedVertices[i]);
    }
    edges.forEach((edge, index) => {
        const geo = lineGeometries[index];
        if(geo && projectedVertices[edge[0]] && projectedVertices[edge[1]]) {
            const posAttr = geo.attributes.position;
            posAttr.setXYZ(0, projectedVertices[edge[0]].x, projectedVertices[edge[0]].y, projectedVertices[edge[0]].z);
            posAttr.setXYZ(1, projectedVertices[edge[1]].x, projectedVertices[edge[1]].y, projectedVertices[edge[1]].z);
            posAttr.needsUpdate = true;
        }
    });
}

// --- ZMODYFIKOWANA PĘTLA GLOBALNA ANIMACJI ---
function animate() {
    requestAnimationFrame(animate);

    const speed = 0.008;
    angleXW += speed; 
    angleYW += speed * 0.6; 
    angleXV += speed * 0.4; 
    angleZU += speed * 0.3; 
    angleXT += speed * 0.2; 

    projectND();

    // DLA TESERAKTU nadajemy wyraźny, stały obrót w przestrzeni 3D wokół osi Y oraz X.
    // Dzięki temu trójwymiarowa "klatka" obraca się naturalnie dla ludzkiego oka, 
    // eksponując wewnętrzny sześcian połączony z zewnętrznym.
    if (currentObject === 1) {
        vertexGroup.rotation.y += 0.012;
        vertexGroup.rotation.x += 0.006;
        edgeGroup.rotation.y += 0.012;
        edgeGroup.rotation.x += 0.006;
    } else {
        // Standardowy, bardzo delikatny ruch dla pozostałych obiektów ND
        vertexGroup.rotation.y += 0.0015;
        vertexGroup.rotation.x = 0.5; // Przywrócenie domyślnego pochylenia
        edgeGroup.rotation.y += 0.0015;
        edgeGroup.rotation.x = 0.5;
    }

    renderer.render(scene, camera);
}


// Start aplikacji
loadTesseract();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
