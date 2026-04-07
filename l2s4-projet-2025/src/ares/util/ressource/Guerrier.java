package ares.util.ressource;

import util.plateau.outils.ressource.Ressource;

/**
 * cette classe represente un guerrier
 */
public class Guerrier implements Ressource {

    /**
     * constructeur de la classe Guerrier
     */
    public Guerrier() {
    }

    /**
     * methode equals pour comparer deux guerriers
     *
     * @param o l'objet a comparer
     * @return boolean true si les deux guerriers sont egaux, false sinon
     */
    @Override
    public boolean equals(Object o) {
        return o instanceof Guerrier;
    }

    /**
     * methode toString pour afficher un guerrier
     *
     * @return String la representation du guerrier
     */
    @Override
    public String toString() {
        return "Guerrier";
    }

}
