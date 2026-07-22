export default function DesktopIcon({ label, glyph, GraphicIcon, selected, onSelect, onOpen }) {
  return (
    <button
      onClick={onSelect}
      onDoubleClick={onOpen}
      className="w-24 h-24 flex flex-col items-center gap-1 pt-2 pb-1 px-1 rounded outline-none"
      style={{
        background: selected ? 'rgba(226,113,29,0.35)' : 'transparent',
        border: selected ? '1px dotted rgba(255,244,222,0.8)' : '1px dotted transparent',
      }}
    >
      {GraphicIcon ? <GraphicIcon size={40} /> : <div style={{ fontSize: 38 }}>{glyph}</div>}
      <span
        className="text-[11px] text-center leading-tight text-white px-0.5 rounded"
        style={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.85)',
          background: selected ? 'rgba(139,84,29,0.85)' : 'transparent',
        }}
      >
        {label}
      </span>
    </button>
  )
}
