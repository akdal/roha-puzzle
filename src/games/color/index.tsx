import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ColorGame } from './ColorGame';
import { ColorUI } from './ColorUI';
import { useColorStore } from './useColorStore';

const DEFAULT_CAMERA_POSITION = new Vector3(0, 2, 7);
const PORTRAIT_CAMERA_POSITION = new Vector3(0, 2.5, 9);

interface ColorProps {
    onBack: () => void;
}

function ColorScene() {
    const viewResetRequested = useColorStore((s) => s.viewResetRequested);
    const clearViewReset = useColorStore((s) => s.clearViewReset);
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera, viewport } = useThree();

    const isPortrait = viewport.width / viewport.height < 1;
    const cameraPosition = isPortrait ? PORTRAIT_CAMERA_POSITION : DEFAULT_CAMERA_POSITION;

    useEffect(() => {
        // Set initial camera position based on aspect ratio
        camera.position.copy(cameraPosition);
        camera.lookAt(0, 0, 0);
    }, [camera, cameraPosition]);

    useEffect(() => {
        if (viewResetRequested && controlsRef.current) {
            camera.position.copy(cameraPosition);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
            clearViewReset();
        }
    }, [viewResetRequested, camera, clearViewReset, cameraPosition]);

    return (
        <>
            {/* Lighting - soft and balanced */}
            <ambientLight intensity={0.3} color="#fff5f5" />
            <directionalLight position={[5, 10, 5]} intensity={0.4} color="#ffffff" />
            <directionalLight position={[-5, 5, 5]} intensity={0.2} color="#ffd5e5" />
            <pointLight position={[0, 3, 3]} intensity={0.3} color="#ffffff" />

            {/* Game */}
            <ColorGame />

            {/* Controls */}
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.05}
                minDistance={4}
                maxDistance={12}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
                enablePan={false}
            />
        </>
    );
}

export const ColorMix = ({ onBack }: ColorProps) => {
    const initGame = useColorStore((s) => s.initGame);

    useEffect(() => {
        initGame();
    }, [initGame]);

    return (
        <div className="w-full h-full relative game-screen bg-gradient-to-b from-[#0a1628] via-[#0f2937] to-[#1a3a4a]">
            <ColorUI onBack={onBack} />
            <Canvas
                camera={{ position: [0, 2, 7], fov: 50 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ColorScene />
            </Canvas>
        </div>
    );
};
