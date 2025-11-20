import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function AppLayout() {
  const [quickSearch, setQuickSearch] = useState('');
  const navigate = useNavigate();

  const onSubmitSearch = (event) => {
    event.preventDefault();
    if (!quickSearch.trim()) return;
    navigate(`/materiels/${quickSearch.trim()}`);
  };

  return (
    <div className="min-h-screen text-ink">
      <div className="mx-auto flex max-w-[1600px] gap-4 p-4 lg:p-6">
        <Sidebar />
        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4">
          <header className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-2xl font-bold">STC GETS</p>
              <p className="text-sm text-slate-500">Gestion de stock & identification matériel IT</p>
            </div>
            <form className="flex w-full max-w-md items-center gap-2" onSubmit={onSubmitSearch}>
              <input
                className="input"
                value={quickSearch}
                onChange={(event) => setQuickSearch(event.target.value)}
                placeholder="Scan / recherche rapide (numéro, code-barres, QR, nom...)"
              />
              <button className="btn-primary" type="submit">
                Chercher
              </button>
            </form>
          </header>
          <main className="fade-in flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
