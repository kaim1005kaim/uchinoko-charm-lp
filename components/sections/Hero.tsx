import Image from 'next/image'

/**
 * ヒーロー: 青のストライプ背景 + 大きなロゴタイトル + 犬猫 4 アイコンの配置。
 * スマホでは縦長配置、PC では中央寄せの正方形ステージ。
 */
export function Hero() {
  return (
    <section className="bg-stripes relative flex min-h-[100dvh] items-center justify-center overflow-hidden text-white">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20">
        {/* 上の犬 + 猫 */}
        <div className="mb-6 flex w-full items-start justify-between md:mb-10">
          <Image
            src="/images/LINEUP_dog_A_icon.svg"
            alt="シュナウザー"
            width={140}
            height={140}
            className="h-20 w-20 drop-shadow-lg md:h-32 md:w-32"
            priority
          />
          <Image
            src="/images/LINEUP_dog_B_icon.svg"
            alt="柴犬"
            width={140}
            height={140}
            className="h-20 w-20 drop-shadow-lg md:h-32 md:w-32"
            priority
          />
        </div>

        {/* タイトル */}
        <h1 className="select-none text-center font-bold leading-[0.95] tracking-tight">
          <span className="block text-[clamp(3.5rem,12vw,8rem)]">うちのこ</span>
          <span className="mt-2 block text-[clamp(3.5rem,12vw,8rem)]">チャーム</span>
          <span className="mt-3 block text-[10px] font-medium tracking-[0.4em] opacity-90 md:text-xs">
            uchinoko charm
          </span>
        </h1>

        {/* 下の猫 */}
        <div className="mt-6 flex w-full items-end justify-between md:mt-10">
          <Image
            src="/images/LINEUP_cat_A_P1_icon.svg"
            alt="ねこ A"
            width={140}
            height={140}
            className="h-20 w-20 drop-shadow-lg md:h-32 md:w-32"
            priority
          />
          <Image
            src="/images/LINEUP_cat_A_P2_icon.svg"
            alt="ねこ B"
            width={140}
            height={140}
            className="h-20 w-20 drop-shadow-lg md:h-32 md:w-32"
            priority
          />
        </div>

        {/* スクロール促進 */}
        <div className="mt-14 flex flex-col items-center gap-1 text-[10px] tracking-[0.4em]">
          <span>scroll</span>
          <span className="scroll-indicator inline-block h-7 w-px bg-white/70" aria-hidden />
        </div>
      </div>
    </section>
  )
}
