import Image from 'next/image'

/**
 * ヒーロー: デザイン PDF と一致させるため LP_top.png を全画面で表示。
 * 画像にはタイトル・チャーム写真・ストライプ背景がすでに含まれている。
 */
export function Hero() {
  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-brand-blue">
      <Image
        src="/images/LP_top.png"
        alt="うちのこチャーム"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-1 text-[10px] text-white tracking-[0.4em] md:bottom-10">
        <span>scroll</span>
        <span className="scroll-indicator inline-block h-7 w-px bg-white/70" aria-hidden />
      </div>
    </section>
  )
}
