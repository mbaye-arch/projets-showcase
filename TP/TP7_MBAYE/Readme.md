# TP7 Rental Agency

# Étudiant : Abdoulaye Mbaye, Groupe 1

Ce projet a pour objectif d'explorer les concepts des collections Java en implémentant une application de gestion d'une agence de location. L'application prend en charge la gestion des véhicules disponibles à la location, des clients, et applique des règles spécifiques pour assurer le bon fonctionnement du système.

Fonctionnalités Implémentées
Gestion des Véhicules :

Ajout de nouveaux véhicules à louer.
Consultation de la liste des véhicules disponibles.
Gestion des Clients :

Ajout de clients à l'agence.

Un client ne peut louer qu'un seul véhicule à la fois.
Un véhicule déjà loué est indisponible jusqu'à sa restitution.

Système de Test :
Validation des règles de gestion (exemple : impossibilité de louer deux fois pour le même client).
Tests de scénario pour vérifier les cas d'erreur.

# Pour generer le javadoc
```javadoc -sourcepath src -subpackages rental -d docs```

# Pour compiler tout le code:
```javac -sourcepath src src/rental/*.java -d classes```

# Pour executer le fichier RentalAgencyMain:
```java -classpath classes rental.RentalAgencyMain```

# Pour compiler les fichier teste du projet:
```javac -classpath junit-console.jar:classes test/rental/*.java -d classes```

# Pour executer les fichier testes compiler;
```java -jar junit-console.jar -classpath teste:classes -scan-classpath```

# Pour generer le jar du Projet:
```jar cvfe agencelocation.jar rental.RentalAgencyMain -C classes .```

# Pour executer le jar CalculatorInfixed.jar
```java -jar agencelocation.jar```

