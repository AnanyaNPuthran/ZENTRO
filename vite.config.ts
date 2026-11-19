import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: 'spa',   // enables SPA fallback — serves index.html for /admin, /customer, etc.
})
