import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  deleteClient,
  getClientById,
  getClientEquipments,
  getClientInterventions,
  getClientInvoices,
  getClientPayments,
  getClientQuotes,
  getClientSubscriptions,
  getClientTickets
} from '@/api/clientApi';
import {
  getClientDisplayName,
  getClientTypeLabel
} from '@/features/clients/clientConstants';
import {
  getBillingFrequencyLabel,
  getSubscriptionStatusLabel
} from '@/features/subscriptions/subscriptionConstants';
import {
  getEquipmentCategoryBadgeVariant,
  getEquipmentCategoryLabel,
  getEquipmentSourceLabel,
  getEquipmentStatusBadgeVariant,
  getEquipmentStatusLabel
} from '@/features/equipments/equipmentConstants';
import { Badge, Button, Card, EmptyState, LoadingSpinner, PageHeader, Pagination, Table } from '@/components/ui';
import { cn } from '@/lib/cn';
import { extractApiErrorMessage } from '@/utils/apiError';
import { formatApiDate, formatApiDateTime } from '@/utils/date';

const DEFAULT_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0
};

const RELATED_PAGE_SIZE = 10;

const TAB_KEYS = [
  'informations',
  'subscriptions',
  'equipments',
  'interventions',
  'tickets',
  'quotes',
  'invoices',
  'payments'
];

const TAB_LABELS = {
  informations: 'Informations',
  subscriptions: 'Abonnements',
  equipments: 'Materiels',
  interventions: 'Interventions',
  tickets: 'Tickets',
  quotes: 'Devis',
  invoices: 'Factures',
  payments: 'Paiements'
};

const TAB_DEFAULT_SORT = {
  subscriptions: 'startDate,desc',
  equipments: 'installationDate,desc',
  interventions: 'plannedDate,desc',
  tickets: 'createdAt,desc',
  quotes: 'quoteDate,desc',
  invoices: 'issueDate,desc',
  payments: 'paymentDate,desc'
};

const TAB_FETCHERS = {
  subscriptions: getClientSubscriptions,
  equipments: getClientEquipments,
  interventions: getClientInterventions,
  tickets: getClientTickets,
  quotes: getClientQuotes,
  invoices: getClientInvoices,
  payments: getClientPayments
};

function buildInitialRelatedState() {
  return TAB_KEYS.reduce((acc, key) => {
    if (key !== 'informations') {
      acc[key] = {
        loaded: false,
        isLoading: false,
        error: null,
        page: {
          ...DEFAULT_PAGE,
          size: RELATED_PAGE_SIZE
        }
      };
    }
    return acc;
  }, {});
}

function getDefaultSort(tabKey) {
  return TAB_DEFAULT_SORT[tabKey] ?? 'createdAt,desc';
}

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function getStatusBadgeVariant(status) {
  if (!status) {
    return 'neutral';
  }

  const statusValue = String(status).toUpperCase();
  if (['ACTIVE', 'RESOLVED', 'COMPLETED', 'PAID', 'ACCEPTED', 'ISSUED', 'CLOSED'].includes(statusValue)) {
    return 'success';
  }
  if (['PENDING', 'IN_PROGRESS', 'SCHEDULED', 'PARTIALLY_PAID', 'SENT'].includes(statusValue)) {
    return 'info';
  }
  if (['CANCELLED', 'REJECTED', 'EXPIRED', 'UNPAID', 'BROKEN'].includes(statusValue)) {
    return 'danger';
  }
  return 'warning';
}

