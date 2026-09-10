"use client";

import { Heart, User } from "lucide-react";
import { CandidateAvatar } from "@/components/shared/CandidateAvatar";
import { useCountUp } from "@/hooks/useCountUp";
import type { MatchRevealStage } from "@/hooks/useMatchReveal";
import type { CandidateMatch } from "@/types";

interface MatchRevealProps {
  match: CandidateMatch;
  title: string;
  stage: MatchRevealStage;
  onSkip: () => void;
}

export function MatchReveal({ match, title, stage, onSkip }: MatchRevealProps) {
  return (
    <button
      type="button"
      onClick={onSkip}
      aria-label="Pular animação de match"
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-7 overflow-hidden bg-gradient-to-br from-rose-600 via-fuchsia-600 to-orange-500 px-6 text-center transition-opacity duration-500 ${
        stage === "exiting" ? "opacity-0" : "opacity-100"
      }`}
    >

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 animate-[match-glow-pulse_2.6s_ease-in-out_infinite] rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 translate-x-1/2 animate-[match-glow-pulse_2.6s_ease-in-out_infinite] rounded-full bg-white/15 blur-3xl [animation-delay:600ms]" />
      </div>

      <div className="relative flex animate-[match-pop_0.5s_ease-out_both] flex-col items-center gap-2 [animation-delay:120ms]">
        <Heart className="h-8 w-8 fill-white text-white" />
        <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
      </div>

      <div className="relative flex items-center">
        <div className="flex h-24 w-24 animate-[match-slide-in-left_0.6s_ease-out_both] items-center justify-center rounded-full border-4 border-white/40 bg-white/10 text-white [animation-delay:550ms]">
          <User className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <Heart className="z-10 -mx-2 h-6 w-6 animate-[match-pop_0.4s_ease-out_both] fill-red-500 text-red-500 [animation-delay:700ms]" />
        <CandidateAvatar
          candidate={match.candidate}
          size="lg"
          className="animate-[match-slide-in-right_0.6s_ease-out_both] ring-4 ring-white [animation-delay:700ms]"
        />
      </div>

      {stage !== "intro" && (
        <div className="relative flex flex-col items-center gap-1">
          <AnimatedPercentage value={match.percentage} />
          <span className="animate-[match-pop_0.4s_ease-out_both] text-xs font-semibold uppercase tracking-[0.2em] text-white/70 [animation-delay:150ms]">
            de compatibilidade
          </span>
        </div>
      )}

      <span className="relative text-sm font-medium text-white/60">Toque para continuar</span>
    </button>
  );
}

function AnimatedPercentage({ value }: { value: number }) {
  const display = useCountUp(value, 700);

  return (
    <p className="animate-[match-pop_0.5s_ease-out_both] text-6xl font-black tabular-nums text-white">{display}%</p>
  );
}
