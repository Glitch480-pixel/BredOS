// Procedural isometric "voxel" scene generator, rendered as SVG polygons.
// Used for the desktop wallpaper hero (an original blocky loaf of bread on a
// landscape) — no textures, no external assets, just math + <polygon>.

const TILE_W = 28
const TILE_H = 14
const VOX_H = 16

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255
  let g = (n >> 8) & 255
  let b = n & 255
  r = clamp(Math.round(r + amt), 0, 255)
  g = clamp(Math.round(g + amt), 0, 255)
  b = clamp(Math.round(b + amt), 0, 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// project the "top" anchor point of a voxel sitting at grid (col,row) and
// height level `level` (i.e. its top face is level*VOX_H above ground)
function anchor(col, row, level) {
  const x = (col - row) * (TILE_W / 2)
  const y = (col + row) * (TILE_H / 2) - level * VOX_H
  return { x, y }
}

function voxelFaces(col, row, level, color) {
  const { x: ox, y: oy } = anchor(col, row, level)
  const topColor = color
  const leftColor = shade(color, -28)
  const rightColor = shade(color, -10)
  const top = [
    [ox, oy - TILE_H / 2],
    [ox + TILE_W / 2, oy],
    [ox, oy + TILE_H / 2],
    [ox - TILE_W / 2, oy],
  ]
  const left = [
    [ox - TILE_W / 2, oy],
    [ox, oy + TILE_H / 2],
    [ox, oy + TILE_H / 2 + VOX_H],
    [ox - TILE_W / 2, oy + VOX_H],
  ]
  const right = [
    [ox, oy + TILE_H / 2],
    [ox + TILE_W / 2, oy],
    [ox + TILE_W / 2, oy + VOX_H],
    [ox, oy + TILE_H / 2 + VOX_H],
  ]
  return [
    { pts: left, fill: leftColor },
    { pts: right, fill: rightColor },
    { pts: top, fill: topColor },
  ]
}

const GROUND_W = 30
const GROUND_D = 17

const GROUND_LOW = '#4a2a13'
const GROUND_MID = '#8a5a2b'
const GROUND_HIGH = '#c9903c'
const GROUND_PEAK = '#e8c07d'

function groundHeight(col, row) {
  const rolling =
    0.9 * Math.sin(col / 4.1) * Math.cos(row / 3.4) +
    0.5 * Math.sin(col / 2.2 + row / 5)
  const h = Math.round(1 + rolling)
  return clamp(h, 0, 2)
}

function groundColor(h) {
  if (h <= 0) return GROUND_LOW
  if (h === 1) return GROUND_MID
  if (h === 2) return GROUND_HIGH
  return GROUND_PEAK
}

// Loaf footprint & shrink-per-level table to fake a rounded top.
const LOAF_CENTER_COL = Math.round(GROUND_W / 2)
const LOAF_CENTER_ROW = Math.round(GROUND_D / 2)
const LOAF_BASE_LEVEL = 3
// A squat, wide loaf reads better than a tall tower: mostly straight sides,
// then a quick round-over into a pale "sliced" crust on top.
const LOAF_LAYERS = [
  { shrinkX: 0, shrinkZ: 0, color: '#6b4022' },
  { shrinkX: 0, shrinkZ: 0, color: '#7a4a26' },
  { shrinkX: 1, shrinkZ: 0, color: '#8f5a2c' },
  { shrinkX: 2, shrinkZ: 1, color: '#c98a42' },
  { shrinkX: 3, shrinkZ: 1, color: '#f2dfae' }, // sliced-open cream top
]
const LOAF_HALF_W = 6
const LOAF_HALF_D = 3

function buildVoxels() {
  const voxels = []

  for (let row = 0; row < GROUND_D; row++) {
    for (let col = 0; col < GROUND_W; col++) {
      const dxLoaf = Math.abs(col - LOAF_CENTER_COL)
      const dzLoaf = Math.abs(row - LOAF_CENTER_ROW)
      const underLoaf = dxLoaf <= LOAF_HALF_W + 1 && dzLoaf <= LOAF_HALF_D + 1
      const h = underLoaf ? LOAF_BASE_LEVEL - 1 : groundHeight(col, row)
      const color = underLoaf ? '#b9793a' : groundColor(h)
      for (let lvl = 0; lvl <= h; lvl++) {
        voxels.push({ col, row, level: lvl, color, key: `g${col}_${row}_${lvl}` })
      }
    }
  }

  LOAF_LAYERS.forEach((layer, i) => {
    const level = LOAF_BASE_LEVEL + i
    const halfW = LOAF_HALF_W - layer.shrinkX
    const halfD = LOAF_HALF_D - layer.shrinkZ
    if (halfW < 0 || halfD < 0) return
    for (let row = LOAF_CENTER_ROW - halfD; row <= LOAF_CENTER_ROW + halfD; row++) {
      for (let col = LOAF_CENTER_COL - halfW; col <= LOAF_CENTER_COL + halfW; col++) {
        voxels.push({
          col,
          row,
          level,
          color: layer.color,
          key: `l${col}_${row}_${level}`,
        })
      }
    }
  })

  voxels.sort((a, b) => {
    const da = a.col + a.row
    const db = b.col + b.row
    if (da !== db) return da - db
    return a.level - b.level
  })

  return voxels
}

export const BREAD_VOXELS = buildVoxels()

export function getSceneBounds() {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity
  for (const v of BREAD_VOXELS) {
    const { x, y } = anchor(v.col, v.row, v.level)
    minX = Math.min(minX, x - TILE_W / 2)
    maxX = Math.max(maxX, x + TILE_W / 2)
    minY = Math.min(minY, y - TILE_H / 2)
    maxY = Math.max(maxY, y + TILE_H / 2 + VOX_H)
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
}

export function renderVoxelFaces() {
  const faces = []
  for (const v of BREAD_VOXELS) {
    const vf = voxelFaces(v.col, v.row, v.level, v.color)
    for (const f of vf) faces.push({ ...f, key: `${v.key}_${f.fill}` })
  }
  return faces
}
