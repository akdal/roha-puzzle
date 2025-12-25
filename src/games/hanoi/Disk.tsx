import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

// Disk colors - vibrant rainbow (winter-adjusted)
const DISK_COLORS = [
    '#FF6B6B', // Coral Red
    '#FFA94D', // Bright Orange
    '#FFE066', // Sunny Yellow
    '#69DB7C', // Fresh Green
    '#4DABF7', // Sky Blue
    '#9775FA', // Lavender
    '#F06595', // Pink
];

interface DiskProps {
    size: number; // 1 = smallest, up to diskCount = largest
    diskCount: number;
    position: Vector3;
    isSelected: boolean;
    isAnimating: boolean;
    isHintDisk?: boolean;
    targetPosition?: Vector3;
    onAnimationComplete?: () => void;
}

export const Disk = ({
    size,
    diskCount,
    position,
    isSelected,
    isAnimating,
    isHintDisk,
    targetPosition,
    onAnimationComplete,
}: DiskProps) => {
    const meshRef = useRef<Mesh>(null);
    const glowRef = useRef<Mesh>(null);
    const currentPos = useRef(position.clone());
    const animationPhase = useRef<'up' | 'horizontal' | 'down'>('up');
    const liftHeight = 4;
    const { clock } = useThree();

    // Calculate disk dimensions based on size
    const minRadius = 0.4;
    const maxRadius = 1.2;
    const radiusStep = (maxRadius - minRadius) / Math.max(diskCount - 1, 1);
    const radius = minRadius + (size - 1) * radiusStep;
    const height = 0.3;

    const color = DISK_COLORS[(size - 1) % DISK_COLORS.length];

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        const time = clock.elapsedTime;

        // Bounce animation for selected or hint disk
        let bounceOffset = 0;
        if (!isAnimating) {
            if (isSelected) {
                // Gentle floating bounce for selected disk
                bounceOffset = Math.sin(time * 4) * 0.08 + 0.15;
            } else if (isHintDisk) {
                // More energetic bounce for hint disk
                bounceOffset = Math.sin(time * 5) * 0.12 + 0.2;
            }
        }

        // Update glow ring scale
        if (glowRef.current) {
            const pulseScale = 1 + Math.sin(time * 4) * 0.1;
            glowRef.current.scale.set(pulseScale, pulseScale, 1);
        }

        if (isAnimating && targetPosition) {
            const speed = 8;
            const current = currentPos.current;

            if (animationPhase.current === 'up') {
                current.y += speed * delta;
                if (current.y >= liftHeight) {
                    current.y = liftHeight;
                    animationPhase.current = 'horizontal';
                }
            } else if (animationPhase.current === 'horizontal') {
                const dx = targetPosition.x - current.x;
                const dz = targetPosition.z - current.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist > 0.05) {
                    current.x += (dx / dist) * speed * delta;
                    current.z += (dz / dist) * speed * delta;
                } else {
                    current.x = targetPosition.x;
                    current.z = targetPosition.z;
                    animationPhase.current = 'down';
                }
            } else if (animationPhase.current === 'down') {
                current.y -= speed * delta;
                if (current.y <= targetPosition.y) {
                    current.y = targetPosition.y;
                    animationPhase.current = 'up';
                    onAnimationComplete?.();
                }
            }

            meshRef.current.position.copy(current);
        } else {
            // Not animating - apply bounce offset
            currentPos.current.copy(position);
            meshRef.current.position.set(
                position.x,
                position.y + bounceOffset,
                position.z
            );
            animationPhase.current = 'up';
        }
    });

    // Dynamic pulsing emissive intensity
    const time = clock.elapsedTime;
    const getEmissiveIntensity = () => {
        if (isHintDisk) {
            // Strong pulse for hint disk
            return 0.5 + Math.sin(time * 5) * 0.3;
        }
        if (isSelected) {
            // Gentle pulse for selected disk
            return 0.4 + Math.sin(time * 3) * 0.2;
        }
        return 0;
    };

    const emissiveColor = isHintDisk ? '#22d3ee' : isSelected ? '#ffffff' : '#000000';
    const showGlow = isSelected || isHintDisk;

    return (
        <group>
            {/* Main disk */}
            <mesh ref={meshRef} position={position} castShadow receiveShadow>
                <cylinderGeometry args={[radius, radius, height, 32]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.2}
                    roughness={0.3}
                    emissive={emissiveColor}
                    emissiveIntensity={getEmissiveIntensity()}
                />
            </mesh>

            {/* Glow ring under selected/hint disk */}
            {showGlow && !isAnimating && (
                <mesh
                    ref={glowRef}
                    position={[position.x, 0.08, position.z]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[radius * 0.8, radius * 1.3, 32]} />
                    <meshBasicMaterial
                        color={isHintDisk ? '#22d3ee' : '#fbbf24'}
                        transparent
                        opacity={0.4 + Math.sin(time * 4) * 0.2}
                    />
                </mesh>
            )}
        </group>
    );
};
