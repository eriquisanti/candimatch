"use client";

import { useMatchReveal } from "@/hooks/useMatchReveal";
import type { CandidateMatch } from "@/types";
import type { AnsweredProposal } from "@/utils/answerHistory";
import type { CompatibilityItem } from "@/utils/calculateMatch";
import { AnswerHistory } from "./AnswerHistory";
import { CompatibilityBreakdown } from "./CompatibilityBreakdown";
import { MatchReveal } from "./MatchReveal";
import { MatchScreenShell } from "./MatchScreenShell";
import { ShareSection } from "./ShareSection";

interface FinalMatchScreenProps {
  match: CandidateMatch;

  reachedThreshold: boolean;
  breakdown: CompatibilityItem[];
  answerHistory: AnsweredProposal[];
  onRestart: () => void;
}

export function FinalMatchScreen({
  match,
  reachedThreshold,
  breakdown,
  answerHistory,
  onRestart,
}: FinalMatchScreenProps) {
  const { stage, isRevealing, skip } = useMatchReveal(match.candidate.id);

  return (
    <MatchScreenShell
      title={reachedThreshold ? "Seu match" : "Seu maior match"}
      onBack={onRestart}
      overlay={
        isRevealing && (
          <MatchReveal
            match={match}
            title={reachedThreshold ? "Deu match!" : "Seu maior match até aqui"}
            stage={stage}
            onSkip={skip}
          />
        )
      }
    >
      <div
        className={`shrink-0 px-5 pb-3 transition-all duration-[550ms] ease-out ${
          isRevealing ? "pointer-events-none translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <ShareSection match={match} />
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col items-center overflow-y-auto border-t border-black/5 px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-all delay-150 duration-[550ms] ease-out ${
          isRevealing ? "pointer-events-none translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <CompatibilityBreakdown items={breakdown} />
        <AnswerHistory items={answerHistory} matchedCandidateId={match.candidate.id} />
      </div>
    </MatchScreenShell>
  );
}
