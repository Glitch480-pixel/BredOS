import { useEffect } from 'react'
import { sound } from '../../lib/sound'

export default function MessageBox({ title = 'BredOS', message, type = 'info', onClose }) {
  useEffect(() => {
    if (type === 'error') sound.error()
    else sound.notify()
  }, [type])

  const icon = type === 'error' ? '⛔' : type === 'warn' ? '⚠️' : 'ℹ️'

  return (
    <div className="absolute inset-0 z-50 bg-black/25 flex items-center justify-center">
      <div className="w-80 border-2 border-bred-crust rounded-md shadow-xpwin overflow-hidden bg-bred-cream">
        <div
          className="px-2 py-1 text-bred-cream font-bold text-sm flex items-center justify-between"
          style={{ background: 'linear-gradient(180deg, #e2711d 0%, #c9642f 45%, #8a5a2b 100%)' }}
        >
          <span>{title}</span>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-[#c94a2f] hover:bg-[#e2593a] text-white rounded-sm text-[11px] font-bold border border-bred-crust/70"
          >
            ✕
          </button>
        </div>
        <div className="p-4 flex gap-3 items-start">
          <div className="text-3xl leading-none">{icon}</div>
          <div className="text-sm text-bred-burnt flex-1">{message}</div>
        </div>
        <div className="flex justify-end px-4 pb-3">
          <button
            onClick={onClose}
            className="px-4 py-1 text-sm rounded border border-bred-crust bg-bred-crumb hover:bg-bred-toast/40 active:bg-bred-toast/60"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
