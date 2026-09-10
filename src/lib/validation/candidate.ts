import { CANDIDATE_POSITIONS } from "@/types/position";

export interface CandidateImportItem {
  tseId: string;
  name: string;
  ballotName?: string;
  number?: number;
  party: string;
  partyName?: string;
  photoUrl?: string;
  position: string;
  electionYear: number;
}

export interface ValidationIssue {
  index: number;
  message: string;
}

const POSITIONS: readonly string[] = CANDIDATE_POSITIONS;

export function validateCandidateImportList(input: unknown): {
  valid: CandidateImportItem[];
  issues: ValidationIssue[];
} {
  if (!Array.isArray(input)) {
    return { valid: [], issues: [{ index: -1, message: '"candidates" deve ser uma lista.' }] };
  }

  const valid: CandidateImportItem[] = [];
  const issues: ValidationIssue[] = [];

  input.forEach((item, index) => {
    if (typeof item !== "object" || item === null) {
      issues.push({ index, message: "Candidato inválido: esperado um objeto." });
      return;
    }

    const c = item as Record<string, unknown>;
    const errors: string[] = [];

    if (typeof c.tseId !== "string" || !c.tseId.trim()) errors.push("tseId é obrigatório.");
    if (typeof c.name !== "string" || !c.name.trim()) errors.push("name é obrigatório.");

    if (c.ballotName !== undefined && c.ballotName !== null && typeof c.ballotName !== "string") {
      errors.push("ballotName deve ser texto.");
    }
    if (
      c.number !== undefined &&
      c.number !== null &&
      (typeof c.number !== "number" || !Number.isFinite(c.number))
    ) {
      errors.push("number deve ser numérico.");
    }
    if (typeof c.party !== "string" || !c.party.trim()) errors.push("party é obrigatório.");
    if (typeof c.position !== "string" || !POSITIONS.includes(c.position)) {
      errors.push(`position é obrigatória e deve ser um dos valores: ${POSITIONS.join(", ")}.`);
    }
    if (typeof c.electionYear !== "number" || !Number.isFinite(c.electionYear)) {
      errors.push("electionYear é obrigatório e deve ser numérico.");
    }
    if (c.partyName !== undefined && typeof c.partyName !== "string") {
      errors.push("partyName deve ser texto.");
    }
    if (c.photoUrl !== undefined && typeof c.photoUrl !== "string") {
      errors.push("photoUrl deve ser texto.");
    }

    if (errors.length > 0) {
      issues.push({ index, message: errors.join(" ") });
      return;
    }

    valid.push({
      tseId: (c.tseId as string).trim(),
      name: (c.name as string).trim(),
      ballotName: typeof c.ballotName === "string" ? c.ballotName.trim() : undefined,
      number: typeof c.number === "number" ? c.number : undefined,
      party: (c.party as string).trim(),
      partyName: typeof c.partyName === "string" ? c.partyName.trim() : undefined,
      photoUrl: typeof c.photoUrl === "string" ? c.photoUrl.trim() : undefined,
      position: c.position as string,
      electionYear: c.electionYear as number,
    });
  });

  return { valid, issues };
}
