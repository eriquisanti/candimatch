import type { Candidate, Proposal, UserAnswers } from "@/types";

export interface AnsweredProposal {
  proposal: Proposal;
  candidate: Candidate | undefined;
  agreed: boolean;
}

export function getAnswerHistory(
  answeredOrder: string[],
  answers: UserAnswers,
  proposals: Proposal[],
  candidates: Candidate[]
): AnsweredProposal[] {
  const proposalById = new Map(proposals.map((proposal) => [proposal.id, proposal]));
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));

  return answeredOrder.reduceRight<AnsweredProposal[]>((history, proposalId) => {
    const proposal = proposalById.get(proposalId);
    if (!proposal) return history;
    history.push({
      proposal,
      candidate: candidateById.get(proposal.candidateId),
      agreed: answers[proposalId],
    });
    return history;
  }, []);
}
