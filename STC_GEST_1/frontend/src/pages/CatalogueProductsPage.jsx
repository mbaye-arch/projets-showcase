import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { cataloguesService } from '../services/cataloguesService';
import { getApiErrorMessage } from '../services/api';
import { hardwareService } from '../services/hardwareService';
import { softwareService } from '../services/softwareService';
import { categoriesService } from '../services/categoriesService';
import { suppliersService } from '../services/suppliersService';
import { formatCurrency } from '../utils/formatters';
import { getMediaUrl } from '../utils/media';

const CatalogueProductsPage = () => {
  const { id } = useParams();

  const [catalogueData, setCatalogueData] = useState(null);
  const [hardwareItems, setHardwareItems] = useState([]);
  const [softwareItems, setSoftwareItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedProducts, setSelectedProducts] = useState({});
  const [targetSectionId, setTargetSectionId] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    type: '',
    category: '',
    supplier: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [catalogue, hardwareData, softwareData, categoriesData, suppliersData] = await Promise.all([
        cataloguesService.getById(id),
        hardwareService.list(),
        softwareService.list(),
        categoriesService.list(),
        suppliersService.list()
      ]);

      setCatalogueData(catalogue);
      setHardwareItems(hardwareData);
      setSoftwareItems(softwareData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);

      const firstSection = (catalogue.sections || []).find((section) => section.id);
      setTargetSectionId(firstSection?.id || '');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Impossible de charger les produits du catalogue'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const existingKeys = useMemo(() => {
    const keys = new Set();

    (catalogueData?.sections || []).forEach((section) => {
      (section.items || []).forEach((item) => {
        keys.add(`${item.type_produit}-${item.produit_id}`);
      });
    });

    return keys;
  }, [catalogueData]);

  const availableProducts = useMemo(() => {
    const mappedHardware = hardwareItems.map((item) => ({
      key: `hardware-${item.id}`,
      id: item.id,
      type: 'hardware',
      nom: item.name,
      category: item.category_name,
      supplier: item.supplier_name,
      typeLabel: item.hardware_type,
      price: item.sale_price,
      image: item.main_image,
      reference: item.reference
    }));

    const mappedSoftware = softwareItems.map((item) => ({
      key: `software-${item.id}`,
      id: item.id,
      type: 'software',
      nom: item.name,
      category: item.category_name,
      supplier: item.vendor_name,
      typeLabel: item.software_type,
      price: item.price,
      image: null,
      reference: null
    }));

    const allProducts = [...mappedHardware, ...mappedSoftware];
    const search = filters.q.trim().toLowerCase();

    return allProducts.filter((product) => {
      const searchMatch =
        !search ||
        [product.nom, product.typeLabel, product.category, product.supplier, product.reference]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search);

      const typeMatch = !filters.type || product.type === filters.type;
      const categoryMatch = !filters.category || product.category === filters.category;
      const supplierMatch = !filters.supplier || product.supplier === filters.supplier;

      return searchMatch && typeMatch && categoryMatch && supplierMatch;
    });
  }, [hardwareItems, softwareItems, filters]);

  const selectedCount = Object.values(selectedProducts).filter(Boolean).length;

  const handleToggleProduct = (key) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAddSelected = async () => {
    const productsToAdd = availableProducts.filter((product) => selectedProducts[product.key]);

    if (!productsToAdd.length) {
      alert('Sélectionnez au moins un produit.');
      return;
    }

    const payload = {
      items: productsToAdd.map((product) => ({
        type_produit: product.type,
        produit_id: product.id,
        section_id: targetSectionId || null
      }))
    };

    try {
      const result = await cataloguesService.addItems(id, payload);

      setSuccessMessage(
        `${result.inserted.length} produit(s) ajouté(s)${
          result.skipped?.length ? `, ${result.skipped.length} ignoré(s)` : ''
        }`
      );
      setSelectedProducts({});
      fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Ajout produits impossible'));
    }
  };

  if (loading) return <LoadingState label="Chargement des produits existants..." />;
  if (error) return <div className="card text-sm text-rose-600">{error}</div>;
  if (!catalogueData) return <EmptyState title="Catalogue introuvable" />;

  return (
    <div>
      <PageHeader
        title={`Ajouter des produits - ${catalogueData.catalogue.nom}`}
        description="Sélectionnez des matériels/logiciels déjà existants puis ajoutez-les au catalogue."
        action={
          <Link className="btn-secondary" to={`/catalogues/${id}`}>
            Retour catalogue
          </Link>
        }
      />

      <section className="card mb-4 grid gap-3 md:grid-cols-5">
        <input
          className="input md:col-span-2"
          placeholder="Recherche produit"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />

        <select
          className="select"
          value={filters.type}
          onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
        >
          <option value="">Tous types</option>
          <option value="hardware">Matériels</option>
          <option value="software">Logiciels</option>
        </select>

        <select
          className="select"
          value={filters.category}
          onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
        >
          <option value="">Toutes catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          className="select"
          value={filters.supplier}
          onChange={(event) => setFilters((prev) => ({ ...prev, supplier: event.target.value }))}
        >
          <option value="">Tous fournisseurs</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.name}>
              {supplier.name}
            </option>
          ))}
        </select>

        <select
          className="select md:col-span-2"
          value={targetSectionId}
          onChange={(event) => setTargetSectionId(event.target.value)}
        >
          <option value="">Sans section</option>
          {(catalogueData.sections || [])
            .filter((section) => section.id)
            .map((section) => (
              <option key={section.id} value={section.id}>
                {section.nom}
              </option>
            ))}
        </select>

        <div className="md:col-span-3">
          <button className="btn-primary" type="button" onClick={handleAddSelected}>
            Ajouter la sélection ({selectedCount})
          </button>
        </div>
      </section>

      {successMessage ? (
        <div className="mb-4 rounded-lg bg-brand-100 px-4 py-2 text-sm text-brand-700">{successMessage}</div>
      ) : null}

      {!availableProducts.length ? (
        <EmptyState title="Aucun produit" description="Aucun produit ne correspond aux filtres actuels." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {availableProducts.map((product) => {
            const isAlreadyAdded = existingKeys.has(product.key);
            const selected = Boolean(selectedProducts[product.key]);

            return (
              <article
                className={`card border-2 ${
                  isAlreadyAdded ? 'border-slate-200 bg-slate-50' : selected ? 'border-brand-500' : 'border-transparent'
                }`}
                key={product.key}
              >
                <div className="mb-3 h-32 overflow-hidden rounded-lg bg-slate-100">
                  {product.image ? (
                    <img
                      alt={product.nom}
                      className="h-full w-full object-cover"
                      src={getMediaUrl(product.image)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">Aucune image</div>
                  )}
                </div>

                <p className="text-xs text-slate-500">{product.type === 'hardware' ? 'Matériel' : 'Logiciel'}</p>
                <h3 className="text-base font-semibold text-slate-900">{product.nom}</h3>
                <p className="text-xs text-slate-500">Type: {product.typeLabel || '-'}</p>
                <p className="text-xs text-slate-500">Catégorie: {product.category || '-'}</p>
                <p className="text-xs text-slate-500">Fournisseur: {product.supplier || '-'}</p>
                {product.reference ? <p className="text-xs text-slate-500">Réf: {product.reference}</p> : null}
                <p className="mt-2 text-sm font-bold text-brand-700">{formatCurrency(product.price)}</p>

                <button
                  className="btn-secondary mt-3 w-full"
                  disabled={isAlreadyAdded}
                  type="button"
                  onClick={() => handleToggleProduct(product.key)}
                >
                  {isAlreadyAdded ? 'Déjà dans catalogue' : selected ? 'Désélectionner' : 'Sélectionner'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CatalogueProductsPage;
