/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) return 'react-vendor';
          if (id.includes('react-hot-toast')) return 'ui-vendor';
          if (id.includes('html2canvas') || id.includes('jspdf')) return 'pdf-vendor';
          if (id.includes('recharts')) return 'charts-vendor';
        },
      },
    },
  },
})