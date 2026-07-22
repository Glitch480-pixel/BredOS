// Small set of flat, XP-ish icon glyphs in the BredOS orange/brown palette.
// Kept as simple inline SVGs so the whole app stays dependency-free.

const wrap = (children, size) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    {children}
  </svg>
)

export function IconMyComputer({ size = 32 }) {
  return wrap(
    <>
      <rect x="4" y="5" width="24" height="15" rx="1.5" fill="#e8c07d" stroke="#5a3418" strokeWidth="1.2" />
      <rect x="6.5" y="7.5" width="19" height="9" fill="#8a5a2b" />
      <rect x="11" y="21" width="10" height="2.5" fill="#8a5a2b" />
      <rect x="8" y="23.5" width="16" height="2.5" rx="1" fill="#c97b34" stroke="#5a3418" strokeWidth="1" />
    </>,
    size
  )
}

export function IconFolder({ size = 32 }) {
  return wrap(
    <>
      <path d="M4 9 h9 l2 3 h13 v13 a1.5 1.5 0 0 1 -1.5 1.5 h-21 a1.5 1.5 0 0 1 -1.5 -1.5 Z" fill="#e2a35a" stroke="#5a3418" strokeWidth="1.2" />
      <path d="M4 12 h24 v10.5 a1.5 1.5 0 0 1 -1.5 1.5 h-21 a1.5 1.5 0 0 1 -1.5 -1.5 Z" fill="#f2c078" stroke="#5a3418" strokeWidth="1.2" />
    </>,
    size
  )
}

export function IconDocument({ size = 32 }) {
  return wrap(
    <>
      <path d="M8 3 h11 l5 5 v21 h-16 Z" fill="#fff4de" stroke="#5a3418" strokeWidth="1.2" />
      <path d="M19 3 v5 h5 Z" fill="#d9c4a3" stroke="#5a3418" strokeWidth="1" />
      <rect x="11" y="14" width="10" height="1.4" fill="#c97b34" />
      <rect x="11" y="18" width="10" height="1.4" fill="#c97b34" />
      <rect x="11" y="22" width="6" height="1.4" fill="#c97b34" />
    </>,
    size
  )
}

export function IconGear({ size = 32 }) {
  return wrap(
    <>
      <circle cx="16" cy="16" r="6.5" fill="#e2a35a" stroke="#5a3418" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="2.6" fill="#5a3418" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4
        const x1 = 16 + Math.cos(a) * 9
        const y1 = 16 + Math.sin(a) * 9
        const x2 = 16 + Math.cos(a) * 12.5
        const y2 = 16 + Math.sin(a) * 12.5
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a5a2b" strokeWidth="3.4" strokeLinecap="round" />
      })}
    </>,
    size
  )
}

export function IconGlobe({ size = 32 }) {
  return wrap(
    <>
      <circle cx="16" cy="16" r="12" fill="#f2a03d" stroke="#5a3418" strokeWidth="1.4" />
      <ellipse cx="16" cy="16" rx="5" ry="12" fill="none" stroke="#5a3418" strokeWidth="1.1" />
      <line x1="4" y1="16" x2="28" y2="16" stroke="#5a3418" strokeWidth="1.1" />
      <path d="M6 10 Q16 14 26 10" fill="none" stroke="#5a3418" strokeWidth="1" />
      <path d="M6 22 Q16 18 26 22" fill="none" stroke="#5a3418" strokeWidth="1" />
    </>,
    size
  )
}

export function IconStore({ size = 32 }) {
  return wrap(
    <>
      <path d="M5 10 l2 -5 h18 l2 5 Z" fill="#c97b34" stroke="#5a3418" strokeWidth="1.1" />
      <rect x="5" y="10" width="22" height="4" fill="#e2a35a" stroke="#5a3418" strokeWidth="1" />
      <rect x="6" y="14" width="20" height="13" fill="#fff4de" stroke="#5a3418" strokeWidth="1.1" />
      <rect x="13" y="18" width="6" height="9" fill="#8a5a2b" />
    </>,
    size
  )
}

export function IconTrash({ size = 32 }) {
  return wrap(
    <>
      <path d="M9 10 h14 l-1.5 16 a2 2 0 0 1 -2 1.8 h-7 a2 2 0 0 1 -2 -1.8 Z" fill="#d9c4a3" stroke="#5a3418" strokeWidth="1.2" />
      <rect x="7" y="7" width="18" height="3" rx="1" fill="#8a5a2b" stroke="#5a3418" strokeWidth="1" />
      <rect x="13" y="4" width="6" height="3" rx="1" fill="#8a5a2b" stroke="#5a3418" strokeWidth="1" />
      <line x1="13" y1="13" x2="14" y2="24" stroke="#5a3418" strokeWidth="1" />
      <line x1="19" y1="13" x2="18" y2="24" stroke="#5a3418" strokeWidth="1" />
    </>,
    size
  )
}

export function IconGamepad({ size = 32 }) {
  return wrap(
    <>
      <path d="M7 13 h18 a5 5 0 0 1 5 5 v3 a4 4 0 0 1 -7 2.6 l-2 -2.6 h-10 l-2 2.6 a4 4 0 0 1 -7 -2.6 v-3 a5 5 0 0 1 5 -5 Z" fill="#8a5a2b" stroke="#3e2110" strokeWidth="1.2" />
      <line x1="11" y1="16" x2="11" y2="21" stroke="#f2c078" strokeWidth="1.6" />
      <line x1="8.5" y1="18.5" x2="13.5" y2="18.5" stroke="#f2c078" strokeWidth="1.6" />
      <circle cx="22" cy="17" r="1.4" fill="#f2c078" />
      <circle cx="25.5" cy="20" r="1.4" fill="#f2c078" />
    </>,
    size
  )
}

export function IconExe({ size = 32 }) {
  return wrap(
    <>
      <rect x="6" y="4" width="20" height="24" rx="2" fill="#e2a35a" stroke="#5a3418" strokeWidth="1.2" />
      <rect x="9" y="8" width="14" height="3" fill="#5a3418" />
      <rect x="9" y="13" width="14" height="3" fill="#5a3418" />
      <path d="M12 19 l8 4 l-8 4 Z" fill="#c94a2f" />
    </>,
    size
  )
}

export function IconBread({ size = 32 }) {
  return wrap(
    <>
      <path d="M5 26 V16 C5 8 10 4 16 4 C22 4 27 8 27 16 V26 Z" fill="#c97b34" stroke="#5a3418" strokeWidth="1.3" />
      <path d="M5 16 C5 8 10 4 16 4 C22 4 27 8 27 16" fill="none" stroke="#e8c07d" strokeWidth="1.6" opacity="0.7" />
      <path d="M9 22 q3.5 -4 7 0 q3.5 -4 7 0" stroke="#8a5a2b" strokeWidth="1.4" fill="none" />
    </>,
    size
  )
}

export function IconVoxel({ size = 32 }) {
  return wrap(
    <>
      <polygon points="16,3 27,9 27,21 16,27 5,21 5,9" fill="#c97b34" stroke="#5a3418" strokeWidth="1.2" />
      <polygon points="16,3 27,9 16,15 5,9" fill="#e2a35a" />
      <polygon points="5,9 16,15 16,27 5,21" fill="#8a5a2b" />
      <polygon points="27,9 16,15 16,27 27,21" fill="#6e4420" />
    </>,
    size
  )
}
