import { useEffect, useRef, useState } from 'react'
import { sound } from '../../lib/sound'
import { IconGlobe } from '../../components/icons/Icons'

const HOME = ''
const BOOKMARKS = [
  { label: 'BredOS Home', url: '' },
  { label: 'Example.com', url: 'https://example.com' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page' },
  { label: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
]

function normalize(input) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`
}

// Real functionality: this genuinely loads whatever URL you type into a live
// <iframe>. Many sites (banks, Google, most modern apps) send
// X-Frame-Options / Content-Security-Policy headers that block iframing —
// browsers give web pages no reliable way to detect that block, so BredOS
// uses a short load-timeout heuristic and shows a friendly fallback instead
// of a blank white rectangle.
export default function BredExplorer() {
  const [history, setHistory] = useState([HOME])
  const [index, setIndex] = useState(0)
  const [addressInput, setAddressInput] = useState('')
  const [loadState, setLoadState] = useState('idle') // idle | loading | loaded | blocked
  const [reloadKey, setReloadKey] = useState(0)
  const iframeRef = useRef(null)
  const timeoutRef = useRef(null)

  const currentUrl = history[index]

  useEffect(() => {
    setAddressInput(currentUrl)
  }, [currentUrl])

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    if (!currentUrl) {
      setLoadState('idle')
      return
    }
    setLoadState('loading')
    timeoutRef.current = setTimeout(() => {
      setLoadState((s) => (s === 'loading' ? 'blocked' : s))
    }, 2600)
    return () => clearTimeout(timeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, reloadKey])

  const navigate = (rawUrl) => {
    const url = normalize(rawUrl)
    const newHistory = history.slice(0, index + 1)
    newHistory.push(url)
    setHistory(newHistory)
    setIndex(newHistory.length - 1)
    sound.click()
  }

  const goBack = () => {
    if (index > 0) {
      setIndex(index - 1)
      sound.click()
    }
  }
  const goForward = () => {
    if (index < history.length - 1) {
      setIndex(index + 1)
      sound.click()
    }
  }
  const refresh = () => {
    setReloadKey((k) => k + 1)
    setLoadState(currentUrl ? 'loading' : 'idle')
    sound.click()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-1 px-1.5 py-1 bg-bred-crumb border-b border-bred-crustlight">
        <ToolBtn onClick={goBack} disabled={index === 0} title="Back">
          ◀
        </ToolBtn>
        <ToolBtn onClick={goForward} disabled={index === history.length - 1} title="Forward">
          ▶
        </ToolBtn>
        <ToolBtn onClick={refresh} title="Refresh">
          ⟳
        </ToolBtn>
        <ToolBtn onClick={() => navigate('')} title="Home">
          🏠
        </ToolBtn>
        <form
          className="flex-1 flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            navigate(addressInput)
          }}
        >
          <IconGlobe size={18} />
          <input
            className="flex-1 border border-bred-crustlight rounded px-2 py-1 text-sm text-select bg-white"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Type a URL and press Enter…"
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs rounded border border-bred-crustlight bg-bred-toast/30 hover:bg-bred-toast/50"
          >
            Go
          </button>
        </form>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 bg-bred-cream border-b border-bred-crustlight text-[11px] overflow-x-auto">
        {BOOKMARKS.map((b) => (
          <button
            key={b.label}
            onClick={() => navigate(b.url)}
            className="px-2 py-0.5 rounded hover:bg-bred-toast/30 whitespace-nowrap"
          >
            ⭐ {b.label}
          </button>
        ))}
      </div>

      <div className="flex-1 relative bg-white">
        {!currentUrl && <NewTabPage onGo={navigate} />}

        {currentUrl && (
          <>
            <iframe
              key={`${currentUrl}-${reloadKey}`}
              ref={iframeRef}
              src={currentUrl}
              title="BredExplorer viewport"
              className="w-full h-full border-0"
              onLoad={() => setLoadState('loaded')}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              style={{ visibility: loadState === 'blocked' ? 'hidden' : 'visible' }}
            />
            {loadState === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-bred-burnt">
                Loading {currentUrl}…
              </div>
            )}
            {loadState === 'blocked' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bred-cream text-center px-8">
                <div className="text-5xl">🚫🍞</div>
                <div className="font-bold text-bred-burnt">This site refused to connect</div>
                <p className="text-xs text-bred-burnt/70 max-w-sm">
                  <code className="bg-white px-1 rounded">{currentUrl}</code> didn't finish loading
                  in this window. Many sites send an <code>X-Frame-Options</code> or{' '}
                  <code>Content-Security-Policy</code> header that blocks them from being embedded
                  in an iframe like BredExplorer's — this is a browser security feature, not a bug
                  in BredOS.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={refresh}
                    className="px-3 py-1 text-xs rounded border border-bred-crustlight bg-white hover:bg-bred-toast/20"
                  >
                    Try Again
                  </button>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 text-xs rounded border border-bred-crustlight bg-bred-toast/40 hover:bg-bred-toast/60"
                  >
                    Open in a real tab ↗
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="text-[10px] px-2 py-0.5 bg-bred-crumb border-t border-bred-crustlight text-bred-crust/70 truncate">
        {currentUrl || 'BredOS Start Page'}
      </div>
    </div>
  )
}

function ToolBtn({ children, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded border border-transparent hover:border-bred-crustlight hover:bg-white disabled:opacity-30 text-sm"
    >
      {children}
    </button>
  )
}

function NewTabPage({ onGo }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-bred-cream to-bred-crumb">
      <div className="text-3xl font-bold text-bred-crust">🍞 BredExplorer</div>
      <div className="text-xs text-bred-burnt/70 -mt-4">Toast the web.</div>
      <div className="grid grid-cols-2 gap-3">
        {BOOKMARKS.filter((b) => b.url).map((b) => (
          <button
            key={b.label}
            onClick={() => onGo(b.url)}
            className="px-4 py-3 rounded bg-white border border-bred-crustlight shadow hover:shadow-md hover:-translate-y-0.5 transition-transform text-sm"
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
