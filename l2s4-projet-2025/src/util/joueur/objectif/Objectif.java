package util.joueur.objectif;

import util.jeu.Jeu;
import util.joueur.Joueur;

/**
 * interface des obectifs
 */
public abstract class Objectif {
    protected Jeu jeu;
    protected Joueur joueur;

    /**
     * constructeur de la class e jeu quon vas asocier au joueur ares
     * 
     * @param jeu    le jeu pour laquelle lobjetcif du joueur vas etre determiner a
     *               linterieur
     * @param joueur le joueur qui doit atteindre l'objectifs
     */
    public Objectif(Jeu jeu, Joueur joueur) {
        this.jeu = jeu;
        this.joueur = joueur;
    }

    /**
     * cette methode permet de faire une description de l'objectifs
     * 
     * @return String la decription
     */
    public abstract String toString();

    /**
     * cette methode permet de verifier si le joueur a atteint son objectif
     * 
     * @return boolen vrai ou faux si le joueur a attein lobjectif
     */
    public abstract Boolean aAtteintObjectif();

    /**
     * getter du jeu de l'obectifs
     * 
     * @return Jeu le jeu dans laquelle l'objectifs est demandé
     */
    public Jeu getJeu() {
        return this.jeu;
    }

    /**
     * getteru du joueur
     * 
     * @return Joueur le joueur qui doit ateindre l'objectifs demandé
     */
    public Joueur getJoueur() {
        return this.joueur;
    }

    /**
     * cette methode affiche ce qui reste au joueur pour qu'il atteint son objectifs
     */
    public abstract void objRestant();

    /**
     * cette methode fait une félicitations apres que l'objectifs est atteinte
     */
    public abstract void objAtteint();
}
