'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useRef } from 'react'
import * as THREE from 'three'

/**
 * パーツごとの「初期 (バラバラ) 位置」と「最終 (ドッキング) 位置」、回転、フェードを定義。
 * 進捗 0→1 で各パーツが終端へ向かい、0.85→1 では全体を Y 軸 360° 回転させる。
 */
type PartConfig = {
  url: string
  start: { x: number; y: number; z: number }
  end: { x: number; y: number; z: number }
  startRotation?: { x: number; y: number; z: number }
  /** 進捗のうち、このパーツがアセンブルに使う窓 [from, to] (0-1) */
  window: [number, number]
}

const PARTS: PartConfig[] = [
  // face_base は中心で先に出る
  {
    url: '/glb/shuna_face_base.glb',
    start: { x: 0, y: 0, z: -1.5 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.0, 0.25],
  },
  // 左耳: 左から
  {
    url: '/glb/shuna_left_ear.glb',
    start: { x: -3.5, y: 1.5, z: 0.5 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: -0.6 },
    window: [0.15, 0.55],
  },
  // 右耳: 右から
  {
    url: '/glb/shuna_right_ear.glb',
    start: { x: 3.5, y: 1.5, z: 0.5 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: 0.6 },
    window: [0.2, 0.6],
  },
  // 鼻: 手前から
  {
    url: '/glb/shuna_nose.glb',
    start: { x: 0, y: -0.3, z: 4 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.35, 0.7],
  },
  // 口: 下から
  {
    url: '/glb/shuna_mouth.glb',
    start: { x: 0, y: -3, z: 0.5 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.45, 0.8],
  },
]

/**
 * 1 つの GLB パーツをスクロール進捗に応じて補間描画する。
 */
function ScrollPart({
  config,
  progress,
  groupRef,
}: {
  config: PartConfig
  progress: MotionValue<number>
  groupRef?: React.RefObject<THREE.Group | null>
}) {
  const ref = useRef<THREE.Group>(null!)
  const { scene } = useGLTF(config.url) as unknown as { scene: THREE.Group }

  useFrame(() => {
    if (!ref.current) return
    const p = progress.get()
    const [w0, w1] = config.window
    // パーツごとの窓内で 0→1 を smoothstep
    const t = THREE.MathUtils.smoothstep(p, w0, w1)
    // 位置補間
    ref.current.position.set(
      THREE.MathUtils.lerp(config.start.x, config.end.x, t),
      THREE.MathUtils.lerp(config.start.y, config.end.y, t),
      THREE.MathUtils.lerp(config.start.z, config.end.z, t),
    )
    // 回転補間 (start から終端 0,0,0 へ)
    const sr = config.startRotation ?? { x: 0, y: 0, z: 0 }
    ref.current.rotation.set(
      THREE.MathUtils.lerp(sr.x, 0, t),
      THREE.MathUtils.lerp(sr.y, 0, t),
      THREE.MathUtils.lerp(sr.z, 0, t),
    )
    // フェード (window 開始前は 0、開始後すぐに 1)
    const fadeIn = Math.min(1, Math.max(0, (p - w0) / 0.05))
    ref.current.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const mat = (o as THREE.Mesh).material as THREE.Material | THREE.Material[]
        const apply = (m: THREE.Material) => {
          m.transparent = true
          ;(m as THREE.MeshStandardMaterial).opacity = fadeIn
        }
        if (Array.isArray(mat)) mat.forEach(apply)
        else apply(mat)
      }
    })
    // 最後の回転は親 group が持つので、ここでは何もしない
    void groupRef
  })

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  )
}

/**
 * 全体を束ねて、最終局面 (0.85→1) で Y 軸 360° 回転させる。
 */
export function AssemblyScene({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(() => {
    if (!groupRef.current) return
    const p = progress.get()
    if (p > 0.85) {
      const spinT = (p - 0.85) / 0.15
      groupRef.current.rotation.y = spinT * Math.PI * 2
    } else {
      // アイドル状態でゆるく揺らす
      groupRef.current.rotation.y = Math.sin(performance.now() / 1500) * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      {PARTS.map((p) => (
        <ScrollPart key={p.url} config={p} progress={progress} groupRef={groupRef} />
      ))}
    </group>
  )
}

// preload で初回ロード遅延を減らす
PARTS.forEach((p) => useGLTF.preload(p.url))
