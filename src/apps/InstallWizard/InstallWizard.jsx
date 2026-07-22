import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { randomProgram } from './fakePrograms'
import { sound } from '../../lib/sound'

const FAKE_FILES = [
  'toast.dll',
  'crumb_engine.sys',
  'butter.cfg',
  'loaf_core.exe',
  'gluten.dat',
  'preferences.ini',
  'readme_really.txt',
]

// Purely a UI simulation of an InstallShield-style wizard. No files are
// written, downloaded, or executed anywhere — "Finish" just adds a desktop
// icon that opens a placeholder window explaining that it's fake.
export default function InstallWizard({ winId }) {
  const [program] = useState(randomProgram)
  const [step, setStep] = useState(0)
  const [accepted, setAccepted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileLabel, setFileLabel] = useState('')
  const [launchNow, setLaunchNow] = useState(true)
  const timerRef = useRef(null)
  const closeWindow = useStore((s) => s.closeWindow)
  const addCustomIcon = useStore((s) => s.addCustomIcon)
  const openWindow = useStore((s) => s.openWindow)

  useEffect(() => {
    if (step !== 3) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 4 + Math.random() * 9
        setFileLabel(FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)])
        if (next >= 100) {
          clearInterval(timerRef.current)
          setStep(4)
          sound.notify()
          return 100
        }
        return next
      })
    }, 160)
    return () => clearInterval(timerRef.current)
  }, [step])

  const next = () => {
    sound.click()
    setStep((s) => s + 1)
  }
  const back = () => {
    sound.click()
    setStep((s) => Math.max(0, s - 1))
  }
  const cancel = () => {
    sound.close()
    closeWindow(winId)
  }
  const finish = () => {
    const id = `custom_${Date.now()}`
    addCustomIcon({ id, title: program.name, icon: program.icon })
    if (launchNow) {
      setTimeout(() => {
        openWindow({
          appId: 'fakeApp',
          title: program.name,
          icon: program.icon,
          props: { title: program.name, icon: program.icon },
          defaultSize: { w: 420, h: 260 },
        })
      }, 150)
    }
    sound.open()
    closeWindow(winId)
  }

  return (
    <div className="flex h-full">
      <div
        className="w-28 shrink-0 flex flex-col items-center justify-center gap-2 text-bred-cream"
        style={{ background: 'linear-gradient(180deg, #c9642f, #5a3418)' }}
      >
        <div className="text-4xl">{program.icon}</div>
        <div className="text-[10px] text-center px-2 opacity-80">Setup Wizard</div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-5 overflow-auto xp-scroll">
          {step === 0 && (
            <StepWelcome program={program} />
          )}
          {step === 1 && <StepLicense accepted={accepted} setAccepted={setAccepted} />}
          {step === 2 && <StepDestination program={program} />}
          {step === 3 && <StepInstalling progress={progress} fileLabel={fileLabel} />}
          {step === 4 && (
            <StepFinish program={program} launchNow={launchNow} setLaunchNow={setLaunchNow} />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-bred-crustlight bg-bred-crumb px-4 py-2">
          {step > 0 && step < 3 && (
            <WizBtn onClick={back}>&lt; Back</WizBtn>
          )}
          {step < 2 && (
            <WizBtn primary onClick={next} disabled={step === 1 && !accepted}>
              Next &gt;
            </WizBtn>
          )}
          {step === 2 && (
            <WizBtn primary onClick={next}>
              Install
            </WizBtn>
          )}
          {step === 3 && (
            <WizBtn disabled>
              Installing…
            </WizBtn>
          )}
          {step === 4 && (
            <WizBtn primary onClick={finish}>
              Finish
            </WizBtn>
          )}
          {step < 4 && <WizBtn onClick={cancel}>Cancel</WizBtn>}
        </div>
      </div>
    </div>
  )
}

function WizBtn({ children, onClick, primary, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-1 text-xs rounded border disabled:opacity-40 ${
        primary
          ? 'bg-bred-amber border-bred-crust text-white hover:bg-bred-toast'
          : 'bg-bred-cream border-bred-crustlight hover:bg-white'
      }`}
    >
      {children}
    </button>
  )
}

function StepWelcome({ program }) {
  return (
    <div>
      <h2 className="font-bold text-bred-burnt mb-3">
        Welcome to the {program.name} Setup Wizard
      </h2>
      <p className="text-sm text-bred-burnt/80 leading-relaxed">
        This wizard will guide you through the installation of {program.name}.
        <br />
        <br />
        It is recommended that you close all other BredOS applications before continuing. This
        entirely fictional installer does not modify any real files on your device.
        <br />
        <br />
        Click Next to continue.
      </p>
    </div>
  )
}

function StepLicense({ accepted, setAccepted }) {
  return (
    <div>
      <h2 className="font-bold text-bred-burnt mb-3">License Agreement</h2>
      <div className="h-32 overflow-auto border border-bred-crustlight bg-white p-2 text-[11px] xp-scroll mb-3">
        By installing this software you agree that bread is delicious, that toast should be enjoyed
        at a golden-brown color, and that this entire installer is a parody with no real effect on
        your system. No warranty. No liability. Not real. This is a UI simulation for BredOS, a
        parody desktop environment.
      </div>
      <label className="flex items-center gap-2 text-xs mb-1">
        <input type="radio" checked={accepted} onChange={() => setAccepted(true)} />
        I accept the terms of this fictional license agreement
      </label>
      <label className="flex items-center gap-2 text-xs">
        <input type="radio" checked={!accepted} onChange={() => setAccepted(false)} />
        I do not accept
      </label>
    </div>
  )
}

function StepDestination({ program }) {
  return (
    <div>
      <h2 className="font-bold text-bred-burnt mb-3">Choose Destination Location</h2>
      <p className="text-sm text-bred-burnt/80 mb-3">Setup will install {program.name} in the following folder.</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={`C:\\Program Files\\${program.folder}`}
          className="flex-1 border border-bred-crustlight rounded px-2 py-1 text-xs bg-white text-select"
        />
        <button
          onClick={() => sound.error()}
          className="px-3 py-1 text-xs rounded border border-bred-crustlight bg-bred-cream hover:bg-white"
        >
          Browse…
        </button>
      </div>
      <p className="text-[10px] text-bred-burnt/50 mt-2 italic">
        (Browse is fake — there is no real filesystem to pick from.)
      </p>
    </div>
  )
}

function StepInstalling({ progress, fileLabel }) {
  return (
    <div>
      <h2 className="font-bold text-bred-burnt mb-3">Installing…</h2>
      <p className="text-xs text-bred-burnt/70 mb-3">Copying file: {fileLabel || '...'}</p>
      <div className="h-4 rounded bg-white border border-bred-crustlight overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-bred-amber to-bred-toast transition-all"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <div className="text-[10px] text-bred-burnt/60 mt-1">{Math.min(100, Math.round(progress))}%</div>
    </div>
  )
}

function StepFinish({ program, launchNow, setLaunchNow }) {
  return (
    <div>
      <h2 className="font-bold text-bred-burnt mb-3">
        Completing the {program.name} Setup Wizard
      </h2>
      <p className="text-sm text-bred-burnt/80 mb-4">
        Setup has finished installing {program.name} on your (simulated) computer. A new icon has
        been added to your desktop and Start Menu.
      </p>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={launchNow} onChange={(e) => setLaunchNow(e.target.checked)} />
        Launch {program.name} now
      </label>
    </div>
  )
}
