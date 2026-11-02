import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSync, type SyncStatus } from '../store/SyncProvider';
import { formatClock, useTimer } from '../store/TimerProvider';
import { IconGuide, IconHistory, IconSettings, IconTrain } from './Icons';

const NAV_ITEMS = [
  { to: '/', label: 'Entreno', Icon: IconTrain },
  { to: '/historial', label: 'Historial', Icon: IconHistory },
  { to: '/guia', label: 'Guía', Icon: IconGuide },
] as const;

const SYNC_LABEL: Record<SyncStatus, string> = {
  idle: 'sincronizado',
  synced: 'sincronizado',
  saving: 'guardando',
  pending: 'cambios pendientes',
  offline: 'sin conexión',
  error: 'error al sincronizar',
};

function AccountLink(): JSX.Element {
  const { authStatus, syncStatus } = useSync();
  const signedIn = authStatus === 'signed_in';
  const tone =
    syncStatus === 'error' || syncStatus === 'offline' ? 'warn' : syncStatus === 'synced' || syncStatus === 'idle' ? 'ok' : 'busy';
  return (
    <NavLink
      to="/ajustes"
      className="account-link"
      data-tone={signedIn ? tone : undefined}
      aria-label={signedIn ? `Cuenta: ${SYNC_LABEL[syncStatus]}` : 'Cuenta y sincronización'}
    >
      <IconSettings />
      {signedIn && <span className="dot" aria-hidden="true" />}
    </NavLink>
  );
}

function RestTimer(): JSX.Element | null {
  const { timer, left, stop } = useTimer();
  if (!timer) return null;
  const done = left === 0;
  return (
    <div className="timer" data-done={done} role="timer" aria-live="polite">
      <div className="timer-row">
        <div>
          <p className="timer-label">{done ? 'Siguiente serie' : timer.label}</p>
          <p className="timer-time">{done ? 'Vamos' : formatClock(left)}</p>
        </div>
        <button type="button" onClick={stop}>
          {done ? 'Cerrar' : 'Saltar'}
        </button>
      </div>
      <div className="timer-bar">
        <i style={{ width: `${(left / timer.total) * 100}%` }} />
      </div>
    </div>
  );
}

export function Layout(): JSX.Element {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="shell">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <header className="app-header">
        <Link to="/" className="brand">
          Rutina
        </Link>
        <AccountLink />
      </header>

      <main id="contenido" className="app-main">
        <Outlet />
      </main>

      <div className="dock">
        <RestTimer />
        <nav aria-label="Navegación principal" className="bottom-nav">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
