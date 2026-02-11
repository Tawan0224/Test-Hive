import { useRef, Suspense, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Float, Environment, Center } from '@react-three/drei'
import * as THREE from 'three'
import type { MascotState } from '../battle/battleConfig'

// ─── 3D Octopus Model with Battle Animations ────────────────────
const OctopusModel = ({ battleState = 'idle' }: { battleState: MascotState }) => {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/octopus.glb')
  const clonedScene = useMemo(() => scene.clone(), [scene])

  const targetPos = useRef({ x: 0, y: 0, z: 0 })
  const targetRot = useRef({ x: 0, y: 0, z: 0 })
  const BASE_SCALE = 1.28
  const targetScale = useRef(BASE_SCALE)
  const stateStartAt = useRef(0)

  useEffect(() => {
    stateStartAt.current = performance.now()

    switch (battleState) {
      case 'attack':
        targetPos.current = { x: -0.5, y: 0.1, z: 0 }
        targetScale.current = BASE_SCALE * 1.14
        targetRot.current = { x: -0.05, y: 0.2, z: 0.05 }
        break
      case 'hit':
        targetPos.current = { x: 0.3, y: -0.05, z: 0 }
        targetScale.current = BASE_SCALE * 0.9
        targetRot.current = { x: 0.05, y: -0.15, z: -0.1 }
        break
      case 'victory':
        targetPos.current = { x: 0, y: 0.2, z: 0 }
        targetScale.current = BASE_SCALE * 1.08
        targetRot.current = { x: 0, y: 0, z: 0 }
        break
      case 'defeat':
        targetPos.current = { x: 0.15, y: -0.25, z: 0 }
        targetScale.current = BASE_SCALE * 0.82
        targetRot.current = { x: 0.15, y: -0.2, z: -0.2 }
        break
      default:
        targetPos.current = { x: 0, y: 0, z: 0 }
        targetScale.current = BASE_SCALE
        targetRot.current = { x: 0, y: 0, z: 0 }
    }
  }, [battleState])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const t = state.clock.elapsedTime
    const stateElapsed = (performance.now() - stateStartAt.current) / 1000
    const smooth = battleState === 'idle' ? 6 : 10

    const attackLunge =
      battleState === 'attack'
        ? Math.max(0, Math.sin(Math.min(stateElapsed * 10, Math.PI))) * 0.26
        : 0
    const hitStagger =
      battleState === 'hit'
        ? Math.max(0, Math.sin(Math.min(stateElapsed * 12, Math.PI))) * 0.2
        : 0

    const targetX = targetPos.current.x - attackLunge + hitStagger
    const targetY = targetPos.current.y + attackLunge * 0.25
    const targetZ = targetPos.current.z - attackLunge * 0.18

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetX,
      smooth,
      delta
    )
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY,
      smooth,
      delta
    )
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetZ,
      smooth,
      delta
    )

    const idleRotY = targetRot.current.y + Math.sin(t * 0.4) * 0.15
    const idleRotZ = targetRot.current.z + Math.sin(t * 0.6) * 0.03
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRot.current.x + attackLunge * 0.08,
      smooth,
      delta
    )
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      idleRotY + hitStagger * 0.06,
      smooth,
      delta
    )
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      idleRotZ + attackLunge * 0.05,
      smooth,
      delta
    )

    const breathe = battleState === 'idle' ? Math.sin(t * 1.2) * 0.02 : 0
    const currentScale = groupRef.current.scale.x
    const scaleKick = attackLunge * 0.16 - hitStagger * 0.1
    const newScale = THREE.MathUtils.damp(
      currentScale,
      targetScale.current + breathe + scaleKick,
      smooth,
      delta
    )
    groupRef.current.scale.setScalar(newScale)

    if (battleState === 'victory') {
      groupRef.current.position.y = 0.2 + Math.abs(Math.sin(t * 3)) * 0.15
    }

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

const Scene = ({ battleState }: { battleState: MascotState }) => {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.8} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#ffffff" />
      <pointLight position={[-2, 2, 2]} intensity={0.5} color="#f472b6" />

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

interface QuizOctopusMascotProps {
  battleState?: MascotState
}

const QuizOctopusMascot = ({ battleState = 'idle' }: QuizOctopusMascotProps) => {
  return (
    <div className="w-full h-full overflow-visible">
      <Canvas
        camera={{ position: [0, 0.2, 6.1], fov: 35, near: 0.1, far: 100 }}
        style={{ background: 'transparent', overflow: 'visible' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene battleState={battleState} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/octopus.glb')

export default QuizOctopusMascot
