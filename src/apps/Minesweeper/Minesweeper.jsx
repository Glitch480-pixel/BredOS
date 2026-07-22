import { useCallback, useMemo, useState } from 'react'
import { sound } from '../../lib/sound'

const DIFFICULTIES = {
  Easy: { rows: 9, cols: 9, mines: 10 },
  Medium: { rows: 12, cols: 12, mines: 24 },
  Hard: { rows: 14, cols: 18, mines: 40 },
}

function makeBoard(rows, cols, mines, safeR, safeC) {
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      r,
      c,
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  )
  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (cells[r][c].mine) continue
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue
    cells[r][c].mine = true
    placed++
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (cells[r][c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr,
            nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr][nc].mine) count++
        }
      cells[r][c].adjacent = count
    }
  return cells
}

const NUM_COLORS = ['', '#2456c9', '#1c7a2e', '#c92424', '#5a2ac9', '#8a3a10', '#1a8a8a', '#333', '#777']

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState('Easy')
  const cfg = DIFFICULTIES[difficulty]
  const [board, setBoard] = useState(null)
  const [status, setStatus] = useState('ready') // ready | playing | won | lost
  const [flagsUsed, setFlagsUsed] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  const startGame = () => {
    setBoard(null)
    setStatus('ready')
    setFlagsUsed(0)
    setElapsed(0)
    setStartTime(null)
  }

  useMemo(() => {
    if (status !== 'playing') return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, startTime])

  const revealFlood = (cells, r, c) => {
    const stack = [[r, c]]
    while (stack.length) {
      const [cr, cc] = stack.pop()
      const cell = cells[cr][cc]
      if (cell.revealed || cell.flagged) continue
      cell.revealed = true
      if (cell.adjacent === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = cr + dr,
              nc = cc + dc
            if (nr >= 0 && nr < cells.length && nc >= 0 && nc < cells[0].length) {
              if (!cells[nr][nc].revealed) stack.push([nr, nc])
            }
          }
      }
    }
  }

  const checkWin = (cells) => {
    for (const row of cells) for (const cell of row) if (!cell.mine && !cell.revealed) return false
    return true
  }

  const onCellClick = useCallback(
    (r, c) => {
      if (status === 'won' || status === 'lost') return
      let cells = board
      let nextStatus = status
      if (!cells) {
        cells = makeBoard(cfg.rows, cfg.cols, cfg.mines, r, c)
        setStartTime(Date.now())
        nextStatus = 'playing'
      } else {
        cells = cells.map((row) => row.map((cell) => ({ ...cell })))
      }
      const cell = cells[r][c]
      if (cell.flagged || cell.revealed) return
      if (cell.mine) {
        cells.forEach((row) => row.forEach((cc) => cc.mine && (cc.revealed = true)))
        setBoard(cells)
        setStatus('lost')
        sound.error()
        return
      }
      revealFlood(cells, r, c)
      sound.click()
      if (checkWin(cells)) {
        nextStatus = 'won'
        sound.notify()
      }
      setBoard(cells)
      setStatus(nextStatus)
    },
    [board, status, cfg]
  )

  const onCellRightClick = useCallback(
    (e, r, c) => {
      e.preventDefault()
      if (!board || status === 'won' || status === 'lost') return
      const cells = board.map((row) => row.map((cell) => ({ ...cell })))
      const cell = cells[r][c]
      if (cell.revealed) return
      cell.flagged = !cell.flagged
      setFlagsUsed((f) => f + (cell.flagged ? 1 : -1))
      setBoard(cells)
      sound.click()
    },
    [board, status]
  )

  const displayCells = board ?? makeBoard(cfg.rows, cfg.cols, 0, -1, -1)

  return (
    <div className="flex flex-col items-center gap-2 p-3 h-full bg-bred-cream overflow-auto xp-scroll">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-bred-burnt">BredSweeper</span>
        {Object.keys(DIFFICULTIES).map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d)
              startGame()
            }}
            className={`text-[11px] px-2 py-0.5 rounded border ${
              difficulty === d
                ? 'bg-bred-toast/50 border-bred-crust font-bold'
                : 'border-bred-crustlight hover:bg-bred-toast/20'
            }`}
          >
            {d}
          </button>
        ))}
        <button
          onClick={startGame}
          className="text-[11px] px-2 py-0.5 rounded border border-bred-crustlight bg-bred-crumb hover:bg-bred-toast/30"
        >
          🔄 Reset
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs bg-[#3e2110] text-bred-amber font-mono px-3 py-1 rounded">
        <span>💣 {cfg.mines - flagsUsed}</span>
        <span>
          {status === 'lost' ? '😵' : status === 'won' ? '😎' : '🙂'}
        </span>
        <span>⏱ {elapsed}s</span>
      </div>

      <div
        className="inline-grid border-2 border-bred-crust bg-[#c9a876]"
        style={{ gridTemplateColumns: `repeat(${cfg.cols}, 22px)` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {displayCells.flat().map((cell) => (
          <button
            key={`${cell.r}-${cell.c}`}
            onClick={() => onCellClick(cell.r, cell.c)}
            onContextMenu={(e) => onCellRightClick(e, cell.r, cell.c)}
            className="flex items-center justify-center border border-bred-crustlight/60 text-[11px] font-bold select-none"
            style={{
              width: 22,
              height: 22,
              background: cell.revealed ? '#e8d5b5' : '#e2a35a',
              color: NUM_COLORS[cell.adjacent] || '#000',
            }}
          >
            {cell.revealed
              ? cell.mine
                ? '💣'
                : cell.adjacent || ''
              : cell.flagged
              ? '🚩'
              : ''}
          </button>
        ))}
      </div>
      {status === 'won' && <div className="text-green-800 text-xs font-bold">You cleared the board!</div>}
      {status === 'lost' && <div className="text-red-700 text-xs font-bold">Boom. Toasted.</div>}
      <div className="text-[10px] text-bred-burnt/60">Left click to reveal, right click to flag.</div>
    </div>
  )
}
