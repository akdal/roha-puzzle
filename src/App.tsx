import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Cube } from './components/Cube';
import { UI } from './components/UI';
import { GameBackground } from './components/GameBackground';
import { useStore } from './store/useStore';

function Scene() {
  const isDraggingCube = useStore((s) => s.isDraggingCube);
  const orbitLocked = useStore((s) => s.orbitLocked);

  return (
    <>
      <GameBackground />

      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} />

      {/* Key light - main light source */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Fill light - softer, from opposite side */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.4}
      />

      {/* Rim light - adds depth */}
      <pointLight position={[0, -5, 0]} intensity={0.3} color="#4fc3f7" />

      {/* Environment for realistic reflections */}
      <Environment preset="city" />

      <Cube />

      <OrbitControls
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

function App() {
  return (
    <div className="w-full h-full relative">
      <UI />

      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
