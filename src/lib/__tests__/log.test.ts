import { SESSIONS, doseOf, exerciseCodes, targetReps, EXERCISES } from '../../data/routine';
import {
  collectEntries,
  describeSets,
  lastEntry,
  logKey,
  normalizeLog,
  parseLogKey,
  progressByExercise,
  summarizeDays,
} from '../log';
import { KEY_PATTERN } from '../syncTypes';

describe('rutina', () => {
  it('Upper empieza con el calentamiento de 4 ejercicios y lleva los dos remos', () => {
    const groups = exerciseCodes(SESSIONS.upper);
    expect(groups[0]?.label).toBe('Calentamiento');
    expect(groups[0]?.items.map((i) => i.code)).toEqual(['1', '2', '3', '4']);
    expect(groups[1]?.items[0]?.code).toBe('A1');
    const ids = SESSIONS.upper.blocks.flatMap((b) => b.exercises.map((e) => e.id));
    expect(ids).toEqual(expect.arrayContaining(['rotGoma', 'serratoGoma', 'remoUni', 'remoAlto']));
  });

  it('las claves del registro son válidas para la sincronización', () => {
    for (const s of Object.values(SESSIONS))
      for (const b of s.blocks)
        for (const e of b.exercises) expect(KEY_PATTERN.test(logKey('2026-11-02', s.id, e.id))).toBe(true);
  });

  it('lee la dosis y las repeticiones objetivo', () => {
    const g = EXERCISES.gluteomedio!;
    expect(doseOf(g, 'm')).toBe('3 × 12-15');
    expect(doseOf(g, 'l')).toBe('3 × 10/lado');
    expect(targetReps('3 × 12-15 · ligero')).toBe('12-15');
    expect(targetReps('2 × 12/lado')).toBe('12');
  });
});

describe('registro', () => {
  const store: Record<string, unknown> = {
    [logKey('2026-10-20', 'upper', 'remo')]: { opt: 'm', sets: [{ kg: 20, reps: 12, done: true }, { kg: 22.5, reps: 10, done: true }] },
    [logKey('2026-10-27', 'upper', 'remo')]: { opt: 'm', sets: [{ kg: 25, reps: 12, done: true }] },
    [logKey('2026-10-27', 'upper', 'cuello')]: { opt: 'l', sets: [{ done: true }, { done: false }] },
    [logKey('2026-10-27', 'lower', 'gluteo')]: { opt: 'l', sets: [] },
    'log:mal': { opt: 'm' },
  };
  const entries = collectEntries(Object.keys(store), (k) => store[k]);

  it('ignora claves inválidas y registros vacíos', () => {
    expect(parseLogKey('log:mal')).toBeNull();
    expect(entries).toHaveLength(3);
    expect(entries[0]?.ref.date).toBe('2026-10-27');
  });

  it('completa las series que faltan', () => {
    expect(normalizeLog({ opt: 'x', sets: [{ kg: -1 }] }, 3)).toEqual({
      opt: 'l',
      sets: [
        { kg: null, reps: null, done: false },
        { kg: null, reps: null, done: false },
        { kg: null, reps: null, done: false },
      ],
    });
  });

  it('encuentra la última vez con la misma opción', () => {
    expect(lastEntry(entries, 'remo', 'm', '2026-11-02')?.ref.date).toBe('2026-10-27');
    expect(lastEntry(entries, 'remo', 'm', '2026-10-27')?.ref.date).toBe('2026-10-20');
    expect(lastEntry(entries, 'remo', 'l', '2026-11-02')).toBeNull();
  });

  it('resume los días y la progresión del peso máximo', () => {
    const days = summarizeDays(entries);
    expect(days[0]).toMatchObject({ date: '2026-10-27', session: 'upper', done: 2 });
    const remo = progressByExercise(entries).find((p) => p.exercise === 'remo');
    expect(remo?.points).toEqual([
      { date: '2026-10-20', kg: 22.5 },
      { date: '2026-10-27', kg: 25 },
    ]);
    expect(describeSets(entries[0]!.log)).toMatch(/kg|✓/);
  });
});
