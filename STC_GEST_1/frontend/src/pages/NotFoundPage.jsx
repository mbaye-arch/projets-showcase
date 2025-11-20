import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="card text-center">
    <h1 className="text-2xl font-bold text-slate-900">404</h1>
    <p className="mt-2 text-slate-600">La page demandée est introuvable.</p>
    <Link className="btn-primary mt-4" to="/dashboard">
      Retour au dashboard
    </Link>
  </div>
);

export default NotFoundPage;
