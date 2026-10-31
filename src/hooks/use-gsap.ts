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
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;

    let ctx: gsap.Context | undefined;
    try {
      ctx = gsap.context((self) => {
        try {
          callback(self);
        } catch (err) {
          console.warn("GSAP context callback error:", err);
        }
      }, scope?.current || undefined);
    } catch (e) {
      console.warn("GSAP context creation error:", e);
    }

    return () => {
      try {
        ctx?.revert();
      } catch (err) {
        // ignore revert error on unmount
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

