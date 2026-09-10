import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/http";

const ALLOWED_HOSTS = new Set(["cdn.candimatch.site"]);

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) return jsonError("url é obrigatório.", 400);

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return jsonError("url inválida.", 400);
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return jsonError("host não permitido.", 403);
  }

  let upstream: Response;
  try {
    upstream = await fetch(target);
  } catch {
    return jsonError("falha ao buscar a imagem.", 502);
  }

  if (!upstream.ok || !upstream.body) {
    return jsonError("falha ao buscar a imagem.", 502);
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
