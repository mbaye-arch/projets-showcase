import ares.Ares;
import ares.util.joueur.JoueurAres;
import util.joueur.Joueur;

public class Livrable4Ares {
    public static void usage() {
        System.out.println("Jeu Ares - Suivez les instructions");
        System.exit(0);
    }

    public static void main(String[] args) throws Exception {
        int ligne = 0;
        int colonne = 0;
        if (args.length >= 2) {
            try {
                ligne = Integer.parseInt(args[0]);
                colonne = Integer.parseInt(args[1]);
                if (ligne < 10 || colonne < 10) {
                    Livrable4Ares.usage();
                }
            } catch (NumberFormatException e) {
                System.out.println("Les arguments doivent être des entiers.");
            }
        } else {
            System.out.println("Veuillez fournir deux arguments en ligne de commande.");
        }
        Joueur joueur1 = new JoueurAres("Timo");
        Joueur joueur2 = new JoueurAres("Leon");
        Ares jeu = new Ares(ligne, colonne);
        int n = (ligne * colonne) / 3;
        joueur1.addRessource(Joueur.MINERAIS, n);
        joueur1.addRessource(Joueur.BLE, n);
        joueur1.addRessource(Joueur.MOUTON, n);
        joueur1.addRessource(Joueur.BOIS, n);
        joueur2.addRessource(Joueur.BLE, n);
        joueur2.addRessource(Joueur.MINERAIS, n);
        joueur2.addRessource(Joueur.MOUTON, n);
        joueur2.addRessource(Joueur.BOIS, n);
        jeu.ajouterJoueur(joueur1);
        jeu.ajouterJoueur(joueur2);
        jeu.setEstEnSimulation(true);
        System.out.println(jeu.getActions());
        jeu.Game();
    }
}
