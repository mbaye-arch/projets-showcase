import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import { useSelection } from '../hooks/useSelection';
import { INTERNAL_NOTE_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

const SelectionPage = () => {
  const { items, internalNote, setInternalNote, removeItem, updateQuantity, clearSelection, totals } = useSelection();

  if (!items.length) {
    return (
      <div>
        <PageHeader
          title="Sélection interne"
          description="Préparez une proposition commerciale interne (type panier métier)."
        />
        <EmptyState
          title="Sélection vide"
          description="Ajoutez des produits depuis le catalogue pour calculer vos totaux."
        />
        <div className="mt-4">
          <Link className="btn-primary" to="/catalog">
            Aller au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const getLineTotal = (key) => totals.lineTotals.find((line) => line.key === key)?.total || 0;

  return (
    <div>
      <PageHeader
        title="Sélection interne"
        description="Ajustez les quantités, ajoutez une note interne et visualisez les totaux automatiquement."
        action={
          <button className="btn-danger" onClick={clearSelection} type="button">
            Vider la sélection
          </button>
        }
      />

      <section className="card mb-4 grid gap-2 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="internal_note">
            Note interne
          </label>
          <select
            className="select"
            id="internal_note"
            value={internalNote}
            onChange={(event) => setInternalNote(event.target.value)}
          >
            <option value="">Aucune note</option>
            {INTERNAL_NOTE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-start md:justify-end">
          <div className="rounded-lg bg-brand-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-brand-700">Total global</p>
            <p className="text-2xl font-bold text-brand-700">{formatCurrency(totals.grandTotal)}</p>
          </div>
        </div>
      </section>

      <section className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="pb-2 pr-4">Produit</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Prix unitaire</th>
              <th className="pb-2 pr-4">Quantité</th>
              <th className="pb-2 pr-4">Total ligne</th>
              <th className="pb-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b border-slate-100" key={item.key}>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-slate-100">
                      {item.image ? (
                        <img alt={item.name} className="h-full w-full object-cover" src={getMediaUrl(item.image)} />
                      ) : null}
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">Catégorie: {item.category || '-'}</p>
                      <p className="text-xs text-slate-500">Fournisseur: {item.supplier || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">{item.type === 'hardware' ? 'Matériel' : 'Logiciel'}</td>
                <td className="py-3 pr-4">{formatCurrency(item.price)}</td>
                <td className="py-3 pr-4">
                  <input
                    className="input w-24"
                    min="1"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.key, event.target.value)}
                  />
                </td>
                <td className="py-3 pr-4 font-semibold text-slate-800">{formatCurrency(getLineTotal(item.key))}</td>
                <td className="py-3 pr-4">
                  <button className="btn-danger" onClick={() => removeItem(item.key)} type="button">
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SelectionPage;
