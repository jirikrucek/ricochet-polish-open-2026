import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useTournament } from '../contexts/TournamentContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BASE_KEY = 'ricochet_bracket_data';

export const useMatches = () => {
    const [matches, setMatches] = useState([]);
    const { isAuthenticated } = useAuth();
    const { activeTournamentId } = useTournament();

    const lsKey = activeTournamentId ? `${BASE_KEY}_${activeTournamentId}` : null;

    // Supabase needs snake_case, App uses CamelCase.
    const mapToCamel = (m) => {
        let mp = [];
        try {
            mp = typeof m.micro_points === 'string' ? JSON.parse(m.micro_points) : (m.micro_points || []);
        } catch (e) {
            mp = m.micro_points || [];
        }

        return {
            id: m.id,
            tournamentId: m.tournament_id,
            bracket: m.bracket_type,
            round: m.round_id,
            player1Id: m.player1_id,
            player2Id: m.player2_id,
            score1: m.score1,
            score2: m.score2,
            microPoints: mp,
            winnerId: m.winner_id,
            status: m.status,
            court: m.court
        };
    };

    const mapToSnake = (m) => ({
        id: m.id,
        tournament_id: activeTournamentId,
        bracket_type: m.bracket,
        round_id: m.round,
        player1_id: m.player1Id,
        player2_id: m.player2Id,
        score1: m.score1,
        score2: m.score2,
        micro_points: JSON.stringify(m.microPoints || []),
        winner_id: m.winnerId,
        status: m.status,
        court: m.court
    });

    // Local Storage Legacy Migration / Normalization
    const migrateDataLS = (rawMatches) => {
        let changed = false;
        const migrated = rawMatches.map(m => {
            const newM = { ...m };
            if (m.player1?.id && !m.player1Id) { newM.player1Id = m.player1.id; delete newM.player1; changed = true; }
            if (m.player2?.id && !m.player2Id) { newM.player2Id = m.player2.id; delete newM.player2; changed = true; }
            if (m.bracket_type) { newM.bracket = m.bracket_type; delete newM.bracket_type; changed = true; }
            if (m.round_id) { newM.round = m.round_id; delete newM.round_id; changed = true; }
            if (m.winner_id) { newM.winnerId = m.winner_id; delete newM.winner_id; changed = true; }
            if (m.micro_points && !m.microPoints) { newM.microPoints = m.micro_points; delete newM.micro_points; changed = true; }
            return newM;
        });
        return { migrated, changed };
    };

    useEffect(() => {
        if (!activeTournamentId) {
            setMatches([]);
            return;
        }

        const fetchMatches = async () => {
            if (isSupabaseConfigured) {
                // SUPABASE
                const { data, error } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('tournament_id', activeTournamentId);

                if (!error && data) {
                    setMatches(data.map(mapToCamel));
                }
            } else {
                // LOCAL STORAGE
                try {
                    const saved = localStorage.getItem(lsKey);
                    const raw = saved ? JSON.parse(saved) : [];
                    const { migrated, changed } = migrateDataLS(raw);
                    setMatches(migrated);
                    if (changed) {
                        localStorage.setItem(lsKey, JSON.stringify(migrated));
                    }
                } catch (e) {
                    console.error("LS Error", e);
                    setMatches([]);
                }
            }
        };

        fetchMatches();

        let channel;
        if (isSupabaseConfigured) {
            channel = supabase
                .channel(`matches:${activeTournamentId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'matches',
                    filter: `tournament_id=eq.${activeTournamentId}`
                }, () => {
                    fetchMatches();
                })
                .subscribe();
        } else {
            // LS Listener
            const loadLS = () => fetchMatches();
            window.addEventListener('storage', loadLS);
            return () => window.removeEventListener('storage', loadLS);
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [activeTournamentId, lsKey]);

    const saveMatches = async (newMatches) => {
        if (!isAuthenticated || !activeTournamentId) return;

        setMatches(newMatches);

        if (isSupabaseConfigured) {
            const payload = newMatches.map(mapToSnake);
            const { error } = await supabase.from('matches').upsert(payload);
            if (error) console.error("Error saving matches:", error);
        } else {
            // LS
            // Ensure migration consistency
            const { migrated } = migrateDataLS(newMatches);
            localStorage.setItem(lsKey, JSON.stringify(migrated));
        }
    };

    return { matches, saveMatches };
};
