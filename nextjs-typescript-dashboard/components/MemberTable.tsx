import Link from "next/link";

import type { Member } from "@/lib/members";

type MemberTableProps = {
  members: Member[];
};

export function MemberTable({ members }: MemberTableProps) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Rôle</th>
            <th>Ville</th>
            <th>Statut</th>
            <th>Score</th>
            <th>Projets</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member) => (
              <tr key={member.id}>
                <td>
                  <Link href={`/members/${member.id}`}>{member.name}</Link>
                </td>
                <td>{member.role}</td>
                <td>{member.city}</td>
                <td>
                  <span className={`badge ${member.status}`}>{member.status}</span>
                </td>
                <td>
                  <span className="score">{member.score}</span>
                </td>
                <td>{member.projects}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="empty-state" colSpan={6}>
                Aucun membre ne correspond aux filtres.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
