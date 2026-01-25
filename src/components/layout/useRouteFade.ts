import { useCallback, useState } from "react";

export function useRouteFade(durationMs = 260) {
  const [active, setActive] = useState(false);

  const start = useCallback(() => {
    setActive(true);
  }, []);

  const end = useCallback(() => {
    setActive(false);
  }, []);


  const fadeNavigate = useCallback(
    async (go: () => void) => {
      setActive(true);
      await new Promise((r) => setTimeout(r, durationMs));
      go();
      // let next page handle its own fade-in; overlay drops immediately
      setActive(false);
    },
    [durationMs]
  );

  return { active, start, end, fadeNavigate };
}
