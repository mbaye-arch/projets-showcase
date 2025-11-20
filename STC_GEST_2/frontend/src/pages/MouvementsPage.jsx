import { useEffect, useState } from 'react';
import MovementForm from '../components/MovementForm';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import { mouvementsService } from '../services/mouvements.service';
import { stocksService } from '../services/stocks.service';
import { formatDate } from '../utils/format';

function MouvementsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [stocks, setStocks] = useState([]);
  const [mouvements, setMouvements] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stocksData, mouvementsData] = await Promise.all([stocksService.list(), mouvementsService.list()]);
      setStocks(stocksData || []);
      setMouvements(mouvementsData || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur de chargement mouvements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createMovement = async (payload) => {
    try {
      setSaving(true);
      setError('');
      await mouvementsService.create(payload);
      setInfo('Mouvement enregistré');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Création mouvement impossible');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Chargement des mouvements..." />;

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="font-display text-2xl font-bold">Mouvements de stock</h1>
        <p className="text-sm text-slate-500">ENTREE, SORTIE, RETOUR et AJUSTEMENT avec historisation persistante.</p>
      </div>

      {error ? <div className="card text-sm text-danger">{error}</div> : null}
      {info ? <div className="card text-sm text-emerald-700">{info}</div> : null}

      <div className="card">
        <h2 className="mb-3 font-display text-xl font-bold">Nouveau mouvement</h2>
        <MovementForm loading={saving} onSubmit={createMovement} stocks={stocks} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-display text-xl font-bold">Historique</h2>
        <DataTable
          columns={[
            { key: 'dateMouvement', header: 'Date', render: (row) => formatDate(row.dateMouvement) },
            { key: 'typeMouvement', header: 'Type' },
            { key: 'numeroInventaire', header: 'N° inventaire' },
            { key: 'materiel', header: 'Matériel', render: (row) => row.materiel?.nom || '-' },
            { key: 'quantite', header: 'Qté' },
            { key: 'motif', header: 'Motif', render: (row) => row.motif || '-' },
            { key: 'commentaire', header: 'Commentaire', render: (row) => row.commentaire || '-' }
          ]}
          rows={mouvements}
        />
      </div>
    </div>
  );
}

export default MouvementsPage;
