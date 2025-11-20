import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CataloguePreviewDocument from '../components/CataloguePreviewDocument';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { cataloguesService } from '../services/cataloguesService';
import { getApiErrorMessage } from '../services/api';

const CataloguePreviewPage = () => {
  const { id } = useParams();

  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await cataloguesService.preview(id);
        setPreviewData(data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger la prévisualisation'));
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [id]);

  if (loading) return <LoadingState label="Chargement prévisualisation..." />;
  if (error) return <div className="card text-sm text-rose-600">{error}</div>;
  if (!previewData) return <EmptyState title="Prévisualisation indisponible" />;

  return (
    <div>
      <PageHeader
        title={`Prévisualisation: ${previewData.catalogue.nom}`}
        description="Rendu professionnel du catalogue, cohérent avec le PDF exporté."
        action={
          <div className="flex gap-2">
            <Link className="btn-secondary" to={`/catalogues/${id}`}>
              Retour catalogue
            </Link>
            <a
              className="btn-primary"
              href={cataloguesService.getExportPdfUrl(id)}
              rel="noreferrer"
              target="_blank"
            >
              Export PDF
            </a>
          </div>
        }
      />

      <CataloguePreviewDocument data={previewData} />
    </div>
  );
};

export default CataloguePreviewPage;
