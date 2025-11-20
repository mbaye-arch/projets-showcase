const StatCard = ({ title, value, hint }) => (
  <div className="card relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-white to-brand-50/70">
    <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-200/40 blur-xl" />
    <p className="text-sm font-semibold text-slate-600">{title}</p>
    <p className="mt-2 font-display text-3xl font-bold text-slate-900">{value}</p>
    {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
  </div>
);

export default StatCard;
