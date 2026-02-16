import React from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';

// ─── Mock Data Factories ────────────────────────────────────────────────────

export const createMockPlayer = (overrides = {}) => ({
    id: overrides.id || `player-${Math.random().toString(36).slice(2, 8)}`,
    full_name: overrides.full_name || 'Test Player',
    country: overrides.country || 'pl',
    elo: overrides.elo ?? 1500,
    tournament_id: overrides.tournament_id || 'test-tournament-1',
    ...overrides,
});

export const createMockPlayers = (count = 32) => {
    return Array.from({ length: count }, (_, i) => createMockPlayer({
        id: `player-${i + 1}`,
        full_name: `Player ${i + 1}`,
        elo: 2000 - (i * 50),
    }));
};

export const createBYEPlayer = (index = 0) => ({
    id: `bye-${index}`,
    full_name: 'BYE',
    isBye: true,
});

export const createMockMatch = (overrides = {}) => ({
    id: overrides.id || 'wb-r1-m1',
    bracket: overrides.bracket || 'wb',
    round: overrides.round ?? 1,
    player1Id: overrides.player1Id || null,
    player2Id: overrides.player2Id || null,
    score1: overrides.score1 ?? null,
    score2: overrides.score2 ?? null,
    winnerId: overrides.winnerId || null,
    status: overrides.status || 'scheduled',
    microPoints: overrides.microPoints || [],
    court: overrides.court || '',
    manualOrder: overrides.manualOrder ?? null,
    finishedAt: overrides.finishedAt || null,
    ...overrides,
});

export const createMockTournament = (overrides = {}) => ({
    id: overrides.id || 'test-tournament-1',
    name: overrides.name || 'Test Tournament',
    date: overrides.date || new Date().toISOString(),
    status: overrides.status || 'setup',
    address: overrides.address || 'Test City',
    ...overrides,
});

// ─── LocalStorage Mock ──────────────────────────────────────────────────────

export const createMockLocalStorage = () => {
    const store = {};
    return {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(key => delete store[key]); },
        get _store() { return { ...store }; },
    };
};

// ─── Render with i18n Provider ──────────────────────────────────────────────

export const renderWithI18n = (ui, options = {}) => {
    return render(
        <I18nextProvider i18n={i18n}>
            {ui}
        </I18nextProvider>,
        options
    );
};

// ─── Supabase Mock Helpers ──────────────────────────────────────────────────

export const createMockSupabaseResponse = (data = [], error = null) => ({
    data,
    error,
});

export const createMockSupabaseChain = (finalResponse = { data: [], error: null }) => {
    const chain = {
        select: () => chain,
        insert: () => chain,
        update: () => chain,
        delete: () => chain,
        upsert: () => chain,
        eq: () => chain,
        order: () => chain,
        single: () => Promise.resolve(finalResponse),
        then: (resolve) => resolve(finalResponse),
    };

    // Make chain itself thenable
    return {
        ...chain,
        then: (resolve) => resolve(finalResponse),
        catch: () => chain,
    };
};
