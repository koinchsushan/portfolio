'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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

/** Texture pixels for a wordmark face. 2:1, the same proportion as the plane
 *  it is mapped onto, so nothing is stretched. */
const LABEL_TEXTURE_WIDTH = 512
const LABEL_TEXTURE_HEIGHT = 256
/** The label's footprint and type size, relative to the face, carried over
 *  unchanged from the drei `Text` it replaces (maxWidth 1.7r, fontSize 0.34r). */
const LABEL_WIDTH_RATIO = 1.7
const LABEL_FONT_RATIO = 0.34

/** The site's mono family, read from the live `--font-mono` token the way the
 *  palette is read, so the object never names a typeface of its own. */
function readMonoFamily(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--font-mono').trim() || 'monospace'
}

/**
 * The two faces with no brand mark (Single-SPA, Matplotlib) used to be drawn by
 * drei's `Text`, which is troika underneath. For two words that meant: about
 * 56 KB gz of troika in this chunk, web workers booted on first view, four
 * font files fetched from cdn.jsdelivr.net (a third-party request the reader
 * never agreed to), glyph SDFs generated in those workers, and a second long
 * task of about 240ms landing after the object was already on screen.
 *
 * A 2D canvas does the same job synchronously, in the site's own Spline Sans
 * Mono (already loaded by the page, verified by pixel comparison against the
 * generic monospace fallback), with no worker and no network. The text is
 * painted in white as a mask and tinted by the material's colour, so the face
 * still renders in exactly `--label`, or `--signal` when lifted, and no white
 * ever reaches the screen.
 */
function createLabelTexture(text: string, family: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = LABEL_TEXTURE_WIDTH
  canvas.height = LABEL_TEXTURE_HEIGHT
  const texture = new THREE.CanvasTexture(canvas)

  const draw = () => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Type size as a share of the plane's height, then shrunk to fit on one
    // line: a wordmark wrapping at its hyphen reads as two words on a face.
    const planeHeightInFontUnits = LABEL_WIDTH_RATIO / 2 / LABEL_FONT_RATIO
    let size = canvas.height / planeHeightInFontUnits
    ctx.font = `400 ${size}px ${family}`
    const available = canvas.width * 0.94
    const measured = ctx.measureText(text).width
    if (measured > available) {
      size *= available / measured
      ctx.font = `400 ${size}px ${family}`
    }
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
    texture.needsUpdate = true
  }

  draw()
  // If the face is built before the webfont has finished loading (a deep link
  // straight to this section), draw again the moment it has, rather than
  // leaving the label in a fallback face for the rest of the visit.
  const spec = `400 64px ${family}`
  if (!document.fonts.check(spec)) void document.fonts.load(spec).then(draw)

  return texture
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

  const labelPlane = useMemo(() => new THREE.PlaneGeometry(1, 1), [])
  const labelTextures = useMemo(() => {
    const family = readMonoFamily()
    const map = new Map<number, THREE.CanvasTexture>()
    for (const { layout, content, icon } of faceData) {
      if (content && !icon) map.set(layout.index, createLabelTexture(content.label ?? content.skill, family))
    }
    return map
  }, [faceData])

  useEffect(() => {
    return () => {
      for (const geometry of iconGeometries.values()) geometry.dispose()
      for (const geometry of hitGeometries) geometry.dispose()
      // Material disposal (Teardown) does not release a material's map.
      for (const texture of labelTextures.values()) texture.dispose()
      labelPlane.dispose()
    }
  }, [iconGeometries, hitGeometries, labelTextures, labelPlane])

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
              <mesh
                geometry={labelPlane}
                scale={[layout.radius * LABEL_WIDTH_RATIO, (layout.radius * LABEL_WIDTH_RATIO) / 2, 1]}
                position={[0, 0, 0.001]}
              >
                <meshBasicMaterial
                  map={labelTextures.get(layout.index)}
                  color={color}
                  side={THREE.DoubleSide}
                  transparent
                  depthWrite={false}
                />
              </mesh>
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

/**
 * Turns off R3F's scroll tracking for this canvas, and with it the scroll
 * debounce that was the main reason the object appeared late.
 *
 * R3F sizes a canvas with react-use-measure, debounced 50ms on scroll by
 * default, and react-use-measure routes its ResizeObserver through that same
 * debounced function, so every scroll event pushes the measurement back again.
 * No measured size means no renderer: R3F does not create one until it knows
 * the canvas has a size. During a steady scroll the measurement never settled,
 * so an object mounted a screenful early still had no renderer until the reader
 * stopped. Measured on a production build by logging WebGL calls: three's
 * renderer allocated its first textures 287ms (real GPU) to 423ms (SwiftShader)
 * after the object reached the viewport, about 50ms after the scroll ended, and
 * every compile and draw followed it.
 *
 * Nothing here needs scroll tracking. R3F maps the pointer from
 * `offsetX`/`offsetY`, which are relative to the canvas and unaffected by page
 * scroll, and `StackScene`'s tilt reads a live `getBoundingClientRect()`.
 */
const CANVAS_RESIZE = { scroll: false, debounce: 0 }

/** If warm-up has not finished by now (a lost context, a driver that never
 *  reports a program ready), give up on it and render normally. The silhouette
 *  underneath means the worst case is today's behaviour, never a blank box. */
const WARM_UP_TIMEOUT_MS = 2500

/**
 * Compiles every shader and draws the first frame while the section is still
 * below the fold, then hands control of the loop back to `paused`.
 *
 * `StackCanvas` mounts this object a screenful early, and `CANVAS_RESIZE` below
 * lets the renderer actually exist by then. That is still not enough on its
 * own: a paused canvas (`frameloop="never"`) renders nothing, so without this
 * the shaders would compile, and the first frame would draw, only once the
 * object reached the viewport.
 *
 * The loop stays at `never` until this finishes, deliberately: an `always` loop
 * would render straight away, and the first render compiles every program
 * synchronously on the main thread, which is the long task this exists to move.
 * `compileAsync` uses KHR_parallel_shader_compile where the browser has it, so
 * the compile happens off the main thread too; then one frame is drawn by hand,
 * uploading geometry and label textures, and the object is ready before anyone
 * looks at it.
 */
function WarmUp({ onWarm }: { onWarm: () => void }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const advance = useThree((state) => state.advance)

  useEffect(() => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      onWarm()
    }
    const timeout = window.setTimeout(finish, WARM_UP_TIMEOUT_MS)

    gl.compileAsync(scene, camera)
      .then(() => {
        if (done) return
        advance(performance.now())
        finish()
      })
      .catch(finish)

    return () => {
      done = true
      window.clearTimeout(timeout)
    }
  }, [gl, scene, camera, advance, onWarm])

  return null
}

export function StackObject(props: StackObjectProps) {
  const [warmed, setWarmed] = useState(false)
  const handleWarm = useMemo(() => () => setWarmed(true), [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      frameloop={warmed && !props.paused ? 'always' : 'never'}
      resize={CANVAS_RESIZE}
      camera={{ position: [0, 0, 3.1], fov: 34 }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <StackScene {...props} />
      {!warmed && <WarmUp onWarm={handleWarm} />}
      <Teardown />
    </Canvas>
  )
}
