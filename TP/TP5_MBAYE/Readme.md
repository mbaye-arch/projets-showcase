# Jeu Othello

**Étudiant : Abdoulaye Mbaye, Groupe 1**

## Description de la résolution du code pour les positions valides
Pour déterminer les positions valides dans le jeu Othello, j'ai procédé comme suit :

1. **Récupération des positions vides** : J'ai d'abord identifié toutes les positions sur le plateau qui étaient vides.
2. **Identification des positions vides adjacentes** : J'ai ensuite vérifié quelles de ces positions vides avaient un pion inverse à côté.
3. **Utilisation de tuples de positions** : J'ai combiné ces positions vides et leurs voisins dans une structure appelée "tuple de position". Cela me permet de vérifier la direction et d'autres critères pour déterminer la validité d'un mouvement.
4. **Affichage et choix par le joueur** : Les positions valides sont affichées au joueur, qui peut ensuite choisir celle dans laquelle il souhaite jouer.

## Commandes pour le projet
c'est commande sont a executer si vous etes dans le repertoire TP5_MBAYE

### Générer la documentation Javadoc
    ```javadoc -sourcepath src -subpackages othello -d docs```

# Pour Compiler tout le code 
    ```javac -classpath src src/othello/*.java src/io/*.java -d classes```

# Pour Compiler les Fichier Teste
    ```javac -classpath junit-console.jar:classes teste/othello/util/*.java -d classes```
    ```javac -classpath junit-console.jar:classes teste/othello/*.java -d classes```

# Pour Executer les Fichier Teste Compiler 
    ```java -jar junit-console.jar -classpath teste:classes -scan-classpath```
    attention deux partie a joueur a ce niveau pour la reussite de certaines testes
# Pour Executer le Main sans passer par le jar apres compilation 
    ```java -classpath classes othello.OthelloGameMain```
    ```java -classpath classes othello.OthelloGameMain <nom joueur1> <nom joueur2>```

# Pour Creer le fichier jar 
    ```jar cvfe Othello.jar othello.OthelloGameMain -C classes .```

# Pour Executer le fichier jar.
    ```java -jar Othello.jar```

    ```java -jar Othello.jar <nom joueur1> <nom joueur2>```




