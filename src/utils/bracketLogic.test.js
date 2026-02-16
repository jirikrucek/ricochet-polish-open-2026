import { describe, it, expect } from 'vitest';
import {
    getBracketBlueprint,
    rebuildBracketState,
    generateDoubleEliminationBracket,
    updateBracketMatch,
    clearBracketMatch,
} from './bracketLogic';
import { createMockPlayers, createBYEPlayer } from '../test-utils';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const findMatch = (matches, id) => matches.find(m => m.id === id);

const make32Players = () => createMockPlayers(32);

// ─────────────────────────────────────────────────────────────────────────────
// getBracketBlueprint()
// ─────────────────────────────────────────────────────────────────────────────

describe('getBracketBlueprint', () => {
    it('should generate a valid bracket structure', () => {
        const matches = getBracketBlueprint();
        expect(Array.isArray(matches)).toBe(true);
        expect(matches.length).toBeGreaterThan(0);
    });

    it('should create 16 WB R1 matches', () => {
        const matches = getBracketBlueprint();
        const wbR1 = matches.filter(m => m.bracket === 'wb' && m.round === 1);
        expect(wbR1).toHaveLength(16);
    });

    it('should create 8 WB R2 matches', () => {
        const matches = getBracketBlueprint();
        const wbR2 = matches.filter(m => m.bracket === 'wb' && m.round === 2);
        expect(wbR2).toHaveLength(8);
    });

    it('should create 4 WB R3 matches', () => {
        const matches = getBracketBlueprint();
        const wbR3 = matches.filter(m => m.bracket === 'wb' && m.round === 3);
        expect(wbR3).toHaveLength(4);
    });

    it('should create 2 WB R4 matches', () => {
        const matches = getBracketBlueprint();
        const wbR4 = matches.filter(m => m.bracket === 'wb' && m.round === 4);
        expect(wbR4).toHaveLength(2);
    });

    it('should create 1 WB R5 (WB Final) match', () => {
        const matches = getBracketBlueprint();
        const wbR5 = matches.filter(m => m.bracket === 'wb' && m.round === 5);
        expect(wbR5).toHaveLength(1);
        expect(wbR5[0].id).toBe('wb-r5-m1');
    });

    it('should create 8 LB R1 matches', () => {
        const matches = getBracketBlueprint();
        const lbR1 = matches.filter(m => m.bracket === 'lb' && m.round === 1);
        expect(lbR1).toHaveLength(8);
    });

    it('should create 8 LB R2 matches', () => {
        const matches = getBracketBlueprint();
        const lbR2 = matches.filter(m => m.bracket === 'lb' && m.round === 2);
        expect(lbR2).toHaveLength(8);
    });

    it('should create 4 LB R3 matches', () => {
        const matches = getBracketBlueprint();
        const lbR3 = matches.filter(m => m.bracket === 'lb' && m.round === 3);
        expect(lbR3).toHaveLength(4);
    });

    it('should create 4 LB R4 matches', () => {
        const matches = getBracketBlueprint();
        const lbR4 = matches.filter(m => m.bracket === 'lb' && m.round === 4);
        expect(lbR4).toHaveLength(4);
    });

    it('should create 2 LB R5 matches', () => {
        const matches = getBracketBlueprint();
        const lbR5 = matches.filter(m => m.bracket === 'lb' && m.round === 5);
        expect(lbR5).toHaveLength(2);
    });

    it('should create 2 LB R6 matches', () => {
        const matches = getBracketBlueprint();
        const lbR6 = matches.filter(m => m.bracket === 'lb' && m.round === 6);
        expect(lbR6).toHaveLength(2);
    });

    it('should create an LB Final', () => {
        const matches = getBracketBlueprint();
        const lbFinal = findMatch(matches, 'lb-final');
        expect(lbFinal).toBeDefined();
        expect(lbFinal.bracket).toBe('lb');
    });

    it('should create consolation and grand finals', () => {
        const matches = getBracketBlueprint();
        expect(findMatch(matches, 'consolation-final')).toBeDefined();
        expect(findMatch(matches, 'grand-final')).toBeDefined();
    });

    it('should create placement bracket matches (p25, p17, p13, p9, p7, p5, p4)', () => {
        const matches = getBracketBlueprint();
        // p25 group
        expect(matches.filter(m => m.bracket === 'p25').length).toBeGreaterThan(0);
        // p17 group
        expect(matches.filter(m => m.bracket === 'p17').length).toBeGreaterThan(0);
        // p13 group
        expect(matches.filter(m => m.bracket === 'p13').length).toBeGreaterThan(0);
        // p9 group
        expect(matches.filter(m => m.bracket === 'p9').length).toBeGreaterThan(0);
        // p7
        expect(findMatch(matches, 'p7-f')).toBeDefined();
        // p5
        expect(findMatch(matches, 'p5-f')).toBeDefined();
        // p4
        expect(findMatch(matches, 'p4-f')).toBeDefined();
    });

    it('should have unique IDs for all matches', () => {
        const matches = getBracketBlueprint();
        const ids = matches.map(m => m.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('should initialize all matches with null players and scores', () => {
        const matches = getBracketBlueprint();
        matches.forEach(m => {
            expect(m.player1Id).toBeNull();
            expect(m.player2Id).toBeNull();
            expect(m.score1).toBeNull();
            expect(m.score2).toBeNull();
            expect(m.winnerId).toBeNull();
            expect(m.status).toBe('scheduled');
        });
    });

    // ─── Drop Pattern Tests (getTargetDropId via blueprint) ──────────────

    it('WB R1 losers should drop to LB R1', () => {
        const matches = getBracketBlueprint();
        // wb-r1-m1 and wb-r1-m2 losers -> lb-r1-m1
        const wbR1M1 = findMatch(matches, 'wb-r1-m1');
        const wbR1M2 = findMatch(matches, 'wb-r1-m2');
        expect(wbR1M1.loserMatchId).toBe('lb-r1-m1');
        expect(wbR1M2.loserMatchId).toBe('lb-r1-m1');

        // wb-r1-m3 and wb-r1-m4 losers -> lb-r1-m2
        expect(findMatch(matches, 'wb-r1-m3').loserMatchId).toBe('lb-r1-m2');
        expect(findMatch(matches, 'wb-r1-m4').loserMatchId).toBe('lb-r1-m2');
    });

    it('WB R2 losers should drop to LB R2 (diagonal pattern)', () => {
        const matches = getBracketBlueprint();
        // wb-r2-m1 -> lb-r2-m8 (9-1=8)
        expect(findMatch(matches, 'wb-r2-m1').loserMatchId).toBe('lb-r2-m8');
        // wb-r2-m8 -> lb-r2-m1 (9-8=1)
        expect(findMatch(matches, 'wb-r2-m8').loserMatchId).toBe('lb-r2-m1');
        // wb-r2-m4 -> lb-r2-m5 (9-4=5)
        expect(findMatch(matches, 'wb-r2-m4').loserMatchId).toBe('lb-r2-m5');
    });

    it('WB R3 losers should drop to LB R4 (cross pattern)', () => {
        const matches = getBracketBlueprint();
        // wb-r3-m1 -> lb-r4-m2
        expect(findMatch(matches, 'wb-r3-m1').loserMatchId).toBe('lb-r4-m2');
        // wb-r3-m2 -> lb-r4-m1
        expect(findMatch(matches, 'wb-r3-m2').loserMatchId).toBe('lb-r4-m1');
        // wb-r3-m3 -> lb-r4-m4
        expect(findMatch(matches, 'wb-r3-m3').loserMatchId).toBe('lb-r4-m4');
        // wb-r3-m4 -> lb-r4-m3
        expect(findMatch(matches, 'wb-r3-m4').loserMatchId).toBe('lb-r4-m3');
    });

    it('WB R4 losers should drop to LB R6 (cross pattern)', () => {
        const matches = getBracketBlueprint();
        // wb-r4-m1 -> lb-r6-m2
        expect(findMatch(matches, 'wb-r4-m1').loserMatchId).toBe('lb-r6-m2');
        // wb-r4-m2 -> lb-r6-m1
        expect(findMatch(matches, 'wb-r4-m2').loserMatchId).toBe('lb-r6-m1');
    });

    it('WB R5 (WB Final) loser should drop to consolation-final', () => {
        const matches = getBracketBlueprint();
        expect(findMatch(matches, 'wb-r5-m1').loserMatchId).toBe('consolation-final');
    });

    it('should chain WB winners to next WB round correctly', () => {
        const matches = getBracketBlueprint();
        // WB R1 M1 winner -> WB R2 M1
        expect(findMatch(matches, 'wb-r1-m1').nextMatchId).toBe('wb-r2-m1');
        // WB R1 M2 winner -> WB R2 M1
        expect(findMatch(matches, 'wb-r1-m2').nextMatchId).toBe('wb-r2-m1');
        // WB R2 M1 winner -> WB R3 M1
        expect(findMatch(matches, 'wb-r2-m1').nextMatchId).toBe('wb-r3-m1');
        // WB R4 M1 winner -> WB R5 M1
        expect(findMatch(matches, 'wb-r4-m1').nextMatchId).toBe('wb-r5-m1');
        // WB R5 M1 winner -> Grand Final
        expect(findMatch(matches, 'wb-r5-m1').nextMatchId).toBe('grand-final');
    });

    it('LB R1 matches should be fed by WB R1 losers', () => {
        const matches = getBracketBlueprint();
        const lbR1M1 = findMatch(matches, 'lb-r1-m1');
        expect(lbR1M1.sourceMatchId1).toBe('wb-r1-m1');
        expect(lbR1M1.sourceType1).toBe('loser');
        expect(lbR1M1.sourceMatchId2).toBe('wb-r1-m2');
        expect(lbR1M1.sourceType2).toBe('loser');
    });

    it('LB R2 matches should have diagonal feed from WB R2 losers', () => {
        const matches = getBracketBlueprint();
        // LB R2 M1 gets WB R2 M8 loser (9-1=8 diagonal)
        const lbR2M1 = findMatch(matches, 'lb-r2-m1');
        expect(lbR2M1.sourceMatchId2).toBe('wb-r2-m8');
        expect(lbR2M1.sourceType2).toBe('loser');
    });

    it('placement matches should have correct loser feeds', () => {
        const matches = getBracketBlueprint();
        // LB R1 losers -> p25
        expect(findMatch(matches, 'lb-r1-m1').loserMatchId).toBe('p25-r1-m1');
        // LB R2 losers -> p17
        expect(findMatch(matches, 'lb-r2-m1').loserMatchId).toBe('p17-r1-m1');
        // LB R3 losers -> p13
        expect(findMatch(matches, 'lb-r3-m1').loserMatchId).toBe('p13-r1-m1');
        // LB R4 losers -> p9
        expect(findMatch(matches, 'lb-r4-m1').loserMatchId).toBe('p9-r1-m1');
        // LB R5 losers -> p7
        expect(findMatch(matches, 'lb-r5-m1').loserMatchId).toBe('p7-f');
        // LB R6 losers -> p5
        expect(findMatch(matches, 'lb-r6-m1').loserMatchId).toBe('p5-f');
        // LB Final loser -> p4
        expect(findMatch(matches, 'lb-final').loserMatchId).toBe('p4-f');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// rebuildBracketState()
// ─────────────────────────────────────────────────────────────────────────────

describe('rebuildBracketState', () => {
    it('should seed 32 players into WB R1 using SEEDING_PAIRS', () => {
        const players = make32Players();
        const matches = rebuildBracketState(players);

        // First match: seed 1 vs seed 32
        const m1 = findMatch(matches, 'wb-r1-m1');
        expect(m1.player1Id).toBe(players[0].id); // Seed 1 (highest ELO)
        expect(m1.player2Id).toBe(players[31].id); // Seed 32 (lowest ELO)

        // Second match: seed 16 vs seed 17
        const m2 = findMatch(matches, 'wb-r1-m2');
        expect(m2.player1Id).toBe(players[15].id); // Seed 16
        expect(m2.player2Id).toBe(players[16].id); // Seed 17
    });

    it('should fill missing players with BYEs up to 32', () => {
        const players = createMockPlayers(24); // Only 24 players
        const matches = rebuildBracketState(players);

        // Some WB R1 matches will have BYE players
        const wbR1 = matches.filter(m => m.bracket === 'wb' && m.round === 1);
        const hasAtLeastOneBye = wbR1.some(m =>
            m.player1Id?.startsWith('bye-') || m.player2Id?.startsWith('bye-')
        );
        expect(hasAtLeastOneBye).toBe(true);
    });

    it('should auto-win BYE matches', () => {
        const players = createMockPlayers(24); // 24 real + 8 BYEs
        const matches = rebuildBracketState(players);

        const wbR1 = matches.filter(m => m.bracket === 'wb' && m.round === 1);
        const byeMatches = wbR1.filter(m =>
            m.player1Id?.startsWith('bye-') || m.player2Id?.startsWith('bye-')
        );

        byeMatches.forEach(m => {
            expect(m.status).toBe('finished');
            expect(m.winnerId).toBeTruthy();
            // Winner should be the non-BYE player
            if (m.player1Id?.startsWith('bye-')) {
                expect(m.winnerId).toBe(m.player2Id);
            } else {
                expect(m.winnerId).toBe(m.player1Id);
            }
        });
    });

    it('should propagate winners from finished matches to next round', () => {
        const players = make32Players();

        // Simulate wb-r1-m1 and wb-r1-m2 both finished
        const existingMap = {
            'wb-r1-m1': { score1: 3, score2: 0, winnerId: players[0].id, status: 'finished' },
            'wb-r1-m2': { score1: 3, score2: 1, winnerId: players[15].id, status: 'finished' },
        };
        const matches = rebuildBracketState(players, existingMap);

        // WB R2 M1 should have these winners
        const wbR2M1 = findMatch(matches, 'wb-r2-m1');
        expect(wbR2M1.player1Id).toBe(players[0].id);
        expect(wbR2M1.player2Id).toBe(players[15].id);
    });

    it('should propagate losers from WB to LB via drop patterns', () => {
        const players = make32Players();

        // Simulate wb-r1-m1 finished (player 0 wins, player 31 loses)
        // Simulate wb-r1-m2 finished (player 15 wins, player 16 loses)
        const existingMap = {
            'wb-r1-m1': { score1: 3, score2: 0, winnerId: players[0].id, status: 'finished' },
            'wb-r1-m2': { score1: 0, score2: 3, winnerId: players[16].id, status: 'finished' },
        };
        const matches = rebuildBracketState(players, existingMap);

        // Losers from wb-r1-m1 and wb-r1-m2 should drop to lb-r1-m1
        const lbR1M1 = findMatch(matches, 'lb-r1-m1');
        expect(lbR1M1.player1Id).toBe(players[31].id); // loser of wb-r1-m1
        expect(lbR1M1.player2Id).toBe(players[15].id); // loser of wb-r1-m2
    });

    it('should apply BO5 scoring for WB matches (win threshold = 3)', () => {
        const players = make32Players();

        const existingMap = {
            'wb-r1-m1': { score1: 2, score2: 1, status: 'live' },
        };
        const matches = rebuildBracketState(players, existingMap);
        const m = findMatch(matches, 'wb-r1-m1');

        // Not finished yet (need 3 to win in BO5)
        expect(m.status).toBe('live');
        expect(m.winnerId).toBeNull();
    });

    it('should apply BO3 scoring for LB matches (win threshold = 2)', () => {
        const players = make32Players();

        // First finish WB R1 M1 and M2 to populate LB R1 M1
        const existingMap = {
            'wb-r1-m1': { score1: 3, score2: 0, winnerId: players[0].id, status: 'finished' },
            'wb-r1-m2': { score1: 0, score2: 3, winnerId: players[16].id, status: 'finished' },
            'lb-r1-m1': { score1: 2, score2: 0, status: 'live' },
        };
        const matches = rebuildBracketState(players, existingMap);
        const m = findMatch(matches, 'lb-r1-m1');

        // 2-0 in BO3 should be finished
        expect(m.status).toBe('finished');
        expect(m.winnerId).toBeTruthy();
    });

    it('should set match status to pending when both players present but no scores', () => {
        const players = make32Players();
        const matches = rebuildBracketState(players);

        const wbR1 = matches.filter(m => m.bracket === 'wb' && m.round === 1);
        const nonByeMatches = wbR1.filter(m =>
            !m.player1Id?.startsWith('bye-') && !m.player2Id?.startsWith('bye-')
        );

        nonByeMatches.forEach(m => {
            expect(m.status).toBe('pending');
        });
    });

    it('should hydrate manualOrder and court from existing matches', () => {
        const players = make32Players();

        const existingMap = {
            'wb-r1-m1': { manualOrder: 100, court: 'Court A' },
            'wb-r1-m5': { manualOrder: 200, court: 'Court B' },
        };
        const matches = rebuildBracketState(players, existingMap);

        expect(findMatch(matches, 'wb-r1-m1').manualOrder).toBe(100);
        expect(findMatch(matches, 'wb-r1-m1').court).toBe('Court A');
        expect(findMatch(matches, 'wb-r1-m5').manualOrder).toBe(200);
        expect(findMatch(matches, 'wb-r1-m5').court).toBe('Court B');
    });

    it('should auto-queue matches when they become ready', () => {
        const players = make32Players();

        // Finish two WB R1 matches to populate WB R2 M1
        const existingMap = {
            'wb-r1-m1': { score1: 3, score2: 0, winnerId: players[0].id, status: 'finished' },
            'wb-r1-m2': { score1: 3, score2: 0, winnerId: players[15].id, status: 'finished' },
        };
        const matches = rebuildBracketState(players, existingMap);

        // WB R2 M1 should have been auto-queued with a manualOrder
        const wbR2M1 = findMatch(matches, 'wb-r2-m1');
        expect(wbR2M1.manualOrder).toBeDefined();
        expect(wbR2M1.manualOrder).not.toBeNull();
    });

    it('should sort matches in WB → LB → placement order', () => {
        const players = make32Players();
        const matches = rebuildBracketState(players);

        // Find first WB and first LB match indices
        const firstWBIdx = matches.findIndex(m => m.bracket === 'wb');
        const firstLBIdx = matches.findIndex(m => m.bracket === 'lb');

        expect(firstWBIdx).toBeLessThan(firstLBIdx);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateDoubleEliminationBracket()
// ─────────────────────────────────────────────────────────────────────────────

describe('generateDoubleEliminationBracket', () => {
    it('should be a wrapper for rebuildBracketState with empty map', () => {
        const players = make32Players();
        const result = generateDoubleEliminationBracket(players);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);

        // Should have the same structure as rebuildBracketState
        expect(findMatch(result, 'wb-r1-m1')).toBeDefined();
        expect(findMatch(result, 'grand-final')).toBeDefined();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateBracketMatch()
// ─────────────────────────────────────────────────────────────────────────────

describe('updateBracketMatch', () => {
    it('should update a match score and rebuild state', () => {
        const players = make32Players();
        const initialMatches = rebuildBracketState(players);

        const updated = updateBracketMatch(
            initialMatches, 'wb-r1-m1',
            3, 1, // scores
            [], // microPoints
            players,
            players[0].id, // winnerId
            'finished'
        );

        const m = findMatch(updated, 'wb-r1-m1');
        expect(m.score1).toBe(3);
        expect(m.score2).toBe(1);
        expect(m.winnerId).toBe(players[0].id);
        expect(m.status).toBe('finished');
    });

    it('should propagate winner to next match after update', () => {
        const players = make32Players();
        let matches = rebuildBracketState(players);

        // Finish both wb-r1-m1 and wb-r1-m2
        matches = updateBracketMatch(matches, 'wb-r1-m1', 3, 0, [], players, players[0].id, 'finished');
        matches = updateBracketMatch(matches, 'wb-r1-m2', 3, 1, [], players, players[15].id, 'finished');

        const wbR2M1 = findMatch(matches, 'wb-r2-m1');
        expect(wbR2M1.player1Id).toBe(players[0].id);
        expect(wbR2M1.player2Id).toBe(players[15].id);
    });

    it('should set live status for partial scores', () => {
        const players = make32Players();
        const initialMatches = rebuildBracketState(players);

        const updated = updateBracketMatch(
            initialMatches, 'wb-r1-m1',
            1, 0,
            [],
            players,
            null,
            'live'
        );

        const m = findMatch(updated, 'wb-r1-m1');
        expect(m.score1).toBe(1);
        expect(m.score2).toBe(0);
        expect(m.status).toBe('live');
    });

    it('should preserve microPoints', () => {
        const players = make32Players();
        const initialMatches = rebuildBracketState(players);
        const microPoints = [{ set: 1, a: 11, b: 5 }, { set: 2, a: 11, b: 7 }];

        const updated = updateBracketMatch(
            initialMatches, 'wb-r1-m1',
            2, 0,
            microPoints,
            players,
            null,
            'live'
        );

        const m = findMatch(updated, 'wb-r1-m1');
        expect(m.microPoints).toEqual(microPoints);
    });

    it('should set finishedAt timestamp when match finishes', () => {
        const players = make32Players();
        const initialMatches = rebuildBracketState(players);

        const updated = updateBracketMatch(
            initialMatches, 'wb-r1-m1',
            3, 0,
            [],
            players,
            players[0].id,
            'finished'
        );

        const m = findMatch(updated, 'wb-r1-m1');
        expect(m.finishedAt).toBeTruthy();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// clearBracketMatch()
// ─────────────────────────────────────────────────────────────────────────────

describe('clearBracketMatch', () => {
    it('should reset match scores and status', () => {
        const players = make32Players();
        let matches = rebuildBracketState(players);

        // First, finish a match
        matches = updateBracketMatch(
            matches, 'wb-r1-m1',
            3, 0, [], players, players[0].id, 'finished'
        );

        // Now clear it
        matches = clearBracketMatch(matches, 'wb-r1-m1', players);

        const m = findMatch(matches, 'wb-r1-m1');
        expect(m.score1).toBeNull();
        expect(m.score2).toBeNull();
        expect(m.winnerId).toBeNull();
        expect(m.status).toBe('pending');
    });

    it('should undo downstream propagation when parent is cleared', () => {
        const players = make32Players();
        let matches = rebuildBracketState(players);

        // Finish wb-r1-m1 and wb-r1-m2
        matches = updateBracketMatch(matches, 'wb-r1-m1', 3, 0, [], players, players[0].id, 'finished');
        matches = updateBracketMatch(matches, 'wb-r1-m2', 3, 0, [], players, players[15].id, 'finished');

        // Verify propagation happened
        let wbR2M1 = findMatch(matches, 'wb-r2-m1');
        expect(wbR2M1.player1Id).toBe(players[0].id);

        // Clear wb-r1-m1
        matches = clearBracketMatch(matches, 'wb-r1-m1', players);

        // WB R2 M1 should no longer have the winner from wb-r1-m1
        wbR2M1 = findMatch(matches, 'wb-r2-m1');
        expect(wbR2M1.player1Id).toBeNull();
    });
});
