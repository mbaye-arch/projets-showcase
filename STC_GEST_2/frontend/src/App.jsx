import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import MaterielsPage from './pages/MaterielsPage';
import MaterielDetailPage from './pages/MaterielDetailPage';
import StockPage from './pages/StockPage';
import MouvementsPage from './pages/MouvementsPage';
import InventairePage from './pages/InventairePage';
import EtiquettesPage from './pages/EtiquettesPage';
import ParametresPage from './pages/ParametresPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/materiels" element={<MaterielsPage />} />
        <Route path="/materiels/:id" element={<MaterielDetailPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/mouvements" element={<MouvementsPage />} />
        <Route path="/inventaire" element={<InventairePage />} />
        <Route path="/etiquettes" element={<EtiquettesPage />} />
        <Route path="/parametres" element={<ParametresPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
