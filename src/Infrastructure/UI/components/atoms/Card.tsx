import styles from './Card.module.css';

// Átomo compuesto: contenedor único de página/sección + sus partes.
// Cero PLOCs, todo por props/children.
export function Card({
  narrow = false,
  labelledBy,
  children,
}: {
  narrow?: boolean;
  labelledBy?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section aria-labelledby={labelledBy} className={narrow ? `${styles.card} ${styles.cardNarrow}` : styles.card}>
      {children}
    </section>
  );
}

export function CardTitle({ id, xl = false, children }: { id?: string; xl?: boolean; children: React.ReactNode }): React.JSX.Element {
  return (
    <h1 id={id} className={xl ? `${styles.cardTitle} ${styles.cardTitleXl}` : styles.cardTitle}>
      {children}
    </h1>
  );
}

export function CardMeta({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <p className={styles.cardMeta}>{children}</p>;
}

export function CardFoot({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className={styles.cardFoot}>{children}</div>;
}
