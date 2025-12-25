import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tile {
    id: number;
    value: number;
    row: number;
    col: number;
    previousRow?: number;
    previousCol?: number;
    mergedFrom?: number[];
    isNew?: boolean;
}

interface LeaderboardEntry {
    score: number;
    maxTile: number;
    date: number;
}

interface Game2048State {
    tiles: Tile[];
    score: number;
    bestScore: number;
    gameStatus: 'IDLE' | 'PLAYING' | 'WON' | 'LOST';
    moveCount: number;
    startTime: number | null;
    leaderboard: LeaderboardEntry[];
    viewResetRequested: boolean;
    continueAfterWin: boolean;
}

interface Game2048Actions {
    initGame: () => void;
    move: (direction: 'up' | 'down' | 'left' | 'right') => void;
    continueGame: () => void;
    requestViewReset: () => void;
    clearViewReset: () => void;
    clearAnimationFlags: () => void;
}

const GRID_SIZE = 4;
let tileIdCounter = 0;

const createTile = (row: number, col: number, value: number = 2): Tile => ({
    id: ++tileIdCounter,
    value,
    row,
    col,
    isNew: true,
});

const getEmptyCells = (tiles: Tile[]): { row: number; col: number }[] => {
    const occupied = new Set(tiles.map(t => `${t.row},${t.col}`));
    const empty: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (!occupied.has(`${row},${col}`)) {
                empty.push({ row, col });
            }
        }
    }
    return empty;
};

const addRandomTile = (tiles: Tile[]): Tile[] => {
    const empty = getEmptyCells(tiles);
    if (empty.length === 0) return tiles;
    const { row, col } = empty[Math.floor(Math.random() * empty.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    return [...tiles, createTile(row, col, value)];
};

const canMove = (tiles: Tile[]): boolean => {
    if (tiles.length < GRID_SIZE * GRID_SIZE) return true;

    const grid: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    tiles.forEach(t => { grid[t.row][t.col] = t.value; });

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const val = grid[row][col];
            if (row < GRID_SIZE - 1 && grid[row + 1][col] === val) return true;
            if (col < GRID_SIZE - 1 && grid[row][col + 1] === val) return true;
        }
    }
    return false;
};

const moveTiles = (
    tiles: Tile[],
    direction: 'up' | 'down' | 'left' | 'right'
): { tiles: Tile[]; scoreGained: number; moved: boolean } => {
    const isVertical = direction === 'up' || direction === 'down';
    const isReverse = direction === 'down' || direction === 'right';

    let scoreGained = 0;
    let moved = false;
    const newTiles: Tile[] = [];
    const mergedPositions = new Set<string>();

    // Process each line (row or column)
    for (let line = 0; line < GRID_SIZE; line++) {
        // Get tiles in this line
        let lineTiles = tiles.filter(t =>
            isVertical ? t.col === line : t.row === line
        );

        // Sort by position
        lineTiles.sort((a, b) => {
            const posA = isVertical ? a.row : a.col;
            const posB = isVertical ? b.row : b.col;
            return isReverse ? posB - posA : posA - posB;
        });

        let targetPos = isReverse ? GRID_SIZE - 1 : 0;
        const step = isReverse ? -1 : 1;

        for (let i = 0; i < lineTiles.length; i++) {
            const tile = lineTiles[i];

            // Check if can merge with previous tile
            const prevTile = newTiles.find(t => {
                const tPos = isVertical ? t.row : t.col;
                const tLine = isVertical ? t.col : t.row;
                return tPos === targetPos - step && tLine === line;
            });

            const prevPosKey = `${isVertical ? targetPos - step : line},${isVertical ? line : targetPos - step}`;

            if (prevTile && prevTile.value === tile.value && !mergedPositions.has(prevPosKey)) {
                // Merge
                prevTile.value *= 2;
                prevTile.mergedFrom = [prevTile.id, tile.id];
                scoreGained += prevTile.value;
                mergedPositions.add(prevPosKey);
                moved = true;
            } else {
                // Move
                const newTile: Tile = {
                    ...tile,
                    previousRow: tile.row,
                    previousCol: tile.col,
                    isNew: false,
                    mergedFrom: undefined,
                };

                if (isVertical) {
                    newTile.row = targetPos;
                } else {
                    newTile.col = targetPos;
                }

                if (newTile.row !== tile.row || newTile.col !== tile.col) {
                    moved = true;
                }

                newTiles.push(newTile);
                targetPos += step;
            }
        }
    }

    return { tiles: newTiles, scoreGained, moved };
};

