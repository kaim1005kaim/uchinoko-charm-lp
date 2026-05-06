'use client'

import { Environment, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { motion, type MotionValue, useScroll, useTransform } from 'framer-motion'
import { Suspense, useRef } from 'react'
import { AssemblyScene } from '@/components/three/AssemblyScene'

/**
 * Apple 風スクロール演出: 4 倍の縦長セクションを用意し、内部の 3D シーンを
 * sticky で画面に固定したまま、スクロール進捗に応じてパーツが集合して
 * 最後に回転する。
 */
export function ScrollAssemble() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={ref} className="relative h-[400vh] bg-white">
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        {/* 3D Canvas */}
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="absolute inset-0"
        >
          <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={32} />
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[4, 6, 5]}
            intensity={1.1}
            castShadow={false}
          />
          <directionalLight position={[-4, -2, -3]} intensity={0.35} />
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <AssemblyScene progress={scrollYProgress} />
          </Suspense>
        </Canvas>

        {/* テキストオーバーレイ: スクロール進捗で切替 */}
        <Captions progress={scrollYProgress} />
      </div>
    </section>
  )
}

/**
 * 進捗に応じて 4 つのキャプションを切り替えるオーバーレイ。
 * Apple 風に、左右の余白に控えめに配置。
 */
function Captions({ progress }: { progress: MotionValue<number> }) {
  const captions = [
    {
      eyebrow: 'STEP 01',
      title: 'すべてのパーツを、ひとつに。',
      sub: 'face base / ears / nose / mouth — 5 つのパーツが集まって、ひとつの「うちのこ」になる。',
      window: [0.0, 0.25],
    },
    {
      eyebrow: 'STEP 02',
      title: '耳のかたちで、表情が変わる。',
      sub: 'ピンと立った耳、垂れた耳。あなたの「うちのこ」に合わせて選ぶ。',
      window: [0.25, 0.55],
    },
    {
      eyebrow: 'STEP 03',
      title: '鼻と口で、らしさが宿る。',
      sub: '小さなディテールが、世界にひとつの愛おしさをかたちにする。',
      window: [0.55, 0.85],
    },
    {
      eyebrow: 'STEP 04',
      title: 'いつでも持ち歩ける、特別。',
      sub: 'カバンや鍵に、あなたの「うちのこ」を。',
      window: [0.85, 1.0],
    },
  ] as const

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end pb-16 md:items-center md:justify-end md:pb-0 md:pr-12">
      <div className="relative mx-auto h-32 w-full max-w-md px-6 md:mx-0 md:max-w-sm">
        {captions.map((c) => (
          <Caption key={c.eyebrow} progress={progress} {...c} />
        ))}
      </div>
    </div>
  )
}

function Caption({
  progress,
  eyebrow,
  title,
  sub,
  window,
}: {
  progress: MotionValue<number>
  eyebrow: string
  title: string
  sub: string
  window: readonly [number, number]
}) {
  const [w0, w1] = window
  const fadeIn = w1 - w0
  // framer-motion / Element.animate は offsets が [0, 1] に正規化される必要が
  // あるので、境界外を含む 4 点をすべて clamp しておく。
  const clamp = (v: number) => Math.max(0, Math.min(1, v))
  const stops = [
    clamp(w0 - 0.02),
    clamp(w0 + fadeIn * 0.15),
    clamp(w1 - fadeIn * 0.15),
    clamp(w1 + 0.02),
  ]
  const opacity = useTransform(progress, stops, [0, 1, 1, 0])
  const y = useTransform(progress, stops, [16, 0, 0, -16])

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center gap-3"
    >
      <p className="text-[10px] tracking-[0.4em] text-brand-blue/80">{eyebrow}</p>
      <h3 className="font-bold text-2xl leading-tight md:text-3xl">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{sub}</p>
    </motion.div>
  )
}
