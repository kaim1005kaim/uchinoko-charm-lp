import Image from 'next/image'

/**
 * ヒーロー:
 * - デスクトップ: デザイン済み LP_top.png を全画面で表示
 * - モバイル: 画像が wide すぎて切れるので、青ストライプ背景 + チャーム
 *   アイコン 4 種 + 大きなテキストロゴで再構成する
 */
export function Hero() {
  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-brand-blue">
      {/* デスクトップ: 合成済みヒーロー画像 */}
      <Image
        src="/images/LP_top.png"
        alt="うちのこチャーム"
        fill
        priority
        className="hidden object-cover object-center md:block"
        sizes="100vw"
      />

      {/* モバイル: ストライプ背景 + 4 アイコン + テキスト */}
      <div className="bg-stripes relative flex min-h-[100dvh] w-full flex-col items-center justify-between px-6 py-16 text-white md:hidden">
        {/* 上の犬 2 種 */}
        <div className="flex w-full items-start justify-between">
          <Image
            src="/images/LINEUP_dog_A_icon.svg"
            alt="シュナウザー"
            width={140}
            height={140}
            className="h-24 w-24 drop-shadow-lg"
            priority
          />
          <Image
            src="/images/LINEUP_dog_B_icon.svg"
            alt="柴犬"
            width={140}
            height={140}
            className="h-24 w-24 drop-shadow-lg"
            priority
          />
        </div>

        {/* タイトル (ロゴ画像) */}
        <Image
          src="/images/LP_EC_LOGO.png"
          alt="うちのこチャーム"
          width={420}
          height={280}
          className="h-auto w-[240px] drop-shadow-lg"
          priority
        />

        {/* 下の猫 2 種 */}
        <div className="flex w-full items-end justify-between">
          <Image
            src="/images/LINEUP_cat_A_P1_icon.svg"
            alt="ねこ A"
            width={140}
            height={140}
            className="h-24 w-24 drop-shadow-lg"
            priority
          />
          <Image
            src="/images/LINEUP_cat_A_P2_icon.svg"
            alt="ねこ B"
            width={140}
            height={140}
            className="h-24 w-24 drop-shadow-lg"
            priority
          />
        </div>
      </div>

      {/* スクロール促進 (デスクトップ用) */}
      <div className="absolute inset-x-0 bottom-6 hidden flex-col items-center gap-1 text-[10px] text-white tracking-[0.4em] md:flex md:bottom-10">
        <span>scroll</span>
        <span className="scroll-indicator inline-block h-7 w-px bg-white/70" aria-hidden />
      </div>
    </section>
  )
}
