import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Mouse position tracker
const useMousePosition = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return mouse
}

// 3D Model Component
const TreasureChestModel = ({ mouse }: { mouse: { x: number; y: number } }) => {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/treasure-chest.glb')
  
  const targetRotation = useRef({ x: 0, y: 0 })

  // Base rotation offset - rotated left (negative Y) and tilted down (positive X)
  const baseRotationY = -0.3 
  const baseRotationX = 0.15 

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Add mouse movement to base rotation
      targetRotation.current.y = baseRotationY + mouse.x * 0.4
      targetRotation.current.x = baseRotationX + mouse.y * 0.2

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        delta * 3
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        delta * 3
      )
    }
  })

  return (
    <group ref={groupRef} rotation={[baseRotationX, baseRotationY, 0]}>
      <primitive 
        object={scene} 
        scale={0.01}          
        position={[0, -0.3, 0]} 
      />
    </group>
  )
}

// Loading fallback
const Loader = () => {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#9333EA" wireframe />
    </mesh>
  )
}

// Scene with lighting
const Scene = ({ mouse }: { mouse: { x: number; y: number } }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#ffffff" />
      
      {/* Environment for better reflections */}
      <Environment preset="sunset" />

      {/* Floating animation */}
      <Float
        speed={1.5}
        rotationIntensity={0}
        floatIntensity={0.3}
        floatingRange={[-0.15, 0.15]}
      >
        <Suspense fallback={<Loader />}>
          <TreasureChestModel mouse={mouse} />
        </Suspense>
      </Float>
    </>
  )
}

// Main exported component
const TreasureChest = () => {
  const mouse = useMousePosition()

  return (
    <div className="absolute top-20 right-0 w-[55%] h-full pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/treasure-chest.glb')

export default TreasureChest