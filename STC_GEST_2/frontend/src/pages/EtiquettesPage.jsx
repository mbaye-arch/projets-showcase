import { useEffect, useState } from 'react';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import LabelPreview from '../components/LabelPreview';
import BarcodePreview from '../components/BarcodePreview';
import QrCodePreview from '../components/QrCodePreview';
import { stocksService } from '../services/stocks.service';

function EtiquettesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [stocks, setStocks] = useState([]);
  const [stockId, setStockId] = useState('');
  const [format, setFormat] = useState('SMALL');
  const [content, setContent] = useState('BOTH');
  const [preview, setPreview] = useState(null);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const result = await stocksService.list();
      setStocks(result || []);
      if (result?.length) {
        setStockId(String(result[0].id));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur chargement étiquettes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const generatePreview = async () => {
    if (!stockId) return;

    try {
      setError('');
      const result = await stocksService.getLabelPreview(stockId, {
        format,
        content
      });
      setPreview(result);
      setInfo('Aperçu étiquette prêt');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur de génération aperçu');
    }
  };

  const openPdf = () => {
    if (!stockId) return;
    const url = stocksService.getLabelPdfUrl(stockId, { format, content });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <LoadingState message="Chargement module étiquettes..." />;

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="font-display text-2xl font-bold">Étiquettes</h1>
        <p className="text-sm text-slate-500">
          Aperçu, impression navigateur et export PDF petit format avec barcode + QR code.
        </p>
      </div>

      {error ? <div className="card text-sm text-danger">{error}</div> : null}
      {info ? <div className="card text-sm text-emerald-700">{info}</div> : null}

      {stocks.length === 0 ? (
        <EmptyState
          description="Crée au moins un stock pour activer le module d’étiquetage."
          title="Aucune étiquette disponible"
        />
      ) : (
        <>
          <div className="card grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="label">Stock</label>
              <select className="input" onChange={(event) => setStockId(event.target.value)} value={stockId}>
                {stocks.map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.numeroInventaire} · {stock.materiel?.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Format</label>
              <select className="input" onChange={(event) => setFormat(event.target.value)} value={format}>
                <option value="TINY">Très petit</option>
                <option value="SMALL">Petit</option>
                <option value="STANDARD">Standard</option>
              </select>
            </div>

            <div>
              <label className="label">Contenu</label>
              <select className="input" onChange={(event) => setContent(event.target.value)} value={content}>
                <option value="BOTH">Barcode + QR</option>
                <option value="BARCODE">Barcode seul</option>
                <option value="QRCODE">QR seul</option>
              </select>
            </div>

            <div className="md:col-span-4 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={generatePreview} type="button">
                Générer aperçu
              </button>
              <button className="btn-secondary" onClick={openPdf} type="button">
                Export PDF
              </button>
            </div>
          </div>

          {preview ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card">
                <h2 className="mb-2 font-display text-xl font-bold">Aperçu</h2>
                <LabelPreview html={preview.html} />
              </div>
              <div className="space-y-4">
                <div className="card">
                  <h2 className="mb-2 font-display text-xl font-bold">Barcode</h2>
                  <BarcodePreview svg={preview.barcodeSvg} />
                </div>
                <div className="card">
                  <h2 className="mb-2 font-display text-xl font-bold">QR Code</h2>
                  <QrCodePreview dataUrl={preview.qrCodeDataUrl} />
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default EtiquettesPage;
