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
      <SummaryCard key={card.title} {...card} />
    ))}
  </section>
);

const SummaryCard = ({
  title,
  value,
  trendLabel,
  trendValue,
  trendPositive = true,
}: SummaryCardData) => (
  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <p className="text-sm text-slate-500">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    <div className="mt-4 flex items-center gap-2 text-xs font-medium">
      <span
        className={`flex items-center gap-1 rounded-full px-2 py-1 ${
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
);

export default SummaryCards;
