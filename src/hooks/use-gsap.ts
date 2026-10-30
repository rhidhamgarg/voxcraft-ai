"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * useGsapContext: Scopes GSAP animations to a container element and automatically
 * cleans them up on unmount using gsap.context().
 */
export function useGsapContext(
  callback: (ctx: gsap.Context) => void,
  scope?: React.RefObject<HTMLElement | null>,
  dependencies: any[] = []
) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      callback(ctx);
    }, scope?.current || undefined);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
