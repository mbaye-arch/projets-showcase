package ares.util.batiment;

import ares.util.joueur.JoueurAres;
import util.batiment.Batiment;

/**
 * cette classe represente un batiment de type Camp
 */
public class Camp extends Batiment {

    private int nbGuerrier;

    /*
     * constructeur de la classe Camp
     * 
     * @param nbGuerrier le nombre de guerrier
     */
    public Camp(int nbGuerrier, JoueurAres proprio) {
        // dimension le nombre de ressource recolte a chaque tour 2
        super(nbGuerrier, proprio);
        this.nbGuerrier = nbGuerrier;
    }

    /**
     * cette methode retourne le nombre de guerrier
     *
     * @return int le nombre de guerrier
     */
    public int getNbGuerrier() {
        return this.nbGuerrier;
    }

    /**
     * methode equals qui permet de comparer deux batiments
     *
     * @param o l'objet a comparer
     * @return boolean true si les deux batiments sont egaux, false sinon
     */
    @Override
    public boolean equals(Object o) {
        return super.equals(o) && o instanceof Camp && ((Camp) o).nbGuerrier == this.nbGuerrier;
    }

    /**
     * affiche le batiment sous forme de chaine de caractere
     *
     * @return String
     */
    @Override
    public String toString() {
        return super.proprietaire.toString() + " --> Camp : " + this.nbGuerrier + " guerriers ";
    }

    /**
     * cette methode permet de modifier le nombre de guerrier
     *
     * @param nbGuerrier le nouveau nombre de guerrier
     */
    public void setNbGuerrier(int nbGuerrier) {
        this.nbGuerrier = nbGuerrier;
    }

    /**
     * cette methode permet d'ajouter un nombre de guerrier
     *
     * @param nbGuerrier le nombre de guerrier a ajouter
     */
    public void addGuerrier(int nbGuerrier) {
        this.nbGuerrier += nbGuerrier;
    }

    /**
     * cette methode permet de retourner le type de batiment dans la case
     *
     * @return String
     */
    @Override
    public String toStringB() {
        return "C_";
    }
}
