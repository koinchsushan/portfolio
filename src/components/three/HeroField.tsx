'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * The hero shader: a curl-noise flow field behind the drawn SVG lattice in
 * `components/graphics/HeroField.tsx`. Same argument, same palette, animated
 * instead of fixed. Hand-written GLSL, no shader library, no preset.
 *
 * The noise is a simple hash-based value noise fed through finite
 * differences to get curl (curl = (dPotential/dy, -dPotential/dx) of a
 * scalar potential), which is the standard way to turn any smooth scalar
 * field into a divergence-free, fluid-looking one without a dedicated
 * simplex implementation.
 */
const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec2 uVelocity;
  uniform vec3 uGround;
  uniform vec3 uMuted;
  uniform vec3 uSignal;

  // A bit-mixing hash, not copied from any known noise library: it only
  // has to be a decorrelated pseudo-random value per lattice cell for
  // valueNoise below to build a smooth field out of.
  float hash(vec2 p) {
    p = fract(p * vec2(123.19, 456.21));
    p += dot(p, p + 34.53);
    return fract(p.x * p.y);
  }

  // Bilinear value noise: smooth, cheap, and all curl needs is a smooth
  // scalar potential to differentiate.
  float valueNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    float a = hash(cell);
    float b = hash(cell + vec2(1.0, 0.0));
    float c = hash(cell + vec2(0.0, 1.0));
    float d = hash(cell + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Fractal sum of the value noise: the scalar potential the curl below is
  // taken from.
  float potential(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * valueNoise(p * frequency);
      frequency *= 2.02;
      amplitude *= 0.55;
    }
    return value;
  }

  // Curl of a scalar potential via central finite differences. Rotational
  // by construction (divergence-free), which is what makes it read as a
  // field being measured rather than noise being scattered.
  vec2 curlOf(vec2 p) {
    float eps = 0.06;
    float n1 = potential(p + vec2(0.0, eps));
    float n2 = potential(p - vec2(0.0, eps));
    float n3 = potential(p + vec2(eps, 0.0));
    float n4 = potential(p - vec2(eps, 0.0));
    float dPotentialDy = (n1 - n2) / (2.0 * eps);
    float dPotentialDx = (n3 - n4) / (2.0 * eps);
    return vec2(dPotentialDy, -dPotentialDx);
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 st = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
    vec2 pointerSt = vec2((uPointer.x - 0.5) * aspect, uPointer.y - 0.5);

    // The cursor acts as a local probe: its velocity (already decayed
    // exponentially on the CPU each frame) bends the field within a soft
    // radius around it, rather than dragging the whole plate.
    float toPointer = length(st - pointerSt);
    float influence = exp(-toPointer * toPointer * 3.2);
    vec2 warp = uVelocity * influence * 0.9;

    vec2 flowCoord = st * 1.6 + warp + vec2(uTime * 0.015, uTime * 0.01);
    vec2 flow = curlOf(flowCoord);

    vec2 sampled = st * 2.0 + flow * 0.45 + vec2(-uTime * 0.02, uTime * 0.009);
    float field = potential(sampled);

    // The site's own tonal ramp, ground rising to a dim, unresolved neutral
    // (never a second hue) as field magnitude increases, driven by field
    // magnitude rather than screen position, so it reads as an instrument
    // reading.
    float mutedMix = smoothstep(0.28, 0.72, field);
    vec3 color = mix(uGround, uMuted, mutedMix);

    // Sparse signal filaments along one iso-line of the curl magnitude,
    // held to a low density with a hard threshold and a steep falloff, the
    // same "resolving onto a datum" idea as the SVG's trace.
    float curlMag = length(flow);
    float ridge = 1.0 - smoothstep(0.0, 0.03, abs(curlMag - 0.42));
    float filament = pow(ridge, 6.0) * (0.3 + 0.7 * influence);
    color = mix(color, uSignal, filament);

    // Fades to fully transparent toward the frame edges so the layer reads
    // as atmosphere behind the SVG lattice, never a hard-edged panel.
    float vignette = 1.0 - smoothstep(0.55, 1.05, length(vUv - 0.5) * 1.35);
    float alpha = (0.4 + 0.3 * mutedMix + filament * 0.6) * vignette;

    gl_FragColor = vec4(color, alpha);
  }
`

const POINTER_DECAY_PER_SECOND = 3.2
const POINTER_IMPULSE_SCALE = 0.55

/**
 * The palette arrives as resolved CSS colour strings from `HeroCanvas`, which
 * reads the custom properties before mounting this canvas. Nothing in this
 * file names a colour: an SSR fallback here would be a second copy of the
 * palette that drifts the moment `tokens.css` changes, and this component is
 * mounted client-only (`ssr: false`) so it could never run anyway.
 */
export interface HeroPalette {
  ground: string
  /** The tonal ramp's dim, unresolved end , `--label`, never a second hue. */
  muted: string
  signal: string
}

interface PointerState {
  x: number
  y: number
  vx: number
  vy: number
  lastX: number
  lastY: number
  lastT: number
}

function FlowField({ paused, palette }: { paused: boolean; palette: HeroPalette }) {
  const { size, viewport, gl } = useThree()
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const pointerState = useRef<PointerState>({ x: 0.5, y: 0.5, vx: 0, vy: 0, lastX: 0.5, lastY: 0.5, lastT: 0 })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      // Read straight from the CSS custom properties: the shader never
      // hardcodes the palette, it inherits it.
      uGround: { value: new THREE.Color(palette.ground) },
      uMuted: { value: new THREE.Color(palette.muted) },
      uSignal: { value: new THREE.Color(palette.signal) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const x = (event.clientX - rect.left) / rect.width
      const y = 1 - (event.clientY - rect.top) / rect.height
      const now = performance.now()
      const state = pointerState.current

      if (state.lastT > 0) {
        const dt = Math.max((now - state.lastT) / 1000, 1 / 240)
        state.vx += ((x - state.lastX) / dt) * POINTER_IMPULSE_SCALE
        state.vy += ((y - state.lastY) / dt) * POINTER_IMPULSE_SCALE
      }

      state.x = x
      state.y = y
      state.lastX = x
      state.lastY = y
      state.lastT = now
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [gl])

  useFrame((_, delta) => {
    if (paused) return
    const state = pointerState.current

    // Exponential decay: an idle cursor's influence fades smoothly to
    // nothing rather than cutting off, leaving only the slow ambient
    // time-driven flow.
    const decay = Math.exp(-POINTER_DECAY_PER_SECOND * delta)
    state.vx *= decay
    state.vy *= decay

    uniforms.uTime.value += delta
    uniforms.uPointer.value.set(state.x, state.y)
    uniforms.uVelocity.value.set(state.vx, state.vy)
    uniforms.uResolution.value.set(size.width, size.height)
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * Belt-and-suspenders explicit disposal on top of R3F's own unmount
 * cleanup: walks the scene disposing every geometry and material it finds,
 * then disposes the renderer itself and forces the WebGL context to let go
 * of its GPU resources.
 */
function Teardown() {
  const { gl, scene } = useThree()

  useEffect(() => {
    return () => {
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        mesh.geometry?.dispose()
        const material = mesh.material
        if (Array.isArray(material)) material.forEach((m) => m.dispose())
        else material?.dispose()
      })
      gl.dispose()
      gl.forceContextLoss()
    }
  }, [gl, scene])

  return null
}

export function HeroField({ paused, palette }: { paused: boolean; palette: HeroPalette }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      frameloop={paused ? 'never' : 'always'}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <FlowField paused={paused} palette={palette} />
      <Teardown />
    </Canvas>
  )
}
