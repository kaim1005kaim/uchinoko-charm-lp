'use client'

import { Environment, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion'
import { type CSSProperties, Suspense, useEffect, useRef, useState } from 'react'
import { AssemblyScene } from '@/components/three/AssemblyScene'

/**
 * 各 STEP の進捗ウィンドウ + 表示位置。AssemblyScene 内 PARTS の window と一致。
 *
 * style.desktop は 3D パーツのおよその画面位置 (model 中心 = 50% 50%) に
 * 寄せて配置し、line がパーツに向かって伸びるように見せる。
 *
 * 0.0 → 0.58 でアセンブル / 0.58 → 0.78 で 1 回転 / 0.78 → 1.0 は静止保持
 */
/**
 * デスクトップでの絶対位置 (3D の各パーツの画面上の位置に合わせる)。
 * 顔は中央に大きく配置されるので、キャプションは右側に縦並び:
 *   ears (上) → eyes & brows (上中) → face base (中) → nose (中下) → mouth (下)
 * NOSE のみ顔中央の鼻まで線を伸ばすため lineWidth を長く。
 */
const STEPS = [
  {
    eyebrow: 'STEP 02',
    title: 'Ears',
    sub: 'ピンと立った耳が左右から',
    range: [0.1, 0.25],
    style: { top: '20%', right: '8%' },
    lineWidth: 100,
  },
  {
    eyebrow: 'STEP 05',
    title: 'Eyes & Brows',
    sub: '眉と目が宿って完成',
    range: [0.42, 0.78],
    style: { top: '38%', right: '8%' },
    lineWidth: 100,
  },
  {
    eyebrow: 'STEP 01',
    title: 'Face Base',
    sub: '輪郭となるベースから始まる',
    range: [0.0, 0.1],
    style: { top: '52%', right: '8%' },
    lineWidth: 100,
  },
  {
    eyebrow: 'STEP 03',
    title: 'Nose',
    sub: '愛嬌のある鼻が手前から',
    range: [0.22, 0.33],
    // 顔の中央 (鼻) まで線を引きたいので右端寄せ + 長い線
    style: { top: '66%', right: '8%' },
    lineWidth: 380,
  },
  {
    eyebrow: 'STEP 04',
    title: 'Mouth',
    sub: 'やさしい口元が下から',
    range: [0.32, 0.42],
    style: { top: '80%', right: '8%' },
    lineWidth: 100,
  },
] as const

/**
 * Apple 風スクロール演出: 縦長セクション (380vh) で内部 3D シーンを sticky 固定。
 * 進捗 0→0.58 でパーツが集合 → 0.58→0.78 で 1 回転 → 0.78→1.0 は静止保持。
 * 静止保持中は完成形をじっくり眺められる余白として機能する。
 *
 * キャプションは各レイヤーの 3D 位置に合わせて配置、ホバーで濃色 + 拡大。
 */
export function ScrollAssemble() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  // モバイルではカメラを引いて model 全体 (耳まで) が画面に余裕で収まるようにする。
  // yOffset でモバイルはモデルを上に寄せて、下半分にキャプションを置く。
  const [cameraZ, setCameraZ] = useState(7)
  const [yOffset, setYOffset] = useState(0)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const apply = () => {
      setCameraZ(mql.matches ? 14 : 7)
      setYOffset(mql.matches ? 1.8 : 0)
    }
    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [])

  return (
    <section ref={ref} className="relative h-[380vh] bg-white">
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden">
        {/* 3D Canvas */}
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="absolute inset-0"
        >
          <PerspectiveCamera makeDefault position={[0, 0, cameraZ]} fov={32} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 5]} intensity={1.1} />
          <directionalLight position={[-4, -2, -3]} intensity={0.35} />
          <Suspense fallback={null}>
            <Environment preset="studio" />
            <AssemblyScene progress={scrollYProgress} yOffset={yOffset} />
          </Suspense>
        </Canvas>

        <Captions progress={scrollYProgress} />
      </div>
    </section>
  )
}

