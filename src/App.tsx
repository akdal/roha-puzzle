import { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { Cube } from './components/Cube';
import { UI } from './components/UI';
import { GameBackground } from './components/GameBackground';
import { useStore } from './store/useStore';
import { Hanoi } from './games/hanoi';
import { Puzzle } from './games/puzzle';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type GameType = 'menu' | 'rubiks' | 'hanoi' | 'puzzle';

const DEFAULT_CAMERA_POSITION = new Vector3(5, 5, 5);

function RubiksScene() {
  const isDraggingCube = useStore((s) => s.isDraggingCube);
  const orbitLocked = useStore((s) => s.orbitLocked);
  const viewResetRequested = useStore((s) => s.viewResetRequested);
  const clearViewReset = useStore((s) => s.clearViewReset);

  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (viewResetRequested && controlsRef.current) {
      camera.position.copy(DEFAULT_CAMERA_POSITION);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      clearViewReset();
    }
  }, [viewResetRequested, camera, clearViewReset]);

  return (
    <>
      <GameBackground />

      {/* Ambient light for even base illumination */}
      <ambientLight intensity={0.6} />

      {/* Key light - main light source */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
      />

      {/* Fill light - softer, from opposite side */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.5}
      />

      {/* Bottom fill light */}
      <directionalLight
        position={[0, -5, 3]}
        intensity={0.3}
      />

      <Cube />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={4}
        maxDistance={15}
        enabled={!isDraggingCube && !orbitLocked}
      />
    </>
  );
}

interface RubiksGameProps {
  onBack: () => void;
}

function RubiksGame({ onBack }: RubiksGameProps) {
  return (
    <div className="w-full h-full relative">
      <UI onBack={onBack} />
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        <RubiksScene />
      </Canvas>
    </div>
  );
}

interface GameMenuProps {
  onSelectGame: (game: GameType) => void;
}

function GameMenu({ onSelectGame }: GameMenuProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-3 drop-shadow-lg">
          3D Puzzle Games
        </h1>
        <p className="text-purple-200 mb-8 sm:mb-12 text-lg">Choose a game to play</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl">
          {/* Rubik's Cube */}
          <button
            onClick={() => onSelectGame('rubiks')}
            className="group bg-gradient-to-br from-red-500/20 to-orange-500/20 hover:from-red-500/40 hover:to-orange-500/40 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎲</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">루빅스 큐브</h2>
            <p className="text-orange-200 text-sm">2×2 & 3×3</p>
            <p className="text-white/70 text-xs mt-3 leading-relaxed">
              🎯 모든 면의 색상을 맞추세요
            </p>
          </button>

          {/* Hanoi Tower */}
          <button
            onClick={() => onSelectGame('hanoi')}
            className="group bg-gradient-to-br from-amber-500/20 to-yellow-500/20 hover:from-amber-500/40 hover:to-yellow-500/40 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🗼</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">하노이 탑</h2>
            <p className="text-yellow-200 text-sm">3~7개 원반</p>
            <p className="text-white/70 text-xs mt-3 leading-relaxed">
              🎯 모든 원반을 오른쪽으로 옮기세요
            </p>
          </button>

          {/* Slide Puzzle */}
          <button
            onClick={() => onSelectGame('puzzle')}
            className="group bg-gradient-to-br from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🧩</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">슬라이드 퍼즐</h2>
            <p className="text-cyan-200 text-sm">3×3 & 4×4</p>
            <p className="text-white/70 text-xs mt-3 leading-relaxed">
              🎯 숫자를 순서대로 정렬하세요
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  const handleBack = () => setCurrentGame('menu');

  switch (currentGame) {
    case 'rubiks':
      return <RubiksGame onBack={handleBack} />;
    case 'hanoi':
      return <Hanoi onBack={handleBack} />;
    case 'puzzle':
      return <Puzzle onBack={handleBack} />;
    default:
      return <GameMenu onSelectGame={setCurrentGame} />;
  }
}

export default App;
