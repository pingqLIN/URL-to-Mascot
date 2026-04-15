import { useEffect, useRef, useState } from 'react';

export function useBgFlash() {
  const [bgOverride, setBgOverride] = useState<string | null>(null);
  const bgTimerRef = useRef<ReturnType<typeof window.setTimeout>[]>([]);

  const clearBgTimers = () => {
    bgTimerRef.current.forEach((timer) => window.clearTimeout(timer));
    bgTimerRef.current = [];
  };

  const flashBackground = async (flashImage: string, durationMs = 5000) => {
    clearBgTimers();
    setBgOverride(flashImage);
    bgTimerRef.current.push(
      window.setTimeout(() => {
        setBgOverride(null);
      }, durationMs),
    );
  };

  useEffect(() => clearBgTimers, []);

  return {
    bgOverride,
    flashBackground,
    clearBgTimers,
  };
}
