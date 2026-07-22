import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store/useStore'
import { sound } from '../../lib/sound'

// Real functionality: this is a genuine textarea-based editor. "Save" downloads
// an actual .txt file via a Blob URL, and edits to files opened from My Computer
// persist to localStorage for the session.
export default function Notepad({ winId, fileName: initialFileName, initialContent }) {
  const notepadDocs = useStore((s) => s.notepadDocs)
  const saveNotepadDoc = useStore((s) => s.saveNotepadDoc)

  const [fileName, setFileName] = useState(initialFileName || 'Untitled.txt')
  const [text, setText] = useState(
    initialContent ?? (initialFileName ? notepadDocs[initialFileName] ?? '' : '')
  )
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState('')
  const taRef = useRef(null)

  useEffect(() => {
    if (initialFileName && notepadDocs[initialFileName] !== undefined && initialContent === undefined) {
      setText(notepadDocs[initialFileName])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveVirtual = () => {
    saveNotepadDoc(fileName, text)
    setDirty(false)
    setStatus('Saved to BredOS (virtual C:\\ drive).')
    sound.click()
    setTimeout(() => setStatus(''), 2500)
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setStatus('Downloaded ' + fileName + ' to your real computer.')
    sound.click()
    setTimeout(() => setStatus(''), 2500)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-1 px-1.5 py-1 bg-bred-crumb border-b border-bred-crustlight text-xs">
        <input
          className="border border-bred-crustlight rounded px-1.5 py-0.5 w-40 bg-white text-select"
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value)
            setDirty(true)
          }}
        />
        <MenuBtn onClick={handleSaveVirtual}>💾 Save</MenuBtn>
        <MenuBtn onClick={handleDownload}>⬇ Save As... (.txt download)</MenuBtn>
        <MenuBtn
          onClick={() => {
            setText('')
            setDirty(true)
          }}
        >
          🗋 New
        </MenuBtn>
        {dirty && <span className="text-bred-crust/70 italic ml-1">unsaved changes</span>}
        {status && <span className="text-green-800 ml-1">{status}</span>}
      </div>
      <textarea
        ref={taRef}
        className="flex-1 w-full resize-none outline-none p-2 font-mono text-sm text-select xp-scroll"
        style={{ tabSize: 4 }}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setDirty(true)
        }}
        spellCheck={false}
      />
      <div className="text-[10px] px-2 py-0.5 bg-bred-crumb border-t border-bred-crustlight text-bred-crust/70">
        Ln {text.slice(0, taRef.current?.selectionStart ?? 0).split('\n').length}, {text.length} chars
      </div>
    </div>
  )
}

function MenuBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-0.5 rounded border border-transparent hover:border-bred-crust hover:bg-bred-cream active:bg-bred-toast/40"
    >
      {children}
    </button>
  )
}
