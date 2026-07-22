import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { findNode, FS_TREE } from './fsData'
import { IconFolder, IconDocument, IconMyComputer } from '../../components/icons/Icons'
import MessageBox from '../../components/common/MessageBox'
import { sound } from '../../lib/sound'

function iconFor(type, size = 40) {
  if (type === 'folder') return <IconFolder size={size} />
  if (type === 'textfile') return <IconDocument size={size} />
  if (type === 'drive') return <IconMyComputer size={size} />
  return <div style={{ fontSize: size * 0.8 }}>📦</div>
}

export default function MyComputer() {
  const [path, setPath] = useState([]) // array of folder names beneath C:\
  const [dialog, setDialog] = useState(null)
  const openWindow = useStore((s) => s.openWindow)

  const node = path.length === 0 ? FS_TREE : findNode(path)
  const children = node?.children ?? []

  const openItem = (item) => {
    sound.click()
    if (item.type === 'folder') {
      setPath([...path, item.name])
    } else if (item.type === 'textfile') {
      openWindow({
        appId: 'notepad',
        title: `${item.name} - Notepad`,
        icon: '📝',
        props: { fileName: item.name },
        defaultSize: { w: 520, h: 420 },
      })
    } else if (item.type === 'image') {
      setDialog({
        title: 'Windows Picture Viewer',
        message: `Cannot display ${item.name}. This is a decorative fake file — BredOS doesn't ship real image data for it.`,
        type: 'warn',
      })
    } else {
      setDialog({
        title: 'BredOS',
        message: `${item.name} cannot be opened: this is a simulated system file for desktop flavor only, not a real executable.`,
        type: 'error',
      })
    }
  }

  const crumbs = ['C:\\', ...path]

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center gap-1 px-2 py-1 bg-bred-crumb border-b border-bred-crustlight text-xs">
        <button
          disabled={path.length === 0}
          onClick={() => setPath(path.slice(0, -1))}
          className="px-2 py-0.5 rounded border border-bred-crustlight bg-bred-cream disabled:opacity-40 hover:bg-white"
        >
          ⬅ Back
        </button>
        <div className="flex-1 bg-white border border-bred-crustlight rounded px-2 py-0.5 truncate text-select">
          {crumbs.join(' \\ ')}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 xp-scroll">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-3">
          {children.map((item) => (
            <button
              key={item.name}
              onDoubleClick={() => openItem(item)}
              className="flex flex-col items-center gap-1 p-2 rounded hover:bg-bred-toast/20 focus:bg-bred-toast/30 outline-none"
              title="Double-click to open"
            >
              {iconFor(item.type)}
              <span className="text-[11px] text-center text-bred-burnt leading-tight break-words">
                {item.name}
              </span>
            </button>
          ))}
          {children.length === 0 && (
            <div className="text-xs text-bred-burnt/60 italic col-span-full">This folder is empty.</div>
          )}
        </div>
      </div>

      <div className="text-[10px] px-2 py-0.5 bg-bred-crumb border-t border-bred-crustlight text-bred-crust/70">
        {children.length} item(s) — all contents are simulated for flavor except text files, which are real & editable.
      </div>

      {dialog && <MessageBox {...dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}
