package othello;

import othello.util.*;
import java.util.Scanner;
/**
 * La classe {@code OthelloGameMain} est le point d'entrée du jeu Othello.
 * Elle initialise le jeu et gère l'interaction avec les joueurs.
 */
public class OthelloGameMain {
    /**
     * Constructeur par défaut de la classe {@code OthelloGameMain}.
     * Il initialise les composants nécessaires au démarrage du jeu.
     * @param args element mis en paramtres
     * @throws InvalidPositionException erreur renvoyer
     */
    public static void main(String[] args) throws InvalidPositionException {
        Joueur joueur1;
        Joueur joueur2;
        if (args.length == 0) {
            @SuppressWarnings("resource")
            Scanner scanner = new Scanner(System.in);
            String nomJoueur1, nomJoueur2;

            while (true) {
                System.out.print("Entrez le nom du joueur 1 (noir) : ");
                nomJoueur1 = scanner.nextLine();
                System.out.print("Entrez le nom du joueur 2 (blanc) : ");
                nomJoueur2 = scanner.nextLine();

                if (!nomJoueur1.equalsIgnoreCase(nomJoueur2)) {
                    break;
                } else {
                    System.out.println("Les noms doivent être différents. Veuillez réessayer.");
                }
            }

            joueur1 = new Joueur(nomJoueur1, Couleur.BLACK);
            joueur2 = new Joueur(nomJoueur2, Couleur.WHITE);
        } else if (args.length == 2) {
            if (args[0].equalsIgnoreCase(args[1])) {
                System.out.println("Les noms doivent être différents. Veuillez fournir deux noms différents.");
                System.out.println("Usage : java OtheloGameMain <NomJoueur1> <NomJoueur2>");
                return;
            }
            joueur1 = new Joueur(args[0], Couleur.BLACK);
            joueur2 = new Joueur(args[1], Couleur.WHITE);
        } else {
            System.out.println("Veuillez fournir exactement deux noms de joueurs.");
            System.out.println("Usage : java OtheloGameMain <NomJoueur1> <NomJoueur2>");
            return;
        }
        OthelloGame jeu = new OthelloGame(joueur1, joueur2);
        jeu.play();
    }
}
