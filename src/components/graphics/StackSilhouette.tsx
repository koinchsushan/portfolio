import { TI_FACES, TI_VERTICES } from '@/components/three/truncatedIcosahedron.data'

/**
 * The `static`-tier (and reduced-motion) rendering of the stack object: a
 * pre-baked still of the same truncated icosahedron the interactive tiers
 * build in WebGL, drawn from the same baked vertex/face data but with zero
 * dependency on `three` , pure trigonometry, so this component can render
 * eagerly on every page load without pulling the 3D chunk along with it.
 *
 * No brand marks here (a still image cannot hover-reveal anything anyway):
 * just the object's own geometry, shaded by how square each face sits to
 * the fixed viewing angle, so it reads as a machined part caught at rest
 * rather than an empty outline. The technology names and their context live
 * in the always-rendered accessible controls next to it, and in the
 * permanent `<ul aria-label="Full technology stack">` , this view's job is
 * only to represent the object, never to duplicate that text.
 */

const VIEW_YAW = 0.58
const VIEW_PITCH = -0.36
const VIEW_SIZE = 340
const MARGIN = 28

type Vec3 = readonly [number, number, number]

function rotate([x, y, z]: Vec3): Vec3 {
  const cosYaw = Math.cos(VIEW_YAW)
  const sinYaw = Math.sin(VIEW_YAW)
  const x1 = x * cosYaw + z * sinYaw
  const z1 = -x * sinYaw + z * cosYaw

  const cosPitch = Math.cos(VIEW_PITCH)
  const sinPitch = Math.sin(VIEW_PITCH)
  const y1 = y * cosPitch - z1 * sinPitch
  const z2 = y * sinPitch + z1 * cosPitch

  return [x1, y1, z2]
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function length(a: Vec3): number {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
}

const rotatedVertices = TI_VERTICES.map(rotate)

const RADIUS = Math.max(...rotatedVertices.map(([x, y]) => Math.sqrt(x * x + y * y)))
const SCALE = (VIEW_SIZE / 2 - MARGIN) / RADIUS
const CENTER = VIEW_SIZE / 2

function project([x, y]: Vec3): [number, number] {
  return [CENTER + x * SCALE, CENTER - y * SCALE]
}

interface VisibleFace {
  points: string
  shade: number
}

const visibleFaces: VisibleFace[] = TI_FACES.map((indices) => {
  const verts = indices.map((i) => rotatedVertices[i])
  const edge1 = subtract(verts[1], verts[0])
  const edge2 = subtract(verts[2], verts[0])
  const normal = cross(edge1, edge2)
  const normalLength = length(normal) || 1
  const facing = normal[2] / normalLength
  return { verts, facing }
})
  .filter(({ facing }) => facing > 0)
  .map(({ verts, facing }) => ({
    points: verts.map((v) => project(v).join(',')).join(' '),
    shade: facing,
  }))

export function StackSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      {visibleFaces.map((face, i) => (
        <polygon
          key={i}
          points={face.points}
          fill={`color-mix(in srgb, var(--color-bone) ${Math.round(face.shade * 42)}%, var(--color-panel))`}
          stroke="var(--color-grid)"
          strokeOpacity={0.8}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
