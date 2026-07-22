import { useEffect, useState } from 'react'
import { useStore } from '../../store/useStore'
import StartMenu from './StartMenu'
import BootLogo from '../Boot/BootLogo'
import { sound } from '../../lib/sound'

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return <span>{time}</span>
}

export default function Taskbar() {
  const windows = useStore((s) => s.windows)
  const toggleMinimize = useStore((s) => s.toggleMinimize)
  const focusWindow = useStore((s) => s.focusWindow)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const [startOpen, setStartOpen] = useState(false)

  const topZ = windows.reduce((m, w) => Math.max(m, w.z), -1)

  const handleTaskClick = (win) => {
    if (win.minimized) {
      toggleMinimize(win.id)
    } else if (win.z === topZ) {
      toggleMinimize(win.id)
    } else {
      focusWindow(win.id)
    }
    sound.click()
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-[34px] flex items-center z-[100] border-t border-black/40"
      style={{ background: 'linear-gradient(180deg, #c9642f 0%, #8a5a2b 60%, #5a3418 100%)' }}
    >
      <button
        onClick={() => setStartOpen((o) => !o)}
        className={`h-full px-3 flex items-center gap-1.5 font-bold italic text-bred-cream text-[15px] ${
          startOpen ? 'bg-black/25' : 'hover:bg-white/10'
        }`}
        style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
      >
        <BootLogo size={22} />
        start
      </button>

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}

      <div className="w-px h-6 bg-black/30 mx-1" />

      <div className="flex-1 flex items-center gap-1 px-1 overflow-x-auto">
        {windows.map((win) => (
          <button
            key={win.id}
            onClick={() => handleTaskClick(win)}
            className={`h-7 px-2 rounded text-xs text-bred-cream flex items-center gap-1.5 max-w-[160px] border ${
              !win.minimized && win.z === topZ
                ? 'bg-black/30 border-black/40'
                : 'bg-white/10 border-transparent hover:bg-white/20'
            }`}
            title={win.title}
          >
            <span>{win.icon}</span>
            <span className="truncate">{win.title}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 h-full text-bred-cream text-xs border-l border-black/30">
        <button
          onClick={() => updateSettings({ muted: !settings.muted })}
          title={settings.muted ? 'Unmute' : 'Mute'}
        >
          {settings.muted ? '🔇' : '🔊'}
        </button>
        <Clock />
      </div>
    </div>
  )
}
