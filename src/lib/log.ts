/**
 * Registro de entrenos. Cada ejercicio de cada dia es un documento sincronizable:
 *
 *   log:YYYY-MM-DD:<sesion>:<ejercicio>  ->  { opt, sets: [{ kg, reps, done }] }
 *
 * Asi dos dispositivos no se pisan salvo que editen el mismo ejercicio el mismo dia.
 */
import { EXERCISES, SESSIONS, isSessionId, optionOf, type OptionKind, type SessionId } from '../data/routine';

export interface SetEntry {
  kg: number | null;
  reps: number | null;
  done: boolean;
}

export interface ExerciseLog {
  opt: OptionKind;
  sets: SetEntry[];
}

export interface LogRef {
  key: string;
  date: string;
  session: SessionId;
  exercise: string;
}

export const LOG_PREFIX = 'log:';

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function logKey(date: string, session: SessionId, exercise: string): string {
  return `${LOG_PREFIX}${date}:${session}:${exercise}`;
}

export function parseLogKey(key: string): LogRef | null {
  const m = /^log:(\d{4}-\d{2}-\d{2}):([a-z]+):([A-Za-z0-9]+)$/.exec(key);
  if (!m || !isSessionId(m[2])) return null;
  return { key, date: m[1] as string, session: m[2], exercise: m[3] as string };
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);

/** Valida y completa un registro guardado (puede venir de otra version o dispositivo). */
export function normalizeLog(raw: unknown, sets: number): ExerciseLog | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const opt: OptionKind = r.opt === 'm' ? 'm' : 'l';
  const list = Array.isArray(r.sets) ? r.sets : [];
  const out: SetEntry[] = [];
  for (let i = 0; i < Math.max(sets, list.length); i++) {
    const s = (list[i] ?? {}) as Record<string, unknown>;
    out.push({ kg: num(s.kg), reps: num(s.reps), done: s.done === true });
  }
  return { opt, sets: out };
}

export function emptyLog(opt: OptionKind, sets: number): ExerciseLog {
  return { opt, sets: Array.from({ length: sets }, () => ({ kg: null, reps: null, done: false })) };
}

/** Un registro cuenta si tiene alguna serie hecha o algun dato apuntado. */
export function hasData(log: ExerciseLog): boolean {
  return log.sets.some((s) => s.done || s.kg !== null || s.reps !== null);
}

export function topKg(log: ExerciseLog): number | null {
  let best: number | null = null;
  for (const s of log.sets) if (s.kg !== null && (best === null || s.kg > best)) best = s.kg;
  return best;
}

export interface Entry {
  ref: LogRef;
  log: ExerciseLog;
}

/** Entradas con datos, de la mas reciente a la mas antigua. */
export function collectEntries(keys: readonly string[], read: (key: string) => unknown): Entry[] {
  const out: Entry[] = [];
  for (const key of keys) {
    const ref = parseLogKey(key);
    if (!ref) continue;
    const ex = EXERCISES[ref.exercise];
    const log = normalizeLog(read(key), ex?.sets ?? 0);
    if (log && hasData(log)) out.push({ ref, log });
  }
  return out.sort((a, b) => (a.ref.date === b.ref.date ? a.ref.key.localeCompare(b.ref.key) : b.ref.date.localeCompare(a.ref.date)));
}

/** Ultima vez que se hizo este ejercicio con esta opcion, antes de `before`. */
export function lastEntry(entries: readonly Entry[], exercise: string, opt: OptionKind, before: string): Entry | null {
  for (const e of entries) {
    if (e.ref.exercise === exercise && e.log.opt === opt && e.ref.date < before) return e;
  }
  return null;
}

export interface DaySummary {
  date: string;
  session: SessionId;
  done: number;
  total: number;
  entries: Entry[];
}

/** Un resumen por dia y sesion, del mas reciente al mas antiguo. */
export function summarizeDays(entries: readonly Entry[]): DaySummary[] {
  const map = new Map<string, DaySummary>();
  for (const e of entries) {
    const id = `${e.ref.date}:${e.ref.session}`;
    let day = map.get(id);
    if (!day) {
      const session = SESSIONS[e.ref.session];
      const total = session.blocks.reduce(
        (a, b) => a + b.exercises.reduce((n, ex) => n + ex.sets - (ex.optionalLast ? 1 : 0), 0),
        0,
      );
      day = { date: e.ref.date, session: e.ref.session, done: 0, total, entries: [] };
      map.set(id, day);
    }
    day.entries.push(e);
    day.done += e.log.sets.filter((s) => s.done).length;
  }
  return [...map.values()].sort((a, b) => (a.date === b.date ? a.session.localeCompare(b.session) : b.date.localeCompare(a.date)));
}

export interface Progress {
  exercise: string;
  opt: OptionKind;
  name: string;
  /** Peso maximo por dia, del mas antiguo al mas reciente. */
  points: { date: string; kg: number }[];
}

/** Evolucion del peso maximo por ejercicio y opcion (solo los que llevan kilos). */
export function progressByExercise(entries: readonly Entry[]): Progress[] {
  const map = new Map<string, Progress>();
  for (const e of [...entries].reverse()) {
    const kg = topKg(e.log);
    const ex = EXERCISES[e.ref.exercise];
    if (kg === null || !ex) continue;
    const id = `${e.ref.exercise}:${e.log.opt}`;
    let p = map.get(id);
    if (!p) {
      p = { exercise: e.ref.exercise, opt: e.log.opt, name: optionOf(ex, e.log.opt).option.name, points: [] };
      map.set(id, p);
    }
    const last = p.points[p.points.length - 1];
    if (last && last.date === e.ref.date) last.kg = Math.max(last.kg, kg);
    else p.points.push({ date: e.ref.date, kg });
  }
  return [...map.values()].sort((a, b) => {
    const da = a.points[a.points.length - 1]?.date ?? '';
    const db = b.points[b.points.length - 1]?.date ?? '';
    return db.localeCompare(da) || a.name.localeCompare(b.name);
  });
}

/** "12 oct" */
export function shortDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
}

/** "lunes, 2 nov" */
export function longDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1)
    .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
    .replace('.', '');
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString('es-ES', { maximumFractionDigits: 2 })} kg`;
}

/** Texto de un registro: "20 × 12 · 20 × 12 · 22,5 × 10". */
export function describeSets(log: ExerciseLog): string {
  return log.sets
    .filter((s) => s.done || s.kg !== null || s.reps !== null)
    .map((s) => {
      const kg = s.kg !== null ? s.kg.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : null;
      const reps = s.reps !== null ? String(s.reps) : null;
      if (kg && reps) return `${kg} kg × ${reps}`;
      if (kg) return `${kg} kg`;
      if (reps) return `${reps} reps`;
      return '✓';
    })
    .join(' · ');
}
