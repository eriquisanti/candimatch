"use client";

import { useState } from "react";
import { ChevronDown, Heart, X } from "lucide-react";
import type { AnsweredProposal } from "@/utils/answerHistory";

interface AnswerHistoryProps {
  items: AnsweredProposal[];
  matchedCandidateId: string;
}

function AnswerCard({ proposal, candidate, agreed }: AnsweredProposal) {
  return (
    <li
      className={`rounded-2xl border p-4 ${
        agreed ? "border-emerald-100 bg-emerald-50" : "border-zinc-200 bg-zinc-50"
      }`}
    >
      <p className="flex items-center justify-between gap-2 text-sm font-bold text-zinc-800">
        <span className="flex items-center gap-2">
          {agreed ? (
            <Heart className="h-4 w-4 shrink-0 text-emerald-600" fill="currentColor" strokeWidth={0} aria-hidden />
          ) : (
            <X className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={3} aria-hidden />
          )}
          {candidate?.name ?? "Candidato"}
        </span>
        <span className="shrink-0 text-xs font-medium text-zinc-400">{proposal.category}</span>
      </p>
      <p className="mt-2 text-sm italic text-zinc-500">&ldquo;{proposal.text}&rdquo;</p>
    </li>
  );
}

export function AnswerHistory({ items, matchedCandidateId }: AnswerHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  const otherItems = items.filter((item) => item.candidate?.id !== matchedCandidateId);

  if (otherItems.length === 0) return null;

  return (
    <section className="mt-4 w-full max-w-sm">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-100"
      >
        <span>Todas as suas respostas ({otherItems.length})</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {expanded && (
        <ul className="mt-3 flex flex-col gap-3">
          {otherItems.map((item) => (
            <AnswerCard key={item.proposal.id} {...item} />
          ))}
        </ul>
      )}
    </section>
  );
}
