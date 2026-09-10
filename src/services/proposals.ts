import type { ProposalRecord } from "@/types/proposal";

export interface ProposalQuery {
  candidateId?: string;
  electionYear?: number;
  category?: string;
}

export async function fetchProposals(query: ProposalQuery = {}): Promise<ProposalRecord[]> {
  const params = new URLSearchParams();
  if (query.candidateId) params.set("candidateId", query.candidateId);
  if (query.electionYear) params.set("electionYear", String(query.electionYear));
  if (query.category) params.set("category", query.category);

  const queryString = params.toString();
  const response = await fetch(`/api/proposals${queryString ? `?${queryString}` : ""}`);

  if (!response.ok) {
    throw new Error(`Falha ao buscar propostas (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as { proposals: ProposalRecord[] };
  return data.proposals;
}

export async function fetchProposalsByCandidate(candidateId: string): Promise<ProposalRecord[]> {
  return fetchProposals({ candidateId });
}
