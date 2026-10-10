import styles from './Field.module.css';

export interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  autoComplete?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

// Átomo: etiqueta + control. Ocupa todo el ancho disponible:
// sin max-width para no dejar huecos a la derecha.
export function Field({ id, label, type = 'text', value, autoComplete, required = false, onChange }: FieldProps): React.JSX.Element {
  return (
    <label htmlFor={id} className={styles.field}>
      {label}
      <input
        id={id}
        className={styles.input}
        type={type}
        value={value}
        autoComplete={autoComplete}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
