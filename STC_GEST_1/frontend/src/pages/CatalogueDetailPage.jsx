import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { cataloguesService } from '../services/cataloguesService';
import { getApiErrorMessage } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

const CatalogueDetailPage = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newSection, setNewSection] = useState({ nom: '', description: '' });
  const [sectionEdits, setSectionEdits] = useState({});
  const [itemEdits, setItemEdits] = useState({});

  const fetchCatalogue = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await cataloguesService.getById(id);
      setData(result);

      const nextSectionEdits = {};
      const nextItemEdits = {};

      result.sections.forEach((section) => {
        if (section.id) {
          nextSectionEdits[section.id] = {
            nom: section.nom || '',
            description: section.description || '',
            ordre: section.ordre || 1
          };
        }

        (section.items || []).forEach((item) => {
          nextItemEdits[item.id] = {
            section_id: item.section_id || '',
            ordre: item.ordre ?? 1,
            titre_personnalise: item.titre_personnalise || '',
            description_personnalisee: item.description_personnalisee || '',
            prix_personnalise: item.prix_personnalise ?? '',
            remise: item.remise ?? '',
            note_commerciale: item.note_commerciale || '',
            visible: Boolean(item.visible),
            mise_en_avant: Boolean(item.mise_en_avant),
            clear_image_specifique: false,
            file: null
          };
        });
      });

      setSectionEdits(nextSectionEdits);
      setItemEdits(nextItemEdits);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger le catalogue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogue();
  }, [id]);

  const sectionsWithoutVirtual = useMemo(
    () => (data?.sections || []).filter((section) => section.id),
    [data]
  );

  const handleCreateSection = async (event) => {
    event.preventDefault();

    try {
      await cataloguesService.createSection(id, newSection);
      setNewSection({ nom: '', description: '' });
      fetchCatalogue();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Création section impossible'));
    }
  };

  const handleSaveSection = async (sectionId) => {
    try {
      await cataloguesService.updateSection(id, sectionId, sectionEdits[sectionId]);
      fetchCatalogue();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Mise à jour section impossible'));
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Supprimer cette section ? Les produits resteront dans le catalogue sans section.')) {
      return;
    }

    try {
      await cataloguesService.deleteSection(id, sectionId);
      fetchCatalogue();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression section impossible'));
    }
  };

  const handleSaveItem = async (itemId) => {
    const edit = itemEdits[itemId];
    if (!edit) return;

    const formData = new FormData();
    formData.append('section_id', edit.section_id);
    formData.append('ordre', edit.ordre);
    formData.append('titre_personnalise', edit.titre_personnalise);
    formData.append('description_personnalisee', edit.description_personnalisee);
    formData.append('prix_personnalise', edit.prix_personnalise);
    formData.append('remise', edit.remise);
    formData.append('note_commerciale', edit.note_commerciale);
    formData.append('visible', edit.visible ? '1' : '0');
    formData.append('mise_en_avant', edit.mise_en_avant ? '1' : '0');

    if (edit.clear_image_specifique) {
      formData.append('clear_image_specifique', 'true');
    }

    if (edit.file) {
      formData.append('image_specifique', edit.file);
    }

    try {
      await cataloguesService.updateItem(id, itemId, formData, true);
      fetchCatalogue();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Mise à jour item impossible'));
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Retirer ce produit du catalogue ?')) return;

    try {
      await cataloguesService.deleteItem(id, itemId);
      fetchCatalogue();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression item impossible'));
    }
  };

  if (loading) return <LoadingState label="Chargement catalogue..." />;
  if (error) return <div className="card text-sm text-rose-600">{error}</div>;
  if (!data) return <EmptyState title="Catalogue introuvable" />;

  const { catalogue, sections } = data;

  return (
    <div>
      <PageHeader
        title={`Catalogue: ${catalogue.nom}`}
        description="Organisation des sections et personnalisation des produits du catalogue."
        action={
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" to="/catalogues">
              Retour
            </Link>
            <Link className="btn-secondary" to={`/catalogues/${id}/edit`}>
              Éditer
            </Link>
            <Link className="btn-secondary" to={`/catalogues/${id}/products`}>
              Ajouter produits
            </Link>
            <Link className="btn-secondary" to={`/catalogues/${id}/preview`}>
              Prévisualiser
            </Link>
            <a
              className="btn-primary"
              href={cataloguesService.getExportPdfUrl(id)}
              rel="noreferrer"
              target="_blank"
            >
              Export PDF
            </a>
          </div>
        }
      />

      <section className="card mb-6 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Titre</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{catalogue.titre}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Type client</p>
          <p className="mt-1 text-sm text-slate-700">{catalogue.type_client_nom || '-'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Statut</p>
          <p className="mt-1 text-sm capitalize text-slate-700">{catalogue.statut}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Mise à jour</p>
          <p className="mt-1 text-sm text-slate-700">{formatDateTime(catalogue.updated_at)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Sections</p>
          <p className="mt-1 text-sm text-slate-700">{data.section_count}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Produits</p>
          <p className="mt-1 text-sm text-slate-700">{data.items_count}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total catalogue visible</p>
          <p className="mt-1 text-base font-bold text-brand-700">
            {formatCurrency(data.totals?.total_visible)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total matériels visibles</p>
          <p className="mt-1 text-sm text-slate-700">{formatCurrency(data.totals?.hardware_visible)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total logiciels visibles</p>
          <p className="mt-1 text-sm text-slate-700">{formatCurrency(data.totals?.software_visible)}</p>
        </div>
      </section>

      <section className="card mb-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Sections</h2>

        <form className="mb-4 grid gap-3 md:grid-cols-3" onSubmit={handleCreateSection}>
          <input
            className="input"
            placeholder="Nom section"
            required
            value={newSection.nom}
            onChange={(event) => setNewSection((prev) => ({ ...prev, nom: event.target.value }))}
          />
          <input
            className="input"
            placeholder="Description"
            value={newSection.description}
            onChange={(event) => setNewSection((prev) => ({ ...prev, description: event.target.value }))}
          />
          <button className="btn-primary" type="submit">
            Ajouter section
          </button>
        </form>

        <div className="space-y-3">
          {sectionsWithoutVirtual.map((section) => (
            <div className="rounded-lg border border-slate-200 p-3" key={section.id}>
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  className="input"
                  value={sectionEdits[section.id]?.nom || ''}
                  onChange={(event) =>
                    setSectionEdits((prev) => ({
                      ...prev,
                      [section.id]: {
                        ...prev[section.id],
                        nom: event.target.value
                      }
                    }))
                  }
                />

                <input
                  className="input"
                  value={sectionEdits[section.id]?.description || ''}
                  onChange={(event) =>
                    setSectionEdits((prev) => ({
                      ...prev,
                      [section.id]: {
                        ...prev[section.id],
                        description: event.target.value
                      }
                    }))
                  }
                />

                <input
                  className="input"
                  min="1"
                  type="number"
                  value={sectionEdits[section.id]?.ordre || 1}
                  onChange={(event) =>
                    setSectionEdits((prev) => ({
                      ...prev,
                      [section.id]: {
                        ...prev[section.id],
                        ordre: event.target.value
                      }
                    }))
                  }
                />

                <div className="flex gap-2">
                  <button className="btn-secondary" type="button" onClick={() => handleSaveSection(section.id)}>
                    Sauver
                  </button>
                  <button className="btn-danger" type="button" onClick={() => handleDeleteSection(section.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!sectionsWithoutVirtual.length ? (
            <p className="text-sm text-slate-500">Aucune section pour le moment.</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Produits du catalogue</h2>

        {sections.map((section) => (
          <div className="card" key={section.id ?? section.nom}>
            <h3 className="mb-3 text-base font-semibold text-slate-900">
              {section.nom} ({section.items?.length || 0})
            </h3>

            {!section.items?.length ? (
              <p className="text-sm text-slate-500">Aucun produit dans cette section.</p>
            ) : (
              <div className="space-y-4">
                {section.items.map((item) => {
                  const edit = itemEdits[item.id] || {};

                  return (
                    <div className="rounded-lg border border-slate-200 p-4" key={item.id}>
                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-20 w-20 overflow-hidden rounded bg-slate-100">
                            {item.display.image ? (
                              <img
                                alt={item.display.title}
                                className="h-full w-full object-cover"
                                src={getMediaUrl(item.display.image)}
                              />
                            ) : null}
                          </div>

                          <div>
                            <h4 className="font-semibold text-slate-900">{item.display.product_name || '-'}</h4>
                            <p className="text-xs text-slate-500">Type: {item.display.type_label}</p>
                            <p className="text-xs text-slate-500">Prix base: {formatCurrency(item.display.default_price)}</p>
                            {item.display.reference ? (
                              <p className="text-xs text-slate-500">Réf: {item.display.reference}</p>
                            ) : null}
                          </div>
                        </div>

                        <button className="btn-danger" onClick={() => handleDeleteItem(item.id)} type="button">
                          Retirer
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="label">Section</label>
                          <select
                            className="select"
                            value={edit.section_id ?? ''}
                            onChange={(event) =>
                              setItemEdits((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  section_id: event.target.value
                                }
                              }))
                            }
                          >
                            <option value="">Sans section</option>
                            {sectionsWithoutVirtual.map((sectionOption) => (
                              <option key={sectionOption.id} value={sectionOption.id}>
                                {sectionOption.nom}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="label">Ordre</label>
                          <input
                            className="input"
                            min="1"
                            type="number"
                            value={edit.ordre ?? 1}
                            onChange={(event) =>
                              setItemEdits((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  ordre: event.target.value
                                }
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="label">Prix personnalisé</label>
                          <input
                            className="input"
                            min="0"
                            step="0.01"
                            type="number"
                            value={edit.prix_personnalise ?? ''}
                            onChange={(event) =>
                              setItemEdits((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  prix_personnalise: event.target.value
                                }
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="label">Remise (%)</label>
                          <input
                            className="input"
                            min="0"
                            step="0.01"
                            type="number"
                            value={edit.remise ?? ''}
                            onChange={(event) =>
                              setItemEdits((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  remise: event.target.value
                                }
                              }))
                            }
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="label">Titre personnalisé</label>
                          <input
                            className="input"
                            value={edit.titre_personnalise || ''}
                            onChange={(event) =>
                              setItemEdits((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  titre_personnalise: event.target.value
                                }
                              }))
                            }
                          />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="label">Description personnalisée</label>
                          <textarea
                            className="textarea"
                            rows={2}
                            value={edit.description_personnalisee || ''}
                            onChange={(event) =>
                              setItemEdits((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  description_personnalisee: event.target.value
                                }
                              }))
                            }
                          />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="label">Note commerciale</label>
                          <textarea
                            className="textarea"
                            rows={2}
                            value={edit.note_commerciale || ''}
                            onChange={(event) =>
                              setItemEdits((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  note_commerciale: event.target.value
                                }
                              }))
                            }
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="label">Image spécifique</label>
                          <input
                            accept=".jpg,.jpeg,.png,.webp"
                            className="input"
                            type="file"
                            onChange={(event) =>
                              setItemEdits((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  file: event.target.files?.[0] || null
                                }
                              }))
                            }
                          />
                          <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            <input
                              checked={Boolean(edit.clear_image_specifique)}
                              type="checkbox"
                              onChange={(event) =>
                                setItemEdits((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    ...prev[item.id],
                                    clear_image_specifique: event.target.checked
                                  }
                                }))
                              }
                            />
                            Supprimer l'image spécifique
                          </label>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              checked={Boolean(edit.visible)}
                              type="checkbox"
                              onChange={(event) =>
                                setItemEdits((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    ...prev[item.id],
                                    visible: event.target.checked
                                  }
                                }))
                              }
                            />
                            Visible
                          </label>

                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              checked={Boolean(edit.mise_en_avant)}
                              type="checkbox"
                              onChange={(event) =>
                                setItemEdits((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    ...prev[item.id],
                                    mise_en_avant: event.target.checked
                                  }
                                }))
                              }
                            />
                            Mise en avant
                          </label>

                          <button className="btn-primary w-full" type="button" onClick={() => handleSaveItem(item.id)}>
                            Sauvegarder produit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default CatalogueDetailPage;
