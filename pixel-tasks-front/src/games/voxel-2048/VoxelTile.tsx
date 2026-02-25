import React, { useState, useEffect } from 'react';
import { TileData } from './types';
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

const GRID_SIZE = 4;
const TILE_SIZE = 1;
const GAP = 0.1;
const BOARD_SIZE = GRID_SIZE * TILE_SIZE + (GRID_SIZE + 1) * GAP;

// A visually pleasing map of powers of 2 (Minecraft / Voxel aesthetic inspired)
const COLOR_MAP: Record<number, { bg: string, text: string }> = {
    2: { bg: '#fcd34d', text: '#78350f' },       // Amber 300 / 900
    4: { bg: '#fbbf24', text: '#78350f' },       // Amber 400
    8: { bg: '#f59e0b', text: '#fffbeb' },       // Amber 500 / 50
    16: { bg: '#f97316', text: '#fffbeb' },      // Orange 500
    32: { bg: '#ef4444', text: '#fef2f2' },      // Red 500
    64: { bg: '#dc2626', text: '#fef2f2' },      // Red 600
    128: { bg: '#fde047', text: '#854d0e' },     // Yellow 300
    256: { bg: '#facc15', text: '#713f12' },     // Yellow 400
    512: { bg: '#eab308', text: '#fefce8' },     // Yellow 500
    1024: { bg: '#10b981', text: '#ecfdf5' },    // Emerald 500
    2048: { bg: '#059669', text: '#ecfdf5' },    // Emerald 600
    4096: { bg: '#3b82f6', text: '#eff6ff' },    // Blue 500
    8192: { bg: '#8b5cf6', text: '#f5f3ff' },    // Violet 500
};

export const VoxelTile: React.FC<{ tile: TileData }> = ({ tile }) => {
    const offset = BOARD_SIZE / 2;
    // Calculate target 3D position based on logic grid
    const targetX = tile.col * (TILE_SIZE + GAP) + (TILE_SIZE / 2) + GAP - offset;
    const targetZ = tile.row * (TILE_SIZE + GAP) + (TILE_SIZE / 2) + GAP - offset;
    const targetY = 0.25;

    // React Spring configuration for smooth movement and spawning pop
    const springs = useSpring({
        position: [targetX, targetY, targetZ] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        from: {
            position: [targetX, targetY - 1, targetZ] as [number, number, number], // Spawn from below
            scale: tile.isNew || tile.mergedFrom ? [0, 0, 0] : [1, 1, 1]
        },
        config: { tension: 200, friction: 20 }
    });

    const colors = COLOR_MAP[tile.value] || { bg: '#1e293b', text: '#ffffff' };

    return (
        <animated.group position={springs.position as any} scale={springs.scale as any}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[TILE_SIZE, 0.5, TILE_SIZE]} />
                <meshStandardMaterial color={colors.bg} roughness={0.3} metalness={0.1} />
            </mesh>
            
            <Text
                position={[0, 0.26, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={tile.value > 512 ? 0.35 : 0.45}
                color={colors.text}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {tile.value}
            </Text>
        </animated.group>
    );
};
