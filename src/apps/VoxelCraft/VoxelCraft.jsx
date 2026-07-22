import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Voxel Craft — an original, from-scratch blocky sandbox built directly on
// three.js. It is NOT Minecraft and ships no Minecraft assets, textures, or
// code; it's an original low-poly "place/break cubes and walk around" demo
// in the spirit of block-building sandboxes, using an orange/brown BredOS
// block palette ("Toast", "Crust", "Crumb", "Char").

const BLOCK_TYPES = [
  { id: 'toast', label: 'Toast', color: 0xe2711d },
  { id: 'crust', label: 'Crust', color: 0x8a5a2b },
  { id: 'crumb', label: 'Crumb', color: 0xf0d9a0 },
  { id: 'char', label: 'Char', color: 0x3e2110 },
]

const WORLD_SIZE = 10 // half-extent in blocks (world spans -SIZE..SIZE)
const EYE_HEIGHT = 1.7
const MOVE_SPEED = 5.5
const GRAVITY = 18
const JUMP_SPEED = 7

function key(x, y, z) {
  return `${x},${y},${z}`
}

function terrainHeight(x, z) {
  const h =
    3 +
    Math.sin(x / 3.2) * 1.4 +
    Math.cos(z / 3.6) * 1.4 +
    Math.sin((x + z) / 5) * 0.8
  return Math.max(1, Math.min(7, Math.round(h)))
}

function blockColorForLayer(y, height) {
  if (y === 0) return 'char'
  if (y === height - 1) return 'toast'
  return 'crust'
}

