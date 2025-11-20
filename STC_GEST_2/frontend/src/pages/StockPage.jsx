import { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StockBadge from '../components/StockBadge';
import SearchFilters from '../components/SearchFilters';
import BarcodePreview from '../components/BarcodePreview';
import QrCodePreview from '../components/QrCodePreview';
import { stocksService } from '../services/stocks.service';
import { materielsService } from '../services/materiels.service';
import { formatCurrency, formatSimpleDate } from '../utils/format';

function StockPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [stocks, setStocks] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [barcodeSvg, setBarcodeSvg] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newStock, setNewStock] = useState({
    materielId: '',
    quantiteActuelle: 0,
    stockMinimum: 1,
    emplacement: '',
    prixAchat: 0,
    dateAchat: '',
    dateReception: '',
    dateFinGarantie: ''
  });

  const loadStocks = async () => {
    try {
      setLoading(true);
      const [stocksResult, materielsResult] = await Promise.all([stocksService.list(), materielsService.list()]);
      setStocks(stocksResult || []);
      setMateriels(materielsResult || []);
      if (!selectedStock && stocksResult?.length > 0) {
        setSelectedStock(stocksResult[0]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur de chargement des stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const filteredStocks = useMemo(() => {
    if (!search.trim()) return stocks;
    const q = search.toLowerCase();

    return stocks.filter((stock) =>
      [
        stock.numeroInventaire,
        stock.codeBarresValeur,
        stock.materiel?.nom,
        stock.materiel?.reference,
        stock.materiel?.marque,
        stock.materiel?.modele
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [stocks, search]);

  const materielsWithoutStock = useMemo(() => {
    const stockedMaterielIds = new Set(stocks.map((stock) => stock.materielId));
    return materiels.filter((materiel) => !stockedMaterielIds.has(materiel.id));
  }, [materiels, stocks]);

  const generateInventoryNumber = async (stock) => {
    try {
      setInfo('');
      await stocksService.generateInventoryNumber(stock.id);
      setInfo(`Numéro inventaire régénéré pour ${stock.materiel?.nom}`);
      await loadStocks();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur génération inventaire');
    }
  };

  const generateBarcode = async (stock) => {
    try {
      const result = await stocksService.generateBarcode(stock.id);
      setBarcodeSvg(result?.svg || '');
      setInfo(`Code-barres généré pour ${stock.numeroInventaire}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur génération code-barres');
    }
  };

  const generateQrCode = async (stock) => {
    try {
      const result = await stocksService.generateQrCode(stock.id);
      setQrDataUrl(result?.dataUrl || '');
      setInfo(`QR code généré pour ${stock.numeroInventaire}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur génération QR code');
    }
  };

  const updateStock = async (event) => {
    event.preventDefault();
    if (!selectedStock?.id) return;

    try {
      setUpdating(true);
      await stocksService.update(selectedStock.id, {
        stockMinimum: Number(selectedStock.stockMinimum || 0),
        emplacement: selectedStock.emplacement || null,
        prixAchat: Number(selectedStock.prixAchat || 0),
        dateFinGarantie: selectedStock.dateFinGarantie || null
      });
      setInfo('Stock mis à jour');
      await loadStocks();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur mise à jour stock');
    } finally {
      setUpdating(false);
    }
  };

  const createStock = async (event) => {
    event.preventDefault();
    if (!newStock.materielId) return;

    try {
      setCreating(true);
      setError('');
      await stocksService.create({
        materielId: Number(newStock.materielId),
        quantiteActuelle: Number(newStock.quantiteActuelle || 0),
        stockMinimum: Number(newStock.stockMinimum || 0),
        emplacement: newStock.emplacement || null,
        prixAchat: Number(newStock.prixAchat || 0),
        dateAchat: newStock.dateAchat || null,
        dateReception: newStock.dateReception || null,
        dateFinGarantie: newStock.dateFinGarantie || null
      });
      setInfo('Stock créé avec succès');
      setNewStock({
        materielId: '',
        quantiteActuelle: 0,
        stockMinimum: 1,
        emplacement: '',
        prixAchat: 0,
        dateAchat: '',
        dateReception: '',
        dateFinGarantie: ''
      });
      await loadStocks();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Création stock impossible');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingState message="Chargement des stocks..." />;

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="font-display text-2xl font-bold">Stock</h1>
        <p className="text-sm text-slate-500">Suivi des quantités, des dates et des identifiants matériels.</p>
      </div>

      {error ? <div className="card text-sm text-danger">{error}</div> : null}
      {info ? <div className="card text-sm text-emerald-700">{info}</div> : null}

      <form className="card grid gap-3 md:grid-cols-4" onSubmit={createStock}>
        <div className="md:col-span-4">
          <h2 className="font-display text-xl font-bold">Créer un stock</h2>
          <p className="text-sm text-slate-500">Associer un stock à un matériel qui n’en possède pas encore.</p>
        </div>

        <div className="md:col-span-2">
          <label className="label">Matériel</label>
          <select
            className="input"
            onChange={(event) => setNewStock((prev) => ({ ...prev, materielId: event.target.value }))}
            required
            value={newStock.materielId}
          >
            <option value="">Sélectionner un matériel</option>
            {materielsWithoutStock.map((materiel) => (
              <option key={materiel.id} value={materiel.id}>
                {materiel.reference || 'N/A'} · {materiel.nom}
              </option>
            ))}
          </select>
          {materielsWithoutStock.length === 0 ? (
            <p className="mt-1 text-xs text-slate-500">Tous les matériels ont déjà un stock.</p>
          ) : null}
        </div>

        <div>
          <label className="label">Qté initiale</label>
          <input
            className="input"
            min="0"
            onChange={(event) => setNewStock((prev) => ({ ...prev, quantiteActuelle: event.target.value }))}
            type="number"
            value={newStock.quantiteActuelle}
          />
        </div>

        <div>
          <label className="label">Stock minimum</label>
          <input
            className="input"
            min="0"
            onChange={(event) => setNewStock((prev) => ({ ...prev, stockMinimum: event.target.value }))}
            type="number"
            value={newStock.stockMinimum}
          />
        </div>

        <div>
          <label className="label">Emplacement</label>
          <input
            className="input"
            onChange={(event) => setNewStock((prev) => ({ ...prev, emplacement: event.target.value }))}
            value={newStock.emplacement}
          />
        </div>

        <div>
          <label className="label">Prix achat (Fcfa)</label>
          <input
            className="input"
            min="0"
            onChange={(event) => setNewStock((prev) => ({ ...prev, prixAchat: event.target.value }))}
            step="0.01"
            type="number"
            value={newStock.prixAchat}
          />
        </div>

        <div>
          <label className="label">Date achat</label>
          <input
            className="input"
            onChange={(event) => setNewStock((prev) => ({ ...prev, dateAchat: event.target.value }))}
            type="date"
            value={newStock.dateAchat}
          />
        </div>

        <div>
          <label className="label">Date réception</label>
          <input
            className="input"
            onChange={(event) => setNewStock((prev) => ({ ...prev, dateReception: event.target.value }))}
            type="date"
            value={newStock.dateReception}
          />
        </div>

        <div>
          <label className="label">Date fin garantie</label>
          <input
            className="input"
            onChange={(event) => setNewStock((prev) => ({ ...prev, dateFinGarantie: event.target.value }))}
            type="date"
            value={newStock.dateFinGarantie}
          />
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button className="btn-primary" disabled={creating || materielsWithoutStock.length === 0} type="submit">
            Créer le stock
          </button>
        </div>
      </form>

      <SearchFilters
        onChange={setSearch}
        placeholder="Recherche stock (inventaire, code, nom, référence...)"
        value={search}
      />

      {filteredStocks.length === 0 ? (
        <EmptyState
          description="Aucun stock disponible. Crée un matériel puis crée son stock associé."
          title="Aucun stock"
        />
      ) : (
        <DataTable
          columns={[
            { key: 'numeroInventaire', header: 'N° inventaire' },
            { key: 'materiel', header: 'Matériel', render: (row) => row.materiel?.nom || '-' },
            { key: 'quantiteActuelle', header: 'Qté actuelle' },
            { key: 'stockMinimum', header: 'Stock min' },
            { key: 'valeurStock', header: 'Valeur', render: (row) => formatCurrency(row.valeurStock) },
            {
              key: 'statutStock',
              header: 'Statut',
              render: (row) => <StockBadge status={row.statutStock} />
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary !px-3 !py-1.5" onClick={() => setSelectedStock(row)} type="button">
                    Éditer
                  </button>
                  <button
                    className="btn-secondary !px-3 !py-1.5"
                    onClick={() => generateInventoryNumber(row)}
                    type="button"
                  >
                    Générer N°
                  </button>
                  <button className="btn-secondary !px-3 !py-1.5" onClick={() => generateBarcode(row)} type="button">
                    Barcode
                  </button>
                  <button className="btn-secondary !px-3 !py-1.5" onClick={() => generateQrCode(row)} type="button">
                    QR
                  </button>
                </div>
              )
            }
          ]}
          rows={filteredStocks}
        />
      )}

      {selectedStock ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <form className="card space-y-3" onSubmit={updateStock}>
            <h2 className="font-display text-xl font-bold">Mise à jour stock</h2>
            <p className="text-sm text-slate-500">{selectedStock.numeroInventaire}</p>

            <div>
              <label className="label">Stock minimum</label>
              <input
                className="input"
                min="0"
                onChange={(event) =>
                  setSelectedStock((prev) => ({
                    ...prev,
                    stockMinimum: event.target.value
                  }))
                }
                type="number"
                value={selectedStock.stockMinimum ?? ''}
              />
            </div>

            <div>
              <label className="label">Emplacement</label>
              <input
                className="input"
                onChange={(event) =>
                  setSelectedStock((prev) => ({
                    ...prev,
                    emplacement: event.target.value
                  }))
                }
                value={selectedStock.emplacement || ''}
              />
            </div>

            <div>
              <label className="label">Prix achat (Fcfa)</label>
              <input
                className="input"
                min="0"
                onChange={(event) =>
                  setSelectedStock((prev) => ({
                    ...prev,
                    prixAchat: event.target.value
                  }))
                }
                step="0.01"
                type="number"
                value={selectedStock.prixAchat ?? ''}
              />
            </div>

            <div>
              <label className="label">Date fin garantie</label>
              <input
                className="input"
                onChange={(event) =>
                  setSelectedStock((prev) => ({
                    ...prev,
                    dateFinGarantie: event.target.value
                  }))
                }
                type="date"
                value={selectedStock.dateFinGarantie ? String(selectedStock.dateFinGarantie).slice(0, 10) : ''}
              />
            </div>

            <button className="btn-primary" disabled={updating} type="submit">
              Enregistrer
            </button>
          </form>

          <div className="space-y-4">
            <div className="card">
              <h2 className="mb-2 font-display text-lg font-bold">Informations clés</h2>
              <p className="text-sm text-slate-600">Dernière entrée: {formatSimpleDate(selectedStock.dateDerniereEntree)}</p>
              <p className="text-sm text-slate-600">Dernière sortie: {formatSimpleDate(selectedStock.dateDerniereSortie)}</p>
              <p className="text-sm text-slate-600">Dernière reprise: {formatSimpleDate(selectedStock.dateDerniereReprise)}</p>
            </div>
            <BarcodePreview svg={barcodeSvg} />
            <QrCodePreview dataUrl={qrDataUrl} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StockPage;
