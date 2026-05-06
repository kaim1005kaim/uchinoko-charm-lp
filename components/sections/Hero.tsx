import Image from 'next/image'

/**
 * ヒーロー: モバイル / デスクトップそれぞれに合わせた合成画像を全画面で表示。
 * - デスクトップ: LP_top.png (横長)
 * - モバイル: LP_top_mobile.png (縦長)
 */
export function Hero() {
  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-brand-blue">
      {/* デスクトップ */}
      <Image
        src="/images/LP_top.png"
        alt="うちのこチャーム"
        fill
        priority
        className="hidden object-cover object-center md:block"
        sizes="100vw"
      />
      {/* モバイル */}
      <Image
        src="/images/LP_top_mobile.png"
        alt="うちのこチャーム"
        fill
        priority
        className="object-cover object-center md:hidden"
        sizes="100vw"
      />

      {/* スクロール促進 (デスクトップのみ。モバイルはタイトル含めて画像内に揃っている) */}
      <div className="absolute inset-x-0 bottom-6 hidden flex-col items-center gap-1 text-[10px] text-white tracking-[0.4em] md:bottom-10 md:flex">
        <span>scroll</span>
        <span className="scroll-indicator inline-block h-7 w-px bg-white/70" aria-hidden />
      </div>
    </section>
  )
}
