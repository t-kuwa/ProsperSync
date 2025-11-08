import NebulaCanvas from "./NebulaCanvas";

const HeroStars = () => (
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f4a] via-[#111433] to-[#050813]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,148,255,0.45),transparent_55%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(56,115,255,0.35),transparent_55%)]" />
    <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(213,227,255,0.85),rgba(91,112,255,0.35)_55%,transparent_70%)] blur-sm" />
    <div className="absolute left-1/4 top-1/3 h-2 w-2 rounded-full bg-slate-100/80 shadow-[0_0_12px_rgba(148,163,255,0.6)]" />
    <div className="absolute left-10 top-1/4 h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_10px_rgba(148,163,255,0.45)]" />
    <div className="absolute right-12 bottom-24 h-1.5 w-1.5 rounded-full bg-white/60 shadow-[0_0_10px_rgba(148,163,255,0.45)]" />
  </div>
);

const HeroCopy = () => (
  <div className="space-y-6 text-indigo-100">
    <div className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-200/70">
      Night finance
    </div>
    <h2 className="text-3xl font-semibold leading-snug sm:text-4xl">
      静かな夜に、
      <br />
      新しいアイデアを描こう
    </h2>
    <p className="max-w-md text-sm leading-relaxed text-indigo-100/80 sm:text-base">
      Haruveは、チームで共有できる家計の作業スペース。月の変化や支出の兆しを美しく可視化し、次の一歩を後押しします。
    </p>
  </div>
);

const HeroFooter = () => (
  <div className="flex items-center gap-4 text-xs text-indigo-100/80 sm:text-sm">
    <div className="flex flex-col">
      <span className="text-lg font-semibold text-white sm:text-xl">+42%</span>
      <span className="text-indigo-200/70">貯蓄プラン達成率</span>
    </div>
    <div className="h-12 w-px bg-white/20" />
    <p className="max-w-[13rem] sm:max-w-[16rem]">
      スマートな通知で、寝ている間もチームの支出状況を把握。明日のアクションがすぐに見えてきます。
    </p>
  </div>
);

export const MobileHero = () => (
  <div className="relative flex h-72 w-full items-end overflow-hidden rounded-b-[2.5rem] bg-slate-900/80 px-8 pb-10 pt-8 text-slate-100 shadow-[inset_0_-80px_120px_rgba(5,8,19,0.8)] lg:hidden">
    <HeroStars />
    <div className="relative z-10 space-y-6">
      <HeroCopy />
      <HeroFooter />
    </div>
  </div>
);

export const DesktopHero = () => (
  <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[#050813] px-14 py-16 text-indigo-100 lg:flex">
    <NebulaCanvas />
    <div className="relative z-10 flex flex-1 flex-col justify-between gap-20">
      <div className="flex items-center justify-between text-sm text-indigo-100/70">
        <span className="text-base font-medium tracking-wide">Haruve Moonlight</span>
        <span className="rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-indigo-100/80">
          Explore more
        </span>
      </div>
      <HeroCopy />
      <HeroFooter />
    </div>
  </aside>
);
