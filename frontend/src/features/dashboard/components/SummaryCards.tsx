import { Card } from "../../../components/ui/Card";

export type SummaryCardData = {
  title: string;
  value: string;
  trendLabel: string;
  trendValue: string;
  trendPositive?: boolean;
  emphasize?: boolean;
};

type SummaryCardsProps = {
  cards: SummaryCardData[];
};

const SummaryCards = ({ cards }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(
        ({ title, value, trendLabel, trendValue, trendPositive, emphasize }) =>
          emphasize ? (
            <Card key={title} className="p-6 bg-ai-gradient text-white shadow-ai-glow border-none relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 animate-pulse-glow" />
              <div className="relative z-10">
                <p className="text-sm font-medium opacity-90">{title}</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">{value}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-medium opacity-90">
                  <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-md">
                    <span className={`text-sm ${trendPositive ? "" : "rotate-180"}`}>▲</span>
                    {trendValue}
                  </span>
                  <span>{trendLabel}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card key={title} variant="ai" className="p-6 hover:shadow-ai-glow transition-shadow duration-300">
              <p className="text-sm font-medium text-text-secondary">{title}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">{value}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${
                    trendPositive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span className="text-xs">{trendPositive ? "▲" : "▼"}</span>
                  {trendValue}
                </span>
                <span className="text-text-secondary">{trendLabel}</span>
              </div>
            </Card>
          )
      )}
    </div>
  );
};

export default SummaryCards;
