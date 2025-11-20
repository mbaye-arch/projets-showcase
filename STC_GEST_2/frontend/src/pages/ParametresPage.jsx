import { useEffect, useState } from 'react';
import LoadingState from '../components/LoadingState';
import { parametresService } from '../services/parametres.service';

function ParametresPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [values, setValues] = useState({
    INVENTORY_FORMAT: '{prefix}-{year}-{counter}',
    INVENTORY_PREFIX_DEFAULT: 'MAT',
    INVENTORY_COUNTER_PADDING: 4,
    INVENTORY_COUNTER_MODE: 'ANNUEL',
    QR_CODE_STRATEGY: 'INVENTORY_NUMBER',
    QR_CODE_BASE_URL: 'http://localhost:5173/materiels',
    LABEL_DEFAULT_FORMAT: 'SMALL',
    LABEL_DEFAULT_CONTENT: 'BOTH'
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await parametresService.get();
      setValues((prev) => ({ ...prev, ...(data || {}) }));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur chargement paramètres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      await parametresService.update({
        ...values,
        INVENTORY_COUNTER_PADDING: Number(values.INVENTORY_COUNTER_PADDING)
      });
      setInfo('Paramètres sauvegardés');
      await loadSettings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Sauvegarde impossible');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Chargement des paramètres..." />;

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="font-display text-2xl font-bold">Paramètres système</h1>
        <p className="text-sm text-slate-500">Configuration des identifiants, QR code et étiquettes.</p>
      </div>

      {error ? <div className="card text-sm text-danger">{error}</div> : null}
      {info ? <div className="card text-sm text-emerald-700">{info}</div> : null}

      <form className="card grid gap-3 md:grid-cols-2" onSubmit={submit}>
        <div>
          <label className="label">Format numéro inventaire</label>
          <input
            className="input"
            onChange={(event) => setValues((prev) => ({ ...prev, INVENTORY_FORMAT: event.target.value }))}
            value={values.INVENTORY_FORMAT}
          />
        </div>

        <div>
          <label className="label">Préfixe par défaut</label>
          <input
            className="input"
            onChange={(event) => setValues((prev) => ({ ...prev, INVENTORY_PREFIX_DEFAULT: event.target.value }))}
            value={values.INVENTORY_PREFIX_DEFAULT}
          />
        </div>

        <div>
          <label className="label">Padding compteur</label>
          <input
            className="input"
            min="1"
            onChange={(event) => setValues((prev) => ({ ...prev, INVENTORY_COUNTER_PADDING: event.target.value }))}
            type="number"
            value={values.INVENTORY_COUNTER_PADDING}
          />
        </div>

        <div>
          <label className="label">Mode compteur</label>
          <select
            className="input"
            onChange={(event) => setValues((prev) => ({ ...prev, INVENTORY_COUNTER_MODE: event.target.value }))}
            value={values.INVENTORY_COUNTER_MODE}
          >
            <option value="ANNUEL">ANNUEL</option>
            <option value="GLOBAL">GLOBAL</option>
          </select>
        </div>

        <div>
          <label className="label">Stratégie QR code</label>
          <select
            className="input"
            onChange={(event) => setValues((prev) => ({ ...prev, QR_CODE_STRATEGY: event.target.value }))}
            value={values.QR_CODE_STRATEGY}
          >
            <option value="INVENTORY_NUMBER">INVENTORY_NUMBER</option>
            <option value="INTERNAL_URL">INTERNAL_URL</option>
          </select>
        </div>

        <div>
          <label className="label">Base URL QR interne</label>
          <input
            className="input"
            onChange={(event) => setValues((prev) => ({ ...prev, QR_CODE_BASE_URL: event.target.value }))}
            value={values.QR_CODE_BASE_URL}
          />
        </div>

        <div>
          <label className="label">Format étiquette</label>
          <select
            className="input"
            onChange={(event) => setValues((prev) => ({ ...prev, LABEL_DEFAULT_FORMAT: event.target.value }))}
            value={values.LABEL_DEFAULT_FORMAT}
          >
            <option value="TINY">TINY</option>
            <option value="SMALL">SMALL</option>
            <option value="STANDARD">STANDARD</option>
          </select>
        </div>

        <div>
          <label className="label">Contenu étiquette</label>
          <select
            className="input"
            onChange={(event) => setValues((prev) => ({ ...prev, LABEL_DEFAULT_CONTENT: event.target.value }))}
            value={values.LABEL_DEFAULT_CONTENT}
          >
            <option value="BOTH">BOTH</option>
            <option value="BARCODE">BARCODE</option>
            <option value="QRCODE">QRCODE</option>
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button className="btn-primary" disabled={saving} type="submit">
            Enregistrer paramètres
          </button>
        </div>
      </form>
    </div>
  );
}

export default ParametresPage;
