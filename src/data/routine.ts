/**
 * La rutina: sesiones Upper, Lower y Full body pensadas para un espacio reducido
 * y para cervicalgia (torso ligero y con apoyo, nada por encima de la cabeza).
 *
 * Cada ejercicio tiene una opcion con maquina (`m`) y otra sin maquina (`l`),
 * salvo los que no la necesitan (solo `l`).
 */

export type OptionKind = 'm' | 'l';

export interface ExerciseOption {
  name: string;
  cue: string;
  /** Dosis propia de esta opcion, si difiere de la del ejercicio. */
  dose?: string;
  /** Si tiene sentido apuntar kilos. */
  load: boolean;
  /** Modelo de referencia y ficha oficial del fabricante. */
  model?: string;
  url?: string;
}

export interface Exercise {
  /** Identificador estable: se usa en las claves del registro. */
  id: string;
  group: string;
  dose?: string;
  sets: number;
  /** La ultima serie es opcional. */
  optionalLast?: boolean;
  m?: ExerciseOption;
  l: ExerciseOption;
}

export interface Block {
  warm?: boolean;
  /** Descanso tras cada vuelta o pareja, en segundos. */
  rest: number;
  exercises: Exercise[];
}

export type SessionId = 'upper' | 'lower' | 'full';

export interface Session {
  id: SessionId;
  title: string;
  short: string;
  sub: string;
  minutes: number;
  blocks: Block[];
}

const TG = 'https://www.technogym.com';
const LF = 'https://www.lifefitness.com';

