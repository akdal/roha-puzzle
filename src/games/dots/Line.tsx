import { RoundedBox } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { getPlayerColor, type Player } from './constants';

interface LineProps {
    position: [number, number, number];
    isHorizontal: boolean;
    owner: Player | null;
    onClick: () => void;
    disabled: boolean;
}

export const Line = ({ position, isHorizontal, owner, onClick, disabled }: LineProps) => {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (meshRef.current && !owner) {
            // Hover effect
            const targetScale = hovered ? 1.1 : 1;
            meshRef.current.scale.y = meshRef.current.scale.y + (targetScale - meshRef.current.scale.y) * 0.2;
        }
    });

    const length = 0.8;
    const thickness = 0.08;
    const height = 0.1;

    const handleClick = () => {
        if (!owner && !disabled) {
            onClick();
        }
    };

    const handlePointerEnter = () => {
        if (!disabled && !owner) {
            setHovered(true);
            document.body.style.cursor = 'pointer';
        }
    };

    const handlePointerLeave = () => {
        setHovered(false);
        document.body.style.cursor = 'default';
    };

    const color = owner
        ? getPlayerColor(owner)
        : hovered && !disabled
            ? '#64748b'
            : '#334155';

    return (
        <RoundedBox
            ref={meshRef}
            args={isHorizontal ? [length, height, thickness] : [thickness, height, length]}
            position={position}
            radius={0.02}
            smoothness={4}
            onClick={handleClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
        >
            <meshStandardMaterial
                color={color}
                metalness={owner ? 0.4 : 0.1}
                roughness={owner ? 0.3 : 0.6}
                emissive={owner ? color : '#000000'}
                emissiveIntensity={owner ? 0.3 : 0}
                transparent={!owner}
                opacity={owner ? 1 : hovered ? 0.8 : 0.4}
            />
        </RoundedBox>
    );
};
