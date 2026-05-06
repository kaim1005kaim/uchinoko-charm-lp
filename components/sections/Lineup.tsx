import Image from 'next/image'

const ICONS = [
  '/images/LINEUP_dog_A_icon.svg',
  '/images/LINEUP_dog_B_icon.svg',
  '/images/LINEUP_cat_A_P1_icon.svg',
  '/images/LINEUP_cat_A_P2_icon.svg',
] as const

/**
 * Line up: 黄背景。実装済みは 4 種なので、残りの 4 マスは
 * placeholder (薄い枠) で「もっと増えるよ」感を出す。
 */
export function Lineup() {
  // 4 種を 2 倍コピーしないように、表示は 4 + 4 placeholder
  return (
    <section className="bg-brand-yellow py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 text-center text-[10px] tracking-[0.4em] text-ink/60">Line up</p>
        <h2 className="mb-2 text-center font-bold text-xl md:text-2xl">
          うちのこは全部でイヌネコあわせて 40 種類
        </h2>
        <p className="mb-10 text-center font-bold text-2xl md:text-3xl">選び方は無限大！</p>

        <div className="grid grid-cols-4 gap-3 md:gap-5">
          {ICONS.map((src) => (
            <div
              key={src}
              className="flex aspect-square items-center justify-center rounded-2xl bg-white p-3 shadow-sm md:rounded-3xl md:p-5"
            >
              <Image src={src} alt="" aria-hidden width={120} height={120} />
            </div>
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder grid
              key={`placeholder-${i}`}
              aria-hidden
              className="aspect-square rounded-2xl bg-white/50 md:rounded-3xl"
            />
          ))}
        </div>

        <p className="mt-10 text-center font-medium text-sm leading-loose md:text-base">
          眉毛・目の大きさ、位置を調整して
          <br />
          愛犬・愛猫にそっくりな「うちのこ」をつくろう！
        </p>
      </div>
    </section>
  )
}
