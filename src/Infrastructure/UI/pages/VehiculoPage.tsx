import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Button } from '@/Infrastructure/UI/components/atoms';
import { Field } from '@/Infrastructure/UI/components/atoms';
import { Alert } from '@/Infrastructure/UI/components/atoms';
import styles from './VehiculoPage.module.css';

// Página delgada: crea, consulta, actualiza y elimina vehículos vía vehiculoDetailPloc.
export function VehiculoPage(): React.JSX.Element {
  const { vehiculoDetailPloc } = useDependencies();
  const s = usePlocState(vehiculoDetailPloc);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Vehículos</h1>
      {s.errors.general && (
        <Alert variant="error" title="Error" note={s.errors.general.join(' · ')} />
      )}
      <section className={styles.card}>
        <h2>Nuevo vehículo</h2>
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void vehiculoDetailPloc.submit(); }}>
          <Field
            id="placa"
            label="Placa"
            value={s.formData.placa}
            onChange={(v) => vehiculoDetailPloc.updateField('placa', v)}
          />
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tipo de vehículo</label>
            <select
              value={s.formData.tipoVehiculo}
              onChange={(e) => vehiculoDetailPloc.updateField('tipoVehiculo', e.target.value as unknown as typeof s.formData.tipoVehiculo)}
              className={styles.select}
            >
              <option value="Automovil">Automóvil</option>
              <option value="Motocicleta">Motocicleta</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tipo de servicio</label>
            <select
              value={s.formData.tipoServicio}
              onChange={(e) => vehiculoDetailPloc.updateField('tipoServicio', e.target.value as unknown as typeof s.formData.tipoServicio)}
              className={styles.select}
            >
              <option value="Publico">Público</option>
              <option value="Privado">Privado</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tipo de combustible</label>
            <select
              value={s.formData.tipoCombustible}
              onChange={(e) => vehiculoDetailPloc.updateField('tipoCombustible', e.target.value as unknown as typeof s.formData.tipoCombustible)}
              className={styles.select}
            >
              <option value="Gasolina">Gasolina</option>
              <option value="Gas">Gas</option>
              <option value="Disel">Diésel</option>
            </select>
          </div>
          <Field
            id="capacidadPasajeros"
            label="Capacidad de pasajeros"
            type="number"
            value={s.formData.capacidadPasajeros}
            onChange={(v) => vehiculoDetailPloc.updateField('capacidadPasajeros', v)}
          />
          <Field
            id="color"
            label="Color"
            value={s.formData.color}
            onChange={(v) => vehiculoDetailPloc.updateField('color', v)}
          />
          <Field
            id="modelo"
            label="Modelo"
            type="number"
            value={s.formData.modelo}
            onChange={(v) => vehiculoDetailPloc.updateField('modelo', v)}
          />
          <Field
            id="marca"
            label="Marca"
            value={s.formData.marca}
            onChange={(v) => vehiculoDetailPloc.updateField('marca', v)}
          />
          <Field
            id="linea"
            label="Línea"
            value={s.formData.linea}
            onChange={(v) => vehiculoDetailPloc.updateField('linea', v)}
          />
          <Field
            id="tipoDocumentoId"
            label="Tipo de documento (UUID)"
            value={s.formData.tipoDocumentoId}
            onChange={(v) => vehiculoDetailPloc.updateField('tipoDocumentoId', v)}
          />
          <Field
            id="documentoBase64"
            label="Documento (base64)"
            value={s.formData.documentoBase64}
            onChange={(v) => vehiculoDetailPloc.updateField('documentoBase64', v)}
          />
          <Field
            id="nombreArchivo"
            label="Nombre de archivo"
            value={s.formData.nombreArchivo}
            onChange={(v) => vehiculoDetailPloc.updateField('nombreArchivo', v)}
          />
          <Field
            id="fechaExpedicion"
            label="Fecha expedición"
            type="datetime-local"
            value={s.formData.fechaExpedicion}
            onChange={(v) => vehiculoDetailPloc.updateField('fechaExpedicion', v)}
          />
          <Field
            id="fechaVencimiento"
            label="Fecha vencimiento"
            type="datetime-local"
            value={s.formData.fechaVencimiento}
            onChange={(v) => vehiculoDetailPloc.updateField('fechaVencimiento', v)}
          />
          <Button
            label={s.isSubmitting ? 'Creando…' : 'Crear vehículo'}
            variant="primary"
            type="submit"
            disabled={s.isSubmitting}
          />
        </form>
      </section>
      {s.vehiculo && (
        <section className={styles.detail}>
          <h2>Vehículo · {s.vehiculo.placa}</h2>
          <p><strong>ID:</strong> {s.vehiculo.id}</p>
          <p><strong>Tipo:</strong> {s.vehiculo.tipoVehiculo}</p>
          <p><strong>Servicio:</strong> {s.vehiculo.tipoServicio}</p>
          <p><strong>Combustible:</strong> {s.vehiculo.tipoCombustible}</p>
          <p><strong>Capacidad:</strong> {s.vehiculo.capacidadPasajeros}</p>
          <p><strong>Color:</strong> {s.vehiculo.color}</p>
          <p><strong>Modelo:</strong> {s.vehiculo.modelo}</p>
          <p><strong>Marca:</strong> {s.vehiculo.marca}</p>
          <p><strong>Línea:</strong> {s.vehiculo.linea}</p>
          <div className={styles.actions}>
            <Button
              label="Actualizar datos"
              variant="primary"
              type="button"
              onClick={() => void vehiculoDetailPloc.updateLoaded()}
            />
            <Button
              label="Eliminar vehículo"
              variant="primary"
              type="button"
              onClick={() => void vehiculoDetailPloc.removeLoaded()}
            />
          </div>
          {s.vehiculo.documentos && s.vehiculo.documentos.length > 0 && (
            <div>
              <h3>Documentos</h3>
              <ul className={styles.list}>
                {s.vehiculo.documentos.map((d) => (
                  <li className={styles.item} key={d.tipoDocumentoId}>
                    {d.nombreArchivo} — {d.estado}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {s.vehiculo.conductores && s.vehiculo.conductores.length > 0 && (
            <div>
              <h3>Conductores asociados</h3>
              <ul className={styles.list}>
                {s.vehiculo.conductores.map((c) => (
                  <li className={styles.item} key={c.personaId}>
                    {c.nombres} {c.apellidos} — estado {c.estado}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
