import { connectToDatabase } from "@/lib/mongodb";
import { Proposal } from "@/models/Proposal";
import type { ProposalImportItem } from "@/lib/validation/proposal";

export interface ProposalFilters {
  candidateId?: string;
  electionYear?: number;
  category?: string;
}

export async function listProposals(filters: ProposalFilters = {}) {
  await connectToDatabase();

  const query: Record<string, string | number> = {};
  if (filters.candidateId) query.candidateId = filters.candidateId;
  if (filters.electionYear) query.electionYear = filters.electionYear;
  if (filters.category) query.category = filters.category;

  return Proposal.find(query).sort({ createdAt: 1 }).lean();
}

export interface ProposalToInsert extends ProposalImportItem {
  candidateId: string;
  electionYear: number;
}

export async function insertProposals(proposals: ProposalToInsert[]) {
  await connectToDatabase();
  return Proposal.insertMany(proposals, { ordered: false });
}
