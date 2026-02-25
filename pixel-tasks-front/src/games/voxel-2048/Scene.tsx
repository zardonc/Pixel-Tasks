import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { TileData } from './types';
import { VoxelTile } from './VoxelTile';

// The dimensions of our game
const GRID_SIZE = 4;
const TILE_SIZE = 1;
const GAP = 0.1;
const BOARD_SIZE = GRID_SIZE * TILE_SIZE + (GRID_SIZE + 1) * GAP;

const BoardBase: React.FC = () => {
    // Generate the cells for the base grid
    const cells = useMemo(() => {
        const arr = [];
        const offset = BOARD_SIZE / 2;
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                // Calculate position relative to center [0,0,0]
                const x = col * (TILE_SIZE + GAP) + (TILE_SIZE / 2) + GAP - offset;
                const z = row * (TILE_SIZE + GAP) + (TILE_SIZE / 2) + GAP - offset;
                arr.push({ id: `cell-${row}-${col}`, position: [x, -0.25, z] as [number, number, number] });
            }
        }
        return arr;
    }, []);

    return (
        <group>
            {/* The main underlying board slab */}
            <mesh position={[0, -0.55, 0]} receiveShadow>
                <boxGeometry args={[BOARD_SIZE + 0.2, 0.5, BOARD_SIZE + 0.2]} />
                <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
            
            {/* The individual grid cell indents */}
            {cells.map((cell) => (
                <mesh key={cell.id} position={cell.position} receiveShadow>
                    <boxGeometry args={[TILE_SIZE, 0.1, TILE_SIZE]} />
                    <meshStandardMaterial color="#334155" roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
};

export const Scene: React.FC<{ grid: TileData[], is3D: boolean }> = ({ grid, is3D }) => {
    return (
        <Canvas shadows>
            <React.Suspense fallback={null}>
                <OrthographicCamera 
                    makeDefault 
                    position={is3D ? [0, 25, 10] : [0, 50, 0]} 
                    zoom={is3D ? 60 : 70} 
                    near={-100} 
                    far={200}
                    onUpdate={(c) => c.lookAt(0, 0, 0)}
                />
                
                <group>
                    <ambientLight intensity={0.6} />
                    <directionalLight 
                        position={[10, 20, 5]} 
                        intensity={1.5} 
                        castShadow 
                        shadow-mapSize-width={2048} 
                        shadow-mapSize-height={2048}
                    />

                    <BoardBase />

                    {/* Render dynamic tiles */}
                    {grid.map(tile => (
                        <VoxelTile key={tile.id} tile={tile} />
                    ))}
                </group>
            </React.Suspense>
        </Canvas>
    );
};
