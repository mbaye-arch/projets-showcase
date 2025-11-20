import dayjs from 'dayjs';

const CURRENCY_ALIASES = {
  FCFA: 'XOF',
  CFA: 'XOF',
  XOF: 'XOF'
};

function normalizeCurrencyCode(code) {
  if (!code) return 'XOF';
  const normalized = String(code).trim().toUpperCase();
  return CURRENCY_ALIASES[normalized] || normalized;
}

export function formatDate(value) {
  if (!value) return '-';
  return dayjs(value).format('DD/MM/YYYY HH:mm');
}

export function formatSimpleDate(value) {
  if (!value) return '-';
  return dayjs(value).format('DD/MM/YYYY');
}

export function formatCurrency(value, currencyCode = 'XOF') {
  const amount = Number(value || 0);
  const safeCurrency = normalizeCurrencyCode(currencyCode);

  try {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;
  }
}

export function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR').format(Number(value || 0));
}
