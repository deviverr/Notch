import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // Root path for custom domain (NOT '/Notch/')
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined // Single bundle for simplicity
      }
    }
  }
})
