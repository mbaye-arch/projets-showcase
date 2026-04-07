package ares.util.action;

import ares.Ares;
import ares.util.joueur.JoueurAres;
import java.util.HashMap;
import util.action.Action;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

/**
 * cette classe represente l'action d'acheter
 *
 */
public class AcheterArmeSecrete extends Action {
    // les ressources necessaires pour acheter
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<>();

    static {
        PREREQUIS.put(Joueur.MINERAIS, 1);
        PREREQUIS.put(Joueur.BOIS, 1);
    }

    /**
     * Constructeur de la classe AcheterArmeScrete
     */
    public AcheterArmeSecrete(Ares jeu) {
        super(PREREQUIS, jeu);
    }

    /**
     * cette methode permet de verifier si l'objet en parametre est une instance
     * de AcheterArmeScrete
     *
     * @param o l'objet a verifier
     * @return boolean true si l'objet est une instance de AcheterArmeScrete
     */
    public boolean equals(Object o) {
        return o instanceof AcheterArmeSecrete;
    }

    /**
     * cette methode permet d'acheter une arme secrete pour le joueur en
     * parametre
     *
     * @param joueur le joueur qui achete l'arme secrete
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        if (super.aPrerequis(joueur)) {
            joueur.addRessource(JoueurAres.ARME_SECRETE, 1);
            super.retireRessource(joueur);
            System.out.println(joueur.getName() + " ---> Arme Secrete +1");
            super.displayActionEffectue();
        } else {
            super.displayNoRessource();
        }
    }

    /**
     * cette methode permet de retourner une chaine de caractere representant
     * l'action et son prerequis
     *
     * @return String une chaine de caractere representant l'action
     */
    @Override
    public String toString() {
        return "Acheter une arme secrete " + super.displayPrerequis();
    }

}
