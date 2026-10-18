import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import {
  BEZEL_SWATCHES,
  EXPLODED_PARTS,
  OS_CHOICES,
} from '../data/presentationData';

export interface MinimalLaptopSceneProps {
  /** Continuous timeline position from 0 to 11 (where 3..4 is the 3D Exploded View sequence) */
  continuousSlidePos: number;
  /** 0..1 explosion factor calculated smoothly from scroll */
  explodeFactor: number;
  /** Lid open angle in radians */
  lidAngle: number;
  /** Optional bezel color override */
  bezelHex: string;
  reducedMotion: boolean;
}

const KEY_EXPLODED_LABELS: {
  id: string;
  label: string;
  sub: string;
  offset: [number, number, number];
}[] = [
  {
    id: 'display',
    label: '120 Hz Matte Display',
    sub: '2880 × 1920 · Replaceable eDP panel',
    offset: [-1.75, 1.95, -0.85],
  },
  {
    id: 'bezel',
    label: 'Magnetic Bezel',
    sub: 'Tool-free snap attachment',
    offset: [1.65, 1.55, 1.05],
  },
  {
    id: 'input-cover',
    label: 'Input Deck & Modules',
    sub: 'Captive T5 fasteners · Hot-swap bays',
    offset: [1.75, 1.05, 0.15],
  },
  {
    id: 'cooling',
    label: 'Thermal System',
    sub: 'Blower fan & dual copper heatpipes',
    offset: [-1.75, 0.78, -0.4],
  },
  {
    id: 'memory',
    label: '96 GB DDR5',
    sub: 'Socketed dual-channel SO-DIMM',
    offset: [1.65, 0.55, -0.15],
  },
  {
    id: 'storage',
    label: '8 TB NVMe SSD',
    sub: 'Standard M.2 2280 slot',
    offset: [-1.75, 0.35, 0.15],
  },
  {
    id: 'mainboard',
    label: 'Ryzen AI 300 Mainboard',
    sub: 'Up to 12 cores · Open schematics',
    offset: [-1.75, -0.1, -0.2],
  },
  {
    id: 'battery',
    label: 'No-Glue Battery',
    sub: 'Captive screws · QR repair guide',
    offset: [1.65, -0.25, 0.65],
  },
  {
    id: 'expansion-cards',
    label: 'Expansion Cards',
    sub: 'Hot-swappable USB-C port bays',
    offset: [1.85, -0.65, 0.1],
  },
];

function createScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 682;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 1024, 682);
  grad.addColorStop(0, '#070B12');
  grad.addColorStop(0.55, '#0E1726');
  grad.addColorStop(1, '#161220');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 682);

  // Subtle mountain ridge silhouette matching Slide 01
  ctx.fillStyle = '#241914';
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.lineTo(240, 290);
  ctx.lineTo(450, 420);
  ctx.lineTo(700, 230);
  ctx.lineTo(1024, 460);
  ctx.lineTo(1024, 682);
  ctx.lineTo(0, 682);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0A0E15';
  ctx.beginPath();
  ctx.moveTo(0, 560);
  ctx.lineTo(320, 370);
  ctx.lineTo(570, 490);
  ctx.lineTo(830, 320);
  ctx.lineTo(1024, 490);
  ctx.lineTo(1024, 682);
  ctx.lineTo(0, 682);
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createBatteryLabelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#12151B';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#28303F';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 500, 244);

  // QR block on left
  ctx.fillStyle = '#F5F7FA';
  ctx.fillRect(24, 32, 136, 192);
  ctx.fillStyle = '#0B0E13';
  ctx.font = '700 14px "Inter", sans-serif';
  ctx.fillText('framework', 42, 54);

  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      const isCorner =
        (r < 3 && c < 3) || (r < 3 && c > 7) || (r > 7 && c < 3);
      if (isCorner || (r * 7 + c * 13) % 3 === 0) {
        ctx.fillRect(38 + c * 10, 68 + r * 10, 8, 8);
      }
    }
  }
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillText('FRANEDAC7', 42, 198);

  ctx.fillStyle = '#F5F7FA';
  ctx.font = '700 22px "Inter", sans-serif';
  ctx.fillText('Battery', 184, 62);
  ctx.fillStyle = '#959EAD';
  ctx.font = '500 13px "JetBrains Mono", monospace';
  ctx.fillText('Li-Ion 00 · Zero Glue · Captive Screws', 184, 92);

  ctx.fillStyle = '#C8FF3A';
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillText('QR STEP-BY-STEP REPAIR GUIDE', 184, 198);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// Keyframe poses for each scene index (0..11) so the laptop glides smoothly as you scroll
const SCENE_POSES: { pos: [number, number, number]; rot: [number, number, number]; scale: number }[] = [
  // 0: Slide 01 Hero (right side, elegant studio angle)
  { pos: [1.55, -0.18, 0.2], rot: [0.24, -0.58, 0.04], scale: 0.96 },
  // 1: Slide 02 62 Mt E-waste (subtle dark silhouette shifted back)
  { pos: [1.65, -0.25, -0.85], rot: [0.35, -0.85, -0.05], scale: 0.8 },
  // 2: Slide 03 Meet Framework (approaching & opening)
  { pos: [1.45, -0.12, 0.15], rot: [0.32, -0.48, 0.02], scale: 0.94 },
  // 3: Scene 03B Exploded 3D Centerpiece (dead-center studio stage)
  { pos: [0.15, -0.18, 0.45], rot: [0.38, -0.52, 0.0], scale: 1.05 },
  // 4: Slide 04 Personas (calm background elevation)
  { pos: [1.6, 0.35, -0.75], rot: [0.26, -0.45, 0.0], scale: 0.82 },
  // 5: Slide 05 Performance (angled internal silicon view on right)
  { pos: [1.52, -0.08, 0.25], rot: [0.48, -0.42, 0.04], scale: 0.94 },
  // 6: Slide 06 Expansion Cards (side port bay focus)
  { pos: [1.45, 0.08, 0.5], rot: [0.28, -0.92, 0.05], scale: 0.96 },
  // 7: Slide 07 Repair, Reuse, Repeat (top-down blueprint angle)
  { pos: [1.52, -0.02, 0.3], rot: [0.88, -0.22, 0.0], scale: 0.92 },
  // 8: Slide 08 Your OS, Your Rules (front display showcase)
  { pos: [1.55, 0.12, 0.3], rot: [0.16, -0.44, 0.0], scale: 0.94 },
  // 9: Slide 09 Customize (input deck & bezel angle)
  { pos: [1.5, 0.02, 0.35], rot: [0.44, -0.5, 0.02], scale: 0.95 },
  // 10: Slide 10 Real Numbers (mainboard upgrade elevation)
  { pos: [1.58, 0.12, -0.35], rot: [0.36, -0.58, 0.03], scale: 0.86 },
  // 11: Slide 11 Finale (hero studio angle)
  { pos: [1.52, -0.1, 0.3], rot: [0.32, -0.54, 0.03], scale: 0.96 },
];

