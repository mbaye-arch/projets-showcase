import demeter.Demeter;
import demeter.util.joueur.JoueurDemeter;
import util.joueur.Joueur;

public class Livrable4Demeter {
    public static void usage() {
        System.out.println("Jeu Demeter - Suivez les instructions");
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
                    Livrable4Demeter.usage();
                }
            } catch (NumberFormatException e) {
                System.out.println("Les arguments doivent être des entiers.");
            }
        } else {
            System.out.println("Veuillez fournir deux arguments en ligne de commande.");
        }
        Joueur joueur1 = new JoueurDemeter("Timo");
        Joueur joueur2 = new JoueurDemeter("Leon");
        Demeter jeu = new Demeter(ligne, colonne);
        joueur1.addRessource(Joueur.MINERAIS, 30);
        joueur1.addRessource(Joueur.BLE, 30);
        joueur1.addRessource(Joueur.MOUTON, 30);
        joueur1.addRessource(Joueur.BOIS, 30);
        joueur2.addRessource(Joueur.BLE, 30);
        joueur2.addRessource(Joueur.MINERAIS, 30);
        joueur2.addRessource(Joueur.MOUTON, 30);
        joueur2.addRessource(Joueur.BOIS, 30);
        jeu.ajouterJoueur(joueur1);
        jeu.ajouterJoueur(joueur2);
        jeu.setEstEnSimulation(true);
        System.out.println(jeu.getActions());
        jeu.Game();
    }
}
