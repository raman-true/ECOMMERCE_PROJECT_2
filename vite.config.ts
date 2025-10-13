import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@stripe/stripe-js'],
    exclude: ['lucide-react'],
  },
  define: {
    // Ensure environment variables are available at build time
    'process.env': process.env,
  },
  server: {
    // Proxy Edge Functions during development
    proxy: {
      '/functions': {
        target: process.env.VITE_SUPABASE_URL || 'https://kazatbfpvpalauoshzti.supabase.co',
        changeOrigin: true,
        secure: true,
        headers: {
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthemF0YmZwdnBhbGF1b3NoenRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjU1NjksImV4cCI6MjA3NTUwMTU2OX0.r5n67JGpY7yw1pHGP7KAi9wA7_MhsiiYE-nWgYr_bj0'}`,
        },
      },
    },
  },
});
