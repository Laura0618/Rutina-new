# Rutina

Web app (PWA) con la rutina de gimnasio de Laura: sesiones **Upper**, **Lower** y **Full body** para un espacio reducido y con cervicalgia (torso ligero y con apoyo, nada por encima de la cabeza).

- Cada ejercicio tiene opción **con máquina** (modelo de referencia de Technogym o Hammer Strength) y **sin máquina**.
- Apuntas **kilos y repeticiones** de cada serie; al marcar una serie vacía, propone lo de la última vez.
- **Temporizador de descanso** por bloque.
- **Historial** de entrenos y **progresión** del peso máximo por ejercicio.
- **Guía** con reglas de seguridad, claves técnicas y reparto semanal.
- Instalable en el móvil y funciona sin conexión.
- Con sesión de Google, los datos se **sincronizan** entre dispositivos (Cloudflare D1). Sin sesión, se guardan en el dispositivo.

Misma arquitectura que Pedalea y Protocolos: React + Vite + TypeScript, un Worker de Cloudflare que sirve la PWA y la API (`/api/*`).

## Desarrollo

```bash
npm ci
npm run dev        # PWA en :5173
npm run dev:api    # API con wrangler en :8787 (necesita .dev.vars, ver .dev.vars.example)
npm run lint && npm test && npm run build
```

## Datos

Cada dato es un documento clave → JSON con `updatedAt`; gana el más reciente por clave.

- `prefs`: opción por defecto (`{ mode: 'm' | 'l' }`).
- `log:YYYY-MM-DD:<sesión>:<ejercicio>`: `{ opt, sets: [{ kg, reps, done }] }`.

La rutina vive en `src/data/routine.ts`.

## Despliegue en Cloudflare

1. **D1:** Workers & Pages → D1 → Create Database → `rutina_new`. Copia el `database_id` en `wrangler.toml`.
2. **Worker:** Workers & Pages → Create → Workers → Import a repository → `Laura0618/Rutina-new`. Build command `npm run build`, deploy command `npx wrangler deploy`. Cada `git push` a `main` redespliega. La versión de Node se toma de `.node-version` (22).
3. **Google:** en el cliente OAuth de Pedalea, añade el origen `https://rutina-new.castrolaura0311.workers.dev` y la URI de redirección `https://rutina-new.castrolaura0311.workers.dev/api/auth/callback`.
4. **Secreto:** Cloudflare → rutina-new → Settings → Variables and Secrets → Add → Secret `GOOGLE_CLIENT_SECRET`.

## Descargo

No es consejo médico. Ante dolor que baja al brazo, hormigueo, pérdida de fuerza o mareo, para y consulta con un profesional.
