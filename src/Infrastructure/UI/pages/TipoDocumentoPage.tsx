import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Button } from '@/Infrastructure/UI/components/atoms';
import { Field } from '@/Infrastructure/UI/components/atoms';
import { Alert } from '@/Infrastructure/UI/components/atoms';
import styles from './TipoDocumentoPage.module.css';

// Página delgada: CRUD de tipos de documento vía tipoDocumentoListPloc.
export function TipoDocumentoPage(): React.JSX.Element {
  const { tipoDocumentoListPloc } = useDependencies();
  const s = usePlocState(tipoDocumentoListPloc);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Tipos de documento</h1>
      {s.errors.general && (
        <Alert variant="error" title="Error" note={s.errors.general.join(' · ')} />
      )}

      <section className={styles.card}>
        <h2>{s.selectedId ? 'Editar tipo de documento' : 'Registrar tipo de documento'}</h2>
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void tipoDocumentoListPloc.submit(); }}>
          <Field
            id="codigo"
            label="Código"
            value={s.formData.codigo}
            onChange={(v) => tipoDocumentoListPloc.updateField('codigo', v)}
          />
          <Field
            id="nombre"
            label="Nombre"
            value={s.formData.nombre}
            onChange={(v) => tipoDocumentoListPloc.updateField('nombre', v)}
          />
          <Field
            id="tiposVehiculoAplicables"
            label="Tipos de vehículo aplicables"
            value={s.formData.tiposVehiculoAplicables}
            onChange={(v) => tipoDocumentoListPloc.updateField('tiposVehiculoAplicables', v)}
          />
          <Field
            id="codigoObligatoriedad"
            label="Código de obligatoriedad"
            value={s.formData.codigoObligatoriedad}
            onChange={(v) => tipoDocumentoListPloc.updateField('codigoObligatoriedad', v)}
          />
          <Field
            id="descripcion"
            label="Descripción"
            value={s.formData.descripcion}
            onChange={(v) => tipoDocumentoListPloc.updateField('descripcion', v)}
          />
          <div className={styles.actions}>
            <Button
              label={
                s.isSubmitting ? 'Procesando…' : s.selectedId ? 'Actualizar' : 'Registrar'
              }
              variant="primary"
              type="submit"
              disabled={s.isSubmitting}
            />
            {s.selectedId && (
              <Button
                label="Eliminar"
                variant="primary"
                type="button"
                onClick={() => void tipoDocumentoListPloc.removeSelected()}
              />
            )}
            <Button
              label="Limpiar"
              variant="ghost"
              type="button"
              onClick={() => { tipoDocumentoListPloc.select(null); }}
              disabled={s.isSubmitting}
            />
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <h2>Listado</h2>
        <div className={styles.actions}>
          <Button
            label={s.isLoading ? 'Cargando…' : 'Cargar listado'}
            variant="primary"
            type="button"
            onClick={() => void tipoDocumentoListPloc.load()}
            disabled={s.isLoading}
          />
        </div>
        <ul className={styles.list}>
          {s.items.map((item) => (
            <li className={styles.item} key={item.id} onClick={() => tipoDocumentoListPloc.select(item.id)}>
              <strong>{item.nombre}</strong> ({item.codigo}) — {item.descripcion}
            </li>
          ))}
          {s.items.length === 0 && <li className={styles.item}>Sin tipos de documento</li>}
        </ul>
      </section>
    </div>
  );
}
