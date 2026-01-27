import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Copy manifest.json to dist
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        )
        // Copy icons
        const srcIcons = resolve(__dirname, 'public/icons')
        const distIcons = resolve(__dirname, 'dist/icons')
        if (!existsSync(distIcons)) {
          mkdirSync(distIcons, { recursive: true })
        }
        if (existsSync(srcIcons)) {
          readdirSync(srcIcons).forEach((file) => {
            if (file.endsWith('.png')) {
              copyFileSync(resolve(srcIcons, file), resolve(distIcons, file))
            }
          })
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
