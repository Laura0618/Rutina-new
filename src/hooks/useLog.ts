import { useCallback, useMemo } from 'react';
import { docStore, useDoc, useDocsVersion } from '../lib/docs';
import { LOG_PREFIX, collectEntries, emptyLog, hasData, logKey, normalizeLog, type Entry, type ExerciseLog, type SetEntry } from '../lib/log';
import type { Exercise, OptionKind, SessionId } from '../data/routine';

export interface Prefs {
  mode: OptionKind;
}

const PREFS_DOC = 'prefs';
const DEFAULT_PREFS: Prefs = { mode: 'm' };

export function usePrefs(): { prefs: Prefs; setMode: (mode: OptionKind) => void } {
  const raw = useDoc<Partial<Prefs> | null>(PREFS_DOC, null);
  const prefs = useMemo<Prefs>(() => ({ mode: raw?.mode === 'l' ? 'l' : DEFAULT_PREFS.mode }), [raw]);
  const setMode = useCallback((mode: OptionKind) => docStore.set(PREFS_DOC, { ...DEFAULT_PREFS, mode }), []);
  return { prefs, setMode };
}

/** Todas las entradas del registro con datos, de la más reciente a la más antigua. */
export function useEntries(): Entry[] {
  const version = useDocsVersion();
  return useMemo(
    () => collectEntries(docStore.keys(LOG_PREFIX), (k) => docStore.get<unknown>(k, null)),
    [version], // eslint-disable-line react-hooks/exhaustive-deps
  );
}

export interface ExerciseLogApi {
  log: ExerciseLog;
  /** Hay un documento guardado para hoy (aunque esté vacío). */
  stored: boolean;
  setOpt: (opt: OptionKind) => void;
  setSet: (index: number, patch: Partial<SetEntry>) => void;
}

/** Registro de un ejercicio en un día. Sin documento, sigue la opción global. */
export function useExerciseLog(date: string, session: SessionId, ex: Exercise, mode: OptionKind): ExerciseLogApi {
  const key = logKey(date, session, ex.id);
  const raw = useDoc<unknown>(key, null);
  const stored = raw !== null;
  const fallbackOpt: OptionKind = ex.m ? mode : 'l';
  const log = useMemo(() => normalizeLog(raw, ex.sets) ?? emptyLog(fallbackOpt, ex.sets), [raw, ex.sets, fallbackOpt]);

  const current = useCallback(
    (): ExerciseLog => normalizeLog(docStore.get<unknown>(key, null), ex.sets) ?? emptyLog(fallbackOpt, ex.sets),
    [key, ex.sets, fallbackOpt],
  );

  const setOpt = useCallback(
    (opt: OptionKind) => {
      const now = current();
      // Al cambiar de opción, los kilos de la otra no sirven.
      docStore.set(key, hasData(now) ? { opt, sets: now.sets.map((s) => ({ ...s, kg: null })) } : emptyLog(opt, ex.sets));
    },
    [current, key, ex.sets],
  );

  const setSet = useCallback(
    (index: number, patch: Partial<SetEntry>) => {
      const now = current();
      const sets = now.sets.map((s, i) => (i === index ? { ...s, ...patch } : s));
      docStore.set(key, { opt: now.opt, sets });
    },
    [current, key],
  );

  return { log, stored, setOpt, setSet };
}

/** Cambia la opción global y suelta los ejercicios de hoy que aún no tienen datos. */
export function applyGlobalMode(date: string, session: SessionId, setMode: (m: OptionKind) => void, mode: OptionKind): void {
  setMode(mode);
  for (const key of docStore.keys(`${LOG_PREFIX}${date}:${session}:`)) {
    const log = normalizeLog(docStore.get<unknown>(key, null), 0);
    if (log && !hasData(log)) docStore.remove(key);
  }
}

/** Borra el registro de hoy de una sesión. */
export function clearDay(date: string, session: SessionId): void {
  for (const key of docStore.keys(`${LOG_PREFIX}${date}:${session}:`)) docStore.remove(key);
}
