import styles from './Link.module.css';

// Átomo: enlace suelto (navegación por hash entre rutas).
export function Link({ href, children }: { href: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <a href={href} className={styles.link}>
      {children}
    </a>
  );
}
