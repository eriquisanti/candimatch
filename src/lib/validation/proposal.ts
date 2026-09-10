import { PROPOSAL_CATEGORIES } from "@/types/category";

export interface ProposalImportItem {
  text: string;
  category: string;
  source?: string;
  sourcePage?: number;
  sourceUrl?: string;
}

export interface ValidationIssue {
  index: number;
  message: string;
}

const CATEGORIES: readonly string[] = PROPOSAL_CATEGORIES;

export function validateProposalImportList(input: unknown): {
  valid: ProposalImportItem[];
  issues: ValidationIssue[];
} {
  if (!Array.isArray(input)) {
    return { valid: [], issues: [{ index: -1, message: '"proposals" deve ser uma lista.' }] };
  }

  const valid: ProposalImportItem[] = [];
  const issues: ValidationIssue[] = [];

  input.forEach((item, index) => {
    if (typeof item !== "object" || item === null) {
      issues.push({ index, message: "Proposta inválida: esperado um objeto." });
      return;
    }

    const p = item as Record<string, unknown>;
    const errors: string[] = [];

    if (typeof p.text !== "string" || !p.text.trim()) errors.push("text é obrigatório.");
    if (typeof p.category !== "string" || !CATEGORIES.includes(p.category)) {
      errors.push(`category é obrigatória e deve ser um dos valores: ${CATEGORIES.join(", ")}.`);
    }
    if (
      p.sourcePage !== undefined &&
      (typeof p.sourcePage !== "number" || !Number.isFinite(p.sourcePage))
    ) {
      errors.push("sourcePage deve ser numérico.");
    }
    if (p.sourceUrl !== undefined && typeof p.sourceUrl !== "string") {
      errors.push("sourceUrl deve ser texto.");
    }
    if (p.source !== undefined && typeof p.source !== "string") {
      errors.push("source deve ser texto.");
    }

    if (errors.length > 0) {
      issues.push({ index, message: errors.join(" ") });
      return;
    }

    valid.push({
      text: (p.text as string).trim(),
      category: p.category as string,
      source: typeof p.source === "string" ? p.source.trim() : undefined,
      sourcePage: typeof p.sourcePage === "number" ? p.sourcePage : undefined,
      sourceUrl: typeof p.sourceUrl === "string" ? p.sourceUrl.trim() : undefined,
    });
  });

  return { valid, issues };
}
