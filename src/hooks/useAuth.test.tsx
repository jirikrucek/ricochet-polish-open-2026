import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './useAuth.tsx';

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    // ─── Initial State ──────────────────────────────────────────────────

    describe('initial state', () => {
        it('should start as not authenticated', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            // Wait for loading to finish
            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should restore auth state from localStorage', async () => {
            localStorage.setItem('rpo_admin', 'true');

            const { result } = renderHook(() => useAuth(), { wrapper });

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isAuthenticated).toBe(true);
        });

        it('should not restore auth if localStorage value is not "true"', async () => {
            localStorage.setItem('rpo_admin', 'false');

            const { result } = renderHook(() => useAuth(), { wrapper });

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    // ─── Login ──────────────────────────────────────────────────────────

    describe('login', () => {
        it('should authenticate with correct credentials', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let loginResult;
            act(() => {
                loginResult = result.current.login('kacper', 'rpo26');
            });

            expect(loginResult).toBe(true);
            expect(result.current.isAuthenticated).toBe(true);
            expect(localStorage.getItem('rpo_admin')).toBe('true');
        });

        it('should reject incorrect username', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let loginResult;
            act(() => {
                loginResult = result.current.login('wronguser', 'rpo26');
            });

            expect(loginResult).toBe(false);
            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should reject incorrect password', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let loginResult;
            act(() => {
                loginResult = result.current.login('kacper', 'wrongpass');
            });

            expect(loginResult).toBe(false);
            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should handle whitespace in credentials (normalize + trim)', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let loginResult;
            act(() => {
                loginResult = result.current.login('  kacper  ', '  rpo26  ');
            });

            expect(loginResult).toBe(true);
            expect(result.current.isAuthenticated).toBe(true);
        });
    });

    // ─── Logout ─────────────────────────────────────────────────────────

    describe('logout', () => {
        it('should clear authentication state', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await vi.waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Login first
            act(() => {
                result.current.login('kacper', 'rpo26');
            });
            expect(result.current.isAuthenticated).toBe(true);

            // Logout
            act(() => {
                result.current.logout();
            });

            expect(result.current.isAuthenticated).toBe(false);
            expect(localStorage.getItem('rpo_admin')).toBeNull();
        });
    });

    // ─── Outside Provider ───────────────────────────────────────────────

    describe('outside provider', () => {
        it('should return a default guest state when used outside AuthProvider', () => {
            const { result } = renderHook(() => useAuth());

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.login('kacper', 'rpo26')).toBe(false);
            expect(() => result.current.logout()).not.toThrow();
        });
    });
});
