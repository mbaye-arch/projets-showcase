import httpClient from '@/api/httpClient';

const DEFAULT_DASHBOARD_METRICS = {
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

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDashboardMetrics(payload) {
  const source = payload ?? {};
  return {
    totalClients: toNumber(source.totalClients),
    activeClients: toNumber(source.activeClients),
    activeSubscriptions: toNumber(source.activeSubscriptions),
    subscriptionsExpiringSoon: toNumber(source.subscriptionsExpiringSoon),
    openTickets: toNumber(source.openTickets),
    interventionsToday: toNumber(source.interventionsToday),
    interventionsThisMonth: toNumber(source.interventionsThisMonth),
    unpaidInvoices: toNumber(source.unpaidInvoices),
    totalRevenueCollected: toNumber(source.totalRevenueCollected),
    expectedMonthlyRevenue: toNumber(source.expectedMonthlyRevenue)
  };
}

export async function getDashboardMetrics() {
  const response = await httpClient.get('/dashboard');
  return {
    ...DEFAULT_DASHBOARD_METRICS,
    ...normalizeDashboardMetrics(response?.data)
  };
}