const X = {
  cuello: {
    id: 'cuello', group: 'Cuello · flexores profundos', dose: '2 × 10 · 5 s', sets: 2,
    l: { name: 'Retracción cervical tumbada (chin tuck)', load: false,
      cue: 'Mete la barbilla como haciendo papada, sin despegar la cabeza del suelo.' },
  },
  serrato: {
    id: 'serrato', group: 'Escápulas · serrato y trapecio inferior', dose: '2 × 10', sets: 2,
    l: { name: 'Deslizamientos en pared (wall slides)', load: false,
      cue: 'Antebrazos en la pared. Sube solo hasta donde no encojas los hombros.' },
  },
  rotGoma: {
    id: 'rotGoma', group: 'Manguito rotador · rotadores externos', dose: '2 × 12/lado', sets: 2,
    l: { name: 'Rotación externa con goma', load: false,
      cue: 'Codo pegado al costado con una toalla. Gira hacia fuera sin mover el codo ni encoger el hombro.' },
  },
  serratoGoma: {
    id: 'serratoGoma', group: 'Serrato anterior', dose: '2 × 12/lado', sets: 2,
    l: { name: 'Empuje de serrato con goma (serratus punch)', load: false,
      cue: 'Goma anclada detrás, brazo estirado a la altura del pecho. Lleva el hombro hacia delante separando la escápula, sin encogerlo.' },
  },
  remo: {
    id: 'remo', group: 'Espalda media', dose: '3 × 12-15 · ligero', sets: 3,
    m: { name: 'Remo en máquina con apoyo de pecho, agarre neutro', load: true,
      cue: 'Asas a la altura del pecho. Codos hacia atrás y hombros abajo.',
      model: 'Technogym Selection Low Row', url: `${TG}/en-INT/product/selection-700-low-row_MNHC.html` },
    l: { name: 'Remo con mancuernas, pecho apoyado en banco inclinado', load: true,
      cue: 'Pecho pegado al banco, codos hacia la cadera, mirada al suelo.' },
  },
  pecho1: {
    id: 'pecho1', group: 'Pecho', dose: '3 × 10-12 · ligero', sets: 3,
    m: { name: 'Press de pecho sentado en máquina, agarre neutro', load: true,
      cue: 'Espalda y cabeza en el respaldo. Asas a la altura del pecho, no de los hombros.',
      model: 'Technogym Selection 900 Chest Press', url: `${TG}/en-INT/product/selection-900-chest-press_MNFP.html` },
    l: { name: 'Flexiones con manos en el banco + protracción', load: false,
      cue: 'Cuerpo en bloque. Arriba, empuja el banco para separar las escápulas.' },
  },
  posterior: {
    id: 'posterior', group: 'Trapecio medio e inferior · hombro posterior', dose: '2-3 × 10-12', sets: 3, optionalLast: true,
    m: { name: 'Aperturas invertidas en máquina (contractor posterior)', load: true,
      cue: 'Pecho en el respaldo, brazos a la altura del pecho. Peso mínimo.',
      model: 'Technogym Selection 900 Reverse Fly', url: `${TG}/en-INT/product/selection-900-reverse-fly_MNXP.html` },
    l: { name: 'Y-T boca abajo en banco inclinado', load: true,
      cue: 'Sin peso o 0,5-1 kg. Pulgares arriba, mueve desde la escápula, no desde el cuello.' },
  },
  pecho2: {
    id: 'pecho2', group: 'Pecho', dose: '3 × 12 · ligero', sets: 3,
    m: { name: 'Aperturas en máquina (contractor de pecho), rango corto', load: true,
      cue: 'Espalda apoyada. No lleves los brazos por detrás de la línea del cuerpo.',
      model: 'Technogym Selection 900 Pectoral', url: `${TG}/en-INT/product/selection-900-pectoral_MNTP.html` },
    l: { name: 'Floor press con mancuernas, agarre neutro', load: true,
      cue: 'Cabeza apoyada en el suelo, codos a 45°. Para cuando los codos tocan.' },
  },
  remoUni: {
    id: 'remoUni', group: 'Espalda · remo unilateral', dose: '3 × 10-12/lado · ligero', sets: 3,
    m: { name: 'Remo iso-lateral con apoyo de pecho, un brazo cada vez', load: true,
      cue: 'Pecho pegado al apoyo. Codo hacia la cadera y hombro abajo.',
      model: 'Hammer Strength Plate-Loaded Iso-Lateral Row', url: `${LF}/en-be/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-row` },
    l: { name: 'Remo con mancuerna a una mano, rodilla y mano en el banco', load: true,
      cue: 'Espalda plana, mirada al suelo y cuello largo. Codo hacia la cadera sin girar el tronco.' },
  },
  remoAlto: {
    id: 'remoAlto', group: 'Espalda · remo en polea alta', dose: '3 × 12 · ligero', sets: 3,
    m: { name: 'Remo en polea alta sentada, agarre neutro', load: true,
      cue: 'Polea por encima de la cabeza. Tira hacia la parte alta del pecho con los codos abajo y los hombros lejos de las orejas.',
      model: 'Technogym Dual Adjustable Pulley', url: `${TG}/en-SG/product/dual-adjustable-pulley-performance_MB43.html` },
    l: { name: 'Remo alto con goma anclada arriba, de rodillas', load: false,
      cue: 'Goma por encima de la cabeza. Tira hacia el pecho con los codos abajo, sin encoger los hombros.' },
  },
  gluteo: {
    id: 'gluteo', group: 'Glúteo', dose: '4 × 10-12', sets: 4,
    m: { name: 'Máquina de hip thrust', load: true,
      cue: 'Barbilla recogida y espalda alta bien apoyada en la almohadilla.',
      model: 'Hammer Strength Plate-Loaded Glute Drive', url: `${LF}/en-us/catalog/strength-training/plate-loaded/hammer-strength-plate-loaded-glute-drive` },
    l: { name: 'Hip thrust en banco con mancuerna sobre la cadera', load: true,
      cue: 'Espalda alta en el banco, barbilla recogida, empuja con los talones.' },
  },
  core1: {
    id: 'core1', group: 'Core', dose: '3 × 8/lado', sets: 3,
    l: { name: 'Dead bug con la cabeza apoyada', load: false,
      cue: 'Lumbar pegada al suelo. La cabeza no se levanta.' },
  },
  cuadriceps: {
    id: 'cuadriceps', group: 'Cuádriceps y glúteo', dose: '3 × 12', sets: 3,
    m: { name: 'Prensa de piernas', load: true,
      cue: 'Espalda y cabeza apoyadas. Agarra las asas laterales sin apretar los hombros.',
      model: 'Technogym Selection 900 Leg Press', url: `${TG}/en-GB/product/selection-900-leg-press_MNAP.html` },
    l: { name: 'Sentadilla a banco', load: true,
      cue: 'Peso corporal o mancuerna ligera pegada al pecho. Roza el banco y sube.' },
  },
  isquios: {
    id: 'isquios', group: 'Isquiotibiales', dose: '3 × 8-10', sets: 3,
    m: { name: 'Curl femoral sentado en máquina', load: true,
      cue: 'Mejor sentado que tumbado: el cuello queda neutro y apoyado.',
      model: 'Technogym Selection 900 Leg Curl', url: `${TG}/en-US/product/selection-900-leg-curl_MNIP.html` },
    l: { name: 'Curl femoral tumbada con toallas o deslizadores', load: false,
      cue: 'Cadera arriba y arrastra los talones hacia ti.' },
  },
  unilateral: {
    id: 'unilateral', group: 'Pierna unilateral', dose: '3 × 10/pierna', sets: 3,
    m: { name: 'Prensa a una pierna', load: true,
      cue: 'Carga ligera, rodilla alineada con el pie.',
      model: 'Technogym Selection 900 Leg Press', url: `${TG}/en-GB/product/selection-900-leg-press_MNAP.html` },
    l: { name: 'Zancada inversa con peso corporal', load: false,
      cue: 'Paso atrás controlado, manos en la cadera.' },
  },
  gluteomedio: {
    id: 'gluteomedio', group: 'Glúteo medio', sets: 3,
    m: { name: 'Abducción de cadera en máquina', dose: '3 × 12-15', load: true,
      cue: 'Sentada con la espalda apoyada. Abre controlado, sin impulso.',
      model: 'Technogym Selection 900 Abductor', url: `${TG}/en-INT/product/selection-900-abductor_MNPP.html` },
    l: { name: 'Puente de glúteo a una pierna', dose: '3 × 10/lado', load: false,
      cue: 'Cadera nivelada arriba, 1 s de pausa.' },
  },
  cuadUni: {
    id: 'cuadUni', group: 'Cuádriceps unilateral', sets: 3,
    m: { name: 'Extensión de cuádriceps a una pierna', dose: '3 × 12/pierna', load: true,
      cue: 'Espalda apoyada, sube controlado y baja lento.',
      model: 'Technogym Selection 900 Leg Extension', url: `${TG}/en-INT/product/selection-900-leg-extension_MNJP.html` },
    l: { name: 'Step-up al banco con peso corporal', dose: '3 × 10/pierna', load: false,
      cue: 'Empuja con la pierna de arriba, sin impulso de la de abajo.' },
  },
  gemelo: {
    id: 'gemelo', group: 'Gemelos', dose: '3 × 15', sets: 3,
    m: { name: 'Gemelo sentado en máquina o en la prensa', load: true,
      cue: 'Evita la máquina de gemelo de pie con hombreras: carga los trapecios.',
      model: 'Hammer Strength Plate-Loaded Seated Calf Raise', url: `${LF}/en-us/catalog/strength-training/plate-loaded/plate-loaded-seated-calf-raise` },
    l: { name: 'Elevación de gemelos a una pierna', load: false,
      cue: 'Mano en la pared. Sube del todo y baja lento.' },
  },
  core2: {
    id: 'core2', group: 'Core', dose: '3 × 8/lado', sets: 3,
    l: { name: 'Bird dog', load: false,
      cue: 'Cuello neutro, mirada al suelo. Brazo y pierna contrarios, sin girar la cadera.' },
  },
} satisfies Record<string, Exercise>;

