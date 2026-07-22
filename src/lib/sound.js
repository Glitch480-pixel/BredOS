// Tiny synthesized sound engine — no external audio files.
// BredOS generates all its "XP" chimes on the fly with the Web Audio API,
// so there are no licensing concerns and nothing to fetch over the network.
import { useStore } from '../store/useStore'

let ctx = null
function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function gainForVolume() {
  const { volume, muted } = useStore.getState().settings
  if (muted) return 0
  return Math.max(0, Math.min(1, volume / 100)) * 0.35
}

function tone({ freq, start = 0, dur = 0.15, type = 'sine', vol = 1, glideTo = null }) {
  const c = getCtx()
  const t0 = c.currentTime + start
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur)
  const peak = gainForVolume() * vol
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0001), t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const sound = {
  startup() {
    // warm little ascending "toast pop" fanfare
    tone({ freq: 261.6, start: 0, dur: 0.35, type: 'triangle' })
    tone({ freq: 329.6, start: 0.15, dur: 0.35, type: 'triangle' })
    tone({ freq: 392.0, start: 0.3, dur: 0.5, type: 'triangle' })
    tone({ freq: 523.3, start: 0.48, dur: 0.7, type: 'sine' })
  },
  login() {
    tone({ freq: 392, start: 0, dur: 0.12, type: 'sine' })
    tone({ freq: 523.3, start: 0.1, dur: 0.3, type: 'sine' })
  },
  click() {
    tone({ freq: 900, start: 0, dur: 0.03, type: 'square', vol: 0.5 })
  },
  open() {
    tone({ freq: 440, start: 0, dur: 0.09, type: 'sine', glideTo: 700 })
  },
  close() {
    tone({ freq: 620, start: 0, dur: 0.1, type: 'sine', glideTo: 300 })
  },
  minimize() {
    tone({ freq: 500, start: 0, dur: 0.08, type: 'sine', glideTo: 260 })
  },
  maximize() {
    tone({ freq: 300, start: 0, dur: 0.08, type: 'sine', glideTo: 560 })
  },
  error() {
    tone({ freq: 200, start: 0, dur: 0.18, type: 'square', vol: 0.6 })
    tone({ freq: 150, start: 0.16, dur: 0.22, type: 'square', vol: 0.6 })
  },
  notify() {
    tone({ freq: 660, start: 0, dur: 0.08, type: 'sine' })
    tone({ freq: 880, start: 0.09, dur: 0.12, type: 'sine' })
  },
  shutdown() {
    tone({ freq: 523.3, start: 0, dur: 0.4, type: 'triangle', glideTo: 220 })
    tone({ freq: 392, start: 0.1, dur: 0.5, type: 'triangle', glideTo: 130 })
  },
}
