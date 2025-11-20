function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p className="font-display text-xl font-bold text-ink">{title}</p>
      <p className="max-w-xl text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
