import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

// Animated tentacle-like appendage
const Tentacle = ({ position, rotation, color, delay = 0 }: { 
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  delay?: number 
}) => {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + delay
      ref.current.rotation.z = Math.sin(t * 2) * 0.3
      ref.current.rotation.x = Math.cos(t * 1.5) * 0.2
    }
  })

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <capsuleGeometry args={[0.08, 1.2, 8, 16]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.3} 
        metalness={0.6}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}

// Main treasure chest body
const ChestBody = () => {
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={meshRef}>
      {/* Chest base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 0.9, 1]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.7} 
          metalness={0.3}
        />
      </mesh>
      
      {/* Chest lid */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.7, 0.4, 1.1]} />
        <meshStandardMaterial 
          color="#654321" 
          roughness={0.6} 
          metalness={0.4}
        />
      </mesh>

      {/* Gold trim */}
      <mesh position={[0, 0.35, 0.52]}>
        <boxGeometry args={[1.5, 0.15, 0.08]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.2} 
          metalness={0.9}
          emissive="#FFD700"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Center gem */}
      <mesh position={[0, 0.6, 0.58]}>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial 
          color="#FF0000" 
          roughness={0.1} 
          metalness={0.8}
          emissive="#FF0000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Gold decorations */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.6, 0.55]}>
          <torusGeometry args={[0.12, 0.03, 8, 16]} />
          <meshStandardMaterial 
            color="#FFD700" 
            roughness={0.2} 
            metalness={0.9}
          />
        </mesh>
      ))}
    </group>
  )
}

// Magical energy orbs floating around
const EnergyOrb = ({ position, color }: { position: [number, number, number], color: string }) => {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      ref.current.position.y = position[1] + Math.sin(t * 3) * 0.2
      ref.current.position.x = position[0] + Math.cos(t * 2) * 0.15
    }
  })

  return (
    <Sphere ref={ref} args={[0.08, 16, 16]} position={position}>
      <MeshDistortMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        roughness={0}
        metalness={0.5}
        distort={0.4}
        speed={4}
      />
    </Sphere>
  )
}

// Complete scene
const TreasureChestScene = () => {
  const tentacleColors = ['#FF69B4', '#00CED1', '#9333EA', '#FF1493', '#00FFFF']
  
  const tentaclePositions = useMemo(() => [
    { pos: [0.9, 0.2, 0.3] as [number, number, number], rot: [0, 0, -0.8] as [number, number, number] },
    { pos: [-0.9, 0.3, 0.2] as [number, number, number], rot: [0, 0, 0.9] as [number, number, number] },
    { pos: [0.7, 0.1, -0.4] as [number, number, number], rot: [0.3, 0, -0.6] as [number, number, number] },
    { pos: [-0.6, 0.2, -0.3] as [number, number, number], rot: [-0.2, 0, 0.7] as [number, number, number] },
    { pos: [0.3, 0.4, 0.5] as [number, number, number], rot: [0.5, 0, -0.3] as [number, number, number] },
    { pos: [-0.4, 0.3, 0.4] as [number, number, number], rot: [-0.4, 0, 0.4] as [number, number, number] },
    { pos: [0, 0.5, -0.5] as [number, number, number], rot: [-0.6, 0, 0] as [number, number, number] },
  ], [])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#9333EA" />
      <pointLight position={[0, -3, 5]} intensity={0.3} color="#FF69B4" />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.8}
        color="#FFD700"
        castShadow
      />

      {/* Main floating group */}
      <Float
        speed={2}
        rotationIntensity={0.3}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        <group position={[0, 0, 0]} scale={1.3}>
          <ChestBody />
          
          {/* Tentacles */}
          {tentaclePositions.map((t, i) => (
            <Tentacle
              key={i}
              position={t.pos}
              rotation={t.rot}
              color={tentacleColors[i % tentacleColors.length]}
              delay={i * 0.5}
            />
          ))}
        </group>
      </Float>

      {/* Floating energy orbs */}
      <EnergyOrb position={[1.5, 1, 0.5]} color="#9333EA" />
      <EnergyOrb position={[-1.3, 0.8, -0.3]} color="#FF69B4" />
      <EnergyOrb position={[0.8, -0.5, 0.8]} color="#00CED1" />
    </>
  )
}

// Exported component with Canvas
const TreasureChest = () => {
  return (
    <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <TreasureChestScene />
      </Canvas>
    </div>
  )
}

export default TreasureChest