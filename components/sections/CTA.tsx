import Image from 'next/image'

export function CTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[42vh] min-h-[320px] w-full">
        <Image
          src="/images/LP_top.png"
          alt=""
          aria-hidden
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* 暗めのオーバーレイで CTA を読みやすく */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6">
        <Image
          src="/images/LP_EC_LOGO.png"
          alt="うちのこチャーム"
          width={220}
          height={140}
          className="drop-shadow-lg"
        />

        <a
          href="#"
          className="inline-flex min-h-[60px] items-center justify-center gap-3 rounded-full bg-brand-blue px-10 font-bold text-base text-white shadow-2xl transition hover:bg-brand-blue-dark active:scale-95 md:text-lg"
        >
          うちのこチャームのご購入はこちらから
        </a>
        <p className="text-[11px] text-white/80">EC サイトへ移動します</p>
      </div>
    </section>
  )
}
