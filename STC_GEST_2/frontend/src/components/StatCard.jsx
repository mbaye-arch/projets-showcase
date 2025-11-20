function StatCard({ title, value, subtitle, tone = 'accent' }) {
  const toneClass = {
    accent: 'from-teal-500/10 to-teal-200/20 text-teal-800',
    sunrise: 'from-amber-500/10 to-amber-200/30 text-amber-800',
    danger: 'from-red-500/10 to-red-200/30 text-red-800'
  };

  return (
    <div className={`card bg-gradient-to-br ${toneClass[tone] || toneClass.accent}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

export default StatCard;
