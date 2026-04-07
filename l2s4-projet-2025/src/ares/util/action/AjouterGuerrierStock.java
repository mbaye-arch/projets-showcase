package ares.util.action;

import ares.Ares;
import ares.util.joueur.JoueurAres;
import java.util.HashMap;
import util.action.Action;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

/**
 * cette Action represente l'ajout de gueirrier au stock du joueur
 */
public class AjouterGuerrierStock extends Action {

    // Prerequis pour l'Action
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<>();

    static {
        PREREQUIS.put(Joueur.MOUTON, 2);
        PREREQUIS.put(Joueur.MINERAIS, 1);
        PREREQUIS.put(Joueur.BLE, 2);
    }

    /**
     * Constructeur de l'Action
     *
     * @param jeu
     */
    public AjouterGuerrierStock(Ares jeu) {
        super(PREREQUIS, jeu);
    }

    /**
     * Methode equals
     *
     * @param o Objet a comparer
     * @return boolean
     */
    public boolean equals(Object o) {
        return o instanceof AjouterGuerrierStock;
    }

    /**
     * Methode toString
     *
     * @return String
     */
    @Override
    public String toString() {
        return "Ajouter 5 guerrier au stock " + super.displayPrerequis();
    }

    /**
     * Methode act qui permet d'ajouter un guerrier au stock du joueur
     *
     * @param joueur Joueur qui effectue l'action
     * @throws Exception
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        if (super.aPrerequis(joueur)) {
            joueur.addRessource(JoueurAres.GUERRIER, 5);
            super.retireRessource(joueur);
            super.displayActionEffectue();
        } else {
            super.displayNoRessource();
        }
    }
}
