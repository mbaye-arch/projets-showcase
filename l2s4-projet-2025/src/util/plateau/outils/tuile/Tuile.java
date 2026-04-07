package util.plateau.outils.tuile;

import util.plateau.outils.position.*;
import util.plateau.outils.ressource.Ressource;
public abstract class Tuile {
    /**
     * Position de la tuile sur le plateau.
     */
    protected Position position;

    /**
     * Indique si la tuile contient un bâtiment.
     * `true` si un bâtiment est présent, `false` sinon.
     */
    protected boolean batiment;

    /**
     * Nombre de ressources associées à la tuile.
     */
    protected int nbRes;

    /**
     * constructeur de la classe abstarite tuile 
     * @param position la position du tuile vue qu'il sera place dans une tableau 
     */
    public Tuile(Position position) {
        this.position = position;
        this.batiment = false;
        this.nbRes = 0;
    }
    /**
     * cette methode retourne la position du tuile 
     * @return Position la position du tuile 
     */
    public Position getPosition() {
        return this.position;
    }

    /**
     * cette methode permet de modifier la positon d'une tuile 
     * @param position la positin avec laquelle remplace le precedente 
     */
    public void setPosition(Position position) {
        this.position = position;
    }

    /**
     * cette methode renvoie true si la tuile a une batiment false sinon 
     * @return boolean la valeur
     */
    public boolean getBatiment() {
        return this.batiment;
    }
    /**
     * cette methode change la valeur boolena de batiment 
     * @param batiment la variable avec laquelle modifier 
     */
    public void setBatiment(boolean batiment) {
        this.batiment = batiment;
    }

    /**
     * cette methode retourne le nombre de ressource du tuile 
     * @return int nombre de ressource 
     */
    public int getNbRes() {
        return this.nbRes;
    }
    /**
     * cette methode permet de modifier la valeur des nombre de ressources 
     * @param nbRes la valeur a mettre a a place du precedent 
     */
    public void setNbRes(int nbRes) {
        this.nbRes = nbRes;
    }
    /**
     * cette methodepermet l'affichage d'une tuile
     * @return String result
     */
    @Override
    public abstract String toString();
    /**
     * cette methode permet d'incrementer le nombr ede ressourec a chaque tour de phase 
     */
    public void prodRessource(){
        this.nbRes++;
    }
    /**
     * cette methode permet de determiner legalite entre des tuile
     * @param o l'objet a comparer
     * @return boolean result
     */
    public boolean equals(Object o){
        if (!(o instanceof Tuile)){
            return false;
        }
        else{
            Tuile other =(Tuile) o;
            return this.nbRes==other.nbRes && this.batiment==other.batiment
            &&this.position.equals(other.position);
        }
    }

    /**
     * cette methode abstraite retourne la ressource de la tuile
     * @return Ressource la ressource de la tuile
     */
    public abstract Ressource getRessource();
}