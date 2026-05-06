'use client'

import { useGLTF } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * 進捗フェーズ:
 *   0 → 0.42  : パーツがバラバラから集合 (tint で完成形と同じ色合いに)
 *   0.42 → 0.55 : assembled parts → 完成 GLB へ瞬時に切替 (色一致でシームレス) +
 *                 目の decal (透過 PNG) がフェードイン
 *   0.55 → 0.78 : 完成 GLB が Y 軸 360° 回転
 *   0.78 → 1.0  : 静止保持
 */
const PART_SCALE = 0.08
const ASSEMBLY_END = 0.42
const TEXTURE_END = 0.55
const SPIN_END = 0.78

/**
 * ボディの灰色。元 GLB は 0.114 だが、ライティング下で暗くなりすぎるため
 * decal 表示前後で同じ印象になる中間値に持ち上げる
 */
const BODY_COLOR = 0x808080
/** 耳・鼻・口など (元 0.8) */
const PARTS_COLOR = 0xcccccc

const CLEAN_GLB_URL = '/glb/shuna_ALL.glb'
const EYES_TEXTURE_URL = '/images/eyes_texture.png'

type PartConfig = {
  url: string
  key: string
  start: { x: number; y: number; z: number }
  end: { x: number; y: number; z: number }
  startRotation?: { x: number; y: number; z: number }
  mirrorX?: boolean
  window: [number, number]
  /** 集合中のパーツに乗せる色 (完成 GLB と一致させる) */
  tint: number
  /** ボディは常に不透明にしたいのでフェードを skip する */
  skipFadeIn?: boolean
}

const PARTS: PartConfig[] = [
  {
    url: '/glb/shuna_face_base.glb',
    key: 'face_base',
    start: { x: 0, y: 0, z: -3 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.0, 0.1],
    tint: BODY_COLOR,
    // ボディは透過させずスクロール開始前から完全不透明で見せる
    skipFadeIn: true,
  },
  {
    url: '/glb/shuna_left_ear.glb',
    key: 'left_ear',
    start: { x: -4.5, y: 2.2, z: 1 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: -0.7 },
    window: [0.1, 0.22],
    tint: PARTS_COLOR,
  },
  {
    url: '/glb/shuna_left_ear.glb',
    key: 'right_ear',
    start: { x: 4.5, y: 2.2, z: 1 },
    end: { x: 0, y: 0, z: 0 },
    startRotation: { x: 0, y: 0, z: 0.7 },
    mirrorX: true,
    window: [0.13, 0.25],
    tint: PARTS_COLOR,
  },
  {
    url: '/glb/shuna_nose.glb',
    key: 'nose',
    start: { x: 0, y: 0, z: 5 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.22, 0.33],
    tint: PARTS_COLOR,
  },
  {
    url: '/glb/shuna_mouth.glb',
    key: 'mouth',
    // 鼻と同じく z 軸 (カメラ側) から飛び込んでくる
    start: { x: 0, y: 0, z: 5 },
    end: { x: 0, y: 0, z: 0 },
    window: [0.32, 0.42],
    tint: PARTS_COLOR,
  },
]

/* ===========================================================================
 * material helpers
 * ========================================================================= */

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

function cloneSceneWithMaterials(
  scene: THREE.Group,
  options?: {
    forceDoubleSide?: boolean
    /** 全マテリアルを単一色で塗りつぶし (assembled parts 用) */
    tint?: number
    /** 元 baseColor が暗い (ボディ) と明るい (パーツ) で別の色を当てる (完成 GLB 用) */
    bodyTint?: number
    partsTint?: number
  },
): THREE.Group {
  const c = scene.clone(true)
  c.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const cloneMat = (m: THREE.Material) => {
      const nm = m.clone()
      if (options?.forceDoubleSide) nm.side = THREE.DoubleSide
      const stdMat = nm as THREE.MeshStandardMaterial
      if (options?.tint !== undefined) {
        stdMat.color = new THREE.Color(options.tint)
      } else if (
        options?.bodyTint !== undefined &&
        options?.partsTint !== undefined &&
        stdMat.color
      ) {
        // 元 baseColor の明度で振り分け (clean GLB は body=0.114 / parts=0.8)
        const lum =
          (stdMat.color.r + stdMat.color.g + stdMat.color.b) / 3
        stdMat.color = new THREE.Color(
          lum < 0.5 ? options.bodyTint : options.partsTint,
        )
      }
      return nm
    }
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(cloneMat)
      : cloneMat(mesh.material)
  })
  return c
}

