import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { Card } from "../../../components/ui/Card";
import type { SummaryCardData } from "./SummaryCards";

type SwipeableCardsProps = {
  cards: SummaryCardData[];
};

const SwipeableCardItem = ({
  card,
  index,
  onSwipe,
  isInitialMount,
}: {
  card: SummaryCardData;
  index: number;
  onSwipe: (direction: "left" | "right") => void;
  isInitialMount: boolean;
}) => {
  const x = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.9, 1, 0.9]);
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10]);
  const [exitX, setExitX] = useState(0);

  // Calculate actual index relative to current
  // visibleCards is reversed in the parent, so:
  // index 2 is the top card (current)
  // index 1 is the next card
  // index 0 is the last card
  const isTop = index === 2;
  const offset = 2 - index; // 0 for top, 1 for next, 2 for last

  useEffect(() => {
    if (isTop && isInitialMount) {
      // Wiggle animation to hint swipe
      const controls = animate(x, [0, 20, 0], {
        duration: 0.6,
        delay: 0.5,
        ease: "easeInOut",
      });
      return () => controls.stop();
    }
  }, [isTop, isInitialMount, x]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      setExitX(-1000);
      onSwipe("left");
    } else if (info.offset.x > threshold) {
      setExitX(1000);
      onSwipe("right");
    }
  };

  return (
    <motion.div
      style={{
        zIndex: index,
        x: isTop ? x : 0,
        scale: isTop ? scale : 1 - offset * 0.05,
        rotate: isTop ? rotate : 0,
        y: offset * 10,
        transformOrigin: "bottom center",
      }}
      initial={{ scale: 0.9, y: 20, opacity: 0 }}
      animate={{
        scale: 1 - offset * 0.05,
        y: offset * 10,
        opacity: 1 - offset * 0.2,
      }}
      exit={{ x: exitX, transition: { duration: 0.2 } }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="absolute inset-0"
    >
      <Card
        className={`h-full w-full p-6 shadow-lg border border-white/40 bg-white/80 backdrop-blur-md ${
          card.emphasize ? "bg-ai-gradient text-white" : ""
        }`}
      >
        {card.emphasize && (
          <div className="absolute inset-0 bg-white/10 animate-pulse-glow pointer-events-none" />
        )}
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <p
              className={`text-sm font-medium ${
                card.emphasize ? "opacity-90" : "text-text-secondary"
              }`}
            >
              {card.title}
            </p>
            <p
              className={`mt-2 text-4xl font-bold tracking-tight ${
                card.emphasize ? "" : "text-text-primary"
              }`}
            >
              {card.value}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 text-xs font-medium ${
              card.emphasize ? "opacity-90" : ""
            }`}
          >
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${
                card.emphasize
                  ? "bg-white/20 backdrop-blur-md"
                  : card.trendPositive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span
                className={`${
                  card.emphasize && !card.trendPositive ? "rotate-180" : ""
                }`}
              >
                {card.trendPositive ? "▲" : "▼"}
              </span>
              {card.trendValue}
            </span>
            <span className={card.emphasize ? "" : "text-text-secondary"}>
              {card.trendLabel}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const SwipeableCards = ({ cards }: SwipeableCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    // Turn off initial mount flag after first interaction or timeout
    const timer = setTimeout(() => setIsInitialMount(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (cards.length === 0) return null;

  // Show top 3 cards for stacking effect
  const visibleCards = [
    cards[currentIndex % cards.length],
    cards[(currentIndex + 1) % cards.length],
    cards[(currentIndex + 2) % cards.length],
  ].reverse(); // Reverse so the first one is rendered last (on top)

  return (
    <div className="flex flex-col gap-4 sm:hidden">
      <div className="relative h-64 w-full perspective-1000">
        <AnimatePresence initial={false} mode="popLayout">
          {visibleCards.map((card, index) => {
            // Calculate actual index relative to current
            const offset = 2 - index; // 0 for top, 1 for next, 2 for last
            
            return (
              <SwipeableCardItem
                key={`${card.title}-${currentIndex + offset}`}
                card={card}
                index={index}
                onSwipe={() => {
                  setCurrentIndex((prev) => prev + 1);
                  setIsInitialMount(false);
                }}
                isInitialMount={isInitialMount && currentIndex === 0}
              />
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Pagination Dots */}
      <div className="flex justify-center gap-2">
        {cards.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              idx === currentIndex % cards.length
                ? "bg-primary"
                : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeableCards;
