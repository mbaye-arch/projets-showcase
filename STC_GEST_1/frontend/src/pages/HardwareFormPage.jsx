import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { categoriesService } from '../services/categoriesService';
import { hardwareService } from '../services/hardwareService';
import { suppliersService } from '../services/suppliersService';
import { CONDITION_STATE_OPTIONS, HARDWARE_TYPE_OPTIONS } from '../utils/constants';
import { getMediaUrl } from '../utils/media';

const initialForm = {
  name: '',
  reference: '',
  brand: '',
  model: '',
  description: '',
  hardware_type: '',
  category_id: '',
  supplier_id: '',
  purchase_price: '',
  sale_price: '',
  quantity: '',
  condition_state: '',
  source_country: '',
  estimated_delay: '',
  notes: ''
};

const HardwareFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [existingMainImage, setExistingMainImage] = useState(null);
  const [existingVideo, setExistingVideo] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);

  const [mainImageFile, setMainImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [clearGallery, setClearGallery] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setLoading(true);
        setError('');

        const [categoriesData, suppliersData] = await Promise.all([
          categoriesService.list(),
          suppliersService.list()
        ]);

        setCategories(categoriesData);
        setSuppliers(suppliersData);

        if (isEdit) {
          const hardware = await hardwareService.getById(id);

          setForm({
            ...initialForm,
            ...hardware,
            category_id: hardware.category_id || '',
            supplier_id: hardware.supplier_id || '',
            purchase_price: hardware.purchase_price ?? '',
            sale_price: hardware.sale_price ?? '',
            quantity: hardware.quantity ?? ''
          });

          setExistingMainImage(hardware.main_image || null);
          setExistingVideo(hardware.video_path || null);
          setExistingGallery(hardware.gallery || []);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Impossible de charger le formulaire matériel'));
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [id, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!window.confirm('Supprimer cette image de la galerie ?')) return;

    try {
      await hardwareService.removeImage(id, imageId);
      setExistingGallery((prev) => prev.filter((image) => image.id !== imageId));
    } catch (err) {
      alert(getApiErrorMessage(err, 'Suppression image impossible'));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });

    if (mainImageFile) formData.append('main_image', mainImageFile);
    if (videoFile) formData.append('video', videoFile);
    galleryFiles.forEach((file) => formData.append('gallery', file));

    if (clearGallery) {
      formData.append('clear_gallery', 'true');
    }

    try {
      setSaving(true);
      setError('');

      if (isEdit) {
        await hardwareService.update(id, formData);
        navigate(`/hardware/${id}`);
      } else {
        const created = await hardwareService.create(formData);
        navigate(`/hardware/${created.id}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible d\'enregistrer le matériel'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Chargement du formulaire matériel..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Modifier matériel' : 'Nouveau matériel'}
        description="Ajoutez ou éditez un matériel avec images/vidéo."
        action={
          <Link className="btn-secondary" to="/hardware">
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
          <label className="label">Référence</label>
          <input className="input" name="reference" value={form.reference || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Marque</label>
          <input className="input" name="brand" value={form.brand || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Modèle</label>
          <input className="input" name="model" value={form.model || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Type matériel</label>
          <select className="select" name="hardware_type" value={form.hardware_type || ''} onChange={handleChange}>
            <option value="">Sélectionner</option>
            {HARDWARE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">État</label>
          <select
            className="select"
            name="condition_state"
            value={form.condition_state || ''}
            onChange={handleChange}
          >
            <option value="">Sélectionner</option>
            {CONDITION_STATE_OPTIONS.map((option) => (
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
          <label className="label">Fournisseur</label>
          <select className="select" name="supplier_id" value={form.supplier_id || ''} onChange={handleChange}>
            <option value="">Aucun</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Prix d'achat</label>
          <input
            className="input"
            name="purchase_price"
            type="number"
            min="0"
            step="0.01"
            value={form.purchase_price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label">Prix de vente conseillé</label>
          <input
            className="input"
            name="sale_price"
            type="number"
            min="0"
            step="0.01"
            value={form.sale_price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label">Quantité</label>
          <input
            className="input"
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label">Pays source</label>
          <input className="input" name="source_country" value={form.source_country || ''} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Délai estimé</label>
          <input className="input" name="estimated_delay" value={form.estimated_delay || ''} onChange={handleChange} />
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
          <textarea
            className="textarea"
            name="notes"
            rows={3}
            value={form.notes || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label">Image principale (jpg, jpeg, png, webp)</label>
          <input
            accept=".jpg,.jpeg,.png,.webp"
            className="input"
            type="file"
            onChange={(event) => setMainImageFile(event.target.files?.[0] || null)}
          />
          {existingMainImage ? (
            <img
              alt="Image principale"
              className="mt-2 h-24 w-24 rounded object-cover"
              src={getMediaUrl(existingMainImage)}
            />
          ) : null}
        </div>

        <div>
          <label className="label">Vidéo (mp4, webm)</label>
          <input
            accept=".mp4,.webm"
            className="input"
            type="file"
            onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
          />
          {existingVideo ? (
            <video className="mt-2 h-24 w-full rounded bg-black" controls src={getMediaUrl(existingVideo)} />
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="label">Images secondaires (multi-upload)</label>
          <input
            accept=".jpg,.jpeg,.png,.webp"
            className="input"
            multiple
            type="file"
            onChange={(event) => setGalleryFiles(Array.from(event.target.files || []))}
          />

          {isEdit && existingGallery.length ? (
            <div className="mt-3">
              <div className="mb-2 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    checked={clearGallery}
                    onChange={(event) => setClearGallery(event.target.checked)}
                    type="checkbox"
                  />
                  Vider toute la galerie à l'enregistrement
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {existingGallery.map((image) => (
                  <div className="rounded-lg border border-slate-200 p-2" key={image.id}>
                    <img
                      alt="Galerie"
                      className="h-24 w-full rounded object-cover"
                      src={getMediaUrl(image.image_path)}
                    />
                    <button
                      className="btn-danger mt-2 w-full"
                      onClick={() => handleDeleteGalleryImage(image.id)}
                      type="button"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {error ? <div className="md:col-span-2 text-sm text-rose-600">{error}</div> : null}

        <div className="md:col-span-2 flex gap-2">
          <button className="btn-primary" disabled={saving} type="submit">
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour matériel' : 'Créer matériel'}
          </button>

          <Link className="btn-secondary" to="/hardware">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
};

export default HardwareFormPage;
