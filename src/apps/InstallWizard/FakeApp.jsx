export default function FakeApp({ title, icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-6 bg-bred-cream">
      <div className="text-5xl">{icon || '📦'}</div>
      <div className="font-bold text-bred-burnt">{title}</div>
      <p className="text-xs text-bred-burnt/70 max-w-xs">
        You've successfully "installed" and opened this program. There's nothing behind this
        window — it exists purely to demonstrate the Install Program wizard flow. No real software
        was installed on your device.
      </p>
    </div>
  )
}
