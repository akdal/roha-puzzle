import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
    time: number;
    moves: number;
    diskCount: number;
    date: string;
    hintCount?: number;
}

interface HintInfo {
    fromPeg: number;
    toPeg: number;
    disk: number;
}

interface HanoiState {
    // Game state
    pegs: number[][]; // 3 pegs, each containing disk sizes (smaller number = smaller disk)
    diskCount: number;
    selectedPeg: number | null;
    moveCount: number;

    // Game status
    gameStatus: 'IDLE' | 'PLAYING' | 'SOLVED';
    startTime: number | null;

    // Animation
    animating: boolean;
    animatingDisk: { from: number; to: number; disk: number } | null;

    // Hint system
    hintActive: boolean;
    hintInfo: HintInfo | null;
    hintCount: number;

    // Settings & records
    leaderboard: LeaderboardEntry[];
}

interface HanoiActions {
    initGame: (diskCount?: number) => void;
    selectPeg: (pegIndex: number) => void;
    setDiskCount: (count: number) => void;
    finishAnimation: () => void;
    showHint: () => void;
    clearHint: () => void;
}

const createInitialPegs = (diskCount: number): number[][] => {
    // All disks start on peg 0, largest (diskCount) at bottom
    const peg0 = Array.from({ length: diskCount }, (_, i) => diskCount - i);
    return [peg0, [], []];
};

const checkSolved = (pegs: number[][], diskCount: number): boolean => {
    // All disks should be on peg 2 (rightmost)
    return pegs[2].length === diskCount;
};

// Minimum moves required: 2^n - 1
const getMinMoves = (diskCount: number): number => Math.pow(2, diskCount) - 1;

// Generate optimal solution moves for Tower of Hanoi
const generateOptimalMoves = (n: number, from: number, to: number, aux: number): { from: number; to: number; disk: number }[] => {
    if (n === 0) return [];
    const moves: { from: number; to: number; disk: number }[] = [];

    // Move n-1 disks from 'from' to 'aux'
    moves.push(...generateOptimalMoves(n - 1, from, aux, to));
    // Move disk n from 'from' to 'to'
    moves.push({ from, to, disk: n });
    // Move n-1 disks from 'aux' to 'to'
    moves.push(...generateOptimalMoves(n - 1, aux, to, from));

    return moves;
};

// Calculate next optimal move from current state
const calculateNextMove = (pegs: number[][], diskCount: number): HintInfo | null => {
    // Generate all optimal moves
    const optimalMoves = generateOptimalMoves(diskCount, 0, 2, 1);

    // Simulate the optimal solution and find where current state matches
    const simPegs: number[][] = [
        Array.from({ length: diskCount }, (_, i) => diskCount - i),
        [],
        []
    ];

    // Check if current state matches initial state
    const statesEqual = (a: number[][], b: number[][]): boolean => {
        return a.every((peg, i) =>
            peg.length === b[i].length && peg.every((disk, j) => disk === b[i][j])
        );
    };

    if (statesEqual(pegs, simPegs)) {
        // At initial state, return first move
        const move = optimalMoves[0];
        return { fromPeg: move.from, toPeg: move.to, disk: move.disk };
    }

    // Apply moves one by one until we match current state
    for (let i = 0; i < optimalMoves.length; i++) {
        const move = optimalMoves[i];
        simPegs[move.from].pop();
        simPegs[move.to].push(move.disk);

        if (statesEqual(pegs, simPegs)) {
            // Found matching state, return next move
            if (i + 1 < optimalMoves.length) {
                const nextMove = optimalMoves[i + 1];
                return { fromPeg: nextMove.from, toPeg: nextMove.to, disk: nextMove.disk };
            }
            return null; // Already at goal
        }
    }

    // Current state doesn't match optimal path
    // Fall back to finding any valid move that makes progress
    // Prioritize moving smallest movable disk towards goal
    for (let disk = 1; disk <= diskCount; disk++) {
        // Find which peg has this disk on top
        let fromPeg = -1;
        for (let p = 0; p < 3; p++) {
            if (pegs[p].length > 0 && pegs[p][pegs[p].length - 1] === disk) {
                fromPeg = p;
                break;
            }
        }
        if (fromPeg === -1) continue;

        // Try to move to peg 2 (goal) first, then to other pegs
        const targetOrder = fromPeg === 2 ? [1, 0] : [2, 1, 0].filter(p => p !== fromPeg);
        for (const toPeg of targetOrder) {
            const topDisk = pegs[toPeg].length > 0 ? pegs[toPeg][pegs[toPeg].length - 1] : Infinity;
            if (disk < topDisk) {
                return { fromPeg, toPeg, disk };
            }
        }
    }

    return null;
};

