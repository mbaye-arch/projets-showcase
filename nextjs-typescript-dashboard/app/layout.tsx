import type { Metadata } from "next";

import "./styles.css";

export const metadata: Metadata = {
  title: "Next.js TypeScript Dashboard",
  description: "Dashboard vitrine avec KPI, filtres et pages détail."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

