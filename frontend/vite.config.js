import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://127.0.0.1:8000',
                ws: true,
                changeOrigin: true,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    charts: ['recharts'],
                    motion: ['framer-motion'],
                },
            },
        },
    },
});
