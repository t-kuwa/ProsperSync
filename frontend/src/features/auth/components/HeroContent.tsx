const HeroBrand = () => (
  <div className="flex items-center justify-between text-sm font-medium md:text-base lg:text-lg">
    <span className="text-lg font-semibold tracking-wide md:text-xl lg:text-2xl">Haruve</span>
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs uppercase tracking-wide text-slate-100 backdrop-blur transition hover:bg-white/20 md:px-4 md:py-2 md:text-sm"
    >
      Back to website
      <span aria-hidden>↗</span>
    </button>
  </div>
);

const HeroMessaging = () => (
  <div className="space-y-4 md:space-y-5 lg:space-y-6">
    <p className="text-xs uppercase tracking-[0.4em] text-indigo-200/80 md:text-xs lg:text-sm">SMART BUDGETING</p>
    <h2 className="text-3xl font-semibold leading-normal md:text-3xl md:leading-relaxed lg:text-4xl xl:text-5xl">
      画期的でシンプルな
      <br />
      家計簿からはじめよう
    </h2>
    <p className="text-sm text-indigo-100/80 md:text-sm md:max-w-xs lg:text-base lg:max-w-sm">
      最初に提供するのは、カードをめくるだけで支出を整理できる次世代の家計簿。毎日の記録が自然と習慣化され、未来のプランニングがスムーズになります。
    </p>
  </div>
);

const HeroFooter = () => (
  <div className="flex items-center gap-3 text-xs text-indigo-100/70 md:text-xs lg:text-sm">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold text-2xl md:h-12 md:w-12 md:text-3xl">
      ¥0
    </span>
    <p className="max-w-[14rem] md:max-w-[16rem] lg:max-w-[18rem]">
      自動分類と支出トレンドを毎朝フィードでお届け。貯蓄目標までの道のりが、ひと目で分かります。
    </p>
  </div>
);

export const MobileHero = () => (
  <div className="relative md:hidden pb-24 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-800 to-slate-900" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.45),transparent_60%)]" />
    <div className="relative z-10 h-[500px] flex flex-col justify-between p-8 text-slate-100">
      <HeroBrand />
      <HeroMessaging />
      <HeroFooter />
    </div>
  </div>
);

export const DesktopHero = () => (
  <div className="relative hidden flex-1 flex-col justify-between bg-gradient-to-br from-slate-800 via-indigo-800 to-slate-900 p-6 text-slate-100 md:flex md:p-8 lg:p-10 xl:p-12">
    <HeroBrand />
    <HeroMessaging />
    <HeroFooter />
  </div>
);
