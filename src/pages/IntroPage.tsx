import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  a: number;
  tw: number;
};

function easeInOutCubic(t: number) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function IntroPage() {
  const nav = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);

  const COLORS = useMemo(
    () => ({
      bg: "#0a0a12",
      bg2: "#0f0f1a",
      purple: "#9333EA",
      blue: "#3B82F6",
    }),
    []
  );

  // STARFIELD CANVAS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const STAR_COUNT = 520;
    const stars: Star[] = [];

    const rand = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seedStars = () => {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: rand(-width * 0.5, width * 1.5),
          y: rand(-height * 0.5, height * 1.5),
          z: rand(0.2, 1),
          r: rand(0.5, 1.8),
          a: rand(0.18, 0.85),
          tw: rand(0.002, 0.01),
        });
      }
    };

    let t = 0;

    const draw = () => {
      t += 1;

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, COLORS.bg);
      bg.addColorStop(1, COLORS.bg2);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // nebula glow
      ctx.globalCompositeOperation = "screen";
      const glow = ctx.createRadialGradient(
        width * 0.55,
        height * 0.35,
        0,
        width * 0.55,
        height * 0.35,
        Math.max(width, height) * 0.6
      );
      glow.addColorStop(0, "rgba(147,51,234,0.12)");
      glow.addColorStop(1, "rgba(147,51,234,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      // stars
      for (const s of stars) {
        s.x -= 0.12 + (1 - s.z) * 0.28;
        s.y += 0.07 + (1 - s.z) * 0.22;

        if (s.x < -width * 0.25) s.x = width * 1.25;
        if (s.y > height * 1.25) s.y = -height * 0.25;

        const twinkle = 0.6 + 0.4 * Math.sin(t * s.tw);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${s.a * twinkle})`;
        ctx.arc(
          s.x,
          s.y,
          s.r * (0.7 + (1 - s.z) * 0.8),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    seedStars();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [COLORS]);

  // PROGRESS LOADER
  useEffect(() => {
    const total = 5200;
    const start = performance.now();
    const pauses = new Set([18, 33, 52, 71, 86, 94]);
    let pausedUntil = 0;

    let rafId = 0;
    const tick = (now: number) => {
      if (now < pausedUntil) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const raw = Math.min(1, (now - start) / total);
      const eased = easeInOutCubic(raw);
      const value = Math.round(eased * 100);

      if (pauses.has(value)) {
        pausedUntil = now + 180 + Math.random() * 200;
        pauses.delete(value);
      }

      setProgress(value);

      if (raw >= 1) {
        setTimeout(() => nav("/login", { replace: true }), 250);
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [nav]);

  // RENDER
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 2px, transparent 6px)",
        }}
      />

      {/* loader */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <svg width="92" height="92">
              <circle
                cx="46"
                cy="46"
                r={radius}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="46"
                cy="46"
                r={radius}
                stroke={COLORS.blue}
                strokeWidth="5"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  filter: "drop-shadow(0 0 8px rgba(59,130,246,0.45))",
                }}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-sm text-white">
              {progress}
            </div>
          </div>

          <div className="text-xs tracking-[0.28em] text-white/55">
            CONNECTING // TEST-HIVE CORE
          </div>
          <div className="text-[11px] text-white/45">
            syncing star map • waking monsters • forging quizzes
          </div>
        </div>
      </div>
    </div>
  );
}
