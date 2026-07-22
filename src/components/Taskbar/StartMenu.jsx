import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { APP_REGISTRY } from '../../apps/registry'
import BootLogo from '../Boot/BootLogo'
import { sound } from '../../lib/sound'

const PINNED = ['bredexplorer', 'bredstore', 'mycomputer', 'notepad', 'controlpanel']

export default function StartMenu({ onClose }) {
  const openWindow = useStore((s) => s.openWindow)
  const customIcons = useStore((s) => s.customIcons)
  const loggedInUser = useStore((s) => s.loggedInUser)
  const logOff = useStore((s) => s.logOff)
  const requestShutdown = useStore((s) => s.requestShutdown)
  const [showShutdownDialog, setShowShutdownDialog] = useState(false)

  const openApp = (appId, overrides = {}) => {
    const app = APP_REGISTRY[appId]
    if (!app) return
    sound.open()
    openWindow({
      appId,
      title: app.title,
      icon: app.icon,
      singleton: app.singleton,
      defaultSize: app.defaultSize,
      minSize: app.minSize,
      ...overrides,
    })
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed bottom-[34px] left-0 z-50 w-[420px] rounded-t-md overflow-hidden shadow-xpwin border-2 border-bred-crust flex flex-col"
        style={{ background: '#fff4de' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 text-bred-cream"
          style={{ background: 'linear-gradient(90deg, #e2711d, #c9642f)' }}
        >
          <div className="w-9 h-9 rounded bg-bred-crust flex items-center justify-center text-xl">
            🍞
          </div>
          <div className="font-bold text-sm">{loggedInUser || 'You'}</div>
        </div>

        <div className="flex flex-1">
          <div className="flex-1 p-2 flex flex-col gap-0.5 bg-white">
            {PINNED.map((appId) => {
              const app = APP_REGISTRY[appId]
              return (
                <button
                  key={appId}
                  onClick={() => openApp(appId)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bred-toast/25 text-left text-sm"
                >
                  <span className="text-lg w-6 text-center">{app.icon}</span>
                  {app.title}
                </button>
              )
            })}
            {customIcons.length > 0 && (
              <div className="border-t border-bred-crumb my-1 pt-1">
                {customIcons.map((ci) => (
                  <button
                    key={ci.id}
                    onClick={() =>
                      openApp('fakeApp', { props: { title: ci.title, icon: ci.icon } })
                    }
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bred-toast/25 text-left text-sm w-full"
                  >
                    <span className="text-lg w-6 text-center">{ci.icon}</span>
                    {ci.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-40 shrink-0 p-2 flex flex-col gap-0.5 bg-bred-crumb/60 border-l border-bred-crumb">
            <StartLink onClick={() => openApp('mycomputer')} icon="💻" label="My Computer" />
            <StartLink
              onClick={() => openApp('mycomputer')}
              icon="📁"
              label="My Documents"
            />
            <StartLink onClick={() => openApp('controlpanel')} icon="⚙️" label="Control Panel" />
            <StartLink onClick={() => openApp('bredstore')} icon="🛒" label="BredStore" />
            <StartLink onClick={() => openApp('installwizard')} icon="📀" label="Install Program" />
            <div className="flex-1" />
            <StartLink
              onClick={() => {
                sound.click()
                logOff()
                onClose()
              }}
              icon="🚪"
              label="Log Off"
            />
            <StartLink
              onClick={() => {
                sound.click()
                setShowShutdownDialog(true)
              }}
              icon="⏻"
              label="Turn Off Computer"
            />
          </div>
        </div>
      </div>

      {showShutdownDialog && (
        <ShutdownDialog
          onCancel={() => setShowShutdownDialog(false)}
          onChoose={(mode) => {
            requestShutdown(mode)
            onClose()
          }}
        />
      )}
    </>
  )
}

function StartLink({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bred-toast/25 text-left text-xs"
    >
      <span className="w-5 text-center">{icon}</span>
      {label}
    </button>
  )
}

function ShutdownDialog({ onCancel, onChoose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
      <div className="w-80 rounded-md overflow-hidden border-2 border-bred-crust shadow-xpwin bg-bred-cream">
        <div
          className="px-3 py-1.5 text-bred-cream font-bold text-sm flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #e2711d, #c9642f)' }}
        >
          <BootLogo size={20} /> Turn off computer
        </div>
        <div className="flex justify-center gap-6 py-6">
          <ShutdownOption icon="🔄" label="Restart" onClick={() => onChoose('restart')} />
          <ShutdownOption icon="⏻" label="Turn Off" onClick={() => onChoose('off')} />
        </div>
        <div className="flex justify-center pb-4">
          <button
            onClick={onCancel}
            className="px-4 py-1 text-xs rounded border border-bred-crustlight bg-bred-crumb hover:bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function ShutdownOption({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className="w-14 h-14 rounded-md bg-white border border-bred-crustlight flex items-center justify-center text-2xl group-hover:bg-bred-toast/20">
        {icon}
      </div>
      <span className="text-xs text-bred-burnt">{label}</span>
    </button>
  )
}
