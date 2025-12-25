import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { HanoiGame } from './HanoiGame';
import { HanoiUI } from './HanoiUI';
import { useHanoiStore } from './useHanoiStore';

const DEFAULT_CAMERA_POSITION = new Vector3(0, 6, 10);

interface HanoiProps {
    onBack: () => void;
}

function HanoiScene() {
    const viewResetRequested = useHanoiStore((s) => s.viewResetRequested);
    const clearViewReset = useHanoiStore((s) => s.clearViewReset);
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera } = useThree();

    useEffect(() => {
        // Set initial camera position
        camera.position.copy(DEFAULT_CAMERA_POSITION);
        camera.lookAt(0, 1, 0);
    }, [camera]);

    useEffect(() => {
        if (viewResetRequested && controlsRef.current) {
            camera.position.copy(DEFAULT_CAMERA_POSITION);
            controlsRef.current.target.set(0, 1, 0);
            controlsRef.current.update();
            clearViewReset();
        }
    }, [viewResetRequested, camera, clearViewReset]);

    return (
        <>
            {/* Background - matching homepage */}
            <color attach="background" args={['#0a1628']} />

            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <directionalLight position={[-5, 5, -5]} intensity={0.4} />
            <directionalLight position={[0, -3, 5]} intensity={0.2} />

            {/* Game */}
            <HanoiGame />

            {/* Controls */}
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.05}
                minDistance={5}
                maxDistance={20}
                maxPolarAngle={Math.PI / 2.1}
            />
        </>
    );
}

export const Hanoi = ({ onBack }: HanoiProps) => {
    const initGame = useHanoiStore((s) => s.initGame);

    // Initialize game on mount
    useEffect(() => {
        initGame();
    }, [initGame]);

    return (
        <div className="w-full h-full relative game-screen">
            <HanoiUI onBack={onBack} />
            <Canvas camera={{ position: [0, 6, 10], fov: 50 }}>
                <HanoiScene />
            </Canvas>
        </div>
    );
};
