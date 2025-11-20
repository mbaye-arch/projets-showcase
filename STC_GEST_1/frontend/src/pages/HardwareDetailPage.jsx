import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { hardwareService } from '../services/hardwareService';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

const HardwareDetailPage = () => {
  const { id } = useParams();

  const [hardware, setHardware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHardware = async () => {
      try {
        setLoading(true);
        const data = await hardwareService.getById(id);
        setHardware(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger la fiche matériel'));
      } finally {
        setLoading(false);
      }
    };

    fetchHardware();
  }, [id]);

  if (loading) return <LoadingState label="Chargement fiche matériel..." />;
  if (error) return <div className="card text-sm text-rose-600">{error}</div>;
  if (!hardware) return <EmptyState title="Matériel introuvable" />;

  const details = [
    { label: 'Nom', value: hardware.name },
    { label: 'Référence', value: hardware.reference || '-' },
    { label: 'Marque', value: hardware.brand || '-' },
    { label: 'Modèle', value: hardware.model || '-' },
    { label: 'Type', value: hardware.hardware_type || '-' },
    { label: 'Catégorie', value: hardware.category_name || '-' },
    { label: 'Fournisseur', value: hardware.supplier_name || '-' },
    { label: 'Plateforme fournisseur', value: hardware.supplier_platform || '-' },
    { label: 'Prix achat', value: formatCurrency(hardware.purchase_price) },
    { label: 'Prix vente conseillé', value: formatCurrency(hardware.sale_price) },
    { label: 'Quantité', value: hardware.quantity ?? '-' },
    { label: 'État', value: hardware.condition_state || '-' },
    { label: 'Pays source', value: hardware.source_country || '-' },
    { label: 'Délai estimé', value: hardware.estimated_delay || '-' },
    { label: 'Créé le', value: formatDateTime(hardware.created_at) },
    { label: 'Mis à jour le', value: formatDateTime(hardware.updated_at) }
  ];

  return (
    <div>
      <PageHeader
        title={`Matériel: ${hardware.name}`}
        description="Fiche complète avec médias."
        action={
          <div className="flex gap-2">
            <Link className="btn-secondary" to="/hardware">
              Retour
            </Link>
            <Link className="btn-primary" to={`/hardware/${hardware.id}/edit`}>
              Éditer
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Médias</h2>

          <div className="h-72 overflow-hidden rounded-lg bg-slate-100">
            {hardware.main_image ? (
              <img
                alt={hardware.name}
                className="h-full w-full object-cover"
                src={getMediaUrl(hardware.main_image)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Aucune image principale</div>
            )}
          </div>

          {hardware.video_path ? (
            <video className="mt-4 w-full rounded-lg bg-black" controls src={getMediaUrl(hardware.video_path)} />
          ) : null}

          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Galerie ({hardware.gallery?.length || 0})</h3>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(hardware.gallery || []).map((image) => (
                <img
                  alt="Image secondaire"
                  className="h-24 w-full rounded-lg object-cover"
                  key={image.id}
                  src={getMediaUrl(image.image_path)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="card grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {details.map((detail) => (
            <div key={detail.label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{detail.label}</p>
              <p className="mt-1 text-sm text-slate-800">{detail.value}</p>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
            <p className="mt-1 text-sm text-slate-800">{hardware.description || '-'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarques</p>
            <p className="mt-1 text-sm text-slate-800">{hardware.notes || '-'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HardwareDetailPage;
