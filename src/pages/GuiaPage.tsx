const SCALE = Array.from({ length: 11 }, (_, i) => i);

export function GuiaPage(): JSX.Element {
  return (
    <>
      <h1 className="page-title">Guía</h1>

      <section className="info" id="seguridad">
        <h2>Reglas de seguridad</h2>
        <p className="eyebrow">Escala de molestia durante el ejercicio</p>
        <div className="scale" aria-hidden="true">
          {SCALE.map((n) => (
            <span key={n} data-over={n > 3 || undefined}>
              {n}
            </span>
          ))}
        </div>
        <div className="scale-legend">
          <span>
            <b>0-3</b> sigue
          </span>
          <span>
            <b>4 o más</b> baja carga o quita el ejercicio
          </span>
        </div>
        <p className="muted">Si al día siguiente estás peor, baja la carga o elimina ese ejercicio en la próxima sesión.</p>
        <p className="stop">
          <strong>Para de inmediato</strong> y consulta con un profesional si aparece dolor que baja al brazo, hormigueo,
          pérdida de fuerza en la mano o mareo.
        </p>
        <p className="note">Lo ideal es que un fisioterapeuta valide esta selección, sobre todo los ejercicios de escápula y cuello.</p>
      </section>

      <section className="info">
        <h2>Claves técnicas</h2>
        <ul className="list">
          <li>Cuello largo y barbilla recogida. No adelantes la cabeza.</li>
          <li>Hombros lejos de las orejas en todos los ejercicios.</li>
          <li>Mirada al suelo en cuadrupedia y remos con mancuerna.</li>
          <li>En máquinas, ajusta asiento y respaldo antes de cargar: espalda y cabeza apoyadas, asas a la altura del pecho.</li>
          <li>Torso ligero, dejando 3-4 repeticiones en reserva. El objetivo es reforzar, no cansar.</li>
          <li>Calentamiento: en Upper está dentro de la sesión. En Lower y Full body, 5 min de movilidad suave de hombros y cadera.</li>
        </ul>
      </section>

      <section className="info">
        <h2>Fuera de la rutina</h2>
        <ul className="list">
          <li>Press militar, press de hombro en máquina y extensión de tríceps por encima de la cabeza.</li>
          <li>Máquinas que cargan hombros o cuello: Smith con la barra en la espalda, gemelo de pie con hombreras y jalón tras nuca.</li>
          <li>Peso muerto rumano pesado, búlgara con mancuernas y suitcase hold: cargan los trapecios.</li>
          <li>Elevaciones laterales, encogimientos y remo al mentón.</li>
          <li>Flexiones en el suelo y plancha frontal.</li>
        </ul>
      </section>

      <section className="info">
        <h2>Reparto semanal</h2>
        <dl className="week">
          <dt>2 días</dt>
          <dd>Full body · Full body</dd>
          <dt>3 días</dt>
          <dd>Upper · Lower · Full body</dd>
          <dt>4 días</dt>
          <dd>Upper · Lower · Upper · Lower</dd>
        </dl>
      </section>

      <section className="info">
        <h2>Progresión</h2>
        <ul className="list">
          <li>
            <b>Torso:</b> 3-4 semanas con el mismo peso. Primero subes repeticiones y control; después, el mínimo incremento
            posible.
          </li>
          <li>
            <b>Pierna:</b> progresa con normalidad mientras la carga no pase por los brazos.
          </li>
          <li>La app guarda el peso de cada opción por separado: el de la máquina y el de las mancuernas no se mezclan.</li>
        </ul>
        <p className="note">
          Las máquinas enlazan a la ficha oficial de Technogym o Hammer Strength, las marcas que anuncia Fitness Park. Tu club
          puede tener otro modelo equivalente.
        </p>
      </section>
    </>
  );
}
