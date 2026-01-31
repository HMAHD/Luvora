import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'happy-dom', // Default environment for unit tests
        include: [
            'tests/api/**/*.test.{js,ts,jsx,tsx}',
            'tests/unit/**/*.test.{js,ts,jsx,tsx}',
            'tests/integration/**/*.test.{js,ts,jsx,tsx}',
            'tests/lib/**/*.test.{js,ts,jsx,tsx}',
        ], // Explicitly include only test directories, exclude e2e
        exclude: ['node_modules/**/*', '**/e2e/**/*'], // Exclude E2E and node_modules
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
