"use client";

import { useRef, useState } from "react";
import type { Proposal } from "@/types";
import { ProgressBar } from "./ProgressBar";
import type { ProposalCardHandle } from "./ProposalCard";
import { SwipeButtons } from "./SwipeButtons";
import { SwipeDeck } from "./SwipeDeck";

interface SwipeScreenProps {
  proposal: Proposal;
  nextProposal?: Proposal;
  progressCurrent: number;
  progressTotal?: number;
  onAnswer: (proposalId: string, agree: boolean) => void;
}

export function SwipeScreen({
  proposal,
  nextProposal,
  progressCurrent,
  progressTotal,
  onAnswer,
}: SwipeScreenProps) {
  const cardRef = useRef<ProposalCardHandle>(null);
  const [dragProgress, setDragProgress] = useState(0);

  const concordoGlow = Math.max(0, dragProgress);
  const discordoGlow = Math.max(0, -dragProgress);

  return (
    <div className="relative flex w-full flex-1 flex-col items-center gap-8 overflow-hidden px-5 pb-10 pt-6">

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{
          opacity: discordoGlow,
          background: "radial-gradient(circle at 12% 45%, rgba(244,63,94,0.35), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{
          opacity: concordoGlow,
          background: "radial-gradient(circle at 88% 45%, rgba(16,185,129,0.35), transparent 60%)",
        }}
      />

      <div className="w-full max-w-sm animate-[fade-in-up_0.5s_ease-out_both]">
        <ProgressBar current={progressCurrent} total={progressTotal} />
      </div>

      <div className="mx-auto w-full max-w-sm animate-[fade-in-up_0.5s_ease-out_both] [animation-delay:100ms]">
        <SwipeDeck
          cardRef={cardRef}
          current={proposal}
          next={nextProposal}
          onAnswer={onAnswer}
          onDragProgress={setDragProgress}
        />
      </div>

      <div className="animate-[fade-in-up_0.5s_ease-out_both] [animation-delay:180ms]">
        <SwipeButtons
          onDiscordo={() => cardRef.current?.swipe("left")}
          onConcordo={() => cardRef.current?.swipe("right")}
        />
      </div>
    </div>
  );
}
