import { RoundedBox } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { getPlayerColor, type Player } from './constants';

interface BoxProps {
    position: [number, number, number];
    owner: Player;
    isNew?: boolean;
}

export const Box = ({ position, owner, isNew }: BoxProps) => {
    const groupRef = useRef<Group>(null);
    const scaleRef = useRef(isNew ? 0 : 1);

    useFrame((_, delta) => {
        if (groupRef.current) {
            // Scale animation for new boxes
            if (isNew && scaleRef.current < 1) {
                scaleRef.current = Math.min(1, scaleRef.current + delta * 6);
                groupRef.current.scale.setScalar(scaleRef.current);
            }
        }
    });

    const color = getPlayerColor(owner);
    const size = 0.75;

    return (
        <group ref={groupRef} position={position} scale={isNew ? 0 : 1}>
            {/* XY plane: width, height, thin depth */}
            <RoundedBox
                args={[size, size, 0.05]}
                radius={0.02}
                smoothness={4}
            >
                <meshStandardMaterial
                    color={color}
                    metalness={0.2}
                    roughness={0.5}
                    emissive={color}
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.8}
                />
            </RoundedBox>
            {/* Glow effect - XY plane: light in front (Z) */}
            <pointLight
                position={[0, 0, 0.3]}
                color={color}
                intensity={0.3}
                distance={1.5}
            />
        </group>
    );
};
