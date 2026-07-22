import { create } from 'zustand'
import { persist } from 'zustand/middleware'

let idCounter = 1
const nextId = () => `w${Date.now()}_${idCounter++}`

const DEFAULT_NOTEPAD_DOCS = {
  'readme.txt': 'Welcome to BredOS!\r\n\r\nThis is a nostalgic parody desktop environment.\r\nDouble-click things. Break things. Toast things.\r\n\r\n- The Management',
  'todo.txt': '1. Knead dough\r\n2. Let it rise\r\n3. Ship BredOS 1.0\r\n4. ???\r\n5. Profit',
  'recipe.txt': "Grandma's Sourdough (fake recipe)\r\n\r\n- 500g flour\r\n- 350g water\r\n- 100g starter\r\n- 10g salt\r\n\r\nMix, wait 24 hours, panic, bake at 230C.",
  'diary.txt': 'Dear Diary,\r\n\r\nToday I became a fully client-side operating system.\r\nNo backend. No servers. Just localStorage and dreams.\r\n\r\n- BredOS',
}

const DEFAULT_WALLPAPER = 'voxel-bread'
const DEFAULT_ACCENT = 'toast'

export const useStore = create(
  persist(
    (set, get) => ({
      // ----- boot / session (not persisted) -----
      bootStage: 'boot', // boot -> login -> desktop -> shuttingdown -> off | boot
      shutdownMode: null, // 'off' | 'restart'
      loggedInUser: null,

      setBootStage: (stage) => set({ bootStage: stage }),
      login: (user) => set({ loggedInUser: user, bootStage: 'desktop' }),
      logOff: () => set({ bootStage: 'login', loggedInUser: null, windows: [] }),
      requestShutdown: (mode) =>
        set({ bootStage: 'shuttingdown', shutdownMode: mode, windows: [] }),

      // ----- settings (persisted) -----
      settings: {
        wallpaper: DEFAULT_WALLPAPER,
        accent: DEFAULT_ACCENT,
        volume: 70,
        muted: false,
      },
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // ----- installed apps / desktop icons (persisted) -----
      installedGames: {}, // gameId -> true once "installed" via BredStore
      installGame: (gameId) =>
        set((s) => ({ installedGames: { ...s.installedGames, [gameId]: true } })),

      customIcons: [], // apps added by the Install Program wizard
      addCustomIcon: (icon) =>
        set((s) => ({ customIcons: [...s.customIcons, icon] })),

      // ----- fake notepad file contents (persisted) -----
      notepadDocs: DEFAULT_NOTEPAD_DOCS,
      saveNotepadDoc: (name, content) =>
        set((s) => ({ notepadDocs: { ...s.notepadDocs, [name]: content } })),

      // ----- remembered window geometry per app (persisted) -----
      windowGeom: {},
      rememberGeom: (appId, geom) =>
        set((s) => ({ windowGeom: { ...s.windowGeom, [appId]: geom } })),

      // ----- live windows (not persisted) -----
      windows: [],
      topZ: 10,

      openWindow: (opts) => {
        const state = get()
        // if singleton app already open and not asking for multi-instance, focus it
        if (opts.singleton) {
          const existing = state.windows.find((w) => w.appId === opts.appId)
          if (existing) {
            get().focusWindow(existing.id)
            get().restoreWindow(existing.id)
            return existing.id
          }
        }
        const geom = state.windowGeom[opts.appId] || {}
        const id = nextId()
        const topZ = state.topZ + 1
        const defaultW = opts.defaultSize?.w ?? 640
        const defaultH = opts.defaultSize?.h ?? 440
        const offset = (state.windows.length % 8) * 22
        const win = {
          id,
          appId: opts.appId,
          title: opts.title,
          icon: opts.icon,
          x: geom.x ?? 90 + offset,
          y: geom.y ?? 60 + offset,
          w: geom.w ?? defaultW,
          h: geom.h ?? defaultH,
          minW: opts.minSize?.w ?? 260,
          minH: opts.minSize?.h ?? 160,
          minimized: false,
          maximized: opts.maximized ?? false,
          z: topZ,
          props: opts.props ?? {},
          resizable: opts.resizable !== false,
        }
        set({ windows: [...state.windows, win], topZ })
        return id
      },

      closeWindow: (id) => {
        const win = get().windows.find((w) => w.id === id)
        if (win) get().rememberGeom(win.appId, { x: win.x, y: win.y, w: win.w, h: win.h })
        set((s) => ({ windows: s.windows.filter((w) => w.id !== id) }))
      },

      focusWindow: (id) => {
        const state = get()
        const topZ = state.topZ + 1
        set({
          windows: state.windows.map((w) => (w.id === id ? { ...w, z: topZ } : w)),
          topZ,
        })
      },

      minimizeWindow: (id) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
        })),

      restoreWindow: (id) => {
        get().focusWindow(id)
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: false } : w)),
        }))
      },

      toggleMinimize: (id) => {
        const win = get().windows.find((w) => w.id === id)
        if (!win) return
        if (win.minimized) get().restoreWindow(id)
        else get().minimizeWindow(id)
      },

      toggleMaximize: (id) =>
        set((s) => ({
          windows: s.windows.map((w) =>
            w.id === id ? { ...w, maximized: !w.maximized } : w
          ),
        })),

      updateWindowRect: (id, rect) =>
        set((s) => ({
          windows: s.windows.map((w) => (w.id === id ? { ...w, ...rect } : w)),
        })),
    }),
    {
      name: 'bredos-storage',
      partialize: (state) => ({
        settings: state.settings,
        installedGames: state.installedGames,
        customIcons: state.customIcons,
        notepadDocs: state.notepadDocs,
        windowGeom: state.windowGeom,
      }),
    }
  )
)
