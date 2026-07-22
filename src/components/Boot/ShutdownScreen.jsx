import { useEffect } from 'react'
import BootLogo from './BootLogo'
import { useStore } from '../../store/useStore'
import { sound } from '../../lib/sound'

export default function ShutdownScreen() {
  const shutdownMode = useStore((s) => s.shutdownMode)
  const setBootStage = useStore((s) => s.setBootStage)

  useEffect(() => {
    sound.shutdown()
    const t = setTimeout(() => {
      setBootStage(shutdownMode === 'restart' ? 'boot' : 'off')
    }, 2200)
    return () => clearTimeout(t)
  }, [shutdownMode, setBootStage])

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-5 text-bred-cream select-none">
      <BootLogo size={100} />
      <div className="text-lg tracking-wide">
        {shutdownMode === 'restart' ? 'Restarting BredOS…' : 'Shutting down BredOS…'}
      </div>
      <div className="w-48 h-2 rounded-sm overflow-hidden bg-[#2a1a0d] border border-[#5a3418]">
        <div className="h-full w-1/3 bg-gradient-to-r from-bred-amber to-bred-toast bred-progress-slide" />
      </div>
    </div>
  )
}

export function OffScreen() {
  const setBootStage = useStore((s) => s.setBootStage)
  return (
    <button
      onClick={() => setBootStage('boot')}
      className="w-full h-full bg-black flex flex-col items-center justify-center gap-2 text-bred-crustlight/70 text-xs text-center"
    >
      <span>It's now safe to turn off your computer.</span>
      <span>(Click anywhere to turn BredOS back on.)</span>
    </button>
  )
}
