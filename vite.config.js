import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // seu index.html está na raiz
  build: {
    outDir: 'dist', // pasta de saída
    emptyOutDir: true, // <<< limpa a pasta antes de cada build
    assetsDir: 'assets',
  },
});
