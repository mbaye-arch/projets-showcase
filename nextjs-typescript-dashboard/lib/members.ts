import members from "@/data/members.json";

export type MemberStatus = "active" | "inactive";

export type Member = {
  id: string;
  name: string;
  role: string;
  city: string;
  status: MemberStatus;
  joinDate: string;
  score: number;
  projects: number;
};

export function getMembers(): Member[] {
  return members as Member[];
}

export function getMemberById(id: string): Member | undefined {
  return getMembers().find((member) => member.id === id);
}

export function getDashboardStats() {
  const allMembers = getMembers();
  const activeMembers = allMembers.filter((member) => member.status === "active");
  const averageScore = Math.round(
    allMembers.reduce((total, member) => total + member.score, 0) / allMembers.length
  );
  const totalProjects = allMembers.reduce((total, member) => total + member.projects, 0);

  return {
    totalMembers: allMembers.length,
    activeMembers: activeMembers.length,
    inactiveMembers: allMembers.length - activeMembers.length,
    averageScore,
    totalProjects
  };
}

export function filterMembers(query: string, status: "all" | MemberStatus): Member[] {
  const normalizedQuery = query.trim().toLowerCase();

  return getMembers().filter((member) => {
    const matchesStatus = status === "all" || member.status === status;
    const matchesQuery =
      !normalizedQuery ||
      member.name.toLowerCase().includes(normalizedQuery) ||
      member.role.toLowerCase().includes(normalizedQuery) ||
      member.city.toLowerCase().includes(normalizedQuery) ||
      member.status.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}
