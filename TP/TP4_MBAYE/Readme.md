# Rendu TP4
# Etudiant ABDOULAYE MBAYE GROUPE 1

# Question 1:
    testes et compilation des fichier fait 
# Question 2:
    fait
# Question 3
    Complétez le constructeur de la classe Hotel pour initialiser l’attribut rooms en créant les objets correspondant aux chambres de cet hôtel.
    fait construteur hotel complete
# Question 4:
    Ecrivez le code de la méthode getRoom(). On rappelle que la première chambre doit avoir le numéro 1.
    Compilez la classe Hotel et exécutez les tests de HotelTest
    fait et teste passer avec succes
# Question 5:
    Ecrivez le code de la méthode numberOfRooms().
    Compilez puis testez. La méthode de test numberOfRoomsIsCorrectAtCreation() doit maintenant être
    passée avec succès.
    fait et tester avec succés.
# Question 6:
    La méthode rentRoom() permet la location d’une chambre de l’hôtel. Le numéro de la chambre à louer
    est passé en paramètre. Le résultat de cette méthode est la chambre louée quand c’est possible. Ce résultat vaut null si la chambre demandée est déjà louée ou si le numéro de chambre n’est pas valide (négatif ou trop élevé).
    Ecrivez la documentation de la méthode rentRoom().
    Identifiez dans HotelTest les méthodes de test qui permettent de valider la méthode rentRoom et étudiez
    leurs codes.
    Ecrivez le code de la méthode rentRoom().
    Compilez puis testez pour valider votre implémentation
    teste fait et valide avec succes.
# Question 7:
    Pour chacune des méthodes suivantes, écrivez la javadoc, étudiez les tests correspondant puis écrivez le code. A chaque fois, compilez puis testez.
    • leaveRoom(), qui permet de rendre une chambre louée. Il n’y a aucun effet si la chambre n’était pas  louée.
        reussi et teste passe avec succes
    • numberOfFreeRooms() dont le résultat est le nombre de chambres libres dans l’hôtel.
        teste execute et reussi avec succes
    • firstFreeNumber() dont le résultat est le plus petit numéro d’une chambre libre ou 0 si aucune chambre n’est libre.
        teste execute et fait avec succes 

# Question 8:
    Définissez une classe HotelMain qui définit une méthode main (voir TP 3) qui permette d’exécuter cette
    classe en prenant en argument un entier. Cet entier représentera un numéro de chambre.
    ... question fait et reussi avec succes 
# l'hotel est initialise avec 100 chambres de nom Hotel California avec comme Status Supreme 
# un paragraphe présentant le TP et ses objectifs:
    ce tp consiste a creer une classe room representant des chambres et une classes hotel compose de chambre 
    l'objectif de ce tp est de savoir faire des testes gerer des erreurs mais aussi etudier les paquetages.

# comment générer et consulter la documentation:
    pour generer le doc placer vous dans le repertoire TP4_MBAYE et executer ce code 
    ~~~javadoc -sourcepath src -subpackages hotel -d docs~~~

# comment compiler les classes du projet.
    pour compiler ce code placer vous dans le repertoire TP4_MBAYE et executer ce code 
    ~~~javac -sourcepath src src/hotel/*.java -d classes~~~
# comment compiler et exécuter les tests.
    pour compiler les teste placez vous dans le repertoire TP4_MBAYE
    ~~~javac -classpath junit-console.jar:classes test/hotel/*.java~~~
    pour executer les testes 
    ~~~java -jar junit-console.jar -classpath test:classes -scan-classpath~~~
# comment exécuter le programme (le ou les main inclus), en donnant des exemples.  Vous pouvez aussi donner des exemples de trace d’exécution.

    pour executer ce code apres compilation executer ce code 
    ~~~java -classpath classes  hotel/HotelMain <numero chambre>~~~
    resultat attendues 
    ../Bureau/poo/Mbaye-POO/TP4_MBAYE$ java -classpath classes  hotel/HotelMain 42
    Nombre de Chambre  : 100
    le chambre Room 42
    nombre de chambre libre : 99

    ~~~java -classpath classes  hotel/HotelMain <numero non compris>~~~
    Lorsque vous mettez une valeur inferieure ou superieur a 100 une erreur vous seras remis et la procedures a suivre voici un exemple avec une erreur 
    .../Bureau/poo/Mbaye-POO/TP4_MBAYE$ java -classpath classes  hotel/HotelMain -1
    Nombre de Chambre  : 100
    Exception in thread "main" hotel.RoomNotAvailableException: depases nombre chambre
            at hotel.Hotel.rentRoom(Hotel.java:64)
            at hotel.HotelMain.main(HotelMain.java:18)


    ~~~java -classpath classes  hotel/HotelMain~~~
    une entree sans valeur 
    mbaye@mbaye-Latitude-E7450:~/Bureau/poo/Mbaye-POO/TP4_MBAYE$ java -classpath classes  hotel/HotelMain
    Nombre de Chambre  : 100
    Usage : java Hotel <number of room on the Hotel>
    Saisissez une valeur pour le nombre de chambre dans l'hotel
    une entree qui nest pas une valeur vas renvoyer une erreur 
    entrer toujours une valeur positif
