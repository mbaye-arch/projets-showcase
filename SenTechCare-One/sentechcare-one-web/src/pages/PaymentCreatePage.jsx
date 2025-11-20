import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPayment } from '@/api/paymentApi';
import PaymentForm from '@/features/payments/PaymentForm';
import { PageHeader } from '@/components/ui';

function parsePositiveId(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export default function PaymentCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedInvoiceId = useMemo(
    () => parsePositiveId(searchParams.get('invoiceId')),
    [searchParams]
  );

  const fromInvoice = searchParams.get('fromInvoice') === 'true';
  const cancelPath = fromInvoice && preselectedInvoiceId ? `/invoices/${preselectedInvoiceId}` : '/payments';

  const handleCreate = async (payload) => {
    const createdPayment = await createPayment(payload);

    if (fromInvoice) {
      const targetInvoiceId = createdPayment?.invoiceId ?? payload?.invoiceId ?? preselectedInvoiceId;
      if (targetInvoiceId) {
        navigate(`/invoices/${targetInvoiceId}`);
        return;
      }
    }

    navigate('/payments');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau paiement"
        subtitle="Enregistrer un paiement client et mettre a jour la facture associee."
        breadcrumbs={[
          { label: 'Paiements', to: '/payments' },
          { label: 'Creation' }
        ]}
      />

      <PaymentForm
        onSubmit={handleCreate}
        submitLabel="Enregistrer le paiement"
        cancelPath={cancelPath}
        preselectedInvoiceId={preselectedInvoiceId}
      />
    </div>
  );
}
