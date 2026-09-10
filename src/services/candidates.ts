import type { CandidateRecord } from "@/types/candidate";

export interface CandidateQuery {
  position?: string;
  electionYear?: number;
}

export async function fetchCandidates(query: CandidateQuery = {}): Promise<CandidateRecord[]> {
  const params = new URLSearchParams();
  if (query.position) params.set("position", query.position);
  if (query.electionYear) params.set("electionYear", String(query.electionYear));

  const queryString = params.toString();
  const response = await fetch(`/api/candidates${queryString ? `?${queryString}` : ""}`);

  if (!response.ok) {
    throw new Error(`Falha ao buscar candidatos (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as { candidates: CandidateRecord[] };
  return data.candidates;
}

export async function fetchCandidateById(id: string): Promise<CandidateRecord | null> {
  const response = await fetch(`/api/candidates/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Falha ao buscar candidato (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as { candidate: CandidateRecord };
  return data.candidate;
}
