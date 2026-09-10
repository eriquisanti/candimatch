import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface MatchScreenShellProps {
  title: string;
  onBack?: () => void;

  overlay?: ReactNode;
  children: ReactNode;
}

export function MatchScreenShell({ title, onBack, overlay, children }: MatchScreenShellProps) {
  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      {overlay}

      <header className="flex shrink-0 items-center justify-between px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar ao início"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <span className="h-9 w-9" aria-hidden />
        )}
        <span className="text-sm font-semibold text-zinc-400">{title}</span>
        <span className="h-9 w-9" aria-hidden />
      </header>

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
