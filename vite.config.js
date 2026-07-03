import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Using a relative base ('./') so the built app works correctly on
// GitHub Pages regardless of whether it's served from a user site
// (username.github.io) or a project site (username.github.io/repo-name).
// Combined with HashRouter in the app, no extra path configuration is needed.
export default defineConfig({
  plugins: [react()],
  base: './',
})
