import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Bottle() {
  const materialProps = {
    thickness: 2,
    roughness: 0.1,
    transmission: 0.9,
    ior: 1.5,
    dispersion: 0.1,
    color: '#fdfbf7',
  };

  return (
    <group dispose={null}>
      <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[1, 1, 2, 32]} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      {/* Cap */}
      <mesh castShadow receiveShadow position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.3, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

export function Product3DViewer() {
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[600px] cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[512, 512]} castShadow />
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0.3, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 2]}
        >
          <Float rotationIntensity={0.4} floatIntensity={2} speed={2}>
            <Bottle />
          </Float>
        </PresentationControls>
        <ContactShadows position={[0, -1.4, 0]} opacity={0.75} scale={10} blur={2.5} far={4} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
