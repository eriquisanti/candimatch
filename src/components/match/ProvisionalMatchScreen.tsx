"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useMatchReveal } from "@/hooks/useMatchReveal";
import type { CandidateMatch } from "@/types";
import { MatchHero } from "./MatchHero";
import { MatchReveal } from "./MatchReveal";
import { MatchScreenShell } from "./MatchScreenShell";

interface ProvisionalMatchScreenProps {
  match: CandidateMatch;

  reachedThreshold: boolean;
  canContinue: boolean;
  onContinue: () => void;
  onConfirm: () => void;
}

export function ProvisionalMatchScreen({
  match,
  reachedThreshold,
  canContinue,
  onContinue,
  onConfirm,
}: ProvisionalMatchScreenProps) {
  const { stage, isRevealing, skip } = useMatchReveal(match.candidate.id);

  return (
    <MatchScreenShell
      title={reachedThreshold ? "Seu primeiro match" : "Seu maior match"}
      overlay={
        isRevealing && (
          <MatchReveal
            match={match}
            title={reachedThreshold ? "Encontramos seu match!" : "Seu maior match até aqui"}
            stage={stage}
            onSkip={skip}
          />
        )
      }
    >
      <div
        className={`flex min-h-0 flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-6 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center transition-all duration-[550ms] ease-out ${
          isRevealing ? "pointer-events-none translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-1.5 text-sm font-semibold text-rose-600">
          <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          {reachedThreshold ? "Resultado parcial" : "Melhor resultado até aqui"}
        </span>

        <MatchHero match={match} />

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button onClick={onConfirm} className="w-full">
            <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            Ficar com esse match
          </Button>
          <Button variant="secondary" onClick={onContinue} disabled={!canContinue} className="w-full">
            Quero responder mais
          </Button>
        </div>

        {!canContinue && (
          <p className="text-xs text-zinc-400">
            {reachedThreshold
              ? "Você já respondeu a todas as propostas disponíveis."
              : "Você atingiu o limite de propostas para essa etapa."}
          </p>
        )}
      </div>
    </MatchScreenShell>
  );
}
