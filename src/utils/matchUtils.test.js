import { describe, it, expect } from 'vitest';
import {
    getBestOf,
    isMatchFinished,
    checkMatchStatus,
    getMatchStatus,
    canEditMatch,
    compareMatchIds,
} from './matchUtils';

// ─────────────────────────────────────────────────────────────────────────────
// getBestOf()
// ─────────────────────────────────────────────────────────────────────────────

describe('getBestOf', () => {
    it('should return 5 for WB (BO5)', () => {
        expect(getBestOf('wb')).toBe(5);
    });

    it('should return 5 for GF (BO5)', () => {
        expect(getBestOf('gf')).toBe(5);
    });

    it('should return 3 for LB (BO3)', () => {
        expect(getBestOf('lb')).toBe(3);
    });

    it('should return 3 for placement brackets (BO3)', () => {
        expect(getBestOf('p25')).toBe(3);
        expect(getBestOf('p17')).toBe(3);
        expect(getBestOf('p13')).toBe(3);
        expect(getBestOf('p9')).toBe(3);
        expect(getBestOf('p7')).toBe(3);
        expect(getBestOf('p5')).toBe(3);
    });

    it('should return 3 for unknown bracket types', () => {
        expect(getBestOf('unknown')).toBe(3);
        expect(getBestOf('')).toBe(3);
        expect(getBestOf(undefined)).toBe(3);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// isMatchFinished()
// ─────────────────────────────────────────────────────────────────────────────

describe('isMatchFinished', () => {
    describe('BO3 (bestOf = 3)', () => {
        it('should return true for 2-0', () => {
            expect(isMatchFinished(2, 0, 3)).toBe(true);
        });

        it('should return true for 0-2', () => {
            expect(isMatchFinished(0, 2, 3)).toBe(true);
        });

        it('should return true for 2-1', () => {
            expect(isMatchFinished(2, 1, 3)).toBe(true);
        });

        it('should return true for 1-2', () => {
            expect(isMatchFinished(1, 2, 3)).toBe(true);
        });

        it('should return false for 1-0', () => {
            expect(isMatchFinished(1, 0, 3)).toBe(false);
        });

        it('should return false for 0-1', () => {
            expect(isMatchFinished(0, 1, 3)).toBe(false);
        });

        it('should return false for 1-1', () => {
            expect(isMatchFinished(1, 1, 3)).toBe(false);
        });

        it('should return false for 0-0', () => {
            expect(isMatchFinished(0, 0, 3)).toBe(false);
        });
    });

    describe('BO5 (bestOf = 5)', () => {
        it('should return true for 3-0', () => {
            expect(isMatchFinished(3, 0, 5)).toBe(true);
        });

        it('should return true for 0-3', () => {
            expect(isMatchFinished(0, 3, 5)).toBe(true);
        });

        it('should return true for 3-1', () => {
            expect(isMatchFinished(3, 1, 5)).toBe(true);
        });

        it('should return true for 3-2', () => {
            expect(isMatchFinished(3, 2, 5)).toBe(true);
        });

        it('should return true for 2-3', () => {
            expect(isMatchFinished(2, 3, 5)).toBe(true);
        });

        it('should return false for 2-0', () => {
            expect(isMatchFinished(2, 0, 5)).toBe(false);
        });

        it('should return false for 2-1', () => {
            expect(isMatchFinished(2, 1, 5)).toBe(false);
        });

        it('should return false for 2-2', () => {
            expect(isMatchFinished(2, 2, 5)).toBe(false);
        });

        it('should return false for 1-1', () => {
            expect(isMatchFinished(1, 1, 5)).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle null scores (treated as 0)', () => {
            expect(isMatchFinished(null, null, 3)).toBe(false);
            expect(isMatchFinished(null, 2, 3)).toBe(true);
        });

        it('should handle string scores', () => {
            expect(isMatchFinished('3', '0', 5)).toBe(true);
            expect(isMatchFinished('1', '0', 5)).toBe(false);
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// checkMatchStatus()
// ─────────────────────────────────────────────────────────────────────────────

describe('checkMatchStatus', () => {
    it('should return true (still running) for live BO5 match', () => {
        expect(checkMatchStatus({ score1: 2, score2: 1 }, 'BO5')).toBe(true);
    });

    it('should return false (finished) for completed BO5 match', () => {
        expect(checkMatchStatus({ score1: 3, score2: 1 }, 'BO5')).toBe(false);
    });

    it('should return true (still running) for live BO3 match', () => {
        expect(checkMatchStatus({ score1: 1, score2: 0 }, 'BO3')).toBe(true);
    });

    it('should return false (finished) for completed BO3 match', () => {
        expect(checkMatchStatus({ score1: 2, score2: 1 }, 'BO3')).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getMatchStatus()
// ─────────────────────────────────────────────────────────────────────────────

describe('getMatchStatus', () => {
    it('should return "finished" when winner_id exists', () => {
        const match = { winner_id: 'p1', bracket: 'wb', score1: 3, score2: 0 };
        expect(getMatchStatus(match)).toBe('finished');
    });

    it('should return "finished" when scores meet threshold (WB BO5)', () => {
        const match = { bracket: 'wb', score1: 3, score2: 1 };
        expect(getMatchStatus(match)).toBe('finished');
    });

    it('should return "finished" when scores meet threshold (LB BO3)', () => {
        const match = { bracket: 'lb', score1: 0, score2: 2 };
        expect(getMatchStatus(match)).toBe('finished');
    });

    it('should return "live" when scores are partial', () => {
        const match = { bracket: 'wb', score1: 1, score2: 0, player1: true, player2: true };
        expect(getMatchStatus(match)).toBe('live');
    });

    it('should return "pending" when both players present but no scores', () => {
        const match = { bracket: 'wb', score1: 0, score2: 0, player1: { id: 'p1' }, player2: { id: 'p2' } };
        expect(getMatchStatus(match)).toBe('pending');
    });

    it('should return "scheduled" when no players assigned', () => {
        const match = { bracket: 'wb', score1: 0, score2: 0 };
        expect(getMatchStatus(match)).toBe('scheduled');
    });

    it('should handle bracket_type key as fallback', () => {
        const match = { bracket_type: 'wb', score1: 3, score2: 0 };
        expect(getMatchStatus(match)).toBe('finished');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// canEditMatch()
// ─────────────────────────────────────────────────────────────────────────────

describe('canEditMatch', () => {
    it('should return true when both players are present and not BYEs', () => {
        const match = {
            player1: { id: 'p1', full_name: 'Player 1' },
            player2: { id: 'p2', full_name: 'Player 2' },
        };
        expect(canEditMatch(match)).toBe(true);
    });

    it('should return falsy when player1 is missing', () => {
        const match = {
            player1: null,
            player2: { id: 'p2' },
        };
        expect(canEditMatch(match)).toBeFalsy();
    });

    it('should return falsy when player2 is missing', () => {
        const match = {
            player1: { id: 'p1' },
            player2: null,
        };
        expect(canEditMatch(match)).toBeFalsy();
    });

    it('should return false when player1 is a BYE', () => {
        const match = {
            player1: { id: 'bye-1', isBye: true },
            player2: { id: 'p2' },
        };
        expect(canEditMatch(match)).toBe(false);
    });

    it('should return false when player2 is a BYE', () => {
        const match = {
            player1: { id: 'p1' },
            player2: { id: 'bye-2', isBye: true },
        };
        expect(canEditMatch(match)).toBe(false);
    });

    it('should return false when both players are BYEs', () => {
        const match = {
            player1: { id: 'bye-1', isBye: true },
            player2: { id: 'bye-2', isBye: true },
        };
        expect(canEditMatch(match)).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// compareMatchIds()
// ─────────────────────────────────────────────────────────────────────────────

describe('compareMatchIds', () => {
    it('should sort WB matches before LB matches of the same round', () => {
        const result = compareMatchIds('wb-r1-m1', 'lb-r1-m1');
        expect(result).toBeLessThan(0);
    });

    it('should sort lower rounds before higher rounds', () => {
        const result = compareMatchIds('wb-r1-m1', 'wb-r2-m1');
        expect(result).toBeLessThan(0);
    });

    it('should sort by match number within same bracket and round', () => {
        const result = compareMatchIds('wb-r1-m1', 'wb-r1-m3');
        expect(result).toBeLessThan(0);
    });

    it('should place placement matches after main bracket matches', () => {
        // p9 has virtual round = round + 50
        const result = compareMatchIds('lb-r3-m1', 'p9-r1-m1');
        expect(result).toBeLessThan(0);
    });

    it('should place grand-final after consolation-final', () => {
        const result = compareMatchIds('consolation-final', 'grand-final');
        expect(result).toBeLessThan(0);
    });

    it('should handle lb-final correctly', () => {
        // lb-final is round 99, still before gf (100) and cf (99 but bracket cf vs lb)
        const result = compareMatchIds('lb-r6-m1', 'lb-final');
        expect(result).toBeLessThan(0);
    });

    it('should handle special IDs like p7-f', () => {
        // p7-f gets round=99 + 50 in virtual = 149
        const result = compareMatchIds('lb-r5-m1', 'p7-f');
        expect(result).toBeLessThan(0);
    });

    it('should return 0 for identical IDs', () => {
        expect(compareMatchIds('wb-r1-m1', 'wb-r1-m1')).toBe(0);
    });

    it('should sort an array of match IDs correctly', () => {
        const ids = [
            'lb-r2-m1',
            'wb-r1-m1',
            'grand-final',
            'wb-r2-m1',
            'lb-r1-m1',
            'consolation-final',
            'p25-r1-m1',
        ];

        const sorted = [...ids].sort(compareMatchIds);

        // WB R1 first
        expect(sorted[0]).toBe('wb-r1-m1');
        // Then WB R2 and LB R1 (same virtual round 1 for LB, 2 for WB R2)
        expect(sorted.indexOf('wb-r1-m1')).toBeLessThan(sorted.indexOf('wb-r2-m1'));
        // Placement last (before finals)
        expect(sorted.indexOf('lb-r2-m1')).toBeLessThan(sorted.indexOf('p25-r1-m1'));
        // Grand final at the end
        expect(sorted[sorted.length - 1]).toBe('grand-final');
    });
});
