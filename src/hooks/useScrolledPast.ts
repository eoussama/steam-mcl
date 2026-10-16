import type { RefObject } from "react";

import { useEffect, useState } from "react";



/**
 * @description
 * Tracks whether an element has scrolled entirely above the top of the viewport. Placed right before a sticky
 * element, it tells when that element is stuck, without being affected by the sticky element changing size.
 *
 * @param ref - Element to watch.
 * @param offset - Height covered at the top of the viewport, such as a sticky header, in pixels.
 * @returns Whether the element is above the viewport.
 */
export function useScrolledPast(ref: RefObject<Element | null>, offset = 0): boolean {
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsPast(!entry.isIntersecting && entry.boundingClientRect.top < offset);
      }
    }, { rootMargin: `-${offset}px 0px 0px 0px` });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, offset]);

  return isPast;
}
