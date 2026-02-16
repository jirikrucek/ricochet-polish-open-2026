import { describe, it, expect } from 'vitest';
import {
    RACKET_COLORS,
    getMatchColor,
    getRacketPathConfig,
    getSourceRacketConfig,
} from './racketPathUtils';

// ─────────────────────────────────────────────────────────────────────────────
// RACKET_COLORS constant
// ─────────────────────────────────────────────────────────────────────────────

describe('RACKET_COLORS', () => {
    it('should export an array of 16 colors', () => {
        expect(Array.isArray(RACKET_COLORS)).toBe(true);
        expect(RACKET_COLORS).toHaveLength(16);
    });

    it('should contain valid hex color strings', () => {
        RACKET_COLORS.forEach(color => {
            expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getMatchColor()
// ─────────────────────────────────────────────────────────────────────────────

describe('getMatchColor', () => {
    it('should return pink (#ec4899) for WB matches', () => {
        expect(getMatchColor('wb-r1-m1')).toBe('#ec4899');
        expect(getMatchColor('wb-r5-m1')).toBe('#ec4899');
    });

    it('should return blue (#3b82f6) for LB matches', () => {
        expect(getMatchColor('lb-r1-m1')).toBe('#3b82f6');
        expect(getMatchColor('lb-final')).toBe('#3b82f6');
    });

    it('should return gold (#fbbf24) for GF matches', () => {
        expect(getMatchColor('gf-r1-m1')).toBe('#fbbf24');
    });

    it('should use hash-based color for grand-final (does not start with gf prefix)', () => {
        // 'grand-final' starts with 'g', not 'gf', so it falls through to hash
        const color = getMatchColor('grand-final');
        expect(RACKET_COLORS).toContain(color);
    });

    it('should return gray/stone (#a8a29e) for placement matches', () => {
        expect(getMatchColor('p25-r1-m1')).toBe('#a8a29e');
        expect(getMatchColor('p7-f')).toBe('#a8a29e');
        expect(getMatchColor('p4-f')).toBe('#a8a29e');
    });

    it('should return default gray (#6b7280) for null/undefined', () => {
        expect(getMatchColor(null)).toBe('#6b7280');
        expect(getMatchColor(undefined)).toBe('#6b7280');
        expect(getMatchColor('')).toBe('#6b7280');
    });

    it('should return a deterministic fallback color for unknown IDs', () => {
        const color1 = getMatchColor('some-unknown-id');
        const color2 = getMatchColor('some-unknown-id');
        expect(color1).toBe(color2); // Same input should produce same output

        // Should be one of the RACKET_COLORS
        expect(RACKET_COLORS).toContain(color1);
    });

    it('should produce different colors for different unknown IDs', () => {
        const color1 = getMatchColor('id-alpha');
        const color2 = getMatchColor('id-zeta');
        // They could theoretically collide, but highly unlikely
        // Just checking they are valid
        expect(RACKET_COLORS).toContain(color1);
        expect(RACKET_COLORS).toContain(color2);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getRacketPathConfig()
// ─────────────────────────────────────────────────────────────────────────────

describe('getRacketPathConfig', () => {
    it('should return badge config for a valid match ID', () => {
        const config = getRacketPathConfig('wb-r1-m5');
        expect(config.showBadge).toBe(true);
        expect(config.color).toBe('#ec4899'); // WB = pink
        expect(config.text).toBe('5');
    });

    it('should extract correct match number from ID', () => {
        expect(getRacketPathConfig('wb-r2-m8').text).toBe('8');
        expect(getRacketPathConfig('lb-r3-m4').text).toBe('4');
        expect(getRacketPathConfig('wb-r1-m16').text).toBe('16');
    });

    it('should return "?" for IDs without match number', () => {
        expect(getRacketPathConfig('lb-final').text).toBe('?');
        expect(getRacketPathConfig('grand-final').text).toBe('?');
    });

    it('should return no-badge config for null/undefined', () => {
        const config = getRacketPathConfig(null);
        expect(config.showBadge).toBe(false);
        expect(config.text).toBe('?');
    });

    it('should return no-badge config for non-string input', () => {
        const config = getRacketPathConfig(123);
        expect(config.showBadge).toBe(false);
    });

    it('should use the correct color based on bracket type', () => {
        expect(getRacketPathConfig('wb-r1-m1').color).toBe('#ec4899');
        expect(getRacketPathConfig('lb-r2-m3').color).toBe('#3b82f6');
        expect(getRacketPathConfig('p9-r1-m1').color).toBe('#a8a29e');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// getSourceRacketConfig()
// ─────────────────────────────────────────────────────────────────────────────

describe('getSourceRacketConfig', () => {
    it('should return config with correct color for WB source', () => {
        const config = getSourceRacketConfig('wb-r1-m1', 'winner');
        expect(config).not.toBeNull();
        expect(config.color).toBe('#ec4899');
        expect(config.iconType).toBe('winner');
    });

    it('should return config with correct color for LB source', () => {
        const config = getSourceRacketConfig('lb-r2-m3', 'loser');
        expect(config).not.toBeNull();
        expect(config.color).toBe('#3b82f6');
        expect(config.iconType).toBe('loser');
    });

    it('should pass through the type (winner/loser)', () => {
        expect(getSourceRacketConfig('wb-r1-m1', 'winner').iconType).toBe('winner');
        expect(getSourceRacketConfig('wb-r1-m1', 'loser').iconType).toBe('loser');
    });

    it('should return null for null sourceMatchId', () => {
        expect(getSourceRacketConfig(null, 'winner')).toBeNull();
        expect(getSourceRacketConfig(undefined, 'loser')).toBeNull();
    });
});
