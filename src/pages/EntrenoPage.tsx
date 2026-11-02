import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SESSIONS, SESSION_IDS, exerciseCodes, isSessionId, type SessionId } from '../data/routine';
import { ExerciseCard } from '../components/ExerciseCard';
import { IconClock } from '../components/Icons';
import { applyGlobalMode, clearDay, useEntries, usePrefs } from '../hooks/useLog';
import { dateKey, longDate } from '../lib/log';
import { readJSON, writeJSON, KEYS } from '../lib/storage';
import { formatClock, useTimer } from '../store/TimerProvider';

export function EntrenoPage(): JSX.Element {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get('s');
  const sessionId: SessionId = isSessionId(fromUrl) ? fromUrl : readJSON<SessionId>(KEYS.session, 'upper');
  const session = SESSIONS[isSessionId(sessionId) ? sessionId : 'upper'];
  const date = dateKey(new Date());
  const { prefs, setMode } = usePrefs();
  const entries = useEntries();
  const { start } = useTimer();
  const [confirmClear, setConfirmClear] = useState(false);

  const groups = useMemo(() => exerciseCodes(session), [session]);
  const nExercises = session.blocks.reduce((a, b) => a + b.exercises.length, 0);
  const total = session.blocks.reduce((a, b) => a + b.exercises.reduce((n, e) => n + e.sets - (e.optionalLast ? 1 : 0), 0), 0);
  const doneToday = entries
    .filter((e) => e.ref.date === date && e.ref.session === session.id)
    .reduce((n, e) => {
      const ex = session.blocks.flatMap((b) => b.exercises).find((x) => x.id === e.ref.exercise);
      return n + e.log.sets.filter((s, i) => s.done && !(ex?.optionalLast && i === e.log.sets.length - 1)).length;
    }, 0);
  const hasToday = entries.some((e) => e.ref.date === date && e.ref.session === session.id);

  const pick = (id: SessionId): void => {
    writeJSON(KEYS.session, id);
    setParams({ s: id }, { replace: true });
    setConfirmClear(false);
  };

  return (
    <>
      <div className="picker" role="tablist" aria-label="Sesiones">
        {SESSION_IDS.map((id) => (
          <button key={id} type="button" role="tab" aria-selected={id === session.id} onClick={() => pick(id)}>
            {SESSIONS[id].title}
          </button>
        ))}
      </div>

      <section className="hero">
        <p className="eyebrow">{longDate(date)}</p>
        <h1>{session.title}</h1>
        <p className="hero-sub">{session.sub}</p>
        <div className="stats">
          <div className="stat">
            <b>~{session.minutes}</b>
            <span>Minutos</span>
          </div>
          <div className="stat">
            <b>{nExercises}</b>
            <span>Ejercicios</span>
          </div>
          <div className="stat">
            <b>
              {Math.min(doneToday, total)}/{total}
            </b>
            <span>Series</span>
          </div>
        </div>
        <div className="bar" aria-hidden="true">
          <i style={{ width: `${Math.min(100, (doneToday / total) * 100)}%` }} />
        </div>
      </section>

      <div className="switch" role="group" aria-label="Equipamiento">
        {(['m', 'l'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={prefs.mode === m}
            onClick={() => applyGlobalMode(date, session.id, setMode, m)}
          >
            {m === 'm' ? 'Máquina' : 'Sin máquina'}
          </button>
        ))}
      </div>

      <div className="blocks">
        {groups.map(({ block, label, items }) => (
          <section key={label} className="block">
            <div className="block-head">
              <h2>
                {label}
                <span>{block.warm ? 'Circuito · 2 vueltas' : 'Superserie'}</span>
              </h2>
              <button
                type="button"
                className="rest-btn"
                onClick={() => start(block.rest, `Descanso · ${label.toLowerCase()}`)}
                aria-label={`Empezar descanso de ${formatClock(block.rest)}`}
              >
                <IconClock />
                {formatClock(block.rest)}
              </button>
            </div>
            {items.map(({ ex, code }) => (
              <ExerciseCard
                key={`${session.id}-${ex.id}`}
                ex={ex}
                code={code}
                date={date}
                session={session.id}
                mode={prefs.mode}
                entries={entries}
              />
            ))}
          </section>
        ))}
      </div>

      {hasToday &&
        (confirmClear ? (
          <div className="confirm" role="group" aria-label="Confirmar borrado">
            <p>¿Borrar lo apuntado hoy en {session.title}?</p>
            <div className="btn-row">
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  clearDay(date, session.id);
                  setConfirmClear(false);
                }}
              >
                Borrar
              </button>
              <button type="button" className="btn ghost" onClick={() => setConfirmClear(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="text-btn" onClick={() => setConfirmClear(true)}>
            Borrar lo apuntado hoy
          </button>
        ))}
    </>
  );
}
