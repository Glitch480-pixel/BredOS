import { useState } from 'react'
import { useStore } from '../../store/useStore'
import Wallpaper from './Wallpaper'
import DesktopIcon from './DesktopIcon'
import { APP_REGISTRY } from '../../apps/registry'
import { IconTrash } from '../icons/Icons'
import { sound } from '../../lib/sound'

export default function Desktop() {
  const settings = useStore((s) => s.settings)
  const customIcons = useStore((s) => s.customIcons)
  const openWindow = useStore((s) => s.openWindow)
  const [selected, setSelected] = useState(null)

  const builtins = Object.entries(APP_REGISTRY).filter(([, app]) => app.showOnDesktop)

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
      resizable: app.resizable,
      ...overrides,
    })
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onClick={() => setSelected(null)}
    >
      <Wallpaper id={settings.wallpaper} />

      <div className="absolute top-2 left-2 flex flex-col flex-wrap gap-1 content-start" style={{ height: 'calc(100% - 60px)' }}>
        {builtins.map(([appId, app]) => (
          <div key={appId} onClick={(e) => e.stopPropagation()}>
            <DesktopIcon
              label={app.title}
              glyph={app.icon}
              GraphicIcon={app.DesktopIcon}
              selected={selected === appId}
              onSelect={() => setSelected(appId)}
              onOpen={() => openApp(appId)}
            />
          </div>
        ))}

        {customIcons.map((ci) => (
          <div key={ci.id} onClick={(e) => e.stopPropagation()}>
            <DesktopIcon
              label={ci.title}
              glyph={ci.icon}
              selected={selected === ci.id}
              onSelect={() => setSelected(ci.id)}
              onOpen={() =>
                openApp('fakeApp', { props: { title: ci.title, icon: ci.icon } })
              }
            />
          </div>
        ))}

        <div onClick={(e) => e.stopPropagation()}>
          <DesktopIcon
            label="Recycle Bin"
            GraphicIcon={IconTrash}
            selected={selected === 'recyclebin'}
            onSelect={() => setSelected('recyclebin')}
            onOpen={() => sound.error()}
          />
        </div>
      </div>
    </div>
  )
}
