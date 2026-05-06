import Image from 'next/image'

/**
 * CTA: 工房写真 (LP_EC.png) を背景に「うちのこチャーム」のロゴと購入ボタン。
 * 現状 EC サイトは未公開のため、ボタンは無効化し下に「Coming Soon (準備中)」を表示する。
 */
export function CTA() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative h-[68vh] min-h-[480px] w-full md:h-[78vh]">
        <Image
          src="/images/LP_EC.png"
          alt=""
          aria-hidden
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority={false}
        />
        {/* CTA を読みやすくする暗めのオーバーレイ */}
        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center">
          <Image
            src="/images/LP_EC_LOGO.png"
            alt="うちのこチャーム"
            width={260}
            height={170}
            className="drop-shadow-lg"
          />

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex min-h-[60px] cursor-not-allowed items-center justify-center rounded-full bg-brand-blue px-10 font-bold text-base text-white shadow-2xl opacity-90 md:text-lg"
            >
              うちのこチャームのご購入はこちらから
            </button>
            <p className="font-bold text-[11px] text-white tracking-[0.3em] md:text-xs">
              COMING SOON / 準備中
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
