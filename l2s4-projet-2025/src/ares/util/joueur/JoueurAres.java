package ares.util.joueur;

import ares.util.batiment.Armée;
import ares.util.batiment.Camp;
import ares.util.ressource.ArmeSecrete;
import ares.util.ressource.Guerrier;
import util.batiment.Batiment;
import util.joueur.Joueur;
import util.joueur.objectif.Objectif;

/**
 * cette classe represente un joueurAres
 */
public class JoueurAres extends Joueur {
    // les ressources du joueurAres
    public static final Guerrier GUERRIER = new Guerrier();
    public static final ArmeSecrete ARME_SECRETE = new ArmeSecrete();
    protected Objectif objectif;

    /**
     * contructeur de la classe
     * 
     * @param name
     */
    public JoueurAres(String name) {
        super(name);
        // pour leur objectifs
        this.objectif = null;
        // initialisation des ressources de guerrier a 30
        super.getRessources().put(GUERRIER, 30);
        super.getRessources().put(ARME_SECRETE, 0);
    }

    /**
     * cette methode retourne le stock de guerriers du joueur
     * 
     * @return int le stock
     */
    public int getStockGuerriers() {
        return super.getRessources().get(GUERRIER);
    }

    /**
     * Vérifie si le joueur possède au moins une arme secrète.
     * 
     * @return true si le joueur a une arme secrète, sinon false.
     */
    public boolean possedeArmeSecrete() {
        return super.getRessources().getOrDefault(ARME_SECRETE, 0) > 0;
    }

    /**
     * Utilise une arme secrète. Si le joueur n'a pas d'arme secrète, la méthode
     * ne fait rien.
     * 
     * @return true si l'arme secrète a été utilisée, sinon false.
     */
    public boolean utiliserArmeSecrete() {
        int nbArmes = super.getRessources().getOrDefault(ARME_SECRETE, 0);
        if (nbArmes > 0) {
            super.getRessources().put(ARME_SECRETE, nbArmes - 1);
            return true;
        }
        return false;
    }

    /**
     * cette methode donne le nombre de guerrier que possede le joueur armee et camp
     * compris
     * 
     * @return int le nombre de guerrier
     */
    public int getNombreGuerriers() {
        int nbGuerriers = 0;
        for (Batiment batiment : batiments) {
            if (batiment instanceof Armée) {
                nbGuerriers += ((Armée) batiment).getNbGuerrier();
            } else if (batiment instanceof Camp) {
                nbGuerriers += ((Camp) batiment).getNbGuerrier();
            }
        }
        return nbGuerriers;
    }

    /**
     * cette methode retourne l'objectifs du joueur
     * 
     * @return objectif l'objectif du joueur
     */
    public Objectif getObjectif() {
        return this.objectif;
    }

    /**
     * cette methode affiche ce qui reste au joueur pour qu'il atteint son objectifs
     */
    public void setObjectif(Objectif newObjectif) {
        this.objectif = newObjectif;
    }
}
