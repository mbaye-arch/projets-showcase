import { MemberTable } from "@/components/MemberTable";
import { StatCard } from "@/components/StatCard";
import { filterMembers, getDashboardStats, type MemberStatus } from "@/lib/members";

type HomeProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const status = isStatus(params?.status) ? params.status : "all";
  const stats = getDashboardStats();
  const members = filterMembers(query, status);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Next.js · TypeScript · données JSON</p>
          <h1>Dashboard de gestion en Next.js & TypeScript</h1>
          <p>
            Interface de suivi avec KPI, recherche, filtres et pages détail. Les données sont fictives
            pour garder le projet publiable.
          </p>
        </div>
      </section>

      <section className="stats-grid" aria-label="Indicateurs">
        <StatCard label="Membres" value={stats.totalMembers} hint="jeu de données fictif" />
        <StatCard label="Actifs" value={stats.activeMembers} hint={`${stats.inactiveMembers} inactifs`} />
        <StatCard label="Score moyen" value={stats.averageScore} hint="engagement simulé" />
        <StatCard label="Projets" value={stats.totalProjects} hint="projets suivis" />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Membres</h2>
            <p>Recherche par nom, ville, rôle ou statut.</p>
          </div>
          <form className="filters">
            <input name="q" placeholder="Rechercher..." defaultValue={query} />
            <select name="status" defaultValue={status}>
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <button type="submit">Filtrer</button>
          </form>
        </div>
        <MemberTable members={members} />
      </section>
    </main>
  );
}

function isStatus(status: string | undefined): status is "all" | MemberStatus {
  return status === "all" || status === "active" || status === "inactive";
}
