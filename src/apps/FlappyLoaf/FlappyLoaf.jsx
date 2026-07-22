import { useEffect, useRef, useState } from 'react'
import { sound } from '../../lib/sound'

// Flappy Loaf — an original "tap to flap through gaps" arcade game (the
// genre itself isn't anyone's IP; this is a from-scratch implementation
// with its own art: a bread-loaf bird and glasses-of-milk obstacles).

const WIDTH = 360
const HEIGHT = 520
const GRAVITY = 0.45
const FLAP_VY = -7.6
const BIRD_X = 90
const BIRD_SIZE = 30
const PIPE_WIDTH = 58
const PIPE_GAP = 158
const PIPE_SPACING = 210
const PIPE_SPEED = 2.6
const GROUND_H = 40

function makePipe(x) {
  const margin = 60
  const gapY = margin + Math.random() * (HEIGHT - GROUND_H - margin * 2 - PIPE_GAP) + PIPE_GAP / 2
  return { x, gapY, passed: false }
}

function drawMilkGlass(ctx, x, w, yStart, yEnd, rimAtBottom) {
  // A tall glass of milk used as the "pipe". rimAtBottom: true for the pipe
  // hanging from the ceiling (rim faces down, toward the gap); false for
  // the pipe standing from the floor (rim faces up, toward the gap).
  const h = yEnd - yStart
  const taper = w * 0.08
  ctx.save()
  ctx.beginPath()
  if (rimAtBottom) {
    ctx.moveTo(x, yStart)
    ctx.lineTo(x + w, yStart)
    ctx.lineTo(x + w - taper, yEnd)
    ctx.lineTo(x + taper, yEnd)
  } else {
    ctx.moveTo(x + taper, yStart)
    ctx.lineTo(x + w - taper, yStart)
    ctx.lineTo(x + w, yEnd)
    ctx.lineTo(x, yEnd)
  }
  ctx.closePath()
  const grad = ctx.createLinearGradient(x, 0, x + w, 0)
  grad.addColorStop(0, '#fffef2')
  grad.addColorStop(0.5, '#fffbe0')
  grad.addColorStop(1, '#f2ecc9')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#c9b98a'
  ctx.stroke()

  // rim ellipse (the glass opening, facing the gap)
  const rimY = rimAtBottom ? yEnd : yStart
  const rimW = rimAtBottom ? w - taper * 2 : w
  ctx.beginPath()
  ctx.ellipse(x + w / 2, rimY, rimW / 2, 6, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = '#c9b98a'
  ctx.lineWidth = 2
  ctx.stroke()

  // faint highlight streak
  ctx.beginPath()
  ctx.moveTo(x + w * 0.22, yStart + 6)
  ctx.lineTo(x + w * 0.3, yEnd - 6)
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()
}

function drawBird(ctx, x, y, rotation) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  // loaf body
  ctx.beginPath()
  ctx.moveTo(-BIRD_SIZE / 2, BIRD_SIZE / 2 - 4)
  ctx.lineTo(-BIRD_SIZE / 2, -2)
  ctx.quadraticCurveTo(-BIRD_SIZE / 2, -BIRD_SIZE / 2, 0, -BIRD_SIZE / 2)
  ctx.quadraticCurveTo(BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE / 2, -2)
  ctx.lineTo(BIRD_SIZE / 2, BIRD_SIZE / 2 - 4)
  ctx.closePath()
  const grad = ctx.createLinearGradient(0, -BIRD_SIZE / 2, 0, BIRD_SIZE / 2)
  grad.addColorStop(0, '#e2a35a')
  grad.addColorStop(1, '#c97b34')
  ctx.fillStyle = grad
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#5a3418'
  ctx.stroke()
  // score-line on top (the "slash" on a bread loaf)
  ctx.beginPath()
  ctx.moveTo(-BIRD_SIZE / 3, -BIRD_SIZE / 6)
  ctx.quadraticCurveTo(0, -BIRD_SIZE / 3, BIRD_SIZE / 3, -BIRD_SIZE / 6)
  ctx.strokeStyle = '#8a5a2b'
  ctx.lineWidth = 2
  ctx.stroke()
  // eye
  ctx.beginPath()
  ctx.arc(BIRD_SIZE / 5, -2, 2.4, 0, Math.PI * 2)
  ctx.fillStyle = '#3e2110'
  ctx.fill()
  ctx.restore()
}

