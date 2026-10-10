import { useEffect } from 'react';
import { Activity, Files, TriangleAlert, Truck } from 'lucide-react';
import { useDependencies } from '@/Infrastructure/Context/DependenciesProvider';
import { usePlocState } from '@/Infrastructure/Hooks/usePlocState';
import { Alert } from '@/Infrastructure/UI/components/atoms';
import { StatCard } from '@/Infrastructure/UI/components/molecules';
import styles from './DashboardStats.module.css';

// Organismo: indicadores con datos reales (consultas + catálogo + trazas).
// Carga sus PLOCs al montar; las trazas se leen sin ciclo de vida
// (pertenecen al drawer, que vive en MainLayout).
export function DashboardStats(): React.JSX.Element {
  const { consultasPloc, tipoDocumentoListPloc, httpTraceListPloc } = useDependencies();
  const consultas = usePlocState(consultasPloc);
  const tipos = usePlocState(tipoDocumentoListPloc);
  const traces = usePlocState(httpTraceListPloc);

  useEffect(() => {
    void consultasPloc.loadAll();
    void tipoDocumentoListPloc.load();
    return () => {
      consultasPloc.reset();
      tipoDocumentoListPloc.reset();
    };
  }, [consultasPloc, tipoDocumentoListPloc]);

  const loading = consultas.isLoading || tipos.isLoading;
  const errors = [...(consultas.errors.general ?? []), ...(tipos.errors.general ?? [])];
  const httpErrors = traces.traces.filter((t) => !t.ok || (t.status ?? 0) >= 400).length;

  return (
    <section aria-label="Indicadores">
      {errors.map((m) => (
        <Alert key={m} variant="error" title={m} />
      ))}
      <div className={styles.grid}>
        <StatCard icon={Truck} label="Conductores operables" value={consultas.operables.length} loading={loading} />
        <StatCard icon={TriangleAlert} label="Documentos vencidos" value={consultas.vencidos.length} loading={loading} />
        <StatCard icon={Files} label="Tipos de documento" value={tipos.items.length} loading={loading} />
        <StatCard icon={Activity} label="Errores HTTP" value={httpErrors} loading={false} />
      </div>
    </section>
  );
}
