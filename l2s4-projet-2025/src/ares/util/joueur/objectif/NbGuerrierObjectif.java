package ares.util.joueur.objectif;

import ares.util.joueur.JoueurAres;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.joueur.objectif.Objectif;

/**
 * classe nbGuerrierObjetcifs
 */
public class NbGuerrierObjectif extends Objectif {
    protected int nbGuerrier;

    /**
     * costructeur de la classe nbGuerrierObjectifs
     * 
     * @param jeu        le jeu dans laquelle l'objetifs doit etre atteinte
     * @param Joueur     le joueur qui doit atteindre l'objectifs
     * @param nbGuerrier le nombre de guerrier quil doit avoir dans lensemble de ces
     *                   armes et camps
     */
    public NbGuerrierObjectif(Jeu jeu, Joueur joueur, int nbGuerrier) {
        super(jeu, joueur);
        this.nbGuerrier = nbGuerrier;
    }

    /**
     * fait une desciption de l'objectifs
     * 
     * @return String description de l'objectifs
     */
    @Override
    public String toString() {
        return "Vous devez avoir " + this.nbGuerrier + " guerrier(s) armée et camps compris";
    }

    /**
     * cette determine si le joueur a atteint l'objectif demandes
     * 
     * @return boolean vari ou faux si l'objetcifs est atteinte
     */
    @Override
    public Boolean aAtteintObjectif() {
        return ((JoueurAres) this.getJoueur()).getNombreGuerriers() >= this.nbGuerrier;
    }

    /**
     * getteur du nombre de guerrier a atteindre
     * 
     * @return int le nombre de guerrier a atteindre
     */
    public int getNbGuerrier() {
        return this.nbGuerrier;
    }

    /**
     * cette methode affiche ce qui reste au joueur pour qu'il atteint son objectifs
     */
    public void objRestant() {
        int restant = this.nbGuerrier - ((JoueurAres) joueur).getNombreGuerriers();
        System.out.println("Il vous manque guerrier " + restant + " pour gagner.");
    }

    /**
     * cette methode fait une félicitations apres que l'objectifs est atteinte
     */
    public void objAtteint() {
        System.out.println("Felicitations vous avez eu " + ((JoueurAres) joueur).getNombreGuerriers()+"Guerrier armée et camps compris");

    }
}
