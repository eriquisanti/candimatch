import type { ProposalCategoryCode } from "./category";

export interface ProposalRecord {
  id: string;
  candidateId: string;
  text: string;
  category: ProposalCategoryCode;
  source: string | null;
  sourcePage: number | null;
  sourceUrl: string | null;
  electionYear: number;
  createdAt: string;
  updatedAt: string;
}
