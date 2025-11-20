import { useNavigate } from 'react-router-dom';
import { createQuote } from '@/api/quoteApi';
import QuoteForm from '@/features/quotes/QuoteForm';
import { PageHeader } from '@/components/ui';

export default function QuoteCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    const createdQuote = await createQuote(payload);
    navigate(`/quotes/${createdQuote.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau devis"
        subtitle="Creer un devis client avec des lignes detaillees."
        breadcrumbs={[
          { label: 'Devis', to: '/quotes' },
          { label: 'Creation' }
        ]}
      />

      <QuoteForm onSubmit={handleCreate} submitLabel="Creer le devis" cancelPath="/quotes" />
    </div>
  );
}
