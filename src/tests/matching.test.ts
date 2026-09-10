
import assert from "node:assert/strict";
import { test } from "node:test";
import { bestCaseLowerBound, calculateAllMatches, getBestMatch, meetsMatchThreshold } from "../utils/calculateMatch";
import {
  decideNextPhase,
  MAX_QUESTIONS_FOR_MATCH,
  pruneEliminatedCandidates,
  shuffle,
  stratifiedShuffle,
} from "../utils/matchFlow";
import type { Candidate, CandidateMatch, Proposal, UserAnswers } from "../types";

const CANDIDATES: Candidate[] = [
  { id: "cand-a", name: "Candidata A", party: "Partido A", initials: "CA", colorFrom: "#000", colorTo: "#111" },
  { id: "cand-b", name: "Candidato B", party: "Partido B", initials: "CB", colorFrom: "#000", colorTo: "#111" },
  { id: "cand-c", name: "Candidata C", party: "Partido C", initials: "CC", colorFrom: "#000", colorTo: "#111" },
];

function makeProposals(candidateId: string, prefix: string, count: number): Proposal[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    candidateId,
    category: "Outros",
    text: `Proposta ${prefix}${i + 1}`,
  }));
}

const PROPOSALS: Proposal[] = [
  ...makeProposals("cand-a", "a", 10),
  ...makeProposals("cand-b", "b", 10),
  ...makeProposals("cand-c", "c", 10),
];

function answers(pairs: Array<[string, boolean]>): UserAnswers {
  return Object.fromEntries(pairs);
}

test("Cenário 1 — menos de 10 respostas nunca mostra match, mesmo com candidato elegível", () => {

  const nine = answers([
    ["a1", true],
    ["a2", true],
    ["a3", true],
    ["a4", true],
    ["a5", true],
    ["b1", false],
    ["b2", false],
    ["c1", false],
    ["c2", false],
  ]);
  const decision = decideNextPhase(nine, PROPOSALS, CANDIDATES, null);
  assert.equal(decision.phase, "swiping");
});

test("Cenário 2 — 3/3 é 100% bruto mas NÃO atinge o threshold (abaixo da amostra mínima de 5)", () => {
  const three = answers([
    ["a1", true],
    ["a2", true],
    ["a3", true],
  ]);
  const match = calculateAllMatches(three, PROPOSALS, CANDIDATES).find((m) => m.candidate.id === "cand-a")!;
  assert.equal(match.percentage, 100);
  assert.equal(match.matchCount, 3);
  assert.equal(match.totalAnswered, 3);
  assert.equal(meetsMatchThreshold(match), false);
});

test("Cenário 3 — 5/5 é 100% bruto, bate a amostra mínima e ATINGE o threshold (Wilson ≈ 56.6%)", () => {
  const five = answers([
    ["a1", true],
    ["a2", true],
    ["a3", true],
    ["a4", true],
    ["a5", true],
  ]);
  const match = calculateAllMatches(five, PROPOSALS, CANDIDATES).find((m) => m.candidate.id === "cand-a")!;
  assert.equal(match.percentage, 100);
  assert.equal(meetsMatchThreshold(match), true);
});

test("Cenário 4 — o mesmo líder não reabre a tela de match repetidamente", () => {

  const atTen = answers([
    ["a1", true],
    ["a2", true],
    ["a3", true],
    ["a4", true],
    ["a5", true],
    ["c1", false],
    ["c2", false],
    ["c3", false],
    ["c4", false],
    ["c5", false],
  ]);
  const first = decideNextPhase(atTen, PROPOSALS, CANDIDATES, null);
  assert.equal(first.phase, "provisional");
  assert.equal(first.leaderCandidateId, "cand-a");

  const paddingIds = ["c6", "c7", "c8"];
  let running = atTen;
  for (const id of paddingIds) {
    running = { ...running, [id]: false };
    const decision = decideNextPhase(running, PROPOSALS, CANDIDATES, first.leaderCandidateId);
    assert.equal(decision.phase, "swiping", `deveria continuar respondendo em n=${Object.keys(running).length}`);
  }
});

