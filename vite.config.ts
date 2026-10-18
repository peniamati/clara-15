import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ mode }) => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), {
      name: 'legacy-pages-entry',
      generateBundle(_options, bundle) {
        // Let previously cached HTML reach the new entry during this transition.
        // Newly published HTML references the content-hashed files directly.
        const entry = Object.values(bundle).find(item => item.type === 'chunk' && item.isEntry);
        if (entry?.type === 'chunk') {
          this.emitFile({ type: 'asset', fileName: 'assets/index.js', source: `import './${path.posix.basename(entry.fileName)}';\n` });
        }
        const css = Object.values(bundle).find(item => item.type === 'asset' && item.fileName.endsWith('.css'));
        if (css) this.emitFile({ type: 'asset', fileName: 'assets/index.css', source: `@import url('./${path.posix.basename(css.fileName)}');\n` });
      },
    }],
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
        output: {
          // A changed build gets new URLs, so Pages' 10-minute asset cache
          // cannot keep serving an earlier version under the same filename.
          // AsyncPanelBoundary handles old open pages requesting retired chunks.
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      // HMR can be disabled with DISABLE_HMR for stable previews.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
