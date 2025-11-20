const EmptyState = ({ title = 'Aucune donnée', description = 'Aucun résultat pour le moment.' }) => (
  <div className="card border-dashed border-slate-300 text-center">
    <h3 className="font-display text-lg font-semibold text-slate-800">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </div>
);

export default EmptyState;
