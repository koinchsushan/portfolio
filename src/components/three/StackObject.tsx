'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import * as THREE from 'three'
import { TI_FACES, TI_VERTICES } from './truncatedIcosahedron.data'
import { stackFaces } from '@/content/stackFaces'
import {
  siAngular,
  siAntdesign,
  siChartdotjs,
  siClaudecode,
  siDocker,
  siEslint,
  siFigma,
  siFirebase,
  siFlask,
  siFlutter,
  siGit,
  siGithubactions,
  siGitlab,
  siGraphql,
  siJavascript,
  siJest,
  siMui,
  siNextdotjs,
  siNodedotjs,
  siPandas,
  siPython,
  siReact,
  siRedux,
  siScikitlearn,
  siStripe,
  siStyledcomponents,
  siTailwindcss,
  siTestinglibrary,
  siTypescript,
  siVitest,
} from 'simple-icons'

/**
 * The palette arrives as resolved CSS colour strings from `StackCanvas`,
 * which reads the custom properties before mounting this canvas, exactly the
 * pattern `HeroCanvas` uses for the hero shader. Nothing in this file names a
 * colour.
 */
export interface StackPalette {
  label: string
  bone: string
  signal: string
  panel: string
  grid: string
}

export type StackMode = 'full' | 'lite'

export interface StackObjectProps {
  paused: boolean
  palette: StackPalette
  mode: StackMode
  /** The face currently pinned open (by click, tap or Enter). */
  activeIndex: number | null
  /** The face currently under the pointer. `full` mode only. */
  hoveredIndex: number | null
  /** Cumulative manual rotation nudge from the keyboard arrow keys, radians. */
  rotationOffset: { x: number; y: number }
  onHoverFace: (index: number | null) => void
  onSelectFace: (index: number) => void
}

/** Named `simple-icons` export per icon key used in `stackFaces`. Only the
 * keys the content actually references are imported, so nothing else in the
 * 3459-icon package rides along. */
const ICONS: Record<string, { path: string }> = {
  siTypescript,
  siPython,
  siReact,
  siRedux,
  siChartdotjs,
  siFlutter,
  siMui,
  siAntdesign,
  siStyledcomponents,
  siFigma,
  siFlask,
  siClaudecode,
  siFirebase,
  siJest,
  siTestinglibrary,
  siGitlab,
  siGit,
  siPandas,
  siJavascript,
  siNextdotjs,
  siAngular,
  siTailwindcss,
  siNodedotjs,
  siGraphql,
  siDocker,
  siStripe,
  siVitest,
  siEslint,
  siGithubactions,
  siScikitlearn,
}

const FACE_EPSILON = 0.012
const ICON_FILL_RATIO = 0.62
const AMBIENT_DRIFT_RADIANS_PER_SECOND = 0.045
const TILT_SPRING_RATE = 3.4
const TILT_MAX_RADIANS = 0.22

interface FaceLayout {
  index: number
  centroid: THREE.Vector3
  normal: THREE.Vector3
  u: THREE.Vector3
  v: THREE.Vector3
  radius: number
}

/** Pure geometry, computed once from the baked vertex/face data: centroid,
 * outward normal and an in-plane basis for every one of the 32 faces. No
 * GPU resource here, just plain vectors, so it needs no disposal. */
const FACE_LAYOUT: FaceLayout[] = TI_FACES.map((indices, index) => {
  const verts = indices.map((i) => new THREE.Vector3(...TI_VERTICES[i]))
  const centroid = verts.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(verts.length)
  const normal = new THREE.Vector3()
    .subVectors(verts[1], verts[0])
    .cross(new THREE.Vector3().subVectors(verts[2], verts[0]))
    .normalize()
  if (normal.dot(centroid) < 0) normal.negate()
  const u = new THREE.Vector3().subVectors(verts[0], centroid).normalize()
  const v = new THREE.Vector3().crossVectors(normal, u).normalize()
  const radius = verts.reduce((sum, p) => sum + p.distanceTo(centroid), 0) / verts.length
  return { index, centroid, normal, u, v, radius }
})

