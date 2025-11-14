export type SummaryCardData = {
  title: string;
  value: string;
  trendLabel: string;
  trendValue: string;
  trendPositive?: boolean;
};

type SummaryCardsProps = {
  cards: SummaryCardData[];
};

const SummaryCards = ({ cards }: SummaryCardsProps) => (
  <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map((card) => (
      <SummaryCard
        key={card.title}
        emphasize={card.title.includes("キャッシュフロー")}
        {...card}
      />
    ))}
  </section>
);

type SummaryCardProps = SummaryCardData & {
  emphasize?: boolean;
};

const SummaryCard = ({
  title,
  value,
  trendLabel,
  trendValue,
  trendPositive = true,
  emphasize = false,
}: SummaryCardProps) => (
  emphasize ? (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-400 p-6 text-white shadow-lg shadow-slate-900/10 ring-1 ring-white/20">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
      <p className="text-sm font-medium text-white/90">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/80">
        <span className="flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-2 py-1 backdrop-blur-[2px]">
          <span className={`text-lg leading-none ${trendPositive ? "" : "rotate-180"}`}>▲</span>
          {trendValue}
        </span>
        <span>{trendLabel}</span>
      </div>
    </div>
  ) : (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 text-slate-900 shadow-lg shadow-slate-900/5 ring-1 ring-white/60">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/30 blur-3xl" />
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-1 shadow-inner ${
            trendPositive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {trendPositive ? "▲" : "▼"}
          {trendValue}
        </span>
        <span className="text-slate-500">{trendLabel}</span>
      </div>
    </div>
  )
);

export default SummaryCards;
