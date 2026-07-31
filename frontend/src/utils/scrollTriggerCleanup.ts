import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Tear down all ScrollTriggers and restore pinned DOM nodes before React unmounts.
 * Pass revert=true so GSAP removes .pin-spacer wrappers and puts elements back.
 */
export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => {
    trigger.kill(true);
  });
  ScrollTrigger.clearScrollMemory();
}
