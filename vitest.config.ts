import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom', // Default environment for unit tests
        include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Only look in tests/ folder
        exclude: ['tests/e2e/**/*', 'node_modules/**/*'], // Exclude E2E (Playwright)
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
