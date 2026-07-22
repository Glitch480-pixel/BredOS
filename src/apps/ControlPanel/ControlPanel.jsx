import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { WALLPAPERS } from '../../components/Desktop/Wallpaper'
import Wallpaper from '../../components/Desktop/Wallpaper'
import { sound } from '../../lib/sound'
import { IconGear } from '../../components/icons/Icons'

const ACCENTS = [
  { id: 'toast', label: 'Toast Orange', color: '#c97b34' },
  { id: 'burnt', label: 'Burnt Umber', color: '#5a3418' },
  { id: 'amber', label: 'Amber', color: '#e2711d' },
  { id: 'caramel', label: 'Caramel', color: '#a06a30' },
]

const PAGES = [
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'sounds', label: 'Sounds & Volume', icon: '🔊' },
  { id: 'about', label: 'System', icon: 'ℹ️' },
]

export default function ControlPanel() {
  const [page, setPage] = useState('display')
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  return (
    <div className="flex h-full">
      <div className="w-40 shrink-0 bg-bred-crumb border-r border-bred-crustlight p-2 flex flex-col gap-1">
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPage(p.id)
              sound.click()
            }}
            className={`text-left text-xs px-2 py-1.5 rounded flex items-center gap-2 ${
              page === p.id ? 'bg-bred-toast/50 font-bold' : 'hover:bg-bred-toast/20'
            }`}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 xp-scroll">
        {page === 'display' && (
          <DisplayPage settings={settings} updateSettings={updateSettings} />
        )}
        {page === 'sounds' && <SoundsPage settings={settings} updateSettings={updateSettings} />}
        {page === 'about' && <AboutPage />}
      </div>
    </div>
  )
}

function DisplayPage({ settings, updateSettings }) {
  return (
    <div>
      <h2 className="font-bold text-bred-burnt mb-1 text-sm">Desktop Background</h2>
      <p className="text-xs text-bred-burnt/70 mb-3">
        Choose a wallpaper. Changes apply immediately to your desktop.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {WALLPAPERS.map((w) => (
          <button
            key={w.id}
            onClick={() => {
              updateSettings({ wallpaper: w.id })
              sound.click()
            }}
            className={`border-2 rounded overflow-hidden text-left ${
              settings.wallpaper === w.id ? 'border-bred-amber' : 'border-bred-crustlight'
            }`}
          >
            <div className="relative w-full h-20 bg-black">
              <Wallpaper id={w.id} />
            </div>
            <div className="text-[11px] px-1.5 py-1 bg-bred-cream truncate">{w.label}</div>
          </button>
        ))}
      </div>

      <h2 className="font-bold text-bred-burnt mt-5 mb-1 text-sm">Window Color Scheme</h2>
      <div className="flex gap-3">
        {ACCENTS.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              updateSettings({ accent: a.id })
              sound.click()
            }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-10 h-10 rounded-full border-2 ${
                settings.accent === a.id ? 'border-bred-burnt scale-110' : 'border-bred-crustlight'
              }`}
              style={{ background: a.color }}
            />
            <span className="text-[10px]">{a.label}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-bred-burnt/50 mt-4 italic">
        Note: BredOS is always orange &amp; brown themed — this picks the accent shade used for
        highlights around the desktop.
      </p>
    </div>
  )
}

function SoundsPage({ settings, updateSettings }) {
  return (
    <div>
      <h2 className="font-bold text-bred-burnt mb-3 text-sm">Volume</h2>
      <div className="flex items-center gap-3 mb-4">
        <span>🔈</span>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.volume}
          onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
          className="w-56 accent-bred-amber"
        />
        <span>🔊</span>
        <span className="text-xs w-10">{settings.volume}%</span>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={settings.muted}
          onChange={(e) => updateSettings({ muted: e.target.checked })}
        />
        Mute all sounds
      </label>
      <button
        onClick={() => {
          if (settings.muted) updateSettings({ muted: false })
          setTimeout(() => sound.notify(), 30)
        }}
        className="mt-4 px-3 py-1 text-xs rounded border border-bred-crustlight bg-bred-crumb hover:bg-bred-toast/30"
      >
        ▶ Test Sound
      </button>
      <p className="text-[10px] text-bred-burnt/50 mt-4 italic">
        All BredOS sounds are synthesized live in your browser with the Web Audio API — there are
        no external audio files to load.
      </p>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="flex flex-col items-center text-center gap-2 pt-4">
      <IconGear size={56} />
      <div className="font-bold text-bred-burnt">BredOS</div>
      <div className="text-xs text-bred-burnt/70">Toast Edition — Build 2026.07</div>
      <p className="text-xs text-bred-burnt/70 max-w-xs mt-3">
        A nostalgic, entirely client-side desktop parody. Nothing here is a real operating system —
        everything runs in this browser tab using React state and localStorage.
      </p>
    </div>
  )
}