const with_ = (e: Exercise, patch: Partial<Exercise>): Exercise => ({ ...e, ...patch });

export const SESSIONS: Record<SessionId, Session> = {
  upper: {
    id: 'upper', title: 'Upper', short: 'Torso ligero', minutes: 45,
    sub: 'Reconstrucción de torso: todo ligero y con apoyo.',
    blocks: [
      { warm: true, rest: 30, exercises: [X.cuello, X.serrato, X.rotGoma, X.serratoGoma] },
      { rest: 90, exercises: [X.remo, X.pecho1] },
      { rest: 60, exercises: [X.remoUni, X.posterior] },
      { rest: 60, exercises: [X.remoAlto, X.pecho2] },
    ],
  },
  lower: {
    id: 'lower', title: 'Lower', short: 'Pierna y core', minutes: 45,
    sub: 'La carga va sobre la cadera, en máquina con respaldo o es peso corporal.',
    blocks: [
      { rest: 90, exercises: [X.gluteo, X.core1] },
      { rest: 90, exercises: [X.cuadriceps, X.isquios] },
      { rest: 60, exercises: [X.unilateral, X.gluteomedio] },
      { rest: 60, exercises: [X.cuadUni, X.gemelo] },
    ],
  },
  full: {
    id: 'full', title: 'Full body', short: 'Todo el cuerpo', minutes: 45,
    sub: 'Pierna con carga en la cadera y torso ligero con apoyo.',
    blocks: [
      { rest: 90, exercises: [with_(X.gluteo, { sets: 3, dose: '3 × 10-12' }), X.remo] },
      { rest: 90, exercises: [X.cuadriceps, with_(X.pecho1, { dose: '3 × 10 · ligero' })] },
      { rest: 60, exercises: [X.unilateral, with_(X.posterior, { dose: '2 × 10', sets: 2, optionalLast: false })] },
      { rest: 60, exercises: [X.core2, X.cuello] },
    ],
  },
};

