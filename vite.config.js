import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // Create a seamless local proxy to bypass browser CORS when hitting Resend
      '/api/resend': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/resend/, '/emails')
      }
    }
  }
});
