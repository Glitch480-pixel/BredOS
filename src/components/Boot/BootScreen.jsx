import { useEffect } from 'react'
import BootLogo from './BootLogo'
import { useStore } from '../../store/useStore'
import { sound } from '../../lib/sound'

export default function BootScreen() {
  const setBootStage = useStore((s) => s.setBootStage)

  useEffect(() => {
    const t1 = setTimeout(() => sound.startup(), 250)
    const t2 = setTimeout(() => setBootStage('login'), 3200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [setBootStage])

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center text-bred-cream font-xp select-none">
      <div className="flex flex-col items-center gap-4">
        <BootLogo size={140} />
        <div className="text-4xl tracking-wide font-bold" style={{ color: '#e2711d' }}>
          Bred<span className="text-bred-cream">OS</span>
        </div>
        <div className="text-xs text-bred-crumb tracking-widest mt-1">
          eXPerience the Toast
        </div>
      </div>

      <div className="mt-14 relative w-56 h-3 rounded-sm overflow-hidden bg-[#2a1a0d] border border-[#5a3418]">
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-bred-amber to-bred-toast bred-progress-slide rounded-sm" />
      </div>
      <div className="mt-4 text-xs text-bred-crustlight">Starting BredOS...</div>

      <div className="absolute bottom-6 text-[10px] text-bred-crustlight opacity-60">
        Copyright (C) BredOS Corporation. A parody. No real bread was harmed.
      </div>
    </div>
  )
}
