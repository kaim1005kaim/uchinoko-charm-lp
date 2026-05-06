import Image from 'next/image'

/**
 * シュナウザーがオーナーと一緒に写る生活感のあるフォトセクション。
 * 上下にやわらかい曲線で次のセクションと繋ぐ。
 */
export function PhotoSection() {
  return (
    <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[80vh]">
      <Image
        src="/images/LP_C.jpg"
        alt="シュナウザーと一緒の日常"
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />
      {/* 下端をホワイトの曲線でカット */}
      <div className="-bottom-px absolute inset-x-0 h-12 bg-white [mask-image:radial-gradient(ellipse_120%_100%_at_50%_100%,transparent_60%,black_60%)]" />
    </section>
  )
}
