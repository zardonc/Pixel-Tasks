import React, { useEffect, useRef } from 'react';
import { Scene } from './Scene';
import { GameOverlay } from './GameOverlay';
import { use2048Engine } from './use2048Engine';
import { useDrag } from '@use-gesture/react';
import { useStore } from '../../../store';

export const Voxel2048: React.FC<{ onQuit: () => void }> = ({ onQuit }) => {
    const { gameState, initGame, slide, soundEnabled, setSoundEnabled } = use2048Engine();
    const { submitGameScore } = useStore();
    const scoreSubmittedRef = useRef(false);
    const [is3D, setIs3D] = React.useState(true);

    useEffect(() => {
        initGame();
    }, [initGame]);

    useEffect(() => {
        if (gameState.status === 'GAME_OVER' && !scoreSubmittedRef.current) {
            submitGameScore('2048', gameState.score);
            scoreSubmittedRef.current = true;
        } else if (gameState.status === 'PLAYING') {
            scoreSubmittedRef.current = false;
        }
    }, [gameState.status, gameState.score, submitGameScore]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowUp': 
                case 'w':
                case 'W':
                    slide('UP'); break;
                case 'ArrowDown': 
                case 's':
                case 'S':
                    slide('DOWN'); break;
                case 'ArrowLeft': 
                case 'a':
                case 'A':
                    slide('LEFT'); break;
                case 'ArrowRight': 
                case 'd':
                case 'D':
                    slide('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slide]);

    // Touch / Swipe handling
    const bind = useDrag(({ swipe: [swipeX, swipeY] }) => {
        if (swipeX === 1) slide('RIGHT');
        else if (swipeX === -1) slide('LEFT');
        else if (swipeY === 1) slide('DOWN');
        else if (swipeY === -1) slide('UP');
    }, { filterTaps: true });

    const [bestScore, setBestScore] = React.useState(0);

    // Fetch user's persistent high score on load
    useEffect(() => {
        const fetchHighScore = async () => {
            try {
                // api.ts is already in store.ts, import it here if needed. 
                // We'll import api from client instead. Wait, 'api' isn't imported.
                // It's better to fetch via store or just use fetch natively if api is missing.
                const { api } = await import('../../../api/client');
                const { data } = await api.get<{ highScore: number }>('/games/score/2048');
                if (data && data.highScore > 0) {
                    setBestScore(data.highScore);
                }
            } catch (e) {
                console.error("Failed to load high score", e);
            }
        };
        fetchHighScore();
    }, []);

    // Sync best score during gameplay
    useEffect(() => {
        if (gameState.score > bestScore) setBestScore(gameState.score);
    }, [gameState.score, bestScore]);

    return (
        <div {...bind()} className="w-full h-[calc(100vh-4rem)] relative bg-[#0f172a] overflow-hidden rounded-xl border border-white/5 touch-none">
            {/* DOM UI Layer */}
            <GameOverlay 
                score={gameState.score} 
                bestScore={bestScore} 
                status={gameState.status}
                soundEnabled={soundEnabled}
                is3D={is3D}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                onToggle3D={() => setIs3D(!is3D)}
                onRestart={initGame}
                onQuit={onQuit}
            />
            
            {/* 3D Canvas Layer */}
            <div className="absolute inset-0">
                <Scene grid={gameState.grid} is3D={is3D} />
            </div>
        </div>
    );
};