function getRelatedColumns(tabKey) {
  if (tabKey === 'subscriptions') {
    return [
      { key: 'planType', header: 'Plan' },
      {
        key: 'status',
        header: 'Statut',
        render: (value) => (
          <Badge variant={getStatusBadgeVariant(value)}>
            {getSubscriptionStatusLabel(value)}
          </Badge>
        )
      },
      { key: 'billingFrequency', header: 'Facturation', render: (value) => getBillingFrequencyLabel(value) },
      { key: 'startDate', header: 'Debut', render: (value) => formatApiDate(value) },
      { key: 'endDate', header: 'Fin', render: (value) => formatApiDate(value) },
      { key: 'monthlyPrice', header: 'Mensualite', render: (value) => formatAmount(value) }
    ];
  }

  if (tabKey === 'equipments') {
    return [
      {
        key: 'category',
        header: 'Categorie',
        render: (value) => (
          <Badge variant={getEquipmentCategoryBadgeVariant(value)}>
            {getEquipmentCategoryLabel(value)}
          </Badge>
        )
      },
      { key: 'brand', header: 'Marque' },
      { key: 'model', header: 'Modele' },
      { key: 'serialNumber', header: 'Numero de serie', render: (value) => value || '-' },
      { key: 'installationDate', header: 'Installation', render: (value) => formatApiDate(value) },
      { key: 'source', header: 'Source', render: (value) => getEquipmentSourceLabel(value) },
      { key: 'warrantyStartDate', header: 'Garantie debut', render: (value) => formatApiDate(value) },
      { key: 'warrantyEndDate', header: 'Garantie fin', render: (value) => formatApiDate(value) },
      {
        key: 'status',
        header: 'Statut',
        render: (value) => (
          <Badge variant={getEquipmentStatusBadgeVariant(value)}>
            {getEquipmentStatusLabel(value)}
          </Badge>
        )
      }
    ];
  }

  if (tabKey === 'interventions') {
    return [
      { key: 'type', header: 'Type' },
      { key: 'status', header: 'Statut', render: (value) => <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge> },
      { key: 'priority', header: 'Priorite' },
      { key: 'plannedDate', header: 'Planifiee', render: (value) => formatApiDateTime(value) },
      { key: 'cost', header: 'Cout', render: (value) => formatAmount(value) }
    ];
  }

  if (tabKey === 'tickets') {
    return [
      { key: 'subject', header: 'Sujet' },
      { key: 'channel', header: 'Canal' },
      { key: 'status', header: 'Statut', render: (value) => <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge> },
      { key: 'priority', header: 'Priorite' },
      { key: 'createdAt', header: 'Cree le', render: (value) => formatApiDateTime(value) }
    ];
  }

  if (tabKey === 'quotes') {
    return [
      { key: 'reference', header: 'Reference' },
      { key: 'quoteDate', header: 'Date', render: (value) => formatApiDate(value) },
      { key: 'status', header: 'Statut', render: (value) => <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge> },
      { key: 'totalAmount', header: 'Montant', render: (value) => formatAmount(value) }
    ];
  }

  if (tabKey === 'invoices') {
    return [
      { key: 'reference', header: 'Reference' },
      { key: 'issueDate', header: "Date d'emission", render: (value) => formatApiDate(value) },
      { key: 'status', header: 'Statut', render: (value) => <Badge variant={getStatusBadgeVariant(value)}>{value}</Badge> },
      { key: 'remainingAmount', header: 'Reste a payer', render: (value) => formatAmount(value) }
    ];
  }

  if (tabKey === 'payments') {
    return [
      { key: 'paymentDate', header: 'Date', render: (value) => formatApiDate(value) },
      { key: 'method', header: 'Methode' },
      { key: 'amount', header: 'Montant', render: (value) => formatAmount(value) },
      { key: 'paymentReference', header: 'Reference', render: (value) => value || '-' },
      { key: 'invoiceId', header: 'Facture', render: (value) => (value ? `#${value}` : '-') }
    ];
  }

  return [];
}

