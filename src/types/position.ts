
export const CANDIDATE_POSITIONS = ["PRESIDENT"] as const;

export type CandidatePosition = (typeof CANDIDATE_POSITIONS)[number];
