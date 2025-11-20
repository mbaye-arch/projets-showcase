import { formatCurrency } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

const CataloguePreviewDocument = ({ data }) => {
  if (!data) return null;

  const { catalogue, sections } = data;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <section className="relative min-h-[260px] overflow-hidden border-b border-slate-200">
        {catalogue.image_couverture ? (
          <img
            alt="Couverture"
            className="absolute inset-0 h-full w-full object-cover"
            src={getMediaUrl(catalogue.image_couverture)}
          />
        ) : null}

        <div className="relative min-h-[260px] bg-gradient-to-r from-slate-900/85 to-brand-700/75 p-8 text-white">
          <div className="max-w-3xl">
            {catalogue.logo ? (
              <img
                alt="Logo catalogue"
                className="mb-5 h-20 w-20 rounded-lg border border-white/40 object-cover"
                src={getMediaUrl(catalogue.logo)}
              />
            ) : null}

            <h1 className="text-3xl font-bold leading-tight">{catalogue.titre || catalogue.nom}</h1>
            {catalogue.sous_titre ? <p className="mt-2 text-base text-white/90">{catalogue.sous_titre}</p> : null}
            <p className="mt-4 text-sm uppercase tracking-wider text-white/80">
              Type client: {catalogue.type_client_nom || '-'}
            </p>
            {catalogue.afficher_prix ? (
              <div className="mt-4 inline-flex rounded-xl border border-white/35 bg-white/15 px-4 py-2">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/80">Total catalogue</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(data.totals?.total_visible)}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-8 p-6">
        {catalogue.description ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {catalogue.description}
          </div>
        ) : null}

        {catalogue.afficher_prix ? (
          <div className="grid gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Total visible</p>
              <p className="text-lg font-bold text-brand-700">{formatCurrency(data.totals?.total_visible)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Matériels</p>
              <p className="text-base font-semibold text-slate-800">
                {formatCurrency(data.totals?.hardware_visible)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Logiciels</p>
              <p className="text-base font-semibold text-slate-800">
                {formatCurrency(data.totals?.software_visible)}
              </p>
            </div>
          </div>
        ) : null}

        {sections
          ?.filter((section) => section.items?.length)
          .map((section) => (
            <div key={section.id ?? section.nom}>
              <h2 className="mb-4 text-2xl font-semibold text-slate-900">{section.nom}</h2>
              {section.description ? <p className="mb-4 text-sm text-slate-600">{section.description}</p> : null}

              <div className="grid gap-4 md:grid-cols-2">
                {section.items.map((item) => (
                  <article
                    className={`rounded-xl border p-4 ${
                      item.mise_en_avant ? 'border-brand-300 bg-brand-50/50' : 'border-slate-200 bg-white'
                    }`}
                    key={item.id}
                  >
                    <div className="flex gap-3">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {item.display.image ? (
                          <img
                            alt={item.display.title}
                            className="h-full w-full object-cover"
                            src={getMediaUrl(item.display.image)}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-400">
                            Sans image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-slate-900">{item.display.title}</h3>

                        {catalogue.afficher_references && item.display.reference ? (
                          <p className="mt-1 text-xs text-slate-500">Réf: {item.display.reference}</p>
                        ) : null}

                        <p className="mt-2 text-sm text-slate-600">{item.display.description}</p>

                        {catalogue.afficher_caracteristiques && item.display.characteristics ? (
                          <p className="mt-2 text-xs text-slate-500">{item.display.characteristics}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">{item.display.type_label}</p>

                      {catalogue.afficher_prix ? (
                        <div className="text-right">
                          <p className="text-base font-bold text-brand-700">
                            {formatCurrency(item.display.final_price)}
                          </p>
                          {item.remise ? (
                            <p className="text-xs text-orange-700">Remise {Number(item.remise).toFixed(2)}%</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {item.note_commerciale ? (
                      <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        {item.note_commerciale}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ))}

        {catalogue.message_final ? (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-brand-700">Message final</h3>
            <p className="text-sm text-slate-700">{catalogue.message_final}</p>
          </div>
        ) : null}

        {catalogue.pied_de_page ? (
          <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
            {catalogue.pied_de_page}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default CataloguePreviewDocument;
