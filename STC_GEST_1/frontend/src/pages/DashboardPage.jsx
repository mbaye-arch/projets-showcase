import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import { dashboardService } from '../services/dashboardService';
import { getApiErrorMessage } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await dashboardService.getStats();
        setStats(result);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger le dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const reloadPage = () => window.location.reload();

  if (loading) return <LoadingState label="Chargement des statistiques..." />;
  if (error)
    return (
      <div className="card border-rose-200 bg-rose-50/90">
        <h2 className="text-lg font-bold text-rose-700">Impossible de charger le dashboard</h2>
        <p className="mt-2 text-sm text-rose-700">{error}</p>
        <p className="mt-3 text-sm text-slate-700">
          Vérifie que MySQL et le backend sont démarrés. Sur Ubuntu: <strong>sudo systemctl start
          mysql</strong>, puis relance <strong>./scripts/run-local.sh</strong>.
        </p>
        <div className="mt-4">
          <button className="btn-primary" onClick={reloadPage} type="button">
            Réessayer
          </button>
        </div>
      </div>
    );

  const totals = stats?.totals || {};
  const condition = stats?.hardwareByCondition || {};
  const productsByType = stats?.productsByType || [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble rapide de l'activité interne SenTechCare."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total fournisseurs" value={totals.suppliers || 0} />
        <StatCard title="Total catégories" value={totals.categories || 0} />
        <StatCard title="Total matériels" value={totals.hardware || 0} />
        <StatCard title="Total logiciels" value={totals.software || 0} />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="Matériels neufs" value={condition.new || 0} hint="État: neuf" />
        <StatCard
          title="Matériels reconditionnés"
          value={condition.refurbished || 0}
          hint="État: reconditionné"
        />
        <StatCard title="Matériels occasion" value={condition.used || 0} hint="État: occasion" />
      </section>

      <section className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Produits par type</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4">Source</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {productsByType.map((item, index) => (
                <tr className="border-b border-slate-100" key={`${item.source}-${item.type}-${index}`}>
                  <td className="py-2 pr-4 capitalize">{item.source}</td>
                  <td className="py-2 pr-4">{item.type}</td>
                  <td className="py-2 pr-4 font-semibold text-slate-800">{item.total}</td>
                </tr>
              ))}
              {!productsByType.length ? (
                <tr>
                  <td className="py-4 text-slate-500" colSpan={3}>
                    Aucune donnée disponible.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
