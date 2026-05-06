import Image from 'next/image'

/**
 * About: ポエム調コピーで世界観を伝えるセクション。
 * 装飾用の猫 (LP_A) を上左、犬 (LP_B) を下右に浮かばせる。
 * テキストはすべてブランドブルー。
 */
export function About() {
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-36">
      <div className="relative mx-auto max-w-2xl px-6 text-center text-brand-blue">
        <p className="mb-12 text-[10px] tracking-[0.4em] text-brand-blue/70">about</p>

        {/* 装飾アイコン (左上の猫チャーム) */}
        <Image
          src="/images/LP_A.png"
          alt=""
          aria-hidden
          width={240}
          height={240}
          className="-top-12 md:-top-16 -left-2 md:-left-16 absolute h-24 w-24 md:h-36 md:w-36"
        />

        <p className="mb-12 font-bold text-lg leading-relaxed md:text-2xl">
          小さな特徴も、愛くるしい表情も。
          <br />
          あなたの「うちのこ」をかたちにする
          <br />
          世界にひとつのカスタムチャーム。
        </p>

        <div className="space-y-7 text-sm leading-loose md:text-base">
          <p>
            お店で探す、うちの子に「似た」ものではなく、
            <br />
            本当に持ち歩きたいのは、他の誰でもない「うちのこ」そのもの。
          </p>

          <p>
            毛色、耳のかたち、表情、模様、名前。
            <br />
            あなたが知っている小さな特徴をひとつずつ重ねながら、
            <br />
            大切な家族らしさをかたちにしていく。
          </p>

          <p>
            カバンに、鍵に、ポーチに。
            <br />
            いつもの日常に、ありそうでなかった“うちのこ”の特別席を。
          </p>

          <p className="font-bold">世界でひとつの愛おしさを、持ち歩こう。</p>
        </div>

        {/* 装飾アイコン (右下の犬チャーム) */}
        <Image
          src="/images/LP_B.png"
          alt=""
          aria-hidden
          width={260}
          height={260}
          className="-bottom-16 md:-bottom-20 -right-2 md:-right-16 absolute h-28 w-28 md:h-40 md:w-40"
        />
      </div>
    </section>
  )
}
