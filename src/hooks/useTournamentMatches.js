import { useMemo } from 'react';
import { useMatches } from './useMatches';
import { usePlayers } from './usePlayers';
import { rebuildBracketState } from '../utils/bracketLogic';

/**
 * Returns matches that are fully hydrated with tournament logic.
 * This ensures that even if the database is missing "derived" state (like next match players),
 * the client recalculates it based on the confirmed scores.
 */
export const useTournamentMatches = () => {
    const { matches: rawMatches, saveMatches, resetMatches, isSaving } = useMatches();
    const { players } = usePlayers();

    const matches = useMemo(() => {
        if (!players || players.length === 0) return rawMatches;

        // Convert raw matches list to a map of results for the rebuilder
        const resultsMap = {};
        rawMatches.forEach(m => {
            // Only map relevant state that drives logic
            // map meaningful state including manual overrides/order
            if (m.score1 !== null || m.score2 !== null || m.winnerId || m.manualOrder !== undefined || m.court) {
                resultsMap[m.id] = {
                    score1: m.score1,
                    score2: m.score2,
                    micro_points: m.microPoints,
                    winnerId: m.winnerId,
                    status: m.status,
                    manualOrder: m.manualOrder,
                    court: m.court
                };
            }
        });

        // Re-run the tournament engine to derive the correct current state
        return rebuildBracketState(players, resultsMap);
    }, [rawMatches, players]);

    return {
        matches,
        saveMatches,
        resetMatches,
        isSaving
    };
};
