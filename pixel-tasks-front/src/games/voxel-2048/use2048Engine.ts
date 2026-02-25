import { useState, useCallback, useEffect } from 'react';
import { GameState, TileData, GameStatus } from './types';
import { v4 as uuidv4 } from 'uuid';
import { playClack, playPop, playWin, playGameOver } from './audioUtils';

const GRID_SIZE = 4;
const TARGET_SCORE = 2048;

export function use2048Engine() {
    const [gameState, setGameState] = useState<GameState>({
        grid: [],
        score: 0,
        status: 'PLAYING',
        hasChanged: false
    });

    const [soundEnabled, setSoundEnabled] = useState(true);

    const createEmptyGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

    const initGame = useCallback(() => {
        let newGrid: TileData[] = [];
        newGrid = spawnTile(newGrid);
        newGrid = spawnTile(newGrid);
        
        setGameState({
            grid: newGrid,
            score: 0,
            status: 'PLAYING',
            hasChanged: false
        });
    }, []);

    // ... (spawnTile and getVector and buildTraversals remain the same)
    const spawnTile = (currentGrid: TileData[]): TileData[] => {
        const availableCells: {r: number, c: number}[] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!currentGrid.find(t => t.row === r && t.col === c)) {
                    availableCells.push({r, c});
                }
            }
        }

        if (availableCells.length === 0) return currentGrid;

        const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        
        return [...currentGrid, {
            id: uuidv4(),
            value,
            row: randomCell.r,
            col: randomCell.c,
            isNew: true
        }];
    };

    type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

    const getVector = (dir: Direction) => {
        switch (dir) {
            case 'UP': return { x: 0, y: -1 };
            case 'DOWN': return { x: 0, y: 1 };
            case 'LEFT': return { x: -1, y: 0 };
            case 'RIGHT': return { x: 1, y: 0 };
        }
    };

    const buildTraversals = (vector: {x: number, y: number}) => {
        const traversals = { x: [] as number[], y: [] as number[] };
        for (let pos = 0; pos < GRID_SIZE; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();
        return traversals;
    };


    const slide = useCallback((dir: Direction) => {
        setGameState(prevState => {
            if (prevState.status !== 'PLAYING') return prevState;

            const vector = getVector(dir);
            const traversals = buildTraversals(vector);
            let moved = false;
            let scoreIncrement = 0;

            const cellGrid: (TileData | null)[][] = createEmptyGrid();
            const cleanGrid = prevState.grid.map(t => ({ ...t, isNew: false, mergedFrom: undefined }));
            
            cleanGrid.forEach(t => { cellGrid[t.row][t.col] = t; });

            const newGridList: TileData[] = [];
            const mergedTiles: TileData[] = []; 

            traversals.x.forEach(x => {
                traversals.y.forEach(y => {
                    const tile = cellGrid[y][x];
                    if (tile) {
                        const cell = { r: y, c: x };
                        let farthest = cell;
                        let next = { r: cell.r + vector.y, c: cell.c + vector.x };

                        while (next.r >= 0 && next.r < GRID_SIZE && next.c >= 0 && next.c < GRID_SIZE && !cellGrid[next.r][next.c]) {
                            farthest = next;
                            next = { r: next.r + vector.y, c: next.c + vector.x };
                        }

                        let nextTile: TileData | null = null;
                        if (next.r >= 0 && next.r < GRID_SIZE && next.c >= 0 && next.c < GRID_SIZE) {
                            nextTile = cellGrid[next.r][next.c];
                        }

                        if (nextTile && nextTile.value === tile.value && !mergedTiles.includes(nextTile)) {
                            const mergedTile: TileData = {
                                id: uuidv4(),
                                value: tile.value * 2,
                                row: nextTile.row,
                                col: nextTile.col,
                                mergedFrom: [tile, nextTile]
                            };
                            
                            const index = newGridList.findIndex(t => t.id === nextTile!.id);
                            if (index !== -1) newGridList.splice(index, 1);
                            
                            newGridList.push(mergedTile);
                            mergedTiles.push(mergedTile);
                            
                            cellGrid[y][x] = null;
                            cellGrid[next.r][next.c] = mergedTile;
                            
                            scoreIncrement += mergedTile.value;
                            moved = true;
                        } else {
                            const movedTile = { ...tile, row: farthest.r, col: farthest.c };
                            cellGrid[y][x] = null;
                            cellGrid[farthest.r][farthest.c] = movedTile;
                            newGridList.push(movedTile);
                            
                            if (y !== farthest.r || x !== farthest.c) {
                                moved = true;
                            }
                        }
                    }
                });
            });

            if (moved) {
                const hasWon = newGridList.some(t => t.value === TARGET_SCORE);
                let finalGrid = spawnTile(newGridList);
                
                let hasLost = false;
                if (finalGrid.length === GRID_SIZE * GRID_SIZE) {
                    hasLost = !canMove(finalGrid);
                }

                if (soundEnabled) {
                    if (hasWon) {
                        playWin();
                    } else if (hasLost) {
                        playGameOver();
                    } else if (mergedTiles.length > 0) {
                        playPop();
                    } else {
                        playClack();
                    }
                }

                return {
                    grid: finalGrid,
                    score: prevState.score + scoreIncrement,
                    status: hasWon ? 'WON' : hasLost ? 'GAME_OVER' : 'PLAYING',
                    hasChanged: true 
                };
            }

            return { ...prevState, hasChanged: false };
        });
    }, [soundEnabled]);

    const canMove = (currentGrid: TileData[]): boolean => {
        const gridMap: (TileData | null)[][] = createEmptyGrid();
        currentGrid.forEach(t => { gridMap[t.row][t.col] = t; });

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!gridMap[r][c]) return true; 
                const val = gridMap[r][c]!.value;
                if (
                    (r < GRID_SIZE - 1 && gridMap[r+1][c] && gridMap[r+1][c]!.value === val) ||
                    (c < GRID_SIZE - 1 && gridMap[r][c+1] && gridMap[r][c+1]!.value === val)
                ) {
                    return true; 
                }
            }
        }
        return false;
    };

    return {
        gameState,
        initGame,
        slide,
        soundEnabled,
        setSoundEnabled
    };
}
