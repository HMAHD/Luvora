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
         
        setIsMounted(true);

        const readValue = () => {
            try {
                const item = window.localStorage.getItem(key);
                if (item) {
                    setStoredValue(JSON.parse(item));
                }
            } catch (error) {
                console.warn(`Error reading localStorage key "${key}":`, error);
            }
        };

        // 1. Initial read
        readValue();

        // 2. Listen for changes from other components (dispatching custom event)
        const handleStorageChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            // Check if this specific key was updated
            if (customEvent.detail === key) {
                readValue();
            }
        };

        window.addEventListener('local-storage', handleStorageChange);

        // 3. Listen for changes from other tabs
        window.addEventListener('storage', readValue);

        return () => {
            window.removeEventListener('local-storage', handleStorageChange);
            window.removeEventListener('storage', readValue);
        };
    }, [key]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                // Dispatch custom event to notify other components
                window.dispatchEvent(new CustomEvent('local-storage', { detail: key }));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue, isMounted] as const;
}