test("Cenário 5 — um novo líder que ultrapassa e atinge o threshold reabre a tela", () => {
  const atTen = answers([
    ["a1", true],
    ["a2", true],
    ["a3", true],
    ["a4", true],
    ["a5", true],
    ["c1", false],
    ["c2", false],
    ["c3", false],
    ["c4", false],
    ["c5", false],
  ]);

  const bOvertakes: UserAnswers = {
    ...atTen,
    b1: true,
    b2: true,
    b3: true,
    b4: true,
    b5: true,
    b6: true,
  };

  const bestAfter = getBestMatch(bOvertakes, PROPOSALS, CANDIDATES)!;
  assert.equal(bestAfter.candidate.id, "cand-b", "B deveria assumir a liderança por Wilson, não por percentual bruto");

  const decision = decideNextPhase(bOvertakes, PROPOSALS, CANDIDATES, "cand-a");
  assert.equal(decision.phase, "provisional");
  assert.equal(decision.leaderCandidateId, "cand-b");
});

test("Cenário 6 — continuar respondendo preserva todas as respostas anteriores", () => {
  const firstBatch = answers([
    ["a1", true],
    ["a2", true],
    ["a3", true],
    ["a4", true],
    ["a5", true],
    ["c1", false],
    ["c2", false],
    ["c3", false],
    ["c4", false],
    ["c5", false],
  ]);

  const secondBatch: UserAnswers = { ...firstBatch, b1: true, b2: true, b3: true, b4: true, b5: true };

  assert.equal(Object.keys(secondBatch).length, 15, "nenhuma resposta da primeira leva deveria ser perdida");
  for (const id of Object.keys(firstBatch)) {
    assert.equal(secondBatch[id], firstBatch[id], `resposta antiga em ${id} não deveria mudar`);
  }

});

test("Cenário 7 — 30 respostas força o fim da etapa mesmo sem ninguém atingir 50%", () => {

  const alternating: Array<[string, boolean]> = [];
  for (const prefix of ["a", "b", "c"]) {
    for (let i = 1; i <= 10; i += 1) {
      alternating.push([`${prefix}${i}`, i % 2 === 0]);
    }
  }
  const thirty = answers(alternating);
  assert.equal(Object.keys(thirty).length, 30);

  const decision = decideNextPhase(thirty, PROPOSALS, CANDIDATES, null);
  assert.equal(decision.phase, "provisional", "deve encerrar obrigatoriamente ao atingir MAX_QUESTIONS_FOR_MATCH");

  const best = getBestMatch(thirty, PROPOSALS, CANDIDATES)!;
  assert.equal(meetsMatchThreshold(best), false, "reachedThreshold deveria ser false — ninguém bateu 50%");
  for (const match of calculateAllMatches(thirty, PROPOSALS, CANDIDATES)) {
    assert.equal(match.percentage, 50, `${match.candidate.id} deveria ficar em exatamente 5/10 = 50%`);
  }
});

test("Cenário 8 — resultado final usa todas as respostas acumuladas desde o início da sessão", () => {
  const firstTen = answers([
    ["a1", true],
    ["a2", true],
    ["a3", true],
    ["a4", true],
    ["a5", true],
    ["c1", false],
    ["c2", false],
    ["c3", false],
    ["c4", false],
    ["c5", false],
  ]);
  const afterContinuing: UserAnswers = { ...firstTen, b1: true, b2: true, b3: true, b4: true, b5: true };

  const finalMatches = calculateAllMatches(afterContinuing, PROPOSALS, CANDIDATES);
  const totalAnsweredSum = finalMatches.reduce((sum, m) => sum + m.totalAnswered, 0);
  assert.equal(totalAnsweredSum, Object.keys(afterContinuing).length, "nenhuma resposta pode ficar fora do cálculo final");

  const matchA = finalMatches.find((m) => m.candidate.id === "cand-a")!;
  assert.equal(matchA.matchCount, 5);
  assert.equal(matchA.totalAnswered, 5);
});

test("Cenário 9 — a próxima proposta nunca depende do candidato líder, e não há repetição", () => {
  const original = PROPOSALS;
  for (let trial = 0; trial < 20; trial += 1) {
    const shuffled = shuffle(original);
    assert.equal(shuffled.length, original.length);
    assert.deepEqual(
      new Set(shuffled.map((p) => p.id)),
      new Set(original.map((p) => p.id)),
      "o shuffle não pode perder nem duplicar propostas"
    );

    const seen = new Set<string>();
    for (const p of shuffled) {
      assert.equal(seen.has(p.id), false, "proposta repetida dentro da mesma sessão");
      seen.add(p.id);
    }
  }

  const identicalRuns = Array.from({ length: 20 }, () => shuffle(original)).filter((shuffled) =>
    shuffled.every((p, i) => p.id === original[i]!.id)
  );
  assert.ok(identicalRuns.length < 20, "shuffle não deveria produzir sempre a mesma ordem do array original");
});

