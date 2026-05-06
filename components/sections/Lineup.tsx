import Image from 'next/image'

const ICONS = [
  '/images/LINEUP_dog_A_icon.svg',
  '/images/LINEUP_dog_B_icon.svg',
  '/images/LINEUP_cat_A_P1_icon.svg',
  '/images/LINEUP_cat_A_P2_icon.svg',
] as const

/**
 * Line up: 黄背景 + ブランドブルーの見出し。
 * デザイン PDF に合わせて 5 列 × 2 行 のグリッド (= 10 マス)。
 */
export function Lineup() {
  const placeholderCount = 10 - ICONS.length

  return (
    <section className="bg-brand-yellow py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6 text-brand-blue">
        <p className="mb-3 text-center text-[10px] text-brand-blue/70 tracking-[0.4em]">
          Line up
        </p>
        <h2 className="mb-2 text-center font-bold text-xl md:text-2xl">
          うちのこは全部でイヌネコあわせて 40 種類
        </h2>
        <p className="mb-12 text-center font-bold text-2xl md:text-3xl">選び方は無限大！</p>

        <div className="grid grid-cols-5 gap-3 md:gap-5">
          {ICONS.map((src) => (
            <div
              key={src}
              className="flex aspect-square items-center justify-center rounded-2xl bg-white p-3 shadow-sm md:rounded-3xl md:p-5"
            >
              <Image src={src} alt="" aria-hidden width={120} height={120} />
            </div>
          ))}
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder grid
              key={`placeholder-${i}`}
              aria-hidden
              className="aspect-square rounded-2xl bg-white md:rounded-3xl"
            />
          ))}
        </div>

        <p className="mt-12 text-center font-bold text-sm leading-loose md:text-base">
          眉毛・目の大きさ、位置を調整して愛犬・愛猫にそっくりな「うちのこ」をつくろう！
        </p>
      </div>
    </section>
  )
}
