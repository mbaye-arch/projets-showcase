import { extractApiErrorMessage } from '@/utils/apiError';

function normalizeFilename(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') {
    return null;
  }

  const cleaned = rawValue
    .trim()
    .replace(/^UTF-8''/i, '')
    .replace(/^"(.*)"$/, '$1');

  if (!cleaned) {
    return null;
  }

  try {
    return decodeURIComponent(cleaned);
  } catch {
    return cleaned;
  }
}

export function extractFilename(contentDisposition) {
  if (!contentDisposition || typeof contentDisposition !== 'string') {
    return null;
  }

  const filenameStarMatch = contentDisposition.match(/filename\*=([^;]+)/i);
  const fromFilenameStar = normalizeFilename(filenameStarMatch?.[1]);
  if (fromFilenameStar) {
    return fromFilenameStar;
  }

  const filenameMatch = contentDisposition.match(/filename=([^;]+)/i);
  return normalizeFilename(filenameMatch?.[1]);
}

export function buildFileDownloadResponse(response, fallbackFilename) {
  return {
    blob: response?.data,
    filename: extractFilename(response?.headers?.['content-disposition']) || fallbackFilename
  };
}

async function parseBlobErrorPayload(blobPayload) {
  if (!(blobPayload instanceof Blob)) {
    return null;
  }

  try {
    const text = await blobPayload.text();
    if (!text) {
      return null;
    }

    try {
      const parsed = JSON.parse(text);
      return parsed?.message || parsed?.error || text;
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

export async function extractHttpErrorMessage(error, fallbackMessage) {
  const blobPayloadMessage = await parseBlobErrorPayload(error?.response?.data);
  if (blobPayloadMessage) {
    return blobPayloadMessage;
  }

  return extractApiErrorMessage(error, fallbackMessage);
}

export async function toFileDownloadError(error, fallbackMessage) {
  const message = await extractHttpErrorMessage(error, fallbackMessage);
  const normalizedError = new Error(message);
  normalizedError.status = error?.response?.status;
  return normalizedError;
}
