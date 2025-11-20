import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { cataloguesService } from '../services/cataloguesService';
import { clientTypesService } from '../services/clientTypesService';
import { CATALOGUE_STATUS_OPTIONS, CATALOGUE_THEME_OPTIONS } from '../utils/constants';
import { getMediaUrl } from '../utils/media';

const initialForm = {
  nom: '',
  titre: '',
  sous_titre: '',
  description: '',
  type_client_id: '',
  theme: 'standard',
  afficher_prix: true,
  afficher_references: true,
  afficher_caracteristiques: true,
  message_final: '',
  pied_de_page: '',
  statut: 'brouillon'
};

const CatalogueFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [clientTypes, setClientTypes] = useState([]);

  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [existingCover, setExistingCover] = useState(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [clearCover, setClearCover] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const clientTypesData = await clientTypesService.list();
        setClientTypes(clientTypesData);

        if (isEdit) {
          const data = await cataloguesService.getById(id);
          const catalogue = data.catalogue;

          setForm({
            nom: catalogue.nom || '',
            titre: catalogue.titre || '',
            sous_titre: catalogue.sous_titre || '',
            description: catalogue.description || '',
            type_client_id: catalogue.type_client_id || '',
            theme: catalogue.theme || 'standard',
            afficher_prix: Boolean(catalogue.afficher_prix),
            afficher_references: Boolean(catalogue.afficher_references),
            afficher_caracteristiques: Boolean(catalogue.afficher_caracteristiques),
            message_final: catalogue.message_final || '',
            pied_de_page: catalogue.pied_de_page || '',
            statut: catalogue.statut || 'brouillon'
          });

          setExistingLogo(catalogue.logo || null);
          setExistingCover(catalogue.image_couverture || null);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger le formulaire catalogue'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, value ?? '');
      }
    });

    if (logoFile) formData.append('logo', logoFile);
    if (coverFile) formData.append('image_couverture', coverFile);
    if (clearLogo) formData.append('clear_logo', 'true');
    if (clearCover) formData.append('clear_image_couverture', 'true');

    try {
      setSaving(true);
      setError('');

      if (isEdit) {
        await cataloguesService.update(id, formData);
        navigate(`/catalogues/${id}`);
      } else {
        const created = await cataloguesService.create(formData);
        navigate(`/catalogues/${created.catalogue.id}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible d\'enregistrer le catalogue'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Chargement du formulaire catalogue..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Modifier catalogue' : 'Nouveau catalogue'}
        description="Configurez l'identité, les options d'affichage et le thème du catalogue client."
        action={
          <Link className="btn-secondary" to="/catalogues">
            Retour catalogues
          </Link>
        }
      />

      <form className="card grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="label">Nom interne *</label>
          <input className="input" name="nom" required value={form.nom} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Titre catalogue *</label>
          <input className="input" name="titre" required value={form.titre} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Sous-titre</label>
          <input className="input" name="sous_titre" value={form.sous_titre} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Type client</label>
          <select className="select" name="type_client_id" value={form.type_client_id} onChange={handleChange}>
            <option value="">Aucun</option>
            {clientTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Thème</label>
          <select className="select" name="theme" value={form.theme} onChange={handleChange}>
            {CATALOGUE_THEME_OPTIONS.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Statut</label>
          <select className="select" name="statut" value={form.statut} onChange={handleChange}>
            {CATALOGUE_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="textarea"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-800">Informations affichées</p>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input checked={form.afficher_prix} name="afficher_prix" type="checkbox" onChange={handleChange} />
            Afficher les prix
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              checked={form.afficher_references}
              name="afficher_references"
              type="checkbox"
              onChange={handleChange}
            />
            Afficher les références
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              checked={form.afficher_caracteristiques}
              name="afficher_caracteristiques"
              type="checkbox"
              onChange={handleChange}
            />
            Afficher les caractéristiques
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Logo catalogue</label>
            <input
              accept=".jpg,.jpeg,.png,.webp"
              className="input"
              type="file"
              onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
            />
            {existingLogo ? (
              <img alt="Logo existant" className="mt-2 h-20 w-20 rounded object-cover" src={getMediaUrl(existingLogo)} />
            ) : null}
            {isEdit ? (
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input checked={clearLogo} type="checkbox" onChange={(event) => setClearLogo(event.target.checked)} />
                Supprimer le logo actuel
              </label>
            ) : null}
          </div>

          <div>
            <label className="label">Image de couverture</label>
            <input
              accept=".jpg,.jpeg,.png,.webp"
              className="input"
              type="file"
              onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
            />
            {existingCover ? (
              <img
                alt="Couverture existante"
                className="mt-2 h-24 w-full rounded object-cover"
                src={getMediaUrl(existingCover)}
              />
            ) : null}
            {isEdit ? (
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input checked={clearCover} type="checkbox" onChange={(event) => setClearCover(event.target.checked)} />
                Supprimer la couverture actuelle
              </label>
            ) : null}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="label">Message final</label>
          <textarea
            className="textarea"
            name="message_final"
            rows={3}
            value={form.message_final}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Pied de page</label>
          <textarea
            className="textarea"
            name="pied_de_page"
            rows={2}
            value={form.pied_de_page}
            onChange={handleChange}
          />
        </div>

        {error ? <div className="md:col-span-2 text-sm text-rose-600">{error}</div> : null}

        <div className="md:col-span-2 flex gap-2">
          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour catalogue' : 'Créer catalogue'}
          </button>

          <Link className="btn-secondary" to="/catalogues">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CatalogueFormPage;
