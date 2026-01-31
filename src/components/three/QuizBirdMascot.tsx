import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Float, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'

// 3D Bird Model Component with auto-fit
const BirdModel = () => {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/mascot_bird.glb')

  // Clone the scene
  const clonedScene = scene.clone()

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle idle rotation (small movement, keeping it facing right)
      groupRef.current.rotation.y = Math.PI + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      // Breathing effect
      const breathe = Math.sin(state.clock.elapsedTime * 1.5) * 0.02
      groupRef.current.scale.setScalar(1 + breathe)
    }
  })

  return (
    <group ref={groupRef} rotation={[0, Math.PI, 0]}> {/* Rotate 180° to face right */}
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
}

// Auto-fit camera to model - VERY CLOSE for much bigger appearance
const CameraFit = () => {
  const { camera, scene } = useThree()
  
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
    let cameraZ = maxDim / (2 * Math.tan(fov / 2))
    
    // MUCH CLOSER = MUCH BIGGER
    cameraZ *= 0.0005
    
    camera.position.z = Math.max(cameraZ, 0.5)
    camera.updateProjectionMatrix()
  }, [camera, scene])
  
  return null
}

// Loading fallback
const Loader = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#9333EA" wireframe />
    </mesh>
  )
}

// Scene with lighting
const Scene = () => {
  return (
    <>
      <CameraFit />
      
      {/* Lighting setup */}
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#ffffff" />
      
      {/* Environment for reflections */}
      <Environment preset="sunset" />

      {/* Floating animation - MUCH SMOOTHER */}
      <Float
        speed={1.2}                    // Slower speed (was 2)
        rotationIntensity={0.05}       // Very subtle rotation (was 0.1)
        floatIntensity={0.15}          // Gentle float (was 0.5)
        floatingRange={[-0.03, 0.03]}  // Small range (was [-0.1, 0.1])
      >
        <Suspense fallback={<Loader />}>
          <BirdModel />
        </Suspense>
      </Float>
    </>
  )
}

// Main exported component
const QuizBirdMascot = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/mascot_bird.glb')

export default QuizBirdMascot