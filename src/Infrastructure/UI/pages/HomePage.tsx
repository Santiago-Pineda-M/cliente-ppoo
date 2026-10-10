import { DashboardHeader, DashboardStats, RecentActivity, SessionCard } from '@/Infrastructure/UI/components/organisms';
import styles from './HomePage.module.css';

// Página delgada: tablero con organismos de datos reales.
export function HomePage(): React.JSX.Element {
  return (
    <div className={styles.page}>
      <DashboardHeader />
      <DashboardStats />
      <RecentActivity />
      <SessionCard />
    </div>
  );
}
