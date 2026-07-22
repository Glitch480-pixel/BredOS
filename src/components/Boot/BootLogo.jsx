export default function BootLogo({ size = 96 }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 64 48" fill="none">
      <ellipse cx="32" cy="42" rx="26" ry="4" fill="#000" opacity="0.25" />
      <path
        d="M8 44 V22 C8 10 18 4 32 4 C46 4 56 10 56 22 V44 Z"
        fill="#c97b34"
        stroke="#5a3418"
        strokeWidth="2"
      />
      <path
        d="M8 22 C8 10 18 4 32 4 C46 4 56 10 56 22"
        fill="none"
        stroke="#e8c07d"
        strokeWidth="2"
        opacity="0.6"
      />
      <path d="M8 24 H56" stroke="#5a3418" strokeWidth="1.5" opacity="0.5" />
      <path d="M20 30 q4 -4 8 0 q4 -4 8 0 q4 -4 8 0" stroke="#8a5a2b" strokeWidth="1.5" fill="none" />
    </svg>
  )
}