export default function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [isClientLoading, setIsClientLoading] = useState(true);
  const [clientError, setClientError] = useState(null);
  const [activeTab, setActiveTab] = useState('informations');
  const [related, setRelated] = useState(buildInitialRelatedState);
  const relatedRef = useRef(related);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClient = useCallback(async () => {
    setIsClientLoading(true);
    setClientError(null);

    try {
      const response = await getClientById(id);
      setClient(response);
    } catch (error) {
      setClientError(parseErrorMessage(error));
    } finally {
      setIsClientLoading(false);
    }
  }, [id]);

  const fetchTabData = useCallback(
    async (tabKey, options = {}) => {
      if (!TAB_FETCHERS[tabKey]) {
        return;
      }

      const force = Boolean(options.force);
      const currentTabState = relatedRef.current[tabKey];
      const requestedPage = Number.isInteger(options.page)
        ? Math.max(options.page, 0)
        : (currentTabState?.page?.number ?? 0);
      const alreadyLoadedRequestedPage =
        currentTabState?.loaded && (currentTabState?.page?.number ?? 0) === requestedPage;

      if (currentTabState?.isLoading) {
        return;
      }

      if (!force && alreadyLoadedRequestedPage) {
        return;
      }

      setRelated((prev) => {
        const tabState = prev[tabKey];
        return {
          ...prev,
          [tabKey]: {
            ...tabState,
            isLoading: true,
            error: null,
            page: {
              ...DEFAULT_PAGE,
              ...(tabState?.page ?? {}),
              number: requestedPage,
              size: RELATED_PAGE_SIZE
            }
          }
        };
      });

      try {
        const response = await TAB_FETCHERS[tabKey](id, {
          page: requestedPage,
          size: RELATED_PAGE_SIZE,
          sort: getDefaultSort(tabKey)
        });

        setRelated((prev) => ({
          ...prev,
          [tabKey]: {
            loaded: true,
            isLoading: false,
            error: null,
            page: {
              ...DEFAULT_PAGE,
              ...response,
              number: Number.isInteger(response?.number) ? response.number : requestedPage,
              size: Number.isInteger(response?.size) ? response.size : RELATED_PAGE_SIZE
            }
          }
        }));
      } catch (error) {
        setRelated((prev) => ({
          ...prev,
          [tabKey]: {
            ...prev[tabKey],
            isLoading: false,
            error: parseErrorMessage(error)
          }
        }));
      }
    },
    [id]
  );

  useEffect(() => {
    relatedRef.current = related;
  }, [related]);

  useEffect(() => {
    setRelated(buildInitialRelatedState());
    setActiveTab('informations');
    fetchClient();
  }, [fetchClient, id]);

  useEffect(() => {
    if (activeTab !== 'informations') {
      fetchTabData(activeTab);
    }
  }, [activeTab, fetchTabData]);

  const handleDelete = async () => {
    if (!client?.id) {
      return;
    }

    const confirmed = window.confirm(`Confirmer la suppression du client "${getClientDisplayName(client)}" ?`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteClient(client.id);
      navigate('/clients', { replace: true });
    } catch (error) {
      setDeleteError(parseErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const relatedColumns = useMemo(() => getRelatedColumns(activeTab), [activeTab]);

  if (isClientLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (clientError) {
    return (
      <EmptyState
        title="Impossible de charger ce client"
        description={clientError}
        action={
          <Button type="button" onClick={fetchClient}>
            Reessayer
          </Button>
        }
      />
    );
  }

  const activeTabState = activeTab === 'informations' ? null : related[activeTab];

  return (
    <div className="space-y-6">
      <PageHeader
        title={getClientDisplayName(client)}
        subtitle={`Client ${client?.active ? 'actif' : 'inactif'} - ${getClientTypeLabel(client?.clientType)}`}
        breadcrumbs={[
          { label: 'Clients', to: '/clients' },
          { label: 'Detail client' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/clients/${client.id}/edit`}>
              <Button variant="outline">Modifier</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
              Supprimer
            </Button>
          </div>
        }
      />

      {deleteError ? (
        <Card padding="sm">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {deleteError}
          </p>
        </Card>
      ) : null}

      <Card padding="none">
        <div className="overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max items-center gap-1 px-2 py-2">
            {TAB_KEYS.map((tabKey) => {
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {TAB_LABELS[tabKey]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-5">
          {activeTab === 'informations' ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Card title="Identite" padding="sm">
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Type:</span> {getClientTypeLabel(client.clientType)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Societe:</span> {client.companyName || '-'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Prenom:</span> {client.firstName || '-'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Nom:</span> {client.lastName || '-'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Contact principal:</span>{' '}
                    {client.contactPerson || '-'}
                  </p>
                </div>
              </Card>

              <Card title="Coordonnees" padding="sm">
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Telephone:</span> {client.phone || '-'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">E-mail:</span> {client.email || '-'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Adresse:</span> {client.address || '-'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Ville:</span> {client.city || '-'}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Pays:</span> {client.country || '-'}
                  </p>
                </div>
              </Card>

              <Card title="Suivi" padding="sm">
                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-900">Creation:</span> {formatApiDateTime(client.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Derniere mise a jour:</span>{' '}
                    {formatApiDateTime(client.updatedAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Statut:</span>{' '}
                    <Badge variant={client.active ? 'success' : 'warning'}>
                      {client.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </p>
                </div>
              </Card>

              <Card title="Notes" padding="sm">
                <p className="text-sm text-slate-700">{client.notes || 'Aucune note disponible.'}</p>
              </Card>
            </div>
          ) : activeTabState?.error ? (
            <EmptyState
              title={`Impossible de charger ${TAB_LABELS[activeTab].toLowerCase()}`}
              description={activeTabState.error}
              action={
                <Button type="button" onClick={() => fetchTabData(activeTab, { force: true })}>
                  Reessayer
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">
                  {activeTabState?.page?.totalElements ?? 0} element(s) affiche(s)
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchTabData(activeTab, { force: true })}
                  loading={activeTabState?.isLoading}
                >
                  Actualiser
                </Button>
              </div>

              <Table
                columns={relatedColumns}
                data={activeTabState?.page?.content ?? []}
                isLoading={activeTabState?.isLoading}
                emptyTitle={`Aucun element dans ${TAB_LABELS[activeTab].toLowerCase()}`}
                emptyDescription="Aucune donnee liee a ce client pour cet onglet."
              />

              <Pagination
                page={activeTabState?.page?.number ?? 0}
                totalPages={activeTabState?.page?.totalPages ?? 0}
                totalElements={activeTabState?.page?.totalElements ?? 0}
                pageSize={activeTabState?.page?.size ?? RELATED_PAGE_SIZE}
                onPageChange={(nextPage) => fetchTabData(activeTab, { page: nextPage })}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