export default function FlappyLoaf() {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('ready') // ready | playing | over
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('bredos-flappyloaf-best') || 0))

  const stateRef = useRef({
    bird: { y: HEIGHT / 2, vy: 0 },
    pipes: [],
    frame: 0,
    score: 0,
    status: 'ready',
  })

  const reset = () => {
    stateRef.current = {
      bird: { y: HEIGHT / 2, vy: 0 },
      pipes: [makePipe(WIDTH + 40), makePipe(WIDTH + 40 + PIPE_SPACING)],
      frame: 0,
      score: 0,
      status: 'ready',
    }
    setScore(0)
    setStatus('ready')
  }

  const flap = () => {
    const s = stateRef.current
    if (s.status === 'over') {
      reset()
      return
    }
    if (s.status === 'ready') {
      s.status = 'playing'
      setStatus('playing')
    }
    s.bird.vy = FLAP_VY
    sound.click()
  }

  useEffect(() => {
    reset()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf

    function endGame() {
      const s = stateRef.current
      s.status = 'over'
      setStatus('over')
      sound.error()
      setBest((b) => {
        const nb = Math.max(b, s.score)
        localStorage.setItem('bredos-flappyloaf-best', String(nb))
        return nb
      })
    }

    function update() {
      const s = stateRef.current
      if (s.status === 'playing') {
        s.bird.vy += GRAVITY
        s.bird.y += s.bird.vy

        for (const pipe of s.pipes) {
          pipe.x -= PIPE_SPEED
          if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X - BIRD_SIZE / 2) {
            pipe.passed = true
            s.score += 1
            setScore(s.score)
            sound.notify()
          }
        }
        if (s.pipes.length && s.pipes[0].x < -PIPE_WIDTH - 20) {
          s.pipes.shift()
          const lastX = s.pipes[s.pipes.length - 1].x
          s.pipes.push(makePipe(lastX + PIPE_SPACING))
        }

        // collisions: floor / ceiling
        if (s.bird.y + BIRD_SIZE / 2 > HEIGHT - GROUND_H || s.bird.y - BIRD_SIZE / 2 < 0) {
          endGame()
        }
        // collisions: pipes (AABB against bird's bounding box)
        const bx0 = BIRD_X - BIRD_SIZE / 2 + 4
        const bx1 = BIRD_X + BIRD_SIZE / 2 - 4
        const by0 = s.bird.y - BIRD_SIZE / 2 + 4
        const by1 = s.bird.y + BIRD_SIZE / 2 - 4
        for (const pipe of s.pipes) {
          if (bx1 > pipe.x && bx0 < pipe.x + PIPE_WIDTH) {
            const gapTop = pipe.gapY - PIPE_GAP / 2
            const gapBottom = pipe.gapY + PIPE_GAP / 2
            if (by0 < gapTop || by1 > gapBottom) {
              endGame()
            }
          }
        }
      }
      s.frame++
    }

    function draw() {
      const s = stateRef.current
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT)
      sky.addColorStop(0, '#ffb35c')
      sky.addColorStop(0.6, '#f2874a')
      sky.addColorStop(1, '#c9642f')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      // sun
      ctx.beginPath()
      ctx.arc(300, 80, 34, 0, Math.PI * 2)
      const sunGrad = ctx.createRadialGradient(300, 80, 4, 300, 80, 34)
      sunGrad.addColorStop(0, '#fff4de')
      sunGrad.addColorStop(1, '#ffd98a')
      ctx.fillStyle = sunGrad
      ctx.fill()

      // pipes (glasses of milk)
      for (const pipe of s.pipes) {
        const gapTop = pipe.gapY - PIPE_GAP / 2
        const gapBottom = pipe.gapY + PIPE_GAP / 2
        drawMilkGlass(ctx, pipe.x, PIPE_WIDTH, 0, gapTop, true)
        drawMilkGlass(ctx, pipe.x, PIPE_WIDTH, gapBottom, HEIGHT - GROUND_H, false)
      }

      // ground
      ctx.fillStyle = '#8a5a2b'
      ctx.fillRect(0, HEIGHT - GROUND_H, WIDTH, GROUND_H)
      ctx.fillStyle = '#6b4022'
      for (let gx = -((s.frame * PIPE_SPEED) % 24); gx < WIDTH; gx += 24) {
        ctx.fillRect(gx, HEIGHT - GROUND_H, 12, 6)
      }

      // bird
      const rotation = Math.max(-0.5, Math.min(1.1, s.bird.vy / 10))
      drawBird(ctx, BIRD_X, s.bird.y, rotation)

      raf = requestAnimationFrame(() => {
        update()
        draw()
      })
    }
    draw()

    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center gap-2 p-3 h-full bg-bred-cream overflow-auto xp-scroll">
      <div className="flex items-center gap-4 text-xs font-bold text-bred-burnt">
        <span>Flappy Loaf</span>
        <span>Score: {score}</span>
        <span>Best: {best}</span>
      </div>
      <div className="relative" style={{ width: WIDTH, height: HEIGHT }} onMouseDown={flap}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="rounded border-2 border-bred-crust cursor-pointer"
        />
        {status === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 text-bred-cream text-center pointer-events-none">
            <div className="text-lg font-bold">Flappy Loaf</div>
            <div className="text-xs px-6">Click or press Space to flap through the milk glasses</div>
          </div>
        )}
        {status === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-bred-cream text-center">
            <div className="text-lg font-bold">Toasted!</div>
            <div className="text-sm">Score: {score}</div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                reset()
              }}
              className="mt-2 px-3 py-1 text-xs rounded bg-bred-amber hover:bg-bred-toast pointer-events-auto"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      <div className="text-[10px] text-bred-burnt/60">Click the game or press Space/↑ to flap.</div>
    </div>
  )
}
