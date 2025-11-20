import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { softwareService } from '../services/softwareService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const SoftwareDetailPage = () => {
  const { id } = useParams();

  const [software, setSoftware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        setLoading(true);
        const data = await softwareService.getById(id);
        setSoftware(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger la fiche logiciel'));
      } finally {
        setLoading(false);
      }
    };

    fetchSoftware();
  }, [id]);

  if (loading) return <LoadingState label="Chargement fiche logiciel..." />;
  if (error) return <div className="card text-sm text-rose-600">{error}</div>;
  if (!software) return <EmptyState title="Logiciel introuvable" />;

  const details = [
    { label: 'Nom', value: software.name },
    { label: 'Type', value: software.software_type || '-' },
    { label: 'Catégorie', value: software.category_name || '-' },
    { label: 'Usage principal', value: software.usage_purpose || '-' },
    { label: 'Licence', value: software.has_license ? 'Oui' : 'Non' },
    { label: 'Prix', value: formatCurrency(software.price) },
    { label: 'Fournisseur / Éditeur', value: software.vendor_name || '-' },
    { label: 'Compatibilité', value: software.compatibility || '-' },
    { label: 'Créé le', value: formatDateTime(software.created_at) },
    { label: 'Mis à jour le', value: formatDateTime(software.updated_at) }
  ];

  return (
    <div>
      <PageHeader
        title={`Logiciel: ${software.name}`}
        description="Fiche complète logiciel."
        action={
          <div className="flex gap-2">
            <Link className="btn-secondary" to="/software">
              Retour
            </Link>
            <Link className="btn-primary" to={`/software/${software.id}/edit`}>
              Éditer
            </Link>
          </div>
        }
      />

      <section className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((detail) => (
          <div key={detail.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{detail.label}</p>
            <p className="mt-1 text-sm text-slate-800">{detail.value}</p>
          </div>
        ))}

        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
          <p className="mt-1 text-sm text-slate-800">{software.description || '-'}</p>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarques</p>
          <p className="mt-1 text-sm text-slate-800">{software.notes || '-'}</p>
        </div>
      </section>
    </div>
  );
};

export default SoftwareDetailPage;
