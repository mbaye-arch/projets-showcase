import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { categoriesService } from '../services/categoriesService';
import { CATEGORY_TYPE_OPTIONS } from '../utils/constants';

const initialForm = {
  name: '',
  category_type: '',
  description: ''
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ q: '', category_type: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await categoriesService.list(filters);
      setCategories(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger les catégories'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filters.q, filters.category_type]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || '',
      category_type: category.category_type || '',
      description: category.description || ''
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (editingId) {
        await categoriesService.update(editingId, form);
      } else {
        await categoriesService.create(form);
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible d\'enregistrer la catégorie'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;

    try {
      await categoriesService.remove(id);
      fetchCategories();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression impossible'));
    }
  };

  return (
    <div>
      <PageHeader
        title="Catégories"
        description="CRUD catégories pour classer matériels et logiciels."
      />

      <section className="card mb-4">
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          {editingId ? 'Modifier catégorie' : 'Nouvelle catégorie'}
        </h2>

        <form className="grid gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Nom catégorie"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />

          <select
            className="select"
            value={form.category_type}
            onChange={(event) => setForm((prev) => ({ ...prev, category_type: event.target.value }))}
          >
            <option value="">Type de catégorie</option>
            {CATEGORY_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button className="btn-primary" disabled={saving} type="submit">
              {saving ? 'Sauvegarde...' : editingId ? 'Mettre à jour' : 'Créer'}
            </button>

            {editingId ? (
              <button className="btn-secondary" onClick={resetForm} type="button">
                Annuler
              </button>
            ) : null}
          </div>

          <textarea
            className="textarea md:col-span-3"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </form>
      </section>

      <section className="card mb-4 grid gap-3 md:grid-cols-2">
        <input
          className="input"
          placeholder="Recherche catégorie"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />

        <select
          className="select"
          value={filters.category_type}
          onChange={(event) => setFilters((prev) => ({ ...prev, category_type: event.target.value }))}
        >
          <option value="">Tous les types</option>
          {CATEGORY_TYPE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </section>

      {error ? <div className="card mb-4 text-sm text-rose-600">{error}</div> : null}
      {loading ? <LoadingState label="Chargement des catégories..." /> : null}

      {!loading && !categories.length ? (
        <EmptyState title="Aucune catégorie" description="Créez une catégorie pour organiser le catalogue." />
      ) : null}

      {!loading && categories.length ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4">Nom</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4">Matériels</th>
                <th className="pb-2 pr-4">Logiciels</th>
                <th className="pb-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr className="border-b border-slate-100" key={category.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{category.name}</td>
                  <td className="py-3 pr-4">{category.category_type || '-'}</td>
                  <td className="py-3 pr-4 text-slate-600">{category.description || '-'}</td>
                  <td className="py-3 pr-4">{category.hardware_count || 0}</td>
                  <td className="py-3 pr-4">{category.software_count || 0}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={() => handleEdit(category)} type="button">
                        Éditer
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(category.id)} type="button">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default CategoriesPage;
