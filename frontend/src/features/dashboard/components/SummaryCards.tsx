import { Card } from "../../../components/ui/Card";
import SwipeableCards from "./SwipeableCards";

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
    <>
      <div className="sm:hidden w-full max-w-full overflow-x-hidden no-scrollbar">
        <SwipeableCards cards={cards} />
      </div>
      <div className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(
          ({ title, value, trendLabel, trendValue, trendPositive }) => (
            <Card key={title} className="p-6 hover:shadow-xl transition-shadow duration-300 shadow-sm">
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
    </>
  );
};

export default SummaryCards;
