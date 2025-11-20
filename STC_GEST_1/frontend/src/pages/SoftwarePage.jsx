import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { categoriesService } from '../services/categoriesService';
import { softwareService } from '../services/softwareService';
import { SOFTWARE_TYPE_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

const SoftwarePage = () => {
  const [softwareList, setSoftwareList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    q: '',
    software_type: '',
    category_id: '',
    has_license: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [softwareData, categoriesData] = await Promise.all([
        softwareService.list(filters),
        categoriesService.list()
      ]);

      setSoftwareList(softwareData);
      setCategories(categoriesData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger les logiciels'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.q, filters.software_type, filters.category_id, filters.has_license]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce logiciel ?')) return;

    try {
      await softwareService.remove(id);
      fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression impossible'));
    }
  };

  return (
    <div>
      <PageHeader
        title="Logiciels"
        description="Gestion des logiciels et informations de licence/usage."
        action={
          <Link className="btn-primary" to="/software/new">
            Nouveau logiciel
          </Link>
        }
      />

      <section className="card mb-4 grid gap-3 md:grid-cols-4">
        <input
          className="input md:col-span-2"
          placeholder="Recherche (nom, éditeur, compatibilité...)"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />

        <select
          className="select"
          value={filters.software_type}
          onChange={(event) => setFilters((prev) => ({ ...prev, software_type: event.target.value }))}
        >
          <option value="">Tous types</option>
          {SOFTWARE_TYPE_OPTIONS.map((option) => (
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
          value={filters.has_license}
          onChange={(event) => setFilters((prev) => ({ ...prev, has_license: event.target.value }))}
        >
          <option value="">Licence: tout</option>
          <option value="1">Avec licence</option>
          <option value="0">Sans licence</option>
        </select>
      </section>

      {loading ? <LoadingState label="Chargement des logiciels..." /> : null}
      {error ? <div className="card text-sm text-rose-600">{error}</div> : null}

      {!loading && !error && !softwareList.length ? (
        <EmptyState title="Aucun logiciel" description="Ajoutez un logiciel pour compléter le catalogue." />
      ) : null}

      {!loading && !error && softwareList.length ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4">Nom</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Catégorie</th>
                <th className="pb-2 pr-4">Licence</th>
                <th className="pb-2 pr-4">Prix</th>
                <th className="pb-2 pr-4">Éditeur</th>
                <th className="pb-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {softwareList.map((software) => (
                <tr className="border-b border-slate-100" key={software.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{software.name}</td>
                  <td className="py-3 pr-4">{software.software_type || '-'}</td>
                  <td className="py-3 pr-4">{software.category_name || '-'}</td>
                  <td className="py-3 pr-4">{software.has_license ? 'Oui' : 'Non'}</td>
                  <td className="py-3 pr-4 font-medium text-slate-800">{formatCurrency(software.price)}</td>
                  <td className="py-3 pr-4">{software.vendor_name || '-'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="btn-secondary" to={`/software/${software.id}`}>
                        Détail
                      </Link>
                      <Link className="btn-secondary" to={`/software/${software.id}/edit`}>
                        Éditer
                      </Link>
                      <button className="btn-danger" onClick={() => handleDelete(software.id)} type="button">
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

export default SoftwarePage;
