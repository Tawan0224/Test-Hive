import { useRef, Suspense, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Float, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'
import type { MascotState } from '../battle/battleConfig'

// ─── 3D Bird Model with Battle Animations ────────────────────────
const BirdModel = ({ battleState = 'idle' }: { battleState: MascotState }) => {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/mascot_bird.glb')
  const clonedScene = useMemo(() => scene.clone(), [scene])
  
  // Animation targets
  const targetPos = useRef({ x: 0, y: 0, z: 0 })
  const targetRot = useRef({ x: 0, y: Math.PI, z: 0 })
  const BASE_SCALE = 3.35
  const targetScale = useRef(BASE_SCALE)
  const stateStartAt = useRef(0)

  // Update targets based on battle state
  useEffect(() => {
    stateStartAt.current = performance.now()

    switch (battleState) {
      case 'attack':
        targetPos.current = { x: 0.4, y: 0.1, z: 0 }
        targetScale.current = BASE_SCALE * 1.12
        targetRot.current = { x: -0.05, y: Math.PI - 0.15, z: -0.05 }
        break
      case 'hit':
        targetPos.current = { x: -0.3, y: -0.05, z: 0 }
        targetScale.current = BASE_SCALE * 0.9
        targetRot.current = { x: 0.05, y: Math.PI + 0.1, z: 0.08 }
        break
      case 'victory':
        targetPos.current = { x: 0, y: 0.2, z: 0 }
        targetScale.current = BASE_SCALE * 1.08
        targetRot.current = { x: 0, y: Math.PI, z: 0 }
        break
      case 'defeat':
        targetPos.current = { x: -0.1, y: -0.2, z: 0 }
        targetScale.current = BASE_SCALE * 0.82
        targetRot.current = { x: 0.1, y: Math.PI + 0.2, z: 0.15 }
        break
      default: // idle
        targetPos.current = { x: 0, y: 0, z: 0 }
        targetScale.current = BASE_SCALE
        targetRot.current = { x: 0, y: Math.PI, z: 0 }
    }
  }, [battleState])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const t = state.clock.elapsedTime
    const stateElapsed = (performance.now() - stateStartAt.current) / 1000
    const smooth = battleState === 'idle' ? 6 : 10

    const attackPunch = battleState === 'attack'
      ? Math.max(0, Math.sin(Math.min(stateElapsed * 10, Math.PI))) * 0.24
      : 0
    const hitStagger = battleState === 'hit'
      ? Math.max(0, Math.sin(Math.min(stateElapsed * 12, Math.PI))) * 0.16
      : 0

    const targetX = targetPos.current.x + attackPunch - hitStagger
    const targetY = targetPos.current.y + attackPunch * 0.4
    const targetZ = targetPos.current.z - attackPunch * 0.2

    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, smooth, delta)
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, smooth, delta)
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, smooth, delta)

    // Smooth lerp rotation
    const idleRotY = targetRot.current.y + Math.sin(t * 0.5) * 0.1
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRot.current.x + attackPunch * 0.08, smooth, delta)
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, idleRotY - hitStagger * 0.08, smooth, delta)
    groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, targetRot.current.z - attackPunch * 0.04, smooth, delta)

    // Smooth scale with breathing
    const breathe = battleState === 'idle' ? Math.sin(t * 1.5) * 0.02 : 0
    const currentScale = groupRef.current.scale.x
    const scaleKick = attackPunch * 0.1 - hitStagger * 0.08
    const newScale = THREE.MathUtils.damp(currentScale, targetScale.current + breathe + scaleKick, smooth, delta)
    groupRef.current.scale.setScalar(newScale)

    // Victory bounce
    if (battleState === 'victory') {
      groupRef.current.position.y = 0.2 + Math.abs(Math.sin(t * 3)) * 0.15
    }
  })

  return (
    <group ref={groupRef} rotation={[0, Math.PI, 0]}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
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
      <meshStandardMaterial color="#9333EA" wireframe />
    </mesh>
  )
}

// ─── Scene ───────────────────────────────────────────────────────
const Scene = ({ battleState }: { battleState: MascotState }) => {
  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#ffffff" />
      
      {/* Extra glow on attack */}
      {battleState === 'attack' && (
        <pointLight position={[2, 1, 2]} intensity={2} color="#a855f7" distance={5} />
      )}
      {battleState === 'hit' && (
        <pointLight position={[-1, 1, 2]} intensity={3} color="#ef4444" distance={4} />
      )}
      
      <Environment preset="sunset" />

      <Float
        speed={battleState === 'idle' ? 1.2 : 0}
        rotationIntensity={battleState === 'idle' ? 0.05 : 0}
        floatIntensity={battleState === 'idle' ? 0.15 : 0}
        floatingRange={[-0.03, 0.03]}
      >
        <Suspense fallback={<Loader />}>
          <BirdModel battleState={battleState} />
        </Suspense>
      </Float>
    </>
  )
}

// ─── Main Exported Component ─────────────────────────────────────
interface QuizBirdMascotProps {
  battleState?: MascotState
}

const QuizBirdMascot = ({ battleState = 'idle' }: QuizBirdMascotProps) => {
  return (
    <div className="w-full h-full overflow-visible">
      <Canvas
        camera={{ position: [0, 0.45, 4.9], fov: 32, near: 0.1, far: 100 }}
        style={{ background: 'transparent', overflow: 'visible' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene battleState={battleState} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/mascot_bird.glb')

export default QuizBirdMascot
