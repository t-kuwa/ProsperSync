import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "ai" | "glass";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-surface border-white/50 shadow-soft",
      ai: "bg-surface/80 border-transparent shadow-ai-glow ring-1 ring-white/50 relative overflow-hidden before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-ai-blue/5 before:via-ai-purple/5 before:to-ai-pink/5",
      glass: "bg-surface/60 border-white/30 shadow-sm backdrop-blur-md",
    };

    return (
      <div
        ref={ref}
        className={`rounded-3xl border backdrop-blur-xl transition-all duration-300 animate-fade-in-fast ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
