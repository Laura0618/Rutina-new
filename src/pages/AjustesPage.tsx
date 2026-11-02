import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSync } from '../store/SyncProvider';

function formatSync(d: Date | null): string {
  if (!d) return 'todavía no';
  return d.toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
}

export function AjustesPage(): JSX.Element {
  const { authStatus, user, oauthConfigured, syncStatus, lastSyncAt, signIn, signOut, syncNow } = useSync();
  const location = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  // Resultado del inicio de sesión (?login=ok | error).
  useEffect(() => {
    const login = new URLSearchParams(location.search).get('login');
    if (!login) return;
    setNotice(
      login === 'ok'
        ? { tone: 'ok', text: 'Sesión iniciada. Tus entrenos se sincronizarán en todos tus dispositivos.' }
        : { tone: 'error', text: 'No se pudo iniciar sesión. Inténtalo de nuevo.' },
    );
    navigate('/ajustes', { replace: true });
  }, [location.search, navigate]);

  const status =
    syncStatus === 'error'
      ? 'Error al sincronizar. Se reintentará solo.'
      : syncStatus === 'offline'
        ? 'Sin conexión. Los cambios se guardan aquí y se subirán al volver la red.'
        : syncStatus === 'saving'
          ? 'Guardando…'
          : syncStatus === 'pending'
            ? 'Cambios pendientes de subir.'
            : 'Todo sincronizado.';

  return (
    <>
      <h1 className="page-title">Cuenta</h1>
      {notice && (
        <p className="notice" data-tone={notice.tone} role="status">
          {notice.text}
        </p>
      )}

      <section className="info">
        <h2>Sincronización</h2>
        {authStatus === 'loading' && <p className="muted">Comprobando la sesión…</p>}
        {authStatus === 'signed_out' && (
          <>
            <p className="muted">
              Sin cuenta, tus entrenos se guardan solo en este dispositivo. Entra con Google para tenerlos en el móvil y en
              el ordenador a la vez.
            </p>
            {oauthConfigured ? (
              <div className="btn-row">
                <button type="button" className="btn" onClick={signIn}>
                  Entrar con Google
                </button>
              </div>
            ) : (
              <p className="note">
                El inicio de sesión todavía no está activado en este despliegue. La app funciona igual en este dispositivo.
              </p>
            )}
          </>
        )}
        {authStatus === 'signed_in' && user && (
          <>
            <div className="account">
              {user.picture ? (
                <img src={user.picture} alt="" className="avatar" referrerPolicy="no-referrer" />
              ) : (
                <span className="avatar" aria-hidden="true">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div>
                <p className="account-name">{user.name}</p>
                <p className="muted small">{user.email}</p>
              </div>
            </div>
            <dl className="kv">
              <dt>Estado</dt>
              <dd>{status}</dd>
              <dt>Última sincronización</dt>
              <dd>{formatSync(lastSyncAt)}</dd>
            </dl>
            <div className="btn-row">
              <button type="button" className="btn" onClick={syncNow}>
                Sincronizar ahora
              </button>
              <button type="button" className="btn ghost" onClick={() => void signOut()}>
                Cerrar sesión
              </button>
            </div>
            <p className="note">Al cerrar sesión, lo apuntado sigue en este dispositivo.</p>
          </>
        )}
      </section>

      <section className="info">
        <h2>Instalar en el móvil</h2>
        <p className="muted">
          En el iPhone, abre la app en Safari, pulsa Compartir y elige «Añadir a pantalla de inicio». Se abre a pantalla
          completa y funciona sin conexión en el gimnasio.
        </p>
      </section>
    </>
  );
}
