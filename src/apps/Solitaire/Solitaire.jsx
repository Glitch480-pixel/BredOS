import { useMemo, useState } from 'react'
import { sound } from '../../lib/sound'

const SUITS = [
  { id: 'H', symbol: '♥', red: true },
  { id: 'D', symbol: '♦', red: true },
  { id: 'C', symbol: '♣', red: false },
  { id: 'S', symbol: '♠', red: false },
]
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const RANK_LABEL = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }

function freshDeck() {
  const deck = []
  for (const s of SUITS) for (const r of RANKS) deck.push({ suit: s.id, rank: r, faceUp: false })
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function deal() {
  const deck = freshDeck()
  const tableau = []
  for (let i = 0; i < 7; i++) {
    const pile = deck.splice(0, i + 1)
    pile[pile.length - 1].faceUp = true
    tableau.push(pile)
  }
  return { tableau, stock: deck, waste: [], foundations: { H: [], D: [], C: [], S: [] } }
}

function suitInfo(id) {
  return SUITS.find((s) => s.id === id)
}

function Card({ card, onClick, selected, small }) {
  const info = suitInfo(card.suit)
  return (
    <button
      onClick={onClick}
      className={`w-11 h-16 rounded border text-xs font-bold flex flex-col items-center justify-center shrink-0
        ${card.faceUp ? 'bg-white' : 'bg-bred-toast'}
        ${selected ? 'ring-2 ring-bred-amber -translate-y-1' : ''}
        border-bred-crustlight transition-transform`}
      style={{ color: card.faceUp ? (info.red ? '#c92424' : '#222') : 'transparent' }}
    >
      {card.faceUp ? (
        <>
          <span>{RANK_LABEL[card.rank] || card.rank}</span>
          <span className="text-base leading-none">{info.symbol}</span>
        </>
      ) : (
        <span className="text-bred-cream text-[9px]">BredOS</span>
      )}
    </button>
  )
}

export default function Solitaire() {
  const [state, setState] = useState(deal)
  const [selected, setSelected] = useState(null) // {source:'tableau'|'waste'|'foundation', pile}
  const [won, setWon] = useState(false)
  const [flash, setFlash] = useState(null)

  const restart = () => {
    setState(deal())
    setSelected(null)
    setWon(false)
  }

  const flashError = () => {
    sound.error()
    setFlash(Date.now())
    setTimeout(() => setFlash(null), 300)
  }

  const drawStock = () => {
    setState((s) => {
      if (s.stock.length === 0) {
        if (s.waste.length === 0) return s
        const newStock = [...s.waste].reverse().map((c) => ({ ...c, faceUp: false }))
        return { ...s, stock: newStock, waste: [] }
      }
      const stock = [...s.stock]
      const card = { ...stock.pop(), faceUp: true }
      sound.click()
      return { ...s, stock, waste: [...s.waste, card] }
    })
    setSelected(null)
  }

  const getSelectedCard = () => {
    if (!selected) return null
    if (selected.source === 'waste') return state.waste[state.waste.length - 1]
    if (selected.source === 'foundation') {
      const f = state.foundations[selected.pile]
      return f[f.length - 1]
    }
    if (selected.source === 'tableau') {
      const p = state.tableau[selected.pile]
      return p[p.length - 1]
    }
    return null
  }

  const canStackTableau = (top, card) => {
    if (!top) return card.rank === 13
    const topInfo = suitInfo(top.suit)
    const cardInfo = suitInfo(card.suit)
    return top.faceUp && top.rank === card.rank + 1 && topInfo.red !== cardInfo.red
  }
  const canStackFoundation = (pile, card) => {
    if (pile.length === 0) return card.rank === 1
    const top = pile[pile.length - 1]
    return top.suit === card.suit && top.rank === card.rank - 1
  }

  const removeSelectedCard = (s) => {
    if (selected.source === 'waste') return { ...s, waste: s.waste.slice(0, -1) }
    if (selected.source === 'foundation') {
      const f = { ...s.foundations, [selected.pile]: s.foundations[selected.pile].slice(0, -1) }
      return { ...s, foundations: f }
    }
    if (selected.source === 'tableau') {
      const tableau = s.tableau.map((p, i) => (i === selected.pile ? p.slice(0, -1) : p))
      const pile = tableau[selected.pile]
      if (pile.length > 0) pile[pile.length - 1] = { ...pile[pile.length - 1], faceUp: true }
      return { ...s, tableau }
    }
    return s
  }

  const moveTo = (destType, destPile) => {
    const card = getSelectedCard()
    if (!card) return
    if (destType === 'tableau') {
      const top = state.tableau[destPile][state.tableau[destPile].length - 1]
      if (!canStackTableau(top, card)) return flashError()
      setState((s) => {
        const removed = removeSelectedCard(s)
        const tableau = removed.tableau.map((p, i) => (i === destPile ? [...p, card] : p))
        return { ...removed, tableau }
      })
    } else if (destType === 'foundation') {
      if (!canStackFoundation(state.foundations[destPile], card) || card.suit !== destPile) return flashError()
      setState((s) => {
        const removed = removeSelectedCard(s)
        const foundations = { ...removed.foundations, [destPile]: [...removed.foundations[destPile], card] }
        const win = Object.values(foundations).every((f) => f.length === 13)
        if (win) {
          setWon(true)
          sound.notify()
        }
        return { ...removed, foundations }
      })
    }
    sound.click()
    setSelected(null)
  }

  const clickTableau = (pileIdx, cardIdx) => {
    const pile = state.tableau[pileIdx]
    const card = pile[cardIdx]
    const isTop = cardIdx === pile.length - 1
    if (!card.faceUp) return
    if (selected) {
      if (selected.source === 'tableau' && selected.pile === pileIdx && isTop) {
        setSelected(null)
        return
      }
      moveTo('tableau', pileIdx)
      return
    }
    if (isTop) setSelected({ source: 'tableau', pile: pileIdx })
  }

  const clickWaste = () => {
    if (state.waste.length === 0) return
    if (selected?.source === 'waste') {
      setSelected(null)
      return
    }
    setSelected({ source: 'waste' })
  }

  const clickFoundation = (suitId) => {
    if (selected) {
      moveTo('foundation', suitId)
    } else if (state.foundations[suitId].length > 0) {
      setSelected({ source: 'foundation', pile: suitId })
    }
  }

  return (
    <div className={`relative flex flex-col h-full p-3 gap-3 bg-[#2f6b3a] overflow-auto xp-scroll ${flash ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="text-bred-cream font-bold text-sm">BredCard Solitaire</div>
        <button
          onClick={restart}
          className="px-2 py-1 text-xs rounded border border-bred-cream/40 bg-bred-toast/40 text-bred-cream hover:bg-bred-toast/60"
        >
          New Game
        </button>
      </div>

      <div className="flex gap-3">
        <div onClick={drawStock} className="cursor-pointer">
          {state.stock.length > 0 ? (
            <Card card={{ suit: 'S', rank: 1, faceUp: false }} />
          ) : (
            <div className="w-11 h-16 rounded border-2 border-dashed border-bred-cream/40 flex items-center justify-center text-bred-cream/50 text-lg">
              ↺
            </div>
          )}
        </div>
        <div onClick={clickWaste} className="cursor-pointer">
          {state.waste.length > 0 ? (
            <Card card={state.waste[state.waste.length - 1]} selected={selected?.source === 'waste'} />
          ) : (
            <div className="w-11 h-16 rounded border border-bred-cream/20" />
          )}
        </div>
        <div className="flex-1" />
        {SUITS.map((s) => {
          const pile = state.foundations[s.id]
          return (
            <div key={s.id} onClick={() => clickFoundation(s.id)} className="cursor-pointer">
              {pile.length > 0 ? (
                <Card card={pile[pile.length - 1]} selected={selected?.source === 'foundation' && selected.pile === s.id} />
              ) : (
                <div className="w-11 h-16 rounded border border-bred-cream/30 flex items-center justify-center text-bred-cream/40 text-lg">
                  {s.symbol}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 flex-1 items-start">
        {state.tableau.map((pile, pi) => (
          <div key={pi} className="relative flex-1" style={{ minHeight: 80 }}>
            {pile.length === 0 && (
              <div
                onClick={() => selected && moveTo('tableau', pi)}
                className="w-11 h-16 rounded border border-bred-cream/20 cursor-pointer"
              />
            )}
            {pile.map((card, ci) => (
              <div key={ci} className="absolute" style={{ top: ci * 20, left: 0 }}>
                <Card
                  card={card}
                  onClick={() => clickTableau(pi, ci)}
                  selected={selected?.source === 'tableau' && selected.pile === pi && ci === pile.length - 1}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {won && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-bred-cream rounded-lg p-6 text-center">
            <div className="text-2xl mb-2">🎉</div>
            <div className="font-bold text-bred-burnt mb-3">You win!</div>
            <button onClick={restart} className="px-4 py-1 rounded bg-bred-amber text-white">
              Play Again
            </button>
          </div>
        </div>
      )}
      <div className="text-[10px] text-bred-cream/70">
        Click a card to select it, then click a destination pile. Click the deck to draw.
      </div>
    </div>
  )
}
