import type { CandidateRecord } from "@/types/candidate";
import type { CandidatePosition } from "@/types/position";
import type { ProposalRecord } from "@/types/proposal";
import type { ProposalCategoryCode } from "@/types/category";

interface LeanCandidateDoc {
  _id: unknown;
  tseId: string;
  name: string;
  ballotName?: string | null;
  number?: number | null;
  party: string;
  partyName?: string | null;
  photoUrl?: string | null;
  position: string;
  electionYear: number;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeCandidate(doc: LeanCandidateDoc): CandidateRecord {
  return {
    id: String(doc._id),
    tseId: doc.tseId,
    name: doc.name,
    ballotName: doc.ballotName ?? null,
    number: doc.number ?? null,
    party: doc.party,
    partyName: doc.partyName ?? null,
    photoUrl: doc.photoUrl ?? null,
    position: doc.position as CandidatePosition,
    electionYear: doc.electionYear,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

interface LeanProposalDoc {
  _id: unknown;
  candidateId: unknown;
  text: string;
  category: string;
  source?: string | null;
  sourcePage?: number | null;
  sourceUrl?: string | null;
  electionYear: number;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeProposal(doc: LeanProposalDoc): ProposalRecord {
  return {
    id: String(doc._id),
    candidateId: String(doc.candidateId),
    text: doc.text,
    category: doc.category as ProposalCategoryCode,
    source: doc.source ?? null,
    sourcePage: doc.sourcePage ?? null,
    sourceUrl: doc.sourceUrl ?? null,
    electionYear: doc.electionYear,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
