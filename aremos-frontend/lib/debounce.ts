"use client";

import React, { useState, useEffect } from 'react';

/**
 * Erstellt eine debounced Version einer Funktion
 * @param func Die zu debouncende Funktion
 * @param wait Wartezeit in Millisekunden
 * @returns Debounced Funktion
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * React Hook für debounced Werte
 * @param value Der zu debouncende Wert
 * @param delay Verzögerung in Millisekunden
 * @returns Debounced Wert
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * React Hook für debounced Funktionsaufrufe
 * @param callback Die zu debouncende Funktion
 * @param delay Verzögerung in Millisekunden
 * @param deps Abhängigkeiten (wie bei useEffect)
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): [(...args: Parameters<T>) => void, boolean] {
  const [isWaiting, setIsWaiting] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Erstelle eine memoized debounced Funktion
  const debouncedCallback = React.useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsWaiting(true);
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
      setIsWaiting(false);
      timeoutRef.current = null;
    }, delay);
  }, [delay, ...deps]);
  
  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [debouncedCallback, isWaiting];
}
