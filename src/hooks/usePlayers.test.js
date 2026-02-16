import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mock supabase BEFORE importing usePlayers ──────────────────────────────

const { mockFrom, mockChannel, mockRemoveChannel } = vi.hoisted(() => ({
    mockFrom: vi.fn(),
    mockChannel: vi.fn(),
    mockRemoveChannel: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
    isSupabaseConfigured: false,
    supabase: {
        from: mockFrom,
        channel: mockChannel,
        removeChannel: mockRemoveChannel,
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

vi.mock('../contexts/TournamentContext', () => ({
    useTournament: () => ({
        activeTournamentId: 'test-tournament-1',
        tournaments: [],
    }),
}));

import { usePlayers } from './usePlayers';
import { createMockPlayer } from '../test-utils';

// ─────────────────────────────────────────────────────────────────────────────

describe('usePlayers (localStorage mode)', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
        mockFrom.mockReset();
    });

    it('should initialize with empty players when no data in localStorage', async () => {
        const { result } = renderHook(() => usePlayers());

        await waitFor(() => {
            expect(result.current.players).toEqual([]);
        });
    });

    it('should load players from localStorage', async () => {
        const mockPlayers = [
            createMockPlayer({ id: 'p1', full_name: 'Player One' }),
            createMockPlayer({ id: 'p2', full_name: 'Player Two' }),
        ];
        localStorage.setItem(
            'ricochet_players_db_test-tournament-1',
            JSON.stringify(mockPlayers)
        );

        const { result } = renderHook(() => usePlayers());

        await waitFor(() => {
            expect(result.current.players).toHaveLength(2);
            expect(result.current.players[0].full_name).toBe('Player One');
        });
    });

    // ─── addPlayer ──────────────────────────────────────────────────────

    describe('addPlayer', () => {
        it('should add a player to localStorage', async () => {
            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toEqual([]);
            });

            let newPlayer;
            await act(async () => {
                newPlayer = await result.current.addPlayer({
                    full_name: 'New Player',
                    country: 'pl',
                    elo: 1500,
                });
            });

            expect(newPlayer).not.toBeNull();
            expect(newPlayer.full_name).toBe('New Player');
            expect(newPlayer.country).toBe('pl');
            expect(newPlayer.elo).toBe(1500);
            expect(newPlayer.id).toBeDefined();
            expect(result.current.players).toHaveLength(1);

            // Verify localStorage was updated
            const stored = JSON.parse(localStorage.getItem('ricochet_players_db_test-tournament-1'));
            expect(stored).toHaveLength(1);
        });

        it('should handle fullName alias', async () => {
            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toEqual([]);
            });

            let newPlayer;
            await act(async () => {
                newPlayer = await result.current.addPlayer({
                    fullName: 'Aliased Player',
                });
            });

            expect(newPlayer.full_name).toBe('Aliased Player');
        });

        it('should default elo to 0 when not provided', async () => {
            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toEqual([]);
            });

            let newPlayer;
            await act(async () => {
                newPlayer = await result.current.addPlayer({
                    full_name: 'No Elo Player',
                });
            });

            expect(newPlayer.elo).toBe(0);
        });
    });

    // ─── updatePlayer ───────────────────────────────────────────────────

    describe('updatePlayer', () => {
        it('should update a player in localStorage', async () => {
            const mockPlayers = [createMockPlayer({ id: 'p1', full_name: 'Original Name' })];
            localStorage.setItem('ricochet_players_db_test-tournament-1', JSON.stringify(mockPlayers));

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toHaveLength(1);
            });

            await act(async () => {
                await result.current.updatePlayer('p1', { full_name: 'Updated Name' });
            });

            expect(result.current.players[0].full_name).toBe('Updated Name');

            const stored = JSON.parse(localStorage.getItem('ricochet_players_db_test-tournament-1'));
            expect(stored[0].full_name).toBe('Updated Name');
        });
    });

    // ─── deletePlayer ───────────────────────────────────────────────────

    describe('deletePlayer', () => {
        it('should remove a player from localStorage', async () => {
            const mockPlayers = [
                createMockPlayer({ id: 'p1', full_name: 'Player One' }),
                createMockPlayer({ id: 'p2', full_name: 'Player Two' }),
            ];
            localStorage.setItem('ricochet_players_db_test-tournament-1', JSON.stringify(mockPlayers));

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toHaveLength(2);
            });

            await act(async () => {
                await result.current.deletePlayer('p1');
            });

            expect(result.current.players).toHaveLength(1);
            expect(result.current.players[0].id).toBe('p2');

            const stored = JSON.parse(localStorage.getItem('ricochet_players_db_test-tournament-1'));
            expect(stored).toHaveLength(1);
        });
    });

    // ─── bulkUpsertPlayers ──────────────────────────────────────────────

    describe('bulkUpsertPlayers', () => {
        it('should add multiple players at once', async () => {
            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toEqual([]);
            });

            let response;
            await act(async () => {
                response = await result.current.bulkUpsertPlayers([
                    { full_name: 'Player A', country: 'pl', elo: 1500 },
                    { full_name: 'Player B', country: 'de', elo: 1600 },
                    { full_name: 'Player C', country: 'nl', elo: 1700 },
                ]);
            });

            expect(response.success).toBe(true);
            expect(response.count).toBe(3);
            expect(result.current.players).toHaveLength(3);
        });

        it('should handle elo as dash or missing', async () => {
            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toEqual([]);
            });

            await act(async () => {
                await result.current.bulkUpsertPlayers([
                    { full_name: 'No Elo', country: 'pl', elo: '-' },
                    { full_name: 'No Elo 2', country: 'pl' },
                ]);
            });

            expect(result.current.players[0].elo).toBe(0);
            expect(result.current.players[1].elo).toBe(0);
        });
    });

    // ─── Return Value ───────────────────────────────────────────────────

    describe('returned API', () => {
        it('should return all expected functions', () => {
            const { result } = renderHook(() => usePlayers());

            expect(result.current).toHaveProperty('players');
            expect(result.current).toHaveProperty('addPlayer');
            expect(result.current).toHaveProperty('importPlayers');
            expect(result.current).toHaveProperty('updatePlayer');
            expect(result.current).toHaveProperty('deletePlayer');
            expect(result.current).toHaveProperty('bulkUpsertPlayers');
            expect(typeof result.current.addPlayer).toBe('function');
            expect(typeof result.current.updatePlayer).toBe('function');
            expect(typeof result.current.deletePlayer).toBe('function');
            expect(typeof result.current.bulkUpsertPlayers).toBe('function');
        });
    });
});
