import React, { useMemo, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '@pascal-app/core';
import { useViewer } from '@pascal-app/viewer';

/**
 * Procedurally generates a high-resolution PBR Grass texture (1024x1024)
 * with multi-tone emerald/meadow turf variations, subtle grain, and organic mowing patterns.
 * 100% offline, zero network requests.
 */
function createProceduralGrassTexture(): {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Base vibrant meadow green
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(0, 0, size, size);

  // 2. Large organic sunlight & shade patches
  const gradient = ctx.createRadialGradient(size * 0.35, size * 0.35, 50, size * 0.5, size * 0.5, size * 0.7);
  gradient.addColorStop(0, 'rgba(76, 175, 80, 0.45)'); // sunlit lime
  gradient.addColorStop(0.5, 'rgba(56, 142, 60, 0.25)'); // rich forest
  gradient.addColorStop(1, 'rgba(27, 94, 32, 0.4)'); // deep emerald
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 3. Subtle architectural lawn striping (alternating mowing bands)
  const stripeWidth = 64;
  for (let x = 0; x < size; x += stripeWidth * 2) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x, 0, stripeWidth, size);
  }

  // 4. Fine noise & grass blade speckles
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  // Seeded pseudo-random noise
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < data.length; i += 4) {
    const n = (rnd() - 0.5) * 28;
    data[i] = Math.max(10, Math.min(255, data[i]! + n * 0.7)); // R
    data[i + 1] = Math.max(40, Math.min(255, data[i + 1]! + n * 1.3)); // G
    data[i + 2] = Math.max(10, Math.min(255, data[i + 2]! + n * 0.5)); // B
  }
  ctx.putImageData(imgData, 0, 0);

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(48, 48);
  colorMap.colorSpace = THREE.SRGBColorSpace;

  // Roughness canvas: matte grass with subtle specular variations
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rCtx = roughCanvas.getContext('2d')!;
  rCtx.fillStyle = '#dcdcdc'; // ~0.86 roughness
  rCtx.fillRect(0, 0, 512, 512);
  const rImg = rCtx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < rImg.data.length; i += 4) {
    const val = 210 + Math.floor(rnd() * 35);
    rImg.data[i] = val;
    rImg.data[i + 1] = val;
    rImg.data[i + 2] = val;
  }
  rCtx.putImageData(rImg, 0, 0);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(48, 48);

  return { colorMap, roughnessMap };
}

/**
 * Procedurally generates a clean architectural stone/concrete paver texture (512x512).
 */
function createProceduralPavingTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Light architectural stone paver
  ctx.fillStyle = '#dedad4';
  ctx.fillRect(0, 0, size, size);

  // Subtle concrete speckle
  const imgData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    imgData.data[i] = Math.max(0, Math.min(255, imgData.data[i]! + n));
    imgData.data[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1]! + n));
    imgData.data[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2]! + n));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle clean paver grid joints (128px tiles = 4x4 pavers per texture)
  ctx.strokeStyle = '#bab5ac';
  ctx.lineWidth = 3;
  for (let i = 0; i <= size; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Sky Dome texture with azure zenith, soft horizon haze, and subtle warm sun glow.
 */
function createSkyDomeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#1976d2'); // Azure zenith
  grad.addColorStop(0.45, '#64b5f6'); // Clean blue sky
  grad.addColorStop(0.75, '#bbdefb'); // Soft haze
  grad.addColorStop(0.88, '#e3f2fd'); // Warm horizon
  grad.addColorStop(1.0, '#78909c'); // Below horizon transition
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Room Floor Plates Subcomponent:
 * Renders distinct PBR room flooring materials at y = +0.005m (+5mm above slab)
 * matching architectural room specifications:
 * - Living/Dining/Bedrooms: #D8C3A5 (warm oak finish)
 * - Kitchen/Baths/Utility: #E2E6EA (ceramic tile finish)
 * - Corridors/Porch/Foyer: #E8E2D8 (travertine finish)
 * - Balconies: #C8CCD0 (slate finish)
 */
export const RoomFloorPlates: React.FC = () => {
  const nodes = useScene((s) => s.nodes);
  const selectedLevelId = useViewer((v) => v.selection?.levelId);
  const levelMode = useViewer((v) => v.levelMode);

  const floorPlates = useMemo(() => {
    const plates: Array<{
      id: string;
      levelElevation: number;
      shape: THREE.Shape;
      color: string;
      roughness: number;
      name: string;
      levelId: string;
    }> = [];

    for (const node of Object.values(nodes)) {
      if ((node as any).type !== 'zone') continue;
      const zone = node as any;
      if (!Array.isArray(zone.polygon) || zone.polygon.length < 3) continue;

      const parentLevel = nodes[zone.parentId] as any;
      const levelElevation = typeof parentLevel?.elevation === 'number' ? parentLevel.elevation : 0;

      const shape = new THREE.Shape();
      zone.polygon.forEach((pt: [number, number], idx: number) => {
        if (idx === 0) shape.moveTo(pt[0], -pt[1]);
        else shape.lineTo(pt[0], -pt[1]);
      });
      shape.closePath();

      const type = ((zone.metadata?.type || zone.name || '') as string).toLowerCase();
      let color = '#DDD8CE';
      let roughness = 0.55;

      if (
        type.includes('bed') ||
        type.includes('living') ||
        type.includes('dining') ||
        type.includes('hall') ||
        type.includes('drawing') ||
        type.includes('lounge') ||
        type.includes('study') ||
        type.includes('puja') ||
        type.includes('mandir')
      ) {
        color = '#D8C3A5'; // Warm oak wood finish
        roughness = 0.65;
      } else if (
        type.includes('bath') ||
        type.includes('toilet') ||
        type.includes('wc') ||
        type.includes('kitchen') ||
        type.includes('utility') ||
        type.includes('wash') ||
        type.includes('store')
      ) {
        color = '#E2E6EA'; // Ceramic tile finish
        roughness = 0.35;
      } else if (
        type.includes('foyer') ||
        type.includes('entry') ||
        type.includes('porch') ||
        type.includes('corridor') ||
        type.includes('lobby') ||
        type.includes('passage')
      ) {
        color = '#E8E2D8'; // Travertine stone finish
        roughness = 0.55;
      } else if (
        type.includes('balcony') ||
        type.includes('terrace') ||
        type.includes('deck') ||
        type.includes('verandah')
      ) {
        color = '#C8CCD0'; // Slate grey finish
        roughness = 0.70;
      }

      plates.push({
        id: zone.id,
        levelElevation,
        shape,
        color,
        roughness,
        name: zone.name || zone.id,
        levelId: zone.parentId,
      });
    }

    return plates;
  }, [nodes]);

  // Solo mode: only render floor plates for the isolated floor
  const visiblePlates = useMemo(() => {
    if (levelMode === 'solo' && selectedLevelId) {
      return floorPlates.filter((p) => p.levelId === selectedLevelId);
    }
    return floorPlates;
  }, [floorPlates, levelMode, selectedLevelId]);

  return (
    <group name="RoomFloorPlates" raycast={() => null}>
      {visiblePlates.map((plate) => (
        <mesh
          key={plate.id}
          name={`zone-floor-${plate.id}`}
          position={[0, plate.levelElevation + 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          raycast={() => null}
          userData={{ isZoneFloor: true, zoneId: plate.id, roomName: plate.name }}
        >
          <shapeGeometry args={[plate.shape]} />
          <meshStandardMaterial
            color={plate.color}
            roughness={plate.roughness}
            metalness={0.03}
          />
        </mesh>
      ))}
    </group>
  );
};

export const ArchitecturalEnvironment: React.FC = () => {
  const { scene, camera, gl } = useThree();
  const nodes = useScene((s) => s.nodes);

  // Expose Three.js scene & camera globally for headless audit & test inspection
  useEffect(() => {
    (window as any).__THREE_SCENE__ = scene;
    (window as any).__THREE_CAMERA__ = camera;
    (window as any).__THREE_GL__ = gl;
  }, [scene, camera, gl]);

  // Compute building footprint bounding box in meters
  const bounds = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (const node of Object.values(nodes)) {
      if ((node as any).type === 'slab' && Array.isArray((node as any).points)) {
        for (const pt of (node as any).points) {
          if (Array.isArray(pt) && pt.length >= 2) {
            minX = Math.min(minX, pt[0]);
            maxX = Math.max(maxX, pt[0]);
            minZ = Math.min(minZ, pt[1]);
            maxZ = Math.max(maxZ, pt[1]);
          }
        }
      } else if ((node as any).type === 'wall' && Array.isArray((node as any).start) && Array.isArray((node as any).end)) {
        const s = (node as any).start;
        const e = (node as any).end;
        minX = Math.min(minX, s[0], e[0]);
        maxX = Math.max(maxX, s[0], e[0]);
        minZ = Math.min(minZ, s[1], e[1]);
        maxZ = Math.max(maxZ, s[1], e[1]);
      }
    }

    // Default residential building plot if scene has not loaded yet
    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
      minX = 0;
      maxX = 25;
      minZ = 0;
      maxZ = 30;
    }

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const bldgWidth = maxX - minX;
    const bldgDepth = maxZ - minZ;

    // Pad adds neat 2.5m paved apron around building
    const apron = 2.5;
    const padWidth = bldgWidth + apron * 2;
    const padDepth = bldgDepth + apron * 2;
    const padRadius = Math.max(padWidth, padDepth) / 2;

    return {
      centerX,
      centerZ,
      bldgWidth,
      bldgDepth,
      padWidth,
      padDepth,
      padRadius,
      minX: centerX - padWidth / 2,
      maxX: centerX + padWidth / 2,
      minZ: centerZ - padDepth / 2,
      maxZ: centerZ + padDepth / 2,
    };
  }, [nodes]);

  // Procedural textures
  const { colorMap: grassColor, roughnessMap: grassRough } = useMemo(() => createProceduralGrassTexture(), []);
  const pavingTexture = useMemo(() => createProceduralPavingTexture(), []);
  const skyTexture = useMemo(() => createSkyDomeTexture(), []);

  // Configure Scene Atmosphere, Shadows & Fog
  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;

    // Atmospheric distance fog to blend perimeter rolling hills into sky
    const fog = new THREE.FogExp2('#bbdefb', 0.0032);
    scene.fog = fog;

    return () => {
      scene.fog = null;
    };
  }, [gl, scene]);

  // Undulating Terrain Geometry (400m x 400m, flat inside building pad at y = -0.18m, rolling hills outside)
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(420, 420, 84, 84);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position!;
    const { centerX, centerZ, padRadius } = bounds;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const dx = x - centerX;
      const dz = z - centerZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      let y = -0.18; // Base 180mm below building ground floor to avoid Z-fighting

      // Keep pad area completely flat, gently undulate outside perimeter
      const flatZone = padRadius + 8;
      if (dist > flatZone) {
        const factor = Math.min(1.0, (dist - flatZone) / 50);
        // Smooth rolling hills on horizon
        const hill =
          Math.sin(x * 0.022) * Math.cos(z * 0.022) * 4.2 +
          Math.sin(x * 0.045 + 1.5) * 1.8 +
          Math.cos(z * 0.038 - 0.8) * 2.2;
        y += hill * factor;
      }

      pos.setY(i, y);
    }

    geo.computeVertexNormals();
    return geo;
  }, [bounds]);

  // Instanced Trees & Foliage strictly OUTSIDE the building pad
  const treeInstances = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const { centerX, centerZ, padRadius, minZ } = bounds;

    let seed = 12345;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // Distribute 90 trees in natural perimeter groves
    for (let i = 0; i < 90; i++) {
      const angle = rnd() * Math.PI * 2;
      const dist = padRadius + 6 + rnd() * 110;
      const x = centerX + Math.cos(angle) * dist;
      const z = centerZ + Math.sin(angle) * dist;

      // Ensure trees never block front driveway corridor
      if (Math.abs(x - centerX) < 6 && z < minZ) {
        continue;
      }

      const scale = 0.75 + rnd() * 0.6;
      const rotY = rnd() * Math.PI * 2;

      // Sample terrain height for realistic tree placement
      const dx = x - centerX;
      const dz = z - centerZ;
      const d = Math.sqrt(dx * dx + dz * dz);
      let y = -0.18;
      if (d > padRadius + 8) {
        const factor = Math.min(1.0, (d - (padRadius + 8)) / 50);
        y += (Math.sin(x * 0.022) * Math.cos(z * 0.022) * 4.2 + Math.sin(x * 0.045 + 1.5) * 1.8) * factor;
      }

      const mat = new THREE.Matrix4();
      mat.compose(
        new THREE.Vector3(x, y, z),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY),
        new THREE.Vector3(scale, scale, scale),
      );
      matrices.push(mat);
    }
    return matrices;
  }, [bounds]);

  // Ref to apply instanced matrices
  const trunkMeshRef = useRef<THREE.InstancedMesh>(null);
  const foliageMeshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (trunkMeshRef.current && foliageMeshRef.current) {
      treeInstances.forEach((mat, idx) => {
        trunkMeshRef.current!.setMatrixAt(idx, mat);
        foliageMeshRef.current!.setMatrixAt(idx, mat);
      });
      trunkMeshRef.current.instanceMatrix.needsUpdate = true;
      foliageMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [treeInstances]);

  // Geometries for instanced trees
  const trunkGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.22, 0.38, 3.2, 7);
    geo.translate(0, 1.6, 0);
    return geo;
  }, []);

  const foliageGeo = useMemo(() => {
    // Multi-layered lush canopy
    const geo = new THREE.DodecahedronGeometry(2.4, 1);
    geo.translate(0, 4.2, 0);
    return geo;
  }, []);

  return (
    <group name="ArchitecturalEnvironment" raycast={() => null}>
      {/* 1. Atmospheric Sky & Sun Lighting */}
      <hemisphereLight
        color="#dceeff"
        groundColor="#4a6b3e"
        intensity={0.8}
        position={[0, 50, 0]}
      />
      <directionalLight
        color="#fff8ec"
        intensity={1.35}
        position={[bounds.centerX + 45, 75, bounds.centerZ + 55]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={250}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.00015}
      />

      {/* 2. Sky Gradient Dome */}
      <mesh position={[bounds.centerX, 0, bounds.centerZ]} raycast={() => null}>
        <sphereGeometry args={[320, 24, 16]} />
        <meshBasicMaterial
          map={skyTexture}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Lush 3D Game-Grade Grass Terrain */}
      <mesh
        geometry={terrainGeometry}
        receiveShadow
        raycast={() => null}
      >
        <meshStandardMaterial
          map={grassColor}
          roughnessMap={grassRough}
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* 4. Clean Architectural Site Pad (Under Building + 2.5m Apron at y = -0.04m) */}
      <group position={[bounds.centerX, -0.04, bounds.centerZ]} raycast={() => null}>
        {/* Main Paved Apron / Foundation Pad */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[bounds.padWidth, bounds.padDepth]} />
          <meshStandardMaterial
            map={pavingTexture}
            roughness={0.78}
            metalness={0.05}
          />
        </mesh>

        {/* Paved Front Driveway Strip */}
        <mesh
          position={[0, 0, -bounds.padDepth / 2 - 7.5]}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[6.5, 15]} />
          <meshStandardMaterial
            map={pavingTexture}
            roughness={0.82}
            metalness={0.05}
          />
        </mesh>

        {/* Subtle Chamfered Granite Curb Border around Pad (height 0.03m, top at y = -0.01m, strictly below ground slab 0.00m) */}
        {/* North Curb */}
        <mesh position={[0, 0.015, bounds.padDepth / 2]} castShadow receiveShadow>
          <boxGeometry args={[bounds.padWidth + 0.4, 0.03, 0.2]} />
          <meshStandardMaterial color="#888580" roughness={0.65} />
        </mesh>
        {/* East Curb */}
        <mesh position={[bounds.padWidth / 2, 0.015, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.03, bounds.padDepth + 0.4]} />
          <meshStandardMaterial color="#888580" roughness={0.65} />
        </mesh>
        {/* West Curb */}
        <mesh position={[-bounds.padWidth / 2, 0.015, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.03, bounds.padDepth + 0.4]} />
          <meshStandardMaterial color="#888580" roughness={0.65} />
        </mesh>
        {/* South Curb (Left Segment) */}
        <mesh position={[-(bounds.padWidth / 2 + 3.5) / 2, 0.015, -bounds.padDepth / 2]} castShadow receiveShadow>
          <boxGeometry args={[(bounds.padWidth - 7) / 2, 0.03, 0.2]} />
          <meshStandardMaterial color="#888580" roughness={0.65} />
        </mesh>
        {/* South Curb (Right Segment) */}
        <mesh position={[(bounds.padWidth / 2 + 3.5) / 2, 0.015, -bounds.padDepth / 2]} castShadow receiveShadow>
          <boxGeometry args={[(bounds.padWidth - 7) / 2, 0.03, 0.2]} />
          <meshStandardMaterial color="#888580" roughness={0.65} />
        </mesh>
      </group>

      {/* 5. Distinct Architect-Grade Room Floor Plates */}
      <RoomFloorPlates />

      {/* 6. Instanced 3D Trees & Foliage (Silky Smooth 60 FPS) */}
      {treeInstances.length > 0 && (
        <>
          <instancedMesh
            ref={trunkMeshRef}
            args={[trunkGeo, undefined, treeInstances.length]}
            castShadow
            receiveShadow
            raycast={() => null}
          >
            <meshStandardMaterial color="#4a3525" roughness={0.88} />
          </instancedMesh>
          <instancedMesh
            ref={foliageMeshRef}
            args={[foliageGeo, undefined, treeInstances.length]}
            castShadow
            receiveShadow
            raycast={() => null}
          >
            <meshStandardMaterial color="#2e7d32" roughness={0.82} />
          </instancedMesh>
        </>
      )}
    </group>
  );
};