test("MAX_QUESTIONS_FOR_MATCH é 30 (contrato do produto)", () => {
  assert.equal(MAX_QUESTIONS_FOR_MATCH, 30);
});

test("Cenário 10 — stratifiedShuffle não perde nem duplica propostas, e não é sempre a mesma ordem", () => {
  const original = PROPOSALS;
  for (let trial = 0; trial < 20; trial += 1) {
    const ordered = stratifiedShuffle(original);
    assert.equal(ordered.length, original.length);
    assert.deepEqual(
      new Set(ordered.map((p) => p.id)),
      new Set(original.map((p) => p.id)),
      "stratifiedShuffle não pode perder nem duplicar propostas"
    );
    const seen = new Set<string>();
    for (const p of ordered) {
      assert.equal(seen.has(p.id), false, "proposta repetida dentro da mesma sessão");
      seen.add(p.id);
    }
  }
  const identicalRuns = Array.from({ length: 20 }, () => stratifiedShuffle(original)).filter((ordered) =>
    ordered.every((p, i) => p.id === original[i]!.id)
  );
  assert.ok(identicalRuns.length < 20, "stratifiedShuffle não deveria produzir sempre a mesma ordem do array original");
});

test("Cenário 11 — stratifiedShuffle equilibra a amostra por candidato em qualquer prefixo (pools iguais)", () => {

  for (let trial = 0; trial < 20; trial += 1) {
    const ordered = stratifiedShuffle(PROPOSALS);
    const seenPerCandidate = new Map<string, number>();
    for (const proposal of ordered) {
      seenPerCandidate.set(proposal.candidateId, (seenPerCandidate.get(proposal.candidateId) ?? 0) + 1);
      const counts = CANDIDATES.map((c) => seenPerCandidate.get(c.id) ?? 0);
      const spread = Math.max(...counts) - Math.min(...counts);
      assert.ok(spread <= 1, `desequilíbrio de amostra > 1 no prefixo de tamanho ${ordered.indexOf(proposal) + 1}`);
    }
  }
});

test("Cenário 12 — stratifiedShuffle com pools desiguais: candidato menor esgota e some das rodadas seguintes", () => {

  const small = makeProposals("cand-a", "small", 2);
  const bigB = makeProposals("cand-b", "bigb", 8);
  const bigC = makeProposals("cand-c", "bigc", 8);
  const uneven = [...small, ...bigB, ...bigC];

  const ordered = stratifiedShuffle(uneven);
  assert.equal(ordered.length, uneven.length);

  const firstFew = ordered.slice(0, 3).map((p) => p.candidateId);
  assert.ok(firstFew.includes("cand-a"), "candidato com menos propostas deveria aparecer cedo, não só no fim");

  const afterASpent = ordered.slice(ordered.findIndex((p, i) => ordered.slice(0, i + 1).filter((q) => q.candidateId === "cand-a").length === 2) + 1);
  assert.ok(
    afterASpent.every((p) => p.candidateId !== "cand-a"),
    "candidato com pool esgotado não pode reaparecer depois"
  );
});

function makeMatch(candidateId: string, matchCount: number, totalAnswered: number): CandidateMatch {
  return {
    candidate: CANDIDATES.find((c) => c.id === candidateId)!,
    percentage: totalAnswered > 0 ? Math.round((matchCount / totalAnswered) * 100) : 0,
    matchCount,
    totalAnswered,
    confidenceLowerBound: 0,
  };
}

test("Cenário 13 — bestCaseLowerBound: impossível vs. ainda alcançável", () => {

  const hopeless = bestCaseLowerBound(makeMatch("cand-a", 0, 9), 1);
  assert.ok(hopeless * 100 < 50, `deveria ser matematicamente impossível, mas deu ${hopeless * 100}%`);

  const stillAlive = bestCaseLowerBound(makeMatch("cand-b", 5, 5), 5);
  assert.ok(stillAlive * 100 >= 50, `deveria continuar alcançável, mas deu ${stillAlive * 100}%`);
});

