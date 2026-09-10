"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { categoryCodeToLabel } from "@/lib/categories";
import { fetchCandidates } from "@/services/candidates";
import { fetchProposals } from "@/services/proposals";
import type { Candidate, Proposal, UserAnswers } from "@/types";
import { calculateAllMatches, getBestMatch, getCompatibilityBreakdown, meetsMatchThreshold } from "@/utils/calculateMatch";
import { getAnswerHistory } from "@/utils/answerHistory";
import { getCandidateColors, getInitials } from "@/utils/candidateDisplay";
import {
  decideNextPhase,
  MATCH_THRESHOLD_PERCENT,
  MAX_QUESTIONS_FOR_MATCH,
  MIN_QUESTIONS_FOR_MATCH,
  pruneEliminatedCandidates,
  stratifiedShuffle,
} from "@/utils/matchFlow";

const ELECTION_YEAR = 2026;
const POSITION = "PRESIDENT";

export type CandiMatchPhase = "landing" | "swiping" | "provisional" | "final";
export type DataStatus = "loading" | "ready" | "error";

async function loadCandidatesAndProposals() {
  const [candidateRecords, proposalRecords] = await Promise.all([
    fetchCandidates({ position: POSITION, electionYear: ELECTION_YEAR }),
    fetchProposals({ electionYear: ELECTION_YEAR }),
  ]);

  const candidates: Candidate[] = candidateRecords.map((record, index) => ({
    id: record.id,
    name: record.name,
    party: record.partyName ?? record.party,
    initials: getInitials(record.name),
    photoUrl: record.photoUrl ?? undefined,
    ...getCandidateColors(index),
  }));

  const proposals: Proposal[] = proposalRecords.map((record) => ({
    id: record.id,
    candidateId: record.candidateId,
    category: categoryCodeToLabel(record.category),
    text: record.text,
  }));

  return { candidates, proposals };
}

export function useCandiMatch() {
  const [phase, setPhase] = useState<CandiMatchPhase>("landing");
  const [dataStatus, setDataStatus] = useState<DataStatus>("loading");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [orderedProposals, setOrderedProposals] = useState<Proposal[]>([]);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [answeredOrder, setAnsweredOrder] = useState<string[]>([]);
  const [finalCandidateId, setFinalCandidateId] = useState<string | null>(null);

  const [lastShownCandidateId, setLastShownCandidateId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadCandidatesAndProposals()
      .then(({ candidates: loadedCandidates, proposals: loadedProposals }) => {
        if (cancelled) return;
        setCandidates(loadedCandidates);
        setOrderedProposals(loadedProposals);
        setDataStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setDataStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const retryLoad = useCallback(() => {
    setDataStatus("loading");
    loadCandidatesAndProposals()
      .then(({ candidates: loadedCandidates, proposals: loadedProposals }) => {
        setCandidates(loadedCandidates);
        setOrderedProposals(loadedProposals);
        setDataStatus("ready");
      })
      .catch(() => setDataStatus("error"));
  }, []);

  const totalAnswered = answeredOrder.length;
  const totalProposals = orderedProposals.length;
  const currentProposal = orderedProposals[totalAnswered] ?? null;
  const nextProposal = orderedProposals[totalAnswered + 1] ?? undefined;
  const hasMoreProposals = totalAnswered < totalProposals;

  const start = useCallback(() => {
    setOrderedProposals((current) => stratifiedShuffle(current));
    setPhase("swiping");
  }, []);

  const answer = useCallback(
    (proposalId: string, agree: boolean) => {
      const nextAnswers = { ...answers, [proposalId]: agree };
      const nextTotal = answeredOrder.length + 1;

      const prunedProposals = pruneEliminatedCandidates(
        orderedProposals,
        nextAnswers,
        candidates,
        nextTotal + 2
      );

      setAnswers(nextAnswers);
      setAnsweredOrder((prev) => [...prev, proposalId]);
      setOrderedProposals(prunedProposals);

      const decision = decideNextPhase(nextAnswers, prunedProposals, candidates, lastShownCandidateId);
      setLastShownCandidateId(decision.leaderCandidateId);
      if (decision.phase === "provisional") {
        setPhase("provisional");
      }
    },
    [answers, answeredOrder, orderedProposals, candidates, lastShownCandidateId]
  );

  const matches = useMemo(
    () => calculateAllMatches(answers, orderedProposals, candidates),
    [answers, orderedProposals, candidates]
  );

  const bestMatch = useMemo(
    () => getBestMatch(answers, orderedProposals, candidates),
    [answers, orderedProposals, candidates]
  );

  const continueDiscovering = useCallback(() => {
    setPhase("swiping");
  }, []);

  const confirmMatch = useCallback(() => {
    setFinalCandidateId(bestMatch?.candidate.id ?? null);
    setPhase("final");
  }, [bestMatch]);

  const restart = useCallback(() => {
    setPhase("landing");
    setAnswers({});
    setAnsweredOrder([]);
    setFinalCandidateId(null);
    setLastShownCandidateId(null);
    setOrderedProposals((current) => stratifiedShuffle(current));
  }, []);

  const finalMatch = useMemo(() => {
    if (!finalCandidateId) return bestMatch;
    return matches.find((match) => match.candidate.id === finalCandidateId) ?? bestMatch;
  }, [bestMatch, finalCandidateId, matches]);

  const breakdown = useMemo(() => {
    if (!finalMatch) return [];
    return getCompatibilityBreakdown(answers, finalMatch.candidate, orderedProposals, 6);
  }, [answers, finalMatch, orderedProposals]);

  const answerHistory = useMemo(
    () => getAnswerHistory(answeredOrder, answers, orderedProposals, candidates),
    [answeredOrder, answers, orderedProposals, candidates]
  );

  const canContinue = hasMoreProposals && totalAnswered < MAX_QUESTIONS_FOR_MATCH;

  const bestMatchReachedThreshold = bestMatch
    ? meetsMatchThreshold(bestMatch, MATCH_THRESHOLD_PERCENT)
    : false;
  const finalMatchReachedThreshold = finalMatch
    ? meetsMatchThreshold(finalMatch, MATCH_THRESHOLD_PERCENT)
    : false;

  return {
    phase,
    dataStatus,
    retryLoad,
    currentProposal,
    nextProposal,
    progress: {
      current: totalAnswered,

      total: totalAnswered < MIN_QUESTIONS_FOR_MATCH ? MIN_QUESTIONS_FOR_MATCH : undefined,
    },
    hasMoreProposals,
    canContinue,
    bestMatch,
    bestMatchReachedThreshold,
    finalMatch,
    finalMatchReachedThreshold,
    breakdown,
    answerHistory,
    start,
    answer,
    continueDiscovering,
    confirmMatch,
    restart,
  };
}
