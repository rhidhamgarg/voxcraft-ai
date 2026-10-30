import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Only register ScrollTrigger on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Check prefers-reduced-motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Premium Easing Curves inspired by Linear, Apple & Framer
export const MOTION = {
  ease: {
    smooth: "power3.out",
    expo: "expo.out",
    gentle: "power2.out",
    snap: "circ.out",
  },
  duration: {
    micro: 0.2,       // 200ms
    component: 0.35,  // 350ms
    section: 0.65,    // 650ms
    reveal: 0.75,     // 750ms
  },
};

export { gsap, ScrollTrigger };
