# BredOS 🍞

A nostalgic, entirely client-side parody of a Windows XP-style desktop —
reskinned in a warm toast/bread orange-and-brown palette. Everything runs in
a single browser tab: React + Tailwind for the UI, a hand-rolled window
manager, an original isometric-SVG "voxel bread on a landscape" wallpaper,
and a from-scratch three.js block-building sandbox.

**This is a parody/simulation, not a real operating system.** It boots in
your browser tab and forgets nothing your OS wouldn't — see
["What's real vs. simulated"](#whats-real-vs-simulated) below for the exact
line between genuine functionality and desktop-flavor fakery.

## Running it

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

No backend, no environment variables, no API keys. It's a static site.

`npm run build` produces a single self-contained `dist/index.html` (JS and
CSS inlined via `vite-plugin-singlefile`) — you can open that file directly
by double-clicking it (a `file://` URL), no server required. This matters
because browsers refuse to load a normal Vite build's `<script
type="module" src="/assets/...">` over `file://` (blocked by CORS) or from
a non-root subpath (404s on absolute `/assets/...` paths) — both silently
produce a blank white screen with no visible error. Inlining everything
into one file sidesteps both problems.

## Using it

- Boot screen → login screen → click an avatar to log in.
- Double-click desktop icons to open apps in draggable, resizable windows.
- Drag title bars to move windows; drag window edges/corners to resize;
  double-click a title bar to maximize.
- The **start** button (bottom-left) opens the Start Menu — pinned apps,
  My Computer, Control Panel, BredStore, Install Program, Log Off, and Turn
  Off Computer.
- Everything you'd expect to persist across a reload — wallpaper, theme,
  volume, which BredStore games are "installed," Notepad file contents, and
  window positions — is saved to `localStorage` automatically.

## Architecture

```
src/
  store/useStore.js       Zustand store: window manager state, settings,
                           installed games, notepad docs, window geometry —
                           persisted to localStorage via zustand/persist.
  lib/sound.js             Synthesized "XP" sound effects (Web Audio API,
                           no audio files).
  lib/voxelBread.js        Procedural isometric voxel scene → SVG polygons,
                           used for the desktop wallpaper hero.
  components/
    Boot/                 Boot splash, login screen, shutdown/restart screens.
    Desktop/               Desktop surface, wallpaper, desktop icons.
    Taskbar/               Taskbar, Start Menu.
    WindowManager/         Draggable/resizable Window chrome + the manager
                           that renders every open window from the store.
    icons/                 Small flat SVG icon set (orange/brown palette).
  apps/
    registry.js            Central appId → {title, icon, component, size...}
                           registry. Add a new fake app by adding one entry
                           here — the desktop, Start Menu, taskbar, and
                           window manager all read from it.
    BredExplorer/           "Chrome" parody — real iframe browser.
    MyComputer/            Fake file explorer + fake filesystem data.
    Notepad/                Real text editor.
    ControlPanel/           Wallpaper / theme / volume settings.
    BredStore/              "Steam" parody game library + install flow.
    VoxelCraft/            Original three.js block sandbox.
    Game2048/, Minesweeper/, Solitaire/   Original browser games.
    InstallWizard/          InstallShield-style fake installer wizard.
```

Adding a new fake app: build a component under `src/apps/<YourApp>/`, add an
entry to `src/apps/registry.js`, and (optionally) add it to the Start Menu's
`PINNED` list or `Desktop`'s `showOnDesktop` flag.

## What's real vs. simulated

BredOS is upfront about the line between genuine browser functionality and
desktop-flavor parody — real operating systems obviously can't run inside a
browser tab, so here's exactly what each piece is doing:

| Feature | Real or simulated? | Notes |
|---|---|---|
| **The desktop, windows, taskbar, Start Menu** | Real UI, fake OS | It's genuine React state (Zustand) driving real drag/resize/z-index logic — there's just no actual operating system underneath. |
| **BredExplorer (browser)** | **Real** iframe browser | Typing a URL genuinely loads it in a live `<iframe>`. Many real sites (Google, most banking/SaaS apps, anything sending `X-Frame-Options`/CSP `frame-ancestors`) refuse to be iframed — that's a real browser security feature, not a BredOS bug. Since JS has no reliable way to detect that block, BredOS uses a load-timeout heuristic and shows a friendly "this site refused to connect" fallback with a "open in a real tab" link. |
| **Notepad** | **Real** text editor | Genuinely edits text. "Save" persists to BredOS's virtual C:\ (localStorage); "Save As" downloads an actual `.txt` file to your real computer via a Blob URL. |
| **My Computer / the C:\ filesystem** | **Simulated** | `fsData.js` is a hardcoded fake tree. Only the `.txt` files are "real" (their content round-trips through the same store as Notepad); folders, `.exe`/`.dll`/image entries are flavor only and show a joke dialog if you try to open them. |
| **Control Panel (wallpaper, theme, volume)** | **Real** | These settings genuinely change the desktop and genuinely persist across reloads. |
| **Sound effects** | **Real**, but synthesized | Every sound (startup chime, error buzz, click, open/close, shutdown) is generated live with the Web Audio API — there are no external audio files, so nothing to license or fetch. |
| **BredStore (Steam parody)** | **Real games, fake storefront** | The install progress bar is fake (nothing is downloaded — there's nothing to download), but every listed game (Voxel Craft, 2048, Minesweeper, Solitaire) is fully playable once "installed." "Toast Fighter Arena" is pure box-art flavor with nothing behind it. |
| **Voxel Craft** | **Real**, original game | A from-scratch three.js sandbox: procedural terrain, first-person walk + jump, break/place blocks, four block types. It is **not** Minecraft, ships no Minecraft assets/code/textures, and isn't a clone of any copyrighted world — just an original "blocky sandbox" in the same general spirit as the genre. |
| **2048 / Minesweeper / Solitaire** | **Real**, original implementations | Built from scratch (no cloned source), original BredOS color palettes. Solitaire is a simplified click-to-move Klondike (select a card, click a destination — no drag-and-drop and no multi-card run moves) to keep the implementation compact. |
| **Install Program wizard** | **Pure UI simulation** | The Next → Next → Install → Finish flow is a fully fake InstallShield-style animation. No files are written or executed anywhere. "Finish" just adds a new icon (a random joke program name) to your desktop and Start Menu, which opens a placeholder window that says exactly that. |
| **Turn Off Computer / Restart / Log Off** | **Simulated** | These just transition between the app's boot-state screens (shutdown animation → "safe to turn off" screen, or back to the boot splash) — nothing on your actual device is touched. |

### Things a browser genuinely cannot do (and why BredOS substitutes for them)

- **A real Steam client / real game installs**: browsers can't install or run
  native executables, manage a real filesystem, or download-and-launch
  arbitrary binaries — sandboxing forbids it (for very good security
  reasons). BredStore substitutes a fake progress bar plus **actual
  browser-native games** you can really play.
- **A real Minecraft client**: browsers can't load Minecraft's actual
  assets/code (that would also be a licensing problem, not just a technical
  one). Voxel Craft substitutes an original, from-scratch three.js
  block-sandbox demo instead.
- **Installing real 32-bit (or any) Windows applications**: a web page has
  no access to your OS's process/file APIs. The Install Program wizard
  substitutes a purely cosmetic wizard flow that adds a fake icon, with nothing
  executing on your machine.
- **A real filesystem**: `localStorage` is the only persistence a static
  site gets; My Computer's C:\ drive is a hardcoded JS object, not a real
  disk.

## Tech stack

React 19, Vite, Tailwind CSS, Zustand (state + localStorage persistence),
three.js (Voxel Craft only). No backend, no other runtime dependencies.
