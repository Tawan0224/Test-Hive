import { useRef, Suspense, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Float, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'
import type { MascotState } from '../battle/battleConfig'

// ─── 3D Octopus Model with Battle Animations ────────────────────
const OctopusModel = ({ battleState = 'idle' }: { battleState: MascotState }) => {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/octopus.glb')
  const clonedScene = useMemo(() => scene.clone(), [scene])
  
  // Animation targets
  const targetPos = useRef({ x: 0, y: 0, z: 0 })
  const targetRot = useRef({ x: 0, y: 0, z: 0 })
  const targetScale = useRef(1)

  useEffect(() => {
    switch (battleState) {
      case 'attack':
        targetPos.current = { x: -0.5, y: 0.1, z: 0 }
        targetScale.current = 1.15
        targetRot.current = { x: -0.05, y: 0.2, z: 0.05 }
        break
      case 'hit':
        targetPos.current = { x: 0.3, y: -0.05, z: 0 }
        targetScale.current = 0.88
        targetRot.current = { x: 0.05, y: -0.15, z: -0.1 }
        break
      case 'victory':
        targetPos.current = { x: 0, y: 0.2, z: 0 }
        targetScale.current = 1.1
        targetRot.current = { x: 0, y: 0, z: 0 }
        break
      case 'defeat':
        targetPos.current = { x: 0.15, y: -0.25, z: 0 }
        targetScale.current = 0.8
        targetRot.current = { x: 0.15, y: -0.2, z: -0.2 }
        break
      default: // idle
        targetPos.current = { x: 0, y: 0, z: 0 }
        targetScale.current = 1
        targetRot.current = { x: 0, y: 0, z: 0 }
    }
  }, [battleState])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const lerp = 0.12

    // Smooth lerp position
    groupRef.current.position.x += (targetPos.current.x - groupRef.current.position.x) * lerp
    groupRef.current.position.y += (targetPos.current.y - groupRef.current.position.y) * lerp
    groupRef.current.position.z += (targetPos.current.z - groupRef.current.position.z) * lerp

    // Rotation with idle wobble
    const idleRotY = targetRot.current.y + Math.sin(t * 0.4) * 0.15
    const idleRotZ = targetRot.current.z + Math.sin(t * 0.6) * 0.03
    groupRef.current.rotation.x += (targetRot.current.x - groupRef.current.rotation.x) * lerp
    groupRef.current.rotation.y += (idleRotY - groupRef.current.rotation.y) * lerp
    groupRef.current.rotation.z += (idleRotZ - groupRef.current.rotation.z) * lerp

    // Scale with breathing
    const breathe = battleState === 'idle' ? Math.sin(t * 1.2) * 0.02 : 0
    const currentScale = groupRef.current.scale.x
    const newScale = currentScale + (targetScale.current + breathe - currentScale) * lerp
    groupRef.current.scale.setScalar(newScale)

    // Victory bounce
    if (battleState === 'victory') {
      groupRef.current.position.y = 0.2 + Math.abs(Math.sin(t * 3)) * 0.15
    }

    // Defeat slow rotation
    if (battleState === 'defeat') {
      groupRef.current.rotation.z = -0.2 + Math.sin(t * 0.5) * 0.05
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

// ─── Camera Auto-fit ─────────────────────────────────────────────
const CameraFit = () => {
  const { camera, scene } = useThree()
  
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
    let cameraZ = maxDim / (2 * Math.tan(fov / 2))
    cameraZ *= 0.01
    
    camera.position.z = Math.max(cameraZ, 3)
    camera.updateProjectionMatrix()
  }, [camera, scene])
  
  return null
}

// ─── Loading Fallback ────────────────────────────────────────────
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

// ─── Scene ───────────────────────────────────────────────────────
const Scene = ({ battleState }: { battleState: MascotState }) => {
  return (
    <>
      <CameraFit />
      
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#ffffff" />
      <pointLight position={[-2, 2, 2]} intensity={0.5} color="#f472b6" />
      
      {/* Extra glow on attack */}
      {battleState === 'attack' && (
        <pointLight position={[-2, 1, 2]} intensity={2} color="#ef4444" distance={5} />
      )}
      {battleState === 'hit' && (
        <pointLight position={[1, 1, 2]} intensity={3} color="#a855f7" distance={4} />
      )}
      
      <Environment preset="sunset" />

      <Float
        speed={battleState === 'idle' ? 1.5 : 0}
        rotationIntensity={battleState === 'idle' ? 0.2 : 0}
        floatIntensity={battleState === 'idle' ? 0.5 : 0}
        floatingRange={[-0.1, 0.1]}
      >
        <Suspense fallback={<Loader />}>
          <OctopusModel battleState={battleState} />
        </Suspense>
      </Float>
    </>
  )
}

// ─── Main Exported Component ─────────────────────────────────────
interface QuizOctopusMascotProps {
  battleState?: MascotState
}

const QuizOctopusMascot = ({ battleState = 'idle' }: QuizOctopusMascotProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene battleState={battleState} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/octopus.glb')

export default QuizOctopusMascot