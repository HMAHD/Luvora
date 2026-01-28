'use client';

import { useState, useEffect } from 'react';

/**
 * A hydration-safe hook to use localStorage.
 * Returns the stored value, a setter, and a mounted flag.
 *
 * @param key The key to store in localStorage.
 * @param initialValue The initial value to use if no value is stored.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    // Always start with initialValue/null to match Server
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
    }, [key]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue, isMounted] as const;
}
