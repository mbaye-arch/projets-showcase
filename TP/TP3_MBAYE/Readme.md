# Rendu TP3 
# Etudiants : ABDOULAYE MBAYE
# Groupe 1
# Q1 :
    fait
# Q2 :
    fait
# Q3 :
    code rectangle fait avec sa documentations docs generer.
# Q5 :
    • crée deux objets Rectangle,
    • affiche le résultat de l’appel à toString() sur ces deux objets créés,
    • calcule l’aire et le périmètre de l’un d’entre eux et affiche ces valeurs,
    • vérifie si ces rectangles sont des carrés et affiche un message indiquant si c’est le cas ou non,
    • teste l’égalité entre les deux rectangles et affiche un message indiquant s’ils sont égaux ou non.
    fait
# Q6 :
    execution du programme fait 
# Q7 :
    Modifiez maintenant votre méthode main de RectangleMain pour qu’il soit possible de passer
    en paramètre 1 ou 2 valeurs en argument à l’exécution du programme. On doit alors obtenir le
    comportement suivant :
    • Si aucune valeur n’est fournie, il s’agit d’une erreur de l’utilisateur et le programme ne peut pas
    fonctionner. L’utilisateur doit alors en être informé.
    • Si une seule valeur est fournie, cela veut dire que le premier rectangle est en fait un carré. La
    valeur fournie doit être un entier qui représente la longueur de son côté.
    Par exemple :
    .../poo/tp3$ java -classpath classes RectangleMain 25
    • Si deux valeurs sont fournies, il doit s’agir de deux entiers qui représentent la largeur et la
    longueur du premier rectangle.
    Par exemple :
    .../poo/tp3$ java -classpath classes RectangleMain 25 12

    fait 

# description du Tp
    ce TP nosu impose la creation dune classe rectangle avec des methodes predefinis et un programme pour executio mais la finalites est de pouvoir recuperer des valeurs donne dans le terminal avec le compiler de notre programme pour pouvoir y appliquer le programme

# Instructions 
# compiler programme 
    placez vous dans le dossier TP3_MBAYE
    ```javac -sourcepath src Rectangle/src/*.java -d classes```
# Executer Programme 
    placez vous dans le dossier TP3_MBAYE
    ```java -classpath Rectangle/classes RectangleMain longueur largeur```
    ```java -classpath Rectangle/classes RectangleMain longueur```
# a l'execution vous devriez avoir cela 
        java -classpath Rectangle/classes RectangleMain 25
        12
        Longueur : 25.0
        Largeur : 12.0
        Surface : 300.0
        Périmetre : 74.0
        Longueur : 30.0
        Largeur : 20.0
        Surface : 600.0
        Périmetre : 100.0
        la surface du rectangle1 est : 300.0
        rectangle1 n'est pas carrée
        la surface du rectangle1 est : 600.0
        rectangle2 n'est pas carrée
        les deux rectangle ne sont pas egaux


        java -classpath Rectangle/classes RectangleMain 25
        Longueur : 25.0
        Largeur : 25.0
        Surface : 625.0
        Périmetre : 100.0
        Longueur : 30.0
        Largeur : 20.0
        Surface : 600.0
        Périmetre : 100.0
        la surface du rectangle1 est : 625.0
        rectangle1 est carrée
        la surface du rectangle1 est : 600.0
        rectangle2 n'est pas carrée
