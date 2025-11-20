import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MaterielForm from '../components/MaterielForm';
import DataTable from '../components/DataTable';
import SearchFilters from '../components/SearchFilters';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { materielsService } from '../services/materiels.service';

function MaterielsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [materiels, setMateriels] = useState([]);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadMateriels = async () => {
    try {
      setLoading(true);
      const result = await materielsService.list();
      setMateriels(result || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Erreur de chargement matériels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriels();
  }, []);

  const filteredMateriels = useMemo(() => {
    if (!search.trim()) return materiels;
    const q = search.toLowerCase();

    return materiels.filter((item) =>
      [item.reference, item.nom, item.marque, item.modele, item.categorie, item.stock?.numeroInventaire]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [materiels, search]);

  const onSubmitForm = async (values) => {
    try {
      setSaving(true);
      const payload = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      );

      if (editingItem?.id) {
        await materielsService.update(editingItem.id, payload);
      } else {
        await materielsService.create(payload);
      }

      setShowForm(false);
      setEditingItem(null);
      await loadMateriels();
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      await materielsService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadMateriels();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Suppression impossible');
    }
  };

  if (loading) return <LoadingState message="Chargement des matériels..." />;

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Matériels</h1>
          <p className="text-sm text-slate-500">Création, édition, consultation des fiches matériels.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingItem(null);
            setShowForm((prev) => !prev);
          }}
          type="button"
        >
          {showForm ? 'Fermer' : 'Nouveau matériel'}
        </button>
      </div>

      {error ? <div className="card text-sm text-danger">{error}</div> : null}

      {showForm ? (
        <div className="card">
          <h2 className="mb-3 font-display text-xl font-bold">
            {editingItem ? 'Modifier le matériel' : 'Créer un matériel'}
          </h2>
          <MaterielForm
            defaultValues={editingItem || undefined}
            loading={saving}
            onCancel={() => {
              setEditingItem(null);
              setShowForm(false);
            }}
            onSubmit={onSubmitForm}
            submitLabel={editingItem ? 'Mettre à jour' : 'Créer'}
          />
        </div>
      ) : null}

      <SearchFilters
        onChange={setSearch}
        placeholder="Recherche par référence, nom, marque, modèle, inventaire..."
        value={search}
      />

      {filteredMateriels.length === 0 ? (
        <EmptyState
          description="Aucun matériel trouvé. Crée un premier matériel pour démarrer la gestion de stock."
          title="Aucun matériel"
        />
      ) : (
        <DataTable
          columns={[
            { key: 'reference', header: 'Référence', render: (row) => row.reference || '-' },
            { key: 'nom', header: 'Nom' },
            { key: 'marque', header: 'Marque', render: (row) => row.marque || '-' },
            { key: 'modele', header: 'Modèle', render: (row) => row.modele || '-' },
            {
              key: 'inventaire',
              header: 'N° inventaire',
              render: (row) => row.stock?.numeroInventaire || 'Non attribué'
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (row) => (
                <div className="flex gap-2">
                  <Link className="btn-secondary !px-3 !py-1.5" to={`/materiels/${row.id}`}>
                    Voir
                  </Link>
                  <button
                    className="btn-secondary !px-3 !py-1.5"
                    onClick={() => {
                      setEditingItem(row);
                      setShowForm(true);
                    }}
                    type="button"
                  >
                    Éditer
                  </button>
                  <button className="btn-danger !px-3 !py-1.5" onClick={() => setDeleteTarget(row)} type="button">
                    Supprimer
                  </button>
                </div>
              )
            }
          ]}
          rows={filteredMateriels}
        />
      )}

      <ConfirmDialog
        confirmLabel="Supprimer"
        message={`Supprimer ${deleteTarget?.nom || 'ce matériel'} ? Cette action est irréversible.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        open={Boolean(deleteTarget)}
        title="Confirmation suppression"
      />
    </div>
  );
}

export default MaterielsPage;
