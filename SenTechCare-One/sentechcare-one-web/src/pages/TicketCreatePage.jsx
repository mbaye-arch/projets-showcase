import { useNavigate } from 'react-router-dom';
import { createTicket } from '@/api/ticketApi';
import TicketForm from '@/features/tickets/TicketForm';
import { PageHeader } from '@/components/ui';

export default function TicketCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    const createdTicket = await createTicket(payload);
    navigate(`/tickets/${createdTicket.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau ticket"
        subtitle="Creer une demande de support client."
        breadcrumbs={[
          { label: 'Tickets', to: '/tickets' },
          { label: 'Creation' }
        ]}
      />

      <TicketForm onSubmit={handleCreate} submitLabel="Creer le ticket" cancelPath="/tickets" />
    </div>
  );
}
