const HeroBrand = () => (
  <div className="flex items-center justify-between text-sm font-medium">
    <span className="text-lg font-semibold tracking-wide">AMU</span>
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-wide text-slate-100 backdrop-blur transition hover:bg-white/20"
    >
      Back to website
      <span aria-hidden>↗</span>
    </button>
  </div>
);

const HeroMessaging = () => (
  <div className="space-y-4 md:space-y-6">
    <p className="text-xs uppercase tracking-[0.4em] text-indigo-200/80 md:text-sm">SMART BUDGETING</p>
    <h2 className="text-3xl font-semibold leading-snug md:text-4xl md:leading-tight lg:text-5xl">
      画期的でシンプルな
      <br />
      家計簿からはじめよう
    </h2>
    <p className="text-sm text-indigo-100/80 md:max-w-xs">
      最初に提供するのは、カードをめくるだけで支出を整理できる次世代の家計簿。毎日の記録が自然と習慣化され、未来のプランニングがスムーズになります。
    </p>
  </div>
);

const HeroFooter = () => (
  <div className="flex items-center gap-3 text-xs text-indigo-100/70">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold">
      ¥0
    </span>
    <p className="max-w-[14rem]">
      自動分類と支出トレンドを毎朝フィードでお届け。貯蓄目標までの道のりが、ひと目で分かります。
    </p>
  </div>
);

export const MobileHero = () => (
  <div className="md:hidden">
    <div className="relative h-80 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-800 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.45),transparent_60%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between p-8 text-slate-100">
        <HeroBrand />
        <HeroMessaging />
        <HeroFooter />
      </div>
    </div>
  </div>
);

export const DesktopHero = () => (
  <div className="relative hidden flex-1 flex-col justify-between bg-gradient-to-br from-slate-800 via-indigo-800 to-slate-900 p-10 text-slate-100 md:flex">
    <HeroBrand />
    <HeroMessaging />
    <HeroFooter />
  </div>
);
