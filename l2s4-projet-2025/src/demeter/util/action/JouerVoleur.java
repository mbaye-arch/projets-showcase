package demeter.util.action;

import demeter.Demeter;
import demeter.util.joueur.JoueurDemeter;
import java.util.*;

import util.action.Echanger;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

/**
 * Cette classe représente l'action de jouer le voleur. Le joueur choisit une
 * ressource à voler et la prend à un autre joueur.
 */
public class JouerVoleur extends Echanger {
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<Ressource, Integer>();

    static {
        PREREQUIS.put(JoueurDemeter.VOLEUR, 1);
    }

    /**
     * constructeur de la classe
     * @param jeu
     */
    public JouerVoleur(Demeter jeu) {
        super(jeu,PREREQUIS); 
    }

    /**
     * cette methode permet d'effectuer l'action
     * 
     * @param joueur  le joueur qui effectue l'action
     * 
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        if (super.aPrerequis(joueur)){
            System.out.println("Choisir la ressource a voler");
            // Choisir une ressource à voler
            Ressource ressourceAVoler = super.choixRessourceEchange();
            // Choisir un joueur à voler
            for (Joueur joueur2 : super.getJeu().getJoueurs()) {
                int nbAPiquer = joueur2.getRessources().get(ressourceAVoler);
                joueur.addRessource(ressourceAVoler, nbAPiquer);
                joueur2.addRessource(ressourceAVoler, - nbAPiquer);
            }
            System.out.println("Vous avez videz vos adversaires de toutes leur "+ressourceAVoler);
            super.displayActionEffectue();
            super.retireRessource(joueur);
        }
        else{
            super.displayNoRessource();
        }
        
    }

    /**
     * methode pour afficher le nom de l'action
     */
    @Override
    public String toString() {
        return "Jouer le voleur";
    }
}
