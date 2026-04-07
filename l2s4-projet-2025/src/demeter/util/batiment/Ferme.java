package demeter.util.batiment;

import demeter.util.joueur.JoueurDemeter;
import util.batiment.Batiment;

/**
 * Classe Ferme qui herite de la classe Batiment
 */
public class Ferme extends Batiment {
    /**
     * Constructeur de la classe Ferme
     * @param proprio, le joueur à qui appartient la ferme
     */
    public Ferme(JoueurDemeter proprio) {
        // dimension le nombre de ressource recolter par tour 1
        super(1, proprio);
    }

    /**
     * Methode equals qui compare un objet a un autre objet
     * 
     * @param o l'objet a comparer
     * @return true si les deux objets sont egaux, false sinon
     */
    public boolean equals(Object o) {
        return o instanceof Ferme && super.equals(o);
    }

    /**
     * Methode qui retourne le nom du batiment
     * 
     * @return le nom du batiment
     */
    public String toString() {
        return super.getProprietaire() + " --> Ferme";
    }
    public String toStringB(){
        return "F_";
    }
}
