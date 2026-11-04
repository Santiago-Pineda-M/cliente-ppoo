import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Button } from '@/Infrastructure/UI/components/atoms';
import { Field } from '@/Infrastructure/UI/components/atoms';
import { Alert } from '@/Infrastructure/UI/components/atoms';
import styles from './ConductorPage.module.css';

// Página delgada: asocia vehículos a un conductor y cambia el estado del conductor vía conductorPloc.
export function ConductorPage(): React.JSX.Element {
  const { conductorPloc } = useDependencies();
  const s = usePlocState(conductorPloc);

  const selEstado = s.formData.estado as 'Po' | 'Ea' | 'Ro';

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Conductor · Asociación</h1>
      {s.errors.general && (
        <Alert variant="error" title="Error" note={s.errors.general.join(' · ')} />
      )}
      <section className={styles.card}>
        <h2>Asociar vehículos al conductor</h2>
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void conductorPloc.submit(); }}>
          <Field
            id="personaId"
            label="ID de persona (UUID)"
            value={s.formData.personaId}
            onChange={(v) => conductorPloc.updateField('personaId', v)}
          />
          <Field
            id="vehiculoIds"
            label="IDs de vehículos (separados por coma)"
            value={s.formData.vehiculoIds}
            onChange={(v) => conductorPloc.updateField('vehiculoIds', v)}
          />
          <Button
            label={s.isSubmitting ? 'Asociando…' : 'Asociar vehículos'}
            variant="primary"
            type="submit"
            disabled={s.isSubmitting}
          />
        </form>
        {s.asociaciones.length > 0 && (
          <div>
            <h3>Asociaciones</h3>
            <ul className={styles.list}>
              {s.asociaciones.map((a) => (
                <li className={styles.item} key={a.vehiculoId}>
                  Vehículo {a.vehiculoId} — asociado {a.fechaAsociacion} — estado {a.estado}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section className={styles.card}>
        <h2>Cambiar estado del conductor</h2>
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void conductorPloc.changeEstado(); }}>
          <Field
            id="personaIdEstado"
            label="ID de persona (UUID)"
            value={s.formData.personaId}
            onChange={(v) => conductorPloc.updateField('personaId', v)}
          />
          <Field
            id="vehiculoIdEstado"
            label="ID de vehículo (UUID)"
            value={s.formData.vehiculoId}
            onChange={(v) => conductorPloc.updateField('vehiculoId', v)}
          />
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Estado del conductor</label>
            <select
              value={selEstado}
              onChange={(e) => conductorPloc.updateField('estado', e.target.value as unknown as typeof selEstado)}
              className={styles.select}
            >
              <option value="Po">1 · Po (Pendiente)</option>
              <option value="Ea">2 · Ea (Activo)</option>
              <option value="Ro">3 · Ro (Retirado)</option>
            </select>
          </div>
          <Button
            label={s.isSubmitting ? 'Cambiando…' : 'Cambiar estado'}
            variant="primary"
            type="submit"
            disabled={s.isSubmitting}
          />
        </form>
      </section>
    </div>
  );
}
