import Image from 'next/image'

const CASES = [
  {
    no: '01',
    body: ['毎日のお散歩に', 'ペットと一緒に', '連れ出そう'],
    image: '/images/LP_CASE1.png',
    /** object-position: 写真の中で見せたい箇所 */
    position: 'center',
  },
  {
    no: '02',
    body: ['傘の柄の部分に', '取り付ければ', '番犬に早変わり'],
    image: '/images/LP_CASE2.jpg',
    position: 'center',
  },
  {
    no: '03',
    body: ['学校やお出かけも', 'うちのこがいれば', 'きっと楽しい'],
    image: '/images/LP_CASE3.jpg',
    /** 人物を切り落とし、ランドセル + チャーム部分のみ見せる */
    position: '100% center',
  },
] as const

export function Cases() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-3 text-center text-[10px] text-brand-blue/70 tracking-[0.4em]">
          &quot;Uchinoko&quot; Life
        </p>
        <h2 className="mb-12 text-center font-bold text-xl text-brand-blue md:text-3xl">
          うちのこチャームがいる毎日
        </h2>

        <div className="space-y-6 md:space-y-8">
          {CASES.map((c) => (
            <article
              key={c.no}
              className="overflow-hidden rounded-[2rem] bg-brand-blue p-3 text-white shadow-lg md:rounded-[2.5rem] md:p-5"
            >
              <div className="grid grid-cols-[1.5fr_1fr] items-center gap-3 md:gap-6">
                {/* 画像 — 角丸の写真 */}
                <div
                  className={`relative w-full overflow-hidden rounded-[1.2rem] md:rounded-[1.8rem] ${
                    c.no === '03' ? 'aspect-square md:aspect-[5/3.4]' : 'aspect-[5/3.4]'
                  }`}
                >
                  <Image
                    src={c.image}
                    alt={`CASE ${c.no}`}
                    fill
                    className="object-cover"
                    style={{ objectPosition: c.position }}
                    sizes="(min-width: 768px) 380px, 55vw"
                  />
                </div>

                {/* テキスト */}
                <div className="flex flex-col gap-2 pr-2 md:gap-3 md:pr-6">
                  <p className="font-bold text-base text-brand-yellow tracking-wider md:text-2xl">
                    CASE {c.no}
                  </p>
                  <p className="text-[11px] leading-relaxed md:text-base">
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
