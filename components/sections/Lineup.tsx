import Image from 'next/image'

const ICONS = [
  '/images/LINEUP_dog_A_icon.svg',
  '/images/LINEUP_dog_B_icon.svg',
  '/images/LINEUP_cat_A_P1_icon.svg',
  '/images/LINEUP_cat_A_P2_icon.svg',
] as const

/**
 * Line up: 黄背景 + ブランドブルーの見出し。
 * - デスクトップ: 5 列 × 2 行 = 10 マス (デザイン PDF 準拠)
 * - モバイル: 4 列 × 2 行 = 8 マス (タップしやすいサイズ確保)
 */
export function Lineup() {
  return (
    <section className="bg-brand-yellow py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6 text-brand-blue">
        <p className="mb-3 text-center text-[10px] text-brand-blue/70 tracking-[0.4em]">
          Line up
        </p>
        <h2 className="mb-2 text-center font-bold text-base leading-snug md:text-2xl">
          うちのこは全部でイヌネコあわせて 40 種類
        </h2>
        <p className="mb-10 text-center font-bold text-2xl md:mb-12 md:text-3xl">
          選び方は無限大！
        </p>

        {/* モバイル: 4 列 × 2 行 (8 マス)、デスクトップ: 5 列 × 2 行 (10 マス) */}
        <div className="grid grid-cols-4 gap-3 md:grid-cols-5 md:gap-5">
          {ICONS.map((src) => (
            <div
              key={src}
              className="flex aspect-square items-center justify-center rounded-2xl bg-white p-3 shadow-sm md:rounded-3xl md:p-5"
            >
              <Image src={src} alt="" aria-hidden width={120} height={120} />
            </div>
          ))}
          {/* モバイルは 4 マス placeholder、デスクトップは 6 マス必要 */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder grid
              key={`placeholder-${i}`}
              aria-hidden
              className={`aspect-square rounded-2xl bg-white md:rounded-3xl ${
                i >= 4 ? 'hidden md:block' : ''
              }`}
            />
          ))}
        </div>

        <p className="mt-10 text-center font-bold text-xs leading-loose md:mt-12 md:text-base">
          眉毛・目の大きさ、位置を調整して愛犬・愛猫にそっくりな「うちのこ」をつくろう！
        </p>
      </div>
    </section>
  )
}
