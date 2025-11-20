import httpClient from '@/api/httpClient';
import {
  buildFileDownloadResponse,
  toFileDownloadError
} from '@/api/fileDownloadApi';

const DEFAULT_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: true
};

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        if (typeof value !== 'string') {
          return [key, value];
        }
        return [key, value.trim()];
      })
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

function toSafeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePageResponse(payload, fallbackPage = 0, fallbackSize = 10) {
  if (!payload || typeof payload !== 'object') {
    return {
      ...DEFAULT_PAGE,
      number: fallbackPage,
      size: fallbackSize
    };
  }

  const content = Array.isArray(payload.content) ? payload.content : [];
  const number = Number.isInteger(payload.number)
    ? payload.number
    : toSafeNumber(payload.page, fallbackPage);
  const size = Number.isInteger(payload.size) ? payload.size : fallbackSize;
  const totalElements = toSafeNumber(payload.totalElements, content.length);
  const totalPages = Number.isInteger(payload.totalPages)
    ? payload.totalPages
    : size > 0
      ? Math.ceil(totalElements / size)
      : 0;

  return {
    ...DEFAULT_PAGE,
    ...payload,
    content,
    number,
    size,
    totalElements,
    totalPages
  };
}

async function getPage(endpoint, params = {}) {
  const normalizedParams = cleanParams(params);
  const fallbackPage = toSafeNumber(normalizedParams.page, 0);
  const fallbackSize = toSafeNumber(normalizedParams.size, 10);

  const response = await httpClient.get(endpoint, {
    params: normalizedParams
  });

  return normalizePageResponse(response.data, fallbackPage, fallbackSize);
}

export async function getPayments(params = {}) {
  return getPage('/payments', params);
}

export async function getPaymentById(paymentId) {
  const response = await httpClient.get(`/payments/${paymentId}`);
  return response.data;
}

export async function createPayment(payload) {
  const response = await httpClient.post('/payments', payload);
  return response.data;
}

export async function updatePayment(paymentId, payload) {
  const response = await httpClient.put(`/payments/${paymentId}`, payload);
  return response.data;
}

export async function deletePayment(paymentId) {
  await httpClient.delete(`/payments/${paymentId}`);
}

export async function downloadPaymentReceiptPdf(paymentId) {
  try {
    const response = await httpClient.get(`/payments/${paymentId}/receipt/pdf`, {
      responseType: 'blob'
    });

    return buildFileDownloadResponse(response, `recu-paiement-${paymentId}.pdf`);
  } catch (error) {
    throw await toFileDownloadError(error, 'Impossible de telecharger le recu de paiement.');
  }
}
