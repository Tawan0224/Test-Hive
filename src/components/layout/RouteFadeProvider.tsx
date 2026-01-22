import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type RouteFadeContextValue = {
  /** true when overlay is visible */
  active: boolean;
  /** fade out, then navigate to path */
  fadeTo: (path: string) => void;
  /** fade out, then run any custom action */
  fadeRun: (action: () => void) => void;
};

const RouteFadeContext = createContext<RouteFadeContextValue | null>(null);

export function RouteFadeProvider({
  children,
  durationMs = 260,
}: {
  children: React.ReactNode;
  durationMs?: number;
}) {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const fadeRun = useCallback(
    async (action: () => void) => {
      setActive(true);
      await new Promise((r) => setTimeout(r, durationMs));
      action();
      // drop overlay right away; next page can do its own fade-in if you want
      setActive(false);
    },
    [durationMs]
  );

  const fadeTo = useCallback(
    (path: string) => {
      fadeRun(() => navigate(path));
    },
    [fadeRun, navigate]
  );

  const value = useMemo<RouteFadeContextValue>(
    () => ({ active, fadeTo, fadeRun }),
    [active, fadeTo, fadeRun]
  );

  return <RouteFadeContext.Provider value={value}>{children}</RouteFadeContext.Provider>;
}

export function useRouteFade() {
  const ctx = useContext(RouteFadeContext);
  if (!ctx) {
    throw new Error("useRouteFade must be used inside <RouteFadeProvider>");
  }
  return ctx;
}
