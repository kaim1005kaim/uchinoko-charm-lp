import Image from 'next/image'

/**
 * モバイル: 8 種 (オリジナル 4 種 + 色違い 4 種) で 4×2 グリッドを完全に埋める
 * デスクトップ: さらに v3 を 2 種追加して 5×2 = 10 マスを埋める
 */
const ICONS = [
  '/images/LINEUP_dog_A_icon.svg',
  '/images/LINEUP_cat_A_P1_icon_v2.svg',
  '/images/LINEUP_dog_B_icon_v2.svg',
  '/images/LINEUP_cat_A_P2_icon.svg',
  '/images/LINEUP_cat_A_P1_icon.svg',
  '/images/LINEUP_dog_A_icon_v2.svg',
  '/images/LINEUP_cat_A_P2_icon_v2.svg',
  '/images/LINEUP_dog_B_icon.svg',
] as const

/** デスクトップでのみ追加表示する 2 種 (v3 = 別カラー) */
const ICONS_DESKTOP_EXTRA = [
  '/images/LINEUP_dog_A_icon_v3.svg',
  '/images/LINEUP_cat_A_P1_icon_v3.svg',
] as const

/**
 * Line up: 黄背景 + ブランドブルーの見出し。
 * - デスクトップ: 5 列 × 2 行 = 10 マス (8 アイコン + 2 placeholder)
 * - モバイル: 4 列 × 2 行 = 8 マス (タップしやすいサイズ確保)
 */
export function Lineup() {
  return (
    <section className="bg-brand-yellow py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6 text-brand-blue">
        <p className="mb-3 text-center text-[10px] text-brand-blue/70 tracking-[0.4em]">
          Line up
        </p>
        <h2 className="mb-3 text-center font-bold text-lg leading-snug md:mb-2 md:text-2xl">
          組み合わせ無限大！
        </h2>
        <p className="mb-10 text-center font-bold text-xl leading-snug md:mb-12 md:text-3xl">
          世界でひとつの
          <br className="md:hidden" />
          「うちのこ」をつくろう
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
          {/* デスクトップ追加 2 種 (モバイルでは非表示) */}
          {ICONS_DESKTOP_EXTRA.map((src) => (
            <div
              key={src}
              className="hidden aspect-square items-center justify-center rounded-3xl bg-white p-5 shadow-sm md:flex"
            >
              <Image src={src} alt="" aria-hidden width={120} height={120} />
            </div>
          ))}
        </div>

        <p className="mt-10 text-center font-bold text-sm leading-relaxed md:mt-12 md:text-base md:leading-loose">
          アプリで眉毛と目を調整して、
          <br className="md:hidden" />
          お好みのパーツを選ぶだけ！
        </p>
      </div>
    </section>
  )
}
