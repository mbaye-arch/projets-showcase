import { useNavigate } from 'react-router-dom';
import { createInvoice } from '@/api/invoiceApi';
import InvoiceForm from '@/features/invoices/InvoiceForm';
import { PageHeader } from '@/components/ui';

export default function InvoiceCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    const createdInvoice = await createInvoice(payload);
    navigate(`/invoices/${createdInvoice.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle facture"
        subtitle="Creer une facture client avec lignes detaillees."
        breadcrumbs={[
          { label: 'Factures', to: '/invoices' },
          { label: 'Creation' }
        ]}
      />

      <InvoiceForm onSubmit={handleCreate} submitLabel="Creer la facture" cancelPath="/invoices" />
    </div>
  );
}
