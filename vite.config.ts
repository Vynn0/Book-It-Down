import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // MUI components
          if (id.includes('@mui/material')) {
            return 'mui-material';
          }
          
          if (id.includes('@mui/icons-material')) {
            return 'mui-icons';
          }
          
          if (id.includes('@mui/x-date-pickers')) {
            return 'mui-pickers';
          }
          
          // Calendar libraries
          if (id.includes('@fullcalendar')) {
            return 'calendar';
          }
          
          // Date libraries
          if (id.includes('date-fns') || id.includes('dayjs')) {
            return 'date-libs';
          }
          
          // Backend
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // Large utility libraries
          if (id.includes('bcrypt') || id.includes('lodash')) {
            return 'utils';
          }
          
          // Node modules (other vendor libraries)
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  base: '/',
})
