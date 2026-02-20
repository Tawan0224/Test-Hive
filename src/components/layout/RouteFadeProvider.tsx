import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

type RouteFadeContextValue = {
  /** true while the overlay is visible */
  active: boolean;
  /** fade overlay in → navigate → fade overlay out (reveals new page) */
  fadeTo: (path: string, state?: unknown) => void;
  /** fade overlay in → run action → fade overlay out */
  fadeRun: (action: () => void) => void;
};

const RouteFadeContext = createContext<RouteFadeContextValue | null>(null);

export function RouteFadeProvider({
  children,
  durationMs = 280,
}: {
  children: React.ReactNode;
  durationMs?: number;
}) {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const busy = useRef(false); // prevent double-trigger

  const fadeRun = useCallback(
    async (action: () => void) => {
      if (busy.current) return;
      busy.current = true;

      // Step 1: Fade overlay IN (covers the current page)
      setActive(true);
      await new Promise((r) => setTimeout(r, durationMs));

      // Step 2: Perform the navigation / action
      action();

      // Step 3: One tick so React can render the new route beneath the overlay
      await new Promise((r) => setTimeout(r, 30));

      // Step 4: Fade overlay OUT (new page gently appears)
      setActive(false);
      busy.current = false;
    },
    [durationMs]
  );

  const fadeTo = useCallback(
    (path: string, state?: unknown) => {
      fadeRun(() =>
        navigate(path, state !== undefined ? { state } : undefined)
      );
    },
    [fadeRun, navigate]
  );

  const value = useMemo<RouteFadeContextValue>(
    () => ({ active, fadeTo, fadeRun }),
    [active, fadeTo, fadeRun]
  );

  return (
    <RouteFadeContext.Provider value={value}>
      {children}
    </RouteFadeContext.Provider>
  );
}

export function useRouteFade() {
  const ctx = useContext(RouteFadeContext);
  if (!ctx) {
    throw new Error("useRouteFade must be used inside <RouteFadeProvider>");
  }
  return ctx;
}