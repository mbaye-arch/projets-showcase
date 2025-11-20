import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDashboardMetrics } from '@/api/dashboardApi';
import KpiCard from '@/components/dashboard/KpiCard';
import { Badge, Button, Card, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

const INITIAL_METRICS = {
  totalClients: 0,
  activeClients: 0,
  activeSubscriptions: 0,
  subscriptionsExpiringSoon: 0,
  openTickets: 0,
  interventionsToday: 0,
  interventionsThisMonth: 0,
  unpaidInvoices: 0,
  totalRevenueCollected: 0,
  expectedMonthlyRevenue: 0
};

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

function formatInteger(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function hasDashboardData(metrics) {
  if (!metrics) {
    return false;
  }

  const values = Object.values(metrics).map((value) => Number(value) || 0);
  return values.some((value) => value > 0);
}

function formatLastUpdate(dateValue) {
  if (!dateValue) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(dateValue);
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchDashboard = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const response = await getDashboardMetrics();
        setMetrics({ ...response });
        setLastUpdate(new Date());
      } catch (error) {
        setErrorMessage(parseErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [setMetrics]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const kpiCards = useMemo(
    () => [
      {
        key: 'totalClients',
        label: 'Total clients',
        value: formatInteger(metrics.totalClients),
        description: 'Nombre total de clients enregistres',
        tone: 'info'
      },
      {
        key: 'activeSubscriptions',
        label: 'Abonnements actifs',
        value: formatInteger(metrics.activeSubscriptions),
        description: 'Contrats actifs actuellement',
        tone: 'success'
      },
      {
        key: 'subscriptionsExpiringSoon',
        label: 'Abonnements expirant bientot',
        value: formatInteger(metrics.subscriptionsExpiringSoon),
        description: 'Contrats a renouveler prochainement',
        tone: 'warning'
      },
      {
        key: 'openTickets',
        label: 'Tickets ouverts',
        value: formatInteger(metrics.openTickets),
        description: 'Demandes en attente de resolution',
        tone: 'danger'
      },
      {
        key: 'interventionsToday',
        label: "Interventions d'aujourd'hui",
        value: formatInteger(metrics.interventionsToday),
        description: 'Operations techniques planifiees ou executees ce jour',
        tone: 'info'
      },
      {
        key: 'interventionsThisMonth',
        label: 'Interventions du mois',
        value: formatInteger(metrics.interventionsThisMonth),
        description: 'Volume global des interventions mensuelles',
        tone: 'neutral'
      },
      {
        key: 'unpaidInvoices',
        label: 'Factures impayees',
        value: formatInteger(metrics.unpaidInvoices),
        description: 'Factures restant a encaisser',
        tone: 'warning'
      },
      {
        key: 'totalRevenueCollected',
        label: 'Revenus encaisses',
        value: formatAmount(metrics.totalRevenueCollected),
        description: 'Montant cumule deja encaisse',
        tone: 'success'
      },
      {
        key: 'expectedMonthlyRevenue',
        label: 'Revenu mensuel attendu',
        value: formatAmount(metrics.expectedMonthlyRevenue),
        description: 'Projection des revenus attendus ce mois',
        tone: 'info'
      }
    ],
    [metrics]
  );

  const hasData = useMemo(() => hasDashboardData(metrics), [metrics]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Vue globale des indicateurs metier de SenTechCare One."
        actions={
          <Button
            variant="outline"
            onClick={() => fetchDashboard(true)}
            loading={isRefreshing}
            disabled={isLoading}
          >
            Actualiser
          </Button>
        }
      />

      <Card
        title="Etat global"
        subtitle="Indicateurs clients, support, interventions et finance."
        actions={
          <Badge variant={errorMessage ? 'danger' : 'success'}>
            {errorMessage ? 'Donnees partielles' : 'Synchronise'}
          </Badge>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-600">
            Derniere mise a jour: <span className="font-medium text-slate-800">{formatLastUpdate(lastUpdate)}</span>
          </span>
          <span className="text-xs text-slate-400">Source: API /api/dashboard</span>
        </div>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : errorMessage ? (
          <EmptyState
            title="Chargement impossible"
            description={errorMessage}
            action={
              <Button type="button" onClick={() => fetchDashboard(true)}>
                Reessayer
              </Button>
            }
          />
        ) : !hasData ? (
          <EmptyState
            title="Aucune donnée disponible"
            description="Le dashboard est prêt, mais aucune donnée métier exploitable n'a encore été enregistrée."
            action={
              <Button type="button" onClick={() => fetchDashboard(true)}>
                Actualiser
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {kpiCards.map((item) => (
              <KpiCard
                key={item.key}
                label={item.label}
                value={item.value}
                description={item.description}
                tone={item.tone}
              />
            ))}
          </div>
        )}
      </Card>

      {!isLoading && !errorMessage && hasData ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card title="Relation client" padding="sm">
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                Clients actifs: <span className="font-semibold text-slate-900">{formatInteger(metrics.activeClients)}</span>
              </p>
              <p>
                Tickets ouverts: <span className="font-semibold text-slate-900">{formatInteger(metrics.openTickets)}</span>
              </p>
              <p>
                Abonnements actifs:{' '}
                <span className="font-semibold text-slate-900">{formatInteger(metrics.activeSubscriptions)}</span>
              </p>
            </div>
          </Card>

          <Card title="Operations techniques" padding="sm">
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                Interventions du jour:{' '}
                <span className="font-semibold text-slate-900">{formatInteger(metrics.interventionsToday)}</span>
              </p>
              <p>
                Interventions du mois:{' '}
                <span className="font-semibold text-slate-900">{formatInteger(metrics.interventionsThisMonth)}</span>
              </p>
              <p>
                Renouvellements proches:{' '}
                <span className="font-semibold text-slate-900">{formatInteger(metrics.subscriptionsExpiringSoon)}</span>
              </p>
            </div>
          </Card>

          <Card title="Synthese financiere" padding="sm">
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                Revenus encaisses: <span className="font-semibold text-slate-900">{formatAmount(metrics.totalRevenueCollected)}</span>
              </p>
              <p>
                Revenu mensuel attendu:{' '}
                <span className="font-semibold text-slate-900">{formatAmount(metrics.expectedMonthlyRevenue)}</span>
              </p>
              <p>
                Factures impayees: <span className="font-semibold text-slate-900">{formatInteger(metrics.unpaidInvoices)}</span>
              </p>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
