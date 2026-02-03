import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useTournament } from './TournamentContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, getDocs, doc, query, where, writeBatch } from 'firebase/firestore';

const MatchesContext = createContext(null);

const BASE_KEY = 'brazilian_v14_GLOBAL_STATE';

export const MatchesProvider = ({ children }) => {
    const [matches, setMatches] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const { isAuthenticated } = useAuth();
    const { activeTournamentId } = useTournament();

    const lsKey = activeTournamentId ? `${BASE_KEY}_${activeTournamentId}` : null;

    // --- MAPPERS ---
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
        bracket_type: m.bracket || 'wb',
        round_id: m.round || 1,
        player1_id: m.player1Id || null,
        player2_id: m.player2Id || null,
        score1: m.score1 ?? null,
        score2: m.score2 ?? null,
        micro_points: JSON.stringify(m.microPoints || []),
        winner_id: m.winnerId || null,
        status: m.status || 'pending',
        court: m.court || ""
    });

    // --- DATA LOADING ---
    useEffect(() => {
        if (!activeTournamentId) {
            setMatches([]);
            return;
        }

        let unsubscribe;

        const fetchMatches = async () => {
            if (isFirebaseConfigured) {
                console.log(`[MatchesContext] Subscribing to tournament: ${activeTournamentId}`);
                const q = query(collection(db, "matches"), where("tournament_id", "==", activeTournamentId));

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const loaded = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })).map(mapToCamel);

                    // Simple Diff Check could be here, but for now just set
                    setMatches(loaded);
                    console.log(`[MatchesContext] Loaded ${loaded.length} matches from Firebase`);
                }, (error) => {
                    console.error("[MatchesContext] Firebase Error:", error);
                });
            } else {
                // LS Fallback
                try {
                    const saved = localStorage.getItem(lsKey);
                    if (saved) {
                        setMatches(JSON.parse(saved));
                    }
                } catch (e) {
                    console.error("LS Load Error", e);
                }
            }
        };

        fetchMatches();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [activeTournamentId, lsKey]);

    // --- ACTIONS ---
    const resetMatches = async () => {
        if (!isAuthenticated || !activeTournamentId || !isFirebaseConfigured) return;
        try {
            setIsSaving(true);
            const q = query(collection(db, "matches"), where("tournament_id", "==", activeTournamentId));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            setMatches([]); // Clear local immediately
        } catch (e) {
            console.error("Error resetting matches:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const saveMatches = useCallback(async (newMatches) => {
        if (!activeTournamentId) {
            console.error("No active tournament ID, cannot save!");
            return;
        }

        // 1. OPTIMISTIC UPDATE
        setMatches(newMatches);

        // 2. PERSISTENCE
        if (isFirebaseConfigured && isAuthenticated) {

            try {
                const { setDoc, updateDoc } = await import('firebase/firestore');

                // Identify changed matches to avoid spamming 100+ writes
                // We compare newMatches against the PREVIOUS state (matches) 
                // But since setState is async and we are inside useCallback, 'matches' might be stale?
                // Actually 'matches' is not in dependency array to avoid loop. 
                // However, the caller usually passes the full new state.
                // Let's rely on finding which match triggered this? 
                // Ideally, the caller should pass "changedMatchId". 
                // But for now, let's just diff against memory (expensive but safer than spamming DB)

                // Better approach: Just look for the match that has changed timestamp? No timestamp yet.
                // Let's filter by checking which match differs from 'matches' state?
                // But 'matches' in scope is closure-captured from render? 
                // The dependency array has [isAuthenticated, activeTournamentId, lsKey]. 
                // So 'matches' is NOT in scope correctly! 

                // FIX: use functional update logic or just assume the Caller sent us a modified list?
                // Since we don't have the old list reliably to diff here without adding it to dependency...
                // We will try to rely on a 'Diff' helper or just save valid matches.

                // CRITICAL FIX requested: "Find only the one specific match".
                // Since we don't know which one changed, we need to be smart.
                // But wait, the user said "Save only one, specific match". 
                // We can't know which one unless we diff.

                // Let's use a simple diff by ID match.
                // We need to access the 'current' matches to diff. 
                // We can use a ref or just... 

                // Simpler: The caller (updateBracketMatch) returns a NEW array referencing SAME objects for unchanged.
                // We can check strict equality reference!

                const changedMatches = [];
                // We need the PREVIOUS matches to compare.
                // setMatches(prev => ...) gives us prev, but we can't access it outside.

                // HACK: Use a Ref to store previous matches for Diffing
                // But we define Ref outside.

                // ALERT: To strictly follow instruction "Find the function... must save only one specific match",
                // we should change the signature of saveMatches to accept (newMatches, changedMatchId)
                // But that requires changing callers. 

                // ALTERNATIVE: Diff against the state variable 'matches' which IS available in scope if we add it to deps?
                // No, that causes cycles.

                // Let's assume we simply iterate and check if it looks 'active' or 'just modified'? No.

                // Let's implement the DIFF logic using the injected 'matches' from scope 
                // (we need to add 'matches' to dependency for this logic to work, but proceed with caution).
                // Actually, let's use a Mutable Ref to keep track of "last saved state".

                const payload = newMatches.map(m => mapToSnake(m));

                const changesToSave = payload.filter(p => {
                    // Primitive diff: Find existing match in CURRENT 'matches' state
                    const old = matches.find(m => m.id === p.id);
                    if (!old) return true; // New match

                    // Compare critical fields
                    const oldSnake = mapToSnake(old);
                    return JSON.stringify(oldSnake) !== JSON.stringify(p);
                });

                if (changesToSave.length === 0) {
                    // Fallback: If for some reason diff failed (e.g. references broken), save all?
                    // No, if 0 changes detected, maybe we just save nothing?
                    // But to be safe vs bugs, if we can't detect, we log warning.
                    // console.log("No changes detected via Diff.");
                    return;
                }

                const promises = changesToSave.map(match => {
                    console.log("DEBUG: Sending SINGLE match to Firestore:", match.id, match);
                    const docRef = doc(db, "matches", match.id);
                    return setDoc(docRef, match);
                });

                Promise.all(promises).catch(err => console.error("Async Save Error:", err));

            } catch (e) {
                console.error("Error initiating save:", e);
            }
        } else {
            // LS
            localStorage.setItem(lsKey, JSON.stringify(newMatches));
        }
    }, [isAuthenticated, activeTournamentId, lsKey, matches]); // Added matches to deps for Diffing

    return (
        <MatchesContext.Provider value={{ matches, saveMatches, resetMatches, isSaving }}>
            {children}
        </MatchesContext.Provider>
    );
};

export const useMatchesContext = () => {
    const context = useContext(MatchesContext);
    if (!context) {
        throw new Error("useMatchesContext must be used within MatchesProvider");
    }
    return context;
};
