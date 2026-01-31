import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

// Mock standard LocalStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        },
        removeItem: (key: string) => {
            delete store[key];
        }
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

// Also set it on window for browser environment
if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
    });
}

describe('Auth: Hydration & LocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    test('useLocalStorage hydrates from existing data', async () => {
        localStorage.setItem('role', JSON.stringify('masculine'));

        const { result } = renderHook(() => useLocalStorage('role', 'neutral'));

        await waitFor(() => {
            expect(result.current[0]).toBe('masculine');
        });
    });

    test('useLocalStorage handles malformed JSON safely', () => {
        localStorage.setItem('role', 'INVALID_JSON_%%%');

        // Should catch error and use default
        const { result } = renderHook(() => useLocalStorage('role', 'neutral'));

        expect(result.current[0]).toBe('neutral');
    });

    test('useLocalStorage updates persistence', () => {
        const { result } = renderHook(() => useLocalStorage('theme', 'dark'));

        act(() => {
            result.current[1]('light');
        });

        expect(localStorage.getItem('theme')).toBe(JSON.stringify('light'));
    });
});
