package ares.util.batiment;

import ares.util.joueur.JoueurAres;
import util.batiment.Batiment;
import util.batiment.NoValidTuilePlacementException;

/**
 * cette classe represente un batiment de type Arme
 */
public class Armée extends Batiment {

    protected int nbGuerrier;

    /**
     * constructeur de la classe Arme
     *
     * @param nbGuerrier le nombre de guerrier
     */
    public Armée(int nbGuerrier, JoueurAres proprio) throws NoValidTuilePlacementException {
        // dimension le nombre de ressource recolte a chaque tour 1
        super(nbGuerrier, proprio);
        if (nbGuerrier < 1 || nbGuerrier > 5) {
            throw new NoValidTuilePlacementException("Le nombre de guerrier doit etre compris entre 1 et 5");
        }
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
     * methode abstraite equals qui permet de comparer deux batiments
     *
     * @param o l'objet a comparer
     * @return boolean true si les deux batiments sont egaux, false sinon
     */
    public boolean equals(Object o) {
        return super.equals(o) && o instanceof Armée && ((Armée) o).nbGuerrier == this.nbGuerrier;
    }

    /**
     * affiche le batiment sous forme de chaine de caractere
     *
     * @return String
     */
    @Override
    public String toString() {
        return super.proprietaire.toString() + " --> Armée : " + this.nbGuerrier + " guerriers";
    }

    /**
     * affiche le batiment sous forme de chaine de caractere pour le nom a
     * linterieur du cas
     *
     * @return String
     */
    @Override
    public String toStringB() {
        return "A_";
    }

}
