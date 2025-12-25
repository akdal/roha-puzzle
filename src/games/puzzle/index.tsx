import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PuzzleGame } from './PuzzleGame';
import { PuzzleUI } from './PuzzleUI';
import { usePuzzleStore } from './usePuzzleStore';

interface PuzzleProps {
    onBack: () => void;
}

function PuzzleScene() {
    return (
        <>
            {/* Background */}
            <color attach="background" args={['#1e1e3f']} />

            {/* Lighting */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <directionalLight position={[-5, 5, 5]} intensity={0.4} />
            <pointLight position={[0, 0, 5]} intensity={0.3} color="#fff" />

            {/* Game */}
            <PuzzleGame />

            {/* Controls - limited for 2D puzzle */}
            <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.05}
                minDistance={4}
                maxDistance={10}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 2.5}
                enablePan={false}
            />
        </>
    );
}

export const Puzzle = ({ onBack }: PuzzleProps) => {
    const initGame = usePuzzleStore((s) => s.initGame);

    useEffect(() => {
        initGame();
    }, [initGame]);

    return (
        <div className="w-full h-full relative game-screen">
            <PuzzleUI onBack={onBack} />
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <PuzzleScene />
            </Canvas>
        </div>
    );
};
