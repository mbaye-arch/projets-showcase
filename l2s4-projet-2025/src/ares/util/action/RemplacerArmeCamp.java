package ares.util.action;

import ares.Ares;
import ares.util.batiment.Armée;
import ares.util.batiment.Camp;
import ares.util.joueur.JoueurAres;
import java.util.*;
import util.action.Remplacer;
import util.batiment.Batiment;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Tuile;

/**
 * RemplacerArmeCamp est une classe qui permet de remplacer une armée par un
 * camp
 */
public class RemplacerArmeCamp extends Remplacer {
    // Prerequis pour l'action RemplacerArmeCamp
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<>();
    static {
        PREREQUIS.put(Joueur.BOIS, 2);
        PREREQUIS.put(Joueur.MINERAIS, 3);
        PREREQUIS.put(JoueurAres.GUERRIER, 1);
    }

    /**
     * Constructeur de RemplacerArmeCamp
     */
    public RemplacerArmeCamp(Ares jeu) {
        super(PREREQUIS, jeu);
    }

    /**
     * Méthode equals de RemplacerArmeCamp
     * 
     * @param o Object
     * @return boolean true si l'objet est une instance de RemplacerArmeCamp
     */
    public boolean equals(Object o) {
        return o instanceof RemplacerArmeCamp;
    }

    /**
     * Méthode toString de RemplacerArmeCamp et prérequis
     * 
     * @return String de l'action RemplacerArmeCamp
     */
    @Override
    public String toString() {
        return super.toString() + " une armée par un camp " + super.displayPrerequis();
    }

    /**
     * Méthode act de RemplacerArmeCamp qui permet de remplacer une armée par un
     * camp
     * 
     * @param joueur Joueur
     * @throws Exception si l'action n'est pas possible
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        System.out.println("Remplacement  d'une armée par un camp ");
        // On récupère les tuiles de type Armée
        List<Tuile> tuiles = super.getJeu().getTuileType(new Armée(1, (JoueurAres) joueur), joueur);
        if (tuiles.isEmpty()) { // Si il n'y a pas de tuile de type Armée
            System.out.println("Aucune armée à remplacer");
            return;
        }
        Tuile tuile = super.chosisTuileReplace(joueur, tuiles);
        Batiment batAncien = super.getJeu().getRelationTuileBatiment().get(tuile);
        int nbGuerrierc = ((Armée) batAncien).getNbGuerrier();
        int nbGuerrierJoueur = joueur.getRessources().get(JoueurAres.GUERRIER);
        System.out.println("Saisissez le nombre de Guerriers à ajouter au camp Aucune limite"); // guerriers au camp
        int nbSaisis = super.saisisIntIntervalle(1, nbGuerrierJoueur);
        int nbTotal = nbSaisis + nbGuerrierc;
        Camp camp = new Camp(nbTotal, ((JoueurAres) joueur)); // On crée un camp
        // ajoute le camp au liste de joueur
        boolean act = super.act(joueur, tuile, camp);
        // diminue le nombre de guerrier ajouter au camp
        if(act){
            joueur.addRessource(JoueurAres.GUERRIER, -nbSaisis+1);
        }
    }
}
