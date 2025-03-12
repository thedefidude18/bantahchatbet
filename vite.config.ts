import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tawk.to;
        style-src 'self' 'unsafe-inline' https://paystack.com https://*.tawk.to;
        style-src-elem 'self' 'unsafe-inline' https://*.tawk.to;
        img-src 'self' data: https: blob: https://*.tawk.to;
        connect-src 'self' 
          https://*.tawk.to 
          wss://*.tawk.to 
          https://*.supabase.co 
          https://api.paystack.co;
        frame-src 'self' https://tawk.to https://*.tawk.to https://checkout.paystack.com;
        font-src 'self' data: https://*.tawk.to;
        media-src 'self' https://*.tawk.to;
        worker-src 'self' blob:;
        child-src blob:;
        object-src 'none';
      `.replace(/\s+/g, ' ').trim()
    }
  }
});
