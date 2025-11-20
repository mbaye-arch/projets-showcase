import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { suppliersService } from '../services/suppliersService';
import {
  RELIABILITY_LEVEL_OPTIONS,
  SUPPLIER_PLATFORM_OPTIONS,
  SUPPLIER_TYPE_OPTIONS
} from '../utils/constants';

const initialForm = {
  name: '',
  country: '',
  city: '',
  phone: '',
  email: '',
  supplier_type: '',
  platform: '',
  delivery_delay: '',
  reliability_level: '',
  notes: ''
};

const SupplierFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const result = await suppliersService.getById(id);
        setForm({
          ...initialForm,
          ...result.supplier
        });
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger le fournisseur'));
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (isEdit) {
        await suppliersService.update(id, form);
        navigate(`/suppliers/${id}`);
      } else {
        const created = await suppliersService.create(form);
        navigate(`/suppliers/${created.id}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible d\'enregistrer le fournisseur'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Chargement du fournisseur..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Modifier fournisseur' : 'Nouveau fournisseur'}
        description="Renseignez les informations fournisseur utilisées dans les fiches produits."
        action={
          <Link className="btn-secondary" to="/suppliers">
            Retour liste
          </Link>
        }
      />

      <form className="card grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="name">
            Nom *
          </label>
          <input className="input" id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>

        <div>
          <label className="label" htmlFor="supplier_type">
            Type de fournisseur
          </label>
          <select
            className="select"
            id="supplier_type"
            name="supplier_type"
            value={form.supplier_type || ''}
            onChange={handleChange}
          >
            <option value="">Sélectionner</option>
            {SUPPLIER_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="platform">
            Plateforme
          </label>
          <select
            className="select"
            id="platform"
            name="platform"
            value={form.platform || ''}
            onChange={handleChange}
          >
            <option value="">Sélectionner</option>
            {SUPPLIER_PLATFORM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="reliability_level">
            Niveau de fiabilité
          </label>
          <select
            className="select"
            id="reliability_level"
            name="reliability_level"
            value={form.reliability_level || ''}
            onChange={handleChange}
          >
            <option value="">Sélectionner</option>
            {RELIABILITY_LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="country">
            Pays
          </label>
          <input className="input" id="country" name="country" value={form.country || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label" htmlFor="city">
            Ville
          </label>
          <input className="input" id="city" name="city" value={form.city || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label" htmlFor="phone">
            Téléphone
          </label>
          <input className="input" id="phone" name="phone" value={form.phone || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            value={form.email || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label" htmlFor="delivery_delay">
            Délai estimé de livraison
          </label>
          <input
            className="input"
            id="delivery_delay"
            name="delivery_delay"
            value={form.delivery_delay || ''}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="notes">
            Remarques
          </label>
          <textarea
            className="textarea"
            id="notes"
            name="notes"
            rows={4}
            value={form.notes || ''}
            onChange={handleChange}
          />
        </div>

        {error ? <div className="md:col-span-2 text-sm text-rose-600">{error}</div> : null}

        <div className="md:col-span-2 flex gap-2">
          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer fournisseur'}
          </button>

          <Link className="btn-secondary" to="/suppliers">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SupplierFormPage;
