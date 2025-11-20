import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { categoriesService } from '../services/categoriesService';
import { hardwareService } from '../services/hardwareService';
import { suppliersService } from '../services/suppliersService';
import { CONDITION_STATE_OPTIONS, HARDWARE_TYPE_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

const HardwarePage = () => {
  const [hardwareItems, setHardwareItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    q: '',
    hardware_type: '',
    condition_state: '',
    category_id: '',
    supplier_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [hardwareData, categoriesData, suppliersData] = await Promise.all([
        hardwareService.list(filters),
        categoriesService.list(),
        suppliersService.list()
      ]);

      setHardwareItems(hardwareData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger les matériels'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.q, filters.hardware_type, filters.condition_state, filters.category_id, filters.supplier_id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce matériel ?')) return;

    try {
      await hardwareService.remove(id);
      fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression impossible'));
    }
  };

  return (
    <div>
      <PageHeader
        title="Matériels"
        description="Gestion du parc matériel, médias et informations commerciales internes."
        action={
          <Link className="btn-primary" to="/hardware/new">
            Nouveau matériel
          </Link>
        }
      />

      <section className="card mb-4 grid gap-3 md:grid-cols-5">
        <input
          className="input md:col-span-2"
          placeholder="Recherche (nom, référence, marque...)"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />

        <select
          className="select"
          value={filters.hardware_type}
          onChange={(event) => setFilters((prev) => ({ ...prev, hardware_type: event.target.value }))}
        >
          <option value="">Tous types</option>
          {HARDWARE_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={filters.condition_state}
          onChange={(event) => setFilters((prev) => ({ ...prev, condition_state: event.target.value }))}
        >
          <option value="">Tous états</option>
          {CONDITION_STATE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={filters.category_id}
          onChange={(event) => setFilters((prev) => ({ ...prev, category_id: event.target.value }))}
        >
          <option value="">Toutes catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={filters.supplier_id}
          onChange={(event) => setFilters((prev) => ({ ...prev, supplier_id: event.target.value }))}
        >
          <option value="">Tous fournisseurs</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </section>

      {loading ? <LoadingState label="Chargement des matériels..." /> : null}
      {error ? <div className="card text-sm text-rose-600">{error}</div> : null}

      {!loading && !error && !hardwareItems.length ? (
        <EmptyState title="Aucun matériel" description="Ajoutez un matériel pour enrichir le catalogue interne." />
      ) : null}

      {!loading && !error && hardwareItems.length ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4">Produit</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Catégorie</th>
                <th className="pb-2 pr-4">Fournisseur</th>
                <th className="pb-2 pr-4">Prix vente</th>
                <th className="pb-2 pr-4">Quantité</th>
                <th className="pb-2 pr-4">État</th>
                <th className="pb-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hardwareItems.map((item) => (
                <tr className="border-b border-slate-100" key={item.id}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-slate-100">
                        {item.main_image ? (
                          <img
                            alt={item.name}
                            className="h-full w-full object-cover"
                            src={getMediaUrl(item.main_image)}
                          />
                        ) : null}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.reference || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">{item.hardware_type || '-'}</td>
                  <td className="py-3 pr-4">{item.category_name || '-'}</td>
                  <td className="py-3 pr-4">{item.supplier_name || '-'}</td>
                  <td className="py-3 pr-4 font-medium text-slate-800">{formatCurrency(item.sale_price)}</td>
                  <td className="py-3 pr-4">{item.quantity ?? '-'}</td>
                  <td className="py-3 pr-4">{item.condition_state || '-'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="btn-secondary" to={`/hardware/${item.id}`}>
                        Détail
                      </Link>
                      <Link className="btn-secondary" to={`/hardware/${item.id}/edit`}>
                        Éditer
                      </Link>
                      <button className="btn-danger" onClick={() => handleDelete(item.id)} type="button">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default HardwarePage;
