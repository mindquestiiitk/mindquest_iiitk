import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercel()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
   // define __APP_ENV to be used in the app
  define: {
    __APP_ENV__: JSON.stringify(process.env.VITE_APP_ENV || "development"),
  },
})
