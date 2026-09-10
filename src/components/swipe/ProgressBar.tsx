interface ProgressBarProps {
  current: number;

  total?: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  if (total === undefined) {
    return (
      <div className="w-full max-w-sm">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>{current} propostas</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
          <div className="h-full w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500" />
        </div>
      </div>
    );
  }

  const safeCurrent = Math.min(Math.max(current, 0), total);
  const percentage = total > 0 ? (safeCurrent / total) * 100 : 0;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-400">
        <span>
          {safeCurrent} de {total}
        </span>
        <span>propostas</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
