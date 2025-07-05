import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,              // ← Ubah dari 5173 ke 3000
    host: 'localhost'
  }
})