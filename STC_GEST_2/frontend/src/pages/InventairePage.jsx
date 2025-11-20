import { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { inventairesService } from '../services/inventaires.service';
import { stocksService } from '../services/stocks.service';
import { formatDate, formatSimpleDate } from '../utils/format';

function InventairePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [stocks, setStocks] = useState([]);
  const [inventaires, setInventaires] = useState([]);
  const [dateInventaire, setDateInventaire] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [appliquerAjustement, setAppliquerAjustement] = useState(true);
  const [quantitesReelles, setQuantitesReelles] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [stocksData, inventairesData] = await Promise.all([stocksService.list(), inventairesService.list()]);
      setStocks(stocksData || []);
      setInventaires(inventairesData || []);

      const initialQuantities = Object.fromEntries(
        (stocksData || []).map((stock) => [stock.materielId, stock.quantiteActuelle])
      );
      setQuantitesReelles(initialQuantities);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur chargement inventaire');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rows = useMemo(
    () =>
      stocks.map((stock) => {
        const quantiteReelle = Number(quantitesReelles[stock.materielId] ?? 0);
        return {
          ...stock,
          quantiteReelle,
          ecart: quantiteReelle - stock.quantiteActuelle
        };
      }),
    [stocks, quantitesReelles]
  );

  const submitInventaire = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      const inventaire = await inventairesService.create({
        dateInventaire: dateInventaire || undefined,
        commentaire: commentaire || undefined
      });

      const itemsPayload = {
        appliquerAjustement,
        items: stocks.map((stock) => ({
          materielId: stock.materielId,
          quantiteReelle: Number(quantitesReelles[stock.materielId] ?? 0),
          commentaire: null
        }))
      };

      await inventairesService.addItems(inventaire.id, itemsPayload);
      setInfo(`Inventaire #${inventaire.id} enregistré avec succès`);
      setCommentaire('');
      setDateInventaire('');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Enregistrement inventaire impossible');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Chargement module inventaire..." />;

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="font-display text-2xl font-bold">Inventaire</h1>
        <p className="text-sm text-slate-500">
          Saisie quantité réelle, calcul d’écart et transformation automatique en ajustement de stock.
        </p>
      </div>

      {error ? <div className="card text-sm text-danger">{error}</div> : null}
      {info ? <div className="card text-sm text-emerald-700">{info}</div> : null}

      {stocks.length === 0 ? (
        <EmptyState
          description="Il faut au moins un stock existant pour réaliser un inventaire."
          title="Aucun stock à inventorier"
        />
      ) : (
        <form className="card space-y-4" onSubmit={submitInventaire}>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="label">Date inventaire</label>
              <input
                className="input"
                onChange={(event) => setDateInventaire(event.target.value)}
                type="date"
                value={dateInventaire}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Commentaire</label>
              <input
                className="input"
                onChange={(event) => setCommentaire(event.target.value)}
                value={commentaire}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              checked={appliquerAjustement}
              onChange={(event) => setAppliquerAjustement(event.target.checked)}
              type="checkbox"
            />
            Appliquer automatiquement les écarts en AJUSTEMENT de stock
          </label>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Matériel</th>
                  <th className="px-4 py-3">N° inventaire</th>
                  <th className="px-4 py-3">Qté théorique</th>
                  <th className="px-4 py-3">Qté réelle</th>
                  <th className="px-4 py-3">Écart</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-t border-slate-100" key={row.id}>
                    <td className="px-4 py-3">{row.materiel?.nom}</td>
                    <td className="px-4 py-3">{row.numeroInventaire}</td>
                    <td className="px-4 py-3">{row.quantiteActuelle}</td>
                    <td className="px-4 py-3">
                      <input
                        className="input max-w-24"
                        min="0"
                        onChange={(event) =>
                          setQuantitesReelles((prev) => ({
                            ...prev,
                            [row.materielId]: event.target.value
                          }))
                        }
                        type="number"
                        value={quantitesReelles[row.materielId] ?? 0}
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold">{row.ecart}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button className="btn-primary" disabled={saving} type="submit">
              Enregistrer inventaire
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <h2 className="mb-3 font-display text-xl font-bold">Historique inventaires</h2>
        <DataTable
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'dateInventaire', header: 'Date', render: (row) => formatDate(row.dateInventaire) },
            { key: 'items', header: 'Nb items', render: (row) => row.items?.length || 0 },
            { key: 'commentaire', header: 'Commentaire', render: (row) => row.commentaire || '-' },
            { key: 'createdAt', header: 'Créé le', render: (row) => formatSimpleDate(row.createdAt) }
          ]}
          rows={inventaires}
        />
      </div>
    </div>
  );
}

export default InventairePage;
