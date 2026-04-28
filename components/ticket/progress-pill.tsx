import clsx from "clsx";

export function ProgressPill({
  percent,
  size = "md",
  className,
}: {
  percent: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const w = size === "sm" ? "w-16" : "w-24";
  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <div className={clsx("h-1.5 bg-zinc-100 rounded-full overflow-hidden", w)}>
        <div
          className="h-full bg-gradient-to-r from-brand-red-500 to-brand-red-700"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <span className="text-xs text-zinc-600 tabular-nums font-semibold">{percent}%</span>
    </div>
  );
}
