import { NextResponse, type NextRequest } from "next/server";
import { upsertCandidates } from "@/lib/repositories/candidates";
import { validateCandidateImportList, type CandidateImportItem } from "@/lib/validation/candidate";
import { handleApiError, jsonError, requireImportAuth } from "@/lib/http";

export async function POST(request: NextRequest) {
  const denied = requireImportAuth(request);
  if (denied) return denied;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Payload inválido: JSON malformado.", 400);
  }

  if (typeof body !== "object" || body === null || !("candidates" in body)) {
    return jsonError('Payload inválido: esperado um objeto com a chave "candidates".', 400);
  }

  const { valid, issues } = validateCandidateImportList(
    (body as { candidates: unknown }).candidates
  );

  const deduped = dedupeByTseIdAndYear(valid, issues);

  if (deduped.length === 0) {
    return jsonError("Nenhum candidato válido para importar.", 400, issues);
  }

  try {
    const result = await upsertCandidates(deduped);

    return NextResponse.json(
      {
        received: Array.isArray((body as { candidates: unknown }).candidates)
          ? (body as { candidates: unknown[] }).candidates.length
          : 0,
        upserted: result.upsertedCount,
        updated: result.modifiedCount,
        matched: result.matchedCount,
        issues: issues.length > 0 ? issues : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

function dedupeByTseIdAndYear(
  candidates: CandidateImportItem[],
  issues: { index: number; message: string }[]
) {
  const seen = new Set<string>();
  const deduped: CandidateImportItem[] = [];

  candidates.forEach((candidate, index) => {
    const key = `${candidate.tseId}:${candidate.electionYear}`;
    if (seen.has(key)) {
      issues.push({
        index,
        message: `Candidato duplicado no payload (tseId "${candidate.tseId}", electionYear ${candidate.electionYear}); apenas a primeira ocorrência foi processada.`,
      });
      return;
    }
    seen.add(key);
    deduped.push(candidate);
  });

  return deduped;
}
