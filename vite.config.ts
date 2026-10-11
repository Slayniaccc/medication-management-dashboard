import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repository>/, so the deploy workflow
  // sets BASE_PATH. Everywhere else the app sits at the root.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    // The clocks change in this zone, which the daylight saving tests need.
    // Set here so the suite gives the same answer on any machine.
    env: { TZ: 'Europe/London' },
  },
})
