import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { MemoryGame } from './MemoryGame';
import { MemoryUI } from './MemoryUI';
import { useMemoryStore } from './useMemoryStore';

interface MemoryProps {
    onBack: () => void;
}

function MemoryScene() {
    return (
        <>
            {/* Winter night background */}
            <color attach="background" args={['#0a1628']} />

            {/* Lighting - warm winter mood */}
            <ambientLight intensity={0.5} color="#b4d7ff" />
            <directionalLight position={[5, 10, 5]} intensity={0.6} color="#fff5e6" />
            <directionalLight position={[-5, 5, 5]} intensity={0.3} color="#a8d8ff" />
            <pointLight position={[0, 0, 5]} intensity={0.4} color="#ffebcd" />

            {/* Game */}
            <MemoryGame />

            {/* Controls */}
            <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.05}
                minDistance={4}
                maxDistance={12}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2.2}
                enablePan={false}
            />
        </>
    );
}

export const Memory = ({ onBack }: MemoryProps) => {
    const initGame = useMemoryStore((s) => s.initGame);

    useEffect(() => {
        initGame();
    }, [initGame]);

    return (
        <div className="w-full h-full relative">
            <MemoryUI onBack={onBack} />
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                <MemoryScene />
            </Canvas>
        </div>
    );
};
