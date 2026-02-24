export type GameStatus = "PLAYING" | "WON" | "GAME_OVER";

export interface TileData {
    id: string; // Unique string to track lifecycle across renders
    value: number; // The power of 2 value (2, 4, 8, etc.)
    row: number; // 0-3
    col: number; // 0-3
    mergedFrom?: [TileData, TileData]; // Used for merge animations
    isNew?: boolean; // Used for spawn animations
}

export interface GameState {
    grid: TileData[];
    score: number;
    status: GameStatus;
    hasChanged: boolean;
}
