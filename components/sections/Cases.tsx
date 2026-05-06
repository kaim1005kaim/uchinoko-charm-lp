import Image from 'next/image'

const CASES = [
  {
    no: '01',
    title: 'おさんぽに',
    body: '毎日のお散歩にペットと一緒に連れ出そう',
    image: '/images/LP_A.png',
  },
  {
    no: '02',
    title: 'ばんけんに',
    body: '傘の柄の部分に取り付ければ番犬に早変わり',
    image: '/images/LP_B.png',
  },
  {
    no: '03',
    title: 'おでかけに',
    body: '学校やお出かけもうちのこがいれば毎日 HAPPY',
    image: '/images/LP_CASE2.jpg',
  },
] as const

export function Cases() {
  return (
    <section className="bg-stripes py-20 text-white md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 text-center text-[10px] tracking-[0.4em] opacity-80">
          &quot;Uchinoko&quot; Life
        </p>
        <h2 className="mb-12 text-center font-bold text-2xl md:text-3xl">
          うちのこチャームがいる毎日
        </h2>

        <div className="space-y-5">
          {CASES.map((c) => (
            <article
              key={c.no}
              className="overflow-hidden rounded-3xl bg-white text-ink shadow-xl"
            >
              <div className="grid grid-cols-[140px_1fr] items-stretch md:grid-cols-[200px_1fr]">
                <div className="relative h-full min-h-[120px]">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 200px, 140px"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 p-5 md:p-7">
                  <p className="text-[10px] tracking-[0.4em] text-brand-blue">CASE {c.no}</p>
                  <h3 className="font-bold text-base md:text-lg">{c.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{c.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
