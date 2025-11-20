import Link from "next/link";
import { notFound } from "next/navigation";

import { getMemberById, getMembers } from "@/lib/members";

type MemberPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return getMembers().map((member) => ({
    id: member.id
  }));
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const member = getMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <main className="page detail-page">
      <Link className="back-link" href="/">
        Retour au dashboard
      </Link>
      <section className="detail-card">
        <span className={`badge ${member.status}`}>{member.status}</span>
        <h1>{member.name}</h1>
        <dl>
          <div>
            <dt>Rôle</dt>
            <dd>{member.role}</dd>
          </div>
          <div>
            <dt>Ville</dt>
            <dd>{member.city}</dd>
          </div>
          <div>
            <dt>Date d'arrivée</dt>
            <dd>{member.joinDate}</dd>
          </div>
          <div>
            <dt>Score</dt>
            <dd>{member.score}</dd>
          </div>
          <div>
            <dt>Projets suivis</dt>
            <dd>{member.projects}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

