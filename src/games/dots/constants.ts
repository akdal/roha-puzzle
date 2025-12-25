export type Player = 1 | 2;

export const PLAYER_COLORS = {
    1: '#22d3ee', // cyan for P1
    2: '#f472b6', // pink for P2
} as const;

export const getPlayerColor = (player: Player): string => {
    return PLAYER_COLORS[player];
};
