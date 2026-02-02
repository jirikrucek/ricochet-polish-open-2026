// Helper: Static Seeding Order - Professional Layout
// Order: [1,32], [16,17], [9,24], [8,25], [5,28], [12,21], [13,20], [4,29], [3,30], [14,19], [11,22], [6,27], [7,26], [10,23], [15,18], [2,31]
const SEEDING_ORDER = [
    [1, 32],   // Match A
    [16, 17],  // Match B
    [9, 24],   // Match C
    [8, 25],   // Match D
    [5, 28],   // Match E
    [12, 21],  // Match F
    [13, 20],  // Match G
    [4, 29],   // Match H
    [3, 30],   // Match I
    [14, 19],  // Match J
    [11, 22],  // Match K
    [6, 27],   // Match L
    [7, 26],   // Match M
    [10, 23],  // Match N
    [15, 18],  // Match O 
    [2, 31]    // Match P
];

export const getBracketBlueprint = () => {
    const allMatches = [];

    // --- WB R1 (16 Matches) ---
    for (let i = 1; i <= 16; i++) {
        allMatches.push({
            id: `wb-r1-m${i}`, round: 1, bracket: 'wb',
            nextMatchId: `wb-r2-m${Math.ceil(i / 2)}`
        });
    }

    // --- WB R2 (8 Matches) ---
    for (let i = 1; i <= 8; i++) {
        allMatches.push({
            id: `wb-r2-m${i}`, round: 2, bracket: 'wb',
            sourceMatchId1: `wb-r1-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r1-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `wb-r3-m${Math.ceil(i / 2)}`
        });
    }

    // --- WB R3 (4 Matches) - Quarterfinals ---
    for (let i = 1; i <= 4; i++) {
        allMatches.push({
            id: `wb-r3-m${i}`, round: 3, bracket: 'wb',
            sourceMatchId1: `wb-r2-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r2-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `wb-r4-m${Math.ceil(i / 2)}`
        });
    }

    // --- WB R4 (2 Matches) - Semifinals ---
    for (let i = 1; i <= 2; i++) {
        allMatches.push({
            id: `wb-r4-m${i}`, round: 4, bracket: 'wb',
            sourceMatchId1: `wb-r3-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r3-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `wb-r5-m1`
        });
    }

    // --- WB R5 (1 Match) - Final (Upper Bracket) ---
    allMatches.push({
        id: `wb-r5-m1`, round: 5, bracket: 'wb',
        sourceMatchId1: `wb-r4-m1`, sourceType1: 'winner',
        sourceMatchId2: `wb-r4-m2`, sourceType2: 'winner',
        nextMatchId: `gf-m1`
    });

    // --- LB R1 (8 Matches) - WB R1 Losers (CROSS PAIRING) ---
    // User Requirement: Sum of WB Indices = 17.
    // Match 1: WB M1 vs WB M16.
    // Match 2: WB M2 vs WB M15.
    // Match i: WB M(i) vs WB M(17-i).
    // Note: To match "Standard" visual flow, we usually map top-down.
    // LB Match 1 should take top pair. LB Match 8 should take bottom pair?
    // Actually, usually indices i=1..8 correspond to WB M1..M8 paired with M16..M9.
    // So LB M1 pairs W1 & W16. LB M2 pairs W2 & W15. ... LB M8 pairs W8 & W9.
    for (let i = 1; i <= 8; i++) {
        allMatches.push({
            id: `lb-r1-m${i}`, round: 1, bracket: 'lb',
            sourceMatchId1: `wb-r1-m${i}`, sourceType1: 'loser',
            sourceMatchId2: `wb-r1-m${17 - i}`, sourceType2: 'loser',
            nextMatchId: `lb-r2-m${i}`
        });
    }

    // --- LB R2 (8 Matches) - WB R2 Losers (Straight) ---
    // Standard DE: Winners of LB R1 play Losers of WB R2.
    // User said "Classic Brazilian". Usually involves some crossover, but "Straight" is safest if not specified beyond "Big X".
    // Wait, recent instructions said "Big X" previously, but this prompt says "Total Reset... Classic Brazilian".
    // But it explicitly defined LB R1. It didn't explicitly define LB R2 mapping, only "Placement 17-32 from LB R2 losers".
    // I will stick to "Big X" logic for LB R2 as it's standard for Brazilian to avoid repeats.
    // Inverse: LB M1 (from WB 1/16) plays Loser WB R2 M8 (from WB 15/16/1/2? No).
    // Let's use standard Big X: LB M(i) plays WB R2 M(9-i).
    for (let i = 1; i <= 8; i++) {
        allMatches.push({
            id: `lb-r2-m${i}`, round: 2, bracket: 'lb',
            sourceMatchId1: `lb-r1-m${i}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r2-m${9 - i}`, sourceType2: 'loser',
            nextMatchId: `lb-r3-m${Math.ceil(i / 2)}`
        });
    }

    // --- LB R3 (4 Matches) ---
    for (let i = 1; i <= 4; i++) {
        allMatches.push({
            id: `lb-r3-m${i}`, round: 3, bracket: 'lb',
            sourceMatchId1: `lb-r2-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `lb-r2-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `lb-r4-m${i}`
        });
    }

    // --- LB R4 (4 Matches) - WB R3 Losers (Shift) ---
    // Standard Cross/Shift. Let's use the explicit map [3,4,1,2] from before as it worked well.
    const lbR4Map = [3, 4, 1, 2];
    for (let i = 1; i <= 4; i++) {
        let wbSourceIndex = lbR4Map[i - 1];
        allMatches.push({
            id: `lb-r4-m${i}`, round: 4, bracket: 'lb',
            sourceMatchId1: `lb-r3-m${i}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r3-m${wbSourceIndex}`, sourceType2: 'loser',
            nextMatchId: `lb-r5-m${Math.ceil(i / 2)}`
        });
    }

    // --- LB R5 (2 Matches) ---
    for (let i = 1; i <= 2; i++) {
        allMatches.push({
            id: `lb-r5-m${i}`, round: 5, bracket: 'lb',
            sourceMatchId1: `lb-r4-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `lb-r4-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `lb-r6-m${i}`
        });
    }

    // --- LB R6 (2 Matches) - WB R4 Losers (Semi Finals) ---
    // Use DIRECT mapping as per last fix (Góra-Góra, Dół-Dół).
    for (let i = 1; i <= 2; i++) {
        allMatches.push({
            id: `lb-r6-m${i}`, round: 6, bracket: 'lb',
            sourceMatchId1: `lb-r5-m${i}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r4-m${i}`, sourceType2: 'loser',
            nextMatchId: `lb-r7-m1`
        });
    }

    // --- LB R7 (1 Match) ---
    allMatches.push({
        id: `lb-r7-m1`, round: 7, bracket: 'lb',
        sourceMatchId1: `lb-r6-m1`, sourceType1: 'winner',
        sourceMatchId2: `lb-r6-m2`, sourceType2: 'winner',
        nextMatchId: `gf-m1`
    });

    // --- Grand Final ---
    allMatches.push({
        id: `gf-m1`, round: 1, bracket: 'gf',
        sourceMatchId1: `wb-r5-m1`, sourceType1: 'winner',
        sourceMatchId2: `lb-r7-m1`, sourceType2: 'winner'
    });

    // --- PLACEMENT BRACKETS ---

    // Places 5-8 (Losers of WB R3) -> 2 Matches, then 2 finals
    for (let i = 1; i <= 2; i++) {
        // WB R3 has 4 matches. Losers drop to P5-8.
        // M1 (Winner WB3.1/3.2 - Loser side) -> We take WB Losers.
        // P5-8 M1 takes WB R3 M1 Loser & WB R3 M2 Loser.
        allMatches.push({
            id: `p5-r1-m${i}`, bracket: 'p5', round: 1,
            sourceMatchId1: `wb-r3-m${i * 2 - 1}`, sourceType1: 'loser',
            sourceMatchId2: `wb-r3-m${i * 2}`, sourceType2: 'loser',
            // Actually, Winners play for 5th, Losers for 7th.
        });
    }
    // Finals 5th, 7th
    allMatches.push({ id: `p5-f`, bracket: 'p5', round: 2, sourceMatchId1: `p5-r1-m1`, sourceType1: 'winner', sourceMatchId2: `p5-r1-m2`, sourceType2: 'winner' });
    allMatches.push({ id: `p7-f`, bracket: 'p7', round: 2, sourceMatchId1: `p5-r1-m1`, sourceType1: 'loser', sourceMatchId2: `p5-r1-m2`, sourceType2: 'loser' });


    // Places 9-16 (Losers of LB R4) -> 4 matches -> 2 matches -> Finals
    // LB R4 has 4 matches. Losers drop here.
    for (let i = 1; i <= 2; i++) { // 2 Matches total (4 players / 2)
        allMatches.push({
            id: `p9-r1-m${i}`, bracket: 'p9', round: 1,
            sourceMatchId1: `lb-r4-m${i * 2 - 1}`, sourceType1: 'loser',
            sourceMatchId2: `lb-r4-m${i * 2}`, sourceType2: 'loser'
            // Winner goes to 9th place bracket match? 
            // Usually: Winners play for 9-12, Losers play for 13-16.
        });
    }
    // Finals 9/11 (Winners of P9 R1)
    allMatches.push({ id: `p9-f`, bracket: 'p9', round: 2, sourceMatchId1: `p9-r1-m1`, sourceType1: 'winner', sourceMatchId2: `p9-r1-m2`, sourceType2: 'winner' });
    allMatches.push({ id: `p11-f`, bracket: 'p11', round: 2, sourceMatchId1: `p9-r1-m1`, sourceType1: 'loser', sourceMatchId2: `p9-r1-m2`, sourceType2: 'loser' }); // Actually 11th

    // Places 13-16 (Losers of LB R3)
    for (let i = 1; i <= 2; i++) {
        allMatches.push({
            id: `p13-r1-m${i}`, bracket: 'p13', round: 1,
            sourceMatchId1: `lb-r3-m${i * 2 - 1}`, sourceType1: 'loser',
            sourceMatchId2: `lb-r3-m${i * 2}`, sourceType2: 'loser'
        });
    }
    allMatches.push({ id: `p13-f`, bracket: 'p13', round: 2, sourceMatchId1: `p13-r1-m1`, sourceType1: 'winner', sourceMatchId2: `p13-r1-m2`, sourceType2: 'winner' });
    allMatches.push({ id: `p15-f`, bracket: 'p15', round: 2, sourceMatchId1: `p13-r1-m1`, sourceType1: 'loser', sourceMatchId2: `p13-r1-m2`, sourceType2: 'loser' });


    // Places 17-32 (Losers of LB R2??)
    // LB R2 has 8 losers. They finished 17-24th.
    // LB R1 has 8 losers. They finished 25-32nd.
    // User said "Miejsca 17-32: Przegrani z LB R2". This is ambiguous.
    // Likely implies "The big chunk of lower brackets".
    // I will implement P17 (17-24) from LB R2 losers.

    // P17 (8 Players -> 4 matches -> 2 -> 1)
    for (let i = 1; i <= 4; i++) {
        allMatches.push({
            id: `p17-r1-m${i}`, bracket: 'p17', round: 1,
            sourceMatchId1: `lb-r2-m${i * 2 - 1}`, sourceType1: 'loser',
            sourceMatchId2: `lb-r2-m${i * 2}`, sourceType2: 'loser',
            nextMatchId: `p17-r2-m${Math.ceil(i / 2)}`
        });
    }
    // R2
    for (let i = 1; i <= 2; i++) {
        allMatches.push({
            id: `p17-r2-m${i}`, bracket: 'p17', round: 2,
            sourceMatchId1: `p17-r1-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `p17-r1-m${i * 2}`, sourceType2: 'winner'
        });
        // Losers of P17 R1 -> P21 (21-24th)
        allMatches.push({
            id: `p21-r2-m${i}`, bracket: 'p21', round: 2,
            sourceMatchId1: `p17-r1-m${i * 2 - 1}`, sourceType1: 'loser',
            sourceMatchId2: `p17-r1-m${i * 2}`, sourceType2: 'loser'
        });
    }
    // Finals
    allMatches.push({ id: `p17-f`, bracket: 'p17', round: 3, sourceMatchId1: `p17-r2-m1`, sourceType1: 'winner', sourceMatchId2: `p17-r2-m2`, sourceType2: 'winner' });
    allMatches.push({ id: `p19-f`, bracket: 'p19', round: 3, sourceMatchId1: `p17-r2-m1`, sourceType1: 'loser', sourceMatchId2: `p17-r2-m2`, sourceType2: 'loser' });
    allMatches.push({ id: `p21-f`, bracket: 'p21', round: 3, sourceMatchId1: `p21-r2-m1`, sourceType1: 'winner', sourceMatchId2: `p21-r2-m2`, sourceType2: 'winner' });
    allMatches.push({ id: `p23-f`, bracket: 'p23', round: 3, sourceMatchId1: `p21-r2-m1`, sourceType1: 'loser', sourceMatchId2: `p21-r2-m2`, sourceType2: 'loser' });

    // P25 (Losers of LB R1) - 25-32nd
    for (let i = 1; i <= 4; i++) {
        allMatches.push({
            id: `p25-r1-m${i}`, bracket: 'p25', round: 1,
            sourceMatchId1: `lb-r1-m${i * 2 - 1}`, sourceType1: 'loser',
            sourceMatchId2: `lb-r1-m${i * 2}`, sourceType2: 'loser',
            nextMatchId: `p25-r2-m${Math.ceil(i / 2)}`
        });
    }
    // P25 R2
    for (let i = 1; i <= 2; i++) {
        allMatches.push({
            id: `p25-r2-m${i}`, bracket: 'p25', round: 2,
            sourceMatchId1: `p25-r1-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `p25-r1-m${i * 2}`, sourceType2: 'winner'
        });
        allMatches.push({
            id: `p29-r2-m${i}`, bracket: 'p29', round: 2,
            sourceMatchId1: `p25-r1-m${i * 2 - 1}`, sourceType1: 'loser',
            sourceMatchId2: `p25-r1-m${i * 2}`, sourceType2: 'loser'
        });
    }
    // Finals P25
    allMatches.push({ id: `p25-f`, bracket: 'p25', round: 3, sourceMatchId1: `p25-r2-m1`, sourceType1: 'winner', sourceMatchId2: `p25-r2-m2`, sourceType2: 'winner' });
    allMatches.push({ id: `p27-f`, bracket: 'p27', round: 3, sourceMatchId1: `p25-r2-m1`, sourceType1: 'loser', sourceMatchId2: `p25-r2-m2`, sourceType2: 'loser' });
    allMatches.push({ id: `p29-f`, bracket: 'p29', round: 3, sourceMatchId1: `p29-r2-m1`, sourceType1: 'winner', sourceMatchId2: `p29-r2-m2`, sourceType2: 'winner' });
    allMatches.push({ id: `p31-f`, bracket: 'p31', round: 3, sourceMatchId1: `p29-r2-m1`, sourceType1: 'loser', sourceMatchId2: `p29-r2-m2`, sourceType2: 'loser' });

    return allMatches;
};

// ... rebuildBracketState SAME AS BEFORE but ensuring sorting ...
export const rebuildBracketState = (players, existingMatchesMap = {}) => {
    // 1. Prepare Seeds sorted by ELO
    const sortedPlayers = [...players].sort((a, b) => {
        const eloA = parseInt(a.elo || 0);
        const eloB = parseInt(b.elo || 0);
        if (eloA !== eloB) return eloB - eloA;
        return (a.full_name || "").localeCompare(b.full_name || "");
    });
    const seeds = [...sortedPlayers];
    while (seeds.length < 32) {
        seeds.push({ id: `bye-${seeds.length}`, full_name: "BYE", isBye: true });
    }

    const playerMap = new Map();
    seeds.forEach(p => playerMap.set(p.id, p));

    // 2. Blueprint
    const allMatches = getBracketBlueprint().map(m => ({
        ...m,
        score1: null, score2: null, microPoints: [], winnerId: null,
        player1Id: null, player2Id: null,
        status: 'scheduled'
    }));

    const matchMap = new Map();
    allMatches.forEach(m => matchMap.set(m.id, m));

    // 3. Hydrate WB R1
    const wbR1 = allMatches.filter(m => m.bracket === 'wb' && m.round === 1);
    wbR1.forEach((m, i) => {
        const pair = SEEDING_ORDER[i];
        if (seeds[pair[0] - 1]) m.player1Id = seeds[pair[0] - 1].id;
        if (seeds[pair[1] - 1]) m.player2Id = seeds[pair[1] - 1].id;
    });

    // 4. Processing logic (unchanged)
    const processingOrder = [
        ...allMatches.filter(m => m.bracket === 'wb').sort((a, b) => a.round - b.round),
        ...allMatches.filter(m => m.bracket === 'lb').sort((a, b) => a.round - b.round),
        ...allMatches.filter(m => m.bracket === 'gf'),
        ...allMatches.filter(m => m.bracket.startsWith('p')).sort((a, b) => {
            if (a.bracket !== b.bracket) return a.bracket.localeCompare(b.bracket);
            return a.round - b.round;
        })
    ];

    processingOrder.forEach(match => {
        // Resolve Players
        const resolveSource = (srcId, type) => {
            if (!srcId) return null;
            const src = matchMap.get(srcId);
            if (!src || !src.winnerId) return null;
            const wId = src.winnerId;
            const lId = src.player1Id === wId ? src.player2Id : src.player1Id;
            return type === 'winner' ? wId : lId;
        };

        if (match.sourceMatchId1) {
            const pId = resolveSource(match.sourceMatchId1, match.sourceType1);
            if (pId) match.player1Id = pId;
        }
        if (match.sourceMatchId2) {
            const pId = resolveSource(match.sourceMatchId2, match.sourceType2);
            if (pId) match.player2Id = pId;
        }

        // Determine Scores/Winner
        const existing = existingMatchesMap[match.id];

        // Auto-win BYEs
        let autoWinner = null;
        const p1 = playerMap.get(match.player1Id);
        const p2 = playerMap.get(match.player2Id);
        if (match.player1Id && match.player2Id) {
            if (p1?.isBye) autoWinner = match.player2Id;
            else if (p2?.isBye) autoWinner = match.player1Id;
        }

        if (autoWinner) {
            match.winnerId = autoWinner;
            match.score1 = autoWinner === match.player1Id ? 1 : 0;
            match.score2 = autoWinner === match.player2Id ? 1 : 0;
            match.status = 'finished';
        } else if (existing && (existing.score1 !== null || existing.score2 !== null)) {
            match.score1 = existing.score1;
            match.score2 = existing.score2;
            match.microPoints = existing.micro_points || [];
            if (existing.winnerId) {
                match.winnerId = existing.winnerId;
            } else {
                const bestOf = (match.bracket === 'wb' || match.bracket === 'gf' || match.bracket.endsWith('f')) ? 5 : 3;
                const winThreshold = Math.ceil(bestOf / 2);
                if (match.score1 >= winThreshold) match.winnerId = match.player1Id;
                else if (match.score2 >= winThreshold) match.winnerId = match.player2Id;
            }
            match.status = match.winnerId ? 'finished' : 'live';
        } else {
            match.status = (match.player1Id && match.player2Id) ? 'pending' : 'scheduled';
        }
    });

    return processingOrder;
};

// EXPORTS
export const generateDoubleEliminationBracket = (players) => {
    return rebuildBracketState(players, {});
};

export const updateBracketMatch = (matches, matchId, score1, score2, microPoints = [], playersSource, winnerId = null, status = 'live') => {
    // 1. Scrape Results
    const resultsMap = {};
    matches.forEach(m => {
        if (m.score1 !== null || m.score2 !== null) {
            resultsMap[m.id] = {
                score1: m.score1,
                score2: m.score2,
                micro_points: m.microPoints,
                winnerId: m.winnerId,
                status: m.status
            };
        }
    });

    // 2. Update
    resultsMap[matchId] = {
        score1: parseInt(score1),
        score2: parseInt(score2),
        micro_points: microPoints,
        winnerId: winnerId,
        status: status
    };

    // 3. Rebuild - Use playersSource
    return rebuildBracketState(playersSource, resultsMap);
};

export const clearBracketMatch = (matches, matchId, playersSource) => {
    const resultsMap = {};
    matches.forEach(m => {
        if (m.id !== matchId && (m.score1 !== null || m.score2 !== null)) {
            resultsMap[m.id] = { score1: m.score1, score2: m.score2, micro_points: m.microPoints, winnerId: m.winnerId, status: m.status };
        }
    });
    return rebuildBracketState(playersSource, resultsMap);
};
