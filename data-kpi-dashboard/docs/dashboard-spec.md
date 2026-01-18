# Dashboard Specification

## Page 1 - Vue générale

Cartes KPI :

- Total membres
- Membres actifs
- Taux d'activité
- Score d'engagement moyen

Graphiques :

- Inscriptions par mois
- Membres par région
- Membres par canal d'acquisition

## Page 2 - Analyse régionale

Graphiques :

- Top régions par nombre de membres
- Taux d'activité par région
- Score d'engagement moyen par région

Filtres :

- Région
- Canal
- Statut

## Page 3 - Acquisition

Graphiques :

- Répartition par canal
- Activité moyenne par canal
- Évolution mensuelle des inscriptions

## Mesures Power BI suggérées

```DAX
Total Members = COUNTROWS(clean_members)

Active Members =
CALCULATE(
    COUNTROWS(clean_members),
    clean_members[status] = "active"
)

Activity Rate =
DIVIDE([Active Members], [Total Members])

Average Engagement =
AVERAGE(clean_members[engagement_score])
```

