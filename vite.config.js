import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  // Inline everything (JS/CSS) into one self-contained dist/index.html as a
  // classic (non-module) script. This means the built file can be opened
  // directly via a file:// URL (double-click it) — browsers refuse to load
  // <script type="module"> over file://, and Vite's default multi-file build
  // uses absolute "/assets/..." paths that also 404 outside a real server.
  plugins: [react(), viteSingleFile()],
  build: {
    cssCodeSplit: false,
  },
})
