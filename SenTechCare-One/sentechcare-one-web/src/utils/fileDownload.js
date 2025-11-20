export function downloadBlob(blob, filename) {
  if (!(blob instanceof Blob)) {
    throw new Error('Le fichier recu est invalide.');
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename || 'telechargement.pdf';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
