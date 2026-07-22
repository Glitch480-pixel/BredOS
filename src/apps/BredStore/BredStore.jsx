import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { GAMES } from './games'
import { sound } from '../../lib/sound'

function BoxArt({ game, size = 'large' }) {
  const [c1, c2] = game.gradient
  const h = size === 'large' ? 160 : 64
  return (
    <div
      className="rounded flex items-center justify-center relative overflow-hidden shrink-0"
      style={{
        width: size === 'large' ? '100%' : 64,
        height: h,
        background: `linear-gradient(160deg, ${c1}, ${c2})`,
      }}
    >
      <span style={{ fontSize: size === 'large' ? 56 : 26 }}>{game.glyph}</span>
      {game.comingSoon && (
        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] text-center py-0.5">
          COMING SOON
        </div>
      )}
    </div>
  )
}

export default function BredStore() {
  const installedGames = useStore((s) => s.installedGames)
  const installGame = useStore((s) => s.installGame)
  const openWindow = useStore((s) => s.openWindow)
  const [selectedId, setSelectedId] = useState(GAMES[0].id)
  const [installing, setInstalling] = useState(null) // {id, progress}
  const timerRef = useRef(null)

  const game = GAMES.find((g) => g.id === selectedId)

  useEffect(() => () => clearInterval(timerRef.current), [])

  const startInstall = (g) => {
    if (g.comingSoon) return
    sound.click()
    setInstalling({ id: g.id, progress: 0 })
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setInstalling((prev) => {
        if (!prev) return prev
        const next = prev.progress + 8 + Math.random() * 10
        return { ...prev, progress: Math.min(100, next), done: next >= 100 }
      })
    }, 220)
  }

  // Side effects (stopping the timer, marking the game installed, playing a
  // sound) must not run inside the setInstalling updater above — that runs
  // during React's render phase, and calling other components' setState
  // from there triggers "update while rendering" warnings. Do it here instead.
  useEffect(() => {
    if (installing?.done) {
      clearInterval(timerRef.current)
      installGame(installing.id)
      sound.notify()
      setInstalling(null)
    }
  }, [installing, installGame])

  const play = (g) => {
    sound.open()
    openWindow({
      appId: g.appId,
      title: g.title,
      icon: g.glyph,
      singleton: false,
      defaultSize:
        g.appId === 'voxelcraft'
          ? { w: 820, h: 560 }
          : g.appId === 'solitaire'
          ? { w: 720, h: 560 }
          : { w: 420, h: 520 },
      minSize: { w: 320, h: 300 },
    })
  }

  return (
    <div className="flex h-full bg-[#1b1410] text-bred-cream">
      <div className="w-48 shrink-0 border-r border-black/40 overflow-auto xp-scroll bg-[#241a13]">
        <div className="px-3 py-2 text-xs font-bold text-bred-amber uppercase tracking-wide">
          Library
        </div>
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedId(g.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs border-l-2 ${
              selectedId === g.id
                ? 'bg-bred-toast/20 border-bred-amber'
                : 'border-transparent hover:bg-white/5'
            }`}
          >
            <BoxArt game={g} size="small" />
            <div className="min-w-0">
              <div className="truncate font-semibold">{g.title}</div>
              <div className="text-[10px] opacity-60">
                {g.comingSoon ? 'Coming soon' : installedGames[g.id] ? 'Installed' : 'Not installed'}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 p-5 overflow-auto xp-scroll">
        <BoxArt game={game} size="large" />
        <h2 className="text-xl font-bold mt-4">{game.title}</h2>
        <div className="text-bred-amber text-sm mb-3">{game.tagline}</div>
        <p className="text-sm opacity-80 max-w-md mb-4">{game.desc}</p>
        <div className="text-xs opacity-50 mb-4">Size on disk (simulated): {game.size}</div>

        {game.comingSoon ? (
          <button
            disabled
            className="px-5 py-2 rounded bg-white/10 text-white/50 text-sm font-bold cursor-not-allowed"
          >
            Coming Soon
          </button>
        ) : installedGames[game.id] ? (
          <button
            onClick={() => play(game)}
            className="px-5 py-2 rounded bg-bred-amber hover:bg-bred-toast text-white text-sm font-bold"
          >
            ▶ Play
          </button>
        ) : installing?.id === game.id ? (
          <div className="max-w-xs">
            <div className="h-3 rounded bg-black/40 overflow-hidden mb-1">
              <div
                className="h-full bg-gradient-to-r from-bred-amber to-bred-toast transition-all"
                style={{ width: `${Math.min(100, installing.progress)}%` }}
              />
            </div>
            <div className="text-[10px] opacity-60">
              Installing… {Math.min(100, Math.round(installing.progress))}%
            </div>
          </div>
        ) : (
          <button
            onClick={() => startInstall(game)}
            className="px-5 py-2 rounded bg-bred-toast hover:bg-bred-amber text-white text-sm font-bold"
          >
            ⬇ Install
          </button>
        )}

        <div className="text-[10px] opacity-40 mt-6 max-w-md">
          BredStore is a Steam-style parody UI. Installs are simulated with a fake progress bar —
          nothing is actually downloaded — but the games themselves are fully playable once
          "installed".
        </div>
      </div>
    </div>
  )
}