/* ===========================================================================
 * components
 * ========================================================================= */

/**
 * 1 つの GLB パーツをスクロール進捗に応じて補間描画する。
 * 集合完了 (ASSEMBLY_END) 以降は visible=false で完全に render から外し、
 * 完成 GLB との z-fight を防ぐ。
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
  const cloned = useMemo(
    () => cloneSceneWithMaterials(scene, { tint: config.tint }),
    [scene, config.tint],
  )

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

    // skipFadeIn: ボディは常に不透明 / それ以外は窓の前から徐々に出現
    const fadeIn = config.skipFadeIn
      ? 1
      : THREE.MathUtils.smoothstep(p, w0 - 0.06, w0)
    // ASSEMBLY_END で瞬時に消す (完成 GLB と入れ替え)
    const visible = p < ASSEMBLY_END && fadeIn > 0.005
    if (ref.current.visible !== visible) ref.current.visible = visible
    if (!visible) return

    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) applyMaterialState(mesh, fadeIn)
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
 * 完成 GLB (テクスチャなし、マテリアル color のみ)。
 * ASSEMBLY_END 以降に表示される。常に不透明描画なので回転中も色がブレない。
 */
function CleanFinish({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.Group>(null!)
  const { scene } = useGLTF(CLEAN_GLB_URL) as unknown as { scene: THREE.Group }
  const cloned = useMemo(
    () =>
      cloneSceneWithMaterials(scene, {
        forceDoubleSide: true,
        // assembled parts と完全に同じ色で描画して入れ替え時の差を消す
        bodyTint: BODY_COLOR,
        partsTint: PARTS_COLOR,
      }),
    [scene],
  )

  useFrame(() => {
    if (!ref.current) return
    const p = progress.get()
    const visible = p >= ASSEMBLY_END
    if (ref.current.visible !== visible) ref.current.visible = visible
  })

  return (
    <group ref={ref} scale={PART_SCALE} visible={false}>
      <primitive object={cloned} />
    </group>
  )
}

/**
 * 眉と目の decal。texture.png は背景透過 / 白の眉 / 暗色の目を含む
 * RGBA PNG なので、そのまま Plane の map に使う。
 * 完成 GLB の顔正面 (z=0.22) に重ねて ASSEMBLY_END → TEXTURE_END でフェードイン。
 * Plane は完成モデル group の子なので、回転 / 静止保持時も顔と一緒に回る。
 */
function EyesOverlay({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.Mesh>(null!)
  const tex = useLoader(THREE.TextureLoader, EYES_TEXTURE_URL)

  useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace
  }, [tex])

  useFrame(() => {
    if (!ref.current) return
    const p = progress.get()
    const fadeIn = THREE.MathUtils.smoothstep(p, ASSEMBLY_END, TEXTURE_END)
    const visible = fadeIn > 0.001
    if (ref.current.visible !== visible) ref.current.visible = visible
    if (!visible) return
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = fadeIn
  })

  // 顔の bbox は ~3.4 単位四方なので、texture を等倍で重ねる
  return (
    <mesh ref={ref} position={[0, 0, 0.22]} visible={false}>
      <planeGeometry args={[3.4, 3.4]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

/* ===========================================================================
 * main scene
 * ========================================================================= */

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
      groupRef.current.rotation.y = Math.sin(performance.now() / 1500) * 0.06
    } else if (p < SPIN_END) {
      const spinT = (p - TEXTURE_END) / (SPIN_END - TEXTURE_END)
      groupRef.current.rotation.y = spinT * Math.PI * 2
    } else {
      groupRef.current.rotation.y = 0
    }
  })

  return (
    <group ref={groupRef} position={[0, yOffset, 0]}>
      {PARTS.map((p) => (
        <ScrollPart key={p.key} config={p} progress={progress} />
      ))}
      <CleanFinish progress={progress} />
      <EyesOverlay progress={progress} />
    </group>
  )
}

const PRELOAD_URLS = Array.from(new Set([...PARTS.map((p) => p.url), CLEAN_GLB_URL]))
PRELOAD_URLS.forEach((u) => useGLTF.preload(u))
