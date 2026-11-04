import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Button } from '@/Infrastructure/UI/components/atoms';
import { Field } from '@/Infrastructure/UI/components/atoms';
import { Alert } from '@/Infrastructure/UI/components/atoms';
import styles from './ConsultaPage.module.css';

// Página delgada: 4 consultas públicas sin credenciales, vía consultasPloc.
export function ConsultaPage(): React.JSX.Element {
  const { consultasPloc } = useDependencies();
  const s = usePlocState(consultasPloc);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Consultas públicas</h1>
      {s.errors.general && (
        <Alert variant="error" title="Error" note={s.errors.general.join(' · ')} />
      )}

      <section className={styles.card}>
        <h2>Conductores operables</h2>
        <Field
          id="cantidad"
          label="Cantidad (máx. 50)"
          type="number"
          value={s.cantidad}
          onChange={(v) => consultasPloc.updateField('cantidad', v)}
        />
        <div className={styles.actions}>
          <Button
            label={s.isLoading ? 'Cargando…' : 'Consultar'}
            variant="primary"
            type="button"
            onClick={() => void consultasPloc.loadOperables()}
            disabled={s.isLoading}
          />
        </div>
        <ul className={styles.list}>
          {s.operables.map((o) => (
            <li className={styles.item} key={o.personaId}>
              {o.nombres} {o.apellidos} — vehículo {o.vehiculoId ?? '—'}
            </li>
          ))}
          {s.operables.length === 0 && <li className={styles.item}>Sin resultados</li>}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Documentos por vencer</h2>
        <Field
          id="dias"
          label="Días"
          type="number"
          value={s.dias}
          onChange={(v) => consultasPloc.updateField('dias', v)}
        />
        <div className={styles.actions}>
          <Button
            label={s.isLoading ? 'Cargando…' : 'Consultar'}
            variant="primary"
            type="button"
            onClick={() => void consultasPloc.loadPorVencer()}
            disabled={s.isLoading}
          />
        </div>
        <ul className={styles.list}>
          {s.porVencer.map((d) => (
            <li className={styles.item} key={`${d.vehiculoId}-${d.tipoDocumentoId}`}>
              Vehículo {d.vehiculoId} — documento {d.tipoDocumentoId} — vence {d.fechaVencimiento} — {d.estado}
            </li>
          ))}
          {s.porVencer.length === 0 && <li className={styles.item}>Sin resultados</li>}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Documentos vencidos</h2>
        <div className={styles.actions}>
          <Button
            label={s.isLoading ? 'Cargando…' : 'Consultar'}
            variant="primary"
            type="button"
            onClick={() => void consultasPloc.loadVencidos()}
            disabled={s.isLoading}
          />
        </div>
        <ul className={styles.list}>
          {s.vencidos.map((d) => (
            <li className={styles.item} key={`${d.vehiculoId}-${d.tipoDocumentoId}`}>
              Vehículo {d.vehiculoId} — documento {d.tipoDocumentoId} — vencido {d.fechaVencimiento} — {d.estado}
            </li>
          ))}
          {s.vencidos.length === 0 && <li className={styles.item}>Sin resultados</li>}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Personas por tipo</h2>
        <div className={styles.actions}>
          <Button
            label={s.isLoading ? 'Cargando…' : 'Consultar'}
            variant="primary"
            type="button"
            onClick={() => void consultasPloc.loadConteo()}
            disabled={s.isLoading}
          />
        </div>
        <ul className={styles.list}>
          {s.conteo.map((c) => (
            <li className={styles.item} key={c.tipo}>
              Tipo {c.tipo}: {c.cantidad} persona(s)
            </li>
          ))}
          {s.conteo.length === 0 && <li className={styles.item}>Sin resultados</li>}
        </ul>
      </section>
    </div>
  );
}
