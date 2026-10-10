import type { LucideIcon } from 'lucide-react';
import styles from './StatCard.module.css';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | null;
  loading: boolean;
}

// Molécula: tarjeta de indicador. Solo props; el organismo le pasa el dato.
export function StatCard({ icon: Icon, label, value, loading }: StatCardProps): React.JSX.Element {
  return (
    <div className={styles.stat} aria-busy={loading || undefined}>
      <span className={styles.statIcon} aria-hidden="true">
        <Icon size={20} />
      </span>
      <div className={styles.statBody}>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{loading || value === null ? '…' : value}</p>
      </div>
    </div>
  );
}
