import { connectToDatabase } from "@/lib/mongodb";
import { Candidate } from "@/models/Candidate";
import type { CandidateImportItem } from "@/lib/validation/candidate";

export interface CandidateFilters {
  position?: string;
  electionYear?: number;
}

export async function listCandidates(filters: CandidateFilters = {}) {
  await connectToDatabase();

  const query: Record<string, string | number> = {};
  if (filters.position) query.position = filters.position;
  if (filters.electionYear) query.electionYear = filters.electionYear;

  return Candidate.find(query).sort({ number: 1 }).lean();
}

export async function getCandidateById(id: string) {
  await connectToDatabase();
  return Candidate.findById(id).lean();
}

export async function upsertCandidates(candidates: CandidateImportItem[]) {
  await connectToDatabase();

  const operations = candidates.map((candidate) => ({
    updateOne: {
      filter: { tseId: candidate.tseId, electionYear: candidate.electionYear },
      update: { $set: candidate },
      upsert: true,
    },
  }));

  return Candidate.bulkWrite(operations, { ordered: false });
}