export const SESSION_IDS: SessionId[] = ['upper', 'lower', 'full'];

export function isSessionId(v: unknown): v is SessionId {
  return v === 'upper' || v === 'lower' || v === 'full';
}

/** Todos los ejercicios distintos, por id. */
export const EXERCISES: Record<string, Exercise> = Object.fromEntries(Object.values(X).map((e) => [e.id, e]));

/** Codigo visible de cada ejercicio en su sesion: A1, A2... (el calentamiento va numerado 1, 2...). */
export function exerciseCodes(session: Session): { block: Block; label: string; items: { ex: Exercise; code: string }[] }[] {
  let letter = 0;
  return session.blocks.map((block) => {
    const L = block.warm ? '' : 'ABCDEFG'[letter++] ?? '';
    return {
      block,
      label: block.warm ? 'Calentamiento' : `Bloque ${L}`,
      items: block.exercises.map((ex, i) => ({ ex, code: `${L}${i + 1}` })),
    };
  });
}

/** Dosis efectiva de la opcion elegida. */
export function doseOf(ex: Exercise, opt: OptionKind): string {
  return (opt === 'm' ? ex.m?.dose : ex.l.dose) ?? ex.dose ?? '';
}

/** Repeticiones objetivo a partir de la dosis ("3 × 12-15 · ligero" -> "12-15"). */
export function targetReps(dose: string): string {
  const m = /×\s*([\d-]+)/.exec(dose);
  return m?.[1] ?? '';
}

export function optionOf(ex: Exercise, opt: OptionKind): { kind: OptionKind; option: ExerciseOption } {
  if (opt === 'm' && ex.m) return { kind: 'm', option: ex.m };
  return { kind: 'l', option: ex.l };
}
