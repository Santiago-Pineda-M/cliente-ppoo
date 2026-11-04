import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Button } from '@/Infrastructure/UI/components/atoms';
import { Field } from '@/Infrastructure/UI/components/atoms';
import { Alert } from '@/Infrastructure/UI/components/atoms';
import styles from './PersonaPage.module.css';

// Página delgada: crea y obtiene/actualiza personas vía personaDetailPloc.
// submit() crea si no hay persona cargada; actualiza si hay una seleccionada.
export function PersonaPage(): React.JSX.Element {
  const { personaDetailPloc } = useDependencies();
  const s = usePlocState(personaDetailPloc);

  const selTipoId = s.formData.tipoIdentificacion as
    | 'CedulaCiudadania'
    | 'CedulaExtranjeria'
    | 'TarjetaIdentidad'
    | 'Nit';
  const selTipoPersona = s.formData.tipoPersona as 'Conductor' | 'Administrativo';

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{s.persona ? 'Persona · Detalle' : 'Persona · Nueva'}</h1>
      {s.createdCredentials && (
        <div className={styles.card}>
          <p className={styles.fieldLabel}>Credenciales generadas</p>
          <p><strong>Login:</strong> {s.createdCredentials.login}</p>
          <p><strong>API Key:</strong> {s.createdCredentials.apiKey}</p>
          <p><strong>Contraseña generada:</strong> {s.createdCredentials.passwordGenerada}</p>
        </div>
      )}
      {s.errors.general && (
        <Alert variant="error" title="Error" note={s.errors.general.join(' · ')} />
      )}
      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void personaDetailPloc.submit(); }}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Tipo de identificación</label>
          <select
            value={selTipoId}
            onChange={(e) => personaDetailPloc.updateField('tipoIdentificacion', e.target.value as unknown as typeof selTipoId)}
            className={styles.select}
          >
            <option value="CedulaCiudadania">Cédula de ciudadanía</option>
            <option value="CedulaExtranjeria">Cédula de extranjería</option>
            <option value="TarjetaIdentidad">Tarjeta de identidad</option>
            <option value="Nit">NIT</option>
          </select>
        </div>
        <Field
          id="numeroIdentificacion"
          label="Número de identificación"
          value={s.formData.numeroIdentificacion}
          onChange={(v) => personaDetailPloc.updateField('numeroIdentificacion', v)}
        />
        <Field
          id="nombres"
          label="Nombres"
          value={s.formData.nombres}
          onChange={(v) => personaDetailPloc.updateField('nombres', v)}
        />
        <Field
          id="apellidos"
          label="Apellidos"
          value={s.formData.apellidos}
          onChange={(v) => personaDetailPloc.updateField('apellidos', v)}
        />
        <Field
          id="correoElectronico"
          label="Correo electrónico"
          value={s.formData.correoElectronico}
          onChange={(v) => personaDetailPloc.updateField('correoElectronico', v)}
        />
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Tipo de persona</label>
          <select
            value={selTipoPersona}
            onChange={(e) => personaDetailPloc.updateField('tipoPersona', e.target.value as unknown as typeof selTipoPersona)}
            className={styles.select}
          >
            <option value="Conductor">Conductor</option>
            <option value="Administrativo">Administrativo</option>
          </select>
        </div>
        <Button
          label={s.isSubmitting ? 'Procesando…' : s.persona ? 'Actualizar persona' : 'Crear persona'}
          variant="primary"
          type="submit"
          disabled={s.isSubmitting}
        />
      </form>
      {s.persona && (
        <section className={styles.detail}>
          <h2>Datos de la persona</h2>
          <p><strong>ID:</strong> {s.persona.id}</p>
          <p><strong>Nombres:</strong> {s.persona.nombres}</p>
          <p><strong>Apellidos:</strong> {s.persona.apellidos}</p>
          <p><strong>Correo:</strong> {s.persona.correoElectronico}</p>
          <p><strong>Tipo:</strong> {s.persona.tipoPersona}</p>
          <p><strong>Login:</strong> {s.persona.login ?? '—'}</p>
          <p><strong>Tiene usuario:</strong> {s.persona.tieneUsuario ? 'Sí' : 'No'}</p>
        </section>
      )}
    </div>
  );
}