export const useHanoiStore = create<HanoiState & HanoiActions>()(
    persist(
        (set, get) => ({
            pegs: createInitialPegs(3),
            diskCount: 3,
            selectedPeg: null,
            moveCount: 0,
            gameStatus: 'IDLE',
            startTime: null,
            animating: false,
            animatingDisk: null,
            hintActive: false,
            hintInfo: null,
            hintCount: 0,
            leaderboard: [],

            initGame: (diskCount?: number) => {
                const count = diskCount ?? get().diskCount;
                set({
                    pegs: createInitialPegs(count),
                    diskCount: count,
                    selectedPeg: null,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    animating: false,
                    animatingDisk: null,
                    hintActive: false,
                    hintInfo: null,
                    hintCount: 0,
                });
            },

            setDiskCount: (count: number) => {
                set({
                    diskCount: count,
                    pegs: createInitialPegs(count),
                    selectedPeg: null,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                });
            },

            selectPeg: (pegIndex: number) => {
                const state = get();
                if (state.animating || state.gameStatus === 'SOLVED') return;

                const { pegs, selectedPeg } = state;

                if (selectedPeg === null) {
                    // No peg selected - try to select this peg if it has disks
                    if (pegs[pegIndex].length > 0) {
                        set({ selectedPeg: pegIndex });
                    }
                } else {
                    // A peg is already selected
                    if (selectedPeg === pegIndex) {
                        // Deselect if clicking same peg
                        set({ selectedPeg: null });
                    } else {
                        // Try to move disk
                        const fromPeg = pegs[selectedPeg];
                        const toPeg = pegs[pegIndex];
                        const movingDisk = fromPeg[fromPeg.length - 1];
                        const topDiskOnTarget = toPeg[toPeg.length - 1];

                        // Valid move: target is empty OR moving disk is smaller than top disk
                        if (toPeg.length === 0 || movingDisk < topDiskOnTarget) {
                            // Start game on first move
                            const isFirstMove = state.gameStatus === 'IDLE';

                            // Start animation
                            set({
                                animating: true,
                                animatingDisk: { from: selectedPeg, to: pegIndex, disk: movingDisk },
                                selectedPeg: null,
                                gameStatus: isFirstMove ? 'PLAYING' : state.gameStatus,
                                startTime: isFirstMove ? Date.now() : state.startTime,
                            });
                        } else {
                            // Invalid move - just deselect
                            set({ selectedPeg: null });
                        }
                    }
                }
            },

            finishAnimation: () => {
                const state = get();
                const { animatingDisk, pegs, moveCount, diskCount, startTime } = state;

                if (!animatingDisk) {
                    set({ animating: false });
                    return;
                }

                const newPegs = pegs.map(peg => [...peg]);
                newPegs[animatingDisk.from].pop();
                newPegs[animatingDisk.to].push(animatingDisk.disk);

                const solved = checkSolved(newPegs, diskCount);
                const newMoveCount = moveCount + 1;

                let newLeaderboard = state.leaderboard;
                if (solved && startTime) {
                    const time = (Date.now() - startTime) / 1000;
                    newLeaderboard = [
                        ...state.leaderboard,
                        { time, moves: newMoveCount, diskCount, date: new Date().toISOString(), hintCount: state.hintCount }
                    ].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
                }

                set({
                    pegs: newPegs,
                    moveCount: newMoveCount,
                    animating: false,
                    animatingDisk: null,
                    gameStatus: solved ? 'SOLVED' : 'PLAYING',
                    leaderboard: newLeaderboard,
                    hintActive: false,
                    hintInfo: null,
                });
            },

            showHint: () => {
                const state = get();
                if (state.gameStatus === 'SOLVED' || state.animating) return;

                const hintInfo = calculateNextMove(state.pegs, state.diskCount);
                if (hintInfo) {
                    set({
                        hintActive: true,
                        hintInfo,
                        hintCount: state.hintCount + 1,
                    });

                    // Auto-clear hint after 3 seconds
                    setTimeout(() => {
                        const currentState = get();
                        if (currentState.hintActive) {
                            set({ hintActive: false, hintInfo: null });
                        }
                    }, 3000);
                }
            },

            clearHint: () => {
                set({ hintActive: false, hintInfo: null });
            },
        }),
        {
            name: 'hanoi-storage',
            partialize: (state) => ({
                leaderboard: state.leaderboard,
                diskCount: state.diskCount,
            }),
        }
    )
);

export { getMinMoves };
