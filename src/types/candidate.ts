import type { CandidatePosition } from "./position";

export interface CandidateRecord {
  id: string;
  tseId: string;
  name: string;
  ballotName: string | null;
  number: number | null;
  party: string;
  partyName: string | null;
  photoUrl: string | null;
  position: CandidatePosition;
  electionYear: number;
  createdAt: string;
  updatedAt: string;
}
