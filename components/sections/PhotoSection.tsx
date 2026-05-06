import Image from 'next/image'

/**
 * シュナウザーがオーナーと一緒に写る生活感のあるフォトセクション。
 * デザイン PDF に合わせて、写真の下端に白い角丸カードが重なるレイアウト。
 * 白カードは下に続く Cases セクション (背景白) と繋がって一体のパネルに見える。
 */
export function PhotoSection() {
  return (
    <section className="relative w-full">
      <div className="relative h-[58vh] min-h-[420px] w-full overflow-hidden md:h-[78vh]">
        <Image
          src="/images/LP_C.jpg"
          alt="シュナウザーと一緒の日常"
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />

        {/* 白い角丸カード — 写真下端に被さって、次セクションへとシームレスに繋がる */}
        <div className="absolute inset-x-0 bottom-0 h-16 rounded-t-[2.5rem] bg-white md:h-24 md:rounded-t-[4rem]" />
      </div>
    </section>
  )
}
