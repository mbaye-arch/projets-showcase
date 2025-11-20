const PageHeader = ({ title, description, action }) => (
  <div className="card mb-6 border-brand-100 bg-gradient-to-r from-white/90 via-white to-brand-50/60">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
          SenTechCare Workspace
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  </div>
);

export default PageHeader;
