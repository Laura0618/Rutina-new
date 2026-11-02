import { Link } from 'react-router-dom';
import { EXERCISES, SESSIONS, optionOf } from '../data/routine';
import { useEntries } from '../hooks/useLog';
import { describeSets, formatKg, longDate, progressByExercise, shortDate, summarizeDays, type Progress } from '../lib/log';

function Sparkline({ points }: { points: Progress['points'] }): JSX.Element | null {
  const recent = points.slice(-10);
  if (recent.length < 2) return null;
  const w = 96;
  const h = 28;
  const kgs = recent.map((p) => p.kg);
  const min = Math.min(...kgs);
  const max = Math.max(...kgs);
  const span = max - min || 1;
  const xy = recent.map((p, i) => [(i / (recent.length - 1)) * (w - 6) + 3, h - 3 - ((p.kg - min) / span) * (h - 6)] as const);
  const last = xy[xy.length - 1];
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={xy.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} />
      {last && <circle cx={last[0]} cy={last[1]} r="2.5" />}
    </svg>
  );
}

export function HistorialPage(): JSX.Element {
  const entries = useEntries();
  const days = summarizeDays(entries);
  const progress = progressByExercise(entries);

  if (days.length === 0) {
    return (
      <>
        <h1 className="page-title">Historial</h1>
        <div className="empty">
          <p>Todavía no hay entrenos apuntados.</p>
          <p className="muted">
            En <Link to="/">Entreno</Link>, apunta los kilos y las repeticiones de cada serie y márcala como hecha. Aquí
            verás cada sesión y cómo evoluciona el peso de cada ejercicio.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">Historial</h1>

      {progress.length > 0 && (
        <section className="info">
          <h2>Progresión</h2>
          <ul className="progress-list">
            {progress.map((p) => {
              const first = p.points[0];
              const last = p.points[p.points.length - 1];
              const diff = first && last ? last.kg - first.kg : 0;
              return (
                <li key={`${p.exercise}-${p.opt}`}>
                  <div className="pl-text">
                    <p className="pl-name">{p.name}</p>
                    <p className="muted small">
                      {p.opt === 'm' ? 'Máquina' : 'Sin máquina'} · {p.points.length}{' '}
                      {p.points.length === 1 ? 'sesión' : 'sesiones'}
                      {diff !== 0 && (
                        <>
                          {' '}
                          · <span data-trend={diff > 0 ? 'up' : 'down'}>{diff > 0 ? '+' : '−'}{formatKg(Math.abs(diff))}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <Sparkline points={p.points} />
                  <p className="pl-kg">{last ? formatKg(last.kg) : '–'}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="info">
        <h2>Entrenos</h2>
        <ul className="days">
          {days.map((d) => (
            <li key={`${d.date}-${d.session}`}>
              <details>
                <summary>
                  <span className="day-title">
                    <b>{SESSIONS[d.session].title}</b>
                    <span className="muted">{longDate(d.date)}</span>
                  </span>
                  <span className="day-count">
                    {Math.min(d.done, d.total)}/{d.total}
                  </span>
                </summary>
                <ul className="day-detail">
                  {d.entries.map((e) => {
                    const ex = EXERCISES[e.ref.exercise];
                    if (!ex) return null;
                    return (
                      <li key={e.ref.key}>
                        <p className="small">{optionOf(ex, e.log.opt).option.name}</p>
                        <p className="muted small">{describeSets(e.log)}</p>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          ))}
        </ul>
        <p className="note">Último entreno: {shortDate(days[0]?.date ?? '')}.</p>
      </section>
    </>
  );
}
