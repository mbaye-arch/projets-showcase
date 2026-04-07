package util.batiment;

import util.joueur.Joueur;
import util.plateau.outils.tuile.Tuile;

/**
 * cette classe represente un batiment generique
 */
public abstract class Batiment {
    protected Tuile tuile;
    protected int dimension;
    protected Joueur proprietaire;

    /**
     * contructeur de la classe
     * 
     * @param dimension la dimension du batiment
     */
    public Batiment(int dimension, Joueur proprio) {
        this.dimension = dimension;
        this.proprietaire = proprio;
    }

    /**
     * cette methode retourne la tuile du batiment
     * @return la tuile ou ce situe le batiment
     */
    public Tuile getTuile(){
        return this.tuile;
    }

    public void setTuile(Tuile newTuile){
        this.tuile=newTuile;
    }
    /**
     * cette methode retourne la proprietaire du batiment
     * 
     * @return Joeur le proprietaire du batiment
     */
    public Joueur getProprietaire() {
        return this.proprietaire;
    }

    /**
     * cette methode retourne la le dimension de la tuile
     * 
     * @return int dimension de la tuile
     */
    public int getDimension() {
        return this.dimension;
    }

    /**
     * cette methode permet de modifier la dimension du batiment
     * 
     * @param dimension la nouvelle dimension du batiment
     */
    public void setDimension(int dimension) {
        this.dimension = dimension;
    }

    /**
     * cette methode permet d'ajouter une dimension au batiment
     * 
     * @param dimension la dimension a ajouter
     */
    public void addDimension(int dimension) {
        this.dimension += dimension;
    }

    /**
     * methode equals qui permet de comparer deux batiments
     * 
     * @param o l'objet a comparer
     * @return boolean true si les deux batiments sont egaux, false sinon
     */
    public boolean equals(Object o) {
        return o instanceof Batiment && ((Batiment) o).dimension == this.dimension &&
                ((Batiment) o).proprietaire.equals(this.proprietaire);
    }

    /**
     * affiche le batiment sous forme de chaine de caractere
     * 
     * @return String le batiment sous forme de chaine de caractere
     * 
     */
    public abstract String toString();
    public abstract String toStringB();
}
