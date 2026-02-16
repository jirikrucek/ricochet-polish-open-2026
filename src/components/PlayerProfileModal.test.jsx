import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import PlayerProfileModal from './PlayerProfileModal';
import { createMockPlayer, createMockMatch } from '../test-utils';

// ─── Mock countries module ──────────────────────────────────────────────────

vi.mock('../constants/countries', () => ({
    getCountryCode: (country) => {
        const map = { Poland: 'pl', Germany: 'de', 'pl': 'pl' };
        return map[country] || null;
    },
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderModal = (props = {}) => {
    const defaults = {
        player: createMockPlayer({ id: 'p1', full_name: 'Kowalski Jan', country: 'pl', elo: 1800 }),
        matches: [],
        allPlayers: [],
        onClose: vi.fn(),
    };

    return render(
        <I18nextProvider i18n={i18n}>
            <PlayerProfileModal {...defaults} {...props} />
        </I18nextProvider>
    );
};

// ─────────────────────────────────────────────────────────────────────────────

describe('PlayerProfileModal', () => {
    // ─── Rendering ──────────────────────────────────────────────────────

    describe('rendering', () => {
        it('should render player name', () => {
            renderModal();
            expect(screen.getByText('Kowalski Jan')).toBeInTheDocument();
        });

        it('should render player ELO', () => {
            const { container } = renderModal();
            // ELO appears in "POINTS 1800" span inside badge-elo
            const eloSpan = container.querySelector('.badge-elo span');
            expect(eloSpan).toBeInTheDocument();
            expect(eloSpan.textContent).toContain('1800');
        });

        it('should render player country flag', () => {
            const { container } = renderModal();
            // Country flag image should be present
            const flagImg = container.querySelector('img[src*="flagcdn"]');
            expect(flagImg).toBeInTheDocument();
        });

        it('should return null when player is null', () => {
            const { container } = renderModal({ player: null });
            expect(container.innerHTML).toBe('');
        });
    });

    // ─── Stats Calculation ──────────────────────────────────────────────

    describe('stats calculation', () => {
        it('should display correct wins and losses', () => {
            const player = createMockPlayer({ id: 'p1', full_name: 'Test Player' });
            const opponent = createMockPlayer({ id: 'p2', full_name: 'Opponent' });

            const matches = [
                createMockMatch({
                    id: 'wb-r1-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    score1: 3,
                    score2: 1,
                    winnerId: 'p1',
                    status: 'finished',
                }),
                createMockMatch({
                    id: 'wb-r2-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    score1: 0,
                    score2: 3,
                    winnerId: 'p2',
                    status: 'finished',
                }),
                createMockMatch({
                    id: 'lb-r1-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    score1: 2,
                    score2: 0,
                    winnerId: 'p1',
                    status: 'finished',
                }),
            ];

            const { container } = renderModal({ player, matches, allPlayers: [player, opponent] });

            // Stats are displayed in stat-card divs
            const statValues = container.querySelectorAll('.stat-value');
            const played = statValues[0]?.textContent;
            const wins = statValues[1]?.textContent;
            const losses = statValues[2]?.textContent;
            expect(played).toBe('3');  // played
            expect(wins).toBe('2');    // wins
            expect(losses).toBe('1');  // losses
        });

        it('should show 0 stats when no matches played', () => {
            renderModal({ matches: [] });

            // All stats should be 0
            const zeros = screen.getAllByText('0');
            expect(zeros.length).toBeGreaterThanOrEqual(3); // played, wins, losses
        });

        it('should not count pending matches as played', () => {
            const player = createMockPlayer({ id: 'p1' });
            const matches = [
                createMockMatch({
                    id: 'wb-r1-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    status: 'pending',
                    // no winner
                }),
            ];

            renderModal({ player, matches, allPlayers: [player] });

            // played should be 0 (pending doesn't count)
            const zeros = screen.getAllByText('0');
            expect(zeros.length).toBeGreaterThanOrEqual(3);
        });
    });

    // ─── Score Flipping ─────────────────────────────────────────────────

    describe('score display', () => {
        it('should show correct scores from player perspective (P1)', () => {
            const player = createMockPlayer({ id: 'p1', full_name: 'Player 1' });
            const opponent = createMockPlayer({ id: 'p2', full_name: 'Opponent' });

            const matches = [
                createMockMatch({
                    id: 'wb-r1-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    score1: 3,
                    score2: 1,
                    winnerId: 'p1',
                    status: 'finished',
                }),
            ];

            const { container } = renderModal({ player, matches, allPlayers: [player, opponent] });

            // Player's score (3) should appear in the score-win span
            const winSpan = container.querySelector('.score-win');
            expect(winSpan).toBeInTheDocument();
            expect(winSpan.textContent).toBe('3');
        });

        it('should flip scores when player is P2', () => {
            const player = createMockPlayer({ id: 'p2', full_name: 'Player 2' });
            const opponent = createMockPlayer({ id: 'p1', full_name: 'Opponent' });

            const matches = [
                createMockMatch({
                    id: 'wb-r1-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    score1: 1,
                    score2: 3,
                    winnerId: 'p2',
                    status: 'finished',
                }),
            ];

            const { container } = renderModal({ player, matches, allPlayers: [player, opponent] });

            // From P2 perspective: their score (3) should be in score-win span
            const winSpan = container.querySelector('.score-win');
            expect(winSpan).toBeInTheDocument();
            expect(winSpan.textContent).toBe('3');
        });
    });

    // ─── Match History ──────────────────────────────────────────────────

    describe('match history', () => {
        it('should show opponent name in match history', () => {
            const player = createMockPlayer({ id: 'p1', full_name: 'Player 1' });
            const opponent = createMockPlayer({ id: 'p2', full_name: 'Opponent Name' });

            const matches = [
                createMockMatch({
                    id: 'wb-r1-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    score1: 3,
                    score2: 1,
                    winnerId: 'p1',
                    status: 'finished',
                }),
            ];

            renderModal({ player, matches, allPlayers: [player, opponent] });

            expect(screen.getByText('Opponent Name')).toBeInTheDocument();
        });

        it('should show "TBD" for unknown opponents', () => {
            const player = createMockPlayer({ id: 'p1' });

            const matches = [
                createMockMatch({
                    id: 'wb-r1-m1',
                    player1Id: 'p1',
                    player2Id: 'unknown-id',
                    status: 'scheduled',
                }),
            ];

            const { container } = renderModal({ player, matches, allPlayers: [player] });

            // Opponent defaults to { full_name: 'TBD' } when not found
            const opponentDiv = container.querySelector('.history-opponent');
            expect(opponentDiv).toBeInTheDocument();
            expect(opponentDiv.textContent).toContain('TBD');
        });

        it('should show win/loss badges', () => {
            const player = createMockPlayer({ id: 'p1' });
            const opponent = createMockPlayer({ id: 'p2', full_name: 'Opp' });

            const matches = [
                createMockMatch({
                    id: 'wb-r1-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    winnerId: 'p1',
                    score1: 3,
                    score2: 0,
                    status: 'finished',
                }),
                createMockMatch({
                    id: 'wb-r2-m1',
                    player1Id: 'p1',
                    player2Id: 'p2',
                    winnerId: 'p2',
                    score1: 1,
                    score2: 3,
                    status: 'finished',
                }),
            ];

            const { container } = renderModal({ player, matches, allPlayers: [player, opponent] });

            // Check result-badge elements
            const badges = container.querySelectorAll('.result-badge');
            const badgeTexts = Array.from(badges).map(b => b.textContent.trim());
            expect(badgeTexts).toContain('W');
            expect(badgeTexts).toContain('L');
        });

        it('should display bracket info in match history', () => {
            const player = createMockPlayer({ id: 'p1' });
            const opponent = createMockPlayer({ id: 'p2', full_name: 'Opp' });

            const matches = [
                createMockMatch({
                    id: 'wb-r1-m1',
                    bracket: 'wb',
                    round: 1,
                    player1Id: 'p1',
                    player2Id: 'p2',
                    winnerId: 'p1',
                    score1: 3,
                    score2: 0,
                    status: 'finished',
                }),
            ];

            const { container } = renderModal({ player, matches, allPlayers: [player, opponent] });

            // Bracket info is in history-bracket div: "WB R1"
            const bracketInfo = container.querySelector('.history-bracket');
            expect(bracketInfo).toBeInTheDocument();
            expect(bracketInfo.textContent).toMatch(/WB/);
            expect(bracketInfo.textContent).toMatch(/R1/);
        });
    });

    // ─── Close Button ───────────────────────────────────────────────────

    describe('close interaction', () => {
        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();

            const { container } = renderModal({ onClose });

            // Use CSS class to find the unique close button
            const closeButton = container.querySelector('.close-button');
            fireEvent.click(closeButton);

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should call onClose when overlay is clicked', () => {
            const onClose = vi.fn();

            const { container } = renderModal({ onClose });

            // fireEvent.click dispatches React synthetic events properly
            const overlay = container.querySelector('.modal-overlay');
            fireEvent.click(overlay);

            expect(onClose).toHaveBeenCalled();
        });
    });
});
