import { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StockBadge from '../components/StockBadge';
import LoadingState from '../components/LoadingState';
import { materielsService } from '../services/materiels.service';
import { stocksService } from '../services/stocks.service';
import { mouvementsService } from '../services/mouvements.service';
import { inventairesService } from '../services/inventaires.service';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    materiels: [],
    stocks: [],
    mouvements: [],
    inventaires: []
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [materiels, stocks, mouvements, inventaires] = await Promise.all([
          materielsService.list(),
          stocksService.list(),
          mouvementsService.list(),
          inventairesService.list()
        ]);

        setData({
          materiels: materiels || [],
          stocks: stocks || [],
          mouvements: mouvements || [],
          inventaires: inventaires || []
        });
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Erreur lors du chargement du dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const totalValue = data.stocks.reduce((acc, stock) => acc + Number(stock.valeurStock || 0), 0);
    const lowCount = data.stocks.filter((stock) => stock.statutStock === 'FAIBLE').length;
    const ruptureCount = data.stocks.filter((stock) => stock.statutStock === 'RUPTURE').length;

    return {
      totalValue,
      lowCount,
      ruptureCount
    };
  }, [data]);

  if (loading) {
    return <LoadingState message="Chargement du dashboard..." />;
  }

  if (error) {
    return <div className="card text-sm text-danger">{error}</div>;
  }

  const recentMouvements = data.mouvements.slice(0, 8);
  const stocksCritiques = data.stocks.filter((stock) => stock.statutStock !== 'NORMAL');

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard title="Matériels" tone="accent" value={formatNumber(data.materiels.length)} />
        <StatCard title="Valeur stock" tone="sunrise" value={formatCurrency(stats.totalValue)} />
        <StatCard title="Stocks faibles" tone="sunrise" value={formatNumber(stats.lowCount)} />
        <StatCard title="Ruptures" tone="danger" value={formatNumber(stats.ruptureCount)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Mouvements récents</h2>
            <p className="text-xs text-slate-500">{recentMouvements.length} affichés</p>
          </div>

          <DataTable
            columns={[
              { key: 'dateMouvement', header: 'Date', render: (row) => formatDate(row.dateMouvement) },
              { key: 'typeMouvement', header: 'Type' },
              {
                key: 'materiel',
                header: 'Matériel',
                render: (row) => `${row.numeroInventaire} · ${row.materiel?.nom || 'N/A'}`
              },
              { key: 'quantite', header: 'Qté' },
              { key: 'motif', header: 'Motif', render: (row) => row.motif || '-' }
            ]}
            rows={recentMouvements}
          />
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Stocks critiques</h2>
            <p className="text-xs text-slate-500">{stocksCritiques.length}</p>
          </div>

          <div className="space-y-3">
            {stocksCritiques.length === 0 ? (
              <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Aucune alerte stock</p>
            ) : (
              stocksCritiques.slice(0, 8).map((stock) => (
                <div className="rounded-xl border border-slate-200 p-3" key={stock.id}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{stock.materiel?.nom}</p>
                    <StockBadge status={stock.statutStock} />
                  </div>
                  <p className="text-xs text-slate-500">{stock.numeroInventaire}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Qté: {stock.quantiteActuelle} / Min: {stock.stockMinimum}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <p className="text-sm text-slate-500">
          Inventaires enregistrés: <span className="font-semibold text-ink">{formatNumber(data.inventaires.length)}</span>
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;
