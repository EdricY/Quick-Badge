import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      // minify: false,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-530.png', 'index.html'],

      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      devOptions: {
        enabled: true,
        type: "module"
      },

      manifest: {
        "short_name": "Quick Badge",
        "name": "Quick Badge",
        "icons": [
          {
            "src": "favicon.ico",
            "sizes": "64x64 32x32 24x24 16x16",
            "type": "image/x-icon"
          },
          {
            "src": "icon-530.png",
            "type": "image/png",
            "sizes": "192x192 512x512"
          }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#ffffff",
        "background_color": "#242424"
      },
    })
  ],
})
