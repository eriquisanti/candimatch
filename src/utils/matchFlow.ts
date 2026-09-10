import type { Candidate, Proposal, UserAnswers } from "@/types";
import { bestCaseLowerBound, calculateAllMatches, getBestMatch, meetsMatchThreshold } from "./calculateMatch";

export const MIN_QUESTIONS_FOR_MATCH = 10;

export const MAX_QUESTIONS_FOR_MATCH = 30;

export const MATCH_THRESHOLD_PERCENT = 50;

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function stratifiedShuffle(proposals: Proposal[]): Proposal[] {
  const byCandidate = new Map<string, Proposal[]>();
  for (const proposal of proposals) {
    const group = byCandidate.get(proposal.candidateId);
    if (group) {
      group.push(proposal);
    } else {
      byCandidate.set(proposal.candidateId, [proposal]);
    }
  }

  const groups = Array.from(byCandidate.values(), shuffle);
  const result: Proposal[] = [];
  let remaining = groups.filter((group) => group.length > 0);

  while (remaining.length > 0) {
    for (const group of shuffle(remaining)) {
      result.push(group.shift()!);
    }
    remaining = remaining.filter((group) => group.length > 0);
  }

  return result;
}

export function pruneEliminatedCandidates(
  orderedProposals: Proposal[],
  answers: UserAnswers,
  candidates: Candidate[],
  fromIndex: number,
  thresholdPercent = MATCH_THRESHOLD_PERCENT
): Proposal[] {
  const frozen = orderedProposals.slice(0, fromIndex);
  const tail = orderedProposals.slice(fromIndex).filter((proposal) => !(proposal.id in answers));

  const remainingByCandidate = new Map<string, number>();
  for (const proposal of tail) {
    remainingByCandidate.set(
      proposal.candidateId,
      (remainingByCandidate.get(proposal.candidateId) ?? 0) + 1
    );
  }

  const matches = calculateAllMatches(answers, orderedProposals, candidates);
  const eliminated = new Set<string>();
  for (const match of matches) {

    if (match.totalAnswered === 0) continue;
    const remaining = remainingByCandidate.get(match.candidate.id) ?? 0;
    if (remaining === 0) continue;
    if (bestCaseLowerBound(match, remaining) * 100 < thresholdPercent) {
      eliminated.add(match.candidate.id);
    }
  }

  const survivingTail = tail.filter((proposal) => !eliminated.has(proposal.candidateId));
  return [...frozen, ...stratifiedShuffle(survivingTail)];
}

export interface NextPhaseDecision {
  phase: "swiping" | "provisional";

  leaderCandidateId: string | null;
}

export function decideNextPhase(
  nextAnswers: UserAnswers,
  orderedProposals: Proposal[],
  candidates: Candidate[],
  lastShownCandidateId: string | null
): NextPhaseDecision {
  const nextTotal = Object.keys(nextAnswers).length;

  if (nextTotal >= MIN_QUESTIONS_FOR_MATCH) {
    const best = getBestMatch(nextAnswers, orderedProposals, candidates);
    if (
      best &&
      meetsMatchThreshold(best, MATCH_THRESHOLD_PERCENT) &&
      best.candidate.id !== lastShownCandidateId
    ) {
      return { phase: "provisional", leaderCandidateId: best.candidate.id };
    }
  }

  if (nextTotal >= MAX_QUESTIONS_FOR_MATCH) {
    const best = getBestMatch(nextAnswers, orderedProposals, candidates);
    return { phase: "provisional", leaderCandidateId: best?.candidate.id ?? null };
  }

  if (nextTotal === orderedProposals.length) {
    return { phase: "provisional", leaderCandidateId: lastShownCandidateId };
  }

  return { phase: "swiping", leaderCandidateId: lastShownCandidateId };
}
