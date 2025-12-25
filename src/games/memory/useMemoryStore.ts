import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Winter/Christmas themed icons
const CARD_ICONS = [
    '🎄', // Christmas tree
    '⭐', // Star
    '🎅', // Santa
    '❄️', // Snowflake
    '🎁', // Gift
    '⛄', // Snowman
    '🦌', // Reindeer
    '🔔', // Bell
    '🧦', // Stocking
    '🕯️', // Candle
    '🍪', // Cookie
    '☃️', // Snowman with snow
];

interface Card {
    id: number;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface LeaderboardEntry {
    time: number;
    moves: number;
    gridSize: number;
    date: string;
}

interface MemoryState {
    cards: Card[];
    gridSize: 4 | 6; // 4x4 (8 pairs) or 6x6 (18 pairs)
    flippedCards: number[]; // indices of currently flipped cards
    moveCount: number;
    gameStatus: 'IDLE' | 'PLAYING' | 'SOLVED';
    startTime: number | null;
    isProcessing: boolean; // prevent clicks during animation
    leaderboard: LeaderboardEntry[];
}

interface MemoryActions {
    initGame: (gridSize?: 4 | 6) => void;
    setGridSize: (size: 4 | 6) => void;
    flipCard: (index: number) => void;
    checkMatch: () => void;
    scramble: () => void;
}

const createCards = (gridSize: number): Card[] => {
    const pairCount = (gridSize * gridSize) / 2;
    const icons = CARD_ICONS.slice(0, pairCount);

    // Create pairs
    const cards: Card[] = [];
    icons.forEach((icon, i) => {
        cards.push({ id: i * 2, icon, isFlipped: false, isMatched: false });
        cards.push({ id: i * 2 + 1, icon, isFlipped: false, isMatched: false });
    });

    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
};

export const useMemoryStore = create<MemoryState & MemoryActions>()(
    persist(
        (set, get) => ({
            cards: createCards(4),
            gridSize: 4,
            flippedCards: [],
            moveCount: 0,
            gameStatus: 'IDLE',
            startTime: null,
            isProcessing: false,
            leaderboard: [],

            initGame: (gridSize?: 4 | 6) => {
                const size = gridSize ?? get().gridSize;
                set({
                    cards: createCards(size),
                    gridSize: size,
                    flippedCards: [],
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    isProcessing: false,
                });
            },

            setGridSize: (size: 4 | 6) => {
                set({
                    gridSize: size,
                    cards: createCards(size),
                    flippedCards: [],
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    isProcessing: false,
                });
            },

            scramble: () => {
                const { gridSize } = get();
                set({
                    cards: createCards(gridSize),
                    flippedCards: [],
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    isProcessing: false,
                });
            },

            flipCard: (index: number) => {
                const state = get();
                if (state.isProcessing) return;
                if (state.gameStatus === 'SOLVED') return;
                if (state.cards[index].isFlipped || state.cards[index].isMatched) return;
                if (state.flippedCards.length >= 2) return;

                const isFirstMove = state.gameStatus === 'IDLE';
                const newCards = [...state.cards];
                newCards[index] = { ...newCards[index], isFlipped: true };

                const newFlipped = [...state.flippedCards, index];

                set({
                    cards: newCards,
                    flippedCards: newFlipped,
                    gameStatus: 'PLAYING',
                    startTime: isFirstMove ? Date.now() : state.startTime,
                });

                // If two cards are flipped, check for match
                if (newFlipped.length === 2) {
                    set({ isProcessing: true });
                    setTimeout(() => get().checkMatch(), 800);
                }
            },

            checkMatch: () => {
                const state = get();
                const [first, second] = state.flippedCards;
                const newCards = [...state.cards];
                const isMatch = newCards[first].icon === newCards[second].icon;

                if (isMatch) {
                    newCards[first] = { ...newCards[first], isMatched: true };
                    newCards[second] = { ...newCards[second], isMatched: true };
                } else {
                    newCards[first] = { ...newCards[first], isFlipped: false };
                    newCards[second] = { ...newCards[second], isFlipped: false };
                }

                const allMatched = newCards.every(card => card.isMatched);
                const newMoveCount = state.moveCount + 1;

                let newLeaderboard = state.leaderboard;
                if (allMatched && state.startTime) {
                    const time = (Date.now() - state.startTime) / 1000;
                    newLeaderboard = [
                        ...state.leaderboard,
                        { time, moves: newMoveCount, gridSize: state.gridSize, date: new Date().toISOString() }
                    ].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
                }

                set({
                    cards: newCards,
                    flippedCards: [],
                    moveCount: newMoveCount,
                    gameStatus: allMatched ? 'SOLVED' : 'PLAYING',
                    isProcessing: false,
                    leaderboard: newLeaderboard,
                });
            },
        }),
        {
            name: 'memory-storage',
            partialize: (state) => ({
                leaderboard: state.leaderboard,
                gridSize: state.gridSize,
            }),
        }
    )
);
