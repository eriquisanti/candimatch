import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { getCandidateById } from "@/lib/repositories/candidates";
import { insertProposals } from "@/lib/repositories/proposals";
import { validateProposalImportList } from "@/lib/validation/proposal";
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

  if (typeof body !== "object" || body === null) {
    return jsonError("Payload inválido.", 400);
  }

  const { candidateId, proposals, electionYear: electionYearOverride } = body as Record<
    string,
    unknown
  >;

  if (typeof candidateId !== "string" || !candidateId.trim()) {
    return jsonError("candidateId é obrigatório.", 400);
  }

  if (!mongoose.isValidObjectId(candidateId)) {
    return jsonError("candidateId inválido.", 400);
  }

  if (electionYearOverride !== undefined && typeof electionYearOverride !== "number") {
    return jsonError("electionYear deve ser numérico.", 400);
  }

  try {
    const candidate = await getCandidateById(candidateId);

    if (!candidate) {
      return jsonError("Candidato não encontrado.", 404);
    }

    const { valid, issues } = validateProposalImportList(proposals);

    if (valid.length === 0) {
      return jsonError("Nenhuma proposta válida para importar.", 400, issues);
    }

    const electionYear = electionYearOverride ?? candidate.electionYear;

    const documents = valid.map((proposal) => ({
      ...proposal,
      candidateId,
      electionYear,
      source: proposal.source ?? "MANUAL",
    }));

    const inserted = await insertProposals(documents);

    return NextResponse.json(
      {
        candidateId,
        electionYear,
        inserted: inserted.length,
        issues: issues.length > 0 ? issues : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
