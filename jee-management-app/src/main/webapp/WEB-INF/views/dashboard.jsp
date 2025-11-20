<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>JEE Management App</title>
    <style>
        body {
            margin: 0;
            color: #17212b;
            background: #f5f7f8;
            font-family: Arial, Helvetica, sans-serif;
        }

        main {
            width: min(1080px, calc(100% - 32px));
            margin: 0 auto;
            padding: 32px 0;
        }

        .hero,
        .card,
        table {
            background: #ffffff;
            border: 1px solid #d9e2e6;
        }

        .hero {
            padding: 28px;
            color: #ffffff;
            background: #1f6f7d;
        }

        .hero h1 {
            margin: 0 0 10px;
        }

        .hero p {
            max-width: 720px;
            margin: 0;
            color: #e8f4f6;
            line-height: 1.5;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin: 18px 0;
        }

        .card {
            padding: 18px;
        }

        .card span {
            color: #5c6b76;
        }

        .card strong {
            display: block;
            margin-top: 8px;
            color: #174f5a;
            font-size: 28px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #d9e2e6;
        }

        th {
            color: #5c6b76;
            font-size: 12px;
            text-transform: uppercase;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            color: #ffffff;
            background: #1f6f7d;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
<main>
    <section class="hero">
        <h1>JEE Management App</h1>
        <p>Application Java/JEE vitrine avec Servlet, JSP, modèle métier et repository en mémoire.</p>
    </section>

    <section class="grid" aria-label="Indicateurs">
        <article class="card">
            <span>Clients</span>
            <strong>${stats.totalClients}</strong>
        </article>
        <article class="card">
            <span>Actifs</span>
            <strong>${stats.activeClients}</strong>
        </article>
        <article class="card">
            <span>Inactifs</span>
            <strong>${stats.inactiveClients}</strong>
        </article>
        <article class="card">
            <span>Projets</span>
            <strong>${stats.totalProjects}</strong>
        </article>
    </section>

    <table>
        <thead>
        <tr>
            <th>Client</th>
            <th>Ville</th>
            <th>Secteur</th>
            <th>Statut</th>
            <th>Projets actifs</th>
        </tr>
        </thead>
        <tbody>
        <c:forEach items="${clients}" var="client">
            <tr>
                <td>${client.name}</td>
                <td>${client.city}</td>
                <td>${client.sector}</td>
                <td><span class="badge">${client.status}</span></td>
                <td>${client.activeProjects}</td>
            </tr>
        </c:forEach>
        </tbody>
    </table>
</main>
</body>
</html>