function Captions({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      {/* デスクトップ: 各パーツ位置に絶対配置 */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {STEPS.map((s) => (
          <StepRow key={s.eyebrow} progress={progress} variant="desktop" {...s} />
        ))}
      </div>
      {/* モバイル: モデル直下に横並び (yOffset でモデルが上寄せなのに合わせて) */}
      <div className="pointer-events-none absolute inset-x-0 top-[52%] flex flex-row flex-wrap items-start justify-center gap-x-5 gap-y-3 px-4 md:hidden">
        {STEPS.map((s) => (
          <StepRow key={s.eyebrow} progress={progress} variant="mobile" {...s} />
        ))}
      </div>
    </>
  )
}

/**
 * 1 ステップ。アクティブ時は不透明度 100% + 接続ラインがパーツへ伸びる。
 * ホバー: scale 110% + 文字を brand-blue-dark に。
 */
function StepRow({
  progress,
  eyebrow,
  title,
  sub,
  range,
  style,
  variant,
  lineWidth = 100,
}: {
  progress: MotionValue<number>
  eyebrow: string
  title: string
  sub: string
  range: readonly [number, number]
  style: { top?: string; right?: string; bottom?: string; left?: string }
  variant: 'desktop' | 'mobile'
  lineWidth?: number
}) {
  const [r0, r1] = range
  const [p, setP] = useState(progress.get())
  useMotionValueEvent(progress, 'change', setP)

  // 各 step の opacity / lineScale を素直に分岐で計算する
  // (useTransform の挙動が安定しないので直接購読方式に切替)
  const fadeIn = 0.04
  const fadeOut = 0.05
  let opacity: number
  let lineScale: number
  if (p < r0 - fadeIn) {
    opacity = 0.18
    lineScale = 0
  } else if (p < r0) {
    const t = (p - (r0 - fadeIn)) / fadeIn
    opacity = 0.18 + (1 - 0.18) * t
    lineScale = t
  } else if (p < r1) {
    opacity = 1
    lineScale = 1
  } else if (p < r1 + fadeOut) {
    const t = (p - r1) / fadeOut
    opacity = 1 - (1 - 0.5) * t
    lineScale = 1 - (1 - 0.55) * t
  } else {
    opacity = 0.5
    lineScale = 0.55
  }

  if (variant === 'mobile') {
    return (
      <motion.div
        style={{ opacity }}
        className="group pointer-events-auto flex cursor-default items-center gap-2 text-brand-blue transition-transform duration-200 ease-out hover:scale-110"
      >
        <span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full bg-brand-blue transition-colors duration-200 group-hover:bg-brand-blue-dark"
        />
        <div className="flex flex-col leading-tight transition-colors duration-200 group-hover:text-brand-blue-dark">
          <p className="text-[9px] tracking-[0.4em] opacity-70">{eyebrow}</p>
          <h3 className="font-bold text-base uppercase leading-none tracking-wide">
            {title}
          </h3>
        </div>
      </motion.div>
    )
  }

  // desktop: 絶対配置 + 縦中央寄せ + 接続ライン
  return (
    <motion.div
      style={{ opacity, ...(style as CSSProperties) }}
      className="group pointer-events-auto absolute flex -translate-y-1/2 cursor-default items-center gap-3 text-brand-blue transition-transform duration-200 ease-out hover:scale-110"
    >
      {/* パーツへ伸びる接続ライン (NOSE などは長くする) */}
      <span
        aria-hidden
        style={{ transform: `scaleX(${lineScale})`, width: `${lineWidth}px` }}
        className="block h-px origin-right bg-brand-blue transition-transform duration-300 ease-out group-hover:bg-brand-blue-dark"
      />
      <span
        aria-hidden
        className="block h-1.5 w-1.5 rounded-full bg-brand-blue transition-colors duration-200 group-hover:bg-brand-blue-dark"
      />
      <div className="flex max-w-[180px] flex-col gap-1 leading-tight transition-colors duration-200 group-hover:text-brand-blue-dark">
        <p className="text-[10px] tracking-[0.4em] opacity-80">{eyebrow}</p>
        <h3 className="font-bold text-xl uppercase leading-none tracking-wide">
          {title}
        </h3>
        <p className="text-[11px] opacity-70">{sub}</p>
      </div>
    </motion.div>
  )
}
