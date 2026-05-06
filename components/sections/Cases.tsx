import Image from 'next/image'

const CASES = [
  {
    no: '01',
    body: ['毎日のお散歩に', 'ペットと一緒に', '連れ出そう'],
    image: '/images/LP_CASE1.png',
  },
  {
    no: '02',
    body: ['傘の柄の部分に', '取り付ければ', '目印に早変わり'],
    image: '/images/LP_CASE2.jpg',
  },
  {
    no: '03',
    body: ['学校やお出かけも', 'うちのこがいれば', '毎日 HAPPY'],
    image: '/images/LP_CASE3.jpg',
  },
] as const

export function Cases() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 text-center text-[10px] tracking-[0.4em] text-ink/60">
          &quot;Uchinoko&quot; Life
        </p>
        <h2 className="mb-12 text-center font-bold text-2xl md:text-3xl">
          うちのこチャームがいる毎日
        </h2>

        <div className="space-y-6">
          {CASES.map((c) => (
            <article
              key={c.no}
              className="overflow-hidden rounded-[2rem] bg-brand-blue p-3 text-white shadow-lg md:p-4"
            >
              <div className="grid grid-cols-[1.6fr_1fr] items-center gap-3 md:gap-6">
                {/* 画像 — 角丸の写真 */}
                <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[1.4rem]">
                  <Image
                    src={c.image}
                    alt={`CASE ${c.no}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 360px, 60vw"
                  />
                </div>

                {/* テキスト */}
                <div className="flex flex-col gap-3 pr-3 md:pr-6">
                  <p className="font-bold text-brand-yellow text-xl tracking-wider md:text-2xl">
                    CASE {c.no}
                  </p>
                  <p className="text-sm leading-relaxed md:text-base">
                    {c.body.map((line, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static line break
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
