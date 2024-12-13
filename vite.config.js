import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath, URL } from 'node:url'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
    plugins: [vue()],
    server: {
    proxy: {
      '/comments': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/comments/, '/comments')
      }
    }
    },
    resolve: {
	alias: {
	    '@': path.resolve(__dirname, './src'),
    },
  },
});

