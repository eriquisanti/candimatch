import type { Candidate, CandidateMatch, Proposal, UserAnswers } from "@/types";

export const MIN_CANDIDATE_ANSWERS_FOR_MATCH = 5;

const WILSON_CONFIDENCE_Z = 1.96;

export function calculateAllMatches(
  answers: UserAnswers,
  proposals: Proposal[],
  candidates: Candidate[]
): CandidateMatch[] {
  const agreedByCandidate = new Map<string, number>();
  const answeredByCandidate = new Map<string, number>();

  for (const proposal of proposals) {
    if (!(proposal.id in answers)) continue;
    answeredByCandidate.set(proposal.candidateId, (answeredByCandidate.get(proposal.candidateId) ?? 0) + 1);
    if (answers[proposal.id] === true) {
      agreedByCandidate.set(proposal.candidateId, (agreedByCandidate.get(proposal.candidateId) ?? 0) + 1);
    }
  }

  return candidates
    .map((candidate) => {
      const matchCount = agreedByCandidate.get(candidate.id) ?? 0;
      const totalAnswered = answeredByCandidate.get(candidate.id) ?? 0;
      const percentage = totalAnswered > 0 ? Math.round((matchCount / totalAnswered) * 100) : 0;
      const confidenceLowerBound = wilsonLowerBound(matchCount, totalAnswered, WILSON_CONFIDENCE_Z);
      return { candidate, percentage, matchCount, totalAnswered, confidenceLowerBound };
    })
    .sort(
      (a, b) =>
        b.confidenceLowerBound - a.confidenceLowerBound ||
        b.percentage - a.percentage ||
        b.totalAnswered - a.totalAnswered
    );
}

export function getBestMatch(
  answers: UserAnswers,
  proposals: Proposal[],
  candidates: Candidate[]
): CandidateMatch | null {
  if (Object.keys(answers).length === 0) return null;
  const ranked = calculateAllMatches(answers, proposals, candidates);
  const withMinSample = ranked.filter((match) => match.totalAnswered >= MIN_CANDIDATE_ANSWERS_FOR_MATCH);
  return withMinSample[0] ?? ranked[0] ?? null;
}

function wilsonLowerBound(successCount: number, sampleSize: number, z: number): number {
  if (sampleSize === 0) return 0;
  const phat = successCount / sampleSize;
  const z2 = z * z;
  const denominator = 1 + z2 / sampleSize;
  const center = phat + z2 / (2 * sampleSize);
  const margin = z * Math.sqrt((phat * (1 - phat)) / sampleSize + z2 / (4 * sampleSize * sampleSize));
  return Math.max(0, (center - margin) / denominator);
}

export function bestCaseLowerBound(match: CandidateMatch, remainingCount: number): number {
  const bestMatchCount = match.matchCount + remainingCount;
  const bestTotalAnswered = match.totalAnswered + remainingCount;
  return wilsonLowerBound(bestMatchCount, bestTotalAnswered, WILSON_CONFIDENCE_Z);
}

export function meetsMatchThreshold(match: CandidateMatch, thresholdPercent = 50): boolean {
  return (
    match.totalAnswered >= MIN_CANDIDATE_ANSWERS_FOR_MATCH &&
    match.confidenceLowerBound * 100 >= thresholdPercent
  );
}

export interface CompatibilityItem {
  proposal: Proposal;
  agreed: boolean;
}

export function getCompatibilityBreakdown(
  answers: UserAnswers,
  candidate: Candidate,
  proposals: Proposal[],
  limit = 6
): CompatibilityItem[] {
  const items: CompatibilityItem[] = proposals
    .filter((proposal) => proposal.candidateId === candidate.id && proposal.id in answers)
    .map((proposal) => ({ proposal, agreed: answers[proposal.id] }));

  const agreements = items.filter((item) => item.agreed);
  const disagreements = items.filter((item) => !item.agreed);
  const agreementsLimit = Math.max(limit - Math.floor(limit * 0.3), 1);

  return [...agreements.slice(0, agreementsLimit), ...disagreements.slice(0, limit)].slice(0, limit);
}
