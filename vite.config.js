import { defineConfig } from 'vite';

const GAS_EXEC =
  'https://script.google.com/macros/s/AKfycbzzCFgGmXhIDc7xlaJa_XpacGMu3GBn7d0kg2ntRgUrpuisnV__AjF_8pJGXgG6NaMP0A/exec';

export default defineConfig({
  root: '.', // seu index.html está na raiz

  build: {
    outDir: 'dist', // pasta de saída
    emptyOutDir: true, // limpa a pasta antes de cada build
    assetsDir: 'assets',
  },

  // ⬇️ Aqui entra o proxy só para ambiente de DEV (npm run dev)
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      // JSON (lista de avaliações, etc.)
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

      // Imagens (mesmo exec, mas com action=img...)
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
    },
  },
});
