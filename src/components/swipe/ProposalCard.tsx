"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { Heart, X } from "lucide-react";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { useSwipeCard, type SwipeDirection } from "@/hooks/useSwipeCard";
import type { Proposal } from "@/types";

export interface ProposalCardHandle {
  swipe: (direction: SwipeDirection) => void;
}

interface ProposalCardProps {
  proposal: Proposal;
  onSwipe: (direction: SwipeDirection) => void;

  interactive?: boolean;

  stackOffset?: 0 | 1;

  onDragProgress?: (progress: number) => void;
}

const FONT_SIZE_STEPS = [
  "text-2xl sm:text-3xl",
  "text-xl sm:text-2xl",
  "text-lg sm:text-xl",
  "text-base sm:text-lg",
  "text-sm sm:text-base",
] as const;

const MAX_FONT_STEP = FONT_SIZE_STEPS.length - 1;

export const ProposalCard = forwardRef<ProposalCardHandle, ProposalCardProps>(function ProposalCard(
  { proposal, onSwipe, interactive = true, stackOffset = 0, onDragProgress },
  ref
) {
  const { bind, offsetX, offsetY, rotation, isDragging, isExiting, swipe } = useSwipeCard({
    onSwipe,
    exitDuration: 900,
  });

  useImperativeHandle(ref, () => ({ swipe }), [swipe]);

  useEffect(() => {
    if (!interactive) return;
    onDragProgress?.(Math.max(-1, Math.min(1, offsetX / 100)));
  }, [interactive, offsetX, onDragProgress]);

  const [fontStep, setFontStep] = useState(0);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const area = textAreaRef.current;
    const text = textRef.current;
    if (!area || !text || fontStep >= MAX_FONT_STEP) return;

    if (text.scrollHeight > area.clientHeight) {
      setFontStep((step) => Math.min(step + 1, MAX_FONT_STEP));
    }
  }, [fontStep]);

  const transform =
    stackOffset === 0
      ? `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`
      : `translateY(${stackOffset * 14}px) scale(${1 - stackOffset * 0.05})`;

  const likeOpacity = Math.min(Math.max(offsetX / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-offsetX / 100, 0), 1);

  return (
    <div
      {...(interactive ? bind : {})}
      className={[
        "absolute inset-0 flex select-none flex-col rounded-[28px] border border-white/60 bg-white/95 p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-sm",
        interactive ? "touch-none cursor-grab active:cursor-grabbing" : "pointer-events-none",

        isDragging
          ? ""
          : isExiting
            ? "transition duration-[900ms] ease-[cubic-bezier(0.33,1,0.68,1)]"
            : "transition duration-[400ms] ease-out",
        stackOffset > 0 ? "opacity-60" : "",
      ].join(" ")}
      style={{ transform, zIndex: stackOffset === 0 ? 10 : 5 }}
    >
      {interactive && (
        <>
          <div
            className="pointer-events-none absolute left-6 top-6 flex -rotate-12 items-center gap-1.5 rounded-lg border-4 border-rose-500 px-3 py-1 text-xl font-extrabold uppercase tracking-wide text-rose-500"
            style={{ opacity: nopeOpacity }}
          >
            <X className="h-5 w-5" strokeWidth={3} aria-hidden />
            Discordo
          </div>
          <div
            className="pointer-events-none absolute right-6 top-6 flex rotate-12 items-center gap-1.5 rounded-lg border-4 border-emerald-500 px-3 py-1 text-xl font-extrabold uppercase tracking-wide text-emerald-500"
            style={{ opacity: likeOpacity }}
          >
            <Heart className="h-5 w-5" fill="currentColor" strokeWidth={0} aria-hidden />
            Concordo
          </div>
        </>
      )}

      <div className="shrink-0">
        <CategoryBadge category={proposal.category} />
      </div>

      <div ref={textAreaRef} className="my-1 flex min-h-0 flex-1 flex-col">
        <p
          ref={textRef}
          className={[
            "my-auto max-w-full break-words text-center leading-snug font-semibold text-zinc-900",
            FONT_SIZE_STEPS[fontStep],
          ].join(" ")}
        >
          &ldquo;{proposal.text}&rdquo;
        </p>
      </div>

      <p className="h-4 shrink-0 text-sm text-zinc-400">
        {interactive ? "Arraste ou use os botões abaixo" : ""}
      </p>
    </div>
  );
});
