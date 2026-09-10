import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { listProposals } from "@/lib/repositories/proposals";
import { serializeProposal } from "@/lib/serialize";
import { handleApiError, jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const candidateId = searchParams.get("candidateId") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const electionYearParam = searchParams.get("electionYear");
    const electionYear = electionYearParam ? Number(electionYearParam) : undefined;

    if (candidateId && !mongoose.isValidObjectId(candidateId)) {
      return jsonError("candidateId inválido.", 400);
    }

    if (electionYearParam && Number.isNaN(electionYear)) {
      return jsonError("electionYear deve ser numérico.", 400);
    }

    const proposals = await listProposals({ candidateId, electionYear, category });

    return NextResponse.json({ proposals: proposals.map(serializeProposal) });
  } catch (error) {
    return handleApiError(error);
  }
}
