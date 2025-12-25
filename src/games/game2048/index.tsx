import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Game2048 as Game2048Board } from './Game2048';
import { Game2048UI } from './Game2048UI';
import { use2048Store } from './use2048Store';

interface Game2048Props {
    onBack: () => void;
}

function Game2048Scene() {
    return (
        <>
            {/* Lighting - winter mood */}
            <ambientLight intensity={0.5} color="#b4d7ff" />
            <directionalLight position={[5, 10, 5]} intensity={0.6} color="#fff5e6" />
            <directionalLight position={[-5, 5, 5]} intensity={0.3} color="#a8d8ff" />
            <pointLight position={[0, 5, 0]} intensity={0.4} color="#ffebcd" />

            {/* Game */}
            <Game2048Board />
        </>
    );
}

export const Game2048 = ({ onBack }: Game2048Props) => {
    const initGame = use2048Store((s) => s.initGame);
    const gameStatus = use2048Store((s) => s.gameStatus);

    useEffect(() => {
        if (gameStatus === 'IDLE') {
            initGame();
        }
    }, [initGame, gameStatus]);

    return (
        <div className="w-full h-full relative game-screen bg-gradient-to-b from-[#0a1628] via-[#0f2937] to-[#1a3a4a]">
            <Game2048UI onBack={onBack} />
            <Canvas
                camera={{ position: [0, 6, 4], fov: 50 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
            >
                <Game2048Scene />
            </Canvas>
        </div>
    );
};
