import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/recipe-grab-bag/', // 👈 MUST match your repo name
  plugins: [react()],
})
