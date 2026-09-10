import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details !== undefined ? { details } : {}) },
    { status }
  );
}

export function requireImportAuth(request: NextRequest): NextResponse | null {
  const expected = process.env.IMPORT_API_TOKEN;
  if (!expected) {
    console.error("[api] IMPORT_API_TOKEN não configurado — bloqueando rota de import.");
    return jsonError("Import desabilitado: IMPORT_API_TOKEN não configurado no servidor.", 503);
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || !tokensMatch(token, expected)) {
    return jsonError("Não autorizado.", 401);
  }

  return null;
}

function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function handleApiError(error: unknown) {
  if (error instanceof mongoose.Error.CastError) {
    return jsonError("Identificador inválido.", 400);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return jsonError("Dados inválidos.", 400, formatMongooseValidationError(error));
  }

  if (isDuplicateKeyError(error)) {
    return jsonError("Registro duplicado.", 409);
  }

  console.error("[api] erro inesperado:", error);
  return jsonError("Erro ao acessar o banco de dados.", 500);
}

function formatMongooseValidationError(error: mongoose.Error.ValidationError) {
  return Object.fromEntries(
    Object.entries(error.errors).map(([field, err]) => [field, err.message])
  );
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}
