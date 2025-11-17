import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/room': {
        target: 'ws://localhost:8787',
        ws: true
      },
      '/history': {
        target: 'http://localhost:8787',
        changeOrigin: true
      },
      '/export': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});