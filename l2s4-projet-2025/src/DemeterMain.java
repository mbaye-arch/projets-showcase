import demeter.Demeter;
import demeter.util.joueur.JoueurDemeter;

import java.util.Scanner;

/**
 * Classe principale du jeu.
 */
public class DemeterMain {
    public static Scanner sc = new Scanner(System.in);

    /*
     * Affiche le message d'utilisation du programme et termine l'exécution.
     * Cette méthode est appelée lorsqu'une entrée incorrecte est fournie.
     */
    public static void usage() {
        System.out.println("Jeu Demeter Suivez les instructions");
        System.exit(0);
    }

    /**
     * Méthode pour vérifier que l'entrée est bien un entier >= min
     *
     * @param entree      Valeur par défaut (souvent 0)
     * @param description Texte descriptif pour l'utilisateur
     * @param min         Valeur minimale autorisée
     * @return int Valeur entière validée
     */
    public static int valideInput(int entree, String description, int min) {
        while (true) {
            System.out.print("Nombre saisi " + description + " (>= " + min + ") : ");
            if (sc.hasNextInt()) {
                entree = sc.nextInt();
                if (entree >= min) {
                    sc.nextLine(); // vider le \n restant
                    break;
                }
            } else {
                sc.next(); // ignorer l'entrée invalide
            }
            System.out.println("Veuillez saisir un nombre entier supérieur ou égal à " + min + ".");
        }
        return entree;
    }

    /**
     * Point d'entrée du programme.
     * Cette méthode initialise le jeu, ajoute les actions et configure les joueurs.
     *
     * @param args Les arguments du programme.
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        System.out.println("Choisissez la taille du plateau de jeu");
        int ligne = valideInput(0, "ligne", 10);
        int colonne = valideInput(0, "colonne", 10);

        Demeter jeu = new Demeter(ligne, colonne);
        // Nombre de joueurs
        int nbJoueur = valideInput(0, "de joueurs", 1);

        for (int i = 0; i < nbJoueur; i++) {
            String nomJoueur;
            while (true) {
                System.out.print("Saisir le nom du joueur " + (i + 1) + " : ");
                nomJoueur = sc.nextLine().trim();
                if (!nomJoueur.isEmpty()) {
                    break;
                }
                System.out.println("Veuillez saisir un nom valide.");
            }
            jeu.ajouterJoueur(new JoueurDemeter(nomJoueur));
        }
        // Lancement du jeu
        jeu.Game();
    }
}
