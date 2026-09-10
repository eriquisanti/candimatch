import { NextResponse, type NextRequest } from "next/server";
import { listCandidates } from "@/lib/repositories/candidates";
import { serializeCandidate } from "@/lib/serialize";
import { handleApiError, jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get("position") ?? undefined;
    const electionYearParam = searchParams.get("electionYear");
    const electionYear = electionYearParam ? Number(electionYearParam) : undefined;

    if (electionYearParam && Number.isNaN(electionYear)) {
      return jsonError("electionYear deve ser numérico.", 400);
    }

    const candidates = await listCandidates({ position, electionYear });

    return NextResponse.json({ candidates: candidates.map(serializeCandidate) });
  } catch (error) {
    return handleApiError(error);
  }
}
