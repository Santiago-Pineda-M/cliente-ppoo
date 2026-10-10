import styles from './Alert.module.css';

export interface AlertProps {
  variant: 'error' | 'success' | 'muted';
  title?: string;
  note?: string;
  children?: React.ReactNode;
}

// Átomo: error usa role="alert"; estados usan role="status".
// El estado nunca se comunica solo con color: siempre lleva texto.
export function Alert({ variant, title, note, children }: AlertProps): React.JSX.Element {
  const variantCls = variant === 'error' ? styles.alertError : variant === 'success' ? styles.alertSuccess : styles.alertMuted;
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={`${styles.alert} ${variantCls}`}>
      {title ? <p className={styles.alertTitle}>{title}</p> : null}
      {note ? <p className={styles.alertNote}>{note}</p> : null}
      {children}
    </div>
  );
}
