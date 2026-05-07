import { useEffect, useState } from "react";

const TARGET = new Date("2026-05-10T00:00:00-03:00").getTime();

export function Countdown({ light = false }: { light?: boolean }) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const diff = Math.max(0, TARGET - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);

  const items = [
    { v: d, l: "dias" },
    { v: h, l: "horas" },
    { v: m, l: "min" },
    { v: s, l: "seg" },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {items.map((it, i) => (
        <div
          key={i}
          className={`flex min-w-[60px] flex-col items-center rounded-xl px-3 py-2 ${
            light ? "bg-background/15 text-primary-foreground backdrop-blur-md" : "bg-card text-foreground shadow-soft"
          }`}
        >
          <span className="text-2xl font-bold tabular-nums sm:text-3xl">
            {String(it.v).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-widest opacity-80">{it.l}</span>
        </div>
      ))}
    </div>
  );
}