const getMaxTile = (tiles: Tile[]): number => {
    return tiles.reduce((max, t) => Math.max(max, t.value), 0);
};

export const use2048Store = create<Game2048State & Game2048Actions>()(
    persist(
        (set, get) => ({
            tiles: [],
            score: 0,
            bestScore: 0,
            gameStatus: 'IDLE',
            moveCount: 0,
            startTime: null,
            leaderboard: [],
            viewResetRequested: false,
            continueAfterWin: false,

            initGame: () => {
                tileIdCounter = 0;
                let tiles: Tile[] = [];
                tiles = addRandomTile(tiles);
                tiles = addRandomTile(tiles);

                set({
                    tiles,
                    score: 0,
                    gameStatus: 'PLAYING',
                    moveCount: 0,
                    startTime: Date.now(),
                    continueAfterWin: false,
                });
            },

            move: (direction) => {
                const state = get();
                if (state.gameStatus !== 'PLAYING') return;

                const { tiles: movedTiles, scoreGained, moved } = moveTiles(state.tiles, direction);

                if (!moved) return;

                // Add new tile
                const newTiles = addRandomTile(movedTiles);
                const newScore = state.score + scoreGained;
                const maxTile = getMaxTile(newTiles);

                // Check win condition
                let newStatus: Game2048State['gameStatus'] = 'PLAYING';
                if (maxTile >= 2048 && !state.continueAfterWin) {
                    newStatus = 'WON';
                    // Add to leaderboard
                    const entry: LeaderboardEntry = {
                        score: newScore,
                        maxTile,
                        date: Date.now(),
                    };
                    const newLeaderboard = [...state.leaderboard, entry]
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5);

                    set({
                        tiles: newTiles,
                        score: newScore,
                        bestScore: Math.max(state.bestScore, newScore),
                        gameStatus: newStatus,
                        moveCount: state.moveCount + 1,
                        leaderboard: newLeaderboard,
                    });
                    return;
                }

                // Check lose condition
                if (!canMove(newTiles)) {
                    newStatus = 'LOST';
                    // Add to leaderboard
                    const entry: LeaderboardEntry = {
                        score: newScore,
                        maxTile,
                        date: Date.now(),
                    };
                    const newLeaderboard = [...state.leaderboard, entry]
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 5);

                    set({
                        tiles: newTiles,
                        score: newScore,
                        bestScore: Math.max(state.bestScore, newScore),
                        gameStatus: newStatus,
                        moveCount: state.moveCount + 1,
                        leaderboard: newLeaderboard,
                    });
                    return;
                }

                set({
                    tiles: newTiles,
                    score: newScore,
                    bestScore: Math.max(state.bestScore, newScore),
                    moveCount: state.moveCount + 1,
                });
            },

            continueGame: () => {
                set({
                    gameStatus: 'PLAYING',
                    continueAfterWin: true,
                });
            },

            clearAnimationFlags: () => {
                set(state => ({
                    tiles: state.tiles.map(t => ({
                        ...t,
                        isNew: false,
                        mergedFrom: undefined,
                        previousRow: undefined,
                        previousCol: undefined,
                    })),
                }));
            },

            requestViewReset: () => set({ viewResetRequested: true }),
            clearViewReset: () => set({ viewResetRequested: false }),
        }),
        {
            name: 'game-2048-storage',
            partialize: (state) => ({
                bestScore: state.bestScore,
                leaderboard: state.leaderboard,
            }),
        }
    )
);
