import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';
/* -----------------------------------------------------------------------------*/
/* ⚙️ Vite — System Config (JS)
 *
 * Nível / Level: Core / Infrastructure
 *
 * PT: Configuração do Vite para desenvolvimento e build do sistema.
 *     Inclui suporte a Handlebars, build output e proxy para integração
 *     com Google Apps Script (GAS) em ambiente de desenvolvimento.
 *
 * EN: Vite configuration for system development and build.
 *     Includes Handlebars support, build output and proxy setup
 *     for Google Apps Script (GAS) integration in development.
 */
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
/* GAS Endpoint
 *
 * PT: Endpoint principal do Google Apps Script.
 * EN: Main Google Apps Script endpoint.
 */
/* -----------------------------------------------------------------------------*/

const GAS_EXEC =
  'https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec';

export default defineConfig({
  /* Root */
  root: '.',

  /* ---------------------------------------------------------------------------*/
  /* Plugins
   *
   * PT: Plugins utilizados no sistema.
   * EN: Plugins used in the system.
   */
  /* ---------------------------------------------------------------------------*/
  plugins: [
    handlebars({
      partialDirectory: [
        resolve(__dirname, 'src/foundation'),
        resolve(__dirname, 'src/foundation/partials'),
      ],
    }),
  ],

  /* ---------------------------------------------------------------------------*/
  /* Build Config
   *
   * PT: Configurações de saída e organização do build.
   * EN: Build output and structure configuration.
   */
  /* ---------------------------------------------------------------------------*/
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },

  /* ---------------------------------------------------------------------------*/
  /* Dev Server / Proxy
   *
   * PT: Configuração do servidor local com proxy para evitar CORS
   *     ao consumir o GAS durante desenvolvimento.
   *
   * EN: Local server configuration with proxy to avoid CORS
   *     when consuming GAS during development.
   */
  /* ---------------------------------------------------------------------------*/
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      /* GAS Image Proxy */
      '/gas-img': {
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(
            /^\/gas-img/,
            '/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec'
          ),
      },

      /* GAS JSON Proxy */
      '/gas': {
        target: 'https://script.google.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(
            /^\/gas/,
            '/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec'
          ),
      },
    },
  },
});
