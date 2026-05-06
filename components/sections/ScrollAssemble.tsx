'use client'

import { Environment, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { motion, type MotionValue, useScroll, useTransform } from 'framer-motion'
import { Suspense, useRef } from 'react'
import { AssemblyScene } from '@/components/three/AssemblyScene'

/**
 * 各 STEP の進捗ウィンドウ。AssemblyScene 内の PARTS の window と一致させて、
 * パーツが組み上がるタイミングと一緒にキャプションが切り替わるようにする。
 */
const STEPS = [
  {
    eyebrow: 'STEP 01',
    title: 'Face Base',
    sub: '輪郭となるベースから始まる',
    range: [0.0, 0.16],
  },
  {
    eyebrow: 'STEP 02',
    title: 'Ears',
    sub: 'ピンと立った耳が左右から',
    range: [0.16, 0.36],
  },
  {
    eyebrow: 'STEP 03',
    title: 'Nose',
    sub: '愛嬌のある鼻が手前から',
    range: [0.36, 0.55],
  },
  {
    eyebrow: 'STEP 04',
    title: 'Mouth',
    sub: 'やさしい口元で表情が宿る',
    range: [0.55, 0.72],
  },
  {
    eyebrow: 'STEP 05',
    title: 'Assembled',
    sub: '世界にひとつのうちのこ',
    range: [0.72, 1.0],
  },
] as const

/**
 * Apple 風スクロール演出: 縦長セクションを用意し、内部の 3D シーンを sticky で
 * 画面に固定したまま、スクロール進捗に応じてパーツが集合し、最後に 1 回転して止まる。
 * キャプションは各レイヤーごとに「線で繋がる」スタイリッシュなコールアウト風。
 */
export function ScrollAssemble() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={ref} className="relative h-[320vh] bg-white">
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        {/* 3D Canvas */}
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="absolute inset-0"
        >
          <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={32} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 5]} intensity={1.1} />
          <directionalLight position={[-4, -2, -3]} intensity={0.35} />
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <AssemblyScene progress={scrollYProgress} />
          </Suspense>
        </Canvas>

        <Captions progress={scrollYProgress} />
      </div>
    </section>
  )
}

/**
 * 右側に縦並びでステップを並べたコールアウト群。
 * モバイルは下端、デスクトップは右側に配置。
 */
function Captions({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-row flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 md:inset-y-0 md:right-0 md:bottom-auto md:left-auto md:flex-col md:items-start md:justify-center md:gap-y-9 md:px-0 md:pr-12"
    >
      {STEPS.map((s) => (
        <StepRow key={s.eyebrow} progress={progress} {...s} />
      ))}
    </div>
  )
}

/**
 * 1 ステップ。アクティブ時は不透明度 100% + 左に伸びるラインでパーツに繋がる。
 * 非アクティブ時はうっすら表示してタイムライン全体が見える状態を保つ。
 */
function StepRow({
  progress,
  eyebrow,
  title,
  sub,
  range,
}: {
  progress: MotionValue<number>
  eyebrow: string
  title: string
  sub: string
  range: readonly [number, number]
}) {
  const [r0, r1] = range
  const span = Math.max(0.001, r1 - r0)
  const clamp = (v: number) => Math.max(0, Math.min(1, v))
  const stops = [
    clamp(r0 - 0.04),
    clamp(r0 + span * 0.15),
    clamp(r1 - span * 0.15),
    clamp(r1 + 0.04),
  ]
  const opacity = useTransform(progress, stops, [0.18, 1, 1, 0.3])
  const lineScale = useTransform(progress, stops, [0, 1, 1, 0.55])

  return (
    <motion.div
      style={{ opacity }}
      className="flex items-center gap-3 text-brand-blue md:gap-4"
    >
      {/* 接続ライン (アクティブで右端から左へ伸びる) */}
      <motion.span
        aria-hidden
        style={{ scaleX: lineScale }}
        className="hidden h-px w-[80px] origin-right bg-brand-blue md:block md:w-[110px]"
      />
      <span
        aria-hidden
        className="hidden h-1.5 w-1.5 rounded-full bg-brand-blue md:block"
      />
      <div className="flex flex-col gap-0.5 leading-tight md:max-w-[200px] md:gap-1">
        <p className="text-[9px] tracking-[0.4em] opacity-70 md:text-[10px]">{eyebrow}</p>
        <h3 className="font-bold text-base uppercase leading-none tracking-wide md:text-xl">
          {title}
        </h3>
        <p className="hidden text-[11px] opacity-70 md:block">{sub}</p>
      </div>
    </motion.div>
  )
}
