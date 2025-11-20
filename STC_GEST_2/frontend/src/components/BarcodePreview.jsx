function BarcodePreview({ svg }) {
  if (!svg) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

export default BarcodePreview;
