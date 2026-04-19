# TP9 Maket

# Étudiant : Abdoulaye Mbaye, Groupe 1

Ce Tp a pour objectif d'explorer les concepts d'heritage sur les classes abstraites.

Fonctionnalités Implémentées
Gestion des d'une Marche avec des fournisseur et des commandes:

Ajout de nouveaux  fournisseur
Consultation de la liste ddes fournisseur.

Un fournisseur ne peut accpeter du'une seul commandes.

Système de Test :
Validation des règles de gestion..
Tests de scénario pour vérifier les cas d'erreur.

# Pour generer le javadoc
```javadoc -sourcepath src -subpackages market -d docs```

# Pour compiler tout le code:
```javac -sourcepath src src/market/*.java -d classes```

# Pour executer le fichier MarketMain:
```java -classpath classes market.MarketMain```

# Pour compiler les fichier teste du Tp:
```javac -classpath junit-console.jar:classes test/market/*.java -d classes```
```javac -classpath junit-console.jar:classes test/market/supplier/*.java -d classes```


# Pour executer les fichier testes compiler;
```java -jar junit-console.jar -classpath teste:classes -scan-classpath```

# Pour generer le jar du Tp:
```jar cvfe Marche.jar market.MarketMain -C classes .```

# Pour executer le jar Marche.jar
```java -jar Marche.jar```
