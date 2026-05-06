import Image from 'next/image'

/**
 * About: ポエム調コピーで世界観を伝えるセクション。
 * 装飾用の犬・猫アイコンを浮かばせる。
 */
export function About() {
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="mb-10 text-[10px] tracking-[0.4em] text-brand-blue/80">about</p>

        {/* 装飾アイコン (上) */}
        <Image
          src="/images/LINEUP_cat_A_P1_icon.svg"
          alt=""
          aria-hidden
          width={120}
          height={120}
          className="-top-12 absolute left-[8%] hidden h-20 w-20 rotate-[-12deg] md:block"
        />

        <p className="mb-8 font-bold text-lg leading-relaxed md:text-xl">
          小さな特徴も、愛くるしい表情も。
          <br />
          あなたの「うちのこ」をかたちにする
          <br />
          世界にひとつのカスタムチャーム。
        </p>

        <div className="space-y-6 text-sm leading-loose md:text-base">
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

        {/* 装飾アイコン (下) */}
        <Image
          src="/images/LINEUP_dog_A_icon.svg"
          alt=""
          aria-hidden
          width={140}
          height={140}
          className="-bottom-10 absolute right-[6%] hidden h-24 w-24 rotate-[8deg] md:block"
        />
      </div>
    </section>
  )
}
