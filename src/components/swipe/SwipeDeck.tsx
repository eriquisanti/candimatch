"use client";

import type { RefObject } from "react";
import { ProposalCard, type ProposalCardHandle } from "./ProposalCard";
import type { Proposal } from "@/types";

interface SwipeDeckProps {
  current: Proposal;
  next?: Proposal;
  cardRef: RefObject<ProposalCardHandle | null>;
  onAnswer: (proposalId: string, agree: boolean) => void;
  onDragProgress?: (progress: number) => void;
}

export function SwipeDeck({ current, next, cardRef, onAnswer, onDragProgress }: SwipeDeckProps) {
  return (
    <div className="relative aspect-[3/4] w-full max-w-sm">
      {next && (
        <ProposalCard key={next.id} proposal={next} onSwipe={() => {}} interactive={false} stackOffset={1} />
      )}
      <ProposalCard
        key={current.id}
        ref={cardRef}
        proposal={current}
        onSwipe={(direction) => onAnswer(current.id, direction === "right")}
        onDragProgress={onDragProgress}
        interactive
        stackOffset={0}
      />
    </div>
  );
}
