import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { categoriesService } from '../services/categoriesService';
import { softwareService } from '../services/softwareService';
import { SOFTWARE_TYPE_OPTIONS } from '../utils/constants';

const initialForm = {
  name: '',
  software_type: '',
  category_id: '',
  description: '',
  usage_purpose: '',
  has_license: false,
  price: '',
  vendor_name: '',
  compatibility: '',
  notes: ''
};

const SoftwareFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await categoriesService.list();
        setCategories(categoriesData);

        if (isEdit) {
          const software = await softwareService.getById(id);
          setForm({
            ...initialForm,
            ...software,
            category_id: software.category_id || '',
            has_license: Boolean(software.has_license),
            price: software.price ?? ''
          });
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger le formulaire logiciel'));
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

    const payload = {
      ...form,
      has_license: form.has_license ? 1 : 0
    };

    try {
      setSaving(true);
      setError('');

      if (isEdit) {
        await softwareService.update(id, payload);
        navigate(`/software/${id}`);
      } else {
        const created = await softwareService.create(payload);
        navigate(`/software/${created.id}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible d\'enregistrer le logiciel'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Chargement du formulaire logiciel..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Modifier logiciel' : 'Nouveau logiciel'}
        description="Renseignez les informations utiles pour le catalogue interne."
        action={
          <Link className="btn-secondary" to="/software">
            Retour liste
          </Link>
        }
      />

      <form className="card grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="label">Nom *</label>
          <input className="input" name="name" required value={form.name} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Type logiciel</label>
          <select className="select" name="software_type" value={form.software_type || ''} onChange={handleChange}>
            <option value="">Sélectionner</option>
            {SOFTWARE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Catégorie</label>
          <select className="select" name="category_id" value={form.category_id || ''} onChange={handleChange}>
            <option value="">Aucune</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Prix</label>
          <input
            className="input"
            min="0"
            name="price"
            step="0.01"
            type="number"
            value={form.price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label">Fournisseur / Éditeur</label>
          <input className="input" name="vendor_name" value={form.vendor_name || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Compatibilité</label>
          <input className="input" name="compatibility" value={form.compatibility || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Usage principal</label>
          <input className="input" name="usage_purpose" value={form.usage_purpose || ''} onChange={handleChange} />
        </div>

        <div className="flex items-center gap-2 pt-7">
          <input
            checked={Boolean(form.has_license)}
            id="has_license"
            name="has_license"
            type="checkbox"
            onChange={handleChange}
          />
          <label className="text-sm text-slate-700" htmlFor="has_license">
            Licence active
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="textarea"
            name="description"
            rows={3}
            value={form.description || ''}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Remarques</label>
          <textarea className="textarea" name="notes" rows={3} value={form.notes || ''} onChange={handleChange} />
        </div>

        {error ? <div className="md:col-span-2 text-sm text-rose-600">{error}</div> : null}

        <div className="md:col-span-2 flex gap-2">
          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour logiciel' : 'Créer logiciel'}
          </button>

          <Link className="btn-secondary" to="/software">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SoftwareFormPage;
