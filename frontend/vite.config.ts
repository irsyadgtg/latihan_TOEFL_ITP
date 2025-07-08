import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',                    // ← UBAH ke '/' (dari '/app/' kalau ada)
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})