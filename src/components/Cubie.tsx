import React, { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { Quaternion } from 'three';
import type { ThreeEvent } from '@react-three/fiber';

interface CubieProps {
    position: [number, number, number];
    rotation: [number, number, number, number];
    originalPosition: [number, number, number];
    onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}

const COLORS = {
    U: '#FFFFFF',
    D: '#FFD500',
    R: '#B90000',
    L: '#FF5800',
    F: '#009E60',
    B: '#0051BA',
    CORE: '#2a2a2a'
};

export const Cubie: React.FC<CubieProps> = ({
    position,
    rotation,
    originalPosition,
    onPointerDown,
    onPointerMove,
    onPointerUp
}) => {
    const [ox, oy, oz] = originalPosition;

    const colorRight = ox === 1 ? COLORS.R : COLORS.CORE;
    const colorLeft = ox === -1 ? COLORS.L : COLORS.CORE;
    const colorUp = oy === 1 ? COLORS.U : COLORS.CORE;
    const colorDown = oy === -1 ? COLORS.D : COLORS.CORE;
    const colorFront = oz === 1 ? COLORS.F : COLORS.CORE;
    const colorBack = oz === -1 ? COLORS.B : COLORS.CORE;

    const quaternion = useMemo(() => new Quaternion(...rotation), [rotation]);

    return (
        <group position={position} quaternion={quaternion}>
            <RoundedBox
                args={[0.95, 0.95, 0.95]}
                radius={0.1}
                smoothness={4}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <meshStandardMaterial attach="material-0" color={colorRight} />
                <meshStandardMaterial attach="material-1" color={colorLeft} />
                <meshStandardMaterial attach="material-2" color={colorUp} />
                <meshStandardMaterial attach="material-3" color={colorDown} />
                <meshStandardMaterial attach="material-4" color={colorFront} />
                <meshStandardMaterial attach="material-5" color={colorBack} />
            </RoundedBox>
        </group>
    );
};
