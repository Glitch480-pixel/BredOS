import { useStore } from './store/useStore'
import BootScreen from './components/Boot/BootScreen'
import LoginScreen from './components/Boot/LoginScreen'
import ShutdownScreen, { OffScreen } from './components/Boot/ShutdownScreen'
import Desktop from './components/Desktop/Desktop'
import WindowManager from './components/WindowManager/WindowManager'
import Taskbar from './components/Taskbar/Taskbar'

export default function App() {
  const bootStage = useStore((s) => s.bootStage)

  if (bootStage === 'boot') return <BootScreen />
  if (bootStage === 'login') return <LoginScreen />
  if (bootStage === 'shuttingdown') return <ShutdownScreen />
  if (bootStage === 'off') return <OffScreen />

  return (
    <div className="w-full h-full relative overflow-hidden font-xp">
      <Desktop />
      <WindowManager />
      <Taskbar />
    </div>
  )
}
