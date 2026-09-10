"use client";

import { LandingScreen } from "@/components/landing/LandingScreen";
import { FinalMatchScreen } from "@/components/match/FinalMatchScreen";
import { ProvisionalMatchScreen } from "@/components/match/ProvisionalMatchScreen";
import { SwipeScreen } from "@/components/swipe/SwipeScreen";
import { useCandiMatch } from "@/hooks/useCandiMatch";

export function CandiMatchApp() {
  const candi = useCandiMatch();

  return (
    <div className="relative flex min-h-dvh w-full justify-center overflow-hidden bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100">

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-rose-300/40 blur-[100px]" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-[100px]" />
        <div className="absolute bottom-[-6rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-300/30 blur-[110px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col">
        {candi.phase === "landing" && (
          <LandingScreen onStart={candi.start} dataStatus={candi.dataStatus} onRetry={candi.retryLoad} />
        )}

        {candi.phase === "swiping" && candi.currentProposal && (
          <SwipeScreen
            proposal={candi.currentProposal}
            nextProposal={candi.nextProposal}
            progressCurrent={candi.progress.current}
            progressTotal={candi.progress.total}
            onAnswer={candi.answer}
          />
        )}

        {candi.phase === "provisional" && candi.bestMatch && (
          <ProvisionalMatchScreen
            match={candi.bestMatch}
            reachedThreshold={candi.bestMatchReachedThreshold}
            canContinue={candi.canContinue}
            onContinue={candi.continueDiscovering}
            onConfirm={candi.confirmMatch}
          />
        )}

        {candi.phase === "final" && candi.finalMatch && (
          <FinalMatchScreen
            match={candi.finalMatch}
            reachedThreshold={candi.finalMatchReachedThreshold}
            breakdown={candi.breakdown}
            answerHistory={candi.answerHistory}
            onRestart={candi.restart}
          />
        )}
      </div>
    </div>
  );
}
