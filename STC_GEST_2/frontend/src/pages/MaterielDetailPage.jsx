import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import StockBadge from '../components/StockBadge';
import EmptyState from '../components/EmptyState';
import { materielsService } from '../services/materiels.service';
import { rechercheService } from '../services/recherche.service';
import { formatCurrency, formatDate, formatSimpleDate } from '../utils/format';

function MaterielDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [materiel, setMateriel] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        if (/^\d+$/.test(id)) {
          const result = await materielsService.getById(id);
          setMateriel(result);
          return;
        }

        const searchResult = await rechercheService.searchMateriel(id);
        const stock = searchResult?.results?.[0];
        if (!stock?.materiel?.id) {
          setMateriel(null);
          return;
        }

        const detail = await materielsService.getById(stock.materiel.id);
        setMateriel(detail);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Erreur sur la fiche matériel');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <LoadingState message="Chargement de la fiche matériel..." />;

  if (error) {
    return <div className="card text-sm text-danger">{error}</div>;
  }

  if (!materiel) {
    return (
      <EmptyState
        description="Vérifie la valeur scannée ou reviens à la liste pour sélectionner un matériel existant."
        title="Matériel introuvable"
        action={
          <button className="btn-secondary" onClick={() => navigate('/materiels')} type="button">
            Retour à la liste
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">{materiel.nom}</h1>
            <p className="text-sm text-slate-500">Référence: {materiel.reference || '-'}</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/materiels')} type="button">
            Retour
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div>
            <p className="label">Marque</p>
            <p className="text-sm font-semibold">{materiel.marque || '-'}</p>
          </div>
          <div>
            <p className="label">Modèle</p>
            <p className="text-sm font-semibold">{materiel.modele || '-'}</p>
          </div>
          <div>
            <p className="label">Catégorie</p>
            <p className="text-sm font-semibold">{materiel.categorie || '-'}</p>
          </div>
          <div>
            <p className="label">Création</p>
            <p className="text-sm font-semibold">{formatSimpleDate(materiel.createdAt)}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="label">Description</p>
          <p className="text-sm text-slate-700">{materiel.description || 'Aucune description'}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 font-display text-xl font-bold">Stock associé</h2>
        {materiel.stock ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Numéro inventaire</p>
              <p className="text-sm font-semibold">{materiel.stock.numeroInventaire}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Statut</p>
              <StockBadge status={materiel.stock.statutStock} />
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Valeur stock</p>
              <p className="text-sm font-semibold">{formatCurrency(materiel.stock.valeurStock)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Quantité actuelle</p>
              <p className="text-sm font-semibold">{materiel.stock.quantiteActuelle}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Stock minimum</p>
              <p className="text-sm font-semibold">{materiel.stock.stockMinimum}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Prix achat</p>
              <p className="text-sm font-semibold">{formatCurrency(materiel.stock.prixAchat)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Date achat</p>
              <p className="text-sm font-semibold">{formatSimpleDate(materiel.stock.dateAchat)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Date réception</p>
              <p className="text-sm font-semibold">{formatSimpleDate(materiel.stock.dateReception)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="label">Date fin garantie</p>
              <p className="text-sm font-semibold">{formatSimpleDate(materiel.stock.dateFinGarantie)}</p>
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Aucun stock encore créé pour ce matériel.
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 font-display text-xl font-bold">Derniers mouvements</h2>
        <DataTable
          columns={[
            { key: 'dateMouvement', header: 'Date', render: (row) => formatDate(row.dateMouvement) },
            { key: 'typeMouvement', header: 'Type' },
            { key: 'quantite', header: 'Qté' },
            { key: 'motif', header: 'Motif', render: (row) => row.motif || '-' },
            { key: 'commentaire', header: 'Commentaire', render: (row) => row.commentaire || '-' }
          ]}
          rows={materiel.mouvements || []}
        />
      </div>
    </div>
  );
}

export default MaterielDetailPage;
