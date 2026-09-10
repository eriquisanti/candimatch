"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";

export type SwipeDirection = "left" | "right";

interface UseSwipeCardOptions {
  onSwipe: (direction: SwipeDirection) => void;

  threshold?: number;

  exitDuration?: number;
}

function getExitDistance() {
  if (typeof window === "undefined") return 700;
  return window.innerWidth / 2 + 260;
}

export function useSwipeCard({ onSwipe, threshold = 120, exitDuration = 300 }: UseSwipeCardOptions) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);

  const commitSwipe = useCallback(
    (direction: SwipeDirection, fromY: number) => {
      const exitDistance = getExitDistance();
      setIsExiting(true);
      setIsDragging(false);
      setOffset({ x: direction === "right" ? exitDistance : -exitDistance, y: fromY });
      window.setTimeout(() => onSwipe(direction), exitDuration);
    },
    [exitDuration, onSwipe]
  );

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (isExiting) return;
      startPoint.current = { x: event.clientX, y: event.clientY };
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [isExiting]
  );

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!startPoint.current) return;

    const maxOffsetX = typeof window === "undefined" ? 600 : window.innerWidth * 0.6;
    const rawX = event.clientX - startPoint.current.x;
    setOffset({
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, rawX)),
      y: event.clientY - startPoint.current.y,
    });
  }, []);

  const finishDrag = useCallback(() => {
    if (!startPoint.current) return;
    startPoint.current = null;
    setIsDragging(false);

    if (Math.abs(offset.x) > threshold) {
      commitSwipe(offset.x > 0 ? "right" : "left", offset.y);
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [commitSwipe, offset, threshold]);

  const swipe = useCallback(
    (direction: SwipeDirection) => {
      if (isExiting) return;
      commitSwipe(direction, 0);
    },
    [commitSwipe, isExiting]
  );

  const rotation = Math.max(Math.min(offset.x / 12, 18), -18);

  return {
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,

      onLostPointerCapture: finishDrag,
    },
    offsetX: offset.x,
    offsetY: offset.y,
    rotation,
    isDragging,
    isExiting,
    swipe,
  };
}
