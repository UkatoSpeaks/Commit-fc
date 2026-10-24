"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { AdditiveBlending, Color, type ShaderMaterial } from "three";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { REVEAL, type StageLevels, type StageProps } from "../reveal-config";

/*
 * Dark stadium background for the pack reveal: floodlight beams from the top,
 * a soft glow behind the card, and drifting dust. Every intensity comes from the
 * shared `levels` object the GSAP timeline tweens, read once per frame.
 * This file (and Three.js) only loads while a reveal is playing.
 */

const MAX_DPR = 1.5;
const DUST_COUNT = 360;

/** Beam angle (deg) and x position across the top of the view */
const BEAMS = [
  { x: -3.4, angle: -32, width: 2.4, seed: 0.1 },
  { x: -2, angle: -18, width: 1.8, seed: 0.5 },
  { x: -0.7, angle: -6, width: 2.6, seed: 0.9 },
  { x: 0.7, angle: 6, width: 2.6, seed: 0.3 },
  { x: 2, angle: 18, width: 1.8, seed: 0.7 },
  { x: 3.4, angle: 32, width: 2.4, seed: 0.2 },
] as const;
const BEAM_LENGTH = 9;
const BEAM_TOP = 3.6;

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Narrow at the light source (top), wide at the bottom: a flat cone.
    p.x *= mix(1.0, 0.1, uv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uSeed;
  varying vec2 vUv;
  void main() {
    float edge = abs(vUv.x - 0.5) * 2.0;
    float core = pow(1.0 - edge, 2.2);
    float falloff = pow(vUv.y, 1.5);
    float flicker = 0.85 + 0.15 * sin(uTime * 1.4 + uSeed * 6.283);
    gl_FragColor = vec4(uColor, core * falloff * flicker * uIntensity * 0.32);
    #include <colorspace_fragment>
  }
`;

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 d = (vUv - vec2(0.5, 0.55)) * vec2(1.4, 1.0);
    float a = smoothstep(0.5, 0.0, length(d)) * uIntensity * 0.45;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  varying float vFade;
  void main() {
    vec3 p = position;
    float speed = 0.06 + fract(position.x * 13.17) * 0.12;
    p.y = mod(p.y + uTime * speed + 3.5, 7.0) - 3.5;
    p.x += sin(uTime * 0.3 + position.z * 4.0) * 0.15;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (6.0 / -mv.z);
    // Brighter near the beams at the top.
    vFade = 0.4 + 0.6 * smoothstep(-3.5, 3.0, p.y);
  }
`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * uOpacity * vFade);
    #include <colorspace_fragment>
  }
`;

type Uniforms = Record<string, { value: number | Color }>;

function setUniform(material: ShaderMaterial | null, name: string, value: number): void {
  const u = material?.uniforms[name];
  if (u) u.value = value;
}

/** Shared floodlight color: neutral → tier color as `levels.tint` goes 0 → 1. */
function useFloodColor(levels: StageLevels, tierColor: string) {
  return useMemo(() => {
    const from = new Color(REVEAL.floodColor);
    const to = new Color(tierColor);
    const out = new Color();
    return () => out.copy(from).lerp(to, Math.min(1, Math.max(0, levels.tint)));
  }, [levels, tierColor]);
}

function Beam({ beam, levels, color }: { beam: (typeof BEAMS)[number]; levels: StageLevels; color: () => Color }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo<Uniforms>(
    () => ({ uColor: { value: new Color() }, uIntensity: { value: 0 }, uTime: { value: 0 }, uSeed: { value: beam.seed } }),
    [beam.seed],
  );

  useFrame(({ clock }) => {
    const m = material.current;
    if (!m) return;
    setUniform(m, "uTime", clock.elapsedTime);
    setUniform(m, "uIntensity", levels.rays);
    (m.uniforms.uColor?.value as Color | undefined)?.copy(color());
  });

  return (
    <group position={[beam.x, BEAM_TOP, -0.5]} rotation={[0, 0, (beam.angle * Math.PI) / 180]}>
      <mesh position={[0, -BEAM_LENGTH / 2, 0]}>
        <planeGeometry args={[beam.width, BEAM_LENGTH]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={beamVertex}
          fragmentShader={beamFragment}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Glow({ levels, color }: { levels: StageLevels; color: () => Color }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo<Uniforms>(() => ({ uColor: { value: new Color() }, uIntensity: { value: 0 } }), []);

  useFrame(() => {
    const m = material.current;
    if (!m) return;
    setUniform(m, "uIntensity", levels.flood);
    (m.uniforms.uColor?.value as Color | undefined)?.copy(color());
  });

  return (
    <mesh position={[0, 0, -1.5]}>
      <planeGeometry args={[14, 9]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={glowVertex}
        fragmentShader={glowFragment}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}

function Dust({ levels, color }: { levels: StageLevels; color: () => Color }) {
  const material = useRef<ShaderMaterial>(null);
  const positions = useMemo(() => {
    // Deterministic spread so every reveal looks the same.
    const arr = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      const r = (n: number) => {
        const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
        return v - Math.floor(v);
      };
      arr[i * 3] = (r(1) - 0.5) * 11;
      arr[i * 3 + 1] = (r(2) - 0.5) * 7;
      arr[i * 3 + 2] = (r(3) - 0.5) * 4;
    }
    return arr;
  }, []);
  const uniforms = useMemo<Uniforms>(
    () => ({ uColor: { value: new Color() }, uOpacity: { value: 0 }, uTime: { value: 0 }, uSize: { value: 3 } }),
    [],
  );

  useFrame(({ clock, viewport }) => {
    const m = material.current;
    if (!m) return;
    setUniform(m, "uTime", clock.elapsedTime);
    setUniform(m, "uOpacity", levels.dust * 0.75);
    setUniform(m, "uSize", 3 * viewport.dpr);
    (m.uniforms.uColor?.value as Color | undefined)?.copy(color());
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

function Scene({ levels, color: tierColor }: StageProps) {
  const color = useFloodColor(levels, tierColor);
  return (
    <>
      <Glow levels={levels} color={color} />
      {BEAMS.map((beam) => (
        <Beam key={beam.seed} beam={beam} levels={levels} color={color} />
      ))}
      <Dust levels={levels} color={color} />
    </>
  );
}

export function StadiumStage(props: StageProps) {
  const root = useRef<HTMLDivElement>(null);
  const [dpr, setDpr] = useState(MAX_DPR);

  useGSAP(() => {
    gsap.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
  });

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none invisible absolute inset-0 opacity-0">
      <Canvas
        dpr={[1, Math.min(dpr, MAX_DPR)]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Drop to 1x pixels if the frame rate struggles. */}
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
