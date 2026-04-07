package util.plateau;

/**
 * Classe principale pour exécuter le programme et afficher un plateau de jeu.
 */
public class PlateauMain {
    /**
     * Affiche le message d'utilisation du programme et termine l'exécution.
     * Cette méthode est appelée lorsqu'une entrée incorrecte est fournie.
     */
    public static void usage() {
        System.out.println("Usage : java PlateauMain <nombre de lignes> <nombre de colonnes>");
        System.out.println("Saisissez une valeur valide pour le nombre de lignes et de colonnes.");
        System.out.println("Une entrée qui n'est pas une valeur numérique renverra une erreur.");
        System.out.println("Veuillez entrer uniquement des valeurs positives.");
        System.exit(0);
    }

    /**
     * Point d'entrée du programme.
     * Cette méthode prend deux arguments en ligne de commande (nombre de lignes et
     * nombre de colonnes),
     * crée un objet {@link Plateau} et l'affiche.
     * @param args Les arguments du programme : args[0] pour le nombre de lignes et args[1] pour le nombre de colonnes.
     */
    public static void main(String[] args) {
        if (args.length == 2) {
            int ligne = 0;
            int colonne = 0;
            try {
                ligne = Integer.parseInt(args[0]);
                colonne = Integer.parseInt(args[1]);
            } catch (NumberFormatException e) {
                PlateauMain.usage();
            }
            if (ligne <= 0 || colonne <= 0) {
                System.out.println("Erreur : les dimensions doivent être strictement positives.");
                PlateauMain.usage();
            }
            Plateau table = new Plateau(ligne, colonne);
            table.display();
        } else {
            PlateauMain.usage();
        }
    }
}
