function QrCodePreview({ dataUrl }) {
  if (!dataUrl) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <img alt="QR Code" className="mx-auto h-40 w-40" src={dataUrl} />
    </div>
  );
}

export default QrCodePreview;
