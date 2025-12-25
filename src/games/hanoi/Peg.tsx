import { useRef } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';

interface PegProps {
    position: [number, number, number];
    height: number;
    isSelected: boolean;
    isTarget?: boolean; // Rightmost peg - always white
    isHintSource?: boolean;
    isHintTarget?: boolean;
    onClick: (e: ThreeEvent<MouseEvent>) => void;
}

export const Peg = ({ position, height, isSelected, isTarget, isHintSource, isHintTarget, onClick }: PegProps) => {
    const pegRadius = 0.08;
    const baseRadius = 1.4;
    const baseHeight = 0.15;
    const baseRef = useRef<Mesh>(null);
    const poleRef = useRef<Mesh>(null);
    const ringRef = useRef<Mesh>(null);
    const { clock } = useThree();

    // Determine base color based on state
    const getBaseColor = () => {
        if (isHintSource) return '#FFD700'; // Gold for source
        if (isHintTarget) return '#4ADE80'; // Green for target
        if (isTarget) return '#F5F5F5'; // White/off-white for target peg
        if (isSelected) return '#8B5A2B'; // Slightly lighter brown when selected
        return '#8B4513';
    };

    const getPoleColor = () => {
        if (isHintSource) return '#FFA500'; // Orange for source
        if (isHintTarget) return '#22C55E'; // Green for target
        if (isTarget) return '#FFFFFF'; // White pole for target
        if (isSelected) return '#A0522D';
        return '#A0522D';
    };

    // Animate emissive intensity for hints
    useFrame(() => {
        const time = clock.elapsedTime;

        if (baseRef.current && poleRef.current) {
            const baseMat = baseRef.current.material as MeshStandardMaterial;
            const poleMat = poleRef.current.material as MeshStandardMaterial;

            if (isHintSource) {
                // Pulsing gold glow for source
                const pulse = 0.4 + Math.sin(time * 4) * 0.3;
                baseMat.emissiveIntensity = pulse;
                poleMat.emissiveIntensity = pulse * 0.8;
            } else if (isHintTarget) {
                // Pulsing green glow for target
                const pulse = 0.4 + Math.sin(time * 4 + Math.PI) * 0.3;
                baseMat.emissiveIntensity = pulse;
                poleMat.emissiveIntensity = pulse * 0.8;
            } else if (isSelected) {
                // Subtle pulse for selected peg
                const pulse = 0.2 + Math.sin(time * 3) * 0.15;
                baseMat.emissiveIntensity = pulse;
                poleMat.emissiveIntensity = pulse * 0.5;
            } else {
                baseMat.emissiveIntensity = 0;
                poleMat.emissiveIntensity = 0;
            }
        }

        // Animate selection ring
        if (ringRef.current) {
            const scale = 1 + Math.sin(time * 4) * 0.1;
            ringRef.current.scale.set(scale, scale, 1);
        }
    });

    const showRing = isSelected || isHintSource || isHintTarget;
    const getRingColor = () => {
        if (isHintSource) return '#fbbf24'; // Amber/gold
        if (isHintTarget) return '#22d3ee'; // Cyan
        if (isSelected) return '#fbbf24'; // Amber for selected
        return '#ffffff';
    };

    const time = clock.elapsedTime;
    const ringOpacity = 0.5 + Math.sin(time * 4) * 0.3;

    return (
        <group position={position}>
            {/* Selection/Hint ring */}
            {showRing && (
                <mesh
                    ref={ringRef}
                    position={[0, 0.02, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[baseRadius * 0.9, baseRadius * 1.15, 32]} />
                    <meshBasicMaterial
                        color={getRingColor()}
                        transparent
                        opacity={ringOpacity}
                    />
                </mesh>
            )}

            {/* Base */}
            <mesh ref={baseRef} position={[0, baseHeight / 2, 0]} onClick={onClick} receiveShadow>
                <cylinderGeometry args={[baseRadius, baseRadius, baseHeight, 32]} />
                <meshStandardMaterial
                    color={getBaseColor()}
                    metalness={0.1}
                    roughness={0.7}
                    emissive={isHintSource ? '#FFD700' : isHintTarget ? '#4ADE80' : isSelected ? '#fbbf24' : '#000000'}
                    emissiveIntensity={0}
                />
            </mesh>

            {/* Pole */}
            <mesh ref={poleRef} position={[0, baseHeight + height / 2, 0]} onClick={onClick} receiveShadow>
                <cylinderGeometry args={[pegRadius, pegRadius, height, 16]} />
                <meshStandardMaterial
                    color={getPoleColor()}
                    metalness={0.1}
                    roughness={0.6}
                    emissive={isHintSource ? '#FFA500' : isHintTarget ? '#22C55E' : isSelected ? '#fbbf24' : '#000000'}
                    emissiveIntensity={0}
                />
            </mesh>
        </group>
    );
};
