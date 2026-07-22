import { useRef, useCallback, useState } from 'react'
import { useStore } from '../../store/useStore'
import { sound } from '../../lib/sound'

const TASKBAR_H = 34
const MENU_BAR_H = 26

export default function Window({ win, children }) {
  const focusWindow = useStore((s) => s.focusWindow)
  const closeWindow = useStore((s) => s.closeWindow)
  const toggleMinimize = useStore((s) => s.toggleMinimize)
  const toggleMaximize = useStore((s) => s.toggleMaximize)
  const updateWindowRect = useStore((s) => s.updateWindowRect)

  const dragState = useRef(null)
  const resizeState = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const onTitleMouseDown = useCallback(
    (e) => {
      if (win.maximized) return
      focusWindow(win.id)
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        winX: win.x,
        winY: win.y,
      }
      setIsDragging(true)
      const onMove = (ev) => {
        const d = dragState.current
        if (!d) return
        const nx = d.winX + (ev.clientX - d.startX)
        const ny = Math.max(0, d.winY + (ev.clientY - d.startY))
        updateWindowRect(win.id, { x: nx, y: ny })
      }
      const onUp = () => {
        dragState.current = null
        setIsDragging(false)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [win, focusWindow, updateWindowRect]
  )

  const startResize = useCallback(
    (dir) => (e) => {
      e.stopPropagation()
      if (win.maximized) return
      focusWindow(win.id)
      resizeState.current = {
        dir,
        startX: e.clientX,
        startY: e.clientY,
        x: win.x,
        y: win.y,
        w: win.w,
        h: win.h,
      }
      const onMove = (ev) => {
        const r = resizeState.current
        if (!r) return
        const dx = ev.clientX - r.startX
        const dy = ev.clientY - r.startY
        let { x, y, w, h } = r
        if (r.dir.includes('e')) w = Math.max(win.minW, r.w + dx)
        if (r.dir.includes('s')) h = Math.max(win.minH, r.h + dy)
        if (r.dir.includes('w')) {
          w = Math.max(win.minW, r.w - dx)
          x = r.x + (r.w - w)
        }
        if (r.dir.includes('n')) {
          h = Math.max(win.minH, r.h - dy)
          y = Math.max(0, r.y + (r.h - h))
        }
        updateWindowRect(win.id, { x, y, w, h })
      }
      const onUp = () => {
        resizeState.current = null
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [win, focusWindow, updateWindowRect]
  )

  if (win.minimized) return null

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: `calc(100% - ${TASKBAR_H}px)`, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  const handles = win.resizable && !win.maximized
    ? ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
    : []

  return (
    <div
      className="absolute flex flex-col rounded-t-md overflow-hidden border-2 border-bred-crust shadow-xpwin"
      style={style}
      onMouseDown={() => focusWindow(win.id)}
    >
      {handles.map((dir) => (
        <div
          key={dir}
          onMouseDown={startResize(dir)}
          className="absolute z-10"
          style={resizeHandleStyle(dir)}
        />
      ))}

      {/* title bar */}
      <div
        onMouseDown={onTitleMouseDown}
        onDoubleClick={() => {
          toggleMaximize(win.id)
          sound.maximize()
        }}
        className={`flex items-center justify-between px-1.5 py-1 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          background: 'linear-gradient(180deg, #e2711d 0%, #c9642f 45%, #8a5a2b 100%)',
          borderBottom: '1px solid #3e2110',
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 text-bred-cream font-bold text-[13px] pl-1">
          <span className="text-base leading-none">{win.icon}</span>
          <span className="truncate">{win.title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <TitleButton
            onClick={() => {
              toggleMinimize(win.id)
              sound.minimize()
            }}
            label="_"
          />
          <TitleButton
            onClick={() => {
              toggleMaximize(win.id)
              sound.maximize()
            }}
            label={win.maximized ? '❐' : '□'}
          />
          <TitleButton
            onClick={() => {
              closeWindow(win.id)
              sound.close()
            }}
            label="✕"
            danger
          />
        </div>
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 bg-bred-cream flex flex-col">{children}</div>
    </div>
  )
}

function TitleButton({ onClick, label, danger }) {
  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className={`w-5 h-5 flex items-center justify-center text-[11px] font-bold rounded-sm border border-bred-crust/70 leading-none
        ${danger ? 'bg-[#c94a2f] hover:bg-[#e2593a] text-white' : 'bg-bred-crumb hover:bg-bred-cream text-bred-crust'}`}
    >
      {label}
    </button>
  )
}

function resizeHandleStyle(dir) {
  const base = { position: 'absolute' }
  const edge = 6
  switch (dir) {
    case 'n':
      return { ...base, top: -edge / 2, left: edge, right: edge, height: edge, cursor: 'ns-resize' }
    case 's':
      return { ...base, bottom: -edge / 2, left: edge, right: edge, height: edge, cursor: 'ns-resize' }
    case 'e':
      return { ...base, right: -edge / 2, top: edge, bottom: edge, width: edge, cursor: 'ew-resize' }
    case 'w':
      return { ...base, left: -edge / 2, top: edge, bottom: edge, width: edge, cursor: 'ew-resize' }
    case 'ne':
      return { ...base, top: -edge / 2, right: -edge / 2, width: edge * 2, height: edge * 2, cursor: 'nesw-resize' }
    case 'nw':
      return { ...base, top: -edge / 2, left: -edge / 2, width: edge * 2, height: edge * 2, cursor: 'nwse-resize' }
    case 'se':
      return { ...base, bottom: -edge / 2, right: -edge / 2, width: edge * 2, height: edge * 2, cursor: 'nwse-resize' }
    case 'sw':
      return { ...base, bottom: -edge / 2, left: -edge / 2, width: edge * 2, height: edge * 2, cursor: 'nesw-resize' }
    default:
      return base
  }
}
