import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import path from 'path'

// ES Modülleri için yerel klasör yolunu hesaplama
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Vite'a @ işaretinin 'src' klasörü olduğunu öğretiyoruz
      '@': path.resolve(__dirname, './src'),
    },
  },
})