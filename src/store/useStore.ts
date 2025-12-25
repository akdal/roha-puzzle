import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rotateVector, rotateQuaternion, type Axis } from '../utils/math';
import { Quaternion } from 'three';

interface CubieState {
    id: number;
    position: [number, number, number];
    rotation: [number, number, number, number];
    originalPosition: [number, number, number];
}

interface AnimationState {
    isAnimating: boolean;
    axis: Axis | null;
    layer: number | null;
    direction: 1 | -1 | 0;
    speed: number;
}

interface LeaderboardEntry {
    time: number;
    moves: number;
    date: string;
}

interface GameState {
    cubies: CubieState[];
    isSolving: boolean;
    gameStatus: 'IDLE' | 'RUNNING' | 'SOLVED';
    startTime: number | null;
    moveCount: number;
    animation: AnimationState;
    scrambleQueue: { axis: Axis, layer: number, direction: 1 | -1 }[];
    leaderboard: LeaderboardEntry[];
    theme: 'dark' | 'light' | 'blue';
}

interface Action {
    initCube: () => void;
    triggerRotation: (axis: Axis, layer: number, direction: 1 | -1, speed?: number) => void;
    finishRotation: () => void;
    scramble: (count?: number) => void;
    resetGame: () => void;
    setTheme: (theme: 'dark' | 'light' | 'blue') => void;
}

const generateCubies = (): CubieState[] => {
    const cubies: CubieState[] = [];
    let id = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                cubies.push({
                    id: id++,
                    position: [x, y, z],
                    rotation: [0, 0, 0, 1],
                    originalPosition: [x, y, z]
                });
            }
        }
    }
    return cubies;
};

const checkSolved = (cubies: CubieState[]): boolean => {
    for (const c of cubies) {
        const dx = Math.abs(c.position[0] - c.originalPosition[0]);
        const dy = Math.abs(c.position[1] - c.originalPosition[1]);
        const dz = Math.abs(c.position[2] - c.originalPosition[2]);
        if (dx > 0.1 || dy > 0.1 || dz > 0.1) return false;
        const q = new Quaternion(...c.rotation);
        if (Math.abs(q.dot(new Quaternion(0, 0, 0, 1))) < 0.95) return false;
    }
    return true;
};

export const useStore = create<GameState & Action>()(
    persist(
        (set, get) => ({
            cubies: generateCubies(),
            isSolving: false,
            gameStatus: 'IDLE',
            startTime: null,
            moveCount: 0,
            animation: { isAnimating: false, axis: null, layer: null, direction: 0, speed: 1 },
            scrambleQueue: [],
            leaderboard: [],
            theme: 'dark',

            initCube: () => set({ cubies: generateCubies() }),

            setTheme: (theme) => set({ theme }),

            triggerRotation: (axis, layer, direction, speed = 1) => {
                const state = get();
                if (state.animation.isAnimating) return;

                if (state.gameStatus === 'IDLE' && state.scrambleQueue.length === 0) {
                    set({ gameStatus: 'RUNNING', startTime: Date.now(), isSolving: true });
                }

                set({ animation: { isAnimating: true, axis, layer, direction, speed } });
            },

            finishRotation: () => set((state) => {
                const { axis, layer, direction } = state.animation;
                if (!axis || direction === 0) return { animation: { ...state.animation, isAnimating: false } };

                const newCubies = state.cubies.map((cubie) => {
                    const currentPos = cubie.position;
                    const posVal = axis === 'x' ? currentPos[0] : axis === 'y' ? currentPos[1] : currentPos[2];

                    if (Math.round(posVal) === layer) {
                        return {
                            ...cubie,
                            position: rotateVector(cubie.position, axis, direction),
                            rotation: rotateQuaternion(cubie.rotation, axis, direction)
                        };
                    }
                    return cubie;
                });

                const solved = state.scrambleQueue.length === 0 && state.gameStatus === 'RUNNING' && checkSolved(newCubies);

                // Handle Persistence only on SOLVED
                let newLeaderboard = state.leaderboard;
                if (solved && state.startTime) {
                    const time = (Date.now() - state.startTime) / 1000;
                    newLeaderboard = [...state.leaderboard, {
                        time,
                        moves: state.moveCount + 1,
                        date: new Date().toISOString()
                    }].sort((a, b) => a.time - b.time).slice(0, 5);
                }

                let nextScramble = state.scrambleQueue;
                let nextAnimation: AnimationState = { isAnimating: false, axis: null, layer: null, direction: 0, speed: 1 };

                if (state.scrambleQueue.length > 0) {
                    const [move, ...rest] = state.scrambleQueue;
                    nextScramble = rest;
                    if (move) {
                        nextAnimation = {
                            isAnimating: true,
                            axis: move.axis,
                            layer: move.layer,
                            direction: move.direction,
                            speed: 5
                        };
                    }
                }

                return {
                    cubies: newCubies,
                    moveCount: state.moveCount + 1,
                    gameStatus: solved ? 'SOLVED' : state.gameStatus,
                    isSolving: solved ? false : state.isSolving,
                    scrambleQueue: nextScramble,
                    animation: nextAnimation,
                    leaderboard: newLeaderboard
                };
            }),

            scramble: (count = 20) => {
                const moves: { axis: Axis, layer: number, direction: 1 | -1 }[] = [];
                for (let i = 0; i < count; i++) {
                    const axes: Axis[] = ['x', 'y', 'z'];
                    const axis = axes[Math.floor(Math.random() * 3)];
                    const layer = Math.floor(Math.random() * 3) - 1;
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    moves.push({ axis, layer, direction: direction as 1 | -1 });
                }

                set({
                    gameStatus: 'IDLE',
                    moveCount: 0,
                    startTime: null,
                    isSolving: false,
                    cubies: generateCubies(),
                    scrambleQueue: moves
                });

                const first = moves[0];
                if (first) {
                    set((s) => ({
                        scrambleQueue: moves.slice(1),
                        animation: { ...s.animation, isAnimating: true, axis: first.axis, layer: first.layer, direction: first.direction, speed: 5 }
                    }));
                }
            },

            resetGame: () => set({
                cubies: generateCubies(),
                gameStatus: 'IDLE',
                startTime: null,
                moveCount: 0,
                animation: { isAnimating: false, axis: null, layer: null, direction: 0, speed: 1 },
                scrambleQueue: []
            }),
        }),
        {
            name: 'rubiks3d-storage',
            partialize: (state) => ({ leaderboard: state.leaderboard, theme: state.theme }),
        }
    )
);
