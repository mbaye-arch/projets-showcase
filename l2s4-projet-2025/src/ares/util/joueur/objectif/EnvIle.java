package ares.util.joueur.objectif;

import java.util.List;
import java.util.Map;

import ares.util.joueur.JoueurAres;
import util.batiment.Batiment;
import util.jeu.Jeu;
import util.joueur.objectif.Objectif;
import util.plateau.outils.tuile.Tuile;

public class EnvIle extends Objectif {
    /**
     * constructeurs de l'objectifs Envhair Ile
     * 
     * @param jeu    le jeu dans laquelle l'objetcifs est demande
     * @param joueur le joueur qui doit atteindre l'objectifs
     */
    public EnvIle(Jeu jeu, JoueurAres joueur) {
        super(jeu, joueur);
    }

    /**
     * cette methode dit vrai ou faux si le joueur a atteint l'objectifs
     * 
     * @return vraie ou faux
     */
    @Override
    public Boolean aAtteintObjectif() {
        Map<Integer, List<Tuile>> dictIles = super.getJeu().getIle().getTuiles();
        for (List<Tuile> tuiles : dictIles.values()) {
            if (this.estCompletIle(tuiles) && this.aConquisIle(tuiles)) {
                return true;
            }
        }
        return false;
    }

    /**
     * cette methode determine si ile est complet
     * cela permet de simplifier la verification
     * 
     * @param ile l'ile a chercher
     * @return boolean vrai si lile est completement habite
     */
    public boolean estCompletIle(List<Tuile> ile) {
        for (Tuile tuile : ile) {
            if (super.getJeu().getRelationTuileBatiment().get(tuile) == null) {
                return false;
            }
        }
        return true;
    }

    /**
     * cette methode determine si le joueur de l'objetcifs a completement conquis
     * lille
     * 
     * @param ile lile
     * @return boolean vraie ou faux si le joueur a compete lille
     */
    public boolean aConquisIle(List<Tuile> ile) {
        for (Tuile tuile : ile) {
            Batiment bat = super.getJeu().getRelationTuileBatiment().get(tuile);
            if (bat == null || !(bat.getProprietaire().equals(super.getJoueur()))) {
                return false;
            }
        }
        return true;
    }

    /**
     * fait une description l'objectifs
     * 
     * @return string description de l'objectifs
     */
    @Override
    public String toString() {
        return "Vous devez envahir une Ile totalement";
    }

    /**
     * cette methode affiche ce qui reste au joueur pour qu'il atteint son objectifs
     */
    public void objRestant() {
        System.out.println("Vous n'avez pas encore conquis une Ile");
    }

    /**
     * cette methode fait une félicitations apres que l'objectifs est atteinte
     */
    public void objAtteint() {
        System.out.println("Felicitations Vous avez conquis une ile totalement");

    }
}
