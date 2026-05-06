'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * パーツごとの「初期 (バラバラ) 位置」と「最終 (ドッキング) 位置」、回転、フェードを定義。
 *
 * 進捗 0→0.58 で各パーツが終端へ集合し、0.58→0.78 で 1 回転。
 * 0.78→1.0 は静止保持 (完成形を見せる余白) — useFrame で何もしない。
 *
 * GLB の生メッシュは ±20 単位前後と巨大なので、各パーツ group に PART_SCALE を
 * 掛けてカメラ (z=7, fov=32°) に収まるよう縮小する。start/end は描画ワールド座標。
 */
const PART_SCALE = 0.08

/** 全体を組み上げ終わるスクロール進捗 (この値以降は回転フェーズ) */
const ASSEMBLY_END = 0.58
/** 1 回転を終えるスクロール進捗 (この値以降は静止保持) */
const SPIN_END = 0.78

type PartConfig = {
  url: string
  /** 表示用キー (URL は重複可) */
  key: string
  start: { x: number; y: number; z: number }
  end: { x: number; y: number; z: number }
  startRotation?: { x: number; y: number; z: number }
  /** 左耳を mirror して右耳に流用する用 */
  mirrorX?: boolean
  /** 進捗のうち、このパーツがアセンブルに使う窓 [from, to] (0-1) */
  window: [number, number]
}

const PARTS: PartConfig[] = [
  // STEP 01 顔のベース
  {
    url: '/glb/shuna_face_base.glb',
    key: 'face_base',
    start: { x: 0, y: 0, z: -3 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.0, 0.13],
  },
  // STEP 02 左耳
  {
    url: '/glb/shuna_left_ear.glb',
    key: 'left_ear',
    start: { x: -4.5, y: 2.2, z: 1 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: -0.7 },
    window: [0.13, 0.27],
  },
  // STEP 02 右耳 (左耳を mirrorX で再利用 — shuna_right_ear.glb は nose の重複ファイル)
  {
    url: '/glb/shuna_left_ear.glb',
    key: 'right_ear',
    start: { x: 4.5, y: 2.2, z: 1 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: 0.7 },
    mirrorX: true,
    window: [0.17, 0.3],
  },
  // STEP 03 鼻
  {
    url: '/glb/shuna_nose.glb',
    key: 'nose',
    start: { x: 0, y: 0, z: 5 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.3, 0.45],
  },
  // STEP 04 口
  {
    url: '/glb/shuna_mouth.glb',
    key: 'mouth',
    start: { x: 0, y: -3.5, z: 1 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.45, 0.58],
  },
]

/**
 * 1 つの GLB パーツをスクロール進捗に応じて補間描画する。
 * - シーンは clone() してインスタンス化 (同じ URL を mirror 用に再利用しても OK)。
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

    // フェード: window 開始の少し前から 0→1 で出現
    const fadeIn = THREE.MathUtils.smoothstep(p, w0 - 0.02, w0 + 0.04)
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const apply = (m: THREE.Material) => {
        ;(m as THREE.MeshStandardMaterial).opacity = fadeIn
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
 * 全体を束ねて、最終局面 (ASSEMBLY_END→1) で Y 軸 360° 回転させる。
 * yOffset: モバイルでモデルを上方向に少し寄せる用 (キャプションが下に来るので空間を有効活用)。
 */
export function AssemblyScene({
  progress,
  yOffset = 0,
}: {
  progress: MotionValue<number>
  yOffset?: number
}) {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(() => {
    if (!groupRef.current) return
    const p = progress.get()
    if (p < ASSEMBLY_END) {
      // アセンブル中: ゆるく左右に揺らす
      groupRef.current.rotation.y = Math.sin(performance.now() / 1500) * 0.06
    } else if (p < SPIN_END) {
      // 1 回転フェーズ
      const spinT = (p - ASSEMBLY_END) / (SPIN_END - ASSEMBLY_END)
      groupRef.current.rotation.y = spinT * Math.PI * 2
    } else {
      // 静止保持: 完成形を見せる余白 (回転は最終位置 = 0 に固定)
      groupRef.current.rotation.y = 0
    }
  })

  return (
    <group ref={groupRef} position={[0, yOffset, 0]}>
      {PARTS.map((p) => (
        <ScrollPart key={p.key} config={p} progress={progress} />
      ))}
    </group>
  )
}

// preload で初回ロード遅延を減らす (URL を重複排除)
const PRELOAD_URLS = Array.from(new Set(PARTS.map((p) => p.url)))
PRELOAD_URLS.forEach((u) => useGLTF.preload(u))
