'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * パーツごとの「初期 (バラバラ) 位置」と「最終 (ドッキング) 位置」、回転、フェードを定義。
 * 進捗 0→1 で各パーツが終端へ向かい、0.85→1 では全体を Y 軸 360° 回転させる。
 *
 * ※ GLB の生メッシュは ±20 単位前後と巨大なので、各パーツ group に PART_SCALE を
 * 掛けて画面 (z=7, fov=32°) に収まるよう縮小する。start/end は描画ワールド座標。
 */
const PART_SCALE = 0.08

type PartConfig = {
  /** GLB の URL */
  url: string
  /** 表示用キー (URL は重複可) */
  key: string
  start: { x: number; y: number; z: number }
  end: { x: number; y: number; z: number }
  startRotation?: { x: number; y: number; z: number }
  /** X 軸を反転して使う場合 (左耳を右耳として再利用) */
  mirrorX?: boolean
  /** 進捗のうち、このパーツがアセンブルに使う窓 [from, to] (0-1) */
  window: [number, number]
}

const PARTS: PartConfig[] = [
  // face_base は中心で先に出る
  {
    url: '/glb/shuna_face_base.glb',
    key: 'face_base',
    start: { x: 0, y: 0, z: -2 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.0, 0.25],
  },
  // 左耳: 左から
  {
    url: '/glb/shuna_left_ear.glb',
    key: 'left_ear',
    start: { x: -3.5, y: 1.5, z: 0.6 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: -0.6 },
    window: [0.15, 0.55],
  },
  // 右耳: 左耳を mirror して再利用 (shuna_right_ear.glb は nose の重複ファイル)
  {
    url: '/glb/shuna_left_ear.glb',
    key: 'right_ear',
    start: { x: 3.5, y: 1.5, z: 0.6 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: 0.6 },
    mirrorX: true,
    window: [0.2, 0.6],
  },
  // 鼻: 手前から
  {
    url: '/glb/shuna_nose.glb',
    key: 'nose',
    start: { x: 0, y: -0.3, z: 4 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.35, 0.7],
  },
  // 口: 下から
  {
    url: '/glb/shuna_mouth.glb',
    key: 'mouth',
    start: { x: 0, y: -3, z: 0.6 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.45, 0.8],
  },
]

/**
 * 1 つの GLB パーツをスクロール進捗に応じて補間描画する。
 * - シーンは clone() してインスタンス化 (同じ URL を複数並べても大丈夫に)。
 * - マテリアルも複製し、フェード時の opacity 上書きが他インスタンスに伝わらないようにする。
 */
function ScrollPart({
  config,
  progress,
}: {
  config: PartConfig
  progress: MotionValue<number>
}) {
  const ref = useRef<THREE.Group>(null!)
  const { scene } = useGLTF(config.url) as unknown as { scene: THREE.Group }

  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const cloneMat = (m: THREE.Material) => {
        const nm = m.clone()
        nm.transparent = true
        return nm
      }
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(cloneMat)
        : cloneMat(mesh.material)
    })
    return c
  }, [scene])

  useFrame(() => {
    if (!ref.current) return
    const p = progress.get()
    const [w0, w1] = config.window
    const t = THREE.MathUtils.smoothstep(p, w0, w1)

    ref.current.position.set(
      THREE.MathUtils.lerp(config.start.x, config.end.x, t),
      THREE.MathUtils.lerp(config.start.y, config.end.y, t),
      THREE.MathUtils.lerp(config.start.z, config.end.z, t),
    )

    const sr = config.startRotation ?? { x: 0, y: 0, z: 0 }
    ref.current.rotation.set(
      THREE.MathUtils.lerp(sr.x, 0, t),
      THREE.MathUtils.lerp(sr.y, 0, t),
      THREE.MathUtils.lerp(sr.z, 0, t),
    )

    // フェード (window 開始時点で 1)
    const opacity = p < w0 ? 0 : 1
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const apply = (m: THREE.Material) => {
        ;(m as THREE.MeshStandardMaterial).opacity = opacity
      }
      if (Array.isArray(mesh.material)) mesh.material.forEach(apply)
      else apply(mesh.material)
    })
  })

  const sx = (config.mirrorX ? -1 : 1) * PART_SCALE

  return (
    <group ref={ref} scale={[sx, PART_SCALE, PART_SCALE]}>
      <primitive object={cloned} />
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
        <ScrollPart key={p.key} config={p} progress={progress} />
      ))}
    </group>
  )
}

// preload で初回ロード遅延を減らす
const PRELOAD_URLS = Array.from(new Set(PARTS.map((p) => p.url)))
PRELOAD_URLS.forEach((u) => useGLTF.preload(u))
