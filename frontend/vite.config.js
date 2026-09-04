/**
 * vite.config.js - Vite Configuration
 * CashSight Frontend Build Configuration
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],

  // ============================================
  // SERVER CONFIGURATION
  // ============================================
  server: {
    port: 5173,
    host: true,
    open: true,
    strictPort: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://cashsight-api.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ============================================
  // BUILD CONFIGURATION
  // ============================================
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          utils: ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // ============================================
  // RESOLVE ALIASES
  // ============================================
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@context': path.resolve(__dirname, './src/context'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },

  // ============================================
  // CSS CONFIGURATION
  // ============================================
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },

  // ============================================
  // DEPENDENCY OPTIMIZATION
  // ============================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'axios',
    ],
  },

  // ============================================
  // PREVIEW CONFIGURATION
  // ============================================
  preview: {
    port: 4173,
    host: true,
    open: true,
  },
})