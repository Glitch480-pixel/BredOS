import { useStore } from '../../store/useStore'
import Window from './Window'
import { APP_REGISTRY } from '../../apps/registry'

export default function WindowManager() {
  const windows = useStore((s) => s.windows)

  return (
    <>
      {windows.map((win) => {
        const app = APP_REGISTRY[win.appId]
        if (!app) return null
        const AppComponent = app.component
        return (
          <Window key={win.id} win={win}>
            <AppComponent winId={win.id} {...win.props} />
          </Window>
        )
      })}
    </>
  )
}
