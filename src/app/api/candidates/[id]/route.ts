import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCandidateById } from "@/lib/repositories/candidates";
import { serializeCandidate } from "@/lib/serialize";
import { handleApiError, jsonError } from "@/lib/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return jsonError("Identificador de candidato inválido.", 400);
    }

    const candidate = await getCandidateById(id);

    if (!candidate) {
      return jsonError("Candidato não encontrado.", 404);
    }

    return NextResponse.json({ candidate: serializeCandidate(candidate) });
  } catch (error) {
    return handleApiError(error);
  }
}
