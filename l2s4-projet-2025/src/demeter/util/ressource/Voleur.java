package demeter.util.ressource;

import util.plateau.outils.ressource.Ressource;

/**
 * cette classe represente un voleur
 */
public class Voleur implements Ressource {
    /**
     * contructeur de la classe coleur
     */
    public Voleur() {
    }

     /**
     * Methode equals qui compare un objet a un autre objet
     * 
     * @param o l'objet a comparer
     * @return true si les deux objets sont egaux, false sinon
     */
    public boolean equals(Object o) {
        return o instanceof Voleur;
    }

    /**
     * cette methode retourne le nom de la ressource
     * 
     * @return String le nom de la ressource
     */
    @Override
    public String toString() {
        return "Voleur";
    }
}
