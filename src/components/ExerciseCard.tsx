import { useEffect, useState } from 'react';
import { doseOf, optionOf, targetReps, type Exercise, type OptionKind, type SessionId } from '../data/routine';
import { useExerciseLog } from '../hooks/useLog';
import { describeSets, lastEntry, shortDate, type Entry, type SetEntry } from '../lib/log';
import { IconCheck } from './Icons';

/** Campo numérico que admite coma decimal y no pierde lo que escribes a medias. */
function NumberField({
  id,
  value,
  placeholder,
  decimal,
  label,
  onCommit,
}: {
  id: string;
  value: number | null;
  placeholder: string;
  decimal: boolean;
  label: string;
  onCommit: (v: number | null) => void;
}): JSX.Element {
  const shown = value === null ? '' : value.toLocaleString('es-ES', { maximumFractionDigits: 2, useGrouping: false });
  const [draft, setDraft] = useState(shown);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(shown);
  }, [shown, focused]);

  const commit = (text: string): void => {
    const clean = text.trim().replace(',', '.');
    if (clean === '') return onCommit(null);
    const n = Number(clean);
    if (Number.isFinite(n) && n >= 0 && n < 1000) onCommit(decimal ? Math.round(n * 100) / 100 : Math.round(n));
  };

  return (
    <input
      id={id}
      className="num"
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      autoComplete="off"
      aria-label={label}
      placeholder={placeholder}
      value={focused ? draft : shown}
      onFocus={() => {
        setFocused(true);
        setDraft(shown);
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        if (!/[.,]$/.test(e.target.value)) commit(e.target.value);
      }}
      onBlur={() => {
        commit(draft);
        setFocused(false);
      }}
    />
  );
}

interface Props {
  ex: Exercise;
  code: string;
  date: string;
  session: SessionId;
  mode: OptionKind;
  entries: readonly Entry[];
}

export function ExerciseCard({ ex, code, date, session, mode, entries }: Props): JSX.Element {
  const { log, setOpt, setSet } = useExerciseLog(date, session, ex, mode);
  const { kind, option } = optionOf(ex, log.opt);
  const dose = doseOf(ex, kind);
  const [main, extra] = dose.split(' · ');
  const reps = targetReps(dose);
  const last = lastEntry(entries, ex.id, kind, date);
  const required = log.sets.filter((_, i) => !(ex.optionalLast && i === log.sets.length - 1));
  const complete = required.length > 0 && required.every((s) => s.done);

  const toggleDone = (i: number, s: SetEntry): void => {
    if (s.done) return setSet(i, { done: false });
    // Al marcar una serie vacía, propone lo de la última vez.
    const prev = last?.log.sets[i] ?? last?.log.sets[last.log.sets.length - 1];
    const firstReps = Number(/^\d+/.exec(reps)?.[0]);
    setSet(i, {
      done: true,
      kg: s.kg ?? (option.load ? (prev?.kg ?? null) : null),
      reps: s.reps ?? prev?.reps ?? (Number.isFinite(firstReps) ? firstReps : null),
    });
  };

  return (
    <article className="ex" data-done={complete}>
      <span className="ex-code" aria-hidden="true">
        {code}
      </span>
      <div className="ex-main">
        <p className="eyebrow">{ex.group}</p>
        <h3 className="ex-name">{option.name}</h3>
        <p className="dose">
          {main}
          {extra && <small>{extra}</small>}
        </p>
        <p className="cue">{option.cue}</p>

        <div className="ex-meta">
          {ex.m ? (
            <div className="mini" role="group" aria-label={`Opción para ${code}`}>
              {(['m', 'l'] as const).map((k) => (
                <button key={k} type="button" aria-pressed={kind === k} onClick={() => kind !== k && setOpt(k)}>
                  {k === 'm' ? 'Máquina' : 'Sin máquina'}
                </button>
              ))}
            </div>
          ) : (
            <span className="only">Sin máquina</span>
          )}
          {option.url && (
            <a className="model" href={option.url} target="_blank" rel="noopener noreferrer">
              {option.model} ↗
            </a>
          )}
        </div>

        {last && (
          <p className="last">
            <span>Última vez · {shortDate(last.ref.date)}</span> {describeSets(last.log)}
          </p>
        )}

        <ol className="sets">
          {log.sets.map((s, i) => {
            const optional = ex.optionalLast && i === log.sets.length - 1;
            const prev = last?.log.sets[i];
            return (
              <li key={i} className="set" data-done={s.done} data-optional={optional || undefined}>
                <span className="set-n">{optional ? `${i + 1}*` : i + 1}</span>
                {option.load ? (
                  <label className="field">
                    <NumberField
                      id={`kg-${code}-${i}`}
                      value={s.kg}
                      decimal
                      placeholder={prev?.kg != null ? String(prev.kg).replace('.', ',') : '–'}
                      label={`Kilos, serie ${i + 1}`}
                      onCommit={(kg) => setSet(i, { kg })}
                    />
                    <span>kg</span>
                  </label>
                ) : (
                  <span className="field none">—</span>
                )}
                <label className="field">
                  <NumberField
                    id={`reps-${code}-${i}`}
                    value={s.reps}
                    decimal={false}
                    placeholder={prev?.reps != null ? String(prev.reps) : reps || '–'}
                    label={`Repeticiones, serie ${i + 1}`}
                    onCommit={(r) => setSet(i, { reps: r })}
                  />
                  <span>reps</span>
                </label>
                <button
                  type="button"
                  className="check"
                  aria-pressed={s.done}
                  aria-label={`Serie ${i + 1} ${s.done ? 'hecha' : 'pendiente'}`}
                  onClick={() => toggleDone(i, s)}
                >
                  <IconCheck />
                </button>
              </li>
            );
          })}
        </ol>
        {ex.optionalLast && <p className="note">* Serie opcional.</p>}
      </div>
    </article>
  );
}
