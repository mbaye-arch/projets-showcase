import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { clientTypesService } from '../services/clientTypesService';

const initialForm = {
  nom: '',
  description: ''
};

const ClientTypesPage = () => {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await clientTypesService.list();
      setTypes(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger les types clients'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleEdit = (type) => {
    setEditingId(type.id);
    setForm({
      nom: type.nom || '',
      description: type.description || ''
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (editingId) {
        await clientTypesService.update(editingId, form);
      } else {
        await clientTypesService.create(form);
      }

      resetForm();
      fetchTypes();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Enregistrement impossible'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce type client ?')) return;

    try {
      await clientTypesService.remove(id);
      fetchTypes();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression impossible'));
    }
  };

  return (
    <div>
      <PageHeader
        title="Types de clients"
        description="Gestion simple des types de clients pour les catalogues commerciaux."
        action={
          <Link className="btn-secondary" to="/catalogues">
            Retour catalogues
          </Link>
        }
      />

      <section className="card mb-4">
        <h2 className="mb-3 text-base font-semibold text-slate-900">
          {editingId ? 'Modifier type client' : 'Nouveau type client'}
        </h2>

        <form className="grid gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Nom type client"
            required
            value={form.nom}
            onChange={(event) => setForm((prev) => ({ ...prev, nom: event.target.value }))}
          />

          <textarea
            className="textarea md:col-span-2"
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />

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
        </form>
      </section>

      {error ? <div className="card mb-4 text-sm text-rose-600">{error}</div> : null}
      {loading ? <LoadingState label="Chargement des types clients..." /> : null}

      {!loading && !types.length ? (
        <EmptyState
          title="Aucun type client"
          description="Créez des types clients pour qualifier vos catalogues."
        />
      ) : null}

      {!loading && types.length ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="pb-2 pr-4">Nom</th>
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4">Catalogues</th>
                <th className="pb-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr className="border-b border-slate-100" key={type.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{type.nom}</td>
                  <td className="py-3 pr-4 text-slate-600">{type.description || '-'}</td>
                  <td className="py-3 pr-4">{type.catalogues_count || 0}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={() => handleEdit(type)} type="button">
                        Éditer
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(type.id)} type="button">
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

export default ClientTypesPage;
