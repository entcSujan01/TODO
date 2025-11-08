import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',  // Explicit output dir for Vercel (default, but ensures clarity)
    sourcemap: false,  // Disable sourcemaps in prod for smaller bundles
  },
  define: {
    global: 'globalThis',  // Polyfill for Node globals if needed in deps
  },
  base: '/',  // Root-relative paths for Vercel deployment
})