import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import cn from "../../utils/cn";

type GlassTone = "default" | "subtle" | "accent" | "danger";
type GlassPadding = "none" | "sm" | "md" | "lg";

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  tone?: GlassTone;
  padding?: GlassPadding;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

const toneClassMap: Record<GlassTone, string> = {
  default:
    "border-white/70 bg-white/80 text-slate-900 shadow-floating ring-white/70 backdrop-blur", 
  subtle:
    "border-white/40 bg-white/60 text-slate-900 shadow-lg shadow-slate-900/5 ring-white/60 backdrop-blur-sm",
  accent:
    "border-indigo-200/60 bg-gradient-to-br from-indigo-500/90 via-indigo-400/90 to-sky-400/90 text-white shadow-2xl shadow-indigo-900/20 ring-indigo-200/60 backdrop-blur",
  danger:
    "border-rose-200/70 bg-rose-50/80 text-rose-700 shadow-lg shadow-rose-200/60 ring-rose-100/80",
};

const paddingClassMap: Record<GlassPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const GlassPanel = <T extends ElementType = "div">({
  as,
  tone = "default",
  padding = "lg",
  interactive = false,
  className,
  children,
  ...rest
}: GlassPanelProps<T>) => {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-[32px] border ring-1",
        paddingClassMap[padding],
        toneClassMap[tone],
        interactive && "transition hover:-translate-y-0.5 hover:shadow-2xl",
        className,
      )}
      {...(rest as ComponentPropsWithoutRef<T>)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-16 top-0 h-32 w-32 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-white/20 blur-3xl" />
      </div>
      <div className="relative z-10">{children}</div>
    </Component>
  );
};

export default GlassPanel;