test("Cenário 14 — pruneEliminatedCandidates corta só o candidato inviável, preserva a região congelada", () => {
  const aDisagreed = Array.from({ length: 9 }, (_, i) => `a${i + 1}`);
  const orderedProposals: Proposal[] = [
    ...aDisagreed.map((id) => PROPOSALS.find((p) => p.id === id)!),
    PROPOSALS.find((p) => p.id === "b1")!,
    PROPOSALS.find((p) => p.id === "c1")!,
    PROPOSALS.find((p) => p.id === "a10")!,
    ...PROPOSALS.filter((p) => p.candidateId === "cand-b" && p.id !== "b1"),
    ...PROPOSALS.filter((p) => p.candidateId === "cand-c" && p.id !== "c1"),
  ];
  const answersState = answers(aDisagreed.map((id): [string, boolean] => [id, false]));
  const fromIndex = 11;

  const pruned = pruneEliminatedCandidates(orderedProposals, answersState, CANDIDATES, fromIndex);

  assert.deepEqual(pruned.slice(0, fromIndex), orderedProposals.slice(0, fromIndex));

  const tailIds = new Set(pruned.slice(fromIndex).map((p) => p.id));
  assert.equal(tailIds.has("a10"), false, "última proposta de um candidato inviável não deveria ser sorteada");
  assert.equal(pruned.length, orderedProposals.length - 1, "só a proposta do candidato eliminado deveria sumir");

  const remainingBIds = PROPOSALS.filter((p) => p.candidateId === "cand-b" && p.id !== "b1").map((p) => p.id);
  const remainingCIds = PROPOSALS.filter((p) => p.candidateId === "cand-c" && p.id !== "c1").map((p) => p.id);
  for (const id of [...remainingBIds, ...remainingCIds]) {
    assert.ok(tailIds.has(id), `${id} deveria continuar na fila — só A foi eliminado`);
  }
});

test("Cenário 15 — pruneEliminatedCandidates não elimina candidato sem nenhuma resposta própria ainda", () => {

  const orderedProposals = PROPOSALS;
  const pruned = pruneEliminatedCandidates(orderedProposals, {}, CANDIDATES, 0);
  assert.equal(pruned.length, orderedProposals.length, "sem respostas, nada deveria ser eliminado");
});

test("Cenário 16 — getBestMatch não deixa 2/2 (100% bruto, Wilson ~34%) virar 'o melhor' à frente de candidatos com amostra mínima", () => {

  const tinyPoolCandidate: Candidate = {
    id: "cand-d",
    name: "Candidato D",
    party: "Partido D",
    initials: "CD",
    colorFrom: "#000",
    colorTo: "#111",
  };
  const candidatesWithD = [...CANDIDATES, tinyPoolCandidate];
  const proposalsWithD: Proposal[] = [...PROPOSALS, ...makeProposals("cand-d", "d", 2)];

  const scenario = answers([
    ["d1", true],
    ["d2", true],
    ["a1", false],
    ["a2", false],
    ["a3", false],
    ["a4", false],
    ["a5", false],
    ["b1", false],
    ["b2", false],
    ["b3", false],
    ["b4", false],
    ["b5", false],
  ]);

  const dMatch = calculateAllMatches(scenario, proposalsWithD, candidatesWithD).find(
    (m) => m.candidate.id === "cand-d"
  )!;
  assert.equal(dMatch.percentage, 100, "pré-condição do teste: D precisa aparecer com 100% bruto");
  assert.equal(dMatch.totalAnswered, 2, "pré-condição do teste: D só tem 2 respostas, abaixo do mínimo");

  const best = getBestMatch(scenario, proposalsWithD, candidatesWithD)!;
  assert.notEqual(best.candidate.id, "cand-d", "candidato abaixo da amostra mínima não deveria virar o melhor match");
  assert.ok(best.totalAnswered >= 5, "o melhor match escolhido deveria ter amostra mínima (MIN_CANDIDATE_ANSWERS_FOR_MATCH)");
});

test("Cenário 17 — getBestMatch cai de volta pro topo bruto se NINGUÉM bateu a amostra mínima ainda", () => {

  const veryShort = answers([
    ["a1", true],
    ["a2", true],
  ]);
  const best = getBestMatch(veryShort, PROPOSALS, CANDIDATES);
  assert.ok(best !== null, "deveria retornar o líder disponível mesmo sem ninguém bater a amostra mínima");
  assert.equal(best!.candidate.id, "cand-a");
});
