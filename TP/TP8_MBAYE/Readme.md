# TP8 Agences deNews

# Étudiant : Abdoulaye Mbaye, Groupe 1

Ce TP a pour objectif d'explorer les concepts héritage et du polymorphisme en implémentant une applicationde de gestion d'une agence de News. L'application prend en charge la gestion de differentes types de lecteur qui sont herites de la classe Reader et applique des règles spécifiques pour assurer le bon fonctionnement.

Fonctionnalités Implémentées
Gestion des lecteurs.
creation dediffrents types de lecteurs.
publication et reception de message des lecteurs.


Système de Test :
Validation des règles de publication et dereception.
Tests de scénario pour vérifier les cas d'erreur.

# Pour generer le javadoc de reader
```javadoc -sourcepath src -subpackages src -d docs```

# Pour compiler tout le code:
```javac -sourcepath src src/press/*.java -d classes```

# Pour executer le fichier NewsMain:
```java -classpath classes press.NewsMain```

# Pour compiler les fichier teste du Tp:
```javac -classpath junit-console.jar:classes src/press/reader/*.java test/press/reader/*.java -d classes```

# Pour executer les fichier testes compiler;
```java -jar junit-console.jar -classpath test:classes -scan-classpath```
