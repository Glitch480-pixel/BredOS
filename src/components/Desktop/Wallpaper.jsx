import { useMemo } from 'react'
import { renderVoxelFaces, getSceneBounds } from '../../lib/voxelBread'

export const WALLPAPERS = [
  { id: 'voxel-bread', label: 'Voxel Bread Hills (default)' },
  { id: 'toast-sunset', label: 'Toast Sunset (solid gradient)' },
  { id: 'amber-fields', label: 'Amber Fields (solid gradient)' },
  { id: 'plain-brown', label: 'Plain Brown' },
]

function VoxelBreadHero() {
  const faces = useMemo(() => renderVoxelFaces(), [])
  const bounds = useMemo(() => getSceneBounds(), [])
  // Generous padding keeps the whole scene (sky, sun, rolling hills, loaf)
  // in view across common wide desktop aspect ratios instead of the SVG
  // "slice" scaling zooming in until only the tallest object is visible.
  const padX = bounds.width * 0.45
  const padTop = bounds.height * 0.55
  const padBottom = bounds.height * 0.03
  const vb = `${bounds.minX - padX} ${bounds.minY - padTop} ${bounds.width + padX * 2} ${
    bounds.height + padTop + padBottom
  }`

  return (
    <div className="absolute inset-0 overflow-hidden bred-fade-in">
      {/* sky */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #ffb35c 0%, #f2874a 32%, #d9642f 55%, #a8461f 78%, #6b2c14 100%)',
        }}
      />
      {/* sun */}
      <div
        className="absolute rounded-full bred-toast-glow"
        style={{
          width: 180,
          height: 180,
          top: '10%',
          left: '68%',
          background: 'radial-gradient(circle, #fff4de 0%, #ffd98a 35%, #f2a03d 70%, transparent 100%)',
        }}
      />
      {/* soft clouds */}
      <div className="absolute top-[14%] left-[10%] w-40 h-8 bg-[#fff1d6] opacity-40 rounded-full blur-sm" />
      <div className="absolute top-[20%] left-[22%] w-28 h-6 bg-[#fff1d6] opacity-30 rounded-full blur-sm" />

      {/* voxel scene */}
      <svg
        viewBox={vb}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.35))' }}
      >
        {faces.map((f) => (
          <polygon key={f.key} points={f.pts.map((p) => p.join(',')).join(' ')} fill={f.fill} />
        ))}
      </svg>
    </div>
  )
}

function GradientWallpaper({ from, via, to }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(160deg, ${from}, ${via}, ${to})` }}
    />
  )
}

export default function Wallpaper({ id }) {
  switch (id) {
    case 'toast-sunset':
      return <GradientWallpaper from="#f2a03d" via="#c9642f" to="#5a3418" />
    case 'amber-fields':
      return <GradientWallpaper from="#e2711d" via="#8a5a2b" to="#3e2110" />
    case 'plain-brown':
      return <GradientWallpaper from="#6b4226" via="#5a3418" to="#3e2110" />
    case 'voxel-bread':
    default:
      return <VoxelBreadHero />
  }
}
