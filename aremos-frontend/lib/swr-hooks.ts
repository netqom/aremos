"use client";

import useSWR from 'swr';
import { api } from './api';
import { Deck, NotificationItem, Classroom } from './api-types';
import { isWithin48Hours } from './timezone';

// Standard SWR Fetcher mit AbortController
const fetcher = async <T>(url: string): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 Sekunden Timeout
  
  try {
    const data = await api<T>(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Hook zum Laden von Decks mit Client-Side Caching
 * @param options SWR Optionen
 * @returns Deck-Daten und SWR Status
 */
export function useDecks(options = {}) {
  return useSWR<Deck[]>('/api/decks/', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 Minute Cache
    ...options
  });
}

/**
 * Hook zum Laden von fälligen Decks mit Client-Side Caching
 * @param options SWR Optionen
 * @returns Fällige Decks und SWR Status
 */
export function useDueDecks(options = {}) {
  return useSWR<{ deckId: number, dueDate: string }[]>('/api/decks/with-due', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 Minute Cache
    ...options
  });
}

/**
 * Hook zum Laden von Benachrichtigungen mit Client-Side Caching
 * @param options SWR Optionen
 * @returns Benachrichtigungen und SWR Status
 */
export function useCachedNotifications(options = {}) {
  const { data, error, mutate } = useSWR<NotificationItem[]>('/api/notifications/', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 Sekunden Cache
    ...options
  });

  // Filtere Benachrichtigungen nach 48h Regel
  const filteredData = data?.filter(notification => 
    isWithin48Hours(notification.createdAt || notification.expiresAt)
  );

  return {
    notifications: filteredData,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

/**
 * Hook zum Laden von Classrooms mit Client-Side Caching
 * @param options SWR Optionen
 * @returns Classroom-Daten und SWR Status
 */
export function useClassrooms(options = {}) {
  const { data, error, mutate } = useSWR<{ items: Classroom[] }>('/api/classrooms/?page=1&pageSize=100', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 Minute Cache
    ...options
  });

  return {
    classrooms: data?.items || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

/**
 * Hook zum Laden eines einzelnen Decks mit Client-Side Caching
 * @param id Deck-ID
 * @param options SWR Optionen
 * @returns Deck-Daten und SWR Status
 */
export function useDeck(id: string | number, options = {}) {
  return useSWR<Deck>(id ? `/api/decks/${id}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 Sekunden Cache
    ...options
  });
}
