import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const manualChunks: Record<string, string[]> = {
  'react-vendor': ['react', 'react-dom'],
  'router': ['react-router-dom'],
  'supabase': ['@supabase/supabase-js'],
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          for (const [chunk, deps] of Object.entries(manualChunks)) {
            if (deps.some((dep) => id.includes(`node_modules/${dep}`))) {
              return chunk
            }
          }
        },
      },
    },
  },
})
