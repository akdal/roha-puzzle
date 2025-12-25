import { useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { useColorStore, rgbToHex } from './useColorStore';
import { RoundedBox, Text } from '@react-three/drei';

interface PaintTubeProps {
    color: string;
    position: [number, number, number];
    label: string;
    scale?: number;
}

const PaintTube = ({ color, position, label, scale = 1 }: PaintTubeProps) => {
    const groupRef = useRef<Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;
        groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Tube body */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.5, 1.4, 32]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.3}
                    roughness={0.4}
                    emissive={color}
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Tube cap */}
            <mesh position={[0, 0.85, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.3, 32]} />
                <meshStandardMaterial
                    color="#e8e8e8"
                    metalness={0.6}
                    roughness={0.3}
                />
            </mesh>

            {/* Shine effect */}
            <mesh position={[0.2, 0.2, 0.35]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>

            {/* Label */}
            <Text
                position={[0, -1.1, 0]}
                fontSize={0.25}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>
        </group>
    );
};

interface ColorBallProps {
    color: string;
    position: [number, number, number];
    isSelected: boolean;
    isHint: boolean;
    onClick: () => void;
    onMix: () => void;
    index: number;
}

const ColorBall = ({ color, position, isSelected, isHint, onClick, onMix, index }: ColorBallProps) => {
    const meshRef = useRef<Mesh>(null);
    const glowRef = useRef<Mesh>(null);
    const lastClickTime = useRef<number>(0);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;

        // Floating animation
        meshRef.current.position.y = position[1] + Math.sin(time * 2 + index * 0.5) * 0.08;

        // Selection/hint pulse
        if ((isSelected || isHint) && glowRef.current) {
            const pulse = 1 + Math.sin(time * (isHint ? 6 : 4)) * 0.2;
            glowRef.current.scale.setScalar(pulse);
        }
    });

    const handleClick = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime.current;

        // Double click detection (within 300ms)
        if (timeSinceLastClick < 300) {
            onMix();
            lastClickTime.current = 0;
            return;
        }

        // If already selected, mix immediately
        if (isSelected) {
            onMix();
            return;
        }

        // First click - just select
        onClick();
        lastClickTime.current = now;
    }, [isSelected, onClick, onMix]);

    return (
        <group position={position}>
            {/* Glow ring for selected/hint */}
            {(isSelected || isHint) && (
                <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5, 0.7, 32]} />
                    <meshBasicMaterial
                        color={isHint ? "#fbbf24" : "#ffffff"}
                        transparent
                        opacity={isHint ? 0.8 : 0.6}
                    />
                </mesh>
            )}

            {/* Shadow on ground */}
            <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.35, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.2} />
            </mesh>

            {/* Main ball */}
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default';
                }}
            >
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.2}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={isHint ? 0.4 : 0.15}
                />
            </mesh>

            {/* Highlight */}
            <mesh position={[0.15, 0.15, 0.25]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
            </mesh>

            {/* Hint badge */}
            {isHint && (
                <group position={[0.35, 0.35, 0]}>
                    <mesh>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshBasicMaterial color="#fbbf24" />
                    </mesh>
                    <Text
                        position={[0, 0, 0.15]}
                        fontSize={0.15}
                        color="#000000"
                        anchorX="center"
                        anchorY="middle"
                    >
                        !
                    </Text>
                </group>
            )}
        </group>
    );
};

interface PaletteProps {
    position: [number, number, number];
}

const Palette = ({ position }: PaletteProps) => {
    return (
        <group position={position}>
            {/* Main palette board */}
            <RoundedBox args={[6, 0.15, 2.5]} radius={0.3} smoothness={4}>
                <meshStandardMaterial color="#a06830" metalness={0.1} roughness={0.8} />
            </RoundedBox>

            {/* Thumb hole */}
            <mesh position={[-2.2, 0.1, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.25, 0.45, 32]} />
                <meshStandardMaterial color="#704520" />
            </mesh>
        </group>
    );
};

export const ColorGame = () => {
    const {
        targetColor,
        currentColor,
        availableColors,
        selectedColor,
        selectColor,
        mixColor,
        hintColorIndex,
    } = useColorStore();

    const { viewport } = useThree();
    const aspectRatio = viewport.width / viewport.height;

    // Responsive layout based on aspect ratio
    const isPortrait = aspectRatio < 1;
    const isNarrow = aspectRatio < 0.7;

    // Adjust scale for different screen sizes
    const gameScale = isNarrow ? 0.7 : isPortrait ? 0.85 : 1;

    // Tube positions - stack vertically on portrait, horizontal on landscape
    const tubeSpacing = isPortrait ? 1.5 : 2;
    const tubeY = isPortrait ? 1.8 : 1.2;

    const targetHex = rgbToHex(targetColor);
    const currentHex = rgbToHex(currentColor);

    // Layout - adjust ball spacing for narrow screens
    const ballSpacing = isNarrow ? 0.9 : isPortrait ? 1.0 : 1.1;
    const ballsStartX = -((availableColors.length - 1) * ballSpacing) / 2;

    // Palette and balls position
    const paletteY = isPortrait ? -1.5 : -1.2;
    const ballsY = isPortrait ? -0.9 : -0.6;

    return (
        <group scale={gameScale}>
            {/* Target color tube - left/top */}
            <PaintTube
                color={targetHex}
                position={[-tubeSpacing, tubeY, 0]}
                label="목표"
                scale={isPortrait ? 1.0 : 1.2}
            />

            {/* Current mix tube - right/bottom */}
            <PaintTube
                color={currentHex}
                position={[tubeSpacing, tubeY, 0]}
                label="내 색"
                scale={isPortrait ? 1.0 : 1.2}
            />

            {/* Arrow between */}
            <group position={[0, tubeY, 0]}>
                <mesh rotation={[0, 0, -Math.PI / 2]}>
                    <coneGeometry args={[0.15, 0.4, 16]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>
                <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>
            </group>

            {/* Palette */}
            <Palette position={[0, paletteY, 0]} />

            {/* Color balls on palette */}
            <group position={[0, ballsY, 0]}>
                {availableColors.map((color, index) => (
                    <ColorBall
                        key={index}
                        color={rgbToHex(color)}
                        position={[ballsStartX + index * ballSpacing, 0, 0]}
                        isSelected={selectedColor === index}
                        isHint={hintColorIndex === index}
                        onClick={() => selectColor(index)}
                        onMix={() => {
                            selectColor(index);
                            mixColor();
                        }}
                        index={index}
                    />
                ))}
            </group>

            {/* Ground plane */}
            <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[15, 10]} />
                <meshStandardMaterial
                    color="#2a3d4d"
                    metalness={0.3}
                    roughness={0.8}
                />
            </mesh>
        </group>
    );
};
