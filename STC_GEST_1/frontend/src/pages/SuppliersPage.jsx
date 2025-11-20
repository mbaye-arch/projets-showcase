import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { suppliersService } from '../services/suppliersService';
import { SUPPLIER_PLATFORM_OPTIONS, SUPPLIER_TYPE_OPTIONS } from '../utils/constants';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    platform: '',
    supplier_type: ''
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await suppliersService.list(filters);
      setSuppliers(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger les fournisseurs'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [filters.q, filters.platform, filters.supplier_type]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce fournisseur ?')) return;

    try {
      await suppliersService.remove(id);
      fetchSuppliers();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression impossible'));
    }
  };

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        description="Gestion complète des fournisseurs et consultation des matériels liés."
        action={
          <Link className="btn-primary" to="/suppliers/new">
            Nouveau fournisseur
          </Link>
        }
      />

      <section className="card mb-4 grid gap-3 md:grid-cols-3">
        <input
          className="input"
          placeholder="Recherche (nom, pays, email...)"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />

        <select
          className="select"
          value={filters.platform}
          onChange={(event) => setFilters((prev) => ({ ...prev, platform: event.target.value }))}
        >
          <option value="">Toutes les plateformes</option>
          {SUPPLIER_PLATFORM_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={filters.supplier_type}
          onChange={(event) => setFilters((prev) => ({ ...prev, supplier_type: event.target.value }))}
        >
          <option value="">Tous les types</option>
          {SUPPLIER_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </section>

      {loading ? <LoadingState label="Chargement des fournisseurs..." /> : null}
      {error ? <div className="card text-sm text-rose-600">{error}</div> : null}

      {!loading && !error && !suppliers.length ? (
        <EmptyState
          title="Aucun fournisseur"
          description="Créez votre premier fournisseur pour démarrer le catalogue interne."
        />
      ) : null}

      {!loading && !error && suppliers.length ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4">Nom</th>
                <th className="pb-2 pr-4">Localisation</th>
                <th className="pb-2 pr-4">Plateforme</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Fiabilité</th>
                <th className="pb-2 pr-4">Matériels</th>
                <th className="pb-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr className="border-b border-slate-100" key={supplier.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{supplier.name}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    {[supplier.city, supplier.country].filter(Boolean).join(', ') || '-'}
                  </td>
                  <td className="py-3 pr-4">{supplier.platform || '-'}</td>
                  <td className="py-3 pr-4">{supplier.supplier_type || '-'}</td>
                  <td className="py-3 pr-4">{supplier.reliability_level || '-'}</td>
                  <td className="py-3 pr-4">{supplier.hardware_count || 0}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="btn-secondary" to={`/suppliers/${supplier.id}`}>
                        Détail
                      </Link>
                      <Link className="btn-secondary" to={`/suppliers/${supplier.id}/edit`}>
                        Éditer
                      </Link>
                      <button className="btn-danger" onClick={() => handleDelete(supplier.id)} type="button">
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

export default SuppliersPage;
