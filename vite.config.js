import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: './',
  
  // Development server config
  server: {
    port: 5173,
    open: true
  },
  
  // Build config
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});

