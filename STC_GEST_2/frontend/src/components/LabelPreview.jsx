function LabelPreview({ html }) {
  if (!html) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
      <iframe
        className="h-64 w-full rounded-xl border border-slate-200 bg-white"
        srcDoc={html}
        title="Aperçu étiquette"
      />
    </div>
  );
}

export default LabelPreview;
