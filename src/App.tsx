import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cube } from './components/Cube';
import { UI } from './components/UI';
import { GameBackground } from './components/GameBackground';

function App() {
  return (
    <div className="w-full h-full relative">
      <UI />

      <Canvas camera={{ position: [6, 6, 6], fov: 45 }}>
        <GameBackground />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Cube />

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}

export default App;
