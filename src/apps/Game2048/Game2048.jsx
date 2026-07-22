import { useCallback, useEffect, useRef, useState } from 'react'
import { sound } from '../../lib/sound'

const SIZE = 4

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addRandomTile(grid) {
  const empties = []
  grid.forEach((row, r) => row.forEach((v, c) => v === 0 && empties.push([r, c])))
  if (empties.length === 0) return grid
  const [r, c] = empties[Math.floor(Math.random() * empties.length)]
  const next = grid.map((row) => [...row])
  next[r][c] = Math.random() < 0.9 ? 2 : 4
  return next
}

function slideRowLeft(row) {
  const vals = row.filter((v) => v !== 0)
  let gained = 0
  for (let i = 0; i < vals.length - 1; i++) {
    if (vals[i] === vals[i + 1]) {
      vals[i] *= 2
      gained += vals[i]
      vals.splice(i + 1, 1)
    }
  }
  while (vals.length < SIZE) vals.push(0)
  return { row: vals, gained }
}

function rotateCW(grid) {
  const next = emptyGrid()
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) next[c][SIZE - 1 - r] = grid[r][c]
  return next
}

function move(grid, dir) {
  // normalize so we always "slide left", rotating grid appropriately
  let rotations = { left: 0, up: 1, right: 2, down: 3 }[dir]
  let g = grid
  for (let i = 0; i < rotations; i++) g = rotateCW(g)

  let moved = false
  let gained = 0
  const result = g.map((row) => {
    const { row: newRow, gained: g2 } = slideRowLeft(row)
    if (newRow.some((v, i) => v !== row[i])) moved = true
    gained += g2
    return newRow
  })

  let final = result
  for (let i = 0; i < (4 - rotations) % 4; i++) final = rotateCW(final)
  return { grid: final, moved, gained }
}

function hasMoves(grid) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true
    }
  return false
}

const TILE_COLORS = {
  0: '#e8d5b5',
  2: '#f2e3c6',
  4: '#f0d9a0',
  8: '#eab976',
  16: '#e2a35a',
  32: '#d98d47',
  64: '#c97b34',
  128: '#b06a2a',
  256: '#a06a30',
  512: '#8a5a2b',
  1024: '#6e4420',
  2048: '#e2711d',
}

export default function Game2048() {
  const [grid, setGrid] = useState(() => addRandomTile(addRandomTile(emptyGrid())))
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('bredos-2048-best') || 0))
  const [over, setOver] = useState(false)
  const boxRef = useRef(null)

  const doMove = useCallback(
    (dir) => {
      if (over) return
      setGrid((g) => {
        const { grid: newGrid, moved, gained } = move(g, dir)
        if (!moved) return g
        sound.click()
        const withTile = addRandomTile(newGrid)
        setScore((s) => {
          const ns = s + gained
          setBest((b) => {
            const nb = Math.max(b, ns)
            localStorage.setItem('bredos-2048-best', String(nb))
            return nb
          })
          return ns
        })
        if (!hasMoves(withTile)) setOver(true)
        return withTile
      })
    },
    [over]
  )

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
      if (map[e.key]) {
        e.preventDefault()
        doMove(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doMove])

  const restart = () => {
    setGrid(addRandomTile(addRandomTile(emptyGrid())))
    setScore(0)
    setOver(false)
  }

  // basic swipe support
  const touch = useRef(null)
  const onTouchStart = (e) => (touch.current = e.touches[0])
  const onTouchEnd = (e) => {
    if (!touch.current) return
    const dx = e.changedTouches[0].clientX - touch.current.clientX
    const dy = e.changedTouches[0].clientY - touch.current.clientY
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left')
    else doMove(dy > 0 ? 'down' : 'up')
    touch.current = null
  }

  return (
    <div
      className="flex flex-col items-center gap-3 p-4 h-full bg-bred-cream outline-none"
      tabIndex={0}
      ref={boxRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center gap-4 w-full max-w-xs justify-between">
        <div className="font-bold text-bred-burnt text-lg">2048 (BredOS)</div>
        <button
          onClick={restart}
          className="px-2 py-1 text-xs rounded border border-bred-crustlight bg-bred-crumb hover:bg-bred-toast/30"
        >
          New Game
        </button>
      </div>
      <div className="flex gap-3 text-xs">
        <Stat label="Score" value={score} />
        <Stat label="Best" value={best} />
      </div>

      <div className="relative bg-[#c9a876] rounded-md p-2" style={{ width: 288, height: 288 }}>
        <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
          {grid.flat().map((v, i) => (
            <div
              key={i}
              className="rounded flex items-center justify-center font-bold text-lg transition-colors"
              style={{
                background: TILE_COLORS[v] || '#e2711d',
                color: v >= 8 ? '#fff4de' : '#5a3418',
              }}
            >
              {v !== 0 && v}
            </div>
          ))}
        </div>
        {over && (
          <div className="absolute inset-0 bg-black/50 rounded-md flex flex-col items-center justify-center gap-2 text-bred-cream">
            <div className="font-bold">Game Over!</div>
            <button
              onClick={restart}
              className="px-3 py-1 text-xs rounded bg-bred-amber hover:bg-bred-toast"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      <div className="text-[10px] text-bred-burnt/60">Use arrow keys or swipe to combine tiles.</div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border border-bred-crustlight rounded px-3 py-1 text-center">
      <div className="text-bred-burnt/60">{label}</div>
      <div className="font-bold text-bred-burnt">{value}</div>
    </div>
  )
}
