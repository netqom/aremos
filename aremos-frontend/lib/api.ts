"use client";

import { ApiResponse } from "./api-types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || "aremos_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(jwt: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, jwt);
  // Set Cookie for Middleware-Protection
  // Note: HttpOnly cannot be set via JS; in Dev without Secure flag, in Prod with Secure
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=${jwt}; path=/; SameSite=Strict${secure}; Max-Age=${60 * 60}`;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  // Delete cookie (Dev without Secure, Prod with Secure)
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=; path=/; SameSite=Strict${secure}; Max-Age=0`;
}

/**
 * Typsichere API-Funktion für Anfragen an den Backend-Server
 * @param path Der API-Pfad, der aufgerufen werden soll
 * @param init Optionale Request-Optionen
 * @returns Die typisierte API-Antwort
 */
export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  console.log('API: Token exists:', !!token);
  if (token) {
    console.log('API: Token preview:', token.substring(0, 20) + '...');
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as ApiResponse<any>;
    const msg = body?.message || body?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

/**
 * Typsichere GET-Anfrage
 */
export async function apiGet<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  return api<T>(path, { ...options, method: 'GET' });
}

/**
 * Typsichere POST-Anfrage
 */
export async function apiPost<T = any, B = any>(path: string, body: B, options: RequestInit = {}): Promise<T> {
  return api<T>(path, { 
    ...options, 
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
}

/**
 * Typsichere PUT-Anfrage
 */
export async function apiPut<T = any, B = any>(path: string, body: B, options: RequestInit = {}): Promise<T> {
  return api<T>(path, { 
    ...options, 
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
}

/**
 * Typsichere PATCH-Anfrage
 */
export async function apiPatch<T = any, B = any>(path: string, body: B, options: RequestInit = {}): Promise<T> {
  return api<T>(path, { 
    ...options, 
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });
}

/**
 * Typsichere DELETE-Anfrage
 */
export async function apiDelete<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  return api<T>(path, { ...options, method: 'DELETE' });
}