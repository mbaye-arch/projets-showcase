import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { suppliersService } from '../services/suppliersService';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

const SupplierDetailPage = () => {
  const { id } = useParams();

  const [supplier, setSupplier] = useState(null);
  const [hardwareItems, setHardwareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const result = await suppliersService.getById(id);
        setSupplier(result.supplier);
        setHardwareItems(result.hardwareItems || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger la fiche fournisseur'));
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <LoadingState label="Chargement de la fiche fournisseur..." />;
  if (error) return <div className="card text-sm text-rose-600">{error}</div>;
  if (!supplier) return <EmptyState title="Fournisseur introuvable" />;

  const details = [
    { label: 'Nom', value: supplier.name },
    { label: 'Pays', value: supplier.country || '-' },
    { label: 'Ville', value: supplier.city || '-' },
    { label: 'Téléphone', value: supplier.phone || '-' },
    { label: 'Email', value: supplier.email || '-' },
    { label: 'Type', value: supplier.supplier_type || '-' },
    { label: 'Plateforme', value: supplier.platform || '-' },
    { label: 'Délai de livraison', value: supplier.delivery_delay || '-' },
    { label: 'Fiabilité', value: supplier.reliability_level || '-' },
    { label: 'Créé le', value: formatDateTime(supplier.created_at) },
    { label: 'Mis à jour le', value: formatDateTime(supplier.updated_at) }
  ];

  return (
    <div>
      <PageHeader
        title={`Fournisseur: ${supplier.name}`}
        description="Fiche fournisseur et matériels associés."
        action={
          <div className="flex gap-2">
            <Link className="btn-secondary" to="/suppliers">
              Retour
            </Link>
            <Link className="btn-primary" to={`/suppliers/${supplier.id}/edit`}>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remarques</p>
          <p className="mt-1 text-sm text-slate-800">{supplier.notes || '-'}</p>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Matériels liés ({hardwareItems.length})</h2>

        {!hardwareItems.length ? (
          <EmptyState
            title="Aucun matériel lié"
            description="Ce fournisseur n'a pas encore de matériel associé."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hardwareItems.map((item) => (
              <div className="card" key={item.id}>
                <div className="mb-3 h-32 overflow-hidden rounded-lg bg-slate-100">
                  {item.main_image ? (
                    <img
                      alt={item.name}
                      className="h-full w-full object-cover"
                      src={getMediaUrl(item.main_image)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      Aucune image
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-500">Réf: {item.reference || '-'}</p>
                <p className="text-xs text-slate-500">Catégorie: {item.category_name || '-'}</p>
                <p className="mt-2 text-sm font-semibold text-brand-700">{formatCurrency(item.sale_price)}</p>

                <Link className="btn-secondary mt-3 w-full" to={`/hardware/${item.id}`}>
                  Voir fiche matériel
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SupplierDetailPage;
