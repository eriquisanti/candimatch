"use client";

import { useEffect, useState } from "react";

export type MatchRevealStage = "intro" | "percent" | "exiting" | "done";

const PERCENT_DELAY = 1300;
const AUTO_EXIT_DELAY = 2900;
const EXIT_DURATION = 500;

export function useMatchReveal(matchKey: string) {
  const [stage, setStage] = useState<MatchRevealStage>("intro");
  const [trackedKey, setTrackedKey] = useState(matchKey);

  if (trackedKey !== matchKey) {
    setTrackedKey(matchKey);
    setStage("intro");
  }

  useEffect(() => {
    const percentTimer = window.setTimeout(() => setStage("percent"), PERCENT_DELAY);
    const exitTimer = window.setTimeout(() => setStage("exiting"), AUTO_EXIT_DELAY);
    const doneTimer = window.setTimeout(() => setStage("done"), AUTO_EXIT_DELAY + EXIT_DURATION);

    return () => {
      window.clearTimeout(percentTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, [matchKey]);

  function skip() {
    if (stage === "exiting" || stage === "done") return;
    setStage("exiting");
    window.setTimeout(() => setStage("done"), EXIT_DURATION);
  }

  return { stage, isRevealing: stage !== "done", skip };
}