function LaptopAssembly({
  continuousSlidePos,
  explodeFactor,
  lidAngle,
  bezelHex,
  reducedMotion,
}: MinimalLaptopSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const fanBladesRef = useRef<THREE.Group>(null);

  const partRefs = useRef<Record<string, THREE.Group | null>>({});

  const screenTexture = useMemo(() => createScreenTexture(), []);
  const batteryTexture = useMemo(() => createBatteryLabelTexture(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const lerpSpeed = reducedMotion ? 14 : 5.5;

    if (fanBladesRef.current && !reducedMotion) {
      fanBladesRef.current.rotation.y += dt * 7;
    }

    // Interpolate pose continuously between floor(continuousSlidePos) and ceil(continuousSlidePos)
    const maxIdx = SCENE_POSES.length - 1;
    const clampedPos = Math.max(0, Math.min(maxIdx, continuousSlidePos));
    const idx0 = Math.floor(clampedPos);
    const idx1 = Math.min(maxIdx, idx0 + 1);
    const frac = clampedPos - idx0;
    // Smoothstep fractional blend
    const smoothFrac = frac * frac * (3 - 2 * frac);

    const p0 = SCENE_POSES[idx0];
    const p1 = SCENE_POSES[idx1];

    const targetX = THREE.MathUtils.lerp(p0.pos[0], p1.pos[0], smoothFrac);
    const targetY = THREE.MathUtils.lerp(p0.pos[1], p1.pos[1], smoothFrac);
    const targetZ = THREE.MathUtils.lerp(p0.pos[2], p1.pos[2], smoothFrac);

    const targetRX = THREE.MathUtils.lerp(p0.rot[0], p1.rot[0], smoothFrac);
    const targetRY = THREE.MathUtils.lerp(p0.rot[1], p1.rot[1], smoothFrac);
    const targetRZ = THREE.MathUtils.lerp(p0.rot[2], p1.rot[2], smoothFrac);
    const targetScale = THREE.MathUtils.lerp(p0.scale, p1.scale, smoothFrac);

    if (rootRef.current) {
      const idleFloat = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.2) * 0.025;
      rootRef.current.position.x = THREE.MathUtils.lerp(
        rootRef.current.position.x,
        targetX,
        dt * lerpSpeed
      );
      rootRef.current.position.y = THREE.MathUtils.lerp(
        rootRef.current.position.y,
        targetY + idleFloat,
        dt * lerpSpeed
      );
      rootRef.current.position.z = THREE.MathUtils.lerp(
        rootRef.current.position.z,
        targetZ,
        dt * lerpSpeed
      );

      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        targetRX,
        dt * lerpSpeed
      );
      rootRef.current.rotation.y = THREE.MathUtils.lerp(
        rootRef.current.rotation.y,
        targetRY,
        dt * lerpSpeed
      );
      rootRef.current.rotation.z = THREE.MathUtils.lerp(
        rootRef.current.rotation.z,
        targetRZ,
        dt * lerpSpeed
      );

      const s = THREE.MathUtils.lerp(rootRef.current.scale.x, targetScale, dt * lerpSpeed);
      rootRef.current.scale.setScalar(s);
    }

    // Contextual partial animations for specific slides (e.g. Slide 05 silicon peek, Slide 06 ports slide out, Slide 07 open cover)
    const activeRounded = Math.round(clampedPos);

    EXPLODED_PARTS.forEach((spec) => {
      const group = partRefs.current[spec.id];
      if (!group) return;

      let localExplode = explodeFactor;
      if (activeRounded === 5 && ['input-cover', 'cooling', 'memory', 'storage'].includes(spec.id)) {
        localExplode = Math.max(localExplode, spec.id === 'input-cover' ? 0.55 : 0.3);
      } else if (activeRounded === 6 && spec.id === 'expansion-cards') {
        localExplode = Math.max(localExplode, 0.78);
      } else if (activeRounded === 7 && spec.id === 'input-cover') {
        localExplode = Math.max(localExplode, 0.7);
      } else if (activeRounded === 10 && ['mainboard', 'input-cover'].includes(spec.id)) {
        localExplode = Math.max(localExplode, 0.45);
      }

      const tx = spec.explodeOffset[0] * localExplode;
      const ty = spec.explodeOffset[1] * localExplode;
      const tz = spec.explodeOffset[2] * localExplode;

      group.position.x = THREE.MathUtils.lerp(group.position.x, tx, dt * 6);
      group.position.y = THREE.MathUtils.lerp(group.position.y, ty, dt * 6);
      group.position.z = THREE.MathUtils.lerp(group.position.z, tz, dt * 6);

      if (spec.explodeRotation) {
        group.rotation.x = THREE.MathUtils.lerp(
          group.rotation.x,
          spec.explodeRotation[0] * localExplode,
          dt * 6
        );
        group.rotation.y = THREE.MathUtils.lerp(
          group.rotation.y,
          spec.explodeRotation[1] * localExplode,
          dt * 6
        );
        group.rotation.z = THREE.MathUtils.lerp(
          group.rotation.z,
          spec.explodeRotation[2] * localExplode,
          dt * 6
        );
      }
    });
  });

  const W = 3.2;
  const D = 2.2;

  return (
    <group ref={rootRef}>
      {/* 10. BOTTOM CNC ALUMINUM CHASSIS */}
      <group ref={(el) => (partRefs.current['bottom-chassis'] = el)}>
        <RoundedBox args={[W, 0.12, D]} radius={0.04} smoothness={4} position={[0, -0.08, 0]}>
          <meshStandardMaterial color="#B8C0CC" metalness={0.86} roughness={0.24} />
        </RoundedBox>
        <mesh position={[0, -0.015, 0]}>
          <boxGeometry args={[W - 0.12, 0.01, D - 0.12]} />
          <meshStandardMaterial color="#181D26" metalness={0.5} roughness={0.6} />
        </mesh>
        {[
          [-1.42, 0.0, -0.95],
          [1.42, 0.0, -0.95],
          [0, 0.0, 0.0],
          [-1.42, 0.0, 0.95],
          [1.42, 0.0, 0.95],
        ].map(([x, y, z], idx) => (
          <group key={idx} position={[x, y, z]}>
            <mesh>
              <cylinderGeometry args={[0.045, 0.045, 0.04, 16]} />
              <meshStandardMaterial color="#FF7A4F" metalness={0.3} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.05, 16]} />
              <meshStandardMaterial color="#D0D7E2" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 8. NO-GLUE LI-ION BATTERY PACK */}
      <group ref={(el) => (partRefs.current['battery'] = el)}>
        <group position={[0, 0.02, 0.54]}>
          <RoundedBox args={[2.56, 0.09, 0.82]} radius={0.02} smoothness={3}>
            <meshStandardMaterial color="#141820" metalness={0.25} roughness={0.55} />
          </RoundedBox>
          <mesh position={[0, 0.046, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.46, 0.74]} />
            <meshBasicMaterial map={batteryTexture} />
          </mesh>
          <mesh position={[0.35, 0.05, -0.44]}>
            <boxGeometry args={[0.18, 0.015, 0.08]} />
            <meshStandardMaterial color="#FF7A4F" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* 7. SWAPPABLE MAINBOARD */}
      <group ref={(el) => (partRefs.current['mainboard'] = el)}>
        <group position={[0, 0.02, -0.35]}>
          <RoundedBox args={[2.42, 0.035, 1.12]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#10161F" metalness={0.35} roughness={0.45} />
          </RoundedBox>
          <mesh position={[-0.18, 0.028, -0.05]}>
            <boxGeometry args={[0.42, 0.02, 0.42]} />
            <meshStandardMaterial color="#2A3444" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[-0.18, 0.042, -0.05]}>
            <boxGeometry args={[0.24, 0.015, 0.18]} />
            <meshStandardMaterial color="#687890" metalness={0.95} roughness={0.1} />
          </mesh>
          {[-0.52, -0.4, -0.28, -0.16, -0.04].map((zPos, i) => (
            <mesh key={i} position={[-0.52, 0.032, zPos + 0.2]}>
              <boxGeometry args={[0.11, 0.03, 0.09]} />
              <meshStandardMaterial color="#2B303A" metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
          {[-0.38, 0.22].map((zOff, idx) => (
            <React.Fragment key={idx}>
              <mesh position={[-1.18, 0.028, zOff]}>
                <boxGeometry args={[0.09, 0.025, 0.16]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[1.18, 0.028, zOff]}>
                <boxGeometry args={[0.09, 0.025, 0.16]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
              </mesh>
            </React.Fragment>
          ))}
          <mesh position={[0.42, 0.022, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.22, 0.22]} />
            <meshBasicMaterial color="#F5F7FA" />
          </mesh>
        </group>
      </group>

      {/* 4. THERMAL COOLING ASSEMBLY */}
      <group ref={(el) => (partRefs.current['cooling'] = el)}>
        <group position={[-0.25, 0.065, -0.42]}>
          <mesh position={[-0.35, 0, 0.05]}>
            <cylinderGeometry args={[0.38, 0.38, 0.055, 32]} />
            <meshStandardMaterial color="#1A1F29" metalness={0.4} roughness={0.45} />
          </mesh>
          <group ref={fanBladesRef} position={[-0.35, 0.015, 0.05]}>
            <mesh>
              <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
              <meshStandardMaterial color="#2B3240" metalness={0.7} roughness={0.3} />
            </mesh>
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx / 12) * Math.PI * 2;
              return (
                <mesh
                  key={idx}
                  position={[Math.cos(angle) * 0.22, 0, Math.sin(angle) * 0.22]}
                  rotation={[0, -angle + 0.35, 0]}
                >
                  <boxGeometry args={[0.18, 0.025, 0.02]} />
                  <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.35} />
                </mesh>
              );
            })}
          </group>
          <mesh position={[0.12, 0.01, -0.05]} rotation={[0, 0.25, 0]}>
            <boxGeometry args={[0.92, 0.024, 0.075]} />
            <meshStandardMaterial color="#C87544" metalness={0.88} roughness={0.2} />
          </mesh>
          <mesh position={[0.12, 0.01, -0.15]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[0.96, 0.024, 0.065]} />
            <meshStandardMaterial color="#B86635" metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[-0.1, 0.01, -0.45]}>
            <boxGeometry args={[1.05, 0.06, 0.16]} />
            <meshStandardMaterial color="#252B37" metalness={0.75} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* 5. SOCKETED DDR5 MEMORY MODULES */}
      <group ref={(el) => (partRefs.current['memory'] = el)}>
        <group position={[0.72, 0.055, -0.35]}>
          {[-0.18, 0.18].map((zOff, idx) => (
            <group key={idx} position={[0, 0, zOff]}>
              <RoundedBox args={[0.58, 0.022, 0.26]} radius={0.006} smoothness={2}>
                <meshStandardMaterial color="#143328" metalness={0.35} roughness={0.4} />
              </RoundedBox>
              <mesh position={[-0.27, 0, 0]}>
                <boxGeometry args={[0.04, 0.024, 0.24]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.18} />
              </mesh>
              {[-0.08, 0.08].map((xChip, ci) =>
                [-0.06, 0.06].map((zChip, cj) => (
                  <mesh key={`${ci}-${cj}`} position={[xChip, 0.015, zChip]}>
                    <boxGeometry args={[0.11, 0.01, 0.08]} />
                    <meshStandardMaterial color="#0B0E13" metalness={0.5} roughness={0.3} />
                  </mesh>
                ))
              )}
            </group>
          ))}
        </group>
      </group>

      {/* 6. M.2 2280 NVME STORAGE */}
      <group ref={(el) => (partRefs.current['storage'] = el)}>
        <group position={[-0.92, 0.055, -0.22]}>
          <RoundedBox args={[0.24, 0.02, 0.78]} radius={0.005} smoothness={2}>
            <meshStandardMaterial color="#141A24" metalness={0.4} roughness={0.35} />
          </RoundedBox>
          <mesh position={[0, 0.014, -0.18]}>
            <boxGeometry args={[0.18, 0.01, 0.22]} />
            <meshStandardMaterial color="#0A0D12" metalness={0.6} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.014, 0.12]}>
            <boxGeometry args={[0.18, 0.01, 0.26]} />
            <meshStandardMaterial color="#0A0D12" metalness={0.6} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.016, 0]}>
            <boxGeometry args={[0.16, 0.011, 0.06]} />
            <meshStandardMaterial color="#C8FF3A" />
          </mesh>
        </group>
      </group>

      {/* 9. HOT-SWAPPABLE USB-C EXPANSION CARDS */}
      <group ref={(el) => (partRefs.current['expansion-cards'] = el)}>
        {[-1, 1].map((side) =>
          [-0.62, -0.12, 0.38].map((zSlot, slotIdx) => {
            const xBase = side * 1.44;
            return (
              <group key={`${side}-${slotIdx}`} position={[xBase, -0.02, zSlot]}>
                <RoundedBox args={[0.32, 0.095, 0.34]} radius={0.015} smoothness={3}>
                  <meshStandardMaterial color="#9AA4B4" metalness={0.82} roughness={0.22} />
                </RoundedBox>
                <mesh position={[-side * 0.19, 0, 0]}>
                  <boxGeometry args={[0.08, 0.03, 0.1]} />
                  <meshStandardMaterial color="#D4AF37" metalness={0.92} roughness={0.18} />
                </mesh>
                <mesh position={[side * 0.162, 0, 0]}>
                  <boxGeometry args={[0.01, 0.04, 0.18]} />
                  <meshStandardMaterial
                    color={slotIdx === 0 ? '#C8FF3A' : slotIdx === 1 ? '#FF7A4F' : '#1A1F2B'}
                  />
                </mesh>
              </group>
            );
          })
        )}
      </group>

      {/* 3. INPUT COVER & KEYBOARD DECK */}
      <group ref={(el) => (partRefs.current['input-cover'] = el)}>
        <group position={[0, 0.09, 0]}>
          <RoundedBox args={[W, 0.035, D]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#C2CAD6" metalness={0.85} roughness={0.24} />
          </RoundedBox>
          <mesh position={[-0.28, 0.019, -0.26]}>
            <boxGeometry args={[2.24, 0.01, 1.05]} />
            <meshStandardMaterial color="#12161F" metalness={0.3} roughness={0.7} />
          </mesh>
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 14 }).map((__, c) => (
              <mesh key={`k-${r}-${c}`} position={[-1.3 + c * 0.155, 0.028, -0.7 + r * 0.175]}>
                <boxGeometry args={[0.13, 0.016, 0.14]} />
                <meshStandardMaterial color="#1B202B" roughness={0.5} metalness={0.2} />
              </mesh>
            ))
          )}
          <mesh position={[1.28, 0.025, -0.88]}>
            <cylinderGeometry args={[0.055, 0.055, 0.012, 24]} />
            <meshStandardMaterial color="#181D26" emissive="#C8FF3A" emissiveIntensity={0.6} />
          </mesh>
          {/* Modular Input Bay */}
          <group position={[1.14, 0.024, -0.26]}>
            <mesh>
              <boxGeometry args={[0.52, 0.016, 1.05]} />
              <meshStandardMaterial color="#151A24" metalness={0.35} roughness={0.3} />
            </mesh>
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 3 }).map((__, c) => {
                const rgbColors = ['#FF5577', '#C8FF3A', '#38BDF8', '#A855F7', '#FF8A4F'];
                const keyColor = rgbColors[(r * 3 + c) % rgbColors.length];
                return (
                  <mesh key={`pad-${r}-${c}`} position={[-0.15 + c * 0.145, 0.012, -0.38 + r * 0.19]}>
                    <boxGeometry args={[0.12, 0.016, 0.15]} />
                    <meshStandardMaterial
                      color={keyColor}
                      emissive={keyColor}
                      emissiveIntensity={0.45}
                      roughness={0.35}
                    />
                  </mesh>
                );
              })
            )}
          </group>
          <mesh position={[-0.08, 0.02, 0.64]}>
            <boxGeometry args={[1.15, 0.01, 0.68]} />
            <meshStandardMaterial color="#8A94A4" metalness={0.65} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* HINGED DISPLAY & MAGNETIC BEZEL */}
      <group position={[0, 0.11, -D / 2 + 0.06]} rotation={[lidAngle - Math.PI / 2, 0, 0]}>
        <group ref={(el) => (partRefs.current['display'] = el)}>
          <group position={[0, D / 2 - 0.06, 0]}>
            <RoundedBox args={[W, D, 0.045]} radius={0.03} smoothness={4} position={[0, 0, -0.02]}>
              <meshStandardMaterial color="#BFC7D4" metalness={0.86} roughness={0.22} />
            </RoundedBox>
            <mesh position={[0, 0.05, -0.044]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.006, 12]} />
              <meshStandardMaterial color="#181D26" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.05, -0.046]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.008, 24]} />
              <meshStandardMaterial color="#BFC7D4" metalness={0.86} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0.02, 0.006]}>
              <planeGeometry args={[W - 0.24, D - 0.26]} />
              <meshBasicMaterial map={screenTexture} />
            </mesh>
            {[-1.12, 1.12].map((hx, idx) => (
              <mesh key={idx} position={[hx, -D / 2 + 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.035, 0.035, 0.32, 16]} />
                <meshStandardMaterial color="#232936" metalness={0.8} roughness={0.25} />
              </mesh>
            ))}
          </group>
        </group>

        <group ref={(el) => (partRefs.current['bezel'] = el)}>
          <group position={[0, D / 2 - 0.06, 0.018]}>
            <mesh position={[0, D / 2 - 0.065, 0]}>
              <boxGeometry args={[W - 0.02, 0.13, 0.016]} />
              <meshStandardMaterial color={bezelHex} roughness={0.35} metalness={0.15} />
            </mesh>
            <mesh position={[0, -D / 2 + 0.085, 0]}>
              <boxGeometry args={[W - 0.02, 0.17, 0.016]} />
              <meshStandardMaterial color={bezelHex} roughness={0.35} metalness={0.15} />
            </mesh>
            <mesh position={[-W / 2 + 0.06, 0.01, 0]}>
              <boxGeometry args={[0.1, D - 0.28, 0.016]} />
              <meshStandardMaterial color={bezelHex} roughness={0.35} metalness={0.15} />
            </mesh>
            <mesh position={[W / 2 - 0.06, 0.01, 0]}>
              <boxGeometry args={[0.1, D - 0.28, 0.016]} />
              <meshStandardMaterial color={bezelHex} roughness={0.35} metalness={0.15} />
            </mesh>
          </group>
        </group>
      </group>

      {/* RESTRAINED, MINIMAL 3D ANNOTATIONS DURING EXPLODED VIEW ONLY */}
      {explodeFactor > 0.45 &&
        KEY_EXPLODED_LABELS.map((item) => {
          const opacity = Math.min(1, (explodeFactor - 0.45) / 0.35);
          return (
            <Html
              key={item.id}
              position={[
                item.offset[0] * explodeFactor,
                item.offset[1] * explodeFactor,
                item.offset[2] * explodeFactor,
              ]}
              center
              distanceFactor={6.8}
              style={{
                opacity,
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease-out',
              }}
            >
              <div className="minimal-3d-annotation">
                <span className="minimal-3d-dot" />
                <div>
                  <div className="minimal-3d-title">{item.label}</div>
                  <div className="minimal-3d-sub">{item.sub}</div>
                </div>
              </div>
            </Html>
          );
        })}
    </group>
  );
}

export const FrameworkLaptop3DCanvas: React.FC<MinimalLaptopSceneProps> = (props) => {
  const [webglError, setWebglError] = useState(false);

  if (webglError) {
    return null;
  }

  return (
    <div className="canvas-stage-wrapper" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 1.25, 5.2], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
        }}
        onError={() => setWebglError(true)}
      >
        <ambientLight intensity={0.78} />
        <directionalLight position={[5, 8, 6]} intensity={2.4} color="#F8FAFC" />
        <directionalLight position={[-6, 4, -4]} intensity={1.0} color="#C8FF3A" />
        <pointLight position={[0, 3, 3]} intensity={1.1} color="#E2E8F0" />

        <LaptopAssembly {...props} />

        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.5}
          scale={12}
          blur={2.5}
          far={4.5}
          color="#000000"
        />
      </Canvas>
    </div>
  );
};
