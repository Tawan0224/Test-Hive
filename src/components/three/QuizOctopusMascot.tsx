import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Float, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'

// 3D Octopus Model Component with auto-fit
const OctopusModel = () => {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/octopus.glb')

  // Clone the scene
  const clonedScene = scene.clone()

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle idle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15
      // Wobble effect
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.03
      // Breathing effect
      const breathe = Math.sin(state.clock.elapsedTime * 1.2) * 0.02
      groupRef.current.scale.setScalar(1 + breathe)
    }
  })

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
}

// Auto-fit camera to model
const CameraFit = () => {
  const { camera, scene } = useThree()
  
  useEffect(() => {
    // Calculate bounding box of the scene
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    
    // Adjust camera distance based on model size
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
    let cameraZ = maxDim / (2 * Math.tan(fov / 2))
    cameraZ *= 0.01 // Add some padding
    
    camera.position.z = Math.max(cameraZ, 3)
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
      <meshStandardMaterial color="#EC4899" wireframe />
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
      <pointLight position={[-2, 2, 2]} intensity={0.5} color="#f472b6" />
      
      {/* Environment for reflections */}
      <Environment preset="sunset" />

      {/* Floating animation */}
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        <Suspense fallback={<Loader />}>
          <OctopusModel />
        </Suspense>
      </Float>
    </>
  )
}

// Main exported component
const QuizOctopusMascot = () => {
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

useGLTF.preload('/models/octopus.glb')

export default QuizOctopusMascot