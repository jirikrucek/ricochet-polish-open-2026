import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { createMockMatch } from '../test-utils';

// ─── Mock supabase ──────────────────────────────────────────────────────────

vi.mock('../lib/supabase', () => ({
    isSupabaseConfigured: false,
    supabase: {
        from: vi.fn(),
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis(),
        })),
        removeChannel: vi.fn(),
    },
}));

// ─── Mock useAuth ───────────────────────────────────────────────────────────

vi.mock('../hooks/useAuth.tsx', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        isLoading: false,
        login: () => true,
        logout: () => { },
    }),
}));

// ─── Mock TournamentContext ─────────────────────────────────────────────────

vi.mock('./TournamentContext', () => ({
    useTournament: () => ({
        activeTournamentId: 'test-tournament-1',
        tournaments: [],
    }),
}));

import { MatchesProvider, useMatchesContext } from './MatchesContext';

const BASE_KEY = 'brazilian_v14_GLOBAL_STATE';
const LS_KEY = `${BASE_KEY}_test-tournament-1`;

const wrapper = ({ children }) => (
    <MatchesProvider>{children}</MatchesProvider>
);

// ─────────────────────────────────────────────────────────────────────────────

describe('MatchesContext (localStorage mode)', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    // ─── Initial Loading ────────────────────────────────────────────────

    describe('initial loading', () => {
        it('should start with empty matches when no data in localStorage', async () => {
            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current.matches).toEqual([]);
            });
        });

        it('should load matches from localStorage', async () => {
            const mockMatches = [
                createMockMatch({ id: 'wb-r1-m1', score1: 3, score2: 0 }),
                createMockMatch({ id: 'wb-r1-m2', score1: 1, score2: 2 }),
            ];
            localStorage.setItem(LS_KEY, JSON.stringify(mockMatches));

            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current.matches).toHaveLength(2);
            });
        });

        it('should handle corrupt localStorage data gracefully', async () => {
            localStorage.setItem(LS_KEY, 'invalid-json!!!');

            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            // Should not crash; fallback to empty
            await waitFor(() => {
                expect(result.current.matches).toEqual([]);
            });
        });
    });

    // ─── saveMatches ────────────────────────────────────────────────────

    describe('saveMatches', () => {
        it('should save matches to localStorage', async () => {
            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSaving).toBe(false);
            });

            const newMatches = [
                createMockMatch({ id: 'wb-r1-m1', score1: 3, score2: 0, winnerId: 'p1', status: 'finished' }),
                createMockMatch({ id: 'wb-r1-m2', score1: 1, score2: 2, status: 'live' }),
            ];

            await act(async () => {
                await result.current.saveMatches(newMatches);
            });

            // Check state updated
            expect(result.current.matches).toHaveLength(2);

            // Check localStorage
            const stored = JSON.parse(localStorage.getItem(LS_KEY));
            expect(stored).toHaveLength(2);
            expect(stored[0].id).toBe('wb-r1-m1');
        });

        it('should create a backup in localStorage', async () => {
            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSaving).toBe(false);
            });

            const newMatches = [createMockMatch({ id: 'wb-r1-m1' })];

            await act(async () => {
                await result.current.saveMatches(newMatches);
            });

            const backup = localStorage.getItem('ricochet_matches_backup');
            expect(backup).toBeTruthy();
            expect(JSON.parse(backup)).toHaveLength(1);
        });

        it('should perform optimistic update (update state immediately)', async () => {
            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current.matches).toEqual([]);
            });

            const newMatches = [
                createMockMatch({ id: 'wb-r1-m1', score1: 2, score2: 1 }),
            ];

            await act(async () => {
                await result.current.saveMatches(newMatches);
            });

            // State should be updated immediately
            expect(result.current.matches).toEqual(newMatches);
        });
    });

    // ─── resetMatches ───────────────────────────────────────────────────

    describe('resetMatches', () => {
        it('should clear all matches and localStorage', async () => {
            const mockMatches = [createMockMatch({ id: 'wb-r1-m1' })];
            localStorage.setItem(LS_KEY, JSON.stringify(mockMatches));

            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current.matches).toHaveLength(1);
            });

            await act(async () => {
                await result.current.resetMatches();
            });

            expect(result.current.matches).toEqual([]);
            expect(localStorage.getItem(LS_KEY)).toBeNull();
        });
    });

    // ─── Return Value ───────────────────────────────────────────────────

    describe('returned API', () => {
        it('should return matches, saveMatches, resetMatches, and isSaving', () => {
            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            expect(result.current).toHaveProperty('matches');
            expect(result.current).toHaveProperty('saveMatches');
            expect(result.current).toHaveProperty('resetMatches');
            expect(result.current).toHaveProperty('isSaving');
            expect(typeof result.current.saveMatches).toBe('function');
            expect(typeof result.current.resetMatches).toBe('function');
        });
    });

    // ─── Context Error ──────────────────────────────────────────────────

    describe('useMatchesContext outside provider', () => {
        it('should throw an error when used outside MatchesProvider', () => {
            expect(() => {
                renderHook(() => useMatchesContext());
            }).toThrow('useMatchesContext must be used within MatchesProvider');
        });
    });
});
