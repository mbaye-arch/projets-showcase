package demeter.util.action;

import java.util.*;

import demeter.Demeter;
import demeter.util.joueur.JoueurDemeter;
import util.action.Action;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

/**
 * cette classe permet d'acheter un voleur
 */
public class AcheterVoleur extends Action {

    // Prerequis pour acheter un voleur
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<Ressource, Integer>();

    static {
        PREREQUIS.put(Joueur.MINERAIS, 1);
        PREREQUIS.put(Joueur.BOIS, 1);
        PREREQUIS.put(Joueur.BLE, 1);
    }

    /**
     * Constructeur de AcheterVoleur
     */
    public AcheterVoleur(Jeu jeu) {
        super(PREREQUIS, jeu);
    }

    /**
     * Redefinition de la methode equals
     *
     * @param o Object
     * @return boolean
     */
    public boolean equals(Object o) {
        return o instanceof AcheterVoleur;
    }

    /**
     * methode qui permet d'afficher le nom de l'action
     *
     * @return String
     */
    public String toString() {
        return "Acheter un voleur " + super.displayPrerequis();
    }

    /**
     * methode qui permet d'effectuer l'action d'acheter un voleur
     *
     * @param joueur Joueur
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        System.out.println("Achat d'un voleur");
        if (((Demeter) super.getJeu()).getNbVoleur() > 1) {
            if (super.aPrerequis(joueur)) {
                joueur.addRessource(JoueurDemeter.VOLEUR, 1);
                ((Demeter) super.getJeu()).diminuerNbVoleur();
                super.retireRessource(joueur);
                super.displayActionEffectue();
            } else {
                super.displayNoRessource();
            }
        }else{
            System.out.println("Aucune voleur disponible achat impossible.");
            return;
        }
    }
}
