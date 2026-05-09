import { RECORDING_CONFIG } from "@/config/constants";
import { useEffect, useState } from "react";

export const useTimer = (
  isActive: boolean,
  onMaxReached: () => void,
): number => {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= RECORDING_CONFIG.MAX_DURATION_SECONDS) {
            onMaxReached();
            return RECORDING_CONFIG.MAX_DURATION_SECONDS;
          }
          return next;
        });
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onMaxReached]);

  return seconds;
};
