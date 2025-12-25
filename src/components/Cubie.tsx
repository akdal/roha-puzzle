import { useMemo } from 'react';
import { BoxGeometry, Quaternion, MeshPhysicalMaterial } from 'three';
import type { ThreeEvent } from '@react-three/fiber';

interface CubieProps {
    position: [number, number, number];
    rotation: [number, number, number, number];
    originalPosition: [number, number, number];
    onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}

// Vibrant, bright colors
const COLORS = {
    U: '#FFFFFF',  // White - top
    D: '#FFEB3B',  // Bright Yellow - bottom
    R: '#F44336',  // Bright Red - right
    L: '#FF9800',  // Bright Orange - left
    F: '#4CAF50',  // Bright Green - front
    B: '#2196F3',  // Bright Blue - back
    CORE: '#212121' // Dark gray core
};

// Shared geometry for all cubies
const boxGeometry = new BoxGeometry(0.93, 0.93, 0.93);

// Material settings for glossy plastic look
const createMaterial = (color: string, isCore: boolean) => {
    return new MeshPhysicalMaterial({
        color,
        metalness: 0.0,
        roughness: isCore ? 0.6 : 0.15,
        clearcoat: isCore ? 0 : 0.8,
        clearcoatRoughness: 0.2,
        reflectivity: 0.5,
    });
};

export const Cubie = ({
    position,
    rotation,
    originalPosition,
    onPointerDown,
    onPointerMove,
    onPointerUp
}: CubieProps) => {
    const [ox, oy, oz] = originalPosition;

    const quaternion = useMemo(() => new Quaternion(...rotation), [rotation]);

    // Create materials array for 6 faces
    // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
    const materials = useMemo(() => [
        createMaterial(ox === 1 ? COLORS.R : COLORS.CORE, ox !== 1),   // Right (+X)
        createMaterial(ox === -1 ? COLORS.L : COLORS.CORE, ox !== -1), // Left (-X)
        createMaterial(oy === 1 ? COLORS.U : COLORS.CORE, oy !== 1),   // Up (+Y)
        createMaterial(oy === -1 ? COLORS.D : COLORS.CORE, oy !== -1), // Down (-Y)
        createMaterial(oz === 1 ? COLORS.F : COLORS.CORE, oz !== 1),   // Front (+Z)
        createMaterial(oz === -1 ? COLORS.B : COLORS.CORE, oz !== -1), // Back (-Z)
    ], [ox, oy, oz]);

    return (
        <group position={position} quaternion={quaternion}>
            <mesh
                geometry={boxGeometry}
                material={materials}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            />
        </group>
    );
};
