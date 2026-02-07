// Helper to get BO format based on bracket type
export const getBestOf = (bracketType) => {
    if (bracketType === 'wb' || bracketType === 'gf') return 5; // BO5
    return 3; // BO3
};

// Check if match is finished based on scores and BO format
export const isMatchFinished = (score1, score2, bestOf) => {
    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;
    const winThreshold = Math.ceil(bestOf / 2);
    return s1 >= winThreshold || s2 >= winThreshold;
};

// Returns TRUE if match is still running (Live), FALSE if finished
export const checkMatchStatus = (currentScore, format) => {
    // currentScore can be object { score1, score2 } or just number of wins if passed simpler
    const bestOf = format === 'BO5' ? 5 : 3;
    return !isMatchFinished(currentScore.score1, currentScore.score2, bestOf);
};

// Helper to determine status
export const getMatchStatus = (match) => {
    if (match.winner_id) return 'finished';

    // Updated Logic: Check strict win condition
    const bestOf = getBestOf(match.bracket || (match.bracket_type === 'wb' ? 'wb' : 'lb'));
    if (isMatchFinished(match.score1, match.score2, bestOf)) {
        return 'finished';
    }

    if (match.score1 > 0 || match.score2 > 0) return 'live';
    if (match.player1 && match.player2) return 'pending'; // Ready to play
    return 'scheduled'; // Waiting for players
};

export const canEditMatch = (match) => {
    return match.player1 && match.player2 && !match.player1.isBye && !match.player2.isBye;
};

// Helper to sort matches by ID (semantically: Bracket > Round > Match Number)
// IDs: wb-r1-m1, lb-r2-m10, gf-m1, p25-r1-m1, p7-f, etc.
export const compareMatchIds = (idA, idB) => {
    // 1. Parse IDs: handle (bracket)-r(round)-m(match) and special formats
    const parseId = (id) => {
        // Special Finals
        if (id === 'grand-final') return { bracket: 'gf', round: 100, number: 1 };
        if (id === 'consolation-final') return { bracket: 'cf', round: 100, number: 1 };
        if (id === 'lb-final') return { bracket: 'lb', round: 99, number: 1 };

        // Handle patterns:
        // 1. Standard: (bracket)-r(round)-m(match)  e.g. wb-r1-m1, p25-r1-m1
        // Allow alphanumeric bracket names (e.g. p25)
        const matchStd = id.match(/^([a-z0-9]+)-r(\d+)-m(\d+)$/);
        if (matchStd) {
            return {
                bracket: matchStd[1],
                round: parseInt(matchStd[2], 10),
                number: parseInt(matchStd[3], 10)
            };
        }

        // 2. Placement Finals: (bracket)-f  e.g. p25-f
        const matchFin = id.match(/^([a-z0-9]+)-f$/);
        if (matchFin) {
            return {
                bracket: matchFin[1],
                round: 99, // Treat as final round
                number: 1
            };
        }
        
        // Fallback
        return { bracket: id, round: 999, number: 999 };
    };

    const A = parseId(idA);
    const B = parseId(idB);

    // 2. Compare Bracket Priority
    const getBracketScore = (b) => {
        if (b === 'wb') return 10;
        if (b === 'lb') return 20;
        if (b === 'gf') return 100;
        if (b === 'cf') return 90; // Consolation Final usually before GF
        
        // Placement brackets (p25, p13, etc)
        if (b.startsWith('p')) {
             // Extract number: p25 -> 25. Sort either by importance (lower is better) or raw ID logic.
             // Usually p9 > p13 > p17 > p25 in terms of progression? 
             // Or p25 happens first?
             // Let's sort by the number to keep them grouped consistently.
             const num = parseInt(b.slice(1), 10) || 50;
             return 30 + num; 
        }
        // Other
        return 50; 
    };

    const scoreA = getBracketScore(A.bracket);
    const scoreB = getBracketScore(B.bracket);

    if (scoreA !== scoreB) return scoreA - scoreB;

    // 3. Compare Round
    if (A.round !== B.round) return A.round - B.round;

    // 4. Compare Match Number
    return A.number - B.number;
};
