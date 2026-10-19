import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Served from https://lamia-mim.github.io/band-seven/
export default defineConfig({
  base: '/band-seven/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Band Seven: IELTS Academic prep',
        short_name: 'Band Seven',
        description: 'A daily IELTS Academic plan with practice, vocabulary and rewards.',
        theme_color: '#1f4fd6',
        background_color: '#f7f8fa',
        display: 'standalone',
        start_url: '/band-seven/',
        scope: '/band-seven/',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // the on-device AI runtime is 6 MB: fetch it only for people who choose it, then keep it
        globIgnores: ['**/webllm*'],
        runtimeCaching: [{ urlPattern: /\/assets\/webllm.*\.js$/, handler: 'CacheFirst', options: { cacheName: 'webllm-runtime' } }],
      },
    }),
  ],
  build: {
    rollupOptions: { output: { manualChunks: (id) => (id.includes('@mlc-ai/web-llm') ? 'webllm' : undefined) } },
    chunkSizeWarningLimit: 7000,
  },
  test: { environment: 'node' },
});
