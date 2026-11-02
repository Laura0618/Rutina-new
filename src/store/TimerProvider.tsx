import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface TimerState {
  label: string;
  total: number;
  /** Momento en que acaba (epoch ms): así sigue bien aunque el móvil bloquee la pantalla. */
  endsAt: number;
}

interface TimerContextValue {
  timer: TimerState | null;
  left: number;
  start: (seconds: number, label: string) => void;
  stop: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }): JSX.Element {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timer) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [timer]);

  const left = timer ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : 0;
  const finished = timer !== null && left === 0;

  useEffect(() => {
    if (!finished) return;
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      /* sin vibración */
    }
  }, [finished]);

  const start = useCallback((seconds: number, label: string) => {
    const t = Date.now();
    setNow(t);
    setTimer({ label, total: seconds, endsAt: t + seconds * 1000 });
  }, []);
  const stop = useCallback(() => setTimer(null), []);

  const value = useMemo(() => ({ timer, left, start, stop }), [timer, left, start, stop]);
  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer debe usarse dentro de TimerProvider.');
  return ctx;
}

export function formatClock(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
