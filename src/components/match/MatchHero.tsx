import { CandidateAvatar } from "@/components/shared/CandidateAvatar";
import type { CandidateMatch } from "@/types";

interface MatchHeroProps {
  match: CandidateMatch;

  compact?: boolean;
}

export function MatchHero({ match, compact = false }: MatchHeroProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <CandidateAvatar candidate={match.candidate} size={compact ? "lg" : "xl"} className="ring-4 ring-white" />

      <div>
        <p className="text-sm font-medium text-zinc-400">{match.candidate.party}</p>
        <h2 className={`font-bold text-zinc-900 ${compact ? "text-xl" : "text-2xl"}`}>{match.candidate.name}</h2>
      </div>

      <p
        className={`bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text font-black text-transparent ${
          compact ? "text-5xl" : "text-6xl"
        }`}
      >
        {match.percentage}%
      </p>

      <p className="text-sm font-medium text-zinc-500">
        {match.matchCount} de {match.totalAnswered} propostas em comum
      </p>
    </div>
  );
}
