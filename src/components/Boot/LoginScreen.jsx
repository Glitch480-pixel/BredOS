import { useState } from 'react'
import BootLogo from './BootLogo'
import { useStore } from '../../store/useStore'
import { sound } from '../../lib/sound'

const USERS = [
  { name: 'You', emoji: '🍞', color: '#c97b34' },
  { name: 'Guest', emoji: '🥯', color: '#8a5a2b' },
]

export default function LoginScreen() {
  const login = useStore((s) => s.login)
  const [loggingIn, setLoggingIn] = useState(null)

  const handleLogin = (user) => {
    if (loggingIn) return
    setLoggingIn(user.name)
    sound.login()
    setTimeout(() => login(user.name), 900)
  }

  return (
    <div
      className="w-full h-full flex flex-col select-none"
      style={{
        background: 'linear-gradient(180deg, #f2874a 0%, #c9642f 45%, #6b2c14 100%)',
      }}
    >
      <div className="flex items-center gap-3 pl-8 pt-6">
        <BootLogo size={44} />
        <div className="text-2xl font-bold text-bred-cream">
          Bred<span className="text-bred-amber">OS</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10 -mt-8">
        <div className="text-bred-cream text-lg tracking-wide opacity-90">
          To toast in to BredOS, click your name
        </div>

        <div className="flex gap-14">
          {USERS.map((u) => (
            <button
              key={u.name}
              onClick={() => handleLogin(u)}
              className="flex flex-col items-center gap-3 group"
            >
              <div
                className="w-24 h-24 rounded-md flex items-center justify-center text-5xl shadow-xpwin border-2 border-bred-cream/60 group-hover:scale-105 transition-transform"
                style={{ background: u.color }}
              >
                {u.emoji}
              </div>
              <div className="text-bred-cream font-semibold text-lg drop-shadow">
                {u.name}
              </div>
              {loggingIn === u.name && (
                <div className="text-xs text-bred-cream opacity-80">Logging in…</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="pb-6 text-center text-[11px] text-bred-cream/70">
        After you log on, you can add or change accounts in Control Panel.
      </div>
    </div>
  )
}
