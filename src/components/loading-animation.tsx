"use client";

import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";

const LOOP_START_FRAME = 0;
const LOOP_END_FRAME = 75;

export function LoadingAnimation() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!containerRef.current) return;

      const response = await fetch("/animations/nursing-loading.json");
      const animationData = await response.json();
      if (cancelled || !containerRef.current) return;

      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      const animation = animationRef.current;
      animation.goToAndStop(LOOP_START_FRAME, true);
      animation.playSegments([LOOP_START_FRAME, LOOP_END_FRAME], true);
      animation.addEventListener("complete", () => {
        animation.goToAndStop(LOOP_START_FRAME, true);
        animation.playSegments([LOOP_START_FRAME, LOOP_END_FRAME], true);
      });
    }

    void load();

    return () => {
      cancelled = true;
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-40 w-40" aria-label="Loading" role="img" />;
}
