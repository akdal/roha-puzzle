import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';

// Disk colors - vibrant rainbow
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
    targetPosition?: Vector3;
    onAnimationComplete?: () => void;
}

export const Disk = ({
    size,
    diskCount,
    position,
    isSelected,
    isAnimating,
    targetPosition,
    onAnimationComplete,
}: DiskProps) => {
    const meshRef = useRef<Mesh>(null);
    const currentPos = useRef(position.clone());
    const animationPhase = useRef<'up' | 'horizontal' | 'down'>('up');
    const liftHeight = 4;

    // Calculate disk dimensions based on size
    const minRadius = 0.4;
    const maxRadius = 1.2;
    const radiusStep = (maxRadius - minRadius) / Math.max(diskCount - 1, 1);
    const radius = minRadius + (size - 1) * radiusStep;
    const height = 0.3;

    const color = DISK_COLORS[(size - 1) % DISK_COLORS.length];

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        if (isAnimating && targetPosition) {
            const speed = 8;
            const current = currentPos.current;

            if (animationPhase.current === 'up') {
                // Move up
                current.y += speed * delta;
                if (current.y >= liftHeight) {
                    current.y = liftHeight;
                    animationPhase.current = 'horizontal';
                }
            } else if (animationPhase.current === 'horizontal') {
                // Move horizontally
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
                // Move down
                current.y -= speed * delta;
                if (current.y <= targetPosition.y) {
                    current.y = targetPosition.y;
                    animationPhase.current = 'up'; // Reset for next animation
                    onAnimationComplete?.();
                }
            }

            meshRef.current.position.copy(current);
        } else {
            // Not animating - snap to position
            currentPos.current.copy(position);
            meshRef.current.position.copy(position);
            animationPhase.current = 'up';
        }
    });

    return (
        <mesh ref={meshRef} position={position} castShadow receiveShadow>
            <cylinderGeometry args={[radius, radius, height, 32]} />
            <meshStandardMaterial
                color={color}
                metalness={0.1}
                roughness={0.4}
                emissive={isSelected ? color : '#000000'}
                emissiveIntensity={isSelected ? 0.3 : 0}
            />
        </mesh>
    );
};