function buildSolidGeometry(): THREE.BufferGeometry {
  const positions = new Float32Array(TI_VERTICES.length * 3)
  TI_VERTICES.forEach(([x, y, z], i) => positions.set([x, y, z], i * 3))
  const index: number[] = []
  for (const face of TI_FACES) {
    for (let k = 1; k < face.length - 1; k++) index.push(face[0], face[k], face[k + 1])
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(index)
  geometry.computeVertexNormals()
  return geometry
}

/** Parses one `simple-icons` path string (24x24 viewBox) into a flat,
 * centred, unit-sized geometry. Real brand path data only, per the brief ,
 * nothing here draws or approximates a mark. */
function iconPathToGeometry(pathData: string): THREE.BufferGeometry {
  const loader = new SVGLoader()
  const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${pathData}"/></svg>`
  const { paths } = loader.parse(svgText)
  const shapes = paths.flatMap((path) => path.toShapes())
  const geometry = new THREE.ShapeGeometry(shapes)
  geometry.computeBoundingBox()
  const box = geometry.boundingBox as THREE.Box3
  const center = new THREE.Vector3()
  box.getCenter(center)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDimension = Math.max(size.x, size.y) || 1
  geometry.translate(-center.x, -center.y, 0)
  // SVG's y axis points down; flip it here once so every consumer of this
  // geometry gets an icon that reads right-way-up in three's y-up space.
  geometry.scale(1 / maxDimension, -1 / maxDimension, 1)
  return geometry
}

function StackScene({ paused, palette, mode, activeIndex, hoveredIndex, rotationOffset, onHoverFace, onSelectFace }: StackObjectProps) {
  const { gl } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const driftRef = useRef(0)
  const tiltRef = useRef({ x: 0, y: 0 })
  const pointerTargetRef = useRef({ x: 0, y: 0 })
  const rotationOffsetRef = useRef(rotationOffset)

  useEffect(() => {
    rotationOffsetRef.current = rotationOffset
  }, [rotationOffset])

  useEffect(() => {
    if (mode !== 'full') return
    const handlePointerMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      pointerTargetRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
      }
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [gl, mode])

  useFrame((_, delta) => {
    if (paused) return
    driftRef.current += delta * AMBIENT_DRIFT_RADIANS_PER_SECOND

    if (mode === 'full') {
      const springK = 1 - Math.exp(-TILT_SPRING_RATE * delta)
      const targetX = pointerTargetRef.current.y * TILT_MAX_RADIANS
      const targetY = pointerTargetRef.current.x * TILT_MAX_RADIANS
      tiltRef.current.x += (targetX - tiltRef.current.x) * springK
      tiltRef.current.y += (targetY - tiltRef.current.y) * springK
    }

    const group = groupRef.current
    if (!group) return
    group.rotation.y = driftRef.current + tiltRef.current.y + rotationOffsetRef.current.y
    group.rotation.x = tiltRef.current.x + rotationOffsetRef.current.x
  })

  const solidGeometry = useMemo(() => buildSolidGeometry(), [])
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(solidGeometry, 1), [solidGeometry])

  const faceData = useMemo(
    () =>
      FACE_LAYOUT.map((layout) => {
        const content = stackFaces[layout.index]
        const icon = content?.icon ? ICONS[content.icon] : undefined
        return { layout, content, icon }
      }),
    [],
  )

  const iconGeometries = useMemo(() => {
    const map = new Map<number, THREE.BufferGeometry>()
    for (const { layout, icon } of faceData) {
      if (icon) map.set(layout.index, iconPathToGeometry(icon.path))
    }
    return map
  }, [faceData])

  const hitGeometries = useMemo(
    () => faceData.map(({ layout }) => new THREE.CircleGeometry(layout.radius * 0.92, 24)),
    [faceData],
  )

  useEffect(() => {
    return () => {
      for (const geometry of iconGeometries.values()) geometry.dispose()
      for (const geometry of hitGeometries) geometry.dispose()
    }
  }, [iconGeometries, hitGeometries])

  const labelColor = palette.label
  const liftedColor = palette.signal

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2.4, 3.1, 4]} intensity={0.85} />
      <directionalLight position={[-2.2, -1.4, -3]} intensity={0.3} />

      <mesh geometry={solidGeometry}>
        <meshStandardMaterial color={palette.panel} flatShading roughness={0.6} metalness={0.12} />
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={palette.grid} transparent opacity={0.65} />
      </lineSegments>

      {faceData.map(({ layout, content, icon }, i) => {
        if (!content) return null
        const quaternion = new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(layout.u, layout.v, layout.normal),
        )
        const position = layout.centroid.clone().addScaledVector(layout.normal, FACE_EPSILON)
        const isActive = activeIndex === i || hoveredIndex === i
        const color = isActive ? liftedColor : labelColor

        const handlePointerOver = (event: { stopPropagation: () => void }) => {
          event.stopPropagation()
          if (mode === 'full') onHoverFace(i)
        }
        const handlePointerOut = (event: { stopPropagation: () => void }) => {
          event.stopPropagation()
          if (mode === 'full') onHoverFace(null)
        }
        const handleClick = (event: { stopPropagation: () => void }) => {
          event.stopPropagation()
          onSelectFace(i)
        }

        return (
          <group key={content.skill} position={position} quaternion={quaternion}>
            <mesh
              geometry={hitGeometries[i]}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
              onClick={handleClick}
            >
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {icon ? (
              <mesh geometry={iconGeometries.get(layout.index)} scale={layout.radius * ICON_FILL_RATIO} position={[0, 0, 0.001]}>
                <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent />
              </mesh>
            ) : (
              <Suspense fallback={null}>
                <Text
                  fontSize={layout.radius * 0.34}
                  color={color}
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={layout.radius * 1.7}
                  textAlign="center"
                  position={[0, 0, 0.001]}
                >
                  {content.label ?? content.skill}
                </Text>
              </Suspense>
            )}
          </group>
        )
      })}
    </group>
  )
}

/**
 * Belt-and-suspenders explicit disposal on top of R3F's own unmount cleanup,
 * the same shape as `HeroField`'s `Teardown`: walks the scene disposing
 * every geometry and material it finds, then disposes the renderer and
 * forces the WebGL context to let go of its GPU resources.
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

export function StackObject(props: StackObjectProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      frameloop={props.paused ? 'never' : 'always'}
      camera={{ position: [0, 0, 3.1], fov: 34 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <StackScene {...props} />
      <Teardown />
    </Canvas>
  )
}
