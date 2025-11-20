import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { cataloguesService } from '../services/cataloguesService';
import { getApiErrorMessage } from '../services/api';
import { clientTypesService } from '../services/clientTypesService';
import { CATALOGUE_STATUS_OPTIONS } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const CataloguesPage = () => {
  const navigate = useNavigate();

  const [catalogues, setCatalogues] = useState([]);
  const [clientTypes, setClientTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    q: '',
    statut: '',
    type_client_id: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [cataloguesData, clientTypesData] = await Promise.all([
        cataloguesService.list(filters),
        clientTypesService.list()
      ]);

      setCatalogues(cataloguesData);
      setClientTypes(clientTypesData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger les catalogues'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.q, filters.statut, filters.type_client_id]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce catalogue ?')) return;

    try {
      await cataloguesService.remove(id);
      fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression impossible'));
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const duplicated = await cataloguesService.duplicate(id);
      navigate(`/catalogues/${duplicated.catalogue.id}`);
    } catch (err) {
      alert(getApiErrorMessage(err, 'Duplication impossible'));
    }
  };

  return (
    <div>
      <PageHeader
        title="Catalogues clients"
        description="Créez des catalogues commerciaux à partir des matériels et logiciels existants."
        action={
          <div className="flex gap-2">
            <Link className="btn-secondary" to="/catalogues/types-clients">
              Types clients
            </Link>
            <Link className="btn-primary" to="/catalogues/new">
              Nouveau catalogue
            </Link>
          </div>
        }
      />

      <section className="card mb-4 grid gap-3 md:grid-cols-4">
        <input
          className="input md:col-span-2"
          placeholder="Recherche (nom, titre, sous-titre...)"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />

        <select
          className="select"
          value={filters.statut}
          onChange={(event) => setFilters((prev) => ({ ...prev, statut: event.target.value }))}
        >
          <option value="">Tous statuts</option>
          {CATALOGUE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={filters.type_client_id}
          onChange={(event) => setFilters((prev) => ({ ...prev, type_client_id: event.target.value }))}
        >
          <option value="">Tous types clients</option>
          {clientTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.nom}
            </option>
          ))}
        </select>
      </section>

      {loading ? <LoadingState label="Chargement des catalogues..." /> : null}
      {error ? <div className="card text-sm text-rose-600">{error}</div> : null}

      {!loading && !error && !catalogues.length ? (
        <EmptyState
          title="Aucun catalogue"
          description="Créez un premier catalogue commercial pour vos prospects."
        />
      ) : null}

      {!loading && !error && catalogues.length ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4">Nom</th>
                <th className="pb-2 pr-4">Titre</th>
                <th className="pb-2 pr-4">Type client</th>
                <th className="pb-2 pr-4">Statut</th>
                <th className="pb-2 pr-4">Sections</th>
                <th className="pb-2 pr-4">Produits</th>
                <th className="pb-2 pr-4">Total catalogue</th>
                <th className="pb-2 pr-4">Mise à jour</th>
                <th className="pb-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalogues.map((catalogue) => (
                <tr className="border-b border-slate-100" key={catalogue.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{catalogue.nom}</td>
                  <td className="py-3 pr-4">{catalogue.titre}</td>
                  <td className="py-3 pr-4">{catalogue.type_client_nom || '-'}</td>
                  <td className="py-3 pr-4 capitalize">{catalogue.statut}</td>
                  <td className="py-3 pr-4">{catalogue.sections_count || 0}</td>
                  <td className="py-3 pr-4">{catalogue.items_count || 0}</td>
                  <td className="py-3 pr-4 font-semibold text-brand-700">
                    {formatCurrency(catalogue.total_price)}
                  </td>
                  <td className="py-3 pr-4">{formatDateTime(catalogue.updated_at)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <Link className="btn-secondary" to={`/catalogues/${catalogue.id}`}>
                        Ouvrir
                      </Link>
                      <Link className="btn-secondary" to={`/catalogues/${catalogue.id}/preview`}>
                        Preview
                      </Link>
                      <a
                        className="btn-secondary"
                        href={cataloguesService.getExportPdfUrl(catalogue.id)}
                        rel="noreferrer"
                        target="_blank"
                      >
                        PDF
                      </a>
                      <button className="btn-secondary" onClick={() => handleDuplicate(catalogue.id)} type="button">
                        Dupliquer
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(catalogue.id)} type="button">
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

export default CataloguesPage;
