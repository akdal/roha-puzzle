import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';

// Bright gradient colors for tiles
const TILE_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Sky Blue
    '#96CEB4', // Sage
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
    '#BB8FCE', // Lavender
    '#85C1E9', // Light Blue
    '#F8B500', // Amber
    '#00CED1', // Dark Cyan
    '#FF7F50', // Coral
    '#9370DB', // Medium Purple
    '#3CB371', // Medium Sea Green
];

interface TileProps {
    number: number;
    gridSize: number;
    targetPosition: THREE.Vector3;
    onClick: (e: ThreeEvent<MouseEvent>) => void;
    isHint?: boolean;
}

export const Tile = ({ number, gridSize, targetPosition, onClick }: TileProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const currentPos = useRef(targetPosition.clone());

    const tileSize = 2.8 / gridSize;
    const color = TILE_COLORS[(number - 1) % TILE_COLORS.length];

    // Animate position
    useFrame((_, delta) => {
        if (!meshRef.current) return;

        const speed = 12;
        const current = currentPos.current;
        const target = targetPosition;

        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.01) {
            const step = Math.min(speed * delta, dist);
            current.x += (dx / dist) * step;
            current.y += (dy / dist) * step;
        } else {
            current.copy(target);
        }

        meshRef.current.position.copy(current);
    });

    const fontSize = gridSize === 3 ? 0.4 : 0.3;

    return (
        <group>
            <mesh
                ref={meshRef}
                position={targetPosition}
                onClick={onClick}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[tileSize * 0.9, tileSize * 0.9, 0.3]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.1}
                    roughness={0.3}
                />
            </mesh>
            <Text
                position={[targetPosition.x, targetPosition.y, 0.2]}
                fontSize={fontSize}
                color="#FFFFFF"
                fontWeight="bold"
                anchorX="center"
                anchorY="middle"
            >
                {number}
            </Text>
        </group>
    );
};

// Separate component for updating text position
export const TileWithText = ({ number, gridSize, targetPosition, onClick, isHint }: TileProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const textRef = useRef<THREE.Object3D | null>(null);
    const currentPos = useRef(targetPosition.clone());

    const tileSize = 2.8 / gridSize;
    const color = TILE_COLORS[(number - 1) % TILE_COLORS.length];
    const fontSize = gridSize === 3 ? 0.4 : 0.3;

    // Animate position
    useFrame((_, delta) => {
        if (!meshRef.current) return;

        const speed = 12;
        const current = currentPos.current;
        const target = targetPosition;

        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.01) {
            const step = Math.min(speed * delta, dist);
            current.x += (dx / dist) * step;
            current.y += (dy / dist) * step;
        } else {
            current.copy(target);
        }

        meshRef.current.position.set(current.x, current.y, 0);
        if (textRef.current) {
            textRef.current.position.set(current.x, current.y, 0.2);
        }
    });

    return (
        <group>
            <mesh
                ref={meshRef}
                position={[targetPosition.x, targetPosition.y, 0]}
                onClick={onClick}
                castShadow
            >
                <boxGeometry args={[tileSize * 0.9, tileSize * 0.9, 0.3]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.1}
                    roughness={0.3}
                    emissive={isHint ? '#FFD700' : '#000000'}
                    emissiveIntensity={isHint ? 0.5 : 0}
                />
            </mesh>
            <Text
                ref={textRef}
                position={[targetPosition.x, targetPosition.y, 0.2]}
                fontSize={fontSize}
                color="#FFFFFF"
                fontWeight="bold"
                anchorX="center"
                anchorY="middle"
            >
                {number}
            </Text>
            {/* Hint glow effect */}
            {isHint && (
                <pointLight
                    position={[targetPosition.x, targetPosition.y, 0.5]}
                    color="#FFD700"
                    intensity={2}
                    distance={1.5}
                />
            )}
        </group>
    );
};
