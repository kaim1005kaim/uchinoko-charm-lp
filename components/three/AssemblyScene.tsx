'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * パーツごとの「初期 (バラバラ) 位置」と「最終 (ドッキング) 位置」、回転、フェードを定義。
 *
 * 進捗フェーズ:
 *   0 → 0.42  : パーツがバラバラ → 終端へ集合
 *   0.42 → 0.55 : 集合済みパーツがフェードアウト、テクスチャ付きの完成モデル
 *                 (shuna_ALL_tx.glb / 眉と目あり) がフェードイン
 *   0.55 → 0.78 : 完成モデルが Y 軸 360° 回転
 *   0.78 → 1.0  : 静止保持 (完成形を見せる余白)
 *
 * GLB の生メッシュは ±20 単位前後と巨大なので、各パーツ group に PART_SCALE を
 * 掛けてカメラに収まるよう縮小する。
 */
const PART_SCALE = 0.08

/** パーツのアセンブルが完了する進捗 (この後にテクスチャフェードへ) */
const ASSEMBLY_END = 0.42
/** テクスチャ (眉・目) が完全に表示される進捗 */
const TEXTURE_END = 0.55
/** 1 回転を終える進捗 (この値以降は静止保持) */
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
    window: [0.0, 0.1],
  },
  // STEP 02 左耳
  {
    url: '/glb/shuna_left_ear.glb',
    key: 'left_ear',
    start: { x: -4.5, y: 2.2, z: 1 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: -0.7 },
    window: [0.1, 0.22],
  },
  // STEP 02 右耳 (左耳を mirrorX で再利用)
  {
    url: '/glb/shuna_left_ear.glb',
    key: 'right_ear',
    start: { x: 4.5, y: 2.2, z: 1 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: 0.7 },
    mirrorX: true,
    window: [0.13, 0.25],
  },
  // STEP 03 鼻
  {
    url: '/glb/shuna_nose.glb',
    key: 'nose',
    start: { x: 0, y: 0, z: 5 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.22, 0.33],
  },
  // STEP 04 口
  {
    url: '/glb/shuna_mouth.glb',
    key: 'mouth',
    start: { x: 0, y: -3.5, z: 1 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.32, 0.42],
  },
]

const TEXTURED_URL = '/glb/shuna_ALL_tx.glb'

/**
 * 透明 / 不透明をマテリアル単位で切り替える。
 * - transparent の切替時は needsUpdate でシェーダ再構築 (every frame に呼ぶと重いので必要時のみ)
 * - 不透明時: depthWrite=true で正しい z オーダー
 * - 半透明時: depthWrite=false (透過オブジェクトの z-fight 回避)
 */
function applyMaterialState(mesh: THREE.Mesh, opacity: number) {
  const targetTransparent = opacity < 0.999
  const apply = (m: THREE.Material) => {
    if (m.transparent !== targetTransparent) {
      m.transparent = targetTransparent
      m.depthWrite = !targetTransparent
      m.needsUpdate = true
    }
    ;(m as THREE.MeshStandardMaterial).opacity = opacity
  }
  if (Array.isArray(mesh.material)) mesh.material.forEach(apply)
  else apply(mesh.material)
}

function cloneSceneWithMaterials(scene: THREE.Group): THREE.Group {
  const c = scene.clone(true)
  c.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const cloneMat = (m: THREE.Material) => m.clone()
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(cloneMat)
      : cloneMat(mesh.material)
  })
  return c
}

/**
 * 1 つの GLB パーツをスクロール進捗に応じて補間描画する。
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
  const cloned = useMemo(() => cloneSceneWithMaterials(scene), [scene])

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

    // window 開始時にフェードイン、ASSEMBLY_END → TEXTURE_END でフェードアウト
    const fadeIn = THREE.MathUtils.smoothstep(p, w0 - 0.02, w0 + 0.04)
    const fadeOut = 1 - THREE.MathUtils.smoothstep(p, ASSEMBLY_END, TEXTURE_END)
    const opacity = fadeIn * fadeOut

    // 完全に透明のときは render から外して、テクスチャ完成モデルとの z-fight を避ける
    const visible = opacity > 0.005
    if (ref.current.visible !== visible) ref.current.visible = visible
    if (!visible) return

    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) applyMaterialState(mesh, opacity)
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
 * テクスチャ付き完成モデル (眉・目あり)。ASSEMBLY_END → TEXTURE_END でフェードイン。
 * フェード完了後は不透明描画に切り替えてテクスチャ本来の見た目を出す。
 */
function TexturedFinish({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.Group>(null!)
  const { scene } = useGLTF(TEXTURED_URL) as unknown as { scene: THREE.Group }
  const cloned = useMemo(() => cloneSceneWithMaterials(scene), [scene])

  useFrame(() => {
    if (!ref.current) return
    const p = progress.get()

    // ASSEMBLY_END 未満では完全に非表示 (パーツ表示中)
    if (p < ASSEMBLY_END) {
      if (ref.current.visible) ref.current.visible = false
      return
    }

    if (!ref.current.visible) ref.current.visible = true

    const fadeIn = THREE.MathUtils.smoothstep(p, ASSEMBLY_END, TEXTURE_END)
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) applyMaterialState(mesh, fadeIn)
    })
  })

  return (
    <group ref={ref} scale={PART_SCALE} visible={false}>
      <primitive object={cloned} />
    </group>
  )
}

/**
 * 全体を束ねて、テクスチャ表示完了後 (TEXTURE_END→SPIN_END) で Y 軸 360° 回転させる。
 * yOffset: モバイルでモデルを上方向に少し寄せる用。
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
    if (p < TEXTURE_END) {
      // アセンブル / テクスチャフェード中: ゆるく左右に揺らす
      groupRef.current.rotation.y = Math.sin(performance.now() / 1500) * 0.06
    } else if (p < SPIN_END) {
      // 1 回転フェーズ
      const spinT = (p - TEXTURE_END) / (SPIN_END - TEXTURE_END)
      groupRef.current.rotation.y = spinT * Math.PI * 2
    } else {
      // 静止保持
      groupRef.current.rotation.y = 0
    }
  })

  return (
    <group ref={groupRef} position={[0, yOffset, 0]}>
      {PARTS.map((p) => (
        <ScrollPart key={p.key} config={p} progress={progress} />
      ))}
      <TexturedFinish progress={progress} />
    </group>
  )
}

const PRELOAD_URLS = Array.from(new Set([...PARTS.map((p) => p.url), TEXTURED_URL]))
PRELOAD_URLS.forEach((u) => useGLTF.preload(u))