export default function VoxelCraft() {
  const mountRef = useRef(null)
  const [locked, setLocked] = useState(false)
  const [selected, setSelected] = useState(0)
  const [blockCount, setBlockCount] = useState(0)
  const stateRef = useRef({ selected: 0 })

  useEffect(() => {
    stateRef.current.selected = selected
  }, [selected])

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf2a03d)
    scene.fog = new THREE.Fog(0xf2a03d, 20, 60)

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 200)
    camera.position.set(0, terrainHeight(0, 0) + EYE_HEIGHT, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const hemi = new THREE.HemisphereLight(0xfff4de, 0x3e2110, 1.1)
    scene.add(hemi)
    const sun = new THREE.DirectionalLight(0xffe3b0, 0.9)
    sun.position.set(10, 20, 10)
    scene.add(sun)

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const materials = {}
    for (const b of BLOCK_TYPES) materials[b.id] = new THREE.MeshLambertMaterial({ color: b.color })
    const highlightMat = new THREE.LineBasicMaterial({ color: 0xfff4de })

    const blocks = new Map() // "x,y,z" -> mesh
    const group = new THREE.Group()
    scene.add(group)

    function addBlock(x, y, z, type, persist = true) {
      const k = key(x, y, z)
      if (blocks.has(k)) return
      const mesh = new THREE.Mesh(geometry, materials[type])
      mesh.position.set(x, y, z)
      mesh.userData = { x, y, z, type }
      group.add(mesh)
      blocks.set(k, mesh)
      if (persist) setBlockCount(blocks.size)
    }
    function removeBlock(x, y, z) {
      const k = key(x, y, z)
      const mesh = blocks.get(k)
      if (!mesh) return
      group.remove(mesh)
      blocks.delete(k)
      setBlockCount(blocks.size)
    }

    for (let x = -WORLD_SIZE; x <= WORLD_SIZE; x++) {
      for (let z = -WORLD_SIZE; z <= WORLD_SIZE; z++) {
        const h = terrainHeight(x, z)
        for (let y = 0; y < h; y++) {
          addBlock(x, y, z, blockColorForLayer(y, h), false)
        }
      }
    }
    setBlockCount(blocks.size)

    // highlight box for targeted block
    const highlightGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.02, 1.02, 1.02))
    const highlight = new THREE.LineSegments(highlightGeo, highlightMat)
    highlight.visible = false
    scene.add(highlight)

    // ---- pointer lock + movement ----
    const canvas = renderer.domElement
    const yawObj = new THREE.Object3D()
    const pitchObj = new THREE.Object3D()
    yawObj.add(pitchObj)
    scene.add(yawObj)
    let yaw = 0
    let pitch = 0

    const keys = {}
    let velocityY = 0
    let onGround = false

    const onKeyDown = (e) => {
      keys[e.code] = true
      const n = Number(e.key)
      if (n >= 1 && n <= BLOCK_TYPES.length) setSelected(n - 1)
    }
    const onKeyUp = (e) => (keys[e.code] = false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const onMouseMove = (e) => {
      if (document.pointerLockElement !== canvas) return
      yaw -= e.movementX * 0.0022
      pitch -= e.movementY * 0.0022
      pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch))
    }
    document.addEventListener('mousemove', onMouseMove)

    const raycaster = new THREE.Raycaster()

    const onMouseDown = (e) => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock()
        return
      }
      raycaster.setFromCamera({ x: 0, y: 0 }, camera)
      const hits = raycaster.intersectObjects(group.children)
      if (hits.length === 0) return
      const hit = hits[0]
      const { x, y, z } = hit.object.userData
      if (e.button === 0) {
        removeBlock(x, y, z)
      } else if (e.button === 2) {
        const n = hit.face.normal
        const nx = x + Math.round(n.x)
        const ny = y + Math.round(n.y)
        const nz = z + Math.round(n.z)
        const camBlock = {
          x: Math.round(camera.position.x),
          y: Math.round(camera.position.y - 1),
          z: Math.round(camera.position.z),
        }
        if (nx === camBlock.x && ny === camBlock.y && nz === camBlock.z) return
        addBlock(nx, ny, nz, BLOCK_TYPES[stateRef.current.selected].id)
      }
    }
    canvas.addEventListener('mousedown', onMouseDown)
    const onContextMenu = (e) => e.preventDefault()
    canvas.addEventListener('contextmenu', onContextMenu)

    const onPointerLockChange = () => setLocked(document.pointerLockElement === canvas)
    document.addEventListener('pointerlockchange', onPointerLockChange)

    const clock = new THREE.Clock()

    function groundHeightAt(x, z) {
      let top = -1
      for (let y = 12; y >= 0; y--) {
        if (blocks.has(key(Math.round(x), y, Math.round(z)))) {
          top = y
          break
        }
      }
      return top
    }

    let raf
    function animate() {
      raf = requestAnimationFrame(animate)
      const dt = Math.min(0.05, clock.getDelta())

      camera.rotation.order = 'YXZ'
      camera.rotation.y = yaw
      camera.rotation.x = pitch

      const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))
      const move = new THREE.Vector3()
      if (keys['KeyW']) move.add(forward)
      if (keys['KeyS']) move.sub(forward)
      if (keys['KeyD']) move.add(right)
      if (keys['KeyA']) move.sub(right)
      if (move.lengthSq() > 0) move.normalize().multiplyScalar(MOVE_SPEED * dt)

      const groundY = groundHeightAt(camera.position.x, camera.position.z)
      const feetTarget = groundY + 1
      onGround = camera.position.y - EYE_HEIGHT <= feetTarget + 0.05

      if (onGround) {
        velocityY = 0
        if (keys['Space']) velocityY = JUMP_SPEED
        camera.position.y = feetTarget + EYE_HEIGHT
      } else {
        velocityY -= GRAVITY * dt
      }
      camera.position.x += move.x
      camera.position.z += move.z
      camera.position.y += velocityY * dt

      const gy = groundHeightAt(camera.position.x, camera.position.z)
      if (camera.position.y - EYE_HEIGHT < gy + 1) {
        camera.position.y = gy + 1 + EYE_HEIGHT
        velocityY = 0
      }

      const bound = WORLD_SIZE - 0.5
      camera.position.x = Math.max(-bound, Math.min(bound, camera.position.x))
      camera.position.z = Math.max(-bound, Math.min(bound, camera.position.z))

      raycaster.setFromCamera({ x: 0, y: 0 }, camera)
      const hits = raycaster.intersectObjects(group.children)
      if (hits.length > 0 && hits[0].distance < 8) {
        const { x, y, z } = hits[0].object.userData
        highlight.position.set(x, y, z)
        highlight.visible = true
      } else {
        highlight.visible = false
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('contextmenu', onContextMenu)
      if (document.pointerLockElement === canvas) document.exitPointerLock()
      renderer.dispose()
      geometry.dispose()
      Object.values(materials).forEach((m) => m.dispose())
      highlightGeo.dispose()
      highlightMat.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={mountRef} className="w-full h-full" />

      {/* crosshair */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 border border-bred-cream/80 rounded-full" />
      </div>

      {/* hotbar */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BLOCK_TYPES.map((b, i) => (
          <div
            key={b.id}
            className={`w-9 h-9 rounded border-2 flex items-center justify-center text-[9px] font-bold text-bred-cream ${
              i === selected ? 'border-bred-cream' : 'border-bred-cream/30'
            }`}
            style={{ background: `#${b.color.toString(16).padStart(6, '0')}` }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute top-2 left-2 text-[10px] text-bred-cream bg-black/40 rounded px-2 py-1">
        Blocks: {blockCount}
      </div>

      {!locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-bred-cream text-center px-6">
          <div>
            <div className="text-xl font-bold mb-2">Voxel Craft</div>
            <div className="text-sm mb-4">Click to look around and start building.</div>
            <div className="text-xs opacity-80 leading-relaxed">
              WASD move · Mouse look · Space jump
              <br />
              Left-click break · Right-click place · 1-4 select block · Esc to release mouse
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
