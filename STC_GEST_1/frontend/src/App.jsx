import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import CatalogPage from './pages/CatalogPage';
import CataloguesPage from './pages/CataloguesPage';
import CategoriesPage from './pages/CategoriesPage';
import CatalogueDetailPage from './pages/CatalogueDetailPage';
import CatalogueFormPage from './pages/CatalogueFormPage';
import CataloguePreviewPage from './pages/CataloguePreviewPage';
import CatalogueProductsPage from './pages/CatalogueProductsPage';
import ClientTypesPage from './pages/ClientTypesPage';
import DashboardPage from './pages/DashboardPage';
import HardwareDetailPage from './pages/HardwareDetailPage';
import HardwareFormPage from './pages/HardwareFormPage';
import HardwarePage from './pages/HardwarePage';
import NotFoundPage from './pages/NotFoundPage';
import SelectionPage from './pages/SelectionPage';
import SoftwareDetailPage from './pages/SoftwareDetailPage';
import SoftwareFormPage from './pages/SoftwareFormPage';
import SoftwarePage from './pages/SoftwarePage';
import SupplierDetailPage from './pages/SupplierDetailPage';
import SupplierFormPage from './pages/SupplierFormPage';
import SuppliersPage from './pages/SuppliersPage';

const App = () => (
  <Routes>
    <Route element={<AppLayout />} path="/">
      <Route element={<Navigate replace to="/dashboard" />} index />

      <Route element={<DashboardPage />} path="dashboard" />

      <Route element={<SuppliersPage />} path="suppliers" />
      <Route element={<SupplierFormPage />} path="suppliers/new" />
      <Route element={<SupplierDetailPage />} path="suppliers/:id" />
      <Route element={<SupplierFormPage />} path="suppliers/:id/edit" />

      <Route element={<CategoriesPage />} path="categories" />

      <Route element={<HardwarePage />} path="hardware" />
      <Route element={<HardwareFormPage />} path="hardware/new" />
      <Route element={<HardwareDetailPage />} path="hardware/:id" />
      <Route element={<HardwareFormPage />} path="hardware/:id/edit" />

      <Route element={<SoftwarePage />} path="software" />
      <Route element={<SoftwareFormPage />} path="software/new" />
      <Route element={<SoftwareDetailPage />} path="software/:id" />
      <Route element={<SoftwareFormPage />} path="software/:id/edit" />

      <Route element={<CatalogPage />} path="catalog" />
      <Route element={<SelectionPage />} path="selection" />

      <Route element={<CataloguesPage />} path="catalogues" />
      <Route element={<CatalogueFormPage />} path="catalogues/new" />
      <Route element={<ClientTypesPage />} path="catalogues/types-clients" />
      <Route element={<CatalogueDetailPage />} path="catalogues/:id" />
      <Route element={<CatalogueFormPage />} path="catalogues/:id/edit" />
      <Route element={<CatalogueProductsPage />} path="catalogues/:id/products" />
      <Route element={<CataloguePreviewPage />} path="catalogues/:id/preview" />

      <Route element={<NotFoundPage />} path="*" />
    </Route>
  </Routes>
);

export default App;
