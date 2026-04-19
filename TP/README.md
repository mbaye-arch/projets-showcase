# Java POO Labs

Serie de TP Java realises pour consolider la programmation orientee objet.

## Objectif

Ces projets montrent une progression pratique sur les bases Java et POO :

- classes, constructeurs, encapsulation ;
- exceptions et validation ;
- collections et filtres ;
- tests JUnit ;
- heritage, polymorphisme et classes abstraites ;
- petits jeux et simulations metier.

## TP inclus

| Dossier | Sujet | Notions principales |
| --- | --- | --- |
| `TP2_MBAYE` | Guirlande et ampoules | Classes, etat, methodes, egalite |
| `TP3_MBAYE` | Rectangle | Constructeurs, arguments CLI, documentation |
| `TP4_MBAYE` | Hotel | Exceptions, tableaux d'objets, tests |
| `TP5_MBAYE` | Othello | Jeu de plateau, positions, regles, tests |
| `TP6_MBAYE` | Calculettes infixe/postfixe | Parsing, operations, interfaces |
| `TP7_MBAYE` | Agence de location | Collections, filtres, exceptions |
| `TP8_MBAYE` | Agence de news | Heritage, polymorphisme, lecteurs specialises |
| `TP9_MBAYE` | Marche et fournisseurs | Classes abstraites, strategies, commandes |

## Compilation type

Chaque TP contient son propre README avec les commandes adaptees. Exemple general :

```bash
javac -sourcepath src -d classes $(find src -name "*.java")
java -classpath classes package.Main
```

## Tests

Plusieurs TP contiennent des tests JUnit. Les dependances externes ne sont pas versionnees dans ce showcase ; elles doivent etre ajoutees localement si l'on veut relancer les tests.

## Note publication

Les artefacts generes (`classes/`, `.class`, `.jar`, Javadoc generee, dossiers IDE) sont exclus pour garder uniquement les sources, tests et consignes utiles.
