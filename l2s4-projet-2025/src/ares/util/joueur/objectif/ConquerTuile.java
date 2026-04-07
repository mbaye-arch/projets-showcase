package ares.util.joueur.objectif;

import util.jeu.Jeu;
import util.joueur.Joueur;
import util.joueur.objectif.Objectif;

/**
 * Classe ConquerTuile qui determine si le joueur a atteint la construction de
 * ce
 * nombre n de batiments.
 */
public class ConquerTuile extends Objectif {
    protected int nombre;

    /**
     * constructeur de ConquerTuile qui est l'objectifs de construire un nombre n de
     * batiment
     * 
     * @param n      le nombre de batiment qui seras aleatoire
     * @param joueur le joueur qui doi attei,dre l'objectifs
     */
    public ConquerTuile(Jeu jeu, int n, Joueur joueur) {
        super(jeu, joueur);
        this.nombre = n;
    }

    /**
     * cette methode fait une description de l'objectifs
     * 
     * @return String la description de l'objectifs
     */
    @Override
    public String toString() {
        return "Vous devez construire " + this.nombre + " batiments";
    }

    /**
     * cette methode renvoie true si joueur a un nombre n de batiments
     * 
     * @return boolean vrai ou faux
     */
    @Override
    public Boolean aAtteintObjectif() {
        return this.joueur.getBatiments().size() >= this.nombre;
    }

    /**
     * cette methode affiche ce qui reste au joueur pour qu'il atteint son objectifs
     */
    public void objRestant() {
        int restant = this.nombre - joueur.getBatiments().size();
        System.out.println("Il vous manque " + restant + " batiments a construire pour gagner.");
    }

    /**
     * cette methode fait une félicitations apres que l'objectifs est atteinte 
     */
    public void objAtteint(){
        System.out.println("Felicitations vous avez construits "+joueur.getBatiments().size()+" Batiments");
    }
}
